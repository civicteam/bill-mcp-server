/**
 * Bill.com API Client
 *
 * Provides a wrapper around the Bill.com AP/AR API with session-based authentication
 * and error handling.
 */

import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Authentication type for Bill.com API
 *
 * - sync_token: Uses AP/AR sync token (limited access, 48-hour session)
 *   Username = sync token name, Password = sync token value
 *   Cannot: pay bills, void payments, charge customers, manage users, send invoices
 *
 * - full_access: Uses real user credentials (full access, 35-minute session)
 *   Username = user email, Password = user password
 *   Can: all operations including payments, user management, and invoicing
 *
 * - session_token: Uses an externally-provided session token (no login required)
 *   Useful when auth is handled by an external system
 *   Session management is external - token is used as-is
 */
export type AuthType = "sync_token" | "full_access" | "session_token";

export interface BillConfig {
  devKey: string;
  environment: "sandbox" | "production";
  authType: AuthType;
  // Required for sync_token and full_access auth types
  username?: string;
  password?: string;
  organizationId?: string;
  // Required for session_token auth type
  sessionToken?: string;
}

export class BillApiError extends Error {
  public readonly errorType: string;
  public readonly status: number;

  constructor(message: string, status: number, errorType: string) {
    super(message);
    this.name = "BillApiError";
    this.errorType = errorType;
    this.status = status;
  }
}

/**
 * Bill.com API Client with session management
 */
export class BillClient {
  private client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly devKey: string;
  private readonly username: string | undefined;
  private readonly password: string | undefined;
  private readonly organizationId: string | undefined;
  private readonly authType: AuthType;
  private sessionId: string | null = null;
  private sessionExpiresAt: number = 0;

  constructor(config: BillConfig) {
    this.devKey = config.devKey;
    this.authType = config.authType;

    if (config.authType === "session_token") {
      // For session_token auth, use the provided token directly
      if (!config.sessionToken) {
        throw new Error("sessionToken is required for session_token auth type");
      }
      this.sessionId = config.sessionToken;
      // External session - no expiration tracking (managed externally)
      this.sessionExpiresAt = Number.MAX_SAFE_INTEGER;
    } else {
      // For sync_token and full_access, require login credentials
      if (!config.username || !config.password || !config.organizationId) {
        throw new Error(
          "username, password, and organizationId are required for sync_token and full_access auth types"
        );
      }
      this.username = config.username;
      this.password = config.password;
      this.organizationId = config.organizationId;
    }

    // Set base URL based on environment - AP/AR API uses /v3
    this.baseUrl =
      config.environment === "production"
        ? "https://gateway.prod.bill.com/connect/v3"
        : "https://gateway.stage.bill.com/connect/v3";

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000, // 30 second timeout
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Login and get session ID
   */
  private async login(): Promise<void> {
    // For session_token auth, we don't login - session is managed externally
    if (this.authType === "session_token") {
      if (!this.sessionId) {
        throw new Error("Session token was not provided or has been cleared");
      }
      return;
    }

    console.error(`[Bill.com API] Logging in (${this.authType})...`);
    try {
      const response = await this.client.post("/login", {
        username: this.username,
        password: this.password,
        organizationId: this.organizationId,
        devKey: this.devKey,
      });

      console.error("[Bill.com API] Login response:", JSON.stringify(response.data, null, 2));

      this.sessionId = response.data.sessionId;
      if (!this.sessionId) {
        throw new Error("No sessionId in login response");
      }

      // Session expiration depends on auth type:
      // - sync_token: 48 hours (when idle)
      // - full_access: 35 minutes (when idle)
      const sessionDurationMs =
        this.authType === "sync_token"
          ? 48 * 60 * 60 * 1000 // 48 hours
          : 35 * 60 * 1000; // 35 minutes

      this.sessionExpiresAt = Date.now() + sessionDurationMs;
      console.error(
        `[Bill.com API] Login successful (${this.authType}), session expires in ${
          this.authType === "sync_token" ? "48 hours" : "35 minutes"
        }`
      );
    } catch (error) {
      console.error("[Bill.com API] Login failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to login to Bill.com API: ${detail}`);
    }
  }

  /**
   * Ensure we have a valid session
   */
  private async ensureSession(): Promise<void> {
    // Check if session exists and is not expired (with 5 min buffer)
    const bufferMs = 5 * 60 * 1000;
    if (this.sessionId && Date.now() < this.sessionExpiresAt - bufferMs) {
      return;
    }

    // Login to get new session
    await this.login();
  }

  /**
   * Get headers including session ID
   */
  private async getHeaders(): Promise<Record<string, string>> {
    await this.ensureSession();
    return {
      sessionId: this.sessionId!,
      devKey: this.devKey,
    };
  }

  /**
   * Handle API errors and convert to a standard format
   */
  private handleError(error: AxiosError): BillApiError {
    console.error("[Bill.com API] Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      const errorData = error.response.data as any;
      const detail =
        errorData?.message ||
        errorData?.error ||
        JSON.stringify(errorData) ||
        error.message ||
        "Unknown API error";
      return new BillApiError(
        `Bill.com API error (${error.response.status}): ${detail}`,
        error.response.status,
        "api_error"
      );
    } else if (error.request) {
      return new BillApiError(
        "No response received from Bill.com API",
        0,
        "network_error"
      );
    } else {
      return new BillApiError(
        error.message || "Unknown client error",
        0,
        "client_error"
      );
    }
  }

  /**
   * Make a GET request to the Bill.com API
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const headers = await this.getHeaders();
    console.error(`[Bill.com API] GET ${endpoint}`, { headers, params });
    const response = await this.client.get<T>(endpoint, { params, headers });
    return response.data;
  }

  /**
   * Make a POST request to the Bill.com API
   */
  async post<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const headers = await this.getHeaders();
    const response = await this.client.post<T>(endpoint, data, { headers });
    return response.data;
  }

  /**
   * Make a PUT request to the Bill.com API
   */
  async put<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const headers = await this.getHeaders();
    const response = await this.client.put<T>(endpoint, data, { headers });
    return response.data;
  }

  /**
   * Make a PATCH request to the Bill.com API
   */
  async patch<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const headers = await this.getHeaders();
    const response = await this.client.patch<T>(endpoint, data, { headers });
    return response.data;
  }

  /**
   * Make a DELETE request to the Bill.com API
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await this.client.delete<T>(endpoint, { headers });
    return response.data;
  }
}
