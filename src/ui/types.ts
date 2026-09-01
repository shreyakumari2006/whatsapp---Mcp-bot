export type PriorityTier = 'CRITICAL' | 'URGENT' | 'VIP' | 'NORMAL' | 'NOISE';
export type ConnectionStatus = 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'WAITING_FOR_QR' | 'AUTHENTICATED' | 'READY' | 'CONNECTED';

export interface ChatMessage {
  id: string;
  from: string;
  senderName: string;
  body: string;
  timestamp: number;
  priority: PriorityTier;
  isGroup: boolean;
  groupName?: string;
  isOutgoing?: boolean;
  autoReplied?: boolean;
  urgencyScore?: number;
  matchedKeywords?: string[];
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

export interface PendingApproval {
  id: string;
  to: string;
  recipientName: string;
  message: string;
  priority: PriorityTier;
  reason?: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type: 'TRIAGE' | 'AUTO_REPLY' | 'MCP_TOOL' | 'APPROVAL' | 'AUTH' | 'SYSTEM';
  action: string;
  details: Record<string, any>;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface TelemetryMetrics {
  triageDistribution: {
    CRITICAL: number;
    URGENT: number;
    VIP: number;
    NORMAL: number;
    NOISE: number;
  };
  avgTriageLatencyMs: number;
  botSuppressionRate: number;
  humanApprovalsPending: number;
  humanApprovalsResolved: number;
  totalMessagesProcessed: number;
  automatedRepliesSent: number;
  suppressedCount: number;
  activeRuleCount?: number;
}

export interface ChatThreadItem {
  chatId: string;
  senderName: string;
  isGroup: boolean;
  groupName?: string;
  priority: PriorityTier;
  isVIP: boolean;
  lastMessage: ChatMessage;
  messages: ChatMessage[];
  unreadCount: number;
}
