# Session Management Tool - Usage Guide

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Start the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## How It Works

The session management tool provides a comprehensive solution for managing user sessions with:
- **File-based persistence** - Sessions are stored as JSON files
- **API endpoints** - RESTful API for session operations
- **Client library** - Easy-to-use client for frontend integration
- **Automatic lifecycle management** - TTL, expiration, and cleanup

## Usage Examples

### Server-Side Usage (Node.js)

```typescript
import { SessionManager } from './src/session';

// Initialize the manager
const sessionManager = new SessionManager({
  storageDir: './sessions',
  ttl: 3600000, // 1 hour
  autoSave: true
});

// Create a session
const session = await sessionManager.createSession({
  userId: 'user123',
  username: 'john.doe',
  email: 'john@example.com'
}, {
  preferences: { theme: 'dark' }
});

// Update session data
await sessionManager.updateSession(session.metadata.sessionId, {
  lastActivity: new Date().toISOString()
});
```

### Client-Side Usage (Browser/React)

```typescript
import { sessionClient } from '@/session/client';

// Create a new session
const session = await sessionClient.createSession({
  userId: 'user123',
  username: 'john.doe'
});

// Update session data
await sessionClient.updateSession(session.metadata.sessionId, {
  cart: { items: [], total: 0 }
});

// Get session
const currentSession = await sessionClient.getSession(sessionId);

// Validate session
const { valid, reason } = await sessionClient.validateSession(sessionId);
```

### API Endpoints

The session management API is available at `/api/session` with the following endpoints:

#### GET Endpoints

- `GET /api/session?action=get&sessionId={id}` - Get a specific session
- `GET /api/session?action=list&userId={userId}` - List sessions for a user
- `GET /api/session?action=stats` - Get session statistics
- `GET /api/session?action=validate&sessionId={id}` - Validate a session

#### POST Endpoints

- `POST /api/session` with body:
  ```json
  {
    "action": "create",
    "user": { "userId": "123", "username": "john" },
    "data": { "initial": "data" }
  }
  ```

- `POST /api/session` with body:
  ```json
  {
    "action": "update",
    "sessionId": "abc123",
    "data": { "new": "data" }
  }
  ```

#### DELETE Endpoints

- `DELETE /api/session?sessionId={id}` - Terminate a session

## Testing

### Run the Test Script

```bash
node test-session.js
```

This will run through all the basic operations and verify the session manager is working correctly.

### Run TypeScript Examples

```bash
npm run test:session
```

## File Structure

```
bpmn-single-agent/
├── src/
│   └── session/
│       ├── types.ts           # TypeScript type definitions
│       ├── SessionStorage.ts  # Core storage implementation
│       ├── SessionManager.ts  # High-level session management
│       ├── FileAdapter.ts     # File system operations
│       ├── client.ts          # Client-side API wrapper
│       ├── index.ts           # Module exports
│       └── example.ts         # Usage examples
├── app/
│   └── api/
│       └── session/
│           └── route.ts       # Next.js API route
├── sessions/                  # Session storage directory (auto-created)
└── test-session.js           # Test script
```

## Key Features

1. **Session Creation & Management**
   - Create sessions with user context and initial data
   - Update session data and user information
   - Nested data access with dot notation

2. **Persistence & Backup**
   - Automatic file-based persistence
   - Optional encryption for sensitive data
   - Backup and restore capabilities

3. **Lifecycle Management**
   - Configurable TTL (Time-To-Live)
   - Automatic expiration handling
   - Session refresh and extension
   - Cleanup of expired sessions

4. **Query & Search**
   - Find sessions by user ID
   - Filter by status or date range
   - Get statistics and metrics

5. **API Integration**
   - RESTful API endpoints
   - Client library for easy integration
   - Error handling and validation

## Common Use Cases

### E-commerce Shopping Cart

```typescript
// Create session with cart
const session = await sessionManager.createSession(user, {
  cart: {
    items: [],
    total: 0,
    currency: 'USD'
  }
});

// Add item to cart
sessionManager.setSessionData(sessionId, 'cart.items', [
  ...currentItems,
  { id: 'product123', quantity: 1, price: 29.99 }
]);

// Update total
sessionManager.setSessionData(sessionId, 'cart.total', newTotal);
```

### User Preferences

```typescript
// Store user preferences
sessionManager.setSessionData(sessionId, 'preferences', {
  theme: 'dark',
  language: 'en',
  notifications: true,
  timezone: 'UTC'
});

// Get specific preference
const theme = sessionManager.getSessionData(sessionId, 'preferences.theme');
```

### Multi-step Forms

```typescript
// Track form progress
sessionManager.setSessionData(sessionId, 'form.step1', {
  completed: true,
  data: { name: 'John', email: 'john@example.com' }
});

sessionManager.setSessionData(sessionId, 'form.currentStep', 2);
sessionManager.setSessionData(sessionId, 'form.totalSteps', 5);
```

## Error Handling

Always wrap session operations in try-catch blocks:

```typescript
try {
  const session = await sessionManager.createSession(user);
} catch (error) {
  if (error.message.includes('Maximum session limit')) {
    // Handle max sessions error
    await sessionManager.cleanup();
    // Retry
  } else {
    console.error('Session error:', error);
  }
}
```

## Performance Tips

1. **Enable auto-save** for better performance with batch writes
2. **Set appropriate TTL** values based on your use case
3. **Configure cleanup intervals** to prevent memory buildup
4. **Use session caching** to reduce file I/O
5. **Enable compression** for large session data

## Security Considerations

1. **Never store sensitive data** like passwords or credit card numbers
2. **Use encryption** for production environments
3. **Implement proper authentication** before session creation
4. **Validate session ownership** before allowing updates
5. **Set reasonable TTL values** to limit exposure

## Troubleshooting

### Session not persisting
- Check that the storage directory has write permissions
- Verify auto-save is enabled or manually call `save()`

### Session expired unexpectedly
- Check TTL configuration
- Verify system time is correct
- Use `refreshSession()` to keep sessions active

### Maximum sessions reached
- Increase `maxSessions` limit
- Enable automatic cleanup
- Manually call `cleanup()` to remove expired sessions

## Support

For issues or questions about the session management tool, check:
- The example files in `src/session/example.ts`
- The test script `test-session.js`
- The API route implementation in `app/api/session/route.ts`