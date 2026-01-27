/**
 * Shared utilities for building Bill.com v3 API list query parameters.
 *
 * The v3 API uses:
 *   - `filters=field:op:value,field2:op:value2` for filtering
 *   - `sort=field:direction` for sorting
 *   - `max` for page size and `page` for cursor-based pagination
 */

export type FilterOp =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "sw";

export interface FilterClause {
  field: string;
  op: FilterOp;
  value: string | number | boolean;
}

/**
 * Build the `filters` query string from an array of filter clauses.
 *
 * String/date values are wrapped in double quotes per the API spec.
 * Numbers and booleans are left unquoted.
 *
 * Example output: `vendorId:eq:"v123",createdTime:gte:"2025-01-01"`
 */
export function buildFilterString(clauses: FilterClause[]): string {
  return clauses
    .map((c) => {
      const formattedValue =
        typeof c.value === "string" ? `"${c.value}"` : String(c.value);
      return `${c.field}:${c.op}:${formattedValue}`;
    })
    .join(",");
}

/**
 * Build the complete query params object for a Bill.com v3 list endpoint.
 *
 * Always includes `max` (default 50) and `sort` (default `createdTime:desc`).
 * Only includes `filters` and `page` when they have values.
 */
export function buildListParams(options: {
  max?: number;
  page?: string;
  sort?: string;
  filters?: FilterClause[];
}): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  params.max = options.max ?? 50;
  params.sort = options.sort ?? "createdTime:desc";

  if (options.page) {
    params.page = options.page;
  }

  if (options.filters && options.filters.length > 0) {
    params.filters = buildFilterString(options.filters);
  }

  return params;
}
