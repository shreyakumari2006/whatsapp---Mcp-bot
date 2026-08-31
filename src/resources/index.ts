import { whatsappEngine } from '../whatsapp/client.js';
import { URGENCY_KEYWORDS } from '../fixtures/mockData.js';

export interface MCPResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  handler: () => Promise<any> | any;
}

export const MCP_RESOURCES: Record<string, MCPResourceDefinition> = {
  'whatsapp://connection/status': {
    uri: 'whatsapp://connection/status',
    name: 'WhatsApp Connection Status',
    description: 'Live pairing status, connected phone number, session details, and engine health.',
    mimeType: 'application/json',
    handler: () => {
      const status = whatsappEngine.getStatus();
      return {
        connectionStatus: status.status,
        authenticatedUser: status.user,
        engineUptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        totalMessagesStored: whatsappEngine.getMessages('all', 1000).length,
        hasActiveQR: status.qrCode !== null,
        timestamp: new Date().toISOString()
      };
    }
  },

  'whatsapp://contacts/vip-list': {
    uri: 'whatsapp://contacts/vip-list',
    name: 'VIP Contacts & Tiers',
    description: 'List of protected VIP contacts with tier classifications (Executive, Key Client, Partner).',
    mimeType: 'application/json',
    handler: () => {
      const vips = whatsappEngine.getVIPList();
      return {
        vipCount: vips.length,
        contacts: vips,
        protectionPolicy: 'VIP contacts are exempt from all automated auto-responses.'
      };
    }
  },

  'whatsapp://rules/urgency-keywords': {
    uri: 'whatsapp://rules/urgency-keywords',
    name: 'Urgency Triage Keywords',
    description: 'Configured keyword dictionary for calculating priority scores (CRITICAL, URGENT, NORMAL).',
    mimeType: 'application/json',
    handler: () => {
      return {
        keywords: URGENCY_KEYWORDS,
        criticalTriggers: ['otp', 'server down', 'database down', 'emergency failover', 'payment webhook failed'],
        scoringWeights: {
          criticalKeyword: 3.0,
          urgentKeyword: 1.0,
          regexOtpPattern: 3.0
        }
      };
    }
  },

  'whatsapp://automation/auto-reply-rules': {
    uri: 'whatsapp://automation/auto-reply-rules',
    name: 'Auto-Reply Rules & Cooldowns',
    description: 'Active pattern matching rules, match statistics, and sender cooldown limits.',
    mimeType: 'application/json',
    handler: () => {
      const rules = whatsappEngine.getAutoReplyRules('all');
      return {
        ruleCount: rules.length,
        activeRulesCount: rules.filter(r => r.enabled).length,
        rules,
        globalSafetyPolicies: {
          groupChatExclusion: true,
          vipExclusion: true,
          defaultCooldownMinutes: 60
        }
      };
    }
  }
};

export async function readMCPResource(uri: string): Promise<{ uri: string; mimeType: string; text: string }> {
  const resource = MCP_RESOURCES[uri];
  if (!resource) {
    throw new Error(`Resource not found for URI: "${uri}"`);
  }

  const data = await resource.handler();
  return {
    uri,
    mimeType: resource.mimeType,
    text: JSON.stringify(data, null, 2)
  };
}
