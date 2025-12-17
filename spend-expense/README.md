# Bill.com Spend & Expense MCP Server

An MCP (Model Context Protocol) server for Bill.com Spend & Expense API integration.

## Authentication

This server uses token-based authentication with a single API token passed in the header.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BILL_API_TOKEN` | Your Bill.com Spend & Expense API token | Yes |

## Available Tools

### Expense Reports
- `list_expense_reports` - List all expense reports
- `get_expense_report` - Get a specific expense report by ID

### Transactions
- `list_transactions` - List all transactions
- `get_transaction` - Get a specific transaction by ID

### Cards
- `list_cards` - List all cards
- `get_card` - Get a specific card by ID

### Employees
- `list_employees` - List all employees
- `get_employee` - Get a specific employee by ID

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

## Related

- [Bill.com AP/AR MCP Server](../ap-ar/README.md) - For accounts payable/receivable functionality
