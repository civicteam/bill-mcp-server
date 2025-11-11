/**
 * Account-related tools
 */

import { Tool } from "./index.js";
import { BillComClient } from "../billcom-client.js";

/**
 * Get account information
 */
export const getAccountInfo: Tool = {
  name: "get_account_info",
  description:
    "Get information about the current Bill.com account, including organization details and user permissions",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
  handler: async (args: any, client: BillComClient) => {
    // Note: This endpoint may need to be adjusted based on Bill.com's actual API
    // The exact endpoint for account info should be verified in their documentation
    try {
      const accountInfo = await client.get("/organization");
      return {
        success: true,
        data: accountInfo,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
