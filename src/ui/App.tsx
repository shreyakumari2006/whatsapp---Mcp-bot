import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  CheckCheck, 
  Check, 
  X, 
  QrCode, 
  Terminal, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Crown, 
  Bot, 
  MessageSquare, 
  MoreVertical, 
  Phone, 
  Video, 
  Lock, 
  Zap,
  Plus
} from 'lucide-react';
import { useWhatsAppSSE } from './hooks/useWhatsAppSSE.js';
import type { ChatThreadItem } from './types.js';

export default function AuthenticLightWhatsAppWeb() {
  const {
    status,
    user,
    qrDataUrl,
    messages,
    pendingApprovals,
    auditLogs,
    selectedChatId,
    setSelectedChatId,
    approveMessage,
    rejectMessage,
    sendMessage
  } = useWhatsAppSSE();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'CHATS' | 'AUTO_REPLIES' | 'URGENT'>('CHATS');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvalModeActive, setApprovalModeActive] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Composer State
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Auto-scroll anchor
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group individual messages into distinct WhatsApp conversation threads
  const chatThreads = useMemo(() => {
    const map = new Map<string, ChatThreadItem>();

    for (const msg of messages) {
      const threadId = msg.from;
      if (!map.has(threadId)) {
        map.set(threadId, {
          chatId: threadId,
          senderName: msg.senderName || threadId.replace(/@c\.us|@g\.us/, ''),
          isGroup: msg.isGroup,
          groupName: msg.groupName,
          priority: msg.priority,
          isVIP: msg.priority === 'VIP',
          lastMessage: msg,
          messages: [msg],
          unreadCount: msg.isOutgoing ? 0 : 1
        });
      } else {
        const t = map.get(threadId)!;
        t.messages.push(msg);
        if (!msg.isOutgoing && Date.now() - msg.timestamp < 1000 * 60 * 30) {
          t.unreadCount += 1;
        }
      }
    }

    return Array.from(map.values());
  }, [messages]);

  // Filter conversations based on search and active tab
  const filteredChats = useMemo(() => {
    return chatThreads.filter((chat) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = chat.senderName.toLowerCase().includes(q);
        const matchesBody = chat.lastMessage.body.toLowerCase().includes(q);
        if (!matchesName && !matchesBody) return false;
      }

      if (activeTab === 'URGENT') {
        return chat.priority === 'CRITICAL' || chat.priority === 'URGENT';
      }

      if (activeTab === 'AUTO_REPLIES') {
        return chat.messages.some((m) => m.autoReplied);
      }

      return true;
    });
  }, [chatThreads, searchQuery, activeTab]);

  // Active selected chat thread
  const activeChat = chatThreads.find((c) => c.chatId === selectedChatId) || (chatThreads.length > 0 ? chatThreads[0] : null);

  // Staged approval for active chat
  const currentPendingApproval = pendingApprovals.find(
    (p) => p.to === activeChat?.chatId && p.status === 'pending'
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(activeChat.chatId, inputText, approvalModeActive);
      setInputText('');
    } catch (err) {
      console.error('Failed to dispatch message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isConnected = status === 'READY' || status === 'AUTHENTICATED';
  const isWaitingQR = status === 'QR_READY' || status === 'WAITING_FOR_QR';

  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] text-[#111b21] font-sans antialiased overflow-hidden select-none">

      {/* =========================================================================
          LEFT SIDEBAR (~30% width, min 340px, max 450px)
         ========================================================================= */}
      <aside className="w-[30%] min-w-[340px] max-w-[450px] bg-white border-r border-[#e9edef] flex flex-col flex-shrink-0 z-10 shadow-xs">
        
        {/* Sidebar Header */}
        <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between flex-shrink-0 border-b border-[#e9edef]">
          <div className="flex items-center gap-3">
            {/* User Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#008069]/15 border border-[#008069]/30 flex items-center justify-center font-bold text-[#008069] text-sm shadow-xs">
              {user?.pushname ? user.pushname.substring(0, 2).toUpperCase() : 'WA'}
            </div>

            {/* MCP Connection Status Indicator */}
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#111b21] leading-tight">
                {user?.pushname || 'WhatsApp MCP'}
              </span>
              <div 
                onClick={() => isWaitingQR && setShowQRModal(true)}
                className="flex items-center gap-1.5 cursor-pointer text-[11px]"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#008069] animate-pulse' : isWaitingQR ? 'bg-[#d97706]' : 'bg-[#dc2626]'}`} />
                <span className={`font-medium ${isConnected ? 'text-[#008069]' : isWaitingQR ? 'text-[#d97706]' : 'text-[#dc2626]'}`}>
                  {isConnected ? '● Connected' : isWaitingQR ? '● Scan QR Code' : '● Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 text-[#54656f]">
            {isWaitingQR && (
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 hover:bg-[#e9edef] rounded-full text-[#d97706] transition"
                title="Open QR Pairing Modal"
              >
                <QrCode size={19} />
              </button>
            )}

            <button
              onClick={() => setShowDrawer(true)}
              className="p-2 hover:bg-[#e9edef] rounded-full hover:text-[#008069] transition"
              title="Toggle Live MCP Execution Drawer"
            >
              <Terminal size={19} />
            </button>

            <button
              onClick={() => setShowSimulateModal(true)}
              className="p-2 hover:bg-[#e9edef] rounded-full hover:text-[#111b21] transition"
              title="Simulate Inbound Message"
            >
              <Plus size={19} />
            </button>
          </div>
        </header>

        {/* View Selector Tabs */}
        <div className="px-3 pt-2.5 pb-2 bg-white flex items-center gap-1.5 border-b border-[#e9edef]">
          <button
            onClick={() => setActiveTab('CHATS')}
            className={`flex-1 py-1.5 px-3 rounded-full text-xs font-semibold transition ${
              activeTab === 'CHATS' 
                ? 'bg-[#008069] text-white shadow-xs' 
                : 'bg-[#f0f2f5] text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            Chats ({chatThreads.length})
          </button>

          <button
            onClick={() => setActiveTab('URGENT')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'URGENT' 
                ? 'bg-[#dc2626] text-white shadow-xs' 
                : 'bg-[#f0f2f5] text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            <Flame size={12} />
            <span>Urgent</span>
          </button>

          <button
            onClick={() => setActiveTab('AUTO_REPLIES')}
            className={`py-1.5 px-3 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
              activeTab === 'AUTO_REPLIES' 
                ? 'bg-[#2563eb] text-white shadow-xs' 
                : 'bg-[#f0f2f5] text-[#54656f] hover:text-[#111b21]'
            }`}
          >
            <Bot size={12} />
            <span>Auto-Replies</span>
          </button>
        </div>

        {/* WhatsApp-Style Rounded Search Input */}
        <div className="px-3 py-2 bg-white border-b border-[#e9edef]">
          <div className="relative flex items-center bg-[#f0f2f5] rounded-lg px-3 py-1.5">
            <Search size={15} className="text-[#54656f] mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat"
              className="w-full bg-transparent text-xs text-[#111b21] placeholder:text-[#667781] focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e9edef]">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-[#667781] text-xs">
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = activeChat?.chatId === chat.chatId;
              const isCrit = chat.priority === 'CRITICAL' || chat.priority === 'URGENT';
              const hasApproval = pendingApprovals.some((p) => p.to === chat.chatId && p.status === 'pending');

              return (
                <div
                  key={chat.chatId}
                  onClick={() => setSelectedChatId(chat.chatId)}
                  className={`px-3 py-3 flex items-center gap-3 cursor-pointer transition ${
                    isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                  }`}
                >
                  {/* Contact Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-[#111b21] text-sm shadow-xs">
                      {chat.senderName.substring(0, 2).toUpperCase()}
                    </div>
                    {chat.isVIP && (
                      <div className="absolute -top-1 -right-1 bg-[#d97706] text-white p-0.5 rounded-full shadow-xs">
                        <Crown size={10} />
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-[#111b21] truncate">
                        {chat.senderName}
                      </span>
                      <span className="text-[11px] text-[#667781]">
                        {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs text-[#667781] truncate flex-1">
                        {chat.lastMessage.isOutgoing && <span className="text-[#53bdeb] mr-1">✓✓</span>}
                        {chat.lastMessage.body}
                      </p>

                      {/* Priority & Unread Badges */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isCrit && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]">
                            {chat.priority}
                          </span>
                        )}
                        {chat.isVIP && !isCrit && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                            VIP
                          </span>
                        )}
                        {hasApproval && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe] animate-pulse">
                            STAGED
                          </span>
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

      {/* =========================================================================
          RIGHT MAIN PANE (~70% width)
         ========================================================================= */}
      <main className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] flex-shrink-0 z-10 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center font-bold text-[#111b21] text-sm">
                  {activeChat.senderName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#111b21] leading-tight">
                    {activeChat.senderName}
                  </h2>
                  <p className="text-[11px] text-[#667781]">
                    {activeChat.isVIP ? 'Protected VIP Contact' : activeChat.isGroup ? 'Group Conversation' : 'online'}
                  </p>
                </div>
              </div>

              {/* Action Controls & Human Approval Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setApprovalModeActive(!approvalModeActive)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                    approvalModeActive
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                      : 'bg-white text-[#667781] border-[#e9edef]'
                  }`}
                  title="Toggle Human-in-the-Loop staging before dispatch"
                >
                  {approvalModeActive ? <ShieldAlert size={14} className="text-amber-600" /> : <ShieldCheck size={14} />}
                  <span>Approval Mode: {approvalModeActive ? 'ON' : 'OFF'}</span>
                </button>

                <div className="flex items-center text-[#54656f]">
                  <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                    <Video size={18} />
                  </button>
                  <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                    <Phone size={18} />
                  </button>
                  <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </header>

            {/* Chat Messages Feed with Light Wallpaper Pattern */}
            <div 
              className="flex-1 overflow-y-auto p-4 md:px-12 space-y-3 relative"
              style={{
                backgroundColor: '#efeae2',
                backgroundImage: `radial-gradient(#d1d7db 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            >
              {/* Encrypted Notice Banner */}
              <div className="flex justify-center my-2">
                <div className="bg-[#ffeecd] border border-[#fed7aa] px-4 py-1.5 rounded-lg text-[11px] text-[#7c2d12] flex items-center gap-1.5 shadow-2xs max-w-md text-center">
                  <Lock size={12} className="text-[#c2410c] flex-shrink-0" />
                  <span>Messages are end-to-end synchronized via local Model Context Protocol node.</span>
                </div>
              </div>

              {/* Message Bubbles */}
              {activeChat.messages.map((msg) => {
                const isOut = msg.isOutgoing || msg.from === 'me';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md md:max-w-lg rounded-xl px-3.5 py-2 text-sm leading-relaxed shadow-xs relative ${
                        isOut 
                          ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none' 
                          : 'bg-white text-[#111b21] rounded-tl-none border border-[#e9edef]/60'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.body}</p>

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#667781]">
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOut && (
                          <CheckCheck size={14} className="text-[#53bdeb]" />
                        )}
                      </div>
                    </div>

                    {msg.autoReplied && (
                      <span className="text-[10px] text-[#008069] font-medium mt-0.5 flex items-center gap-1">
                        <Zap size={10} /> Auto-responder dispatched
                      </span>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* In-Chat Floating Human Approval Banner */}
            {currentPendingApproval && (
              <div className="mx-4 mb-2 p-3.5 bg-amber-50 border border-amber-300 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldAlert size={16} className="text-amber-600" />
                    <span>AI Proposed Reply for this contact</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 font-bold">ID: {currentPendingApproval.id.slice(-6)}</span>
                </div>

                <p className="text-xs text-[#111b21] bg-white p-2.5 rounded-lg border border-amber-200 mb-3 shadow-2xs">
                  "{currentPendingApproval.message}"
                </p>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => rejectMessage(currentPendingApproval.id)}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold border border-rose-300 transition"
                  >
                    Reject / Edit
                  </button>
                  <button
                    onClick={() => approveMessage(currentPendingApproval.id)}
                    className="px-4 py-1.5 bg-[#008069] hover:bg-[#008069]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Check size={14} />
                    <span>Approve & Send ✓</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Input Bar */}
            <footer className="h-[62px] bg-[#f0f2f5] px-4 flex items-center gap-2 flex-shrink-0 border-t border-[#e9edef]">
              <button className="p-2 text-[#54656f] hover:text-[#111b21] transition">
                <Smile size={22} />
              </button>
              <button className="p-2 text-[#54656f] hover:text-[#111b21] transition">
                <Paperclip size={20} />
              </button>

              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Type a message to ${activeChat.senderName}`}
                  className="flex-1 bg-white text-sm text-[#111b21] placeholder:text-[#667781] px-4 py-2.5 rounded-lg border border-[#e9edef] focus:outline-none focus:border-[#008069] shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="p-2.5 bg-[#008069] hover:bg-[#008069]/90 disabled:opacity-40 text-white rounded-full transition shadow-xs flex items-center justify-center flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* WhatsApp Web Welcome Hero Screen */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5]">
            <div className="w-24 h-24 rounded-full bg-white border border-[#e9edef] flex items-center justify-center mb-6 text-[#008069] shadow-xs">
              <MessageSquare size={48} />
            </div>
            <h1 className="text-2xl font-light text-[#111b21] mb-2">WhatsApp Web MCP</h1>
            <p className="text-sm text-[#667781] max-w-md mb-8 leading-relaxed">
              Send and receive messages with local Model Context Protocol tools, intelligent urgency triage, and automated rule responses.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#667781]">
              <Lock size={13} className="text-[#008069]" />
              <span>End-to-end encrypted session via whatsapp-web.js</span>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          SLIDE-OVER MCP EXECUTION DRAWER
         ========================================================================= */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs select-none animate-in fade-in">
          <div className="w-full max-w-md h-full bg-white border-l border-[#e9edef] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef]">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-[#008069]" />
                <h3 className="text-sm font-bold text-[#111b21]">Live MCP Execution Logs</h3>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-1 text-[#667781] hover:text-[#111b21]">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs bg-slate-50">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-[#667781]">No tool executions yet</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-white border border-[#e9edef] space-y-1 shadow-2xs">
                    <div className="flex justify-between text-[#667781] text-[10px]">
                      <span className="text-[#008069] font-bold">[{log.type}]</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-[#111b21]">{log.action}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WHATSAPP QR PAIRING MODAL
         ========================================================================= */}
      {showQRModal && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-[#e9edef] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#111b21] text-sm">Pair WhatsApp Mobile App</h3>
              <button onClick={() => setShowQRModal(false)} className="text-[#667781] hover:text-[#111b21]">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-white border border-[#e9edef] rounded-xl inline-block shadow-sm">
              <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52" />
            </div>

            <p className="text-xs text-[#667781] leading-relaxed">
              Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Scan this QR code.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
