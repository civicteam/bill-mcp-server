# Bill.com MCP Servers

This repository contains MCP (Model Context Protocol) servers for Bill.com API integrations.

## Structure

```
bill-mcp-server/
├── ap-ar/           # Accounts Payable & Receivable API
│   ├── src/
│   ├── package.json
│   └── README.md
└── spend-expense/   # Spend & Expense API
    ├── src/
    ├── package.json
    └── README.md
```

## Servers

### AP/AR Server (`ap-ar/`)

MCP server for Bill.com's Accounts Payable and Accounts Receivable API.

**Authentication:** Session-based with 4 credentials:
- `BILL_DEV_KEY`
- `BILL_USERNAME`
- `BILL_PASSWORD`
- `BILL_ORGANIZATION_ID`
- `BILL_ENVIRONMENT` (optional, default: `production`)

[Read more](./ap-ar/README.md)

### Spend & Expense Server (`spend-expense/`)

MCP server for Bill.com's Spend & Expense API.

**Authentication:** Single API token:
- `BILL_API_TOKEN`
- `BILL_ENVIRONMENT` (optional, default: `production`)

[Read more](./spend-expense/README.md)

## Development

Each server is an independent Node.js project. Navigate to the respective directory and follow the instructions in its README.

```bash
# For AP/AR server
cd ap-ar
npm install
npm run dev

# For Spend & Expense server
cd spend-expense
npm install
npm run dev
```
