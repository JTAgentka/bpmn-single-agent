const fs = require('fs').promises;
const path = require('path');

/**
 * Simple session manager for chat/agent conversations
 * Each conversation gets its own JSON file to track context
 */
class ChatSession {
  constructor(sessionId = null) {
    this.sessionId = sessionId || `chat_${Date.now()}`;
    this.file = `./sessions/${this.sessionId}.json`;
    this.data = {
      id: this.sessionId,
      startedAt: new Date().toISOString(),
      messages: [],
      context: {},
      metadata: {}
    };
  }

  // Initialize or load existing session
  async init() {
    try {
      await fs.mkdir('./sessions', { recursive: true });
      
      // Try to load existing session
      const existing = await fs.readFile(this.file, 'utf8');
      this.data = JSON.parse(existing);
      console.log(`Resumed session: ${this.sessionId}`);
    } catch {
      // New session
      await this.save();
      console.log(`Started new session: ${this.sessionId}`);
    }
    return this;
  }

  // Add a message to the conversation
  async addMessage(role, content) {
    this.data.messages.push({
      role,  // 'user' or 'assistant'
      content,
      timestamp: new Date().toISOString()
    });
    await this.save();
  }

  // Store context data (like current task, state, etc)
  async setContext(key, value) {
    this.data.context[key] = value;
    this.data.updatedAt = new Date().toISOString();
    await this.save();
  }

  // Get context data
  getContext(key = null) {
    return key ? this.data.context[key] : this.data.context;
  }

  // Get conversation history
  getMessages(limit = null) {
    if (limit) {
      return this.data.messages.slice(-limit);
    }
    return this.data.messages;
  }

  // Get last message
  getLastMessage() {
    return this.data.messages[this.data.messages.length - 1];
  }

  // Save to file
  async save() {
    await fs.writeFile(this.file, JSON.stringify(this.data, null, 2));
  }

  // Get summary
  getSummary() {
    return {
      sessionId: this.sessionId,
      messageCount: this.data.messages.length,
      startedAt: this.data.startedAt,
      context: this.data.context
    };
  }
}

// Usage example for chat/agent
async function example() {
  // Start or resume a session
  const session = await new ChatSession('agent_001').init();
  
  // User asks something
  await session.addMessage('user', 'Create a BPMN diagram for customer onboarding');
  
  // Store what we're working on
  await session.setContext('currentTask', 'Creating BPMN diagram');
  await session.setContext('subprocess', 'customer_onboarding');
  await session.setContext('step', 1);
  
  // Assistant responds
  await session.addMessage('assistant', 'I\'ll create a BPMN diagram for customer onboarding...');
  
  // Track progress
  await session.setContext('filesCreated', ['customer_onboarding.bpmn']);
  await session.setContext('step', 2);
  
  // Get context anytime
  console.log('Current context:', session.getContext());
  
  // Get recent messages
  console.log('Last 2 messages:', session.getMessages(2));
  
  // Get summary
  console.log('Session summary:', session.getSummary());
}

// Export for use
module.exports = ChatSession;

// Run example if called directly
if (require.main === module) {
  example().catch(console.error);
}