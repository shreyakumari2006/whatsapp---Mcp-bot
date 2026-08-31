import React from 'react';
import { X, Check, Clock, AlertTriangle } from 'lucide-react';
import type { PendingApproval } from '../types/whatsapp';

interface HITLApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingApprovals: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const HITLApprovalModal: React.FC<HITLApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingApprovals,
  onApprove,
  onReject
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock size={20} />
            <h3 className="text-sm font-bold text-slate-900">
              Human-in-the-Loop Approval Queue ({pendingApprovals.length})
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <AlertTriangle size={32} className="mx-auto text-amber-400 mb-2" />
              All staged messages have been processed.
            </div>
          ) : (
            pendingApprovals.map((appr) => (
              <div key={appr.id} className="p-4 bg-amber-50/40 border border-amber-200 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Recipient: {appr.recipientName}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{appr.to}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    STAGE #{appr.id.slice(-6)}
                  </span>
                </div>

                <div className="p-3 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 leading-relaxed font-mono">
                  "{appr.message}"
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => onReject(appr.id)}
                    className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <X size={14} /> Reject & Cancel
                  </button>
                  <button
                    onClick={() => onApprove(appr.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Check size={14} /> Approve & Dispatch
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
