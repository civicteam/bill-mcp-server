import { describe, it, expect, vi, beforeEach } from "vitest";
import { listVendors } from "./vendors.js";
import type { BillClient } from "../bill-client.js";

describe("listVendors tool", () => {
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
    expect(listVendors.name).toBe("list_vendors");
    expect(listVendors.description).toContain("List all vendors");
    expect(listVendors.inputSchema.type).toBe("object");
  });

  it("should call API with default parameters", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listVendors.handler({}, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", undefined);
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should call API with custom parameters", async () => {
    const mockData = { vendors: [{ id: "1", name: "Test Vendor" }] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const args = {
      limit: 10,
      offset: 20,
      name: "Test",
      isActive: true,
    };

    const result = await listVendors.handler(args, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 10,
      offset: 20,
      name: "Test",
      isActive: true,
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    vi.mocked(mockClient.get).mockRejectedValue(error);

    const result = await listVendors.handler({}, mockClient);

    expect(result).toEqual({
      success: false,
      error: "API Error",
    });
  });

  it("should filter by name only", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listVendors.handler({ name: "Acme" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      name: "Acme",
    });
  });

  it("should filter by active status only", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listVendors.handler({ isActive: false }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      isActive: false,
    });
  });
});
