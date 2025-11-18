# Bill.com MCP Server

A Model Context Protocol (MCP) server for integrating Bill.com accounting and payment services with AI assistants like Claude.

## API Access Type

This server uses the **Bill.com AP/AR API** with session-based authentication using AP/AR Sync Tokens.

**Documentation**: [AP/AR Token-Based Sign In](https://developer.bill.com/docs/token-based-sign-in)

## Features

- **Vendor Management**: List and search vendors
- **Bill Operations**: View and manage bills (accounts payable)
- **Organization Info**: Access organization details
- **Session Management**: Automatic login and session refresh (48-hour sessions)

## Prerequisites

- Node.js 18 or higher
- Bill.com developer account with API access
- Bill.com AP/AR Sync Token and Developer Key from [app-sandbox.bill.com](https://app-sandbox.bill.com)

## Installation

```bash
# Clone the repository
cd bill-mcp-server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Bill.com credentials to .env
```

## Configuration

Create a `.env` file with your Bill.com AP/AR API credentials:

```env
# Required: Developer Key from Settings → Sync & Integrations → Manage Developer Keys
BILL_DEV_KEY=your_developer_key_here

# Required: AP/AR Sync Token name (the name you gave the token)
BILL_USERNAME=your_sync_token_name

# Required: AP/AR Sync Token value (the generated token)
BILL_PASSWORD=01ATROWTVVIYVZRO1774

# Required: Organization ID (starts with 008)
BILL_ORGANIZATION_ID=008xxxxx

# Optional: Environment (default: sandbox)
BILL_ENVIRONMENT=sandbox
```

### Getting Bill.com AP/AR API Credentials

#### Step 1: Get Developer Key
1. Sign in to the [Bill.com Sandbox](https://app-sandbox.bill.com/Login) with your developer account
2. Navigate to **Settings** → **Sync & Integrations** → **Manage Developer Keys**
3. Click **Add Developer Key** to generate a new key (you can have up to 4)
4. Copy the generated **Developer Key** (e.g., `01ATROWTVVIYVZRO1774`)
   - Use this as `BILL_DEV_KEY` in your configuration

#### Step 2: Create AP/AR Sync Token
1. From the same **Sync & Integrations** page, go to the **Tokens** section
2. Click **Create AP/AR Sync Token**
3. Enter a descriptive name for your token (e.g., `mcp-server-token`)
   - Use this name as `BILL_USERNAME` in your configuration
4. Click **Create** and copy the generated token value
   - Use this value as `BILL_PASSWORD` in your configuration
   - **Important**: Save this token immediately as it won't be shown again

#### Step 3: Find Organization ID
Your Organization ID is displayed on the **Sync & Integrations** page and starts with `008` (e.g., `00802UMJLLDINGYXdzke`)
- Use this as `BILL_ORGANIZATION_ID` in your configuration

#### Summary of Credentials Mapping
| Bill.com Portal | Environment Variable | Example |
|----------------|---------------------|---------|
| Developer Key | `BILL_DEV_KEY` | `01ATROWTVVIYVZRO1774` |
| Sync Token Name | `BILL_USERNAME` | `mcp-server-token` |
| Sync Token Value | `BILL_PASSWORD` | `02UMJ-LLDIN-GYXdz-...` |
| Organization ID | `BILL_ORGANIZATION_ID` | `00802UMJLLDINGYXdzke` |

**Reference**: [Bill.com AP/AR Token-Based Sign In Documentation](https://developer.bill.com/docs/token-based-sign-in)

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

### `list_vendors`

List all vendors in the account with optional filtering.

**Parameters**:
- `limit` (number, optional): Maximum number of vendors to return (default: 50, max: 100)
- `offset` (number, optional): Number of vendors to skip for pagination (default: 0)
- `name` (string, optional): Filter by vendor name
- `isActive` (boolean, optional): Filter by active status

**Example**:
```json
{
  "name": "list_vendors",
  "arguments": {
    "limit": 20,
    "isActive": true
  }
}
```

### `get_vendor`

Get detailed information about a specific vendor by ID.

**Parameters**:
- `id` (string, required): The vendor ID

**Example**:
```json
{
  "name": "get_vendor",
  "arguments": {
    "id": "vendor-123"
  }
}
```

### `list_bills`

List bills (accounts payable) with filtering options.

**Parameters**:
- `limit` (number, optional): Maximum number of bills to return (default: 50, max: 100)
- `offset` (number, optional): Number of bills to skip for pagination (default: 0)
- `status` (string, optional): Filter by status (`draft`, `open`, `scheduled`, `paid`, `void`)
- `vendorId` (string, optional): Filter by vendor ID
- `startDate` (string, optional): Filter by creation date (YYYY-MM-DD)
- `endDate` (string, optional): Filter by creation date (YYYY-MM-DD)

**Example**:
```json
{
  "name": "list_bills",
  "arguments": {
    "status": "open",
    "limit": 10
  }
}
```

### `get_bill`

Get detailed information about a specific bill by ID.

**Parameters**:
- `id` (string, required): The bill ID

**Example**:
```json
{
  "name": "get_bill",
  "arguments": {
    "id": "bill-123"
  }
}
```

### `list_payments`

List all payments with optional filtering.

**Parameters**:
- `limit` (number, optional): Maximum number of payments to return (default: 50, max: 100)
- `offset` (number, optional): Number of payments to skip for pagination (default: 0)
- `status` (string, optional): Filter by status (`scheduled`, `processing`, `completed`, `cancelled`, `failed`)
- `vendorId` (string, optional): Filter by vendor ID
- `startDate` (string, optional): Filter by creation date (YYYY-MM-DD)
- `endDate` (string, optional): Filter by creation date (YYYY-MM-DD)

### `get_payment`

Get detailed information about a specific payment by ID.

**Parameters**:
- `id` (string, required): The payment ID

### `create_payment`

Create a new payment for a vendor.

**Parameters**:
- `vendorId` (string, required): The vendor ID to pay
- `amount` (number, required): Payment amount
- `processDate` (string, required): Date to process the payment (YYYY-MM-DD)
- `description` (string, optional): Payment description or memo
- `billIds` (array, optional): Array of bill IDs to pay

### `cancel_payment`

Cancel a scheduled payment.

**Parameters**:
- `id` (string, required): The payment ID to cancel

### `list_customers`

List all customers with optional filtering.

**Parameters**:
- `limit` (number, optional): Maximum number of customers to return (default: 50, max: 100)
- `offset` (number, optional): Number of customers to skip for pagination (default: 0)
- `name` (string, optional): Filter by customer name
- `isActive` (boolean, optional): Filter by active status

### `get_customer`

Get detailed information about a specific customer by ID.

**Parameters**:
- `id` (string, required): The customer ID

### `create_customer`

Create a new customer in Bill.com.

**Parameters**:
- `name` (string, required): Customer name
- `email` (string, optional): Customer email address
- `phone` (string, optional): Customer phone number
- `address` (object, optional): Customer address with line1, line2, city, state, zip, country
- `taxId` (string, optional): Tax ID or EIN
- `isActive` (boolean, optional): Whether the customer is active (default: true)

### `list_invoices`

List all invoices with optional filtering.

**Parameters**:
- `limit` (number, optional): Maximum number of invoices to return (default: 50, max: 100)
- `offset` (number, optional): Number of invoices to skip for pagination (default: 0)
- `status` (string, optional): Filter by status (`draft`, `sent`, `viewed`, `partiallyPaid`, `paid`, `void`)
- `customerId` (string, optional): Filter by customer ID
- `startDate` (string, optional): Filter by creation date (YYYY-MM-DD)
- `endDate` (string, optional): Filter by creation date (YYYY-MM-DD)

### `get_invoice`

Get detailed information about a specific invoice by ID.

**Parameters**:
- `id` (string, required): The invoice ID

### `create_invoice`

Create a new invoice for a customer.

**Parameters**:
- `customerId` (string, required): The customer ID
- `invoiceDate` (string, required): Invoice date (YYYY-MM-DD)
- `dueDate` (string, required): Payment due date (YYYY-MM-DD)
- `lineItems` (array, required): Invoice line items with description, quantity, unitPrice, amount
- `invoiceNumber` (string, optional): Invoice number
- `description` (string, optional): Invoice description or memo

### `send_invoice`

Send an invoice to the customer via email.

**Parameters**:
- `id` (string, required): The invoice ID to send
- `emailMessage` (string, optional): Custom email message

## Roadmap

### Medium Priority Features (TODO)

#### Write Operations for Vendors & Bills
- [ ] `create_vendor` - Create a new vendor
- [ ] `update_vendor` - Update vendor details
- [ ] `create_bill` - Create a new bill
- [ ] `update_bill` - Update bill details

#### Bank Accounts
- [ ] `list_bank_accounts` - List all bank accounts
- [ ] `get_bank_account` - Get bank account details

All these endpoints use the same session-based authentication already implemented in the server.

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
