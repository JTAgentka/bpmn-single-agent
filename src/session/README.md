# Session Management Tool

A comprehensive session management system for Node.js applications with file-based persistence, encryption support, and lifecycle management.

## Features

- **Session Creation & Management**: Create, update, and terminate user sessions
- **File-Based Persistence**: Automatic saving to disk with configurable intervals
- **Encryption Support**: Optional AES-256 encryption for session data
- **Lifecycle Management**: TTL support with automatic expiration handling
- **Query Capabilities**: Search sessions by user, status, or date range
- **Backup & Restore**: Automatic backups with configurable retention
- **Event Tracking**: Complete audit trail of session events
- **Performance Metrics**: Built-in statistics and monitoring

## Installation

```typescript
import { SessionManager } from './session';
```

## Basic Usage

### Initialize Session Manager

```typescript
import { SessionManager } from './session';

const sessionManager = new SessionManager({
  storageDir: './sessions',           // Storage directory
  ttl: 3600000,                       // Session TTL (1 hour)
  autoSave: true,                     // Auto-save changes
  encryptionKey: 'your-32-byte-key',  // Optional encryption
  cleanupInterval: 300000,            // Cleanup every 5 minutes
  maxSessions: 1000,                  // Maximum concurrent sessions
  enableBackups: true,                // Enable automatic backups
  backupInterval: 600000              // Backup every 10 minutes
});
```

### Create a Session

```typescript
const session = await sessionManager.createSession({
  userId: 'user123',
  username: 'john.doe',
  email: 'john@example.com',
  roles: ['user', 'admin'],
  permissions: ['read', 'write']
}, {
  // Initial session data
  theme: 'dark',
  language: 'en'
});

console.log('Session created:', session.metadata.sessionId);
```

### Get and Update Session

```typescript
// Get session
const session = await sessionManager.getSession(sessionId);

// Update session data
await sessionManager.updateSession(sessionId, {
  lastActivity: new Date().toISOString(),
  pageViews: 10
});

// Update specific data field
sessionManager.setSessionData(sessionId, 'user.preferences.theme', 'light');

// Get specific data field
const theme = sessionManager.getSessionData(sessionId, 'user.preferences.theme');
```

### Query Sessions

```typescript
// Find all sessions for a user
const userSessions = await sessionManager.findSessionsByUser('user123');

// Get all active sessions
const activeSessions = await sessionManager.getActiveSessions();

// Query with custom criteria
const recentSessions = await sessionManager.querySessions({
  status: 'active',
  createdAfter: new Date(Date.now() - 3600000),
  limit: 10
});
```

### Session Lifecycle

```typescript
// Refresh session (reset expiration)
await sessionManager.refreshSession(sessionId);

// Extend session TTL
await sessionManager.extendSessionTTL(sessionId, 1800000); // Add 30 minutes

// Validate session
const validation = await sessionManager.validateSession(sessionId);
if (!validation.valid) {
  console.log('Session invalid:', validation.reason);
}

// Terminate session
await sessionManager.terminateSession(sessionId);
```

### Backup and Restore

```typescript
// Backup single session
const backupFile = await sessionManager.backupSession(sessionId);

// Backup all sessions
const backedUpCount = await sessionManager.backupAllSessions();

// Restore from backup
await sessionManager.restoreSession(sessionId, backupFile);
```

### Export and Import

```typescript
// Export session data
const sessionJson = await sessionManager.exportSession(sessionId);

// Import session data
const importedSession = await sessionManager.importSession(sessionJson);
```

### Statistics and Monitoring

```typescript
// Get statistics
const stats = sessionManager.getStatistics();
console.log('Active sessions:', stats.activeSessions);
console.log('Total sessions:', stats.totalSessions);
console.log('Memory usage:', stats.memoryUsage.heapUsed);

// Cleanup expired sessions
const cleaned = await sessionManager.cleanup();
console.log('Cleaned sessions:', cleaned);
```

## Advanced Usage

### Custom Session Data Structure

```typescript
interface MySessionData {
  cart: {
    items: Array<{ id: string; quantity: number }>;
    total: number;
  };
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

const session = await sessionManager.createSession(
  { userId: 'user123' },
  {
    cart: { items: [], total: 0 },
    preferences: { theme: 'dark', notifications: true }
  } as MySessionData
);
```

### Event Tracking

Sessions automatically track events including:
- Session creation
- Data updates
- User context changes
- Session access
- Expiration
- Termination

Events are stored in `session.events` array with timestamps.

### File Adapter Direct Usage

```typescript
import { FileAdapter } from './session';

const fileAdapter = new FileAdapter({
  baseDir: './data',
  encoding: 'utf8',
  createDirIfNotExists: true
});

// Write file
await fileAdapter.write('config.json', JSON.stringify(config));

// Read file
const data = await fileAdapter.read('config.json');

// Check existence
const exists = await fileAdapter.exists('config.json');

// Create backup
const backupName = await fileAdapter.createBackup('config.json');

// Cleanup old backups
await fileAdapter.cleanupOldBackups('config.json', 3);
```

## API Reference

### SessionManager

- `createSession(user, data?)`: Create new session
- `getSession(sessionId)`: Get session by ID
- `updateSession(sessionId, data)`: Update session data
- `updateUserContext(sessionId, user)`: Update user context
- `getSessionData(sessionId, key?)`: Get session data
- `setSessionData(sessionId, key, value)`: Set session data
- `terminateSession(sessionId)`: Terminate session
- `querySessions(options)`: Query sessions
- `findSessionsByUser(userId)`: Find user sessions
- `getActiveSessions()`: Get active sessions
- `getExpiredSessions()`: Get expired sessions
- `refreshSession(sessionId)`: Refresh session TTL
- `extendSessionTTL(sessionId, time)`: Extend TTL
- `backupSession(sessionId)`: Backup session
- `restoreSession(sessionId, backup)`: Restore session
- `exportSession(sessionId)`: Export as JSON
- `importSession(data)`: Import from JSON
- `validateSession(sessionId)`: Validate session
- `cleanup()`: Clean expired sessions
- `getStatistics()`: Get statistics
- `destroy()`: Shutdown manager

### Session Structure

```typescript
interface Session {
  metadata: {
    sessionId: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'inactive' | 'expired' | 'terminated';
    ttl?: number;
  };
  user: {
    userId: string;
    username?: string;
    email?: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, any>;
  };
  data: Record<string, any>;
  events: Array<{
    timestamp: string;
    type: string;
    description?: string;
  }>;
}
```

## Best Practices

1. **Always use encryption** for sensitive data
2. **Set appropriate TTL** values based on your security requirements
3. **Enable auto-save** for better performance with periodic saves
4. **Configure cleanup intervals** to prevent memory leaks
5. **Use backups** for critical applications
6. **Monitor statistics** regularly for performance insights
7. **Validate sessions** before critical operations
8. **Handle errors** gracefully with try-catch blocks

## Error Handling

```typescript
try {
  const session = await sessionManager.createSession(user);
} catch (error) {
  if (error.message.includes('Maximum session limit')) {
    // Handle max sessions error
  } else {
    // Handle other errors
  }
}
```

## Cleanup

Always clean up resources when shutting down:

```typescript
process.on('SIGINT', async () => {
  await sessionManager.destroy();
  process.exit(0);
});
```