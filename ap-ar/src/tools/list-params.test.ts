import { describe, it, expect } from "vitest";
import {
  buildFilterString,
  buildListParams,
  type FilterClause,
} from "./list-params.js";

describe("buildFilterString", () => {
  it("should return empty string for no clauses", () => {
    expect(buildFilterString([])).toBe("");
  });

  it("should quote string values", () => {
    const clauses: FilterClause[] = [
      { field: "vendorId", op: "eq", value: "v123" },
    ];
    expect(buildFilterString(clauses)).toBe('vendorId:eq:"v123"');
  });

  it("should not quote numeric values", () => {
    const clauses: FilterClause[] = [
      { field: "amount", op: "gte", value: 100 },
    ];
    expect(buildFilterString(clauses)).toBe("amount:gte:100");
  });

  it("should not quote boolean values", () => {
    const clauses: FilterClause[] = [
      { field: "archived", op: "eq", value: false },
    ];
    expect(buildFilterString(clauses)).toBe("archived:eq:false");
  });

  it("should join multiple clauses with commas", () => {
    const clauses: FilterClause[] = [
      { field: "vendorId", op: "eq", value: "v123" },
      { field: "paymentStatus", op: "eq", value: "open" },
      { field: "createdTime", op: "gte", value: "2025-01-01" },
    ];
    expect(buildFilterString(clauses)).toBe(
      'vendorId:eq:"v123",paymentStatus:eq:"open",createdTime:gte:"2025-01-01"'
    );
  });

  it("should handle date-time values with quotes", () => {
    const clauses: FilterClause[] = [
      {
        field: "createdTime",
        op: "gte",
        value: "2025-01-01T00:00:00.000Z",
      },
    ];
    expect(buildFilterString(clauses)).toBe(
      'createdTime:gte:"2025-01-01T00:00:00.000Z"'
    );
  });
});

describe("buildListParams", () => {
  it("should return defaults when no options provided", () => {
    const params = buildListParams({});
    expect(params).toEqual({
      max: 50,
    });
  });

  it("should use custom max and sort", () => {
    const params = buildListParams({ max: 25, sort: "dueDate:asc" });
    expect(params).toEqual({
      max: 25,
      sort: "dueDate:asc",
    });
  });

  it("should include page cursor when provided", () => {
    const params = buildListParams({ page: "cursor-token-123" });
    expect(params).toEqual({
      max: 50,
      page: "cursor-token-123",
    });
  });

  it("should include filters string when clauses provided", () => {
    const filters: FilterClause[] = [
      { field: "vendorId", op: "eq", value: "v123" },
    ];
    const params = buildListParams({ filters });
    expect(params).toEqual({
      max: 50,
      filters: 'vendorId:eq:"v123"',
    });
  });

  it("should omit filters key when clauses array is empty", () => {
    const params = buildListParams({ filters: [] });
    expect(params).not.toHaveProperty("filters");
  });

  it("should omit page when not provided", () => {
    const params = buildListParams({});
    expect(params).not.toHaveProperty("page");
  });

  it("should combine all options", () => {
    const filters: FilterClause[] = [
      { field: "status", op: "eq", value: "completed" },
      { field: "amount", op: "gte", value: 500 },
    ];
    const params = buildListParams({
      max: 10,
      page: "next-page",
      sort: "amount:desc",
      filters,
    });
    expect(params).toEqual({
      max: 10,
      sort: "amount:desc",
      page: "next-page",
      filters: 'status:eq:"completed",amount:gte:500',
    });
  });
});
