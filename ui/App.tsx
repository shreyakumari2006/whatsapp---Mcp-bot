import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Crown, 
  MessageSquare, 
  VolumeX, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity, 
  RefreshCw, 
  Send, 
  Plus, 
  Terminal, 
  Settings, 
  Zap, 
  Check, 
  X,
  Search,
  Filter,
  Users,
  User,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Sliders,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useWhatsAppSSE } from './hooks/useWhatsAppSSE.js';
import { PriorityTier, ChatMessage, AutoReplyRule } from './types.js';

export default function WhatsAppCommandCenter() {
  const {
    status,
    user,
    qrDataUrl,
    messages,
    rules,
    pendingApprovals,
    auditLogs,
    isConnectedSSE,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    toggleRule,
    configureRule,
    sendMessage
  } = useWhatsAppSSE();

  // Navigation & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'VIP' | 'APPROVALS' | 'GROUPS'>('ALL');
  const [showRuleStudio, setShowRuleStudio] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [requireApprovalCheck, setRequireApprovalCheck] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleType, setRuleType] = useState<'exact' | 'contains' | 'regex'>('contains');
  const [ruleReply, setRuleReply] = useState('');
  const [ruleCooldown, setRuleCooldown] = useState(30);

  // Group messages by contact/chat ID
  const chatThreads = useMemo(() => {
    const map = new Map<string, {
      chatId: string;
      senderName: string;
      isGroup: boolean;
      priority: PriorityTier;
      isVIP: boolean;
      lastMessage: ChatMessage;
      messages: ChatMessage[];
      unreadCount: number;
    }>();

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
          messages: [msg],
          unreadCount: 0
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
      if (activeTab === 'GROUPS') return chat.isGroup;
      if (activeTab === 'APPROVALS') return pendingApprovals.some((p) => p.to === chat.chatId);
      return true;
    });
  }, [chatThreads, searchQuery, activeTab, pendingApprovals]);

  const activeChat = chatThreads.find((c) => c.chatId === selectedChatId) || chatThreads[0];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;

    setIsSending(true);
    try {
      await sendMessage(activeChat.chatId, newMessageText, requireApprovalCheck);
      setNewMessageText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulePattern || !ruleReply) return;

    await configureRule({
      name: ruleName || `Rule (${rulePattern})`,
      triggerPattern: rulePattern,
      triggerType: ruleType,
      replyMessage: ruleReply,
      cooldownMinutes: ruleCooldown,
      enabled: true
    });

    setRuleName('');
    setRulePattern('');
    setRuleReply('');
    setShowRuleStudio(false);
  };

  // Status Badge Helper
  const renderStatusBadge = () => {
    const isOnline = status === 'READY' || status === 'AUTHENTICATED';
    const isQr = status === 'QR_READY';

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
        isOnline 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
          : isQr
          ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-pointer animate-pulse'
          : 'bg-rose-50 text-rose-700 border-rose-200'
      }`} onClick={() => isQr && setShowQRModal(true)}>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : isQr ? 'bg-amber-500' : 'bg-rose-500'}`} />
        <span>{status}</span>
        {isQr && <QrCode size={13} className="ml-1" />}
      </div>
    );
  };

  // Priority Pill Helper
  const renderPriorityPill = (tier: PriorityTier) => {
    const styles: Record<PriorityTier, string> = {
      CRITICAL: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold',
      URGENT: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      VIP: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      NORMAL: 'bg-blue-50 text-blue-700 border-blue-200',
      NOISE: 'bg-slate-100 text-slate-500 border-slate-200'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border tracking-wider ${styles[tier] || styles.NORMAL}`}>
        {tier}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-hidden">
      
      {/* 1. TOP NAVIGATION & SYSTEM HEALTH BAR */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900">WhatsApp MCP Command Center</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">v1.0 Stdio</span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>{user?.pushname ? `Connected as: ${user.pushname}` : 'LocalAuth Engine'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live SSE Synchronized
              </span>
            </p>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative w-80 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search chats, VIPs, or keyword triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Actions & Health Telemetry */}
        <div className="flex items-center gap-2.5">
          {renderStatusBadge()}

          {pendingApprovals.length > 0 && (
            <button
              onClick={() => setActiveTab('APPROVALS')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-xs animate-bounce"
            >
              <Clock size={13} />
              <span>{pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''}</span>
            </button>
          )}

          <button
            onClick={() => setShowRuleStudio(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Zap size={14} className="text-amber-500" />
            <span>Rule Studio ({rules.filter(r => r.enabled).length})</span>
          </button>

          <button
            onClick={() => setShowAuditDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Terminal size={14} className="text-emerald-400" />
            <span>Audit Terminal</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: 3-PANE SPLIT COMMAND INBOX */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANE 1: LEFT CHAT & TRIAGE FEED */}
        <aside className="w-80 border-r border-slate-200 bg-white flex flex-col z-10">
          
          {/* Feed Filter Tabs */}
          <div className="p-2 border-b border-slate-200 bg-slate-50/50 flex gap-1 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('URGENT')}
              className={`flex-1 py-1.5 rounded-md text-center flex items-center justify-center gap-1 transition-all ${
                activeTab === 'URGENT' ? 'bg-white text-rose-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              <Flame size={12} className="text-rose-600" /> Urgent
            </button>
            <button
              onClick={() => setActiveTab('VIP')}
              className={`flex-1 py-1.5 rounded-md text-center flex items-center justify-center gap-1 transition-all ${
                activeTab === 'VIP' ? 'bg-white text-purple-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              <Crown size={12} className="text-purple-600" /> VIPs
            </button>
            <button
              onClick={() => setActiveTab('APPROVALS')}
              className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                activeTab === 'APPROVALS' ? 'bg-white text-amber-700 shadow-xs border border-slate-200' : 'hover:bg-slate-200/60'
              }`}
            >
              Staged
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations found in this view.
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = activeChat?.chatId === chat.chatId;
                const isCrit = chat.priority === 'CRITICAL';
                const isUrg = chat.priority === 'URGENT';
                const isVip = chat.isVIP;

                return (
                  <div
                    key={chat.chatId}
                    onClick={() => setSelectedChatId(chat.chatId)}
                    className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                      isSelected 
                        ? 'bg-slate-50 border-emerald-600 shadow-xs' 
                        : isCrit
                        ? 'border-rose-500 hover:bg-rose-50/40'
                        : isUrg
                        ? 'border-amber-500 hover:bg-amber-50/40'
                        : isVip
                        ? 'border-purple-500 hover:bg-purple-50/40'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {chat.isVIP ? (
                          <Crown size={13} className="text-purple-600 flex-shrink-0" />
                        ) : chat.isGroup ? (
                          <Users size={13} className="text-slate-400 flex-shrink-0" />
                        ) : (
                          <User size={13} className="text-slate-400 flex-shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {chat.senderName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {chat.lastMessage.body}
                    </p>

                    <div className="flex items-center justify-between">
                      {renderPriorityPill(chat.priority)}
                      {chat.lastMessage.matchedKeywords && chat.lastMessage.matchedKeywords.length > 0 && (
                        <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                          #{chat.lastMessage.matchedKeywords[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* PANE 2: CENTER CONVERSATION THREAD */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {activeChat ? (
            <>
              {/* Thread Header */}
              <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white z-10 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeChat.isVIP 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {activeChat.isVIP ? '👑' : activeChat.senderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900">{activeChat.senderName}</h2>
                      {renderPriorityPill(activeChat.priority)}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{activeChat.chatId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Auto-Responder:</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    activeChat.isVIP 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {activeChat.isVIP ? 'VIP Bypass (Active)' : 'Automated'}
                  </span>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {activeChat.messages.map((msg) => {
                  const isOut = msg.isOutgoing || msg.from === 'me';
                  const isCrit = msg.priority === 'CRITICAL';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!isOut && <span className="text-[11px] font-bold text-slate-700">{msg.senderName}</span>}
                        {renderPriorityPill(msg.priority)}
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isOut 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : isCrit
                          ? 'bg-white text-slate-900 border-2 border-rose-300 rounded-bl-none shadow-sm'
                          : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                      }`}>
                        {msg.body}

                        {msg.matchedKeywords && msg.matchedKeywords.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-rose-600">Urgency Flags:</span>
                            {msg.matchedKeywords.map((kw, i) => (
                              <span key={i} className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-mono">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {msg.autoReplied && (
                        <span className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                          <Zap size={11} /> Auto-Replied by Rules Engine
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={requireApprovalCheck}
                        onChange={(e) => setRequireApprovalCheck(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-700">Require Human Approval (Stage in queue before dispatch)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Shift + Enter for new line</span>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      placeholder={`Reply to ${activeChat.senderName}...`}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      className="flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !newMessageText.trim()}
                      className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send size={15} />
                      <span>{requireApprovalCheck ? 'Stage' : 'Send'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="text-slate-200 mb-2" />
              <p className="text-sm font-medium">Select a conversation from the feed to start triaging.</p>
            </div>
          )}
        </main>

        {/* PANE 3: RIGHT CONTACT DOSSIER & AUTOMATION INSPECTOR */}
        <aside className="w-80 border-l border-slate-200 bg-white p-5 flex flex-col gap-6 overflow-y-auto z-10">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact Dossier</h3>
            {activeChat ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-base font-bold shadow-xs">
                    {activeChat.isVIP ? '👑' : '👤'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{activeChat.senderName}</h4>
                    <p className="text-xs text-slate-500 font-mono">{activeChat.chatId}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">VIP Status</span>
                    <span className={`font-bold ${activeChat.isVIP ? 'text-purple-700' : 'text-slate-600'}`}>
                      {activeChat.isVIP ? 'Protected VIP' : 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Priority Tier</span>
                    <span className="font-bold text-slate-900">{activeChat.priority}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Chat Type</span>
                    <span className="font-bold text-slate-900">{activeChat.isGroup ? 'Group Chat' : 'Direct Message'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Messages</span>
                    <span className="font-bold text-slate-900">{activeChat.messages.length}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active contact selected.</p>
            )}
          </div>

          {/* Pending Approvals Review Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">HITL Staging Queue</h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {pendingApprovals.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingApprovals.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  <ShieldCheck size={20} className="mx-auto text-emerald-500 mb-1" />
                  No messages awaiting human review.
                </div>
              ) : (
                pendingApprovals.map((appr) => (
                  <div key={appr.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate">To: {appr.recipientName || appr.to}</span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">REVIEW</span>
                    </div>
                    <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-amber-100">
                      "{appr.message}"
                    </p>
                    <div className="flex gap-1.5 pt-1">
                      <button
                        onClick={() => approveMessage(appr.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <Check size={13} /> Approve
                      </button>
                      <button
                        onClick={() => rejectMessage(appr.id)}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 4. RULE STUDIO MODAL */}
      {showRuleStudio && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-500" size={20} />
                <h3 className="text-sm font-bold text-slate-900">Auto-Reply Automation Studio</h3>
              </div>
              <button onClick={() => setShowRuleStudio(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Add New Rule Form */}
              <form onSubmit={handleCreateRule} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Create Pattern Matcher Rule</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Rule Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pricing Inquiries"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trigger Match Type</label>
                    <select
                      value={ruleType}
                      onChange={(e) => setRuleType(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    >
                      <option value="contains">Contains Keyword</option>
                      <option value="exact">Exact Match</option>
                      <option value="regex">Regular Expression (Regex)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trigger Pattern / Keyword</label>
                    <input
                      type="text"
                      placeholder="e.g. pricing or ^!help$"
                      value={rulePattern}
                      onChange={(e) => setRulePattern(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cooldown (Mins)</label>
                    <input
                      type="number"
                      value={ruleCooldown}
                      onChange={(e) => setRuleCooldown(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Auto-Response Template Copy</label>
                  <textarea
                    rows={2}
                    placeholder="Enter automated reply message copy..."
                    value={ruleReply}
                    onChange={(e) => setRuleReply(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rulePattern || !ruleReply}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus size={14} /> Add Automation Rule
                </button>
              </form>

              {/* Active Rules List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Configured Rules ({rules.length})</h4>
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div key={rule.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            {rule.triggerType}("{rule.triggerPattern}")
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 italic mt-1">"{rule.replyMessage}"</p>
                        <span className="text-[10px] text-slate-400 block mt-1">Cooldown: {rule.cooldownMinutes}m • Executed: {rule.matchCount} times</span>
                      </div>

                      <button
                        onClick={() => toggleRule(rule.id, !rule.enabled)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          rule.enabled 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. AUDIT TERMINAL DRAWER */}
      {showAuditDrawer && (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200 font-mono text-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400" />
              <span className="font-bold">Live Execution & Audit Bus</span>
            </div>
            <button onClick={() => setShowAuditDrawer(false)} className="text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-emerald-400 font-bold">[{log.type}]</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-200 font-semibold">{log.action}</div>
                {log.details && Object.keys(log.details).length > 0 && (
                  <pre className="mt-1 text-[10px] text-slate-400 overflow-x-auto bg-black/40 p-1.5 rounded">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. QR AUTHENTICATION OVERLAY */}
      {showQRModal && qrDataUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
              <QrCode size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pair WhatsApp Session</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Open WhatsApp on your mobile phone &gt; Settings &gt; Linked Devices &gt; Link a Device.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner mb-4">
              <img src={qrDataUrl} alt="WhatsApp Pairing QR" className="w-52 h-52 rounded-xl" />
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
