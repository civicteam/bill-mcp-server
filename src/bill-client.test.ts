import { describe, it, expect, vi, beforeEach } from "vitest";
import { BillClient } from "./bill-client.js";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("BillClient", () => {
  const mockConfig = {
    devKey: "test-dev-key",
    username: "test-user",
    password: "test-password",
    organizationId: "008xxxxx",
    environment: "sandbox" as const,
  };

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
  });

  describe("constructor", () => {
    it("should initialize with sandbox URL for sandbox environment", () => {
      const sandboxClient = new BillClient({
        devKey: "test-dev-key",
        username: "test-user",
        password: "test-password",
        organizationId: "008xxxxx",
        environment: "sandbox",
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
      });

      expect(prodClient).toBeDefined();
    });
  });

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
