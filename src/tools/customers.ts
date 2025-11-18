/**
 * Customer management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List customers
 */
export const listCustomers: Tool = {
  name: "list_customers",
  description: "List all customers in the Bill.com account with optional filtering",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of customers to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of customers to skip for pagination (default: 0)",
        default: 0,
      },
      name: {
        type: "string",
        description: "Filter customers by name (partial match)",
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

      const customers = await client.get("/customers", Object.keys(params).length > 0 ? params : undefined);

      return {
        success: true,
        data: customers,
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
 * Get customer details
 */
export const getCustomer: Tool = {
  name: "get_customer",
  description: "Get detailed information about a specific customer by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The customer ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const customer = await client.get(`/customers/${args.id}`);
      return {
        success: true,
        data: customer,
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
 * Create customer
 */
export const createCustomer: Tool = {
  name: "create_customer",
  description: "Create a new customer in Bill.com",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Customer name",
      },
      email: {
        type: "string",
        description: "Customer email address",
      },
      phone: {
        type: "string",
        description: "Customer phone number",
      },
      address: {
        type: "object",
        description: "Customer address",
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
      taxId: {
        type: "string",
        description: "Tax ID or EIN",
      },
      isActive: {
        type: "boolean",
        description: "Whether the customer is active (default: true)",
        default: true,
      },
    },
    required: ["name"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const customer = await client.post("/customers", args);
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
