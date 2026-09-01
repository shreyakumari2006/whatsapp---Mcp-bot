import { ConversationSession, eventBus } from '../bus.js';

export class ConversationStateManager {
  private sessions = new Map<string, ConversationSession>();

  /**
   * Get active, unexpired session for a contact JID
   */
  public getSession(contactJid: string): ConversationSession | null {
    const session = this.sessions.get(contactJid);
    if (!session) return null;

    // Check TTL expiration
    if (Date.now() > session.expiresAt) {
      this.deleteSession(contactJid, 'cancelled');
      return null;
    }

    return session;
  }

  /**
   * Start or update a conversation session
   */
  public setSession(
    contactJid: string,
    flowId: string,
    flowName: string,
    currentStep: string,
    contextData: Record<string, any> = {},
    ttlMinutes: number = 120,
    senderName?: string
  ): ConversationSession {
    const isNew = !this.sessions.has(contactJid);
    const existing = this.sessions.get(contactJid);

    const session: ConversationSession = {
      contactJid,
      senderName: senderName || existing?.senderName || contactJid,
      flowId,
      flowName,
      currentStep,
      contextData: { ...(existing?.contextData || {}), ...contextData },
      lastUpdated: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000
    };

    this.sessions.set(contactJid, session);

    if (isNew) {
      eventBus.emit('flow_started', session);
    }

    eventBus.emit('flow_state_change', {
      session,
      action: isNew ? 'started' : 'step_transition',
      timestamp: Date.now()
    });

    return session;
  }

  /**
   * Transition session to next step
   */
  public transitionStep(
    contactJid: string,
    nextStep: string,
    contextUpdates: Record<string, any> = {}
  ): ConversationSession | null {
    const session = this.getSession(contactJid);
    if (!session) return null;

    session.currentStep = nextStep;
    session.contextData = { ...session.contextData, ...contextUpdates };
    session.lastUpdated = Date.now();

    eventBus.emit('flow_state_change', {
      session,
      action: 'step_transition',
      timestamp: Date.now()
    });

    return session;
  }

  /**
   * Complete a conversation flow
   */
  public completeFlow(
    contactJid: string,
    finalResult: Record<string, any> = {}
  ): boolean {
    const session = this.sessions.get(contactJid);
    if (!session) return false;

    const mergedResult = { ...session.contextData, ...finalResult };

    eventBus.emit('flow_completed', {
      contactJid,
      flowId: session.flowId,
      flowName: session.flowName,
      result: mergedResult,
      timestamp: Date.now()
    });

    eventBus.emit('flow_state_change', {
      session: { ...session, contextData: mergedResult, currentStep: 'COMPLETED' },
      action: 'completed',
      timestamp: Date.now()
    });

    this.sessions.delete(contactJid);
    return true;
  }

  /**
   * Delete or cancel a session
   */
  public deleteSession(contactJid: string, reason: 'completed' | 'cancelled' = 'cancelled'): boolean {
    const session = this.sessions.get(contactJid);
    if (!session) return false;

    this.sessions.delete(contactJid);

    eventBus.emit('flow_state_change', {
      session,
      action: reason,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Get all active sessions
   */
  public getAllActiveSessions(): ConversationSession[] {
    const now = Date.now();
    const active: ConversationSession[] = [];

    for (const [jid, session] of this.sessions.entries()) {
      if (now <= session.expiresAt) {
        active.push(session);
      } else {
        this.sessions.delete(jid);
      }
    }

    return active;
  }

  /**
   * Clear all sessions
   */
  public clearAll() {
    this.sessions.clear();
  }
}

export const conversationStateManager = new ConversationStateManager();
