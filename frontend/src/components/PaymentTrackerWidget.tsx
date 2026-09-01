import React from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Clock, 
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';
import type { PaymentTarget, PaymentStage } from '../types/whatsapp';

interface PaymentTrackerWidgetProps {
  targets: PaymentTarget[];
  onInitiateCheckin: (id: string) => Promise<void>;
  onDispatchPaymentLink: (id: string) => Promise<void>;
  onSettlePayment: (id: string) => Promise<void>;
}

export const PaymentTrackerWidget: React.FC<PaymentTrackerWidgetProps> = ({
  targets,
  onInitiateCheckin,
  onDispatchPaymentLink,
  onSettlePayment
}) => {
  const pendingTargets = targets.filter((t) => t.stage !== 'PAID');
  const totalOutstanding = pendingTargets.reduce((sum, t) => sum + t.amount, 0);

  const getStageBadge = (stage: PaymentStage) => {
    switch (stage) {
      case 'WARMUP_CHECKIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            1. Warmup Check-in
          </span>
        );
      case 'CONTEXT_BRIDGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            2. Context Bridge
          </span>
        );
      case 'PAYMENT_LINK_SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            3. Link Dispatched
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
            <CheckCircle2 size={12} className="text-emerald-600" />
            4. Settled &amp; Paid
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xs p-6 space-y-5">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-2xs">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Conversational Payment Agent
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                MCP Agent
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Gentle, rapport-first automated payment recovery &amp; settlement workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Total Pending
            </span>
            <span className="text-lg font-black text-slate-900 font-mono">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block font-semibold">Active Targets</span>
            <span className="text-xs font-bold text-slate-800 font-mono">
              {pendingTargets.length} / {targets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Target Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {targets.map((target) => {
          const initials = target.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
          const isPaid = target.stage === 'PAID';

          return (
            <div
              key={target.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isPaid
                  ? 'bg-slate-50/70 border-slate-200 opacity-80'
                  : target.stage === 'PAYMENT_LINK_SENT'
                  ? 'bg-purple-50/30 border-purple-200 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs hover:shadow-md'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{target.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{target.phone}</p>
                    </div>
                  </div>
                  {getStageBadge(target.stage)}
                </div>

                {/* Amount & Reason */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Settlement Item
                    </span>
                    <span className="text-xs font-bold text-slate-800">{target.reason}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                      Amount Due
                    </span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ₹{target.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Last Message Preview */}
                {target.lastMessageSent ? (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                      <MessageSquareQuote size={11} className="text-slate-400" />
                      <span>Last Sent Context:</span>
                    </div>
                    <p className="line-clamp-2 italic text-slate-700 leading-snug">
                      "{target.lastMessageSent}"
                    </p>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic py-1 flex items-center gap-1">
                    <Clock size={11} />
                    <span>Awaiting casual check-in initiation</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100">
                {target.stage === 'WARMUP_CHECKIN' && (
                  <button
                    onClick={() => onInitiateCheckin(target.id)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Sparkles size={13} />
                    <span>1. Start Friendly Check-in</span>
                  </button>
                )}

                {target.stage === 'CONTEXT_BRIDGE' && (
                  <button
                    onClick={() => onDispatchPaymentLink(target.id)}
                    className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send size={13} />
                    <span>2. Send Payment Link</span>
                  </button>
                )}

                {target.stage === 'PAYMENT_LINK_SENT' && (
                  <button
                    onClick={() => onSettlePayment(target.id)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>3. Mark Settled &amp; Paid</span>
                  </button>
                )}

                {target.stage === 'PAID' && (
                  <div className="py-1.5 text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 bg-emerald-50 rounded-xl border border-emerald-200">
                    <ShieldCheck size={14} className="text-emerald-600" />
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
