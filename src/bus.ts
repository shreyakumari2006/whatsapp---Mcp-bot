import { EventEmitter } from 'node:events';

export type PriorityTier = 'CRITICAL' | 'URGENT' | 'VIP' | 'NORMAL' | 'NOISE';
export type ConnectionStatus = 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATED' | 'CONNECTED';

export interface QRGeneratedEvent {
  qr: string;
  qrDataUrl?: string;
  timestamp: number;
}

export interface ReadyEvent {
  user: {
    id: string;
    name?: string;
    pushname?: string;
  };
  timestamp: number;
}

export interface MessageReceivedEvent {
  id: string;
  from: string;
  senderName: string;
  body: string;
  timestamp: number;
  priority: PriorityTier;
  isGroup: boolean;
  groupName?: string;
  urgencyScore?: number;
  matchedKeywords?: string[];
}

export interface AutoReplySentEvent {
  to: string;
  recipientName: string;
  ruleId: string;
  triggerPattern: string;
  replyMessage: string;
  timestamp: number;
  cooldownUntil: number;
}

export interface McpToolCalledEvent {
  id: string;
  tool: string;
  input: Record<string, any>;
  result?: any;
  error?: string;
  status: 'success' | 'error';
  timestamp: number;
  durationMs: number;
}

export interface PendingApprovalEvent {
  id: string;
  to: string;
  recipientName: string;
  message: string;
  priority: PriorityTier;
  reason?: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface StatusChangeEvent {
  status: ConnectionStatus;
  message?: string;
  timestamp: number;
  details?: Record<string, any>;
}

export interface AuditLogItem {
  id: string;
  type: 'MCP_TOOL' | 'AUTO_REPLY' | 'MESSAGE' | 'AUTH' | 'APPROVAL' | 'SYSTEM' | 'TRIAGE';
  title: string;
  details: Record<string, any>;
  timestamp: number;
  severity?: 'info' | 'warn' | 'error' | 'success';
}

export interface EventBusMap {
  qr_generated: QRGeneratedEvent;
  ready: ReadyEvent;
  message_received: MessageReceivedEvent;
  auto_reply_sent: AutoReplySentEvent;
  mcp_tool_called: McpToolCalledEvent;
  pending_approval: PendingApprovalEvent;
  status_change: StatusChangeEvent;
  audit_log: AuditLogItem;
}

class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof EventBusMap>(event: K, data: EventBusMap[K]): boolean {
    return super.emit(event, data);
  }

  on<K extends keyof EventBusMap>(event: K, listener: (data: EventBusMap[K]) => void): this {
    return super.on(event, listener);
  }

  once<K extends keyof EventBusMap>(event: K, listener: (data: EventBusMap[K]) => void): this {
    return super.once(event, listener);
  }

  off<K extends keyof EventBusMap>(event: K, listener: (data: EventBusMap[K]) => void): this {
    return super.off(event, listener);
  }
}

export const eventBus = new TypedEventEmitter();
// Increase max listeners for multiple SSE connections and internal hooks
eventBus.setMaxListeners(100);
