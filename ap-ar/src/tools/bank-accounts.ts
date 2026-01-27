/**
 * Bank account management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams } from "./list-params.js";

/**
 * List bank accounts
 */
export const listBankAccounts: Tool = {
  name: "list_bank_accounts",
  description:
    "List bank accounts in the Bill.com account with pagination. Returns newest first by default.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of bank accounts to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Default: 'createdTime:desc'",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort } = args;

    try {
      const params = buildListParams({ max: limit, page, sort });
      const bankAccounts = await client.get("/bank-accounts", params);

      return {
        success: true,
        data: bankAccounts,
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
 * Get bank account details
 */
export const getBankAccount: Tool = {
  name: "get_bank_account",
  description: "Get detailed information about a specific bank account by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bank account ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const bankAccount = await client.get(`/bank-accounts/${args.id}`);
      return {
        success: true,
        data: bankAccount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
