/**
 * Recurring Invoice management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List recurring invoices
 */
export const listRecurringInvoices: Tool = {
  name: "list_recurring_invoices",
  description:
    "List recurring invoices with filtering, sorting, and pagination. Recurring invoices are templates for automatically generating invoices on a schedule.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of recurring invoices to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Default: 'createdTime:desc'.",
      },
      customerId: {
        type: "string",
        description: "Filter by customer ID",
      },
      isActive: {
        type: "boolean",
        description: "Filter by active status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, customerId, isActive } = args;

    try {
      const filters: FilterClause[] = [];
      if (customerId)
        filters.push({ field: "customerId", op: "eq", value: customerId });
      if (isActive !== undefined)
        filters.push({ field: "isActive", op: "eq", value: isActive });

      // Don't apply default sort - createdTime not supported for this endpoint
      const params: Record<string, string | number> = { max: limit ?? 50 };
      if (page) params.page = page;
      if (sort) params.sort = sort;
      if (filters.length > 0) {
        params.filters = filters
          .map((c) => {
            const v = typeof c.value === "string" ? `"${c.value}"` : String(c.value);
            return `${c.field}:${c.op}:${v}`;
          })
          .join(",");
      }
      const recurringInvoices = await client.get("/recurring-invoices", params);

      return {
        success: true,
        data: recurringInvoices,
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
 * Get recurring invoice details
 */
export const getRecurringInvoice: Tool = {
  name: "get_recurring_invoice",
  description: "Get detailed information about a specific recurring invoice by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring invoice ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const recurringInvoice = await client.get(`/recurring-invoices/${args.id}`);
      return {
        success: true,
        data: recurringInvoice,
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
 * Create recurring invoice
 */
export const createRecurringInvoice: Tool = {
  name: "create_recurring_invoice",
  description: "Create a new recurring invoice template",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID for the recurring invoice (starts with '0cu')",
      },
      timePeriod: {
        type: "string",
        description: "Frequency of recurrence (e.g., 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')",
      },
      frequencyPerTimePeriod: {
        type: "number",
        description: "How often within the time period (e.g., 1 for once per month)",
      },
      nextDueDate: {
        type: "string",
        description: "Next due date for invoice generation (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Days before due date to create the invoice",
      },
      invoiceLineItems: {
        type: "array",
        description: "Line items for the recurring invoice",
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
          },
          required: ["description", "quantity", "price"],
        },
      },
      description: {
        type: "string",
        description: "Description or memo",
      },
    },
    required: ["customerId", "timePeriod", "nextDueDate", "invoiceLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, invoiceLineItems, ...rest } = args;

      const parsedLineItems =
        typeof invoiceLineItems === "string"
          ? JSON.parse(invoiceLineItems)
          : invoiceLineItems;

      const body: Record<string, unknown> = {
        ...rest,
        invoiceLineItems: parsedLineItems,
        customer: { id: customerId },
      };

      const recurringInvoice = await client.post("/recurring-invoices", body);
      return {
        success: true,
        data: recurringInvoice,
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
 * Update recurring invoice
 */
export const updateRecurringInvoice: Tool = {
  name: "update_recurring_invoice",
  description: "Update an existing recurring invoice template",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring invoice ID to update",
      },
      timePeriod: {
        type: "string",
        description: "Frequency of recurrence",
      },
      frequencyPerTimePeriod: {
        type: "number",
        description: "How often within the time period",
      },
      nextDueDate: {
        type: "string",
        description: "Next due date for invoice generation (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Days before due date to create the invoice",
      },
      isActive: {
        type: "boolean",
        description: "Whether the recurring invoice is active",
      },
      description: {
        type: "string",
        description: "Description or memo",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const recurringInvoice = await client.patch(`/recurring-invoices/${id}`, updateData);
      return {
        success: true,
        data: recurringInvoice,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
