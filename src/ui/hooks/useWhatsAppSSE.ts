import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ChatMessage, 
  AutoReplyRule, 
  PendingApproval, 
  AuditLogEntry, 
  ConnectionStatus,
  TelemetryMetrics
} from '../types.js';

export function useWhatsAppSSE(baseUrl = '') {
  const [status, setStatus] = useState<ConnectionStatus>('AUTHENTICATED');
  const [user, setUser] = useState<{ id: string; pushname: string } | null>({
    id: '1555019000@c.us',
    pushname: 'WhatsApp User'
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [analytics, setAnalytics] = useState<TelemetryMetrics>({
    triageDistribution: { CRITICAL: 1, URGENT: 1, VIP: 2, NORMAL: 3, NOISE: 1 },
    avgTriageLatencyMs: 38,
    botSuppressionRate: 25,
    humanApprovalsPending: 1,
    humanApprovalsResolved: 6,
    totalMessagesProcessed: 8,
    automatedRepliesSent: 4,
    suppressedCount: 3
  });
  const [isConnectedSSE, setIsConnectedSSE] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${baseUrl}/api/stream`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnectedSSE(true);
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;

        switch (type) {
          case 'initial_state':
            if (data.status) setStatus(data.status);
            if (data.user) setUser(data.user);
            if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
            if (Array.isArray(data.messages)) {
              setMessages(data.messages);
              if (data.messages.length > 0 && !selectedChatId) {
                setSelectedChatId(data.messages[0].from);
              }
            }
            if (Array.isArray(data.rules)) setRules(data.rules);
            if (Array.isArray(data.pendingApprovals)) setPendingApprovals(data.pendingApprovals);
            if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
            if (data.analytics) setAnalytics(data.analytics);
            break;

          case 'analytics_update':
            if (data) setAnalytics(data);
            break;

          case 'qr_generated':
            setStatus('QR_READY');
            setQrDataUrl(data.qrDataUrl || null);
            break;

          case 'ready':
            setStatus('READY');
            setUser(data.user);
            setQrDataUrl(null);
            break;

          case 'status_change':
            setStatus(data.status);
            if (data.status === 'READY' || data.status === 'AUTHENTICATED') {
              setQrDataUrl(null);
            }
            break;

          case 'message_received':
            if (data) {
              setMessages((prev) => [data, ...prev]);
              setAuditLogs((prev) => [
                {
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  timestamp: Date.now(),
                  type: 'TRIAGE',
                  action: `Inbound Message Triage: [${data.priority}] from ${data.senderName || data.from}`,
                  details: { priority: data.priority, body: data.body, score: data.urgencyScore },
                  level: data.priority === 'CRITICAL' || data.priority === 'URGENT' ? 'warn' : 'info'
                },
                ...prev
              ]);
            }
            break;

          case 'auto_reply_sent':
            if (data) {
              const replyMsg: ChatMessage = {
                id: `auto_${Date.now()}`,
                from: data.to,
                senderName: 'WhatsApp Bot (Auto-Reply)',
                body: data.replyMessage,
                timestamp: data.timestamp,
                priority: 'NORMAL',
                isGroup: false,
                isOutgoing: true,
                autoReplied: true
              };
              setMessages((prev) => [replyMsg, ...prev]);
              setAuditLogs((prev) => [
                {
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  timestamp: Date.now(),
                  type: 'AUTO_REPLY',
                  action: `Auto-Reply Sent to ${data.recipientName || data.to}`,
                  details: { ruleId: data.ruleId, message: data.replyMessage },
                  level: 'success'
                },
                ...prev
              ]);
            }
            break;

          case 'pending_approval':
            if (data) {
              setPendingApprovals((prev) => [data, ...prev.filter((p) => p.id !== data.id)]);
              setAuditLogs((prev) => [
                {
                  id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                  timestamp: Date.now(),
                  type: 'APPROVAL',
                  action: `HITL Staging Interception: [${data.priority}] for ${data.recipientName || data.to}`,
                  details: { to: data.to, message: data.message },
                  level: 'warn'
                },
                ...prev
              ]);
            }
            break;

          case 'mcp_tool_called':
            if (data) {
              setAuditLogs((prev) => [
                {
                  id: data.id || `log_${Date.now()}`,
                  timestamp: data.timestamp || Date.now(),
                  type: 'MCP_TOOL',
                  action: `MCP Tool: ${data.tool}`,
                  details: { input: data.input, result: data.result, error: data.error },
                  level: data.status === 'success' ? 'success' : 'error'
                },
                ...prev
              ]);
            }
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    es.onerror = () => {
      setIsConnectedSSE(false);
      es.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        connectSSE();
      }, 3000);
    };
  }, [baseUrl, selectedChatId]);

  useEffect(() => {
    connectSSE();
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connectSSE]);

  const approveMessage = async (approvalId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvalId })
      });
      if (res.ok) {
        setPendingApprovals((prev) => prev.filter((p) => p.id !== approvalId));
      }
    } catch (err) {
      console.error('Failed to approve message:', err);
    }
  };

  const rejectMessage = async (approvalId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: approvalId })
      });
      if (res.ok) {
        setPendingApprovals((prev) => prev.filter((p) => p.id !== approvalId));
      }
    } catch (err) {
      console.error('Failed to reject message:', err);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const res = await fetch(`${baseUrl}/api/auto-reply/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled })
      });
      if (res.ok) {
        setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r)));
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const sendMessage = async (to: string, message: string, requireApproval = false) => {
    try {
      const res = await fetch(`${baseUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, requireApproval })
      });
      if (res.ok) {
        const newMsg: ChatMessage = {
          id: `msg_sent_${Date.now()}`,
          from: to,
          senderName: 'You',
          body: message,
          timestamp: Date.now(),
          priority: 'NORMAL',
          isGroup: false,
          isOutgoing: true
        };
        setMessages((prev) => [newMsg, ...prev]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return {
    status,
    user,
    qrDataUrl,
    messages,
    rules,
    pendingApprovals,
    auditLogs,
    analytics,
    isConnectedSSE,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    toggleRule,
    sendMessage
  };
}
