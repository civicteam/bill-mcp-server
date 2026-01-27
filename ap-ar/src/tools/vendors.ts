/**
 * Vendor management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List vendors
 */
export const listVendors: Tool = {
  name: "list_vendors",
  description:
    "List vendors in the Bill.com account with filtering, sorting, and pagination. Returns newest first by default.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of vendors to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Sortable fields: name, email, phone, billCurrency, createdTime, updatedTime, archived. Default: 'createdTime:desc'. Example: 'name:asc'",
      },
      name: {
        type: "string",
        description:
          "Filter vendors whose name starts with this value (uses starts-with matching)",
      },
      archived: {
        type: "boolean",
        description:
          "Filter by archived status. Use false for active vendors, true for archived.",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter vendors created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter vendors created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, name, archived, createdAfter, createdBefore } =
      args;

    try {
      const filters: FilterClause[] = [];
      if (name) filters.push({ field: "name", op: "sw", value: name });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });

      const params = buildListParams({ max: limit, page, sort, filters });
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

/**
 * Create vendor
 */
export const createVendor: Tool = {
  name: "create_vendor",
  description: "Create a new vendor in Bill.com",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Vendor name",
      },
      email: {
        type: "string",
        description: "Vendor email address",
      },
      phone: {
        type: "string",
        description: "Vendor phone number",
      },
      address: {
        type: "object",
        description: "Vendor address",
        properties: {
          line1: {
            type: "string",
            description: "Address line 1",
          },
          line2: {
            type: "string",
            description: "Address line 2",
          },
          city: {
            type: "string",
            description: "City",
          },
          state: {
            type: "string",
            description: "State/Province",
          },
          zipOrPostalCode: {
            type: "string",
            description: "ZIP/Postal code",
          },
          country: {
            type: "string",
            description: "Country code (e.g., US)",
          },
        },
      },
      accountNumber: {
        type: "string",
        description: "Account number for this vendor",
      },
      taxId: {
        type: "string",
        description: "Tax ID or EIN",
      },
    },
    required: ["name"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const vendor = await client.post("/vendors", args);
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

/**
 * Update vendor
 */
export const updateVendor: Tool = {
  name: "update_vendor",
  description: "Update an existing vendor in Bill.com",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The vendor ID to update",
      },
      name: {
        type: "string",
        description: "Vendor name",
      },
      email: {
        type: "string",
        description: "Vendor email address",
      },
      phone: {
        type: "string",
        description: "Vendor phone number",
      },
      address: {
        type: "object",
        description: "Vendor address",
        properties: {
          line1: {
            type: "string",
            description: "Address line 1",
          },
          line2: {
            type: "string",
            description: "Address line 2",
          },
          city: {
            type: "string",
            description: "City",
          },
          state: {
            type: "string",
            description: "State/Province",
          },
          zipOrPostalCode: {
            type: "string",
            description: "ZIP/Postal code",
          },
          country: {
            type: "string",
            description: "Country code (e.g., US)",
          },
        },
      },
      accountNumber: {
        type: "string",
        description: "Account number for this vendor",
      },
      taxId: {
        type: "string",
        description: "Tax ID or EIN",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const vendor = await client.patch(`/vendors/${id}`, updateData);
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
