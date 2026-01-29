/**
 * Document management tools
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams } from "./list-params.js";

/**
 * List documents
 */
export const listDocuments: Tool = {
  name: "list_documents",
  description:
    "List documents (attachments) with pagination. Documents can be attached to bills, invoices, and other records.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of documents to return per page (default: 50, max: 100)",
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
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page, sort } = args;

    try {
      const params = buildListParams({ max: limit, page, sort });
      const documents = await client.get("/documents", params);

      return {
        success: true,
        data: documents,
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
 * Get document details
 */
export const getDocument: Tool = {
  name: "get_document",
  description: "Get detailed information about a specific document by ID",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The document ID",
      },
    },
    required: ["id"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const document = await client.get(`/documents/${args.id}`);
      return {
        success: true,
        data: document,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
