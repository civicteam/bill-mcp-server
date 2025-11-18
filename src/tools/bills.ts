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
