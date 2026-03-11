/**
 * Bill management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List bills
 */
export const listBills: Tool = {
  name: "list_bills",
  description:
    "List bills (accounts payable) with filtering, sorting, and pagination. Returns newest first by default. Results contain vendor IDs — use get_vendor to resolve vendor names.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of bills to return per page (default: 50, max: 100)",
        default: 50,
      },
      page: {
        type: "string",
        description:
          "Cursor token for the next page of results (from the nextPage field in a previous response). Omit for the first page.",
      },
      sort: {
        type: "string",
        description:
          "Sort order in 'field:direction' format. Sortable fields: dueDate, createdTime, updatedTime, fundingAmount, description, archived. Default: 'createdTime:desc'. Example: 'dueDate:asc'",
      },
      paymentStatus: {
        type: "string",
        description: "Filter by bill payment status",
      },
      vendorId: {
        type: "string",
        description: "Filter bills by vendor ID",
      },
      archived: {
        type: "boolean",
        description: "Filter by archived status",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter bills created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter bills created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
      },
      dueDateAfter: {
        type: "string",
        description:
          "Filter bills with due date on or after this date (ISO 8601 format)",
      },
      dueDateBefore: {
        type: "string",
        description:
          "Filter bills with due date on or before this date (ISO 8601 format)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const {
      limit,
      page,
      sort,
      paymentStatus,
      vendorId,
      archived,
      createdAfter,
      createdBefore,
      dueDateAfter,
      dueDateBefore,
    } = args;

    try {
      const filters: FilterClause[] = [];
      if (paymentStatus)
        filters.push({ field: "paymentStatus", op: "eq", value: paymentStatus });
      if (vendorId)
        filters.push({ field: "vendorId", op: "eq", value: vendorId });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });
      if (dueDateAfter)
        filters.push({ field: "dueDate", op: "gte", value: dueDateAfter });
      if (dueDateBefore)
        filters.push({ field: "dueDate", op: "lte", value: dueDateBefore });

      const params = buildListParams({ max: limit, page, sort: sort ?? "createdTime:desc", filters });
      const bills = await client.get("/bills", params);

      return {
        success: true,
        data: bills,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Get bill details
 */
export const getBill: Tool = {
  name: "get_bill",
  description: "Get detailed information about a specific bill by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const bill = await client.get(`/bills/${args.id}`);
      return {
        success: true,
        data: bill,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Create bill
 */
export const createBill: Tool = {
  name: "create_bill",
  description: "Create a new bill for a vendor",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID (starts with '009')",
      },
      invoiceNumber: {
        type: "string",
        description: "Vendor's invoice number",
      },
      invoiceDate: {
        type: "string",
        description: "Invoice date (YYYY-MM-DD format)",
      },
      dueDate: {
        type: "string",
        description: "Payment due date (YYYY-MM-DD format)",
      },
      chartOfAccountId: {
        type: "string",
        description:
          "Chart of account ID for expense categorization (starts with '0ca'). Applied at the bill level via the classifications object.",
      },
      billLineItems: {
        type: "array",
        description: "Bill line items",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            quantity: {
              type: "number",
              description: "Quantity",
            },
            price: {
              type: "number",
              description: "Unit price",
            },
            amount: {
              type: "number",
              description:
                "Line total amount. Can be set directly or calculated from quantity * price.",
            },
            chartOfAccountId: {
              type: "string",
              description:
                "Chart of account ID for this line item (starts with '0ca'). Overrides the bill-level chart of account for this line item.",
            },
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Bill description or memo",
      },
    },
    required: ["vendorId", "dueDate", "billLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { invoiceNumber, invoiceDate, chartOfAccountId, billLineItems, ...rest } = args;

      // Parse billLineItems if it arrives as a JSON string (MCP transport serialization)
      const parsedLineItems: any[] =
        typeof billLineItems === "string" ? JSON.parse(billLineItems) : billLineItems;

      // Wrap line-item chartOfAccountId into classifications object
      const transformedLineItems = parsedLineItems.map(({ chartOfAccountId: lineCoaId, ...lineRest }: any) => {
        if (lineCoaId) {
          return { ...lineRest, classifications: { chartOfAccountId: lineCoaId } };
        }
        return lineRest;
      });

      // Nest invoice fields and classifications for the API
      const body: Record<string, unknown> = {
        ...rest,
        billLineItems: transformedLineItems,
      };
      if (invoiceNumber || invoiceDate) {
        body.invoice = {
          ...(invoiceNumber && { invoiceNumber }),
          ...(invoiceDate && { invoiceDate }),
        };
      }
      // Wrap bill-level chartOfAccountId into classifications object
      if (chartOfAccountId) {
        body.classifications = { chartOfAccountId };
      }

      const bill = await client.post("/bills", body);
      return {
        success: true,
        data: bill,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Update bill
 */
export const updateBill: Tool = {
  name: "update_bill",
  description: "Update an existing bill",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID to update",
      },
      invoiceNumber: {
        type: "string",
        description: "Vendor's invoice number",
      },
      invoiceDate: {
        type: "string",
        description: "Invoice date (YYYY-MM-DD format)",
      },
      dueDate: {
        type: "string",
        description: "Payment due date (YYYY-MM-DD format)",
      },
      chartOfAccountId: {
        type: "string",
        description:
          "Chart of account ID for expense categorization (starts with '0ca'). Applied at the bill level via the classifications object.",
      },
      billLineItems: {
        type: "array",
        description: "Bill line items",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            quantity: {
              type: "number",
              description: "Quantity",
            },
            price: {
              type: "number",
              description: "Unit price",
            },
            amount: {
              type: "number",
              description:
                "Line total amount. Can be set directly or calculated from quantity * price.",
            },
            chartOfAccountId: {
              type: "string",
              description:
                "Chart of account ID for this line item (starts with '0ca'). Overrides the bill-level chart of account for this line item.",
            },
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Bill description or memo",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, invoiceNumber, invoiceDate, chartOfAccountId, billLineItems, ...rest } = args;

      const body: Record<string, unknown> = { ...rest };
      if (billLineItems) {
        const parsedLineItems: any[] =
          typeof billLineItems === "string" ? JSON.parse(billLineItems) : billLineItems;
        body.billLineItems = parsedLineItems.map(({ chartOfAccountId: lineCoaId, ...lineRest }: any) => {
          if (lineCoaId) {
            return { ...lineRest, classifications: { chartOfAccountId: lineCoaId } };
          }
          return lineRest;
        });
      }
      if (invoiceNumber || invoiceDate) {
        body.invoice = {
          ...(invoiceNumber && { invoiceNumber }),
          ...(invoiceDate && { invoiceDate }),
        };
      }
      if (chartOfAccountId) {
        body.classifications = { chartOfAccountId };
      }

      const bill = await client.patch(`/bills/${id}`, body);
      return {
        success: true,
        data: bill,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Archive bill
 */
export const archiveBill: Tool = {
  name: "archive_bill",
  description: "Archive a bill (soft delete). Archived bills can be restored.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID to archive (starts with '00n')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/bills/${args.id}/archive`);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};

/**
 * Restore bill
 */
export const restoreBill: Tool = {
  name: "restore_bill",
  description: "Restore an archived bill",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID to restore (starts with '00n')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/bills/${args.id}/restore`);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
