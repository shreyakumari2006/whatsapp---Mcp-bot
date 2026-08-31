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

export default function App() {
  const {
    status,
    user,
    qrDataUrl,
    messages,
    rules,
    pendingApprovals,
    auditLogs,
    analytics,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    toggleRule,
    configureRule,
    sendMessage,
    generateAIDraft
  } = useWhatsAppSSE();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'VIP' | 'APPROVALS'>('ALL');
  const [showRuleStudio, setShowRuleStudio] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showApprovalsModal, setShowApprovalsModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Group messages by chat ID
  const chatThreads = useMemo(() => {
    const map = new Map<string, ChatThreadItem>();

    for (const msg of messages) {
      const threadId = msg.from;
      if (!map.has(threadId)) {
        map.set(threadId, {
          chatId: threadId,
          senderName: msg.senderName || threadId,
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

  // Filtered Chat List
  const filteredChats = useMemo(() => {
    return chatThreads.filter((chat) => {
      const matchesSearch = 
        chat.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.chatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.body.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'URGENT') return chat.priority === 'CRITICAL' || chat.priority === 'URGENT';
      if (activeTab === 'VIP') return chat.isVIP || chat.priority === 'VIP';
      if (activeTab === 'APPROVALS') return pendingApprovals.some((p) => p.to === chat.chatId);
      return true;
    });
  }, [chatThreads, searchQuery, activeTab, pendingApprovals]);

  const activeChat = chatThreads.find((c) => c.chatId === selectedChatId) || chatThreads[0];

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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenQR={() => setShowQRModal(true)}
        onOpenApprovals={() => setShowApprovalsModal(true)}
        onOpenRuleStudio={() => setShowRuleStudio(true)}
        onOpenAudit={() => setShowAuditDrawer(true)}
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
        />

        <ConversationThread
          activeChat={activeChat}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />

        <ContactInspector
          activeChat={activeChat}
          pendingApprovals={pendingApprovals}
          onApprove={approveMessage}
          onReject={rejectMessage}
        />
      </div>

      {/* 4. MODALS & DRAWERS */}
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
