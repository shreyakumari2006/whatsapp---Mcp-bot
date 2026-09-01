import React, { useState } from 'react';
import { X, Check, Clock, AlertTriangle, Sparkles, Wand2, RefreshCw, MessageSquareQuote } from 'lucide-react';
import type { PendingApproval, AIDraftTone, AIDraftResponse } from '../types/whatsapp';

interface HITLApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingApprovals: PendingApproval[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onGenerateDraft?: (approvalId: string, tone: AIDraftTone, customInstruction?: string) => Promise<AIDraftResponse | null>;
}

export const HITLApprovalModal: React.FC<HITLApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingApprovals,
  onApprove,
  onReject,
  onGenerateDraft
}) => {
  const [selectedTone, setSelectedTone] = useState<Record<string, AIDraftTone>>({});
  const [customInstructions, setCustomInstructions] = useState<Record<string, string>>({});
  const [draftResponses, setDraftResponses] = useState<Record<string, AIDraftResponse>>({});
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [editedMessages, setEditedMessages] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleToneClick = async (apprId: string, tone: AIDraftTone) => {
    setSelectedTone((prev) => ({ ...prev, [apprId]: tone }));
    if (!onGenerateDraft) return;
    const custom = customInstructions[apprId];

    setIsGenerating((prev) => ({ ...prev, [apprId]: true }));
    try {
      const result = await onGenerateDraft(apprId, tone, custom);
      if (result) {
        setDraftResponses((prev) => ({ ...prev, [apprId]: result }));
        setEditedMessages((prev) => ({ ...prev, [apprId]: result.suggestedReply }));
      }
    } catch (err) {
      console.error('Error generating AI draft:', err);
    } finally {
      setIsGenerating((prev) => ({ ...prev, [apprId]: false }));
    }
  };

  const handleGenerate = async (apprId: string) => {
    const tone = selectedTone[apprId] || 'professional';
    await handleToneClick(apprId, tone);
  };

  const tones: Array<{ id: AIDraftTone; label: string; icon: string }> = [
    { id: 'professional', label: '✨ Professional', icon: '✨' },
    { id: 'empathetic', label: '💙 Empathetic', icon: '💙' },
    { id: 'brief', label: '⚡ Brief / Direct', icon: '⚡' },
    { id: 'technical', label: '🛠 Technical Escalation', icon: '🛠' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Human-in-the-Loop Approval Queue
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  {pendingApprovals.length} pending
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Review, refine with AI tone generation, and dispatch outbound tickets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <p className="font-bold text-slate-700 text-sm">No Pending Approvals</p>
              <p className="text-slate-400 text-xs mt-1">All staged messages and dispatches have been resolved.</p>
            </div>
          ) : (
            pendingApprovals.map((appr) => {
              const currentTone = selectedTone[appr.id] || 'professional';
              const draft = draftResponses[appr.id];
              const loading = isGenerating[appr.id] || false;
              const currentMessage = editedMessages[appr.id] !== undefined ? editedMessages[appr.id] : appr.message;

              return (
                <div
                  key={appr.id}
                  className="p-5 bg-white border-2 border-amber-200/80 rounded-2xl shadow-xs space-y-4 transition-all"
                >
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{appr.recipientName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                          STAGE #{appr.id.slice(-6)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {appr.priority}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px] block mt-0.5">{appr.to}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(appr.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* AI Dynamic Draft Generator Section */}
                  <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Sparkles size={14} className="text-emerald-600" />
                        <span>AI Smart Draft Generator</span>
                      </div>

                      {draft && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Check size={11} /> Confidence: {Math.round(draft.confidenceScore * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Tone Selector Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {tones.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToneClick(appr.id, t.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            currentTone === t.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom directive & Action button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Optional custom instruction (e.g. 'mention 20% discount')..."
                        value={customInstructions[appr.id] || ''}
                        onChange={(e) => setCustomInstructions((prev) => ({ ...prev, [appr.id]: e.target.value }))}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerate(appr.id)}
                        disabled={loading}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Drafting...
                          </>
                        ) : (
                          <>
                            <Wand2 size={13} className="text-emerald-400" />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Reasoning Banner */}
                    {draft && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-[11px] text-emerald-900 leading-relaxed flex items-start gap-2">
                        <MessageSquareQuote size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                        <div>
                          <strong className="font-semibold">AI Triage Reasoning:</strong> {draft.reasoning}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editable Final Response Area */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Dispatch Message Copy (Editable)
                    </label>
                    <textarea
                      rows={3}
                      value={currentMessage}
                      onChange={(e) => setEditedMessages((prev) => ({ ...prev, [appr.id]: e.target.value }))}
                      className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-sans leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="Type or refine message to send..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 justify-end pt-1">
                    <button
                      onClick={() => onReject(appr.id)}
                      className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Reject & Cancel
                    </button>
                    <button
                      onClick={() => onApprove(appr.id)}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Check size={14} /> Approve & Dispatch
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
