/**
 * Invoice management tools (Accounts Receivable)
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List invoices
 */
export const listInvoices: Tool = {
  name: "list_invoices",
  description:
    "List invoices (accounts receivable) with filtering, sorting, and pagination. Returns newest first by default.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of invoices to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Sortable fields: invoiceNumber, invoiceDate, dueDate, totalAmount, createdTime, updatedTime, archived. Default: 'createdTime:desc'. Example: 'dueDate:asc'",
      },
      customerId: {
        type: "string",
        description: "Filter invoices by customer ID",
      },
      archived: {
        type: "boolean",
        description: "Filter by archived status",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter invoices created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter invoices created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, customerId, archived, createdAfter, createdBefore } =
      args;

    try {
      const filters: FilterClause[] = [];
      if (customerId)
        filters.push({ field: "customerId", op: "eq", value: customerId });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });

      const params = buildListParams({ max: limit, page, sort, filters });
      const invoices = await client.get("/invoices", params);

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
        description: "The customer ID (starts with '0cu')",
      },
      invoiceNumber: {
        type: "string",
        description: "Invoice number",
      },
      invoiceDate: {
        type: "string",
        description:
          "Invoice date (YYYY-MM-DD format). Defaults to today if omitted.",
      },
      dueDate: {
        type: "string",
        description: "Payment due date (YYYY-MM-DD format)",
      },
      invoiceLineItems: {
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
            price: {
              type: "number",
              description: "Unit price",
            },
          },
          required: ["description", "quantity", "price"],
        },
      },
      description: {
        type: "string",
        description: "Invoice description or memo",
      },
    },
    required: ["customerId", "dueDate", "invoiceLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, invoiceLineItems, ...rest } = args;

      // Parse invoiceLineItems if it arrives as a JSON string (MCP transport serialization)
      const parsedLineItems =
        typeof invoiceLineItems === "string" ? JSON.parse(invoiceLineItems) : invoiceLineItems;

      // The API expects customer as a nested object with an id field
      const body: Record<string, unknown> = {
        ...rest,
        invoiceLineItems: parsedLineItems,
        customer: { id: customerId },
      };

      const invoice = await client.post("/invoices", body);
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
        description: "The invoice ID to send (starts with '00e')",
      },
      recipientEmails: {
        type: "array",
        description: "Email addresses to send the invoice to",
        items: {
          type: "string",
        },
      },
      replyToUserId: {
        type: "string",
        description:
          "Optional Bill.com AP/AR user ID for the reply-to address (starts with '00U'). Omit to use the default.",
      },
    },
    required: ["id", "recipientEmails"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, recipientEmails, replyToUserId } = args;
      const payload: Record<string, unknown> = {
        recipient: { to: recipientEmails },
      };
      if (replyToUserId) {
        payload.replyTo = { userId: replyToUserId };
      }
      const result = await client.post(`/invoices/${id}/email`, payload);
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
 * Record AR payment
 */
export const recordArPayment: Tool = {
  name: "record_ar_payment",
  description:
    "Record a payment received from a customer for an invoice. Use this to track payments received outside of Bill.com.",
  inputSchema: {
    type: "object",
    properties: {
      invoiceId: {
        type: "string",
        description: "The invoice ID being paid (starts with '00e')",
      },
      amount: {
        type: "number",
        description: "Payment amount received",
      },
      paymentDate: {
        type: "string",
        description: "Date payment was received (YYYY-MM-DD format)",
      },
      paymentMethod: {
        type: "string",
        description: "Payment method (e.g., 'CHECK', 'CASH', 'CREDIT_CARD', 'ACH', 'OTHER')",
      },
      referenceNumber: {
        type: "string",
        description: "Reference number (e.g., check number)",
      },
      description: {
        type: "string",
        description: "Payment description or memo",
      },
    },
    required: ["invoiceId", "amount", "paymentDate"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { invoiceId, ...paymentData } = args;

      const body: Record<string, unknown> = {
        ...paymentData,
        invoice: { id: invoiceId },
      };

      const payment = await client.post("/invoices/record-payment", body);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
