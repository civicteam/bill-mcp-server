/**
 * Tool Registry
 *
 * Central registry of all available Bill.com MCP tools
 */

import { BillClient } from "../bill-client.js";
import {
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
  archiveVendor,
  restoreVendor,
  getVendorBankAccount,
  createVendorBankAccount,
  deleteVendorBankAccount,
} from "./vendors.js";
import {
  listBills,
  getBill,
  createBill,
  updateBill,
  archiveBill,
  restoreBill,
} from "./bills.js";
import {
  listPayments,
  getPayment,
  createPayment,
  cancelPayment,
  voidPayment,
  getVendorPaymentOptions,
} from "./payments.js";
import {
  listInvoices,
  getInvoice,
  createInvoice,
  sendInvoice,
  updateInvoice,
  archiveInvoice,
  restoreInvoice,
  generateInvoicePaymentLink,
} from "./invoices.js";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
  listCustomerBankAccounts,
  createCustomerBankAccount,
  deleteCustomerBankAccount,
  setCustomerChargeAuthorization,
} from "./customers.js";
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
  approveBill,
  denyBill,
} from "./bill-approvals.js";
import {
  listRecurringInvoices,
  getRecurringInvoice,
  createRecurringInvoice,
  updateRecurringInvoice,
} from "./recurring-invoices.js";
import {
  listRecurringBills,
  getRecurringBill,
  createRecurringBill,
  updateRecurringBill,
  archiveRecurringBill,
  restoreRecurringBill,
} from "./recurring-bills.js";
import {
  listCreditMemos,
  getCreditMemo,
  createCreditMemo,
  updateCreditMemo,
  archiveCreditMemo,
  restoreCreditMemo,
} from "./credit-memos.js";
import {
  listReceivablePayments,
  getReceivablePayment,
  chargeCustomer,
} from "./receivable-payments.js";
import {
  listUserRoles,
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./users.js";
import {
  listDepartments,
  listLocations,
  listJobs,
  listEmployees,
  listItems,
  listAccountingClasses,
} from "./classifications.js";

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
 *
 * Tools marked with "(Full API Access)" require full API access with real
 * username/password credentials and are not available with sync tokens.
 */
export const tools: Tool[] = [
  // Vendors (AP)
  listVendors,
  getVendor,
  createVendor,
  updateVendor,
  archiveVendor,
  restoreVendor,
  getVendorBankAccount, // Full API Access
  createVendorBankAccount, // Full API Access
  deleteVendorBankAccount, // Full API Access

  // Bills (AP)
  listBills,
  getBill,
  createBill,
  updateBill,
  archiveBill,
  restoreBill,

  // Recurring Bills (AP)
  listRecurringBills,
  getRecurringBill,
  createRecurringBill,
  updateRecurringBill,
  archiveRecurringBill,
  restoreRecurringBill,

  // Payments (AP)
  listPayments,
  getPayment,
  createPayment,
  cancelPayment,
  voidPayment, // Full API Access
  getVendorPaymentOptions,

  // Customers (AR)
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  restoreCustomer,
  listCustomerBankAccounts, // Full API Access
  createCustomerBankAccount, // Full API Access
  deleteCustomerBankAccount, // Full API Access
  setCustomerChargeAuthorization, // Full API Access

  // Invoices (AR)
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  archiveInvoice,
  restoreInvoice,
  sendInvoice, // Full API Access
  generateInvoicePaymentLink,

  // Recurring Invoices (AR)
  listRecurringInvoices,
  getRecurringInvoice,
  createRecurringInvoice,
  updateRecurringInvoice,

  // Credit Memos (AR)
  listCreditMemos,
  getCreditMemo,
  createCreditMemo,
  updateCreditMemo,
  archiveCreditMemo,
  restoreCreditMemo,

  // Receivable Payments (AR)
  listReceivablePayments,
  getReceivablePayment,
  chargeCustomer, // Full API Access

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

  // Classifications (GL)
  listDepartments,
  listLocations,
  listJobs,
  listEmployees,
  listItems,
  listAccountingClasses,

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
  approveBill, // Full API Access
  denyBill, // Full API Access

  // Users
  listUserRoles,
  listUsers,
  getUser,
  createUser, // Full API Access
  updateUser, // Full API Access
  deleteUser, // Full API Access
];
