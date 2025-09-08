import { NextRequest, NextResponse } from 'next/server';
import { SessionManager } from '@/session';

let sessionManager: SessionManager;

function getSessionManager() {
  if (!sessionManager) {
    sessionManager = new SessionManager({
      storageDir: './sessions',
      ttl: 3600000,
      autoSave: true,
      cleanupInterval: 300000,
      maxSessions: 1000,
      enableBackups: true
    });
  }
  return sessionManager;
}

export async function GET(request: NextRequest) {
  try {
    const manager = getSessionManager();
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const sessionId = searchParams.get('sessionId');

    switch (action) {
      case 'get':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const session = await manager.getSession(sessionId);
        if (!session) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }
        return NextResponse.json(session);

      case 'list':
        const userId = searchParams.get('userId');
        const status = searchParams.get('status');
        const sessions = await manager.querySessions({
          userId: userId || undefined,
          status: status as any || undefined
        });
        return NextResponse.json(sessions);

      case 'stats':
        const stats = manager.getStatistics();
        return NextResponse.json(stats);

      case 'validate':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const validation = await manager.validateSession(sessionId);
        return NextResponse.json(validation);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session API GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const manager = getSessionManager();
    const body = await request.json();
    const { action, sessionId, data, user } = body;

    switch (action) {
      case 'create':
        if (!user || !user.userId) {
          return NextResponse.json({ error: 'User context required' }, { status: 400 });
        }
        const newSession = await manager.createSession(user, data);
        return NextResponse.json({
          success: true,
          session: newSession
        });

      case 'update':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const updateResult = await manager.updateSession(sessionId, data || {});
        return NextResponse.json(updateResult);

      case 'updateUser':
        if (!sessionId || !user) {
          return NextResponse.json({ error: 'Session ID and user context required' }, { status: 400 });
        }
        const userUpdateResult = await manager.updateUserContext(sessionId, user);
        return NextResponse.json(userUpdateResult);

      case 'setData':
        if (!sessionId || !body.key) {
          return NextResponse.json({ error: 'Session ID and key required' }, { status: 400 });
        }
        const setDataResult = manager.setSessionData(sessionId, body.key, body.value);
        return NextResponse.json(setDataResult);

      case 'refresh':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const refreshResult = await manager.refreshSession(sessionId);
        return NextResponse.json(refreshResult);

      case 'extend':
        if (!sessionId || !body.additionalTime) {
          return NextResponse.json({ error: 'Session ID and additional time required' }, { status: 400 });
        }
        const extendResult = await manager.extendSessionTTL(sessionId, body.additionalTime);
        return NextResponse.json(extendResult);

      case 'terminate':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const terminateResult = await manager.terminateSession(sessionId);
        return NextResponse.json(terminateResult);

      case 'backup':
        if (!sessionId) {
          return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }
        const backupFile = await manager.backupSession(sessionId);
        return NextResponse.json({
          success: true,
          backupFile
        });

      case 'restore':
        if (!sessionId || !body.backupFile) {
          return NextResponse.json({ error: 'Session ID and backup file required' }, { status: 400 });
        }
        const restoreResult = await manager.restoreSession(sessionId, body.backupFile);
        return NextResponse.json(restoreResult);

      case 'cleanup':
        const cleanedCount = await manager.cleanup();
        return NextResponse.json({
          success: true,
          cleaned: cleanedCount
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Session API POST error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const manager = getSessionManager();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const result = await manager.terminateSession(sessionId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Session API DELETE error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}