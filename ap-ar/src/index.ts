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

import { AuthType, BillConfig } from "./bill-client.js";

/**
 * Get Bill.com API configuration from environment variables
 *
 * Environment variables:
 * - BILL_DEV_KEY: Developer key from Bill.com (required)
 * - BILL_ENVIRONMENT: "sandbox" or "production" (default: production)
 * - BILL_AUTH_TYPE: "sync_token", "full_access", or "session_token" (default: sync_token)
 *
 * For sync_token and full_access auth:
 * - BILL_USERNAME: For sync_token: token name. For full_access: user email
 * - BILL_PASSWORD: For sync_token: token value. For full_access: user password
 * - BILL_ORGANIZATION_ID: Organization identifier
 *
 * For session_token auth (external auth handling):
 * - BILL_SESSION_TOKEN: Pre-authenticated session token from external system
 *
 * Auth type differences:
 * - sync_token: Limited access (read data, no payments/invoicing), 48-hour session
 * - full_access: Full access (all operations), 35-minute session
 * - session_token: Uses externally-provided token, no login performed
 */
function getBillConfig(): BillConfig {
  const devKey = process.env.BILL_DEV_KEY;
  const environment = process.env.BILL_ENVIRONMENT || "production";
  const authType = process.env.BILL_AUTH_TYPE || "sync_token";

  if (!devKey) {
    throw new Error("BILL_DEV_KEY environment variable is required.");
  }

  if (authType !== "sync_token" && authType !== "full_access" && authType !== "session_token") {
    throw new Error(
      `Invalid BILL_AUTH_TYPE: "${authType}". Must be "sync_token", "full_access", or "session_token".`
    );
  }

  // For session_token auth, only need the session token
  if (authType === "session_token") {
    const sessionToken = process.env.BILL_SESSION_TOKEN;
    if (!sessionToken) {
      throw new Error(
        "BILL_SESSION_TOKEN environment variable is required for session_token auth type."
      );
    }
    return {
      devKey,
      environment: environment as "sandbox" | "production",
      authType: authType as AuthType,
      sessionToken,
    };
  }

  // For sync_token and full_access, need login credentials
  const username = process.env.BILL_USERNAME;
  const password = process.env.BILL_PASSWORD;
  const organizationId = process.env.BILL_ORGANIZATION_ID;

  if (!username || !password || !organizationId) {
    throw new Error(
      "Bill.com credentials not found. Please set BILL_USERNAME, BILL_PASSWORD, and BILL_ORGANIZATION_ID environment variables."
    );
  }

  return {
    devKey,
    username,
    password,
    organizationId,
    environment: environment as "sandbox" | "production",
    authType: authType as AuthType,
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
  console.error(`[Bill.com MCP Server] Auth type: ${config.authType}`);

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
