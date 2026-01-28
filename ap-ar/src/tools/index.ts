/**
 * Tool Registry
 *
 * Central registry of all available Bill.com MCP tools
 */

import { BillClient } from "../bill-client.js";
import { listVendors, getVendor, createVendor, updateVendor } from "./vendors.js";
import { listBills, getBill, createBill, updateBill } from "./bills.js";
import { listPayments, getPayment, createPayment, cancelPayment } from "./payments.js";
import { listInvoices, getInvoice, createInvoice, sendInvoice } from "./invoices.js";
import { listCustomers, getCustomer, createCustomer } from "./customers.js";
import { listBankAccounts, getBankAccount } from "./bank-accounts.js";
import {
  listChartOfAccounts,
  getChartOfAccount,
  createChartOfAccount,
  updateChartOfAccount,
  archiveChartOfAccount,
  restoreChartOfAccount,
} from "./chart-of-accounts.js";
import {
  listVendorCredits,
  getVendorCredit,
  createVendorCredit,
  updateVendorCredit,
  archiveVendorCredit,
} from "./vendor-credits.js";
import {
  listBillApprovalPolicies,
  createBillApprovalPolicy,
  updateBillApprovalPolicy,
  deleteBillApprovalPolicy,
  listPendingBillApprovals,
  approveDenyBill,
} from "./bill-approvals.js";

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
  // Vendors (AP)
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
  // Bills (AP)
  listBills,
  getBill,
  createBill,
  updateBill,
  // Payments (AP)
  listPayments,
  getPayment,
  createPayment,
  cancelPayment,
  // Customers (AR)
  listCustomers,
  getCustomer,
  createCustomer,
  // Invoices (AR)
  listInvoices,
  getInvoice,
  createInvoice,
  sendInvoice,
  // Bank Accounts
  listBankAccounts,
  getBankAccount,
  // Chart of Accounts (GL)
  listChartOfAccounts,
  getChartOfAccount,
  createChartOfAccount,
  updateChartOfAccount,
  archiveChartOfAccount,
  restoreChartOfAccount,
  // Vendor Credits (AP)
  listVendorCredits,
  getVendorCredit,
  createVendorCredit,
  updateVendorCredit,
  archiveVendorCredit,
  // Bill Approvals (AP)
  listBillApprovalPolicies,
  createBillApprovalPolicy,
  updateBillApprovalPolicy,
  deleteBillApprovalPolicy,
  listPendingBillApprovals,
  approveDenyBill,
];
