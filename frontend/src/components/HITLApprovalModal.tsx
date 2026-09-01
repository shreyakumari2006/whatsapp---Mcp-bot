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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#111b21] rounded-3xl border border-[#222d34] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#222d34] flex items-center justify-between bg-[#202c33]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#e9edef] flex items-center gap-2">
                Human-in-the-Loop Approval Queue
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  {pendingApprovals.length} pending
                </span>
              </h3>
              <p className="text-[11px] text-[#8696a0]">
                Review, refine with AI tone generation, and dispatch outbound messages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-16 text-[#8696a0] text-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#202c33] text-[#8696a0] mx-auto flex items-center justify-center mb-3">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <p className="font-bold text-[#e9edef] text-sm">No Pending Approvals</p>
              <p className="text-[#8696a0] text-xs mt-1">All staged messages and dispatches have been resolved.</p>
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
                  className="p-5 bg-[#202c33] border border-[#2a3942] rounded-2xl shadow-sm space-y-4 transition-all"
                >
                  {/* Ticket Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#e9edef] text-sm">{appr.recipientName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                          STAGE #{appr.id.slice(-6)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#111b21] text-[#8696a0] font-bold text-[10px]">
                          {appr.priority}
                        </span>
                      </div>
                      <span className="text-[#8696a0] font-mono text-[11px] block mt-0.5">{appr.to}</span>
                    </div>

                    <div className="text-[11px] text-[#8696a0] font-mono">
                      {new Date(appr.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* AI Dynamic Draft Generator Section */}
                  <div className="p-4 bg-[#111b21] border border-[#2a3942] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#e9edef]">
                        <Sparkles size={14} className="text-[#00a884]" />
                        <span>AI Smart Draft Generator</span>
                      </div>

                      {draft && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 flex items-center gap-1">
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
                              ? 'bg-[#00a884] text-[#111b21] border-[#00a884] shadow-sm font-bold'
                              : 'bg-[#202c33] text-[#8696a0] border-[#2a3942] hover:text-[#e9edef] hover:bg-[#2a3942]'
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
                        className="flex-1 px-3 py-1.5 bg-[#202c33] border border-[#2a3942] rounded-lg text-xs text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none focus:border-[#00a884]"
                      />
                      <button
                        type="button"
                        onClick={() => handleGenerate(appr.id)}
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            Drafting...
                          </>
                        ) : (
                          <>
                            <Wand2 size={13} className="text-[#111b21]" />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Reasoning Banner */}
                    {draft && (
                      <div className="p-2.5 bg-[#005c4b]/30 border border-[#00a884]/40 rounded-lg text-[11px] text-emerald-200 leading-relaxed flex items-start gap-2">
                        <MessageSquareQuote size={14} className="text-[#00a884] mt-0.5 shrink-0" />
                        <div>
                          <strong className="font-semibold text-white">AI Triage Reasoning:</strong> {draft.reasoning}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editable Final Response Area */}
                  <div>
                    <label className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider block mb-1.5">
                      Dispatch Message Copy (Editable)
                    </label>
                    <textarea
                      rows={3}
                      value={currentMessage}
                      onChange={(e) => setEditedMessages((prev) => ({ ...prev, [appr.id]: e.target.value }))}
                      className="w-full p-3 bg-[#111b21] border border-[#2a3942] rounded-xl text-xs text-[#e9edef] font-sans leading-relaxed focus:outline-none focus:border-[#00a884] focus:ring-1 focus:ring-[#00a884]"
                      placeholder="Type or refine message to send..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 justify-end pt-1">
                    <button
                      onClick={() => onReject(appr.id)}
                      className="px-4 py-2 bg-[#111b21] hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Reject & Cancel
                    </button>
                    <button
                      onClick={() => onApprove(appr.id)}
                      className="px-6 py-2 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
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
