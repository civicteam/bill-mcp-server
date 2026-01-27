/**
 * Payment management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List payments
 */
export const listPayments: Tool = {
  name: "list_payments",
  description:
    "List payments with filtering, sorting, and pagination. Returns newest first by default.",
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
          "Sort order in 'field:direction' format. Sortable fields: processDate, amount, createdTime, updatedTime, description, disbursementStatus. Default: 'createdTime:desc'. Example: 'processDate:desc'",
      },
      status: {
        type: "string",
        description: "Filter by payment status",
      },
      vendorId: {
        type: "string",
        description: "Filter payments by vendor ID",
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
      processDateAfter: {
        type: "string",
        description:
          "Filter payments processed on or after this date (ISO 8601 format)",
      },
      processDateBefore: {
        type: "string",
        description:
          "Filter payments processed on or before this date (ISO 8601 format)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const {
      limit,
      page,
      sort,
      status,
      vendorId,
      createdAfter,
      createdBefore,
      processDateAfter,
      processDateBefore,
    } = args;

    try {
      const filters: FilterClause[] = [];
      if (status)
        filters.push({ field: "status", op: "eq", value: status });
      if (vendorId)
        filters.push({ field: "vendorId", op: "eq", value: vendorId });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });
      if (processDateAfter)
        filters.push({ field: "processDate", op: "gte", value: processDateAfter });
      if (processDateBefore)
        filters.push({ field: "processDate", op: "lte", value: processDateBefore });

      const params = buildListParams({ max: limit, page, sort, filters });
      const payments = await client.get("/payments", params);

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
 * Get payment details
 */
export const getPayment: Tool = {
  name: "get_payment",
  description: "Get detailed information about a specific payment by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The payment ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const payment = await client.get(`/payments/${args.id}`);
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
 * Create payment
 */
export const createPayment: Tool = {
  name: "create_payment",
  description: "Create a new payment for a vendor. Requires a funding account and processing options.",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID to pay",
      },
      billId: {
        type: "string",
        description: "The bill ID to pay (starts with '00n'). Not required if createBill is true.",
      },
      amount: {
        type: "number",
        description: "Payment amount",
      },
      processDate: {
        type: "string",
        description: "Date to process the payment (YYYY-MM-DD format)",
      },
      fundingAccountId: {
        type: "string",
        description:
          "The bank account ID to fund the payment from. Use list_bank_accounts to find available accounts.",
      },
      fundingAccountType: {
        type: "string",
        description: "Type of funding account (default: BANK_ACCOUNT)",
        default: "BANK_ACCOUNT",
      },
      createBill: {
        type: "boolean",
        description: "Whether to create a new bill for this payment (default: false)",
        default: false,
      },
      requestPayFaster: {
        type: "boolean",
        description: "Whether to request faster ACH payment (default: false)",
        default: false,
      },
      description: {
        type: "string",
        description: "Payment description or memo",
      },
    },
    required: ["vendorId", "amount", "processDate", "fundingAccountId"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const {
        fundingAccountId,
        fundingAccountType,
        createBill,
        requestPayFaster,
        ...rest
      } = args;

      const body: Record<string, unknown> = {
        ...rest,
        fundingAccount: {
          type: fundingAccountType || "BANK_ACCOUNT",
          id: fundingAccountId,
        },
        processingOptions: {
          createBill: createBill || false,
          requestPayFaster: requestPayFaster || false,
        },
      };

      const payment = await client.post("/payments", body);
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
 * Cancel payment
 */
export const cancelPayment: Tool = {
  name: "cancel_payment",
  description: "Cancel a scheduled payment",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The payment ID to cancel",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/payments/${args.id}/cancel`);
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
