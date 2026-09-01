import React from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  QrCode, 
  ShieldAlert, 
  Bot, 
  CreditCard, 
  Terminal, 
  CheckCheck, 
  Flame, 
  Crown,
  Sparkles
} from 'lucide-react';
import type { 
  WhatsAppConnectionStatus, 
  PendingApproval, 
  AutoReplyRule, 
  PaymentTarget,
  ConversationSession
} from '../types/whatsapp';
import type { ChatThreadItem } from './ChatFeed';

interface WhatsAppSidebarProps {
  status: WhatsAppConnectionStatus;
  user: { id: string; pushname: string } | null;
  pendingApprovals: PendingApproval[];
  rules?: AutoReplyRule[];
  paymentTargets: PaymentTarget[];
  activeFlows: ConversationSession[];
  activeTab: 'ALL' | 'URGENT' | 'VIP' | 'APPROVALS' | 'BOTS';
  setActiveTab: (tab: 'ALL' | 'URGENT' | 'VIP' | 'APPROVALS' | 'BOTS') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredChats: ChatThreadItem[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onOpenQR: () => void;
  onOpenApprovals: () => void;
  onOpenRuleStudio: () => void;
  onOpenAudit: () => void;
  onOpenPayments: () => void;
  onSimulateNewChat: () => void;
}

export const WhatsAppSidebar: React.FC<WhatsAppSidebarProps> = ({
  status,
  user,
  pendingApprovals,
  paymentTargets,
  activeFlows,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  filteredChats,
  selectedChatId,
  onSelectChat,
  onOpenQR,
  onOpenApprovals,
  onOpenRuleStudio,
  onOpenAudit,
  onOpenPayments,
  onSimulateNewChat
}) => {
  const pendingApprovalsCount = pendingApprovals.filter(p => p.status === 'pending').length;
  const pendingPaymentsCount = (paymentTargets || []).filter(t => t && t.stage !== 'PAID').length;
  const urgentCount = filteredChats.filter(c => c.priority === 'CRITICAL' || c.priority === 'URGENT').length;

  const getStatusBadge = () => {
    switch (status) {
      case 'READY':
      case 'AUTHENTICATED':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#00a884]/15 text-[#00a884] border border-[#00a884]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse" />
            MCP Live
          </span>
        );
      case 'QR_READY':
        return (
          <button 
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Scan QR
          </button>
        );
      default:
        return (
          <button 
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Offline
          </button>
        );
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    if (!name) return 'WA';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col bg-[#111b21] border-r border-[#222d34] select-none flex-shrink-0">
      {/* 1. Header Bar */}
      <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between flex-shrink-0 z-10">
        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005c4b] to-[#00a884] flex items-center justify-center font-bold text-white text-sm shadow-inner">
              {getInitials(user?.pushname || 'User')}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202c33] ${
              status === 'AUTHENTICATED' || status === 'READY' ? 'bg-[#00a884]' : 'bg-amber-500'
            }`} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#e9edef] leading-tight">
              {user?.pushname || 'WhatsApp MCP'}
            </span>
            <div className="mt-0.5">
              {getStatusBadge()}
            </div>
          </div>
        </div>

        {/* Action Tool Icons */}
        <div className="flex items-center gap-1 text-[#aebac1]">
          {/* HITL Approvals */}
          <button
            onClick={onOpenApprovals}
            title="Human-In-The-Loop Approvals"
            className="relative p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]"
          >
            <ShieldAlert size={19} />
            {pendingApprovalsCount > 0 && (
              <span className="absolute 1 top-1 right-1 px-1.5 py-0.2 bg-[#ef4444] text-white text-[10px] font-bold rounded-full animate-pulse shadow">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* Payment Agent */}
          <button
            onClick={onOpenPayments}
            title="Payment Collection Agent"
            className="relative p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]"
          >
            <CreditCard size={19} />
            {pendingPaymentsCount > 0 && (
              <span className="absolute top-1 right-1 px-1 py-0.2 bg-[#3b82f6] text-white text-[10px] font-bold rounded-full">
                {pendingPaymentsCount}
              </span>
            )}
          </button>

          {/* Auto Reply Rules */}
          <button
            onClick={onOpenRuleStudio}
            title="Auto-Reply Rule Studio"
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]"
          >
            <Bot size={19} />
          </button>

          {/* MCP Terminal Logs Drawer */}
          <button
            onClick={onOpenAudit}
            title="Live MCP Tool Execution Logs"
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]"
          >
            <Terminal size={19} />
          </button>

          {/* Pair Device QR */}
          <button
            onClick={onOpenQR}
            title="WhatsApp Device QR Pairing"
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]"
          >
            <QrCode size={19} />
          </button>

          {/* Simulate New Incoming Chat */}
          <button
            onClick={onSimulateNewChat}
            title="Simulate Inbound Test Message"
            className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#00a884]"
          >
            <MessageSquare size={19} />
          </button>
        </div>
      </header>

      {/* 2. Search & Filter Bar */}
      <div className="px-3 py-2 bg-[#111b21] flex items-center gap-2 border-b border-[#222d34]">
        <div className="flex-1 bg-[#202c33] rounded-lg px-3 py-1.5 flex items-center gap-3 text-[#8696a0] focus-within:text-[#00a884] focus-within:ring-1 focus-within:ring-[#00a884]/40 transition">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-[#e9edef] placeholder-[#8696a0] w-full focus:outline-none"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#8696a0] hover:text-[#e9edef]"
            >
              ✕
            </button>
          )}
        </div>
        <button 
          title="Filter unread / urgent"
          onClick={() => setActiveTab(activeTab === 'URGENT' ? 'ALL' : 'URGENT')}
          className={`p-2 rounded-lg transition ${
            activeTab === 'URGENT' ? 'bg-[#00a884]/20 text-[#00a884]' : 'text-[#8696a0] hover:bg-[#202c33]'
          }`}
        >
          <Filter size={18} />
        </button>
      </div>

      {/* 3. Filter Tabs (WhatsApp Style Pills) */}
      <div className="px-3 py-2 bg-[#111b21] flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#222d34]/60">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'ALL'
              ? 'bg-[#00a884] text-[#111b21]'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
          }`}
        >
          All Chats ({filteredChats.length})
        </button>

        <button
          onClick={() => setActiveTab('URGENT')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
            activeTab === 'URGENT'
              ? 'bg-[#ef4444] text-white'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
          }`}
        >
          <Flame size={13} className="text-red-400" />
          Urgent ({urgentCount})
        </button>

        <button
          onClick={() => setActiveTab('VIP')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
            activeTab === 'VIP'
              ? 'bg-amber-500 text-[#111b21]'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
          }`}
        >
          <Crown size={13} className="text-amber-400" />
          VIP
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
            activeTab === 'APPROVALS'
              ? 'bg-blue-600 text-white'
              : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942] hover:text-[#e9edef]'
          }`}
        >
          <Sparkles size={13} className="text-blue-400" />
          Staged ({pendingApprovalsCount})
        </button>
      </div>

      {/* 4. Chat Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center text-[#8696a0] space-y-2">
            <p className="text-sm font-medium">No conversations found</p>
            <p className="text-xs text-[#8696a0]/70">Try changing your search query or filter tab.</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = selectedChatId === chat.chatId;
            const lastMsg = chat.lastMessage;
            const hasPendingApproval = pendingApprovals.some(
              p => p.to === chat.chatId && p.status === 'pending'
            );
            const activeFlow = activeFlows.find(f => f.contactJid === chat.chatId);

            return (
              <div
                key={chat.chatId}
                onClick={() => onSelectChat(chat.chatId)}
                className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-colors relative ${
                  isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]/70'
                }`}
              >
                {/* Contact Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                    chat.priority === 'CRITICAL' || chat.priority === 'URGENT'
                      ? 'bg-gradient-to-br from-red-600 to-rose-700 ring-2 ring-red-500'
                      : chat.isVIP
                      ? 'bg-gradient-to-br from-amber-600 to-yellow-600 ring-2 ring-amber-400'
                      : 'bg-gradient-to-br from-slate-700 to-slate-600'
                  }`}>
                    {getInitials(chat.senderName)}
                  </div>
                  {activeFlow && (
                    <span 
                      title={`Active Flow: ${activeFlow.currentStep}`}
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#3b82f6] rounded-full flex items-center justify-center text-[9px] text-white font-bold border-2 border-[#111b21]"
                    >
                      ⚡
                    </span>
                  )}
                </div>

                {/* Chat Details */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Name and Time */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#e9edef] truncate">
                      {chat.senderName}
                    </span>
                    <span className="text-[11px] text-[#8696a0] flex-shrink-0">
                      {formatTime(lastMsg?.timestamp)}
                    </span>
                  </div>

                  {/* Bottom Row: Snippet and Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-[#8696a0] truncate flex items-center gap-1 flex-1">
                      {lastMsg?.isOutgoing && (
                        <CheckCheck size={14} className="text-[#53bdeb] flex-shrink-0 inline" />
                      )}
                      <span className="truncate">{lastMsg?.body || 'No messages yet'}</span>
                    </p>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Priority Badges */}
                      {chat.priority === 'CRITICAL' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          CRITICAL
                        </span>
                      )}
                      {chat.priority === 'URGENT' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                          URGENT
                        </span>
                      )}
                      {chat.isVIP && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          VIP
                        </span>
                      )}
                      {hasPendingApproval && (
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" title="Staged AI response pending approval" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
