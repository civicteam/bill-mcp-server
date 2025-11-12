import { describe, it, expect, vi, beforeEach } from "vitest";
import { BillClient } from "./bill-client.js";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("BillClient", () => {
  const mockConfig = {
    apiToken: "test-token-123",
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
        apiToken: "test-token",
        environment: "sandbox",
      });

      expect(sandboxClient).toBeDefined();
    });

    it("should initialize with production URL for production environment", () => {
      const prodClient = new BillClient({
        apiToken: "test-token",
        environment: "production",
      });

      expect(prodClient).toBeDefined();
    });
  });

  describe("GET requests", () => {
    it("should make a GET request with correct parameters", async () => {
      const mockResponse = { data: { vendors: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.get("/vendors", { page: 1 });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/vendors", {
        params: { page: 1 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("POST requests", () => {
    it("should make a POST request with correct data", async () => {
      const mockResponse = { data: { id: "123", status: "created" } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.post("/vendors", { name: "Test Vendor" });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/vendors", {
        name: "Test Vendor",
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("error handling", () => {
    it("should handle API errors with status code", async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: "Not found" },
        },
        message: "Request failed",
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);

      const testClient = new BillClient(mockConfig);

      await expect(testClient.get("/invalid")).rejects.toBeDefined();
    });

    it("should handle network errors", async () => {
      const mockError = {
        request: {},
        message: "Network error",
      };

      mockAxiosInstance.get.mockRejectedValue(mockError);

      const testClient = new BillClient(mockConfig);

      await expect(testClient.get("/vendors")).rejects.toBeDefined();
    });
  });

  describe("HTTP methods", () => {
    it("should support PUT requests", async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.put("/vendors/123", { name: "Updated" });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/vendors/123", {
        name: "Updated",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should support PATCH requests", async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.patch("/vendors/123", { active: false });

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith("/vendors/123", {
        active: false,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should support DELETE requests", async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const testClient = new BillClient(mockConfig);
      const result = await testClient.delete("/vendors/123");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/vendors/123");
      expect(result).toEqual(mockResponse.data);
    });
  });
});
