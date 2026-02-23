/**
 * Receivable Payment management tools (Accounts Receivable)
 *
 * These tools handle payments received from customers, including the ability
 * to charge customers directly (Full API Access only).
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List receivable payments
 */
export const listReceivablePayments: Tool = {
  name: "list_receivable_payments",
  description:
    "List payments received from customers with filtering, sorting, and pagination. Returns newest first by default.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of payments to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Default: 'createdTime:desc'.",
      },
      customerId: {
        type: "string",
        description: "Filter payments by customer ID (starts with '0cu')",
      },
      status: {
        type: "string",
        description: "Filter by payment status (e.g., PAID, PENDING, FAILED)",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter payments created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter payments created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, customerId, status, createdAfter, createdBefore } =
      args;

    try {
      const filters: FilterClause[] = [];
      if (customerId)
        filters.push({ field: "customerId", op: "eq", value: customerId });
      if (status)
        filters.push({ field: "status", op: "eq", value: status });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });

      const params = buildListParams({ max: limit, page, sort, filters });
      const payments = await client.get("/receivable-payments", params);

      return {
        success: true,
        data: payments,
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
 * Get receivable payment details
 */
export const getReceivablePayment: Tool = {
  name: "get_receivable_payment",
  description: "Get detailed information about a specific receivable payment by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The receivable payment ID (starts with '0rp')",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const payment = await client.get(`/receivable-payments/${args.id}`);
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

/**
 * Charge customer (Full API Access only)
 */
export const chargeCustomer: Tool = {
  name: "charge_customer",
  description:
    "Charge a customer's bank account for one or more invoices. Requires full API access (not available with sync token). The customer must be authorized to charge (use set_customer_charge_authorization) and have a bank account on file (use create_customer_bank_account).",
  inputSchema: {
    type: "object",
    properties: {
      customerId: {
        type: "string",
        description: "The customer ID to charge (starts with '0cu')",
      },
      customerBankAccountId: {
        type: "string",
        description: "The customer's bank account ID to charge",
      },
      invoicePayments: {
        type: "array",
        description: "Array of invoices to charge for",
        items: {
          type: "object",
          properties: {
            invoiceId: {
              type: "string",
              description: "The invoice ID (starts with '00e')",
            },
            amount: {
              type: "number",
              description: "Amount to charge for this invoice",
            },
          },
          required: ["invoiceId", "amount"],
        },
      },
      description: {
        type: "string",
        description: "Optional description or memo for the charge",
      },
    },
    required: ["customerId", "customerBankAccountId", "invoicePayments"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { customerId, customerBankAccountId, invoicePayments, description } = args;

      // Parse invoicePayments if it arrives as a JSON string
      const parsedInvoicePayments =
        typeof invoicePayments === "string"
          ? JSON.parse(invoicePayments)
          : invoicePayments;

      const body: Record<string, unknown> = {
        customerId,
        fundingAccount: {
          type: "CUSTOMER_BANK_ACCOUNT",
          id: customerBankAccountId,
        },
        invoicePayments: parsedInvoicePayments,
      };

      if (description) {
        body.description = description;
      }

      const result = await client.post("/receivable-payments", body);
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
