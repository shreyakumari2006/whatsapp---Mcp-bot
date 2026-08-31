import { ResourceDecorator as Resource, ControllerDecorator as Controller, ExecutionContext } from '@nitrostack/core';
import { MCP_RESOURCES } from '../../resources/index.js';

@Controller()
export class WhatsAppResources {
  @Resource({
    uri: 'whatsapp://connection/status',
    name: 'WhatsApp Connection Status',
    description: 'Live pairing status, connected phone number, session details, and engine health.',
    mimeType: 'application/json'
  })
  async getConnectionStatus(ctx?: ExecutionContext) {
    return await MCP_RESOURCES['whatsapp://connection/status'].handler();
  }

  @Resource({
    uri: 'whatsapp://contacts/vip-list',
    name: 'VIP Contacts & Tiers',
    description: 'List of protected VIP contacts with tier classifications (Executive, Key Client, Partner).',
    mimeType: 'application/json'
  })
  async getVipList(ctx?: ExecutionContext) {
    return await MCP_RESOURCES['whatsapp://contacts/vip-list'].handler();
  }

  @Resource({
    uri: 'whatsapp://rules/urgency-keywords',
    name: 'Urgency Triage Keywords',
    description: 'Configured keyword dictionary for calculating priority scores (CRITICAL, URGENT, NORMAL).',
    mimeType: 'application/json'
  })
  async getUrgencyKeywords(ctx?: ExecutionContext) {
    return await MCP_RESOURCES['whatsapp://rules/urgency-keywords'].handler();
  }

  @Resource({
    uri: 'whatsapp://automation/auto-reply-rules',
    name: 'Auto-Reply Rules & Cooldowns',
    description: 'Active pattern matching rules, match statistics, and sender cooldown limits.',
    mimeType: 'application/json'
  })
  async getAutoReplyRules(ctx?: ExecutionContext) {
    return await MCP_RESOURCES['whatsapp://automation/auto-reply-rules'].handler();
  }
}
