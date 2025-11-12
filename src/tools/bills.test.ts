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

  it("should call API with default parameters", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listBills.handler({}, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      page: 1,
      pageSize: 50,
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should call API with all filter parameters", async () => {
    const mockData = { bills: [{ id: "bill-1" }] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const args = {
      page: 3,
      page_size: 25,
      status: "open",
      vendor_id: "vendor-123",
      start_date: "2025-01-01",
      end_date: "2025-01-31",
    };

    const result = await listBills.handler(args, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      page: 3,
      pageSize: 25,
      status: "open",
      vendorId: "vendor-123",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });
    expect(result).toEqual({
      success: true,
      data: mockData,
    });
  });

  it("should handle API errors", async () => {
    const error = new Error("Network Error");
    vi.mocked(mockClient.get).mockRejectedValue(error);

    const result = await listBills.handler({}, mockClient);

    expect(result).toEqual({
      success: false,
      error: "Network Error",
    });
  });

  it("should filter by status only", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listBills.handler({ status: "paid" }, mockClient);

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      page: 1,
      pageSize: 50,
      status: "paid",
    });
  });

  it("should filter by date range", async () => {
    const mockData = { bills: [] };
    vi.mocked(mockClient.get).mockResolvedValue(mockData);

    const result = await listBills.handler(
      {
        start_date: "2025-01-01",
        end_date: "2025-12-31",
      },
      mockClient
    );

    expect(mockClient.get).toHaveBeenCalledWith("/bills", {
      page: 1,
      pageSize: 50,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });
  });
});
