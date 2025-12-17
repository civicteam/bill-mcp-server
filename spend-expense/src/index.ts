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
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  // Expense Reports
  async listExpenseReports() {
    return this.request("GET", "/expense-reports");
  }

  async getExpenseReport(id: string) {
    return this.request("GET", `/expense-reports/${id}`);
  }

  // Transactions
  async listTransactions() {
    return this.request("GET", "/transactions");
  }

  async getTransaction(id: string) {
    return this.request("GET", `/transactions/${id}`);
  }

  // Cards
  async listCards() {
    return this.request("GET", "/cards");
  }

  async getCard(id: string) {
    return this.request("GET", `/cards/${id}`);
  }

  // Employees
  async listEmployees() {
    return this.request("GET", "/employees");
  }

  async getEmployee(id: string) {
    return this.request("GET", `/employees/${id}`);
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
        name: "list_expense_reports",
        description: "List all expense reports",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_expense_report",
        description: "Get a specific expense report by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The expense report ID",
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
        name: "list_employees",
        description: "List all employees",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_employee",
        description: "Get a specific employee by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The employee ID",
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
      case "list_expense_reports": {
        const result = await apiClient.listExpenseReports();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_expense_report": {
        const { id } = args as { id: string };
        const result = await apiClient.getExpenseReport(id);
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

      case "list_employees": {
        const result = await apiClient.listEmployees();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_employee": {
        const { id } = args as { id: string };
        const result = await apiClient.getEmployee(id);
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
