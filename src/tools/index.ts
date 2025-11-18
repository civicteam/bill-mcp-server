/**
 * Tool Registry
 *
 * Central registry of all available Bill.com MCP tools
 */

import { BillClient } from "../bill-client.js";
import { listVendors, getVendor } from "./vendors.js";
import { listBills, getBill } from "./bills.js";

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
 * All available tools for Bill.com AP/AR API integration
 */
export const tools: Tool[] = [
  listVendors,
  getVendor,
  listBills,
  getBill,
];
