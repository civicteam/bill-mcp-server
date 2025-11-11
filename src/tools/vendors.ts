/**
 * Vendor management tools
 */

import { Tool } from "./index.js";
import { BillComClient } from "../billcom-client.js";

/**
 * List vendors
 */
export const listVendors: Tool = {
  name: "list_vendors",
  description: "List all vendors in the Bill.com account with optional filtering",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number for pagination (default: 1)",
        default: 1,
      },
      page_size: {
        type: "number",
        description: "Number of results per page (default: 50, max: 100)",
        default: 50,
      },
      name: {
        type: "string",
        description: "Filter vendors by name (partial match)",
      },
      active: {
        type: "boolean",
        description: "Filter by active status",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillComClient) => {
    const { page = 1, page_size = 50, name, active } = args;

    try {
      const params: Record<string, any> = {
        page,
        pageSize: page_size,
      };

      if (name) {
        params.name = name;
      }

      if (active !== undefined) {
        params.isActive = active;
      }

      const vendors = await client.get("/vendors", params);

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
