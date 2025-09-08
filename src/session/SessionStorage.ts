import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  Session,
  SessionMetadata,
  UserContext,
  SessionData,
  SessionEvent,
  SessionStorageOptions,
  SessionQueryOptions,
  SessionUpdateResult,
  SessionLoadResult
} from './types';

export class SessionStorage {
  private storageDir: string;
  private ttl: number;
  private autoSave: boolean;
  private encryptionKey?: string;
  private sessions: Map<string, Session>;
  private saveQueue: Set<string>;
  private saveTimer?: NodeJS.Timeout;

  constructor(options: SessionStorageOptions = {}) {
    this.storageDir = options.storageDir || path.join(process.cwd(), 'sessions');
    this.ttl = options.ttl || 3600000;
    this.autoSave = options.autoSave !== false;
    this.encryptionKey = options.encryptionKey;
    this.sessions = new Map();
    this.saveQueue = new Set();
    
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
    
    await this.loadExistingSessions();
    
    if (this.autoSave) {
      this.startAutoSave();
    }
  }

  private async loadExistingSessions(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      const sessionFiles = files.filter(f => f.endsWith('.json'));
      
      for (const file of sessionFiles) {
        const sessionId = path.basename(file, '.json');
        const result = await this.load(sessionId);
        if (result.success && result.session) {
          this.sessions.set(sessionId, result.session);
        }
      }
    } catch (error) {
      console.error('Error loading existing sessions:', error);
    }
  }

  private startAutoSave(): void {
    this.saveTimer = setInterval(() => {
      this.processSaveQueue();
    }, 5000);
  }

  private async processSaveQueue(): Promise<void> {
    const sessionIds = Array.from(this.saveQueue);
    this.saveQueue.clear();
    
    for (const sessionId of sessionIds) {
      const session = this.sessions.get(sessionId);
      if (session) {
        await this.persist(sessionId, session);
      }
    }
  }

  public generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) return data;
    
    const parts = data.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  public async create(user: UserContext, initialData?: SessionData): Promise<Session> {
    const sessionId = this.generateSessionId();
    const now = new Date().toISOString();
    
    const session: Session = {
      metadata: {
        sessionId,
        version: '1.0.0',
        createdAt: now,
        updatedAt: now,
        status: 'active',
        ttl: this.ttl
      },
      user,
      data: initialData || {},
      events: [
        {
          timestamp: now,
          type: 'created',
          description: 'Session created'
        }
      ]
    };
    
    this.sessions.set(sessionId, session);
    
    if (this.autoSave) {
      this.saveQueue.add(sessionId);
    } else {
      await this.persist(sessionId, session);
    }
    
    return session;
  }

  public async load(sessionId: string): Promise<SessionLoadResult> {
    try {
      const cached = this.sessions.get(sessionId);
      if (cached) {
        return { success: true, session: cached };
      }
      
      const filePath = path.join(this.storageDir, `${sessionId}.json`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      const decryptedContent = this.decrypt(fileContent);
      const session: Session = JSON.parse(decryptedContent);
      
      if (this.isExpired(session)) {
        session.metadata.status = 'expired';
        this.addEvent(session, 'expired', 'Session expired');
      }
      
      this.sessions.set(sessionId, session);
      
      return { success: true, session };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  public async save(sessionId: string): Promise<SessionUpdateResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    try {
      await this.persist(sessionId, session);
      return {
        success: true,
        message: 'Session saved successfully',
        session
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save session',
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  private async persist(sessionId: string, session: Session): Promise<void> {
    const filePath = path.join(this.storageDir, `${sessionId}.json`);
    const content = JSON.stringify(session, null, 2);
    const encryptedContent = this.encrypt(content);
    
    await fs.writeFile(filePath, encryptedContent, 'utf8');
  }

  public async update(
    sessionId: string,
    data: Partial<SessionData>
  ): Promise<SessionUpdateResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      const loadResult = await this.load(sessionId);
      if (!loadResult.success || !loadResult.session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }
    }
    
    const currentSession = this.sessions.get(sessionId)!;
    
    currentSession.data = {
      ...currentSession.data,
      ...data
    };
    
    currentSession.metadata.updatedAt = new Date().toISOString();
    this.addEvent(currentSession, 'updated', 'Session data updated');
    
    if (this.autoSave) {
      this.saveQueue.add(sessionId);
    } else {
      await this.persist(sessionId, currentSession);
    }
    
    return {
      success: true,
      message: 'Session updated successfully',
      session: currentSession
    };
  }

  public async updateUser(
    sessionId: string,
    userContext: Partial<UserContext>
  ): Promise<SessionUpdateResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    session.user = {
      ...session.user,
      ...userContext
    };
    
    session.metadata.updatedAt = new Date().toISOString();
    this.addEvent(session, 'updated', 'User context updated');
    
    if (this.autoSave) {
      this.saveQueue.add(sessionId);
    } else {
      await this.persist(sessionId, session);
    }
    
    return {
      success: true,
      message: 'User context updated successfully',
      session
    };
  }

  public get(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      this.addEvent(session, 'accessed', 'Session accessed');
      session.metadata.updatedAt = new Date().toISOString();
      
      if (this.autoSave) {
        this.saveQueue.add(sessionId);
      }
    }
    
    return session;
  }

  public getData(sessionId: string, key?: string): any {
    const session = this.sessions.get(sessionId);
    
    if (!session) return undefined;
    
    if (key) {
      return this.getNestedValue(session.data, key);
    }
    
    return session.data;
  }

  public setData(sessionId: string, key: string, value: any): SessionUpdateResult {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    this.setNestedValue(session.data, key, value);
    session.metadata.updatedAt = new Date().toISOString();
    this.addEvent(session, 'updated', `Data key '${key}' updated`);
    
    if (this.autoSave) {
      this.saveQueue.add(sessionId);
    }
    
    return {
      success: true,
      message: 'Data updated successfully',
      session
    };
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  public async terminate(sessionId: string): Promise<SessionUpdateResult> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    session.metadata.status = 'terminated';
    session.metadata.updatedAt = new Date().toISOString();
    this.addEvent(session, 'terminated', 'Session terminated');
    
    await this.persist(sessionId, session);
    this.sessions.delete(sessionId);
    
    return {
      success: true,
      message: 'Session terminated successfully'
    };
  }

  public async query(options: SessionQueryOptions = {}): Promise<Session[]> {
    const results: Session[] = [];
    
    for (const session of this.sessions.values()) {
      let matches = true;
      
      if (options.userId && session.user.userId !== options.userId) {
        matches = false;
      }
      
      if (options.status && session.metadata.status !== options.status) {
        matches = false;
      }
      
      if (options.createdAfter) {
        const createdAt = new Date(session.metadata.createdAt);
        if (createdAt < options.createdAfter) {
          matches = false;
        }
      }
      
      if (options.createdBefore) {
        const createdAt = new Date(session.metadata.createdAt);
        if (createdAt > options.createdBefore) {
          matches = false;
        }
      }
      
      if (matches) {
        results.push(session);
      }
      
      if (options.limit && results.length >= options.limit) {
        break;
      }
    }
    
    return results;
  }

  private isExpired(session: Session): boolean {
    if (session.metadata.status !== 'active') {
      return false;
    }
    
    const ttl = session.metadata.ttl || this.ttl;
    const updatedAt = new Date(session.metadata.updatedAt);
    const now = new Date();
    
    return (now.getTime() - updatedAt.getTime()) > ttl;
  }

  private addEvent(
    session: Session,
    type: SessionEvent['type'],
    description?: string
  ): void {
    session.events.push({
      timestamp: new Date().toISOString(),
      type,
      description
    });
    
    if (session.events.length > 100) {
      session.events = session.events.slice(-100);
    }
  }

  public async cleanup(): Promise<number> {
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isExpired(session) || session.metadata.status === 'terminated') {
        await this.terminate(sessionId);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  public async destroy(): Promise<void> {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }
    
    await this.processSaveQueue();
    
    this.sessions.clear();
    this.saveQueue.clear();
  }

  public getStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    terminatedSessions: number;
  } {
    let active = 0;
    let expired = 0;
    let terminated = 0;
    
    for (const session of this.sessions.values()) {
      switch (session.metadata.status) {
        case 'active':
          active++;
          break;
        case 'expired':
          expired++;
          break;
        case 'terminated':
          terminated++;
          break;
      }
    }
    
    return {
      totalSessions: this.sessions.size,
      activeSessions: active,
      expiredSessions: expired,
      terminatedSessions: terminated
    };
  }
}