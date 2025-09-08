// Simple test script for Session Management
// Run with: node test-session.js

const { SessionManager } = require('./src/session/SessionManager');

async function testSessionManager() {
  console.log('=== Session Manager Test ===\n');
  
  // Initialize the session manager
  const manager = new SessionManager({
    storageDir: './test-sessions',
    ttl: 60000, // 1 minute for testing
    autoSave: true,
    maxSessions: 10
  });
  
  console.log('✓ Session Manager initialized\n');
  
  try {
    // Test 1: Create a new session
    console.log('Test 1: Creating a new session...');
    const session = await manager.createSession({
      userId: 'test_user_001',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user']
    }, {
      testData: 'initial value',
      counter: 0
    });
    
    console.log(`✓ Session created: ${session.metadata.sessionId}`);
    console.log(`  User: ${session.user.username}`);
    console.log(`  Status: ${session.metadata.status}\n`);
    
    const sessionId = session.metadata.sessionId;
    
    // Test 2: Update session data
    console.log('Test 2: Updating session data...');
    await manager.updateSession(sessionId, {
      counter: 1,
      newField: 'added field'
    });
    console.log('✓ Session data updated\n');
    
    // Test 3: Get session data
    console.log('Test 3: Getting session data...');
    const data = manager.getSessionData(sessionId);
    console.log('✓ Session data retrieved:');
    console.log(`  ${JSON.stringify(data, null, 2)}\n`);
    
    // Test 4: Set nested data
    console.log('Test 4: Setting nested data...');
    manager.setSessionData(sessionId, 'user.preferences.theme', 'dark');
    manager.setSessionData(sessionId, 'user.preferences.language', 'en');
    const theme = manager.getSessionData(sessionId, 'user.preferences.theme');
    console.log(`✓ Nested data set: theme = ${theme}\n`);
    
    // Test 5: Query sessions
    console.log('Test 5: Querying sessions...');
    const userSessions = await manager.findSessionsByUser('test_user_001');
    console.log(`✓ Found ${userSessions.length} session(s) for test_user_001\n`);
    
    // Test 6: Get statistics
    console.log('Test 6: Getting statistics...');
    const stats = manager.getStatistics();
    console.log('✓ Statistics:');
    console.log(`  Total sessions: ${stats.totalSessions}`);
    console.log(`  Active sessions: ${stats.activeSessions}`);
    console.log(`  Memory usage: ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)} MB\n`);
    
    // Test 7: Validate session
    console.log('Test 7: Validating session...');
    const validation = await manager.validateSession(sessionId);
    console.log(`✓ Session valid: ${validation.valid}`);
    if (!validation.valid) {
      console.log(`  Reason: ${validation.reason}`);
    }
    console.log('');
    
    // Test 8: Export session
    console.log('Test 8: Exporting session...');
    const exported = await manager.exportSession(sessionId);
    if (exported) {
      console.log('✓ Session exported successfully');
      console.log(`  Data length: ${exported.length} characters\n`);
    }
    
    // Test 9: Terminate session
    console.log('Test 9: Terminating session...');
    const result = await manager.terminateSession(sessionId);
    console.log(`✓ Session terminated: ${result.success}\n`);
    
    // Test 10: Final statistics
    console.log('Test 10: Final statistics...');
    const finalStats = manager.getStatistics();
    console.log('✓ Final Statistics:');
    console.log(`  Total sessions: ${finalStats.totalSessions}`);
    console.log(`  Active sessions: ${finalStats.activeSessions}`);
    console.log(`  Terminated sessions: ${finalStats.terminatedSessions}\n`);
    
    // Cleanup
    await manager.destroy();
    console.log('✓ Session manager destroyed');
    console.log('\n=== All tests passed! ===');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
testSessionManager().catch(console.error);