import { useState, useMemo } from 'react';
import { useWhatsAppSSE } from './hooks/useWhatsAppSSE';
import { WhatsAppSidebar } from './components/WhatsAppSidebar';
import { WhatsAppChatArea } from './components/WhatsAppChatArea';
import { WhatsAppWelcomeScreen } from './components/WhatsAppWelcomeScreen';
import { WhatsAppMcpDrawer } from './components/WhatsAppMcpDrawer';
import { WhatsAppQRModal } from './components/WhatsAppQRModal';
import { WhatsAppSimulateModal } from './components/WhatsAppSimulateModal';
import { HITLApprovalModal } from './components/HITLApprovalModal';
import { RuleStudio } from './components/RuleStudio';
import { PaymentTrackerWidget } from './components/PaymentTrackerWidget';
import { X } from 'lucide-react';
import type { ChatThreadItem } from './components/ChatFeed';

export default function App() {
  const {
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
  } = useWhatsAppSSE();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'VIP' | 'APPROVALS' | 'BOTS'>('ALL');
  const [showRuleStudio, setShowRuleStudio] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Group messages into distinct WhatsApp conversation threads
  const chatThreads = useMemo(() => {
    const map = new Map<string, ChatThreadItem>();

    for (const msg of messages) {
      const threadId = msg.from;
      if (!map.has(threadId)) {
        map.set(threadId, {
          chatId: threadId,
          senderName: msg.senderName || msg.groupName || threadId.replace(/@c\.us|@g\.us/, ''),
          isGroup: msg.isGroup,
          priority: msg.priority,
          isVIP: msg.priority === 'VIP',
          lastMessage: msg,
          messages: [msg]
        });
      } else {
        const t = map.get(threadId)!;
        t.messages.push(msg);
      }
    }

    return Array.from(map.values());
  }, [messages]);

  // Filter conversations by search and selected view tab
  const filteredChats = useMemo(() => {
    return chatThreads.filter((chat) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = chat.senderName.toLowerCase().includes(q);
        const matchesBody = chat.messages.some((m) => m.body?.toLowerCase().includes(q));
        if (!matchesName && !matchesBody) return false;
      }

      if (activeTab === 'URGENT') {
        return chat.priority === 'CRITICAL' || chat.priority === 'URGENT';
      }
      if (activeTab === 'VIP') {
        return chat.isVIP;
      }
      if (activeTab === 'APPROVALS') {
        return pendingApprovals.some((p) => p.to === chat.chatId && p.status === 'pending');
      }
      if (activeTab === 'BOTS') {
        return chat.messages.some((m) => m.autoReplied);
      }

      return true;
    });
  }, [chatThreads, searchQuery, activeTab, pendingApprovals]);

  const activeChat = chatThreads.find((c) => c.chatId === selectedChatId) || (chatThreads.length > 0 ? chatThreads[0] : null);
  const activeChatFlow = activeChat ? activeFlows.find((f) => f.contactJid === activeChat.chatId) : null;

  const handleSendMessage = async (text: string, requireApproval: boolean) => {
    if (!activeChat) return;
    setIsSending(true);
    try {
      await sendMessage(activeChat.chatId, text, requireApproval);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] text-[#111b21] font-sans antialiased overflow-hidden select-none">

      {/* LEFT SIDEBAR: 30% width, min 340px, max 450px */}
      <WhatsAppSidebar
        status={status}
        user={user}
        pendingApprovals={pendingApprovals}
        rules={rules}
        paymentTargets={paymentTargets}
        activeFlows={activeFlows}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredChats={filteredChats}
        selectedChatId={activeChat?.chatId || null}
        onSelectChat={(id) => setSelectedChatId(id)}
        onOpenQR={() => setShowQRModal(true)}
        onOpenApprovals={() => setShowApprovalsModal(true)}
        onOpenRuleStudio={() => setShowRuleStudio(true)}
        onOpenAudit={() => setShowAuditDrawer(true)}
        onOpenPayments={() => setShowPaymentsModal(true)}
        onSimulateNewChat={() => setShowSimulateModal(true)}
      />

      {/* RIGHT MAIN PANE: 70% width */}
      {activeChat ? (
        <WhatsAppChatArea
          activeChat={activeChat}
          pendingApprovals={pendingApprovals}
          activeFlow={activeChatFlow}
          onSendMessage={handleSendMessage}
          onApprove={approveMessage}
          onReject={rejectMessage}
          onGenerateDraft={generateAIDraft}
          onCancelFlow={cancelFlowSession}
          isSending={isSending}
        />
      ) : (
        <WhatsAppWelcomeScreen
          onSimulateChat={() => setShowSimulateModal(true)}
          onOpenAudit={() => setShowAuditDrawer(true)}
          onOpenPayments={() => setShowPaymentsModal(true)}
        />
      )}

      {/* SLIDE-OVER MCP TELEMETRY DRAWER */}
      <WhatsAppMcpDrawer
        isOpen={showAuditDrawer}
        onClose={() => setShowAuditDrawer(false)}
        auditLogs={auditLogs}
        analytics={analytics}
      />

      {/* WHATSAPP DEVICE PAIRING QR MODAL */}
      <WhatsAppQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrDataUrl={qrDataUrl}
        status={status}
        user={user}
      />

      {/* INBOUND SIMULATION MODAL */}
      <WhatsAppSimulateModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
      />

      {/* HUMAN-IN-THE-LOOP APPROVAL QUEUE MODAL */}
      <HITLApprovalModal
        isOpen={showApprovalsModal}
        onClose={() => setShowApprovalsModal(false)}
        pendingApprovals={pendingApprovals}
        onApprove={approveMessage}
        onReject={rejectMessage}
        onGenerateDraft={generateAIDraft}
      />

      {/* AUTO-REPLY RULE STUDIO MODAL */}
      <RuleStudio
        isOpen={showRuleStudio}
        onClose={() => setShowRuleStudio(false)}
        rules={rules}
        onCreateRule={configureRule}
        onToggleRule={toggleRule}
      />

      {/* CONVERSATIONAL PAYMENT AGENT MODAL */}
      {showPaymentsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-[#111b21] rounded-3xl border border-[#222d34] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-1">
            <div className="flex justify-end p-3 pb-0">
              <button
                onClick={() => setShowPaymentsModal(false)}
                className="w-8 h-8 rounded-xl text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <PaymentTrackerWidget
              targets={paymentTargets}
              onInitiateCheckin={initiatePaymentCheckin}
              onDispatchPaymentLink={dispatchPaymentLink}
              onSettlePayment={settlePayment}
              onUpdateTarget={updatePaymentTarget}
              onAutoMatch={autoMatchPaymentContacts}
            />
          </div>
        </div>
      )}

    </div>
  );
}
