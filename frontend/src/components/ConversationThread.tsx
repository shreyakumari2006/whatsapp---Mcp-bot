import React, { useState } from 'react';
import { Send, MessageSquare, Zap, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { PriorityTier, ChatMessage, ConversationSession } from '../types/whatsapp';
import type { ChatThreadItem } from './ChatFeed';

interface ConversationThreadProps {
  activeChat?: ChatThreadItem;
  onSendMessage: (text: string, requireApproval: boolean) => Promise<void>;
  isSending: boolean;
  activeFlow?: ConversationSession | null;
  onCancelFlow?: (contactJid: string) => void;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  activeChat,
  onSendMessage,
  isSending,
  activeFlow,
  onCancelFlow
}) => {
  const [newMessageText, setNewMessageText] = useState('');
  const [requireApprovalCheck, setRequireApprovalCheck] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeChat) return;
    await onSendMessage(newMessageText, requireApprovalCheck);
    setNewMessageText('');
  };

  const handleSimulateFlowReply = async (text: string) => {
    if (!activeChat) return;
    await onSendMessage(text, false);
  };

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

  if (!activeChat) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
        <MessageSquare size={48} className="text-slate-200 mb-2" />
        <p className="text-sm font-medium">Select a conversation from the feed to start triaging.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-white overflow-hidden">
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
          {activeFlow && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs animate-pulse">
              <Zap size={13} className="text-amber-600 fill-amber-500" />
              Flow Active: Birthday RSVP
            </span>
          )}
          <span className="text-xs text-slate-500">Auto-Responder:</span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            activeChat.isVIP 
              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {activeChat.isVIP ? 'VIP Bypass (Active)' : 'Automated'}
          </span>
        </div>
      </div>

      {/* Stateful Multi-Turn Flow Interactive Control Banner */}
      {activeFlow && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-bold text-amber-950">⚡ Multi-Turn Flow Engine:</span>
            <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-200 font-medium">
              {activeFlow.flowName}
            </span>
            <span className="text-amber-700">
              (Awaiting user RSVP response)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-amber-800 font-semibold">Test Trigger:</span>
            <button
              type="button"
              onClick={() => handleSimulateFlowReply('Yes, definitely coming!')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <CheckCircle2 size={12} /> Simulate "Yes"
            </button>
            <button
              type="button"
              onClick={() => handleSimulateFlowReply("Sorry, I can't make it tonight!")}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <XCircle size={12} /> Simulate "No"
            </button>
            {onCancelFlow && (
              <button
                type="button"
                onClick={() => onCancelFlow(activeChat.chatId)}
                className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} /> Cancel Flow
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {activeChat.messages.map((msg: ChatMessage) => {
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
                  ? 'bg-white text-slate-900 border-2 border-rose-300 rounded-bl-none shadow-xs'
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

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={requireApprovalCheck}
                onChange={(e) => setRequireApprovalCheck(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-700">Require Human Approval (Stage before sending)</span>
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
                  handleSubmit(e);
                }
              }}
              className="flex-1 p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !newMessageText.trim()}
              className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Send size={15} />
              <span>{requireApprovalCheck ? 'Stage' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
