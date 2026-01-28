/**
 * Chart of Accounts management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List chart of accounts
 */
export const listChartOfAccounts: Tool = {
  name: "list_chart_of_accounts",
  description:
    "List chart of accounts entries with filtering, sorting, and pagination. These are GL account categories for classifying financial transactions.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of accounts to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Sortable fields: name, accountNumber, createdTime, updatedTime. Default: 'createdTime:desc'.",
      },
      name: {
        type: "string",
        description:
          "Filter accounts whose name starts with this value (uses starts-with matching)",
      },
      accountType: {
        type: "string",
        description:
          "Filter by account type (e.g., EXPENSE, INCOME, ASSET, LIABILITY, EQUITY)",
      },
      archived: {
        type: "boolean",
        description:
          "Filter by archived status. Use false for active accounts, true for archived.",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, name, accountType, archived } = args;

    try {
      const filters: FilterClause[] = [];
      if (name) filters.push({ field: "name", op: "sw", value: name });
      if (accountType)
        filters.push({ field: "accountType", op: "eq", value: accountType });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });

      const params = buildListParams({ max: limit, page, sort, filters });
      const accounts = await client.get(
        "/classifications/chart-of-accounts",
        params
      );

      return {
        success: true,
        data: accounts,
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
 * Get chart of account details
 */
export const getChartOfAccount: Tool = {
  name: "get_chart_of_account",
  description: "Get detailed information about a specific chart of account entry by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The chart of account ID (starts with '0ca')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const account = await client.get(
        `/classifications/chart-of-accounts/${args.id}`
      );
      return {
        success: true,
        data: account,
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
 * Create chart of account
 */
export const createChartOfAccount: Tool = {
  name: "create_chart_of_account",
  description: "Create a new chart of account entry for GL classification",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Unique account name",
      },
      accountNumber: {
        type: "string",
        description: "Unique account number for the GL entry",
      },
      accountType: {
        type: "string",
        description:
          "Account type category (e.g., EXPENSE, INCOME, ASSET, LIABILITY, EQUITY, ACCOUNTS_PAYABLE, ACCOUNTS_RECEIVABLE, BANK, COST_OF_GOODS_SOLD)",
      },
      description: {
        type: "string",
        description: "Description of the account",
      },
      parentChartOfAccountId: {
        type: "string",
        description: "Parent account ID for hierarchical organization (starts with '0ca')",
      },
    },
    required: ["name", "accountType"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const account = await client.post(
        "/classifications/chart-of-accounts",
        args
      );
      return {
        success: true,
        data: account,
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
 * Update chart of account
 */
export const updateChartOfAccount: Tool = {
  name: "update_chart_of_account",
  description: "Update an existing chart of account entry",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The chart of account ID to update (starts with '0ca')",
      },
      name: {
        type: "string",
        description: "Account name",
      },
      accountNumber: {
        type: "string",
        description: "Account number",
      },
      description: {
        type: "string",
        description: "Description of the account",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const account = await client.patch(
        `/classifications/chart-of-accounts/${id}`,
        updateData
      );
      return {
        success: true,
        data: account,
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
 * Archive chart of account
 */
export const archiveChartOfAccount: Tool = {
  name: "archive_chart_of_account",
  description: "Archive a chart of account entry (soft delete)",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The chart of account ID to archive (starts with '0ca')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(
        `/classifications/chart-of-accounts/${args.id}/archive`
      );
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
 * Restore chart of account
 */
export const restoreChartOfAccount: Tool = {
  name: "restore_chart_of_account",
  description: "Restore an archived chart of account entry",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The chart of account ID to restore (starts with '0ca')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(
        `/classifications/chart-of-accounts/${args.id}/restore`
      );
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
