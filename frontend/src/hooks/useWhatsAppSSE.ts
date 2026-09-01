import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ChatMessage, 
  AutoReplyRule, 
  PendingApproval, 
  AuditLogEntry, 
  WhatsAppConnectionStatus,
  TelemetryMetrics,
  AIDraftTone,
  AIDraftResponse,
  ConversationSession,
  PaymentTarget
} from '../types/whatsapp';
import { 
  SEED_MESSAGES, 
  SEED_RULES, 
  SEED_PENDING_APPROVALS, 
  SEED_AUDIT_LOGS,
  SEED_ACTIVE_FLOWS,
  SEED_PAYMENT_TARGETS
} from '../data/seedData';

export function useWhatsAppSSE(baseUrl = '') {
  const [status, setStatus] = useState<WhatsAppConnectionStatus>('AUTHENTICATED');
  const [user, setUser] = useState<{ id: string; pushname: string } | null>({
    id: 'shreya@c.us',
    pushname: 'Shreya'
  });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [rules, setRules] = useState<AutoReplyRule[]>(SEED_RULES);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(SEED_PENDING_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SEED_AUDIT_LOGS);
  const [activeFlows, setActiveFlows] = useState<ConversationSession[]>(SEED_ACTIVE_FLOWS);
  const [paymentTargets, setPaymentTargets] = useState<PaymentTarget[]>(SEED_PAYMENT_TARGETS);
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
  const [lastHeartbeat, setLastHeartbeat] = useState<number>(Date.now());
  const [selectedChatId, setSelectedChatId] = useState<string | null>('1555019001@c.us');

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
            if (data.activeFlows) {
              setActiveFlows(data.activeFlows);
            }
            if (data.analytics) {
              setAnalytics(data.analytics);
            }
            if (data.messages && data.messages.length > 0 && !selectedChatId) {
              setSelectedChatId(data.messages[0].from);
            }
            break;

          case 'flow_started':
          case 'flow_state_change':
            if (data?.session) {
              const session = data.session;
              if (data.action === 'completed' || data.action === 'cancelled') {
                setActiveFlows((prev) => prev.filter((f) => f.contactJid !== session.contactJid));
              } else {
                setActiveFlows((prev) => {
                  const filtered = prev.filter((f) => f.contactJid !== session.contactJid);
                  return [...filtered, session];
                });
              }
            } else if (data?.contactJid) {
              setActiveFlows((prev) => {
                const filtered = prev.filter((f) => f.contactJid !== data.contactJid);
                return [...filtered, data];
              });
            }
            break;

          case 'flow_completed':
            if (data?.contactJid) {
              setActiveFlows((prev) => prev.filter((f) => f.contactJid !== data.contactJid));
            }
            break;

          case 'analytics_update':
            if (data) {
              setAnalytics(data);
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

          case 'payment_state_update':
            setPaymentTargets((prev) => {
              const updated = data.target;
              if (!updated) return prev;
              const exists = prev.some((t) => t.id === updated.id);
              if (!exists) return [updated, ...prev];
              return prev.map((t) => (t.id === updated.id ? updated : t));
            });
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

  const generateAIDraft = async (
    approvalId: string, 
    tone: AIDraftTone = 'professional',
    customInstruction?: string
  ): Promise<AIDraftResponse | null> => {
    try {
      const res = await fetch(`${baseUrl}/api/approvals/${approvalId}/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, customInstruction })
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.error('Failed to generate AI draft:', e);
      return null;
    }
  };

  const cancelFlowSession = async (contactJid: string) => {
    try {
      setActiveFlows((prev) => prev.filter((f) => f.contactJid !== contactJid));
      await fetch(`${baseUrl}/api/flows/sessions/${encodeURIComponent(contactJid)}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactJid })
      });
    } catch (e) {
      console.error('Failed to cancel flow session:', e);
    }
  };

  const initiatePaymentCheckin = async (targetId: string) => {
    try {
      setPaymentTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, stage: 'CONTEXT_BRIDGE', lastUpdated: Date.now() } : t))
      );
      const res = await fetch(`${baseUrl}/api/payments/${targetId}/checkin`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setPaymentTargets((prev) => prev.map((t) => (t.id === targetId ? data.target : t)));
        }
      }
    } catch (e) {
      console.error('Failed to initiate payment checkin:', e);
    }
  };

  const dispatchPaymentLink = async (targetId: string) => {
    try {
      setPaymentTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, stage: 'PAYMENT_LINK_SENT', lastUpdated: Date.now() } : t))
      );
      const res = await fetch(`${baseUrl}/api/payments/${targetId}/dispatch-link`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setPaymentTargets((prev) => prev.map((t) => (t.id === targetId ? data.target : t)));
        }
      }
    } catch (e) {
      console.error('Failed to dispatch payment link:', e);
    }
  };

  const settlePayment = async (targetId: string) => {
    try {
      setPaymentTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, stage: 'PAID', lastUpdated: Date.now() } : t))
      );
      const res = await fetch(`${baseUrl}/api/payments/${targetId}/settle`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setPaymentTargets((prev) => prev.map((t) => (t.id === targetId ? data.target : t)));
        }
      }
    } catch (e) {
      console.error('Failed to mark payment settled:', e);
    }
  };

  const updatePaymentTarget = async (targetId: string, updates: Partial<PaymentTarget>) => {
    try {
      setPaymentTargets((prev) =>
        prev.map((t) => (t.id === targetId ? { ...t, ...updates, lastUpdated: Date.now() } : t))
      );
      const res = await fetch(`${baseUrl}/api/payments/${targetId}/update-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.target) {
          setPaymentTargets((prev) => prev.map((t) => (t.id === targetId ? data.target : t)));
        }
      }
    } catch (e) {
      console.error('Failed to update payment target:', e);
    }
  };

  const autoMatchPaymentContacts = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/payments/auto-match`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.targets) {
          setPaymentTargets(data.targets);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to auto match payment contacts:', e);
    }
    return null;
  };

  return {
    status,
    user,
    qrDataUrl,
    messages,
    rules,
    pendingApprovals,
    auditLogs,
    activeFlows,
    paymentTargets,
    analytics,
    isConnectedSSE,
    lastHeartbeat,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    toggleRule,
    configureRule,
    sendMessage,
    generateAIDraft,
    cancelFlowSession,
    initiatePaymentCheckin,
    dispatchPaymentLink,
    settlePayment,
    updatePaymentTarget,
    autoMatchPaymentContacts
  };
}
