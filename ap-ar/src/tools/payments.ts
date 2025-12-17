/**
 * Payment management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";

/**
 * List payments
 */
export const listPayments: Tool = {
  name: "list_payments",
  description: "List payments with optional filtering by status, vendor, and date range",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of payments to return (default: 50, max: 100)",
        default: 50,
      },
      offset: {
        type: "number",
        description: "Number of payments to skip for pagination (default: 0)",
        default: 0,
      },
      status: {
        type: "string",
        description: "Filter by payment status",
        enum: ["scheduled", "processing", "completed", "cancelled", "failed"],
      },
      vendorId: {
        type: "string",
        description: "Filter payments by vendor ID",
      },
      startDate: {
        type: "string",
        description: "Filter payments created after this date (YYYY-MM-DD format)",
      },
      endDate: {
        type: "string",
        description: "Filter payments created before this date (YYYY-MM-DD format)",
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

      const payments = await client.get("/payments", Object.keys(params).length > 0 ? params : undefined);

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
  description: "Create a new payment for a vendor",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID to pay",
      },
      amount: {
        type: "number",
        description: "Payment amount",
      },
      processDate: {
        type: "string",
        description: "Date to process the payment (YYYY-MM-DD format)",
      },
      description: {
        type: "string",
        description: "Payment description or memo",
      },
      billIds: {
        type: "array",
        description: "Array of bill IDs to pay",
        items: {
          type: "string",
        },
      },
    },
    required: ["vendorId", "amount", "processDate"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const payment = await client.post("/payments", args);
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
