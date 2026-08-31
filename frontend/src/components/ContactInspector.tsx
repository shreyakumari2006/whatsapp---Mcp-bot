import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';
import type { PendingApproval } from '../types/whatsapp';
import type { ChatThreadItem } from './ChatFeed';

interface ContactInspectorProps {
  activeChat?: ChatThreadItem;
  pendingApprovals: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const ContactInspector: React.FC<ContactInspectorProps> = ({
  activeChat,
  pendingApprovals,
  onApprove,
  onReject
}) => {
  return (
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
                    onClick={() => onApprove(appr.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Check size={13} /> Approve
                  </button>
                  <button
                    onClick={() => onReject(appr.id)}
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
  );
};
