export interface SessionMetadata {
  sessionId: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'expired' | 'terminated';
  ttl?: number;
}

export interface UserContext {
  userId: string;
  username?: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, any>;
}

export interface SessionData {
  [key: string]: any;
}

export interface SessionEvent {
  timestamp: string;
  type: 'created' | 'updated' | 'accessed' | 'expired' | 'terminated';
  description?: string;
  metadata?: Record<string, any>;
}

export interface Session {
  metadata: SessionMetadata;
  user: UserContext;
  data: SessionData;
  events: SessionEvent[];
}

export interface SessionStorageOptions {
  storageDir?: string;
  ttl?: number;
  autoSave?: boolean;
  encryptionKey?: string;
}

export interface SessionQueryOptions {
  userId?: string;
  status?: SessionMetadata['status'];
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
}

export type SessionUpdateResult = {
  success: boolean;
  message: string;
  session?: Session;
  error?: Error;
};

export type SessionLoadResult = {
  success: boolean;
  session?: Session;
  error?: Error;
};