# Session Management

The Bill.com MCP server implements automatic session management to handle authentication with the Bill.com AP/AR API.

## Overview

The server uses **session-based authentication** with Bill.com's AP/AR API. Sessions are managed automatically and transparently - you don't need to manually handle login or session refresh.

## How It Works

### Automatic Session Creation

Sessions are created **lazily** - they are not created when the server starts, but only when the first API call is made.

```
Tool Call → API Request → Check Session → Login if needed → Execute Request
```

### Session Lifecycle

1. **First Request**: When any tool is called for the first time, the server automatically logs in to Bill.com and obtains a session ID
2. **Subsequent Requests**: The session ID is reused for all subsequent requests
3. **Session Expiration**: Sessions automatically refresh before expiring
4. **Error Recovery**: If a session becomes invalid, the server automatically re-authenticates

### Session Properties

- **Duration**: 48 hours (as specified by Bill.com for AP/AR Sync Tokens)
- **Refresh Buffer**: 5 minutes before expiration
- **Storage**: In-memory (sessions are not persisted across server restarts)

## Technical Details

### Session Flow

Every API request follows this flow:

```typescript
1. Tool handler calls client.get() / client.post() / etc.
2. API method calls getHeaders()
3. getHeaders() calls ensureSession()
4. ensureSession() checks:
   - Does session exist?
   - Is session still valid (not expiring in < 5 minutes)?

   If NO to either:
   - Call login() to get new session
   - Store sessionId and expiresAt timestamp

   If YES:
   - Reuse existing session

5. Return headers with sessionId
6. Execute the API request
```

### Session State

The session state is maintained in the `BillClient` class:

```typescript
private sessionId: string | null = null;
private sessionExpiresAt: number = 0;
```

### Session Validation

Before each API call, the session is validated:

```typescript
async ensureSession(): Promise<void> {
  const bufferMs = 5 * 60 * 1000;  // 5 minute buffer

  // Check if session exists and is not expired
  if (this.sessionId && Date.now() < this.sessionExpiresAt - bufferMs) {
    return;  // Session is valid, reuse it
  }

  // Session missing or expiring soon, login to get new session
  await this.login();
}
```

## Authentication Credentials

The server requires the following credentials to create sessions:

- `BILL_DEV_KEY`: Developer Key from Bill.com
- `BILL_USERNAME`: AP/AR Sync Token name
- `BILL_PASSWORD`: AP/AR Sync Token value
- `BILL_ORGANIZATION_ID`: Organization ID (starts with 008)

These credentials are provided via environment variables and used to obtain session tokens.

## Session Refresh

Sessions are automatically refreshed:

- **Proactive Refresh**: 5 minutes before expiration (at 47 hours 55 minutes)
- **On-Demand Refresh**: If session is missing or invalid
- **Transparent**: No user action required

## Multi-Pod Deployment (Kubernetes)

### Session Isolation

When running in Kubernetes with multiple pods, each pod maintains its own independent session:

```
User Request → Load Balancer → Pod 1 (Session A)
                            → Pod 2 (Session B)
                            → Pod 3 (Session C)
```

### Key Characteristics

- **No Session Sharing**: Sessions are stored in-memory and not shared between pods
- **Independent Sessions**: Each pod creates and maintains its own session with Bill.com
- **Separate Lifecycles**: Each pod's session has its own 48-hour lifecycle
- **No Coordination**: Pods do not coordinate or synchronize session state

### Implications

**Positive:**
- ✅ Simple architecture with no shared state
- ✅ No coordination overhead between pods
- ✅ Pod failures don't affect other pods' sessions
- ✅ Horizontal scaling works seamlessly

**Considerations:**
- Each pod makes its own login API call on first request
- Multiple concurrent sessions with Bill.com (one per pod)
- Session state is lost if a pod is terminated (new session created on next request)

### Example Scenario

With 3 pods serving the same user:

1. **First Request to Pod 1**: Creates Session A (expires Monday 2pm)
2. **First Request to Pod 2**: Creates Session B (expires Monday 3pm)
3. **First Request to Pod 3**: Creates Session C (expires Monday 4pm)

Each subsequent request to a pod reuses that pod's session until it expires.

### Recommendations

- **Single Pod**: Sufficient for most use cases
- **Multiple Pods**: Use when you need high availability or load distribution
- **Session Limits**: Be aware of any Bill.com API session limits per organization

## Related Documentation

- [Bill.com AP/AR Token-Based Sign In](https://developer.bill.com/docs/token-based-sign-in)
- [Bill.com API Reference](https://developer.bill.com/reference/api-reference-overview)
