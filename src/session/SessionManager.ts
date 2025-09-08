import { SessionStorage } from './SessionStorage';
import { FileAdapter } from './FileAdapter';
import {
  Session,
  UserContext,
  SessionData,
  SessionStorageOptions,
  SessionQueryOptions,
  SessionUpdateResult
} from './types';

export interface SessionManagerOptions extends SessionStorageOptions {
  cleanupInterval?: number;
  maxSessions?: number;
  enableBackups?: boolean;
  backupInterval?: number;
}

export class SessionManager {
  private storage: SessionStorage;
  private fileAdapter: FileAdapter;
  private cleanupTimer?: NodeJS.Timeout;
  private backupTimer?: NodeJS.Timeout;
  private maxSessions: number;
  private enableBackups: boolean;

  constructor(options: SessionManagerOptions = {}) {
    this.storage = new SessionStorage(options);
    this.fileAdapter = new FileAdapter({
      baseDir: options.storageDir || 'sessions',
      createDirIfNotExists: true
    });
    
    this.maxSessions = options.maxSessions || 1000;
    this.enableBackups = options.enableBackups !== false;
    
    if (options.cleanupInterval) {
      this.startCleanupTimer(options.cleanupInterval);
    }
    
    if (this.enableBackups && options.backupInterval) {
      this.startBackupTimer(options.backupInterval);
    }
  }

  private startCleanupTimer(interval: number): void {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanup();
    }, interval);
  }

  private startBackupTimer(interval: number): void {
    this.backupTimer = setInterval(async () => {
      await this.backupAllSessions();
    }, interval);
  }

  public async createSession(
    user: UserContext,
    initialData?: SessionData
  ): Promise<Session> {
    const stats = this.storage.getStats();
    
    if (stats.totalSessions >= this.maxSessions) {
      await this.cleanup();
      
      const newStats = this.storage.getStats();
      if (newStats.totalSessions >= this.maxSessions) {
        throw new Error(`Maximum session limit (${this.maxSessions}) reached`);
      }
    }
    
    return await this.storage.create(user, initialData);
  }

  public async getSession(sessionId: string): Promise<Session | undefined> {
    const session = this.storage.get(sessionId);
    
    if (!session) {
      const loadResult = await this.storage.load(sessionId);
      if (loadResult.success && loadResult.session) {
        return loadResult.session;
      }
    }
    
    return session;
  }

  public async updateSession(
    sessionId: string,
    data: Partial<SessionData>
  ): Promise<SessionUpdateResult> {
    return await this.storage.update(sessionId, data);
  }

  public async updateUserContext(
    sessionId: string,
    userContext: Partial<UserContext>
  ): Promise<SessionUpdateResult> {
    return await this.storage.updateUser(sessionId, userContext);
  }

  public getSessionData(sessionId: string, key?: string): any {
    return this.storage.getData(sessionId, key);
  }

  public setSessionData(
    sessionId: string,
    key: string,
    value: any
  ): SessionUpdateResult {
    return this.storage.setData(sessionId, key, value);
  }

  public async terminateSession(sessionId: string): Promise<SessionUpdateResult> {
    if (this.enableBackups) {
      await this.backupSession(sessionId);
    }
    
    return await this.storage.terminate(sessionId);
  }

  public async querySessions(options: SessionQueryOptions = {}): Promise<Session[]> {
    return await this.storage.query(options);
  }

  public async findSessionsByUser(userId: string): Promise<Session[]> {
    return await this.storage.query({ userId });
  }

  public async getActiveSessions(): Promise<Session[]> {
    return await this.storage.query({ status: 'active' });
  }

  public async getExpiredSessions(): Promise<Session[]> {
    return await this.storage.query({ status: 'expired' });
  }

  public async refreshSession(sessionId: string): Promise<SessionUpdateResult> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    if (session.metadata.status === 'expired') {
      session.metadata.status = 'active';
    }
    
    session.metadata.updatedAt = new Date().toISOString();
    
    return await this.storage.save(sessionId);
  }

  public async extendSessionTTL(
    sessionId: string,
    additionalTime: number
  ): Promise<SessionUpdateResult> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };
    }
    
    session.metadata.ttl = (session.metadata.ttl || 0) + additionalTime;
    session.metadata.updatedAt = new Date().toISOString();
    
    return await this.storage.save(sessionId);
  }

  public async backupSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }
    
    const filename = `${sessionId}.json`;
    const exists = await this.fileAdapter.exists(filename);
    
    if (exists) {
      const backupName = await this.fileAdapter.createBackup(filename);
      await this.fileAdapter.cleanupOldBackups(filename, 5);
      return backupName;
    }
    
    return null;
  }

  public async backupAllSessions(): Promise<number> {
    const sessions = await this.storage.query();
    let backedUp = 0;
    
    for (const session of sessions) {
      const result = await this.backupSession(session.metadata.sessionId);
      if (result) backedUp++;
    }
    
    return backedUp;
  }

  public async restoreSession(
    sessionId: string,
    backupFilename: string
  ): Promise<SessionUpdateResult> {
    try {
      await this.fileAdapter.restore(backupFilename, `${sessionId}.json`);
      const loadResult = await this.storage.load(sessionId);
      
      if (loadResult.success && loadResult.session) {
        return {
          success: true,
          message: 'Session restored from backup',
          session: loadResult.session
        };
      }
      
      return {
        success: false,
        message: 'Failed to load restored session'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restore session',
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  public async cleanup(): Promise<number> {
    return await this.storage.cleanup();
  }

  public getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    terminatedSessions: number;
    memoryUsage: NodeJS.MemoryUsage;
  } {
    const stats = this.storage.getStats();
    const memoryUsage = process.memoryUsage();
    
    return {
      ...stats,
      memoryUsage
    };
  }

  public async destroy(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
    }
    
    await this.storage.destroy();
  }

  public async exportSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }
    
    return JSON.stringify(session, null, 2);
  }

  public async importSession(sessionData: string): Promise<Session> {
    const session: Session = JSON.parse(sessionData);
    
    const existingSession = await this.getSession(session.metadata.sessionId);
    if (existingSession) {
      await this.terminateSession(session.metadata.sessionId);
    }
    
    return await this.storage.create(session.user, session.data);
  }

  public async validateSession(sessionId: string): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }
    
    if (session.metadata.status === 'terminated') {
      return { valid: false, reason: 'Session is terminated' };
    }
    
    if (session.metadata.status === 'expired') {
      return { valid: false, reason: 'Session is expired' };
    }
    
    if (!session.user || !session.user.userId) {
      return { valid: false, reason: 'Invalid user context' };
    }
    
    return { valid: true };
  }
}