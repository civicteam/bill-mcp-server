/**
 * Tool Registry
 *
 * Central registry of all available Bill.com MCP tools
 */

import { BillClient } from "../bill-client.js";
import { listVendors } from "./vendors.js";
import { listBills } from "./bills.js";
import { getAccountInfo } from "./account.js";

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any, client: BillClient) => Promise<any>;
}

/**
 * All available tools for Bill.com integration
 */
export const tools: Tool[] = [
  getAccountInfo,
  listVendors,
  listBills,
];
