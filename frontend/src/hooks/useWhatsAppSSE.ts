import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ChatMessage, 
  AutoReplyRule, 
  PendingApproval, 
  AuditLogEntry, 
  WhatsAppConnectionStatus 
} from '../types/whatsapp';

export function useWhatsAppSSE(baseUrl = '') {
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('INITIALIZING');
  const [user, setUser] = useState<{ id: string; pushname: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isConnectedSSE, setIsConnectedSSE] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef<number>(0);

  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `${baseUrl}/api/stream`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnectedSSE(true);
      reconnectAttempt.current = 0;
      setLastHeartbeat(Date.now());
    };

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;
        setLastHeartbeat(Date.now());

        switch (type) {
          case 'initial_state':
            setStatus(data.status || 'READY');
            setUser(data.user || null);
            setQrDataUrl(data.qrDataUrl || null);
            setMessages(data.messages || []);
            setRules(data.rules || []);
            setPendingApprovals(data.pendingApprovals || []);
            setAuditLogs(data.auditLogs || []);
            if (data.messages && data.messages.length > 0 && !selectedChatId) {
              setSelectedChatId(data.messages[0].from);
            }
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
            setMessages((prev) => {
              const exists = prev.some((m) => m.id === data.id);
              if (exists) return prev;
              return [data, ...prev];
            });
            break;

          case 'auto_reply_sent':
            setMessages((prev) => [
              {
                id: `auto_${Date.now()}`,
                from: 'me',
                senderName: 'Auto-Responder Bot',
                body: data.replyMessage,
                timestamp: data.timestamp || Date.now(),
                priority: 'NORMAL',
                isGroup: false,
                autoReplied: true,
                isOutgoing: true
              },
              ...prev
            ]);
            break;

          case 'pending_approval':
            setPendingApprovals((prev) => {
              const filtered = prev.filter((p) => p.id !== data.id);
              return [data, ...filtered];
            });
            break;

          case 'mcp_tool_called':
            setAuditLogs((prev) => [
              {
                id: `mcp_${Date.now()}`,
                timestamp: data.timestamp || Date.now(),
                type: 'MCP_TOOL',
                action: `MCP Tool Call: ${data.tool}`,
                details: data.args,
                level: 'info'
              },
              ...prev.slice(0, 99)
            ]);
            break;

          case 'audit_log':
            setAuditLogs((prev) => [data, ...prev.slice(0, 99)]);
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    es.onerror = () => {
      setIsConnectedSSE(false);
      es.close();

      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 15000);
      reconnectAttempt.current += 1;
      reconnectTimerRef.current = setTimeout(connectSSE, delay);
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
      const res = await fetch(`${baseUrl}/api/approvals/${approvalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId })
      });
      if (res.ok) {
        setPendingApprovals((prev) => prev.filter((p) => p.id !== approvalId));
      }
    } catch (e) {
      console.error('Failed to approve message:', e);
    }
  };

  const rejectMessage = async (approvalId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/approvals/${approvalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId })
      });
      if (res.ok) {
        setPendingApprovals((prev) => prev.filter((p) => p.id !== approvalId));
      }
    } catch (e) {
      console.error('Failed to reject message:', e);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const res = await fetch(`${baseUrl}/api/rules/${ruleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, enabled })
      });
      if (res.ok) {
        const { rule } = await res.json();
        setRules((prev) => prev.map((r) => (r.id === ruleId ? rule : r)));
      }
    } catch (e) {
      console.error('Failed to toggle rule:', e);
    }
  };

  const configureRule = async (newRuleData: Partial<AutoReplyRule>) => {
    try {
      const res = await fetch(`${baseUrl}/api/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRuleData)
      });
      if (res.ok) {
        const { rule } = await res.json();
        setRules((prev) => {
          const filtered = prev.filter((r) => r.id !== rule.id);
          return [...filtered, rule];
        });
      }
    } catch (e) {
      console.error('Failed to configure rule:', e);
    }
  };

  const sendMessage = async (to: string, message: string, requireApproval = false) => {
    try {
      const res = await fetch(`${baseUrl}/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, message, requireApproval })
      });
      return await res.json();
    } catch (e) {
      console.error('Failed to send message:', e);
      throw e;
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
    isConnectedSSE,
    lastHeartbeat,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    toggleRule,
    configureRule,
    sendMessage
  };
}
