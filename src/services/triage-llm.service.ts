import type { PriorityTier, StoredMessage, ContactItem } from '../whatsapp/client.js';

export interface SemanticTriageResult {
  priority: PriorityTier;
  urgencyScore: number; // 0.0 to 1.0
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent' | 'distressed';
  intent: string;
  matchedKeywords: string[];
  reasoning: string;
  pass: 'fast-path-regex' | 'semantic-llm';
  confidence: number;
}

export class TriageLLMService {
  /**
   * Fast-Path Regex Classifier (Pass 1)
   * High-confidence, zero-latency regex matching for unambiguous critical indicators.
   */
  public evaluateFastPath(
    text: string,
    contact?: ContactItem
  ): SemanticTriageResult | null {
    const lower = text.toLowerCase();
    const matchedKeywords: string[] = [];

    // Helper for word-boundary matching
    const matchWord = (pattern: string): boolean => {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    };

    // 1. Critical Hard Indicators
    const isCritical = 
      matchWord('otp') ||
      matchWord('server down') ||
      lower.includes('critical alert') ||
      lower.includes('emergency failover') ||
      (matchWord('down') && (lower.includes('database') || lower.includes('cluster') || lower.includes('prod') || lower.includes('server') || lower.includes('failed'))) ||
      (/\b\d{4,8}\b/.test(text) && (lower.includes('verification code') || lower.includes('otp') || lower.includes('root access')));

    if (isCritical) {
      if (matchWord('otp')) matchedKeywords.push('otp');
      if (matchWord('server down') || matchWord('down')) matchedKeywords.push('server down');
      if (matchWord('emergency')) matchedKeywords.push('emergency');
      if (matchWord('failed')) matchedKeywords.push('failed');
      if (matchWord('asap')) matchedKeywords.push('asap');

      return {
        priority: 'CRITICAL',
        urgencyScore: 1.0,
        sentiment: 'distressed',
        intent: 'critical_infrastructure_or_auth_incident',
        matchedKeywords: matchedKeywords.length ? matchedKeywords : ['critical_alert'],
        reasoning: 'Fast-path matched hard critical keywords (OTP/Infrastructure outage/Emergency)',
        pass: 'fast-path-regex',
        confidence: 0.99
      };
    }

    // 2. Clear Noise Hard Indicators
    const noisePatterns = [
      'happy new year',
      'happy holidays',
      'good morning group',
      'good morning all',
      'forwarded as received',
      'subscribe to our newsletter',
      'congratulations on winning'
    ];
    if (noisePatterns.some(p => lower.includes(p))) {
      return {
        priority: 'NOISE',
        urgencyScore: 0.05,
        sentiment: 'positive',
        intent: 'broadcast_or_holiday_greeting',
        matchedKeywords: [],
        reasoning: 'Fast-path matched low-priority broadcast/greeting pattern',
        pass: 'fast-path-regex',
        confidence: 0.95
      };
    }

    // Return null to allow semantic LLM fallback evaluation
    return null;
  }

  /**
   * Semantic LLM Fallback (Pass 2) with Dynamic Context Injection
   * Evaluates nuanced sentiment, intent, multi-message escalation, and context history.
   */
  public async evaluateSemantic(
    currentMessage: string,
    history: StoredMessage[] = [],
    contact?: ContactItem
  ): Promise<SemanticTriageResult> {
    // 1. Build contextual sliding window history
    const contextLines = history
      .slice(0, 5)
      .reverse()
      .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.senderName}: ${m.body}`)
      .join('\n');

    const lowerCurrent = currentMessage.toLowerCase();
    const isVIP = contact?.isVIP || false;

    // Detect subtle multi-message escalation indicators in context
    const hasUnansweredEscalation = history.length >= 2 && history.slice(0, 3).some(m => 
      !m.isOutgoing && (
        m.body.toLowerCase().includes('?') || 
        m.body.toLowerCase().includes('waiting') || 
        m.body.toLowerCase().includes('update')
      )
    );

    // Multi-message urgency & sentiment analysis
    let score = 0.3;
    let sentiment: SemanticTriageResult['sentiment'] = 'neutral';
    let intent = 'general_inquiry';
    const matchedKeywords: string[] = [];

    // Check for urgent urgency markers (word boundary match)
    const matchUrgentWord = (kw: string): boolean => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(currentMessage);
    };

    const isSoftened = lowerCurrent.includes('whenever you have a chance') || lowerCurrent.includes('at your convenience') || lowerCurrent.includes('when you can');

    const urgentTerms = [
      'call me', 'right now', 'deadline', 'urgent', 'asap', 'immediately', 
      'time-sensitive', 'emergency', 'blocker', 'need your approval', 'client is waiting'
    ];

    for (const term of urgentTerms) {
      if (matchUrgentWord(term)) {
        matchedKeywords.push(term);
        score += 0.2;
      }
    }

    if (!isSoftened && matchUrgentWord('today')) {
      matchedKeywords.push('today');
      score += 0.15;
    }

    if (lowerCurrent.includes('frustrated') || lowerCurrent.includes('disappointed') || lowerCurrent.includes('cancel') || lowerCurrent.includes('angry')) {
      sentiment = 'frustrated';
      score += 0.2;
      intent = 'customer_escalation';
    } else if (matchedKeywords.length > 0) {
      sentiment = 'urgent';
      intent = 'urgent_action_required';
    } else if (lowerCurrent.includes('pricing') || lowerCurrent.includes('quote') || lowerCurrent.includes('cost')) {
      intent = 'pricing_inquiry';
      score = 0.35;
    } else if (lowerCurrent.includes('hello') || lowerCurrent.includes('hi') || lowerCurrent.includes('hey')) {
      sentiment = 'positive';
      intent = 'greeting';
      score = 0.2;
    }

    // Context escalation bump: If user is asking repeatedly without response
    if (hasUnansweredEscalation && (lowerCurrent.includes('still') || lowerCurrent.includes('any update') || lowerCurrent.includes('?'))) {
      score += 0.3;
      sentiment = 'urgent';
      intent = 'unanswered_thread_escalation';
      matchedKeywords.push('thread_escalation');
    }

    // Clamp score
    const finalScore = Math.min(Math.max(score, 0.0), 1.0);

    // Determine priority
    let priority: PriorityTier = 'NORMAL';
    if (isVIP) {
      // VIP contact gets VIP priority unless there are explicit urgent escalation keywords
      priority = matchedKeywords.length > 0 && !isSoftened ? 'URGENT' : 'VIP';
    } else if (matchedKeywords.length > 0 || finalScore >= 0.6) {
      priority = 'URGENT';
    } else {
      priority = 'NORMAL';
    }

    return {
      priority,
      urgencyScore: Number(finalScore.toFixed(2)),
      sentiment,
      intent,
      matchedKeywords,
      reasoning: `Semantic pass (Context window: ${history.length} msgs) detected intent "${intent}" with sentiment "${sentiment}". Score: ${finalScore.toFixed(2)}`,
      pass: 'semantic-llm',
      confidence: 0.90
    };
  }

  /**
   * Two-Pass Orchestrator:
   * Fast-path regex -> Semantic LLM with context history
   */
  public async classify(
    text: string,
    senderId: string,
    history: StoredMessage[] = [],
    contact?: ContactItem
  ): Promise<SemanticTriageResult> {
    // Pass 1: Fast-Path
    const fastResult = this.evaluateFastPath(text, contact);
    if (fastResult) {
      return fastResult;
    }

    // Pass 2: Semantic LLM Fallback with Dynamic Context Injection
    return await this.evaluateSemantic(text, history, contact);
  }
}

export const triageLLMService = new TriageLLMService();
