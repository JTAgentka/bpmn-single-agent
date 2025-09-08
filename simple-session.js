const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SimpleSessionManager {
  constructor(dir = './sessions') {
    this.dir = dir;
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dir, { recursive: true });
    } catch {}
  }

  generateId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async create(userId, data = {}) {
    const id = this.generateId();
    const session = {
      id,
      userId,
      createdAt: new Date().toISOString(),
      data
    };
    
    await fs.writeFile(
      path.join(this.dir, `${id}.json`),
      JSON.stringify(session, null, 2)
    );
    
    return session;
  }

  async get(id) {
    try {
      const content = await fs.readFile(
        path.join(this.dir, `${id}.json`),
        'utf8'
      );
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async update(id, data) {
    const session = await this.get(id);
    if (!session) return null;
    
    session.data = { ...session.data, ...data };
    session.updatedAt = new Date().toISOString();
    
    await fs.writeFile(
      path.join(this.dir, `${id}.json`),
      JSON.stringify(session, null, 2)
    );
    
    return session;
  }

  async delete(id) {
    try {
      await fs.unlink(path.join(this.dir, `${id}.json`));
      return true;
    } catch {
      return false;
    }
  }

  async list() {
    try {
      const files = await fs.readdir(this.dir);
      const sessions = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(
            path.join(this.dir, file),
            'utf8'
          );
          sessions.push(JSON.parse(content));
        }
      }
      
      return sessions;
    } catch {
      return [];
    }
  }
}

// Usage example
async function example() {
  const sessions = new SimpleSessionManager();
  
  // Create session
  const session = await sessions.create('user123', {
    theme: 'dark',
    cart: []
  });
  console.log('Created:', session);
  
  // Update session
  await sessions.update(session.id, {
    cart: ['item1', 'item2']
  });
  
  // Get session
  const updated = await sessions.get(session.id);
  console.log('Updated:', updated);
  
  // List all sessions
  const all = await sessions.list();
  console.log('All sessions:', all.length);
  
  // Delete session
  await sessions.delete(session.id);
  console.log('Deleted');
}

// Run example
example().catch(console.error);

module.exports = SimpleSessionManager;