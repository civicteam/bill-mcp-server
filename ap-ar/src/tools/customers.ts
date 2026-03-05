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

      const params = buildListParams({ max: limit, page, sort: sort ?? "createdTime:desc", filters });
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

/**
 * Update customer
 */
export const updateCustomer: Tool = {
  name: "update_customer",
  description: "Update an existing customer in Bill.com",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The customer ID to update (starts with '0cu')",
      },
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
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const customer = await client.patch(`/customers/${id}`, updateData);
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
 * Archive customer
 */
export const archiveCustomer: Tool = {
  name: "archive_customer",
  description: "Archive a customer (soft delete). Archived customers can be restored.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The customer ID to archive (starts with '0cu')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/customers/${args.id}/archive`);
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
 * Restore customer
 */
export const restoreCustomer: Tool = {
  name: "restore_customer",
  description: "Restore an archived customer",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The customer ID to restore (starts with '0cu')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/customers/${args.id}/restore`);
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
 * List customer bank accounts (Full API Access only)
 */
export const listCustomerBankAccounts: Tool = {
  name: "list_customer_bank_accounts",
  description:
    "List bank accounts associated with a customer. Requires full API access.",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
    },
    required: ["customerId"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.get(`/customers/${args.customerId}/bank-accounts`);
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
 * Create customer bank account (Full API Access only)
 */
export const createCustomerBankAccount: Tool = {
  name: "create_customer_bank_account",
  description:
    "Add a bank account to a customer for receiving payments. Requires full API access (not available with sync token). The customer must have a billing address set before adding a bank account.",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
      nameOnAccount: {
        type: "string",
        description: "Full name on the bank account",
      },
      routingNumber: {
        type: "string",
        description: "Bank routing number (9 digits)",
      },
      accountNumber: {
        type: "string",
        description: "Bank account number",
      },
      type: {
        type: "string",
        description: "Account type: CHECKING or SAVINGS",
        enum: ["CHECKING", "SAVINGS"],
      },
      ownerType: {
        type: "string",
        description: "Bank account owner type: BUSINESS or PERSONAL",
        enum: ["BUSINESS", "PERSONAL"],
      },
    },
    required: ["customerId", "nameOnAccount", "routingNumber", "accountNumber", "type", "ownerType"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, ...bankData } = args;
      const result = await client.post(`/customers/${customerId}/bank-accounts`, bankData);
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
 * Delete customer bank account (Full API Access only)
 */
export const deleteCustomerBankAccount: Tool = {
  name: "delete_customer_bank_account",
  description:
    "Archive (delete) a customer's bank account. Requires full API access (not available with sync token).",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
      bankAccountId: {
        type: "string",
        description: "The bank account ID to delete",
      },
    },
    required: ["customerId", "bankAccountId"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, bankAccountId } = args;
      // Bill.com v3 API uses POST to /archive endpoint instead of DELETE
      const result = await client.post(`/customers/${customerId}/bank-accounts/${bankAccountId}/archive`);
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
 * Set customer charge authorization (Full API Access only)
 */
export const setCustomerChargeAuthorization: Tool = {
  name: "set_customer_charge_authorization",
  description:
    "Enable or disable the ability to charge a customer's bank account. Required before using charge_customer. Requires full API access.",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
      authorizedToCharge: {
        type: "boolean",
        description: "Whether the customer authorizes you to charge their bank account",
      },
    },
    required: ["customerId", "authorizedToCharge"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, authorizedToCharge } = args;
      const result = await client.post(`/customers/${customerId}/charge-authorization`, {
        authorizedToCharge,
      });
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
