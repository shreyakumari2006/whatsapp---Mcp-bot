import React, { useState, useRef, useEffect } from 'react';
import { 
  Smile, 
  Paperclip, 
  Send, 
  Mic, 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  CheckCheck, 
  Sparkles, 
  Bot, 
  Check, 
  X, 
  Wand2 
} from 'lucide-react';
import type { 
  PendingApproval, 
  ConversationSession, 
  AIDraftTone, 
  AIDraftResponse 
} from '../types/whatsapp';
import type { ChatThreadItem } from './ChatFeed';

interface WhatsAppChatAreaProps {
  activeChat: ChatThreadItem | null;
  pendingApprovals: PendingApproval[];
  activeFlow: ConversationSession | null | undefined;
  onSendMessage: (text: string, requireApproval: boolean) => Promise<void>;
  onApprove: (approvalId: string) => Promise<void>;
  onReject: (approvalId: string) => Promise<void>;
  onGenerateDraft?: (approvalId: string, tone: AIDraftTone) => Promise<AIDraftResponse | null>;
  onCancelFlow?: (contactJid: string) => Promise<void>;
  isSending: boolean;
}

export const WhatsAppChatArea: React.FC<WhatsAppChatAreaProps> = ({
  activeChat,
  pendingApprovals,
  activeFlow,
  onSendMessage,
  onApprove,
  onReject,
  onGenerateDraft,
  onCancelFlow,
  isSending
}) => {
  const [inputText, setInputText] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [selectedTone, setSelectedTone] = useState<AIDraftTone>('professional');
  const [isRegeneratingDraft, setIsRegeneratingDraft] = useState(false);
  const [activeDraftText, setActiveDraftText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find if this specific chat has a pending approval
  const currentApproval = pendingApprovals.find(
    p => p.to === activeChat?.chatId && p.status === 'pending'
  );

  useEffect(() => {
    if (currentApproval?.message) {
      setActiveDraftText(currentApproval.message);
    }
  }, [currentApproval?.id, currentApproval?.message]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, currentApproval]);

  if (!activeChat) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text, requireApproval);
  };

  const handleToneChange = async (tone: AIDraftTone) => {
    if (!currentApproval || !onGenerateDraft) return;
    setSelectedTone(tone);
    setIsRegeneratingDraft(true);
    try {
      const res = await onGenerateDraft(currentApproval.id, tone);
      if (res?.suggestedReply) {
        setActiveDraftText(res.suggestedReply);
      }
    } catch (err) {
      console.error('Failed to regenerate draft tone:', err);
    } finally {
      setIsRegeneratingDraft(false);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <main className="flex-1 flex flex-col h-full bg-[#efeae2] relative overflow-hidden select-none">
      {/* 1. Header Bar */}
      <header className="h-[60px] bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] flex-shrink-0 z-10 shadow-xs">
        {/* Left: Contact Info */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs ${
            activeChat.priority === 'CRITICAL' || activeChat.priority === 'URGENT'
              ? 'bg-gradient-to-br from-red-600 to-rose-700'
              : activeChat.isVIP
              ? 'bg-gradient-to-br from-amber-600 to-yellow-600'
              : 'bg-gradient-to-br from-slate-600 to-slate-500'
          }`}>
            {getInitials(activeChat.senderName)}
          </div>

          {/* Contact Details & Online Subtitle */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#111b21]">
                {activeChat.senderName}
              </span>
              {activeChat.priority === 'CRITICAL' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-300">
                  CRITICAL
                </span>
              )}
              {activeChat.priority === 'URGENT' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-300">
                  URGENT
                </span>
              )}
              {activeChat.isVIP && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  VIP
                </span>
              )}
            </div>
            <span className="text-xs text-[#667781]">
              {activeFlow ? (
                <span className="text-blue-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  Flow: {activeFlow.currentStep}
                </span>
              ) : (
                'online • WhatsApp MCP'
              )}
            </span>
          </div>
        </div>

        {/* Right Controls: Approval Toggle & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Human Approval Mode Toggle */}
          <button
            onClick={() => setRequireApproval(!requireApproval)}
            title="Toggle Human-In-The-Loop approval requirement for replies"
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition ${
              requireApproval
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-white text-[#667781] border-[#e9edef] hover:text-[#111b21]'
            }`}
          >
            <ShieldAlert size={14} className={requireApproval ? 'text-amber-600' : 'text-[#667781]'} />
            <span>HITL Mode: {requireApproval ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-1 text-[#54656f]">
            <button className="p-2 rounded-full hover:bg-[#e9edef] transition text-[#54656f] hover:text-[#111b21]">
              <Search size={19} />
            </button>
            <button className="p-2 rounded-full hover:bg-[#e9edef] transition text-[#54656f] hover:text-[#111b21]">
              <MoreVertical size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Messages Feed with WhatsApp Wallpaper */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-4 space-y-3 relative"
        style={{
          backgroundColor: '#efeae2',
          backgroundImage: `radial-gradient(#d1d7db 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Active Multi-Turn Flow Banner */}
        {activeFlow && (
          <div className="sticky top-2 z-10 mx-auto max-w-md bg-white/95 backdrop-blur border border-blue-300 rounded-2xl p-3 shadow-lg flex items-center justify-between text-xs text-[#111b21]">
            <div className="flex items-center gap-2">
              <span className="text-base">🎂</span>
              <div>
                <p className="font-bold text-[#111b21]">Party RSVP Conversation Flow</p>
                <p className="text-[11px] text-[#667781]">State: <strong className="text-blue-600 font-mono">{activeFlow.currentStep}</strong></p>
              </div>
            </div>
            {onCancelFlow && (
              <button
                onClick={() => onCancelFlow(activeFlow.contactJid)}
                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-[11px] font-semibold transition border border-red-300"
              >
                Reset Flow
              </button>
            )}
          </div>
        )}

        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-lg bg-white/90 border border-[#e9edef] text-[11px] font-medium text-[#667781] shadow-2xs uppercase tracking-wider">
            Today
          </span>
        </div>

        {/* Message Bubbles */}
        {activeChat.messages.map((msg) => {
          const isMe = msg.isOutgoing || msg.from === 'me';

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`relative max-w-[75%] md:max-w-[65%] rounded-lg px-3.5 py-2 text-sm shadow-xs transition-all ${
                  isMe
                    ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                    : 'bg-white text-[#111b21] rounded-tl-none border border-[#e9edef]/80'
                }`}
              >
                {/* Sender Name in group chats */}
                {activeChat.isGroup && !isMe && (
                  <p className="text-[11px] font-bold text-[#008069] mb-1">
                    {msg.senderName || 'Member'}
                  </p>
                )}

                {/* Message Body */}
                <p className="leading-relaxed whitespace-pre-wrap break-words text-[13.5px]">
                  {msg.body}
                </p>

                {/* Priority & Triage Meta Tag */}
                {msg.matchedKeywords && msg.matchedKeywords.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {msg.matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.2 rounded text-[10px] bg-red-50 text-red-700 border border-red-200 font-mono"
                      >
                        ⚡ {kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp & Read Receipts */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10.5px] text-[#667781] float-right ml-2 -mb-0.5">
                  {msg.autoReplied && (
                    <span className="text-[#008069] font-medium flex items-center gap-0.5 text-[10px]">
                      <Bot size={11} /> Auto
                    </span>
                  )}
                  <span>{formatTimestamp(msg.timestamp)}</span>
                  {isMe && (
                    <CheckCheck size={14} className="text-[#53bdeb] ml-0.5 inline" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. In-Chat Pending AI Approval Banner */}
      {currentApproval && (
        <div className="p-3 bg-[#f0f2f5] border-t border-amber-300 shadow-xl z-30 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-white rounded-2xl p-3.5 border border-amber-300 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Sparkles size={15} className="text-amber-600" />
                <span>AI Proposed Response (Human Approval Required)</span>
              </div>
              <span className="text-[11px] text-amber-800 font-mono font-bold">
                Priority: {currentApproval.priority}
              </span>
            </div>

            {/* Tone Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#667781] font-medium mr-1">Rewrite Tone:</span>
              {(['professional', 'empathetic', 'brief', 'technical'] as AIDraftTone[]).map((t) => (
                <button
                  key={t}
                  disabled={isRegeneratingDraft}
                  onClick={() => handleToneChange(t)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                    selectedTone === t
                      ? 'bg-[#008069] text-white shadow-xs'
                      : 'bg-[#f0f2f5] text-[#54656f] hover:text-[#111b21] border border-[#e9edef]'
                  }`}
                >
                  {t === 'professional' && '✨ Professional'}
                  {t === 'empathetic' && '💙 Empathetic'}
                  {t === 'brief' && '⚡ Brief'}
                  {t === 'technical' && '🛠 Technical'}
                </button>
              ))}
            </div>

            {/* Draft Content */}
            <div className="p-2.5 bg-[#f0f2f5] rounded-xl border border-[#e9edef] text-xs text-[#111b21] font-mono leading-relaxed shadow-inner">
              {isRegeneratingDraft ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Wand2 size={14} className="animate-spin" />
                  <span>Generating AI draft in {selectedTone} tone...</span>
                </div>
              ) : (
                activeDraftText || currentApproval.message
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => onReject(currentApproval.id)}
                className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-700 rounded-xl text-xs font-semibold transition flex items-center gap-1 border border-red-300"
              >
                <X size={14} />
                <span>Dismiss</span>
              </button>
              <button
                onClick={() => onApprove(currentApproval.id)}
                className="px-4 py-1.5 bg-[#008069] hover:bg-[#008069]/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Check size={15} />
                <span>Approve & Dispatch ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Message Input Bar */}
      <footer className="h-[62px] bg-[#f0f2f5] px-4 flex items-center gap-3 border-t border-[#e9edef] flex-shrink-0 z-20">
        <button 
          type="button"
          title="Emojis"
          className="text-[#54656f] hover:text-[#111b21] transition p-1"
        >
          <Smile size={22} />
        </button>

        <button 
          type="button"
          title="Attachments"
          className="text-[#54656f] hover:text-[#111b21] transition p-1"
        >
          <Paperclip size={20} />
        </button>

        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              requireApproval
                ? "Type reply (will be staged for HITL review)..."
                : "Type a WhatsApp message..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-white text-[#111b21] placeholder-[#667781] text-sm rounded-lg px-4 py-2.5 border border-[#e9edef] focus:outline-none focus:border-[#008069] transition shadow-2xs"
          />

          {inputText.trim() ? (
            <button
              type="submit"
              disabled={isSending}
              title="Send Message"
              className="w-10 h-10 rounded-full bg-[#008069] hover:bg-[#008069]/90 text-white flex items-center justify-center transition shadow-md flex-shrink-0 disabled:opacity-50"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              title="Voice Message"
              className="text-[#54656f] hover:text-[#111b21] transition p-2"
            >
              <Mic size={22} />
            </button>
          )}
        </form>
      </footer>
    </main>
  );
};
