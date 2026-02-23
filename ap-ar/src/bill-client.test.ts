import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BillClient, BillConfig } from "./bill-client.js";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("BillClient", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: { use: vi.fn() },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should initialize with sandbox URL for sandbox environment", () => {
      const sandboxClient = new BillClient({
        devKey: "test-dev-key",
        username: "test-user",
        password: "test-password",
        organizationId: "008xxxxx",
        environment: "sandbox",
        authType: "sync_token",
      });

      expect(sandboxClient).toBeDefined();
    });

    it("should initialize with production URL for production environment", () => {
      const prodClient = new BillClient({
        devKey: "test-dev-key",
        username: "test-user",
        password: "test-password",
        organizationId: "008xxxxx",
        environment: "production",
        authType: "full_access",
      });

      expect(prodClient).toBeDefined();
    });
  });

  describe("authentication types", () => {
    describe("sync_token auth", () => {
      const syncTokenConfig: BillConfig = {
        devKey: "test-dev-key",
        username: "sync-token-name",
        password: "sync-token-value",
        organizationId: "008xxxxx",
        environment: "sandbox",
        authType: "sync_token",
      };

      it("should login with sync token credentials", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-123", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(syncTokenConfig);
        await client.get("/vendors");

        expect(mockAxiosInstance.post).toHaveBeenCalledWith("/login", {
          username: "sync-token-name",
          password: "sync-token-value",
          organizationId: "008xxxxx",
          devKey: "test-dev-key",
        });
      });

      it("should reuse session within 48 hours", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-123", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValue(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(syncTokenConfig);

        // First request - should login
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);

        // Second request within 48h - should reuse session
        vi.advanceTimersByTime(47 * 60 * 60 * 1000); // 47 hours
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1); // Still 1, no new login
      });

      it("should refresh session after 48 hours", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-123", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValue(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(syncTokenConfig);

        // First request - should login
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);

        // Advance past 48h (with 5min buffer = 47h 55min)
        vi.advanceTimersByTime(48 * 60 * 60 * 1000); // 48 hours
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2); // New login
      });
    });

    describe("full_access auth", () => {
      const fullAccessConfig: BillConfig = {
        devKey: "test-dev-key",
        username: "user@company.com",
        password: "user-password",
        organizationId: "008xxxxx",
        environment: "sandbox",
        authType: "full_access",
      };

      it("should login with user credentials", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-456", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(fullAccessConfig);
        await client.get("/vendors");

        expect(mockAxiosInstance.post).toHaveBeenCalledWith("/login", {
          username: "user@company.com",
          password: "user-password",
          organizationId: "008xxxxx",
          devKey: "test-dev-key",
        });
      });

      it("should reuse session within 35 minutes", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-456", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValue(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(fullAccessConfig);

        // First request - should login
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);

        // Second request within 35min (with 5min buffer = 30min is safe)
        vi.advanceTimersByTime(25 * 60 * 1000); // 25 minutes
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1); // Still 1, no new login
      });

      it("should refresh session after 35 minutes", async () => {
        const mockLoginResponse = {
          data: { sessionId: "session-456", organizationId: "008xxx", userId: "user123" },
        };
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.post.mockResolvedValue(mockLoginResponse);
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(fullAccessConfig);

        // First request - should login
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);

        // Advance past 35min (with 5min buffer = 30min triggers refresh)
        vi.advanceTimersByTime(35 * 60 * 1000); // 35 minutes
        await client.get("/vendors");
        expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2); // New login
      });
    });

    describe("session_token auth", () => {
      const sessionTokenConfig: BillConfig = {
        devKey: "test-dev-key",
        environment: "sandbox",
        authType: "session_token",
        sessionToken: "pre-authenticated-session-token",
      };

      it("should use provided session token without login", async () => {
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(sessionTokenConfig);
        await client.get("/vendors");

        // Should NOT call login endpoint
        expect(mockAxiosInstance.post).not.toHaveBeenCalled();

        // Should use the provided session token in headers
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("/vendors", {
          params: undefined,
          headers: {
            sessionId: "pre-authenticated-session-token",
            devKey: "test-dev-key",
          },
        });
      });

      it("should never refresh session (external management)", async () => {
        const mockGetResponse = { data: { vendors: [] } };
        mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

        const client = new BillClient(sessionTokenConfig);

        // First request
        await client.get("/vendors");
        expect(mockAxiosInstance.post).not.toHaveBeenCalled();

        // Advance time significantly (e.g., 100 hours)
        vi.advanceTimersByTime(100 * 60 * 60 * 1000);
        await client.get("/vendors");

        // Still should not login
        expect(mockAxiosInstance.post).not.toHaveBeenCalled();
      });

      it("should throw error if session token is not provided", () => {
        expect(() => {
          new BillClient({
            devKey: "test-dev-key",
            environment: "sandbox",
            authType: "session_token",
            // sessionToken is missing
          });
        }).toThrow("sessionToken is required for session_token auth type");
      });
    });

    describe("validation", () => {
      it("should throw error if username is missing for sync_token auth", () => {
        expect(() => {
          new BillClient({
            devKey: "test-dev-key",
            password: "test-password",
            organizationId: "008xxxxx",
            environment: "sandbox",
            authType: "sync_token",
          });
        }).toThrow("username, password, and organizationId are required");
      });

      it("should throw error if password is missing for full_access auth", () => {
        expect(() => {
          new BillClient({
            devKey: "test-dev-key",
            username: "test-user",
            organizationId: "008xxxxx",
            environment: "sandbox",
            authType: "full_access",
          });
        }).toThrow("username, password, and organizationId are required");
      });

      it("should throw error if organizationId is missing for sync_token auth", () => {
        expect(() => {
          new BillClient({
            devKey: "test-dev-key",
            username: "test-user",
            password: "test-password",
            environment: "sandbox",
            authType: "sync_token",
          });
        }).toThrow("username, password, and organizationId are required");
      });
    });
  });

  const mockConfig: BillConfig = {
    devKey: "test-dev-key",
    username: "test-user",
    password: "test-password",
    organizationId: "008xxxxx",
    environment: "sandbox",
    authType: "sync_token",
  };

  describe("GET requests", () => {
    it("should make a GET request with correct parameters", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockGetResponse = { data: { vendors: [] } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.get.mockResolvedValue(mockGetResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.get("/vendors", { max: 10 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/vendors", expect.objectContaining({
        params: { max: 10 },
      }));
      expect(result).toEqual(mockGetResponse.data);
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with correct data", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockPostResponse = { data: { id: "123", status: "created" } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.post.mockResolvedValueOnce(mockPostResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.post("/vendors", { name: "Test Vendor" });

      expect(result).toEqual(mockPostResponse.data);
    });
  });

  describe("error handling", () => {
    it("should handle API errors with status code", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockError = {
        response: {
          status: 404,
          data: { message: "Not found" },
        },
        message: "Request failed",
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const testClient = new BillClient(mockConfig);

      await expect(testClient.get("/invalid")).rejects.toBeDefined();
    });

    it("should handle network errors", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockError = {
        request: {},
        message: "Network error",
      };

      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.get.mockRejectedValue(mockError);

      const testClient = new BillClient(mockConfig);

      await expect(testClient.get("/vendors")).rejects.toBeDefined();
    });
  });

  describe("HTTP methods", () => {
    it("should support PUT requests", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockPutResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.put.mockResolvedValue(mockPutResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.put("/vendors/123", { name: "Updated" });

      expect(result).toEqual(mockPutResponse.data);
    });

    it("should support PATCH requests", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockPatchResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.patch.mockResolvedValue(mockPatchResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.patch("/vendors/123", { active: false });

      expect(result).toEqual(mockPatchResponse.data);
    });

    it("should support DELETE requests", async () => {
      const mockLoginResponse = { data: { sessionId: "test-session", organizationId: "008xxx", userId: "user123", trusted: false } };
      const mockDeleteResponse = { data: { success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);
      mockAxiosInstance.delete.mockResolvedValue(mockDeleteResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.delete("/vendors/123");

      expect(result).toEqual(mockDeleteResponse.data);
    });
  });
});
