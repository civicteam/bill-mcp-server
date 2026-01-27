/**
 * Customer management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List customers
 */
export const listCustomers: Tool = {
  name: "list_customers",
  description:
    "List customers in the Bill.com account with filtering, sorting, and pagination. Returns newest first by default.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of customers to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Sortable fields: name, companyName, email, phone, invoiceCurrency, createdTime, updatedTime, archived. Default: 'createdTime:desc'. Example: 'name:asc'",
      },
      name: {
        type: "string",
        description:
          "Filter customers whose name starts with this value (uses starts-with matching)",
      },
      archived: {
        type: "boolean",
        description:
          "Filter by archived status. Use false for active customers, true for archived.",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter customers created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter customers created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
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
      const customers = await client.get("/customers", params);

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
      taxId: {
        type: "string",
        description: "Tax ID or EIN",
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
