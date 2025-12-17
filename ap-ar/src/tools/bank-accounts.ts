/**
 * Bank account management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List bank accounts
 */
export const listBankAccounts: Tool = {
  name: "list_bank_accounts",
  description: "List all bank accounts in the Bill.com account",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of bank accounts to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of bank accounts to skip for pagination (default: 0)",
        default: 0,
      },
      isActive: {
        type: "boolean",
        description: "Filter by active status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, offset, isActive } = args;

    try {
      const params: Record<string, any> = {};

      if (limit !== undefined) {
        params.max = limit;
      }

      if (offset !== undefined) {
        params.offset = offset;
      }

      if (isActive !== undefined) {
        params.isActive = isActive;
      }

      const bankAccounts = await client.get("/bank-accounts", Object.keys(params).length > 0 ? params : undefined);

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
