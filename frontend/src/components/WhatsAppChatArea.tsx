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
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <main className="flex-1 h-full flex flex-col bg-[#0b141a] relative overflow-hidden select-none">
      {/* 1. Top Contact Header Bar */}
      <header className="h-[60px] bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222d34] flex-shrink-0 z-20">
        <div className="flex items-center gap-3 cursor-pointer">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
              activeChat.priority === 'CRITICAL' || activeChat.priority === 'URGENT'
                ? 'bg-gradient-to-br from-red-600 to-rose-700 ring-2 ring-red-500'
                : activeChat.isVIP
                ? 'bg-gradient-to-br from-amber-600 to-yellow-600 ring-2 ring-amber-400'
                : 'bg-gradient-to-br from-slate-700 to-slate-600'
            }`}>
              {getInitials(activeChat.senderName)}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00a884] border-2 border-[#202c33]" />
          </div>

          {/* Contact Details & Online Subtitle */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#e9edef]">
                {activeChat.senderName}
              </span>
              {activeChat.priority === 'CRITICAL' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  CRITICAL
                </span>
              )}
              {activeChat.priority === 'URGENT' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                  URGENT
                </span>
              )}
              {activeChat.isVIP && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VIP
                </span>
              )}
            </div>
            <span className="text-xs text-[#8696a0]">
              {activeFlow ? (
                <span className="text-[#3b82f6] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
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
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-[#111b21] text-[#8696a0] border-[#2a3942] hover:text-[#e9edef]'
            }`}
          >
            <ShieldAlert size={14} className={requireApproval ? 'text-amber-400' : 'text-[#8696a0]'} />
            <span>HITL Mode: {requireApproval ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center gap-1 text-[#aebac1]">
            <button className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]">
              <Search size={19} />
            </button>
            <button className="p-2 rounded-full hover:bg-[#374248] transition text-[#aebac1] hover:text-[#e9edef]">
              <MoreVertical size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Messages Feed with WhatsApp Wallpaper */}
      <div className="flex-1 wa-chat-wallpaper overflow-y-auto px-6 py-4 space-y-3">
        {/* Active Multi-Turn Flow Banner */}
        {activeFlow && (
          <div className="sticky top-2 z-10 mx-auto max-w-md bg-[#111b21]/95 backdrop-blur border border-[#3b82f6]/40 rounded-2xl p-3 shadow-xl flex items-center justify-between text-xs text-[#e9edef]">
            <div className="flex items-center gap-2">
              <span className="text-base">🎂</span>
              <div>
                <p className="font-semibold text-white">Party RSVP Conversation Flow</p>
                <p className="text-[11px] text-[#8696a0]">State: <strong className="text-[#3b82f6] font-mono">{activeFlow.currentStep}</strong></p>
              </div>
            </div>
            {onCancelFlow && (
              <button
                onClick={() => onCancelFlow(activeFlow.contactJid)}
                className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[11px] font-semibold transition border border-red-500/30"
              >
                Reset Flow
              </button>
            )}
          </div>
        )}

        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-lg bg-[#182229] text-[11px] font-medium text-[#8696a0] shadow-sm uppercase tracking-wider">
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
                className={`relative max-w-[75%] md:max-w-[65%] rounded-lg px-3 py-2 text-sm shadow-md transition-all ${
                  isMe
                    ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none bubble-out'
                    : 'bg-[#202c33] text-[#e9edef] rounded-tl-none bubble-in'
                }`}
              >
                {/* Sender Name in group chats */}
                {activeChat.isGroup && !isMe && (
                  <p className="text-[11px] font-bold text-[#00a884] mb-1">
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
                        className="px-1.5 py-0.2 rounded text-[10px] bg-red-950/80 text-red-300 border border-red-500/30 font-mono"
                      >
                        ⚡ {kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp & Read Receipts */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[10.5px] text-[#8696a0] float-right ml-2 -mb-0.5">
                  {msg.autoReplied && (
                    <span className="text-[#00a884] font-medium flex items-center gap-0.5 text-[10px]">
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
        <div className="p-3 bg-[#111b21] border-t border-[#3b82f6]/40 shadow-2xl z-30 animate-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#202c33] rounded-2xl p-3 border border-[#2a3942] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles size={15} className="text-[#3b82f6]" />
                <span>AI Proposed Response (Human Approval Required)</span>
              </div>
              <span className="text-[11px] text-amber-400 font-mono">
                Priority: {currentApproval.priority}
              </span>
            </div>

            {/* Tone Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#8696a0] font-medium mr-1">Rewrite Tone:</span>
              {(['professional', 'empathetic', 'brief', 'technical'] as AIDraftTone[]).map((t) => (
                <button
                  key={t}
                  disabled={isRegeneratingDraft}
                  onClick={() => handleToneChange(t)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                    selectedTone === t
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#111b21] text-[#8696a0] hover:text-[#e9edef] border border-[#2a3942]'
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
            <div className="p-2.5 bg-[#111b21] rounded-xl border border-[#2a3942] text-xs text-[#e9edef] font-mono leading-relaxed">
              {isRegeneratingDraft ? (
                <div className="flex items-center gap-2 text-blue-400">
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
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-semibold transition flex items-center gap-1 border border-red-500/30"
              >
                <X size={14} />
                <span>Dismiss</span>
              </button>
              <button
                onClick={() => onApprove(currentApproval.id)}
                className="px-4 py-1.5 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg"
              >
                <Check size={15} />
                <span>Approve & Dispatch ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Message Input Bar */}
      <footer className="h-[62px] bg-[#202c33] px-4 flex items-center gap-3 border-t border-[#222d34] flex-shrink-0 z-20">
        <button 
          type="button"
          title="Emojis"
          className="text-[#8696a0] hover:text-[#e9edef] transition p-1"
        >
          <Smile size={22} />
        </button>

        <button 
          type="button"
          title="Attachments"
          className="text-[#8696a0] hover:text-[#e9edef] transition p-1"
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
            className="flex-1 bg-[#2a3942] text-[#e9edef] placeholder-[#8696a0] text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#00a884]/50 transition"
          />

          {inputText.trim() ? (
            <button
              type="submit"
              disabled={isSending}
              title="Send Message"
              className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] flex items-center justify-center transition shadow-lg flex-shrink-0 disabled:opacity-50"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              title="Voice Message"
              className="text-[#8696a0] hover:text-[#e9edef] transition p-2"
            >
              <Mic size={22} />
            </button>
          )}
        </form>
      </footer>
    </main>
  );
};
