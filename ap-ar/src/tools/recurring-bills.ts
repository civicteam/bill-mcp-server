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
    "List recurring bills with filtering, sorting, and pagination. Recurring bills are templates for automatically generating bills on a schedule.",
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
          "Sort order in 'field:direction' format. Default: 'createdTime:desc'.",
      },
      vendorId: {
        type: "string",
        description: "Filter by vendor ID",
      },
      isActive: {
        type: "boolean",
        description: "Filter by active status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, vendorId, isActive } = args;

    try {
      const filters: FilterClause[] = [];
      if (vendorId)
        filters.push({ field: "vendorId", op: "eq", value: vendorId });
      if (isActive !== undefined)
        filters.push({ field: "isActive", op: "eq", value: isActive });

      const params = buildListParams({ max: limit, page, sort, filters });
      const recurringBills = await client.get("/recurring-bills", params);

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
        description: "The recurring bill ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const recurringBill = await client.get(`/recurring-bills/${args.id}`);
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
  description: "Create a new recurring bill template",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID for the recurring bill",
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
        description: "Next due date for bill generation (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Days before due date to create the bill",
      },
      billLineItems: {
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
            chartOfAccountId: {
              type: "string",
              description: "Chart of account ID for categorization",
            },
          },
          required: ["amount"],
        },
      },
      description: {
        type: "string",
        description: "Description or memo",
      },
    },
    required: ["vendorId", "timePeriod", "nextDueDate", "billLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { billLineItems, ...rest } = args;

      const parsedLineItems =
        typeof billLineItems === "string"
          ? JSON.parse(billLineItems)
          : billLineItems;

      const body: Record<string, unknown> = {
        ...rest,
        billLineItems: parsedLineItems,
      };

      const recurringBill = await client.post("/recurring-bills", body);
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
        description: "The recurring bill ID to update",
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
        description: "Next due date for bill generation (YYYY-MM-DD format)",
      },
      daysInAdvance: {
        type: "number",
        description: "Days before due date to create the bill",
      },
      isActive: {
        type: "boolean",
        description: "Whether the recurring bill is active",
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
      const recurringBill = await client.patch(`/recurring-bills/${id}`, updateData);
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
