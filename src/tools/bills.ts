/**
 * Bill management tools
 */

import { Tool } from "./index.js";
import { BillComClient } from "../billcom-client.js";

/**
 * List bills
 */
export const listBills: Tool = {
  name: "list_bills",
  description: "List bills (accounts payable) with optional filtering by status, vendor, and date range",
  inputSchema: {
    type: "object",
    properties: {
      page: {
        type: "number",
        description: "Page number for pagination (default: 1)",
        default: 1,
      },
      page_size: {
        type: "number",
        description: "Number of results per page (default: 50, max: 100)",
        default: 50,
      },
      status: {
        type: "string",
        description: "Filter by bill status",
        enum: ["draft", "open", "scheduled", "paid", "void"],
      },
      vendor_id: {
        type: "string",
        description: "Filter bills by vendor ID",
      },
      start_date: {
        type: "string",
        description: "Filter bills created after this date (YYYY-MM-DD format)",
      },
      end_date: {
        type: "string",
        description: "Filter bills created before this date (YYYY-MM-DD format)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillComClient) => {
    const {
      page = 1,
      page_size = 50,
      status,
      vendor_id,
      start_date,
      end_date,
    } = args;

    try {
      const params: Record<string, any> = {
        page,
        pageSize: page_size,
      };

      if (status) {
        params.status = status;
      }

      if (vendor_id) {
        params.vendorId = vendor_id;
      }

      if (start_date) {
        params.startDate = start_date;
      }

      if (end_date) {
        params.endDate = end_date;
      }

      const bills = await client.get("/bills", params);

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
