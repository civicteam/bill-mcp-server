/**
 * Bill Approval management tools
 *
 * Note: With AP/AR sync token authentication, users can manage approval policies
 * and view pending approvals, but CANNOT approve/deny bills. The approve/deny
 * endpoint is included for completeness but will return an error with sync tokens.
 */

import { Tool } from "./index.js";
import { BillClient } from "../bill-client.js";
import { buildListParams } from "./list-params.js";

/**
 * List bill approval policies
 */
export const listBillApprovalPolicies: Tool = {
  name: "list_bill_approval_policies",
  description:
    "List bill approval policies. Policies define rules for when bills require approval before payment.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of policies to return per page (default: 50, max: 100)",
        default: 50,
      },
      page: {
        type: "string",
        description:
          "Cursor token for the next page of results (from the nextPage field in a previous response). Omit for the first page.",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page } = args;

    try {
      const params = buildListParams({ max: limit, page });
      const policies = await client.get("/bill-approvals/policies", params);

      return {
        success: true,
        data: policies,
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
 * Create bill approval policy
 */
export const createBillApprovalPolicy: Tool = {
  name: "create_bill_approval_policy",
  description:
    "Create a new bill approval policy. Policies define rules (e.g., amount thresholds) that trigger approval requirements.",
  inputSchema: {
    type: "object",
    properties: {
      policyName: {
        type: "string",
        description: "Name of the approval policy",
      },
      rules: {
        type: "array",
        description:
          "Array of rules that trigger this policy. Each rule has a key (field), op (operator), and values.",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description:
                "Field to evaluate (e.g., 'amount', 'vendorId')",
            },
            op: {
              type: "string",
              description:
                "Operator for comparison (e.g., 'gt', 'eq', 'in')",
            },
            values: {
              type: "array",
              description: "Values to compare against",
              items: {
                type: "string",
              },
            },
          },
          required: ["key", "op", "values"],
        },
      },
      approvers: {
        type: "array",
        description:
          "Array of user IDs who can approve bills matching this policy (user IDs start with '006')",
        items: {
          type: "string",
        },
      },
      minApprovers: {
        type: "number",
        description:
          "Minimum number of approvers required (default: 1)",
        default: 1,
      },
    },
    required: ["policyName", "rules", "approvers"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { rules, approvers, ...rest } = args;

      // Parse arrays if they arrive as JSON strings
      const parsedRules =
        typeof rules === "string" ? JSON.parse(rules) : rules;
      const parsedApprovers =
        typeof approvers === "string" ? JSON.parse(approvers) : approvers;

      const body: Record<string, unknown> = {
        ...rest,
        rules: parsedRules,
        approvers: parsedApprovers,
      };

      const policy = await client.post("/bill-approvals", body);
      return {
        success: true,
        data: policy,
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
 * Update bill approval policy
 */
export const updateBillApprovalPolicy: Tool = {
  name: "update_bill_approval_policy",
  description: "Update an existing bill approval policy",
  inputSchema: {
    type: "object",
    properties: {
      policyId: {
        type: "string",
        description: "The approval policy ID to update",
      },
      policyName: {
        type: "string",
        description: "Name of the approval policy",
      },
      rules: {
        type: "array",
        description: "Array of rules that trigger this policy",
        items: {
          type: "object",
          properties: {
            key: {
              type: "string",
              description: "Field to evaluate",
            },
            op: {
              type: "string",
              description: "Operator for comparison",
            },
            values: {
              type: "array",
              description: "Values to compare against",
              items: {
                type: "string",
              },
            },
          },
        },
      },
      approvers: {
        type: "array",
        description: "Array of user IDs who can approve bills",
        items: {
          type: "string",
        },
      },
      minApprovers: {
        type: "number",
        description: "Minimum number of approvers required",
      },
    },
    required: ["policyId"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { policyId, rules, approvers, ...rest } = args;

      const body: Record<string, unknown> = { ...rest };

      // Parse arrays if they arrive as JSON strings
      if (rules) {
        body.rules = typeof rules === "string" ? JSON.parse(rules) : rules;
      }
      if (approvers) {
        body.approvers =
          typeof approvers === "string" ? JSON.parse(approvers) : approvers;
      }

      const policy = await client.put(
        `/bill-approvals/policies/${policyId}`,
        body
      );
      return {
        success: true,
        data: policy,
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
 * Delete bill approval policy
 */
export const deleteBillApprovalPolicy: Tool = {
  name: "delete_bill_approval_policy",
  description: "Delete a bill approval policy",
  inputSchema: {
    type: "object",
    properties: {
      policyId: {
        type: "string",
        description: "The approval policy ID to delete",
      },
    },
    required: ["policyId"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const result = await client.delete(
        `/bill-approvals/policies/${args.policyId}`
      );
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

/**
 * List bills pending approval
 */
export const listPendingBillApprovals: Tool = {
  name: "list_pending_bill_approvals",
  description:
    "List bills that are pending approval for the current user. Shows bills waiting for the authenticated user to approve.",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of pending approvals to return per page (default: 50, max: 100)",
        default: 50,
      },
      page: {
        type: "string",
        description:
          "Cursor token for the next page of results (from the nextPage field in a previous response). Omit for the first page.",
      },
    },
    required: [],
  },
  handler: async (args: any, client: BillClient) => {
    const { limit, page } = args;

    try {
      const params = buildListParams({ max: limit, page });
      const pending = await client.get(
        "/bill-approvals/pending-user-approvals",
        params
      );

      return {
        success: true,
        data: pending,
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
 * Approve or deny a bill
 *
 * NOTE: This endpoint requires full credentials authentication (username/password).
 * It will return an error when using AP/AR sync token authentication.
 */
export const approveDenyBill: Tool = {
  name: "approve_deny_bill",
  description:
    "Approve or deny a bill that is pending approval. NOTE: This action requires full credentials authentication and will fail with sync token auth.",
  inputSchema: {
    type: "object",
    properties: {
      billId: {
        type: "string",
        description: "The bill ID to approve or deny (starts with '00n')",
      },
      action: {
        type: "string",
        description: "The action to take: 'APPROVE' or 'DENY'",
        enum: ["APPROVE", "DENY"],
      },
      comment: {
        type: "string",
        description: "Optional comment explaining the approval/denial decision",
      },
    },
    required: ["billId", "action"],
  },
  handler: async (args: any, client: BillClient) => {
    try {
      const { billId, action, comment } = args;

      const body: Record<string, unknown> = {
        billId,
        action,
      };
      if (comment) {
        body.comment = comment;
      }

      const result = await client.post("/bill-approvals/actions", body);
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
