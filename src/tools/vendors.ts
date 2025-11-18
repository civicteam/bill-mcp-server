/**
 * Vendor management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List vendors
 */
export const listVendors: Tool = {
  name: "list_vendors",
  description: "List all vendors in the Bill.com account with optional filtering",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of vendors to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of vendors to skip for pagination (default: 0)",
        default: 0,
      },
      name: {
        type: "string",
        description: "Filter vendors by name (partial match)",
      },
      isActive: {
        type: "boolean",
        description: "Filter by active status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, offset, name, isActive } = args;

    try {
      const params: Record<string, any> = {};

      if (limit !== undefined) {
        params.max = limit;
      }

      if (offset !== undefined) {
        params.offset = offset;
      }

      if (name) {
        params.name = name;
      }

      if (isActive !== undefined) {
        params.isActive = isActive;
      }

      const vendors = await client.get("/vendors", Object.keys(params).length > 0 ? params : undefined);

      return {
        success: true,
        data: vendors,
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
 * Get vendor details
 */
export const getVendor: Tool = {
  name: "get_vendor",
  description: "Get detailed information about a specific vendor by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The vendor ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const vendor = await client.get(`/vendors/${args.id}`);
      return {
        success: true,
        data: vendor,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
