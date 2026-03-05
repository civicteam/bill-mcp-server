/**
 * Recurring Bill management tools (Accounts Payable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List recurring bills
 */
export const listRecurringBills: Tool = {
  name: "list_recurring_bills",
  description:
    "List recurring bill templates with filtering, sorting, and pagination.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of recurring bills to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Only 'archived' is supported (e.g., 'archived:asc' or 'archived:desc'). Omit for default API ordering.",
      },
      vendorId: {
        type: "string",
        description: "Filter by vendor ID",
      },
      archived: {
        type: "boolean",
        description: "Filter by archived status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, vendorId, archived } = args;

    try {
      const filters: FilterClause[] = [];
      if (vendorId)
        filters.push({ field: "vendorId", op: "eq", value: vendorId });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });

      const params = buildListParams({ max: limit, page, sort, filters });
      const recurringBills = await client.get("/recurringbills", params);

      return {
        success: true,
        data: recurringBills,
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
 * Get recurring bill details
 */
export const getRecurringBill: Tool = {
  name: "get_recurring_bill",
  description: "Get detailed information about a specific recurring bill by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring bill ID (starts with 'btp')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const recurringBill = await client.get(`/recurringbills/${args.id}`);
      return {
        success: true,
        data: recurringBill,
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
 * Create recurring bill
 */
export const createRecurringBill: Tool = {
  name: "create_recurring_bill",
  description: "Create a new recurring bill template for periodic vendor payments",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID (starts with '009')",
      chartOfAccountId: {
        type: "string",
        description:
          "Chart of account ID for expense categorization (starts with '0ca'). Set at the bill level.",
      },
      },
      schedulePeriod: {
        type: "string",
        description: "Schedule period: DAILY, WEEKLY, MONTHLY, or YEARLY",
        enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      },
      scheduleFrequency: {
        type: "number",
        description: "How often to create bills (e.g., 1 for every period, 2 for every other period)",
        default: 1,
      },
      nextDueDate: {
        type: "string",
        description: "Next due date for the bill (YYYY-MM-DD format)",
      },
      endDate: {
        type: "string",
        description: "End date for the recurring schedule (YYYY-MM-DD format). Optional.",
      },
      daysInAdvance: {
        type: "number",
        description: "Number of days in advance to create the bill before the due date",
        default: 0,
      },
      recurringBillLineItems: {
        type: "array",
        description: "Line items for the recurring bill",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            amount: {
              type: "number",
              description: "Line item amount",
            },
          },
          required: ["description", "amount"],
        },
      },
      autoPayment: {
        type: "boolean",
        description: "Whether to automatically pay the bill when created",
        default: false,
      },
      bankAccountId: {
        type: "string",
        description: "Bank account ID for auto-payment (required if autoPayment is true)",
      },
      description: {
        type: "string",
        description: "Description or memo for the recurring bill",
      },
    },
    required: ["vendorId", "schedulePeriod", "nextDueDate", "recurringBillLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const {
        schedulePeriod,
        scheduleFrequency,
        nextDueDate,
        endDate,
        daysInAdvance,
        recurringBillLineItems,
        autoPayment,
        bankAccountId,
        ...rest
      } = args;

      // Parse line items if they arrive as a JSON string
      const parsedLineItems =
        typeof recurringBillLineItems === "string"
          ? JSON.parse(recurringBillLineItems)
          : recurringBillLineItems;

      const body: Record<string, unknown> = {
        ...rest,
        schedule: {
          period: schedulePeriod,
          frequency: scheduleFrequency || 1,
          nextDueDate,
          ...(endDate && { endDate }),
          daysInAdvance: daysInAdvance || 0,
        },
        recurringBillLineItems: parsedLineItems,
      };

      if (autoPayment && bankAccountId) {
        body.processingOptions = { autoPayment: true };
        body.paymentInformation = { bankAccountId };
      }

      const recurringBill = await client.post("/recurringbills", body);
      return {
        success: true,
        data: recurringBill,
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
 * Update recurring bill
 */
export const updateRecurringBill: Tool = {
  name: "update_recurring_bill",
  description: "Update an existing recurring bill template",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring bill ID to update (starts with 'btp')",
      },
      chartOfAccountId: {
        type: "string",
        description:
          "Chart of account ID for expense categorization (starts with '0ca'). Set at the bill level.",
      },
      schedulePeriod: {
        type: "string",
        description: "Schedule period: DAILY, WEEKLY, MONTHLY, or YEARLY",
        enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      },
      scheduleFrequency: {
        type: "number",
        description: "How often to create bills",
      },
      nextDueDate: {
        type: "string",
        description: "Next due date for the bill (YYYY-MM-DD format)",
      },
      endDate: {
        type: "string",
        description: "End date for the recurring schedule (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Number of days in advance to create the bill",
      },
      recurringBillLineItems: {
        type: "array",
        description: "Line items for the recurring bill",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            amount: {
              type: "number",
              description: "Line item amount",
            },
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Description or memo for the recurring bill",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const {
        id,
        schedulePeriod,
        scheduleFrequency,
        nextDueDate,
        endDate,
        daysInAdvance,
        recurringBillLineItems,
        ...rest
      } = args;

      const body: Record<string, unknown> = { ...rest };

      // Build schedule object if any schedule fields are provided
      if (schedulePeriod || scheduleFrequency || nextDueDate || endDate || daysInAdvance !== undefined) {
        body.schedule = {
          ...(schedulePeriod && { period: schedulePeriod }),
          ...(scheduleFrequency && { frequency: scheduleFrequency }),
          ...(nextDueDate && { nextDueDate }),
          ...(endDate && { endDate }),
          ...(daysInAdvance !== undefined && { daysInAdvance }),
        };
      }

      if (recurringBillLineItems) {
        body.recurringBillLineItems =
          typeof recurringBillLineItems === "string"
            ? JSON.parse(recurringBillLineItems)
            : recurringBillLineItems;
      }

      const recurringBill = await client.patch(`/recurringbills/${id}`, body);
      return {
        success: true,
        data: recurringBill,
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
 * Archive recurring bill
 */
export const archiveRecurringBill: Tool = {
  name: "archive_recurring_bill",
  description: "Archive a recurring bill template (stops future bill generation)",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring bill ID to archive (starts with 'btp')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/recurringbills/${args.id}/archive`);
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
 * Restore recurring bill
 */
export const restoreRecurringBill: Tool = {
  name: "restore_recurring_bill",
  description: "Restore an archived recurring bill template",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recurring bill ID to restore (starts with 'btp')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/recurringbills/${args.id}/restore`);
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
