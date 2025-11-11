# Bill.com MCP Server

A Model Context Protocol (MCP) server for integrating Bill.com accounting and payment services with AI assistants like Claude.

## Features

- **Vendor Management**: List and search vendors
- **Bill Operations**: View and manage bills (accounts payable)
- **Account Info**: Access organization and user details
- **API Token Authentication**: Secure authentication using Bill.com API tokens

## Prerequisites

- Node.js 18 or higher
- Bill.com account with API access
- Bill.com API token from [developer.bill.com](https://developer.bill.com)

## Installation

```bash
# Clone the repository
cd bill-mcp-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Bill.com API token to .env
```

## Configuration

Create a `.env` file with your Bill.com API credentials:

```env
# Required: Your Bill.com API token
BILL_API_TOKEN=your_api_token_here

# Optional: Environment (default: sandbox)
BILL_ENVIRONMENT=sandbox
```

### Getting a Bill.com API Token

1. Visit [developer.bill.com](https://developer.bill.com)
2. Sign up for a developer account
3. Create an application
4. Generate an API token for either:
   - **Sandbox** (for testing): Use `sandbox` environment
   - **Production** (for live data): Use `production` environment

## Usage

### Development

```bash
# Run in development mode with auto-reload
npm run dev
```

### Production

```bash
# Build the TypeScript code
npm run build

# Run the compiled server
npm start
```

### Docker

```bash
# Build the Docker image
docker build -t bill-mcp-server .

# Run the container
docker run -e BILL_API_TOKEN=your_token_here bill-mcp-server
```

## Available Tools

### `get_account_info`

Get information about the current Bill.com account.

**Parameters**: None

**Example**:
```json
{
  "name": "get_account_info",
  "arguments": {}
}
```

### `list_vendors`

List all vendors in the account with optional filtering.

**Parameters**:
- `page` (number, optional): Page number (default: 1)
- `page_size` (number, optional): Results per page (default: 50, max: 100)
- `name` (string, optional): Filter by vendor name
- `active` (boolean, optional): Filter by active status

**Example**:
```json
{
  "name": "list_vendors",
  "arguments": {
    "page": 1,
    "page_size": 20,
    "active": true
  }
}
```

### `list_bills`

List bills (accounts payable) with filtering options.

**Parameters**:
- `page` (number, optional): Page number (default: 1)
- `page_size` (number, optional): Results per page (default: 50, max: 100)
- `status` (string, optional): Filter by status (`draft`, `open`, `scheduled`, `paid`, `void`)
- `vendor_id` (string, optional): Filter by vendor ID
- `start_date` (string, optional): Filter by creation date (YYYY-MM-DD)
- `end_date` (string, optional): Filter by creation date (YYYY-MM-DD)

**Example**:
```json
{
  "name": "list_bills",
  "arguments": {
    "status": "open",
    "page_size": 10
  }
}
```

## Integration with Claude Desktop

Add this server to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bill-com": {
      "command": "node",
      "args": ["/path/to/bill-mcp-server/dist/index.js"],
      "env": {
        "BILL_API_TOKEN": "your_token_here",
        "BILL_ENVIRONMENT": "sandbox"
      }
    }
  }
}
```

## Development

### Project Structure

```
bill-mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── billcom-client.ts     # Bill.com API client
│   └── tools/
│       ├── index.ts          # Tool registry
│       ├── account.ts        # Account-related tools
│       ├── vendors.ts        # Vendor management tools
│       └── bills.ts          # Bill management tools
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### Adding New Tools

1. Create a new file in `src/tools/` (e.g., `invoices.ts`)
2. Define your tool following the `Tool` interface
3. Export the tool and add it to `src/tools/index.ts`

Example:

```typescript
// src/tools/invoices.ts
import { Tool } from "./index.js";
import { BillComClient } from "../billcom-client.js";

export const listInvoices: Tool = {
  name: "list_invoices",
  description: "List all invoices (accounts receivable)",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["draft", "sent", "paid"],
      },
    },
  },
  handler: async (args, client) => {
    const invoices = await client.get("/invoices", args);
    return { success: true, data: invoices };
  },
};
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with tsx
- `npm run watch` - Watch for changes and recompile
- `npm start` - Run the compiled server
- `npm run lint` - Lint the code with ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Type-check without emitting files

## Bill.com API Documentation

For more information about the Bill.com API:

- [Bill.com Developer Portal](https://developer.bill.com)
- [API Reference](https://developer.bill.com/reference/api-reference-overview)
- [Authentication Guide](https://developer.bill.com/docs/authentication-with-api-token)

## Troubleshooting

### "API token not found" error

Make sure you have set the `BILL_API_TOKEN` environment variable in your `.env` file or in your system environment.

### Authentication failures

- Verify your API token is correct
- Check that you're using the correct environment (sandbox vs production)
- Ensure your token hasn't expired

### Connection issues

- Check your internet connection
- Verify Bill.com API is accessible
- Check if you're behind a proxy or firewall

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
