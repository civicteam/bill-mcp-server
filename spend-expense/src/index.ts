#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Environment variable for API token authentication
const BILL_API_TOKEN = process.env.BILL_API_TOKEN;
const API_BASE_URL = "https://gateway.stage.bill.com/connect/v3";

// API client for Bill.com Spend & Expense
class BillSpendExpenseClient {
  private apiToken: string;
  private baseUrl: string;

  constructor(apiToken: string, baseUrl: string = API_BASE_URL) {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        apiToken: this.apiToken,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // Budgets
  async listBudgets() {
    return this.request("GET", "/spend/budgets");
  }

  async getBudget(id: string) {
    return this.request("GET", `/spend/budgets/${id}`);
  }

  // Reimbursements
  async listReimbursements() {
    return this.request("GET", "/spend/reimbursements");
  }

  async getReimbursement(id: string) {
    return this.request("GET", `/spend/reimbursements/${id}`);
  }

  // Transactions
  async listTransactions() {
    return this.request("GET", "/spend/transactions");
  }

  async getTransaction(id: string) {
    return this.request("GET", `/spend/transactions/${id}`);
  }

  // Cards
  async listCards() {
    return this.request("GET", "/spend/cards");
  }

  async getCard(id: string) {
    return this.request("GET", `/spend/cards/${id}`);
  }

  // Users
  async listUsers() {
    return this.request("GET", "/spend/users");
  }

  async getUser(id: string) {
    return this.request("GET", `/spend/users/${id}`);
  }
}

// Create server instance
const server = new Server(
  {
    name: "bill-spend-expense-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize client (will be set when token is available)
let client: BillSpendExpenseClient | null = null;

function getClient(): BillSpendExpenseClient {
  if (!client) {
    if (!BILL_API_TOKEN) {
      throw new Error("BILL_API_TOKEN environment variable is required");
    }
    client = new BillSpendExpenseClient(BILL_API_TOKEN);
  }
  return client;
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_budgets",
        description: "List all budgets in the Spend & Expense account",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_budget",
        description: "Get a specific budget by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The budget ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_reimbursements",
        description: "List all reimbursement requests",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_reimbursement",
        description: "Get a specific reimbursement by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The reimbursement ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_transactions",
        description: "List all transactions",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_transaction",
        description: "Get a specific transaction by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The transaction ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_cards",
        description: "List all cards",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_card",
        description: "Get a specific card by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The card ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_users",
        description: "List all users in the Spend & Expense account",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_user",
        description: "Get a specific user by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The user ID",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const apiClient = getClient();

    switch (name) {
      case "list_budgets": {
        const result = await apiClient.listBudgets();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_budget": {
        const { id } = args as { id: string };
        const result = await apiClient.getBudget(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_reimbursements": {
        const result = await apiClient.listReimbursements();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_reimbursement": {
        const { id } = args as { id: string };
        const result = await apiClient.getReimbursement(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_transactions": {
        const result = await apiClient.listTransactions();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_transaction": {
        const { id } = args as { id: string };
        const result = await apiClient.getTransaction(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_cards": {
        const result = await apiClient.listCards();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_card": {
        const { id } = args as { id: string };
        const result = await apiClient.getCard(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_users": {
        const result = await apiClient.listUsers();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_user": {
        const { id } = args as { id: string };
        const result = await apiClient.getUser(id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Bill.com Spend & Expense MCP server running on stdio");
}

main().catch(console.error);
