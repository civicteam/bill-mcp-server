/**
 * Bill management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List bills
 */
export const listBills: Tool = {
  name: "list_bills",
  description: "List bills (accounts payable) with optional filtering by status, vendor, and date range",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of bills to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of bills to skip for pagination (default: 0)",
        default: 0,
      },
      status: {
        type: "string",
        description: "Filter by bill status",
        enum: ["draft", "open", "scheduled", "paid", "void"],
      },
      vendorId: {
        type: "string",
        description: "Filter bills by vendor ID",
      },
      startDate: {
        type: "string",
        description: "Filter bills created after this date (YYYY-MM-DD format)",
      },
      endDate: {
        type: "string",
        description: "Filter bills created before this date (YYYY-MM-DD format)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const {
      limit,
      offset,
      status,
      vendorId,
      startDate,
      endDate,
    } = args;

    try {
      const params: Record<string, any> = {};

      if (limit !== undefined) {
        params.max = limit;
      }

      if (offset !== undefined) {
        params.offset = offset;
      }

      if (status) {
        params.status = status;
      }

      if (vendorId) {
        params.vendorId = vendorId;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const bills = await client.get("/bills", Object.keys(params).length > 0 ? params : undefined);

      return {
        success: true,
        data: bills,
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
 * Get bill details
 */
export const getBill: Tool = {
  name: "get_bill",
  description: "Get detailed information about a specific bill by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const bill = await client.get(`/bills/${args.id}`);
      return {
        success: true,
        data: bill,
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
 * Create bill
 */
export const createBill: Tool = {
  name: "create_bill",
  description: "Create a new bill for a vendor",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID",
      },
      invoiceNumber: {
        type: "string",
        description: "Vendor's invoice number",
      },
      invoiceDate: {
        type: "string",
        description: "Invoice date (YYYY-MM-DD format)",
      },
      dueDate: {
        type: "string",
        description: "Payment due date (YYYY-MM-DD format)",
      },
      lineItems: {
        type: "array",
        description: "Bill line items",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            quantity: {
              type: "number",
              description: "Quantity",
            },
            unitPrice: {
              type: "number",
              description: "Unit price",
            },
            amount: {
              type: "number",
              description: "Line total amount",
            },
            chartOfAccountId: {
              type: "string",
              description: "Chart of account ID for categorization",
            },
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Bill description or memo",
      },
    },
    required: ["vendorId", "invoiceDate", "dueDate", "lineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const bill = await client.post("/bills", args);
      return {
        success: true,
        data: bill,
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
 * Update bill
 */
export const updateBill: Tool = {
  name: "update_bill",
  description: "Update an existing bill",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bill ID to update",
      },
      invoiceNumber: {
        type: "string",
        description: "Vendor's invoice number",
      },
      invoiceDate: {
        type: "string",
        description: "Invoice date (YYYY-MM-DD format)",
      },
      dueDate: {
        type: "string",
        description: "Payment due date (YYYY-MM-DD format)",
      },
      lineItems: {
        type: "array",
        description: "Bill line items",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            quantity: {
              type: "number",
              description: "Quantity",
            },
            unitPrice: {
              type: "number",
              description: "Unit price",
            },
            amount: {
              type: "number",
              description: "Line total amount",
            },
            chartOfAccountId: {
              type: "string",
              description: "Chart of account ID for categorization",
            },
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Bill description or memo",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const bill = await client.patch(`/bills/${id}`, updateData);
      return {
        success: true,
        data: bill,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
