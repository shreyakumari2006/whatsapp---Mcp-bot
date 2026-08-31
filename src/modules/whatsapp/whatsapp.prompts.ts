import { PromptDecorator as Prompt, ControllerDecorator as Controller, ExecutionContext } from '@nitrostack/core';
import { whatsappEngine } from '../../whatsapp/client.js';

@Controller()
export class WhatsAppPrompts {
  @Prompt({
    name: 'urgency_triage_assistant',
    description: 'Two-pass zero-shot hybrid triage assistant evaluating message priority, sentiment, intent, and multi-message escalations.',
    arguments: [
      { name: 'chatId', description: 'The chat identifier to analyze', required: false },
      { name: 'currentMessage', description: 'The incoming message body to evaluate', required: false },
      { name: 'urgencyFocus', description: 'Focus level: all, critical_only, vip_only', required: false }
    ]
  })
  async getUrgencyTriagePrompt(args: { chatId?: string; currentMessage?: string; urgencyFocus?: string }, ctx?: ExecutionContext) {
    let contextHistoryText = 'No prior context available.';
    
    if (args.chatId) {
      const history = whatsappEngine.getChatHistory(args.chatId, 5);
      if (history.length > 0) {
        contextHistoryText = history
          .map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.senderName} (${m.isOutgoing ? 'Agent' : 'Sender'}): ${m.body}`)
          .join('\n');
      }
    }

    return {
      messages: [
        {
          role: 'system',
          content: `You are an expert executive WhatsApp communications triage intelligence.
Your task is to analyze incoming WhatsApp messages using a Two-Pass Hybrid Evaluation Protocol:

1. CLASSIFICATION TIERS:
- CRITICAL: Production down, OTP authentication, server/database failure, active disaster, emergency failover.
- URGENT: High-stakes time limits ("today", "asap", "call me now", "deadline", repeated unanswered escalations).
- VIP: C-suite executives, enterprise VIP clients, strategic partners (exempt from automated spam).
- NORMAL: Routine transactional queries, pricing requests, general conversation.
- NOISE: Chain forwards, holiday greetings, broadcast promotions.

2. MULTI-MESSAGE CONVERSATIONAL ESCALATION:
Analyze the provided Context History. If a sender has asked multiple times without resolution, elevate urgency score by +0.3.

3. REQUIRED JSON OUTPUT FORMAT:
{
  "priority": "CRITICAL" | "URGENT" | "VIP" | "NORMAL" | "NOISE",
  "urgencyScore": 0.0 to 1.0,
  "sentiment": "positive" | "neutral" | "frustrated" | "urgent" | "distressed",
  "intent": "short_intent_slug",
  "reasoning": "1-sentence justification of the triage score and classification"
}`
        },
        {
          role: 'user',
          content: `Evaluate the incoming WhatsApp message:
Chat ID: ${args.chatId || 'unknown'}
Current Message: "${args.currentMessage || 'Please review recent chat queue'}"

Recent Context History:
${contextHistoryText}`
        }
      ]
    };
  }

  @Prompt({
    name: 'auto_reply_rule_generator',
    description: 'Generates optimized regex or keyword trigger patterns and auto-response templates with cooldown safety.',
    arguments: [
      { name: 'businessIntent', description: 'Business intent or customer query type', required: true }
    ]
  })
  async getAutoReplyRuleGeneratorPrompt(args: { businessIntent: string }, ctx?: ExecutionContext) {
    return {
      messages: [
        {
          role: 'user',
          content: `Generate an auto-reply rule configuration for the business intent: "${args.businessIntent}".
Provide:
1. triggerPattern (e.g. "pricing|quote|cost")
2. triggerType ("exact" | "contains" | "regex")
3. replyMessage (concise, professional copy)
4. cooldownMinutes (suggested debounce window)`
        }
      ]
    };
  }
}
