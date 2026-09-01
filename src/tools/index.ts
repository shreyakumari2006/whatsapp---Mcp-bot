import { z } from 'zod';
import { whatsappEngine } from '../whatsapp/client.js';
import { eventBus } from '../bus.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodObject<any>;
  jsonSchema?: Record<string, any>;
  handler: (args: any) => Promise<any>;
}

export function zodObjectToJsonSchema(schema: z.ZodObject<any>): Record<string, any> {
  const shape = schema.shape;
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [key, val] of Object.entries(shape)) {
    const field: any = val;
    let typeName = 'string';
    let description = field.description || '';
    let enumVals: string[] | undefined = undefined;

    let unwrapped = field;
    while (unwrapped._def && (unwrapped._def.innerType || unwrapped._def.schema)) {
      if (unwrapped._def.description) description = unwrapped._def.description;
      unwrapped = unwrapped._def.innerType || unwrapped._def.schema;
    }

    const typeNameId = unwrapped._def?.typeName;
    if (typeNameId === 'ZodNumber') typeName = 'number';
    else if (typeNameId === 'ZodBoolean') typeName = 'boolean';
    else if (typeNameId === 'ZodArray') typeName = 'array';
    else if (typeNameId === 'ZodEnum') {
      typeName = 'string';
      enumVals = unwrapped._def.values;
    }

    properties[key] = {
      type: typeName,
      ...(description ? { description } : {}),
      ...(enumVals ? { enum: enumVals } : {})
    };

    if (!field.isOptional()) {
      required.push(key);
    }
  }

  return {
    type: 'object',
    properties,
    required
  };
}

// 1. send_message
const SendMessageSchema = z.object({
  to: z.string().describe('Recipient WhatsApp ID (e.g., "1555019001@c.us" or phone number)'),
  message: z.string().describe('Message text to send'),
  requireApproval: z.boolean().optional().default(false).describe('If true, stages message for human verification in dashboard before dispatching')
});

// 2. get_urgent_messages
const GetUrgentMessagesSchema = z.object({
  timeWindowHours: z.number().optional().default(24).describe('Time window in hours to look back (default 24)'),
  limit: z.number().optional().default(20).describe('Maximum number of messages to return (default 20)')
});

// 3. list_recent_chats
const ListRecentChatsSchema = z.object({
  filter: z.enum(['all', 'unread', 'direct_only', 'groups_only']).optional().default('all').describe('Filter chats by type (all, unread, direct_only, groups_only)'),
  limit: z.number().optional().default(30).describe('Maximum number of chats to return')
});

// 4. fetch_chat_history
const FetchChatHistorySchema = z.object({
  chatId: z.string().describe('The chat or contact ID to fetch history for'),
  messageCount: z.number().optional().default(20).describe('Number of historical messages to retrieve (default 20)')
});

// 5. search_contacts
const SearchContactsSchema = z.object({
  query: z.string().describe('Search query for contact name, phone number, or ID')
});

// 6. schedule_message
const ScheduleMessageSchema = z.object({
  recipient: z.string().describe('Recipient WhatsApp ID or phone number'),
  message: z.string().describe('Message text to send'),
  sendAt: z.string().describe('Future ISO 8601 datetime string (e.g. "2026-09-01T10:00:00Z")')
});

// 7. configure_auto_reply_rule
const ConfigureAutoReplyRuleSchema = z.object({
  id: z.string().optional().describe('Optional existing rule ID to update. If omitted, a new rule is created'),
  name: z.string().optional().describe('Human readable name for the rule'),
  triggerPattern: z.string().describe('Pattern to match against incoming messages'),
  triggerType: z.enum(['exact', 'contains', 'regex']).describe('Matching mode: exact, contains, or regex'),
  replyMessage: z.string().describe('Auto-response message text to send'),
  cooldownMinutes: z.number().optional().default(60).describe('Per-sender cooldown in minutes (default 60)')
});

// 8. get_active_auto_replies
const GetActiveAutoRepliesSchema = z.object({
  status: z.enum(['active', 'paused', 'all']).optional().default('all').describe('Filter rules by status: active, paused, or all')
});

// 9. toggle_auto_responder
const ToggleAutoResponderSchema = z.object({
  ruleId: z.string().describe('ID of the auto-reply rule to toggle'),
  enabled: z.boolean().describe('True to enable/activate the rule, false to pause it')
});

export const MCP_TOOLS: Record<string, MCPToolDefinition> = {
  send_message: {
    name: 'send_message',
    description: 'Send a WhatsApp message to a recipient, with optional human-in-the-loop approval staging.',
    inputSchema: SendMessageSchema,
    handler: async (args: z.infer<typeof SendMessageSchema>) => {
      let recipient = args.to;
      if (!recipient.includes('@')) {
        const clean = recipient.replace(/[^0-9]/g, '');
        recipient = `${clean}@c.us`;
      }
      return await whatsappEngine.sendMessage(recipient, args.message, args.requireApproval);
    }
  },

  get_urgent_messages: {
    name: 'get_urgent_messages',
    description: 'Retrieve high-priority and critical WhatsApp messages classified by urgency triage and keyword extraction.',
    inputSchema: GetUrgentMessagesSchema,
    handler: async (args: z.infer<typeof GetUrgentMessagesSchema>) => {
      const messages = whatsappEngine.getUrgentMessages(args.timeWindowHours, args.limit);
      return {
        count: messages.length,
        timeWindowHours: args.timeWindowHours,
        messages
      };
    }
  },

  list_recent_chats: {
    name: 'list_recent_chats',
    description: 'List recent conversations with priority tags (CRITICAL, URGENT, VIP, NORMAL, NOISE).',
    inputSchema: ListRecentChatsSchema,
    handler: async (args: z.infer<typeof ListRecentChatsSchema>) => {
      const messages = whatsappEngine.getMessages(args.filter, args.limit);
      return {
        count: messages.length,
        filter: args.filter,
        chats: messages
      };
    }
  },

  fetch_chat_history: {
    name: 'fetch_chat_history',
    description: 'Fetch chronologically ordered conversation history for a specific chat or contact.',
    inputSchema: FetchChatHistorySchema,
    handler: async (args: z.infer<typeof FetchChatHistorySchema>) => {
      const history = whatsappEngine.getChatHistory(args.chatId, args.messageCount);
      return {
        chatId: args.chatId,
        count: history.length,
        history
      };
    }
  },

  search_contacts: {
    name: 'search_contacts',
    description: 'Search WhatsApp contacts by name, phone number, VIP tier, or group status.',
    inputSchema: SearchContactsSchema,
    handler: async (args: z.infer<typeof SearchContactsSchema>) => {
      const contacts = whatsappEngine.getContacts(args.query);
      return {
        query: args.query,
        count: contacts.length,
        contacts
      };
    }
  },

  schedule_message: {
    name: 'schedule_message',
    description: 'Schedule a WhatsApp message to be dispatched automatically at a future time.',
    inputSchema: ScheduleMessageSchema,
    handler: async (args: z.infer<typeof ScheduleMessageSchema>) => {
      let recipient = args.recipient;
      if (!recipient.includes('@')) {
        const clean = recipient.replace(/[^0-9]/g, '');
        recipient = `${clean}@c.us`;
      }
      return whatsappEngine.scheduleMessage(recipient, args.message, args.sendAt);
    }
  },

  configure_auto_reply_rule: {
    name: 'configure_auto_reply_rule',
    description: 'Create or update an auto-reply rule with exact/contains/regex trigger patterns and sender cooldowns.',
    inputSchema: ConfigureAutoReplyRuleSchema,
    handler: async (args: z.infer<typeof ConfigureAutoReplyRuleSchema>) => {
      const rule = whatsappEngine.configureAutoReplyRule(args);
      return {
        success: true,
        rule
      };
    }
  },

  get_active_auto_replies: {
    name: 'get_active_auto_replies',
    description: 'Get all configured auto-reply rules and their match counts, execution stats, and cooldowns.',
    inputSchema: GetActiveAutoRepliesSchema,
    handler: async (args: z.infer<typeof GetActiveAutoRepliesSchema>) => {
      const rules = whatsappEngine.getAutoReplyRules(args.status);
      return {
        count: rules.length,
        filter: args.status,
        rules
      };
    }
  },

  toggle_auto_responder: {
    name: 'toggle_auto_responder',
    description: 'Enable or disable a specific auto-reply automation rule.',
    inputSchema: ToggleAutoResponderSchema,
    handler: async (args: z.infer<typeof ToggleAutoResponderSchema>) => {
      const rule = whatsappEngine.toggleAutoReplyRule(args.ruleId, args.enabled);
      if (!rule) {
        throw new Error(`Rule with ID "${args.ruleId}" not found`);
      }
      return {
        success: true,
        ruleId: args.ruleId,
        enabled: rule.enabled,
        rule
      };
    }
  },

  'get-payment-targets': {
    name: 'get-payment-targets',
    description: 'Retrieve seeded payment collection targets (Abdhur Rahman, Ekansh Patil, Shreya Pandey) and current stage progressions.',
    inputSchema: z.object({
      status: z.enum(['all', 'pending', 'paid']).optional().default('all').describe('Filter targets by status')
    }),
    handler: async (args: { status?: 'all' | 'pending' | 'paid' }) => {
      const { paymentManager } = await import('../data/payments.js');
      const targets = paymentManager.getTargets();
      const filtered = args.status === 'pending'
        ? targets.filter(t => t.stage !== 'PAID')
        : args.status === 'paid'
        ? targets.filter(t => t.stage === 'PAID')
        : targets;
      return {
        count: filtered.length,
        targets: filtered
      };
    }
  },

  'initiate-payment-conversation': {
    name: 'initiate-payment-conversation',
    description: 'Dispatch a casual, friendly warmup check-in message to a debtor before discussing payment settlement.',
    inputSchema: z.object({
      targetId: z.string().describe('Target debtor ID (e.g., "pay_target_1" for Abdhur Rahman)')
    }),
    handler: async (args: { targetId: string }) => {
      const { paymentManager } = await import('../data/payments.js');
      const res = paymentManager.initiateCheckin(args.targetId);
      if (!res) throw new Error(`Payment target "${args.targetId}" not found`);
      await whatsappEngine.sendMessage(res.target.contactJid, res.message, false);
      return {
        success: true,
        target: res.target,
        dispatchedMessage: res.message,
        stage: res.target.stage
      };
    }
  },

  'dispatch-payment-request': {
    name: 'dispatch-payment-request',
    description: 'Dispatch the polite breakdown with the settlement link to a payment target.',
    inputSchema: z.object({
      targetId: z.string().describe('Target debtor ID (e.g., "pay_target_1" for Abdhur Rahman)')
    }),
    handler: async (args: { targetId: string }) => {
      const { paymentManager } = await import('../data/payments.js');
      const res = paymentManager.dispatchPaymentRequest(args.targetId);
      if (!res) throw new Error(`Payment target "${args.targetId}" not found`);
      await whatsappEngine.sendMessage(res.target.contactJid, res.message, false);
      return {
        success: true,
        target: res.target,
        dispatchedMessage: res.message,
        stage: res.target.stage
      };
    }
  }
};

/**
 * Execute tool with standard MCP wrappers, timing, and EventBus audit logging
 */
export async function executeMCPTool(toolName: string, inputArgs: any): Promise<any> {
  const tool = MCP_TOOLS[toolName];
  if (!tool) {
    throw new Error(`Unknown MCP Tool: "${toolName}"`);
  }

  const startTime = Date.now();
  const parsedInput = tool.inputSchema.parse(inputArgs || {});

  try {
    const result = await tool.handler(parsedInput);
    const durationMs = Date.now() - startTime;

    // Emit event & log audit
    eventBus.emit('mcp_tool_called', {
      id: `call_${Date.now()}`,
      tool: toolName,
      input: parsedInput,
      result,
      status: 'success',
      timestamp: Date.now(),
      durationMs
    });

    whatsappEngine.logAudit('MCP_TOOL', `Tool executed: ${toolName}`, {
      tool: toolName,
      input: parsedInput,
      durationMs
    }, 'success');

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    eventBus.emit('mcp_tool_called', {
      id: `call_${Date.now()}`,
      tool: toolName,
      input: parsedInput,
      error: error.message,
      status: 'error',
      timestamp: Date.now(),
      durationMs
    });

    whatsappEngine.logAudit('MCP_TOOL', `Tool failed: ${toolName}`, {
      tool: toolName,
      input: parsedInput,
      error: error.message,
      durationMs
    }, 'error');

    throw error;
  }
}
