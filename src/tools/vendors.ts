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
          zip: {
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
      isActive: {
        type: "boolean",
        description: "Whether the vendor is active (default: true)",
        default: true,
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
          zip: {
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
      isActive: {
        type: "boolean",
        description: "Whether the vendor is active",
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
