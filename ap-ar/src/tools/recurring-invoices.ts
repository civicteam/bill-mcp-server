/**
 * Recurring Invoice management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List recurring invoices
 */
export const listRecurringInvoices: Tool = {
  name: "list_recurring_invoices",
  description:
    "List recurring invoices with pagination. Recurring invoices are templates for automatically generating invoices on a schedule.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of recurring invoices to return per page (default: 50, max: 100)",
        default: 50,
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit } = args;

    try {
      // Note: This endpoint doesn't support filters (customerId, isActive) or sort
      // Pagination uses nextPage from response, not a page parameter
      const params: Record<string, string | number> = { max: limit ?? 50 };
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
        description:
          "Frequency of recurrence (e.g., 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')",
      },
      frequencyPerTimePeriod: {
        type: "number",
        description: "How often within the time period (e.g., 1 for once per month)",
        default: 1,
      },
      nextDueDate: {
        type: "string",
        description: "Next due date for invoice generation (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Days before due date to create the invoice",
      },
      recurringInvoiceLineItems: {
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
    required: ["customerId", "timePeriod", "nextDueDate", "recurringInvoiceLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const {
        customerId,
        timePeriod,
        frequencyPerTimePeriod,
        nextDueDate,
        daysInAdvance,
        recurringInvoiceLineItems,
        description,
      } = args;

      const parsedLineItems =
        typeof recurringInvoiceLineItems === "string"
          ? JSON.parse(recurringInvoiceLineItems)
          : recurringInvoiceLineItems;

      // API expects customerId as top-level and schedule fields nested
      const body: Record<string, unknown> = {
        customerId,
        recurringInvoiceLineItems: parsedLineItems,
        schedule: {
          timePeriod,
          nextDueDate,
          frequencyPerTimePeriod: frequencyPerTimePeriod ?? 1,
        },
      };

      if (daysInAdvance !== undefined) {
        (body.schedule as Record<string, unknown>).daysInAdvance = daysInAdvance;
      }
      if (description) {
        body.description = description;
      }

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
