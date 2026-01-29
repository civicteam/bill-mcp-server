/**
 * Credit Memo management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List credit memos
 */
export const listCreditMemos: Tool = {
  name: "list_credit_memos",
  description:
    "List credit memos with filtering, sorting, and pagination. Credit memos are used to credit customers for returns or adjustments.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of credit memos to return per page (default: 50, max: 100)",
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
        description: "Filter by customer ID (starts with '0cu')",
      },
      archived: {
        type: "boolean",
        description: "Filter by archived status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, customerId, archived } = args;

    try {
      const filters: FilterClause[] = [];
      if (customerId)
        filters.push({ field: "customerId", op: "eq", value: customerId });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });

      const params = buildListParams({ max: limit, page, sort, filters });
      const creditMemos = await client.get("/credit-memos", params);

      return {
        success: true,
        data: creditMemos,
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
 * Get credit memo details
 */
export const getCreditMemo: Tool = {
  name: "get_credit_memo",
  description: "Get detailed information about a specific credit memo by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The credit memo ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const creditMemo = await client.get(`/credit-memos/${args.id}`);
      return {
        success: true,
        data: creditMemo,
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
 * Create credit memo
 */
export const createCreditMemo: Tool = {
  name: "create_credit_memo",
  description: "Create a new credit memo for a customer",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
      creditMemoDate: {
        type: "string",
        description: "Date of the credit memo (YYYY-MM-DD format). Defaults to today if omitted.",
      },
      creditMemoNumber: {
        type: "string",
        description: "Credit memo reference number",
      },
      creditMemoLineItems: {
        type: "array",
        description: "Line items for the credit memo",
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
    required: ["customerId", "creditMemoLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, creditMemoLineItems, ...rest } = args;

      const parsedLineItems =
        typeof creditMemoLineItems === "string"
          ? JSON.parse(creditMemoLineItems)
          : creditMemoLineItems;

      const body: Record<string, unknown> = {
        ...rest,
        creditMemoLineItems: parsedLineItems,
        customer: { id: customerId },
      };

      const creditMemo = await client.post("/credit-memos", body);
      return {
        success: true,
        data: creditMemo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
