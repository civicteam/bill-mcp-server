/**
 * Bill.com API Client
 *
 * Provides a wrapper around the Bill.com REST API with authentication
 * and error handling.
 */

import axios, { AxiosInstance, AxiosError } from "axios";

export interface BillConfig {
  apiToken: string;
  environment: "sandbox" | "production";
}

export interface BillApiError {
  error: string;
  message: string;
  status: number;
}

/**
 * Bill.com API Client
 */
export class BillClient {
  private client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(config: BillConfig) {
    this.apiToken = config.apiToken;

    // Set base URL based on environment
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
        apiToken: this.apiToken,
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
   * Handle API errors and convert to a standard format
   */
  private handleError(error: AxiosError): BillApiError {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        error: "api_error",
        message:
          (error.response.data as any)?.message ||
          error.message ||
          "Unknown API error",
        status: error.response.status,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        error: "network_error",
        message: "No response received from Bill.com API",
        status: 0,
      };
    } else {
      // Something happened in setting up the request
      return {
        error: "client_error",
        message: error.message || "Unknown client error",
        status: 0,
      };
    }
  }

  /**
   * Make a GET request to the Bill.com API
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response = await this.client.get<T>(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request to the Bill.com API
   */
  async post<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a PUT request to the Bill.com API
   */
  async put<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const response = await this.client.put<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a PATCH request to the Bill.com API
   */
  async patch<T = any>(endpoint: string, data?: Record<string, any>): Promise<T> {
    const response = await this.client.patch<T>(endpoint, data);
    return response.data;
  }

  /**
   * Make a DELETE request to the Bill.com API
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await this.client.delete<T>(endpoint);
    return response.data;
  }
}
