/**
 * User management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams } from "./list-params.js";

/**
 * List user roles
 */
export const listUserRoles: Tool = {
  name: "list_user_roles",
  description:
    "List available user roles in the Bill.com organization. Use the returned role IDs when creating or updating users.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async (_args: any, client: BillClient) => {
    try {
      const roles = await client.get("/roles");
      return {
        success: true,
        data: roles,
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

/**
 * Create user (Full API Access only)
 */
export const createUser: Tool = {
  name: "create_user",
  description:
    "Create a new user in the Bill.com organization. Requires full API access (not available with sync token). Use list_user_roles to get available role IDs.",
  inputSchema: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "User email address (used for login)",
      },
      firstName: {
        type: "string",
        description: "User's first name",
      },
      lastName: {
        type: "string",
        description: "User's last name",
      },
      phone: {
        type: "string",
        description: "User's phone number",
      },
      roleId: {
        type: "string",
        description: "BILL-generated role ID (e.g., '00r...'). Use list_user_roles to get available role IDs. If not specified, defaults to ADMINISTRATOR role.",
      },
      departmentIds: {
        type: "array",
        description: "Department IDs the user belongs to",
        items: {
          type: "string",
        },
      },
    },
    required: ["email", "firstName", "lastName"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const user = await client.post("/users", args);
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

/**
 * Update user (Full API Access only)
 */
export const updateUser: Tool = {
  name: "update_user",
  description:
    "Update an existing user. Requires full API access (not available with sync token). Use list_user_roles to get available role IDs.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The user ID to update (starts with '00U')",
      },
      firstName: {
        type: "string",
        description: "User's first name",
      },
      lastName: {
        type: "string",
        description: "User's last name",
      },
      phone: {
        type: "string",
        description: "User's phone number",
      },
      roleId: {
        type: "string",
        description: "BILL-generated role ID (e.g., '00r...'). Use list_user_roles to get available role IDs.",
      },
      departmentIds: {
        type: "array",
        description: "Department IDs the user belongs to",
        items: {
          type: "string",
        },
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const user = await client.patch(`/users/${id}`, updateData);
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

/**
 * Delete user (Full API Access only)
 */
export const deleteUser: Tool = {
  name: "delete_user",
  description:
    "Delete a user from the organization. Requires full API access (not available with sync token).",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The user ID to delete (starts with '00U')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.delete(`/users/${args.id}`);
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
