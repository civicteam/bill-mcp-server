# Bill.com Spend & Expense MCP Server

An MCP (Model Context Protocol) server for Bill.com Spend & Expense API integration.

## Authentication

This server uses token-based authentication with a single API token passed in the header.

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `BILL_API_TOKEN` | Your Bill.com Spend & Expense API token | Yes | - |
| `BILL_ENVIRONMENT` | API environment (`sandbox` or `production`) | No | `production` |

### API Endpoints

- **Sandbox**: `https://gateway.stage.bill.com/connect/v3`
- **Production**: `https://gateway.prod.bill.com/connect/v3`

## Available Tools

### Budgets
- `list_budgets` - List all budgets in the Spend & Expense account
- `get_budget` - Get a specific budget by ID

### Reimbursements
- `list_reimbursements` - List all reimbursement requests
- `get_reimbursement` - Get a specific reimbursement by ID

### Transactions
- `list_transactions` - List all transactions
- `get_transaction` - Get a specific transaction by ID

### Cards
- `list_cards` - List all cards
- `get_card` - Get a specific card by ID

### Users
- `list_users` - List all users in the Spend & Expense account
- `get_user` - Get a specific user by ID

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

## Docker

```bash
# Build the Docker image
docker build -t bill-spend-expense .

# Run the container
docker run -e BILL_API_TOKEN=your_token_here -e BILL_ENVIRONMENT=sandbox bill-spend-expense
```

## Related

- [Bill.com AP/AR MCP Server](../ap-ar/README.md) - For accounts payable/receivable functionality
