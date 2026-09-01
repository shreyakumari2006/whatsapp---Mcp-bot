import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Clock, 
  MessageSquareQuote, 
  ShieldCheck, 
  Edit2, 
  Check, 
  Search, 
  Phone, 
  RotateCcw,
  X
} from 'lucide-react';
import type { PaymentTarget, PaymentStage } from '../types/whatsapp';

interface PaymentTrackerWidgetProps {
  targets?: PaymentTarget[];
  onInitiateCheckin: (id: string) => Promise<void>;
  onDispatchPaymentLink: (id: string) => Promise<void>;
  onSettlePayment: (id: string) => Promise<void>;
  onUpdateTarget?: (id: string, updates: Partial<PaymentTarget>) => Promise<void>;
  onAutoMatch?: () => Promise<{ matched: number; updates: any[] } | null>;
}

export const PaymentTrackerWidget: React.FC<PaymentTrackerWidgetProps> = ({
  targets = [],
  onInitiateCheckin,
  onDispatchPaymentLink,
  onSettlePayment,
  onUpdateTarget,
  onAutoMatch
}) => {
  const safeTargets = Array.isArray(targets) ? targets : [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<string | null>(null);

  const pendingTargets = safeTargets.filter((t) => t && t.stage !== 'PAID');
  const totalOutstanding = pendingTargets.reduce((sum, t) => sum + (Number(t?.amount) || 0), 0);

  const handleStartEdit = (target: PaymentTarget) => {
    if (!target) return;
    setEditingId(target.id);
    const initialPhone = target.phone || (target.contactJid ? target.contactJid.replace('@c.us', '') : '');
    setEditPhone(initialPhone);
  };

  const handleSaveEdit = async (targetId: string) => {
    if (!editPhone || !editPhone.trim()) {
      setEditingId(null);
      return;
    }
    const cleanNumber = editPhone.replace(/[^0-9]/g, '');
    const formattedPhone = editPhone.startsWith('+') ? editPhone : `+${cleanNumber}`;
    const contactJid = `${cleanNumber}@c.us`;

    if (onUpdateTarget) {
      try {
        await onUpdateTarget(targetId, {
          phone: formattedPhone,
          contactJid: contactJid
        });
      } catch (err) {
        console.error('Failed to update contact:', err);
      }
    }
    setEditingId(null);
  };

  const handleAutoMatch = async () => {
    if (!onAutoMatch) return;
    setIsMatching(true);
    setMatchResult(null);
    try {
      const res = await onAutoMatch();
      if (res && res.matched > 0) {
        setMatchResult(`✔ Auto-linked ${res.matched} contact(s) directly from WhatsApp!`);
      } else {
        setMatchResult('ℹ️ No exact name match found. You can enter phone numbers directly using ✏️ Edit.');
      }
    } catch (e) {
      setMatchResult('⚠️ Could not match contacts automatically.');
    } finally {
      setIsMatching(false);
      setTimeout(() => setMatchResult(null), 6000);
    }
  };

  const getStageBadge = (stage?: PaymentStage) => {
    switch (stage) {
      case 'WARMUP_CHECKIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            1. Warmup Check-in
          </span>
        );
      case 'CONTEXT_BRIDGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            2. Context Bridge
          </span>
        );
      case 'PAYMENT_LINK_SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            3. Link Dispatched
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 text-[11px] font-bold">
            <CheckCircle2 size={12} className="text-[#00a884]" />
            4. Settled &amp; Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#202c33] text-[#8696a0] border border-[#2a3942] text-[11px] font-bold">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-[#111b21] border border-[#222d34] rounded-3xl shadow-2xl p-6 space-y-5 select-none">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222d34]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center font-bold text-lg">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#e9edef] flex items-center gap-2">
              Conversational Payment Agent
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 font-mono font-bold">
                MCP Agent
              </span>
            </h3>
            <p className="text-xs text-[#8696a0]">
              Direct phone dispatch &amp; automated conversational payment collection
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onAutoMatch && (
            <button
              onClick={handleAutoMatch}
              disabled={isMatching}
              className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] border border-[#00a884]/40 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              title="Automatically match contacts from your active WhatsApp address book"
            >
              {isMatching ? <RotateCcw size={13} className="animate-spin" /> : <Search size={13} />}
              <span>Auto-Detect WhatsApp Contacts</span>
            </button>
          )}

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8696a0] block">
              Total Pending
            </span>
            <span className="text-lg font-black text-[#e9edef] font-mono">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-[#202c33] border border-[#2a3942] rounded-xl text-center">
            <span className="text-[10px] text-[#8696a0] block font-semibold">Active Targets</span>
            <span className="text-xs font-bold text-[#e9edef] font-mono">
              {pendingTargets.length} / {safeTargets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Auto match feedback alert */}
      {matchResult && (
        <div className="p-3 rounded-xl bg-[#202c33] border border-[#00a884]/40 text-xs text-[#00a884] font-medium animate-in fade-in">
          {matchResult}
        </div>
      )}

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {safeTargets.map((target) => {
          if (!target) return null;

          const targetName = target.name || 'Recipient';
          const initials = targetName
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0] || '')
            .join('')
            .toUpperCase() || 'U';

          const isPaid = target.stage === 'PAID';
          const isEditing = editingId === target.id;
          const displayPhone = target.phone || (target.contactJid ? target.contactJid.replace('@c.us', '') : 'No number set');
          const destinationJid = target.contactJid || 'Not linked';
          const displayAmount = (Number(target.amount) || 0).toLocaleString('en-IN');

          return (
            <div
              key={target.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isPaid
                  ? 'bg-[#202c33]/50 border-[#2a3942] opacity-70'
                  : target.stage === 'PAYMENT_LINK_SENT'
                  ? 'bg-[#202c33] border-purple-500/40 shadow-sm'
                  : 'bg-[#202c33] border-[#2a3942] shadow-sm hover:border-[#00a884]/50'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#111b21] border border-[#2a3942] flex items-center justify-center text-[#e9edef] font-bold text-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#e9edef]">{targetName}</h4>
                      
                      {/* Phone Number / Direct JID Display & Editor */}
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="text-xs px-2 py-0.5 border border-[#00a884] rounded-md w-32 font-mono focus:outline-none focus:ring-1 focus:ring-[#00a884] bg-[#111b21] text-[#e9edef]"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(target.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(target.id)}
                            className="p-1 rounded bg-[#00a884] text-[#111b21] hover:bg-[#00a884]/90 font-bold"
                            title="Save Phone Number"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 rounded bg-[#111b21] text-[#8696a0] hover:text-[#e9edef]"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-[#8696a0] font-mono font-semibold flex items-center gap-1">
                            <Phone size={10} className="text-[#8696a0]" />
                            {displayPhone}
                          </span>
                          <button
                            onClick={() => handleStartEdit(target)}
                            className="text-[10px] text-[#8696a0] hover:text-[#00a884] p-0.5 rounded transition-colors"
                            title="Change or enter exact recipient phone number"
                          >
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {getStageBadge(target.stage)}
                </div>

                {/* Recipient Destination Preview */}
                <div className="mb-2 px-2.5 py-1 bg-[#111b21] rounded-lg border border-[#2a3942] flex items-center justify-between text-[10px] text-[#8696a0] font-mono">
                  <span>Destination:</span>
                  <span className="font-bold text-[#00a884] truncate max-w-[140px]" title={destinationJid}>
                    {destinationJid}
                  </span>
                </div>

                {/* Amount & Reason */}
                <div className="p-3 bg-[#111b21] border border-[#2a3942] rounded-xl mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-[#8696a0] uppercase block">
                      Settlement Item
                    </span>
                    <span className="text-xs font-bold text-[#e9edef]">{target.reason || 'Settlement'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-[#8696a0] uppercase block">
                      Amount Due
                    </span>
                    <span className="text-sm font-black text-[#e9edef] font-mono">
                      ₹{displayAmount}
                    </span>
                  </div>
                </div>

                {/* Last Message Preview */}
                {target.lastMessageSent ? (
                  <div className="p-2.5 bg-[#111b21] border border-[#2a3942] rounded-lg text-[11px] text-[#8696a0] space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#8696a0] uppercase">
                      <MessageSquareQuote size={11} className="text-[#8696a0]" />
                      <span>Last Sent Context:</span>
                    </div>
                    <p className="line-clamp-2 italic text-[#e9edef] leading-snug">
                      "{target.lastMessageSent}"
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8696a0] italic py-1 flex items-center gap-1">
                    <Clock size={11} />
                    <span>Awaiting casual check-in initiation</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#2a3942]">
                {target.stage === 'WARMUP_CHECKIN' && (
                  <button
                    onClick={() => onInitiateCheckin(target.id)}
                    className="w-full py-2 px-3 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Sparkles size={13} />
                    <span>1. Send Friendly Check-in</span>
                  </button>
                )}

                {target.stage === 'CONTEXT_BRIDGE' && (
                  <button
                    onClick={() => onDispatchPaymentLink(target.id)}
                    className="w-full py-2 px-3 bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send size={13} />
                    <span>2. Send Payment Link</span>
                  </button>
                )}

                {target.stage === 'PAYMENT_LINK_SENT' && (
                  <button
                    onClick={() => onSettlePayment(target.id)}
                    className="w-full py-2 px-3 bg-[#2a3942] hover:bg-[#374248] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors border border-[#374248]"
                  >
                    <CheckCircle2 size={13} className="text-[#00a884]" />
                    <span>3. Mark Settled &amp; Paid</span>
                  </button>
                )}

                {target.stage === 'PAID' && (
                  <div className="py-1.5 text-center text-xs font-bold text-[#00a884] flex items-center justify-center gap-1 bg-[#00a884]/15 rounded-xl border border-[#00a884]/30">
                    <ShieldCheck size={14} className="text-[#00a884]" />
                    <span>Payment Completed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
