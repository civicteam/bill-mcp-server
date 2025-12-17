/**
 * Invoice management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List invoices
 */
export const listInvoices: Tool = {
  name: "list_invoices",
  description: "List invoices (accounts receivable) with optional filtering by status, customer, and date range",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of invoices to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of invoices to skip for pagination (default: 0)",
        default: 0,
      },
      status: {
        type: "string",
        description: "Filter by invoice status",
        enum: ["draft", "sent", "viewed", "partiallyPaid", "paid", "void"],
      },
      customerId: {
        type: "string",
        description: "Filter invoices by customer ID",
      },
      startDate: {
        type: "string",
        description: "Filter invoices created after this date (YYYY-MM-DD format)",
      },
      endDate: {
        type: "string",
        description: "Filter invoices created before this date (YYYY-MM-DD format)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const {
      limit,
      offset,
      status,
      customerId,
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

      if (customerId) {
        params.customerId = customerId;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const invoices = await client.get("/invoices", Object.keys(params).length > 0 ? params : undefined);

      return {
        success: true,
        data: invoices,
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
 * Get invoice details
 */
export const getInvoice: Tool = {
  name: "get_invoice",
  description: "Get detailed information about a specific invoice by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const invoice = await client.get(`/invoices/${args.id}`);
      return {
        success: true,
        data: invoice,
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
 * Create invoice
 */
export const createInvoice: Tool = {
  name: "create_invoice",
  description: "Create a new invoice for a customer",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID",
      },
      invoiceNumber: {
        type: "string",
        description: "Invoice number",
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
        description: "Invoice line items",
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
          },
          required: ["description", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Invoice description or memo",
      },
    },
    required: ["customerId", "invoiceDate", "dueDate", "lineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const invoice = await client.post("/invoices", args);
      return {
        success: true,
        data: invoice,
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
 * Send invoice
 */
export const sendInvoice: Tool = {
  name: "send_invoice",
  description: "Send an invoice to the customer via email",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID to send",
      },
      emailMessage: {
        type: "string",
        description: "Optional custom email message",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, emailMessage, ...rest } = args;
      const payload = emailMessage ? { emailMessage, ...rest } : rest;
      const result = await client.post(`/invoices/${id}/send`, payload);
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
