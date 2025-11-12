import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAccountInfo } from "./account.js";
import type { BillClient } from "../bill-client.js";

describe("getAccountInfo tool", () => {
  let mockClient: BillClient;

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as any;
  });

  it("should have correct metadata", () => {
    expect(getAccountInfo.name).toBe("get_account_info");
    expect(getAccountInfo.description).toContain("Get information");
    expect(getAccountInfo.inputSchema.type).toBe("object");
    expect(getAccountInfo.inputSchema.required).toEqual([]);
  });

  it("should call API and return account info", async () => {
    const mockData = {
      id: "org-123",
      name: "Test Organization",
      type: "business",
    };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await getAccountInfo.handler({}, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/organization");
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should handle API errors", async () => {
    const error = new Error("Unauthorized");
    vi.mocked(mockClient.get).mockRejectedValue(error);

    const result = await getAccountInfo.handler({}, mockClient);

    expect(result).toEqual({
      success: false,
      error: "Unauthorized",
    });
  });

  it("should not require any arguments", async () => {
    const mockData = { id: "org-456" };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    // Should work with empty args
    const result = await getAccountInfo.handler({}, mockClient);

    expect(result.success).toBe(true);
  });
});
