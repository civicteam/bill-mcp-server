#!/usr/bin/env node

/**
 * Bill.com MCP Server
 *
 * This server provides MCP (Model Context Protocol) integration with Bill.com API,
 * allowing AI assistants to interact with Bill.com accounting and payment services.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BillClient } from "./bill-client.js";
import { tools } from "./tools/index.js";

/**
 * Get Bill.com API configuration from environment variables
 */
function getBillConfig() {
  const devKey = process.env.BILL_DEV_KEY;
  const username = process.env.BILL_USERNAME;
  const password = process.env.BILL_PASSWORD;
  const organizationId = process.env.BILL_ORGANIZATION_ID;
  const environment = process.env.BILL_ENVIRONMENT || "sandbox";

  if (!devKey || !username || !password || !organizationId) {
    throw new Error(
      "Bill.com credentials not found. Please set BILL_DEV_KEY, BILL_USERNAME, BILL_PASSWORD, and BILL_ORGANIZATION_ID environment variables."
    );
  }

  return {
    devKey,
    username,
    password,
    organizationId,
    environment: environment as "sandbox" | "production",
  };
}

/**
 * Main server initialization
 */
async function main() {
  console.error("[Bill.com MCP Server] Starting...");

  // Get configuration
  const config = getBillConfig();
  console.error(`[Bill.com MCP Server] Environment: ${config.environment}`);

  // Initialize Bill.com API client
  const billClient = new BillClient(config);

  // Create MCP server
  const server = new Server(
    {
      name: "bill-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("[Bill.com MCP Server] Listing available tools");
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[Bill.com MCP Server] Tool called: ${name}`);

    const tool = tools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await tool.handler(args, billClient);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Bill.com MCP Server] Tool execution error:`, errorMessage);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: errorMessage,
            }),
          },
        ],
        isError: true,
      };
    }
  });

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Bill.com MCP Server] Server started successfully");
}

// Run the server
main().catch((error) => {
  console.error("[Bill.com MCP Server] Fatal error:", error);
  process.exit(1);
});
