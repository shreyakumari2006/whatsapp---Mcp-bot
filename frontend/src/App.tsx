import { useState, useMemo } from 'react';
import { useWhatsAppSSE } from './hooks/useWhatsAppSSE';
import { Navbar } from './components/Navbar';
import { AnalyticsRadar } from './components/AnalyticsRadar';
import { ChatFeed, type ChatThreadItem } from './components/ChatFeed';
import { ConversationThread } from './components/ConversationThread';
import { ContactInspector } from './components/ContactInspector';
import { HITLApprovalModal } from './components/HITLApprovalModal';
import { RuleStudio } from './components/RuleStudio';
import { TerminalLogDrawer } from './components/TerminalLogDrawer';
import { QROverlay } from './components/QROverlay';
import { PaymentTrackerWidget } from './components/PaymentTrackerWidget';
import { X } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'VIP' | 'APPROVALS'>('ALL');
  const [showRuleStudio, setShowRuleStudio] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Group messages by chat ID
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

  // Filter messages based on active tab and search
  const filteredChats = useMemo(() => {
    return chatThreads.filter((chat) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = chat.senderName.toLowerCase().includes(q);
        const matchesBody = chat.messages.some((m) => m.body.toLowerCase().includes(q));
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

      return true;
    });
  }, [chatThreads, searchQuery, activeTab, pendingApprovals]);

  const activeChat = chatThreads.find((c) => c.chatId === selectedChatId) || chatThreads[0];
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
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">

      {/* 1. TOP NAVIGATION & SYSTEM HEALTH BAR */}
      <Navbar
        status={status}
        user={user}
        pendingApprovals={pendingApprovals}
        rules={rules}
        pendingPaymentsCount={paymentTargets.filter((t) => t.stage !== 'PAID').length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenQR={() => setShowQRModal(true)}
        onOpenApprovals={() => setShowApprovalsModal(true)}
        onOpenRuleStudio={() => setShowRuleStudio(true)}
        onOpenAudit={() => setShowAuditDrawer(true)}
        onOpenPayments={() => setShowPaymentsModal(true)}
      />

      {/* 2. LIVE TRIAGE RADAR & TELEMETRY BANNER */}
      <AnalyticsRadar analytics={analytics} />

      {/* 3. MAIN 3-PANE VIEWPORT */}
      <div className="flex flex-1 overflow-hidden">
        <ChatFeed
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredChats={filteredChats}
          selectedChatId={activeChat?.chatId || null}
          onSelectChat={(id) => setSelectedChatId(id)}
          activeFlows={activeFlows}
        />

        <ConversationThread
          activeChat={activeChat}
          onSendMessage={handleSendMessage}
          isSending={isSending}
          activeFlow={activeChatFlow}
          onCancelFlow={cancelFlowSession}
        />

        <ContactInspector
          activeChat={activeChat}
          pendingApprovals={pendingApprovals}
          onApprove={approveMessage}
          onReject={rejectMessage}
        />
      </div>

      {/* 4. MODALS & DRAWERS */}
      {showPaymentsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-1">
            <div className="flex justify-end p-3 pb-0">
              <button
                onClick={() => setShowPaymentsModal(false)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
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

      <HITLApprovalModal
        isOpen={showApprovalsModal}
        onClose={() => setShowApprovalsModal(false)}
        pendingApprovals={pendingApprovals}
        onApprove={approveMessage}
        onReject={rejectMessage}
        onGenerateDraft={generateAIDraft}
      />

      <RuleStudio
        isOpen={showRuleStudio}
        onClose={() => setShowRuleStudio(false)}
        rules={rules}
        onCreateRule={configureRule}
        onToggleRule={toggleRule}
      />

      <TerminalLogDrawer
        isOpen={showAuditDrawer}
        onClose={() => setShowAuditDrawer(false)}
        auditLogs={auditLogs}
      />

      <QROverlay
        isOpen={showQRModal}
        qrDataUrl={qrDataUrl}
        onClose={() => setShowQRModal(false)}
      />

    </div>
  );
}
