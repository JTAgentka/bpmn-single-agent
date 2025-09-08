import { SessionManager } from './SessionManager';

async function main() {
  // Initialize session manager
  const sessionManager = new SessionManager({
    storageDir: './sessions',
    ttl: 3600000, // 1 hour
    autoSave: true,
    cleanupInterval: 300000, // 5 minutes
    maxSessions: 100,
    enableBackups: true
  });

  console.log('Session Manager initialized\n');

  // Create a new session
  const session = await sessionManager.createSession({
    userId: 'user_001',
    username: 'john.doe',
    email: 'john.doe@example.com',
    roles: ['user', 'admin']
  }, {
    theme: 'dark',
    language: 'en',
    lastLogin: new Date().toISOString()
  });

  console.log('Created session:', session.metadata.sessionId);
  console.log('User:', session.user.username);
  console.log('Initial data:', session.data);
  console.log('');

  const sessionId = session.metadata.sessionId;

  // Update session data
  await sessionManager.updateSession(sessionId, {
    pageViews: 1,
    lastActivity: new Date().toISOString()
  });
  console.log('Updated session data');

  // Set nested data
  sessionManager.setSessionData(sessionId, 'preferences.notifications', true);
  sessionManager.setSessionData(sessionId, 'preferences.emailAlerts', false);
  console.log('Set nested preferences');

  // Get specific data
  const notifications = sessionManager.getSessionData(sessionId, 'preferences.notifications');
  console.log('Notifications enabled:', notifications);
  console.log('');

  // Query sessions
  const userSessions = await sessionManager.findSessionsByUser('user_001');
  console.log('Found', userSessions.length, 'sessions for user_001');

  const activeSessions = await sessionManager.getActiveSessions();
  console.log('Active sessions:', activeSessions.length);
  console.log('');

  // Validate session
  const validation = await sessionManager.validateSession(sessionId);
  console.log('Session valid:', validation.valid);
  if (!validation.valid) {
    console.log('Reason:', validation.reason);
  }

  // Get statistics
  const stats = sessionManager.getStatistics();
  console.log('\nStatistics:');
  console.log('- Total sessions:', stats.totalSessions);
  console.log('- Active sessions:', stats.activeSessions);
  console.log('- Expired sessions:', stats.expiredSessions);
  console.log('- Memory usage:', Math.round(stats.memoryUsage.heapUsed / 1024 / 1024), 'MB');

  // Export session
  const exported = await sessionManager.exportSession(sessionId);
  if (exported) {
    console.log('\nExported session data (first 200 chars):');
    console.log(exported.substring(0, 200) + '...');
  }

  // Simulate activity and refresh
  setTimeout(async () => {
    await sessionManager.refreshSession(sessionId);
    console.log('\nSession refreshed');

    // Extend TTL
    await sessionManager.extendSessionTTL(sessionId, 1800000); // Add 30 minutes
    console.log('Extended session TTL by 30 minutes');

    // Create backup
    const backupFile = await sessionManager.backupSession(sessionId);
    if (backupFile) {
      console.log('Created backup:', backupFile);
    }

    // Cleanup expired sessions
    const cleaned = await sessionManager.cleanup();
    console.log('Cleaned up', cleaned, 'expired sessions');

    // Terminate session
    const result = await sessionManager.terminateSession(sessionId);
    console.log('\nSession terminated:', result.success);

    // Final statistics
    const finalStats = sessionManager.getStatistics();
    console.log('\nFinal Statistics:');
    console.log('- Total sessions:', finalStats.totalSessions);
    console.log('- Active sessions:', finalStats.activeSessions);

    // Cleanup
    await sessionManager.destroy();
    console.log('\nSession manager destroyed');
  }, 1000);
}

// Run example
main().catch(console.error);