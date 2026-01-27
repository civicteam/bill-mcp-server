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
    expect(listVendors.description).toContain("List vendors");
    expect(listVendors.inputSchema.type).toBe("object");
  });

  it("should call API with default sort and max", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listVendors.handler({}, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 50,
      sort: "createdTime:desc",
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should build filters for name, archived, and date range", async () => {
    const mockData = { vendors: [{ id: "1", name: "Test Vendor" }] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const args = {
      limit: 10,
      name: "Test",
      archived: false,
      createdAfter: "2025-01-01",
    };

    const result = await listVendors.handler(args, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 10,
      sort: "createdTime:desc",
      filters:
        'name:sw:"Test",archived:eq:false,createdTime:gte:"2025-01-01"',
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

  it("should filter by name using starts-with operator", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listVendors.handler({ name: "Acme" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 50,
      sort: "createdTime:desc",
      filters: 'name:sw:"Acme"',
    });
  });

  it("should filter by archived status", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listVendors.handler({ archived: true }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 50,
      sort: "createdTime:desc",
      filters: "archived:eq:true",
    });
  });

  it("should pass page cursor and custom sort", async () => {
    const mockData = { vendors: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listVendors.handler(
      { page: "next-cursor", sort: "name:asc" },
      mockClient
    );

    expect(mockClient.get).toHaveBeenCalledWith("/vendors", {
      max: 50,
      sort: "name:asc",
      page: "next-cursor",
    });
  });
});
