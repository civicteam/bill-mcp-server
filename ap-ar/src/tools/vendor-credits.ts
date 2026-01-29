/**
 * Vendor Credit management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams, type FilterClause } from "./list-params.js";

/**
 * List vendor credits
 */
export const listVendorCredits: Tool = {
  name: "list_vendor_credits",
  description:
    "List vendor credits with filtering, sorting, and pagination. Vendor credits adjust the amount owed to vendors.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of vendor credits to return per page (default: 50, max: 100)",
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
          "Sort order in 'field:direction' format. Sortable fields: creditDate, amount, createdTime, updatedTime. Default: 'createdTime:desc'.",
      },
      vendorId: {
        type: "string",
        description: "Filter vendor credits by vendor ID (starts with '00v')",
      },
      archived: {
        type: "boolean",
        description:
          "Filter by archived status. Use false for active credits, true for archived.",
      },
      createdAfter: {
        type: "string",
        description:
          "Filter vendor credits created on or after this date (ISO 8601 format, e.g. 2025-01-01)",
      },
      createdBefore: {
        type: "string",
        description:
          "Filter vendor credits created on or before this date (ISO 8601 format, e.g. 2025-12-31)",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort, vendorId, archived, createdAfter, createdBefore } =
      args;

    try {
      const filters: FilterClause[] = [];
      if (vendorId)
        filters.push({ field: "vendorId", op: "eq", value: vendorId });
      if (archived !== undefined)
        filters.push({ field: "archived", op: "eq", value: archived });
      if (createdAfter)
        filters.push({ field: "createdTime", op: "gte", value: createdAfter });
      if (createdBefore)
        filters.push({ field: "createdTime", op: "lte", value: createdBefore });

      const params = buildListParams({ max: limit, page, sort, filters });
      const credits = await client.get("/vendor-credits", params);

      return {
        success: true,
        data: credits,
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
 * Get vendor credit details
 */
export const getVendorCredit: Tool = {
  name: "get_vendor_credit",
  description: "Get detailed information about a specific vendor credit by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The vendor credit ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const credit = await client.get(`/vendor-credits/${args.id}`);
      return {
        success: true,
        data: credit,
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
 * Create vendor credit
 */
export const createVendorCredit: Tool = {
  name: "create_vendor_credit",
  description:
    "Create a new vendor credit to adjust the amount owed to a vendor",
  inputSchema: {
    type: "object",
    properties: {
      vendorId: {
        type: "string",
        description: "The vendor ID to credit (starts with '00v')",
      },
      creditDate: {
        type: "string",
        description:
          "Date of the credit (YYYY-MM-DD format). Defaults to today if omitted.",
      },
      referenceNumber: {
        type: "string",
        description: "Vendor credit reference number",
      },
      vendorCreditLineItems: {
        type: "array",
        description: "Line items for the vendor credit",
        items: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description: "Item description",
            },
            amount: {
              type: "number",
              description: "Credit amount for this line item",
            },
            chartOfAccountId: {
              type: "string",
              description:
                "Chart of account ID for GL classification (starts with '0ca')",
            },
          },
          required: ["amount"],
        },
      },
      description: {
        type: "string",
        description: "Description or memo for the vendor credit",
      },
    },
    required: ["vendorId", "vendorCreditLineItems"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { vendorCreditLineItems, ...rest } = args;

      // Parse vendorCreditLineItems if it arrives as a JSON string
      const parsedLineItems =
        typeof vendorCreditLineItems === "string"
          ? JSON.parse(vendorCreditLineItems)
          : vendorCreditLineItems;

      // vendorId is passed directly at the top level, not nested
      const body: Record<string, unknown> = {
        ...rest,
        vendorCreditLineItems: parsedLineItems,
      };

      const credit = await client.post("/vendor-credits", body);
      return {
        success: true,
        data: credit,
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
 * Update vendor credit
 */
export const updateVendorCredit: Tool = {
  name: "update_vendor_credit",
  description: "Update an existing vendor credit",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The vendor credit ID to update",
      },
      creditDate: {
        type: "string",
        description: "Date of the credit (YYYY-MM-DD format)",
      },
      referenceNumber: {
        type: "string",
        description: "Vendor credit reference number",
      },
      description: {
        type: "string",
        description: "Description or memo for the vendor credit",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { id, ...updateData } = args;
      const credit = await client.patch(`/vendor-credits/${id}`, updateData);
      return {
        success: true,
        data: credit,
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
 * Archive vendor credit
 */
export const archiveVendorCredit: Tool = {
  name: "archive_vendor_credit",
  description: "Archive a vendor credit (soft delete)",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The vendor credit ID to archive",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.post(`/vendor-credits/${args.id}/archive`);
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
