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
  description:
    "Send an invoice to the customer via email. Requires full API access (not available with sync token).",
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
 * Update invoice
 */
export const updateInvoice: Tool = {
  name: "update_invoice",
  description: "Update an existing invoice",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID to update (starts with '00e')",
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
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, invoiceLineItems, ...rest } = args;

      const body: Record<string, unknown> = { ...rest };
      if (invoiceLineItems) {
        body.invoiceLineItems =
          typeof invoiceLineItems === "string"
            ? JSON.parse(invoiceLineItems)
            : invoiceLineItems;
      }

      const invoice = await client.patch(`/invoices/${id}`, body);
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
 * Archive invoice
 */
export const archiveInvoice: Tool = {
  name: "archive_invoice",
  description: "Archive an invoice (soft delete). Archived invoices can be restored.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID to archive (starts with '00e')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/invoices/${args.id}/archive`);
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
 * Restore invoice
 */
export const restoreInvoice: Tool = {
  name: "restore_invoice",
  description: "Restore an archived invoice",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID to restore (starts with '00e')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/invoices/${args.id}/restore`);
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
 * Generate invoice payment link
 */
export const generateInvoicePaymentLink: Tool = {
  name: "generate_invoice_payment_link",
  description:
    "Generate a payment link for an invoice that customers can use to pay online. The link allows customers to pay without needing a BILL account.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The invoice ID (starts with '00e')",
      },
      customerId: {
        type: "string",
        description: "The customer ID (starts with '0cu')",
      },
      email: {
        type: "string",
        description: "Email address to send payment receipt to",
      },
      returnUrl: {
        type: "string",
        description: "Optional URL to redirect the customer to after payment is complete",
      },
    },
    required: ["id", "customerId", "email"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, customerId, email, returnUrl } = args;
      const body: Record<string, string> = { customerId, email };
      if (returnUrl) {
        body.returnUrl = returnUrl;
      }
      const result = await client.post(`/invoices/${id}/payment-link`, body);
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

