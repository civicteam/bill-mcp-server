import { describe, it, expect, vi, beforeEach } from "vitest";
import { listBills } from "./bills.js";
import type { BillClient } from "../bill-client.js";

describe("listBills tool", () => {
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
    expect(listBills.name).toBe("list_bills");
    expect(listBills.description).toContain("List bills");
    expect(listBills.inputSchema.type).toBe("object");
  });

  it("should call API with default sort and max", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listBills.handler({}, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should build filters string for all filter parameters", async () => {
    const mockData = { bills: [{ id: "bill-1" }] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const args = {
      limit: 25,
      paymentStatus: "open",
      vendorId: "vendor-123",
      createdAfter: "2025-01-01",
      createdBefore: "2025-01-31",
    };

    const result = await listBills.handler(args, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 25,
      sort: "createdTime:desc",
      filters:
        'paymentStatus:eq:"open",vendorId:eq:"vendor-123",createdTime:gte:"2025-01-01",createdTime:lte:"2025-01-31"',
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should handle API errors", async () => {
    const error = new Error("API Error");
    vi.mocked(mockClient.get).mockRejectedValue(error);

    const result = await listBills.handler({}, mockClient);

    expect(result).toEqual({
      success: false,
      error: "API Error",
    });
  });

  it("should filter by paymentStatus only", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler({ paymentStatus: "paid" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
      filters: 'paymentStatus:eq:"paid"',
    });
  });

  it("should filter by date range using createdAfter/createdBefore", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler(
      {
        createdAfter: "2025-01-01",
        createdBefore: "2025-12-31",
      },
      mockClient
    );

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
      filters: 'createdTime:gte:"2025-01-01",createdTime:lte:"2025-12-31"',
    });
  });

  it("should pass page cursor token", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler({ page: "cursor-abc" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
      page: "cursor-abc",
    });
  });

  it("should pass custom sort order", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler({ sort: "dueDate:asc" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "dueDate:asc",
    });
  });

  it("should filter by dueDate range", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler(
      {
        dueDateAfter: "2025-06-01",
        dueDateBefore: "2025-06-30",
      },
      mockClient
    );

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
      filters: 'dueDate:gte:"2025-06-01",dueDate:lte:"2025-06-30"',
    });
  });

  it("should filter by archived status", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    await listBills.handler({ archived: false }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      max: 50,
      sort: "createdTime:desc",
      filters: "archived:eq:false",
    });
  });
});
