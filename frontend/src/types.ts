export type PriorityTier = 'CRITICAL' | 'URGENT' | 'VIP' | 'NORMAL' | 'NOISE';

export type WhatsAppConnectionStatus = 
  | 'INITIALIZING' 
  | 'QR_READY' 
  | 'AUTHENTICATING' 
  | 'AUTHENTICATED' 
  | 'READY' 
  | 'DISCONNECTED' 
  | 'ERROR';

export type VIPTier = 'TIER_1_EXECUTIVE' | 'TIER_2_CLIENT' | 'TIER_3_PARTNER';

export interface ChatMessage {
  id: string;
  from: string;
  senderName: string;
  body: string;
  timestamp: number;
  priority: PriorityTier;
  isGroup: boolean;
  groupName?: string;
  matchedKeywords?: string[];
  urgencyScore?: number;
  autoReplied?: boolean;
  isOutgoing?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'pending_approval';
}

export interface ContactDossier {
  id: string;
  name: string;
  phone: string;
  isVIP: boolean;
  vipTier?: VIPTier;
  isGroup: boolean;
  unreadCount: number;
  lastActive: number;
  assignedRuleIds?: string[];
  cooldownExpiresAt?: number;
  matchedKeywordsHistory?: string[];
}

export interface PendingApproval {
  id: string;
  to: string;
  recipientName: string;
  message: string;
  priority: PriorityTier;
  triggeredBy?: string;
  createdAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AutoReplyRule {
  id: string;
  name: string;
  triggerPattern: string;
  triggerType: 'exact' | 'contains' | 'regex';
  replyMessage: string;
  cooldownMinutes: number;
  enabled: boolean;
  matchCount: number;
  lastTriggeredAt?: number;
  createdAt: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: 'TRIAGE' | 'AUTO_REPLY' | 'MCP_TOOL' | 'APPROVAL' | 'AUTH' | 'SYSTEM';
  action: string;
  details: Record<string, any>;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface SystemHealthState {
  status: WhatsAppConnectionStatus;
  user: { id: string; pushname: string } | null;
  qrCode?: string;
  qrDataUrl?: string;
  totalMessagesStored: number;
  activeCooldownsCount: number;
  uptimeSeconds: number;
  memoryUsageMB: number;
}

export type SSEEvent =
  | { type: 'initial_state'; data: any }
  | { type: 'qr_generated'; data: { qr: string; qrDataUrl?: string; timestamp: number } }
  | { type: 'ready'; data: { user: { id: string; pushname: string } } }
  | { type: 'status_change'; data: { status: WhatsAppConnectionStatus; message: string; timestamp: number } }
  | { type: 'message_received'; data: ChatMessage }
  | { type: 'auto_reply_sent'; data: { ruleId: string; to: string; replyMessage: string; timestamp: number } }
  | { type: 'pending_approval'; data: PendingApproval }
  | { type: 'mcp_tool_called'; data: { tool: string; args: any; timestamp: number } }
  | { type: 'audit_log'; data: AuditLogEntry };
