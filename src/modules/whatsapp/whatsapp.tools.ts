import { ToolDecorator as Tool, Widget, ControllerDecorator as Controller, ExecutionContext, z } from '@nitrostack/core';
import { executeMCPTool } from '../../tools/index.js';

@Controller()
export class WhatsAppTools {
  @Tool({
    name: 'send_message',
    description: 'Send a WhatsApp message to a recipient, with optional human-in-the-loop approval staging.',
    inputSchema: z.object({
      to: z.string().describe('Recipient WhatsApp ID (e.g., "1555019001@c.us" or phone number)'),
      message: z.string().describe('Message text to send'),
      requireApproval: z.boolean().optional().default(false).describe('If true, stages message for human verification in dashboard before dispatching')
    })
  })
  @Widget('send-message')
  async sendMessage(input: { to: string; message: string; requireApproval?: boolean }, ctx?: ExecutionContext) {
    return await executeMCPTool('send_message', input);
  }

  @Tool({
    name: 'get_urgent_messages',
    description: 'Retrieve high-priority and critical WhatsApp messages classified by urgency triage and keyword extraction.',
    inputSchema: z.object({
      timeWindowHours: z.number().optional().default(24).describe('Time window in hours to look back (default 24)'),
      limit: z.number().optional().default(20).describe('Maximum number of messages to return (default 20)')
    })
  })
  @Widget('urgent-messages')
  async getUrgentMessages(input: { timeWindowHours?: number; limit?: number }, ctx?: ExecutionContext) {
    return await executeMCPTool('get_urgent_messages', input);
  }

  @Tool({
    name: 'list_recent_chats',
    description: 'List recent conversations with priority tags (CRITICAL, URGENT, VIP, NORMAL, NOISE).',
    inputSchema: z.object({
      filter: z.enum(['all', 'unread', 'direct_only', 'groups_only']).optional().default('all').describe('Filter chats by type'),
      limit: z.number().optional().default(30).describe('Maximum number of chats to return')
    })
  })
  @Widget('recent-chats')
  async listRecentChats(input: { filter?: 'all' | 'unread' | 'direct_only' | 'groups_only'; limit?: number }, ctx?: ExecutionContext) {
    return await executeMCPTool('list_recent_chats', input);
  }

  @Tool({
    name: 'fetch_chat_history',
    description: 'Fetch chronologically ordered conversation history for a specific chat or contact.',
    inputSchema: z.object({
      chatId: z.string().describe('The chat or contact ID to fetch history for'),
      messageCount: z.number().optional().default(20).describe('Number of historical messages to retrieve')
    })
  })
  @Widget('chat-history')
  async fetchChatHistory(input: { chatId: string; messageCount?: number }, ctx?: ExecutionContext) {
    return await executeMCPTool('fetch_chat_history', input);
  }

  @Tool({
    name: 'search_contacts',
    description: 'Search WhatsApp contacts by name, phone number, VIP tier, or group status.',
    inputSchema: z.object({
      query: z.string().describe('Search query for contact name, phone number, or ID')
    })
  })
  @Widget('search-contacts')
  async searchContacts(input: { query: string }, ctx?: ExecutionContext) {
    return await executeMCPTool('search_contacts', input);
  }

  @Tool({
    name: 'schedule_message',
    description: 'Schedule a WhatsApp message to be dispatched automatically at a future time.',
    inputSchema: z.object({
      recipient: z.string().describe('Recipient WhatsApp ID or phone number'),
      message: z.string().describe('Message text to send'),
      sendAt: z.string().describe('Future ISO 8601 datetime string (e.g. "2026-09-01T10:00:00Z")')
    })
  })
  @Widget('schedule-message')
  async scheduleMessage(input: { recipient: string; message: string; sendAt: string }, ctx?: ExecutionContext) {
    return await executeMCPTool('schedule_message', input);
  }

  @Tool({
    name: 'configure_auto_reply_rule',
    description: 'Create or update an auto-reply rule with exact/contains/regex trigger patterns and sender cooldowns.',
    inputSchema: z.object({
      id: z.string().optional().describe('Optional existing rule ID to update'),
      name: z.string().optional().describe('Human readable name for the rule'),
      triggerPattern: z.string().describe('Pattern to match against incoming messages'),
      triggerType: z.enum(['exact', 'contains', 'regex']).describe('Matching mode: exact, contains, or regex'),
      replyMessage: z.string().describe('Auto-response message text to send'),
      cooldownMinutes: z.number().optional().default(60).describe('Per-sender cooldown in minutes')
    })
  })
  @Widget('configure-auto-reply')
  async configureAutoReplyRule(input: {
    id?: string;
    name?: string;
    triggerPattern: string;
    triggerType: 'exact' | 'contains' | 'regex';
    replyMessage: string;
    cooldownMinutes?: number;
  }, ctx?: ExecutionContext) {
    return await executeMCPTool('configure_auto_reply_rule', input);
  }

  @Tool({
    name: 'get_active_auto_replies',
    description: 'Get all configured auto-reply rules and their match counts, execution stats, and cooldowns.',
    inputSchema: z.object({
      status: z.enum(['active', 'paused', 'all']).optional().default('all').describe('Filter rules by status')
    })
  })
  @Widget('active-auto-replies')
  async getActiveAutoReplies(input: { status?: 'active' | 'paused' | 'all' }, ctx?: ExecutionContext) {
    return await executeMCPTool('get_active_auto_replies', input);
  }

  @Tool({
    name: 'toggle_auto_responder',
    description: 'Enable or disable a specific auto-reply automation rule.',
    inputSchema: z.object({
      ruleId: z.string().describe('ID of the auto-reply rule to toggle'),
      enabled: z.boolean().describe('True to enable, false to pause')
    })
  })
  @Widget('toggle-responder')
  async toggleAutoResponder(input: { ruleId: string; enabled: boolean }, ctx?: ExecutionContext) {
    return await executeMCPTool('toggle_auto_responder', input);
  }
}
