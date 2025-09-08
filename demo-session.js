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
      console.log(`✓ Created/verified directory: ${this.dir}`);
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
    
    const filepath = path.join(this.dir, `${id}.json`);
    await fs.writeFile(filepath, JSON.stringify(session, null, 2));
    console.log(`✓ Wrote session to: ${filepath}`);
    
    return session;
  }

  async get(id) {
    try {
      const filepath = path.join(this.dir, `${id}.json`);
      console.log(`✓ Reading from: ${filepath}`);
      const content = await fs.readFile(filepath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.log(`✗ File not found: ${id}.json`);
      return null;
    }
  }

  async update(id, data) {
    const session = await this.get(id);
    if (!session) return null;
    
    session.data = { ...session.data, ...data };
    session.updatedAt = new Date().toISOString();
    
    const filepath = path.join(this.dir, `${id}.json`);
    await fs.writeFile(filepath, JSON.stringify(session, null, 2));
    console.log(`✓ Updated: ${filepath}`);
    
    return session;
  }

  async list() {
    try {
      const files = await fs.readdir(this.dir);
      console.log(`✓ Found ${files.length} files in ${this.dir}`);
      return files.filter(f => f.endsWith('.json'));
    } catch {
      return [];
    }
  }
}

// Demo with step-by-step explanation
async function demo() {
  console.log('\n=== SESSION MANAGER DEMO ===\n');
  console.log('How it works:');
  console.log('1. Creates a "sessions" folder');
  console.log('2. Each session is saved as a JSON file');
  console.log('3. File name = session ID + .json');
  console.log('4. Read/write directly to these files\n');
  console.log('Starting demo...\n');
  
  const sessions = new SimpleSessionManager();
  
  // Wait for init
  await new Promise(r => setTimeout(r, 100));
  
  console.log('\n--- Step 1: Create Session ---');
  const session = await sessions.create('user123', {
    name: 'John Doe',
    preferences: { theme: 'dark' }
  });
  console.log('Session ID:', session.id);
  
  console.log('\n--- Step 2: List Files ---');
  const files = await sessions.list();
  console.log('Session files:', files);
  
  console.log('\n--- Step 3: Read Session ---');
  const retrieved = await sessions.get(session.id);
  console.log('Retrieved data:', retrieved.data);
  
  console.log('\n--- Step 4: Update Session ---');
  await sessions.update(session.id, {
    lastVisit: new Date().toISOString()
  });
  
  console.log('\n--- Step 5: Check File System ---');
  console.log('Let me show you the actual file...\n');
  
  // Show the actual file content
  const fileContent = await fs.readFile(
    path.join('./sessions', `${session.id}.json`),
    'utf8'
  );
  console.log('File content:');
  console.log(fileContent);
  
  console.log('\n=== DEMO COMPLETE ===\n');
  console.log('The session is stored as:');
  console.log(`  ./sessions/${session.id}.json`);
  console.log('\nYou can open this file in any text editor!');
}

// Run demo
demo().catch(console.error);