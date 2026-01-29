/**
 * User management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams } from "./list-params.js";

/**
 * List users
 */
export const listUsers: Tool = {
  name: "list_users",
  description:
    "List users in the Bill.com organization with pagination.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of users to return per page (default: 50, max: 100)",
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
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort } = args;

    try {
      const params = buildListParams({ max: limit, page, sort });
      const users = await client.get("/users", params);

      return {
        success: true,
        data: users,
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
 * Get user details
 */
export const getUser: Tool = {
  name: "get_user",
  description: "Get detailed information about a specific user by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The user ID (starts with '00U' for AP/AR users)",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const user = await client.get(`/users/${args.id}`);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
