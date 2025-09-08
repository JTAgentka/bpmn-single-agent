/**
 * Client-side utility for interacting with the Session Management API
 */

import { Session, UserContext, SessionData } from './types';

export class SessionClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/session') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new session
   */
  async createSession(user: UserContext, initialData?: SessionData): Promise<Session> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        user,
        data: initialData
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    const result = await response.json();
    return result.session;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const response = await fetch(`${this.baseUrl}?action=get&sessionId=${sessionId}`);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        sessionId,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update user context
   */
  async updateUserContext(sessionId: string, user: Partial<UserContext>): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateUser',
        sessionId,
        user
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update user context: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Set a specific data field
   */
  async setSessionData(sessionId: string, key: string, value: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'setData',
        sessionId,
        key,
        value
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to set session data: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * List sessions with optional filters
   */
  async listSessions(filters?: {
    userId?: string;
    status?: string;
  }): Promise<Session[]> {
    const params = new URLSearchParams({ action: 'list' });
    
    if (filters?.userId) {
      params.append('userId', filters.userId);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const response = await fetch(`${this.baseUrl}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to list sessions: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get session statistics
   */
  async getStatistics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}?action=stats`);

    if (!response.ok) {
      throw new Error(`Failed to get statistics: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Validate a session
   */
  async validateSession(sessionId: string): Promise<{ valid: boolean; reason?: string }> {
    const response = await fetch(`${this.baseUrl}?action=validate&sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to validate session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Refresh a session (reset expiration)
   */
  async refreshSession(sessionId: string): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'refresh',
        sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Extend session TTL
   */
  async extendSessionTTL(sessionId: string, additionalTime: number): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'extend',
        sessionId,
        additionalTime
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to extend session TTL: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}?sessionId=${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to terminate session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Backup a session
   */
  async backupSession(sessionId: string): Promise<string | null> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'backup',
        sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to backup session: ${response.statusText}`);
    }

    const result = await response.json();
    return result.backupFile;
  }

  /**
   * Restore a session from backup
   */
  async restoreSession(sessionId: string, backupFile: string): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'restore',
        sessionId,
        backupFile
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to restore session: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Cleanup expired sessions
   */
  async cleanup(): Promise<number> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cleanup'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to cleanup sessions: ${response.statusText}`);
    }

    const result = await response.json();
    return result.cleaned;
  }
}

// Export singleton instance for convenience
export const sessionClient = new SessionClient();