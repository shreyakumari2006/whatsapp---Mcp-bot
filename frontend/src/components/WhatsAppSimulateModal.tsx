import React, { useState } from 'react';
import { X, MessageSquare, Send, Sparkles, Flame, DollarSign, PartyPopper } from 'lucide-react';

interface WhatsAppSimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSimulateModal: React.FC<WhatsAppSimulateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [senderName, setSenderName] = useState('Alex Taylor');
  const [fromNumber, setFromNumber] = useState('1555019010@c.us');
  const [messageBody, setMessageBody] = useState('Happy Birthday Shreya! Are you having a party?');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      label: '🎂 Birthday Wish (FSM Flow)',
      icon: <PartyPopper size={14} className="text-pink-400" />,
      sender: 'Karan Sharma',
      from: '919876543210@c.us',
      body: 'Happy Birthday Shreya! Wishing you an amazing year ahead! 🎉'
    },
    {
      label: '🚨 Critical Database Alert',
      icon: <Flame size={14} className="text-red-400" />,
      sender: 'DevOps Incident Bot',
      from: '1555019003@c.us',
      body: 'CRITICAL ALERT: Payment database node is down! Immediate manual intervention required ASAP. OTP: 948201'
    },
    {
      label: '💰 Pricing Inquiry (Auto-Reply Rule)',
      icon: <DollarSign size={14} className="text-blue-400" />,
      sender: 'New Enterprise Client',
      from: '1555019005@c.us',
      body: 'Hi! Could you share the enterprise pricing details for 250 seats?'
    },
    {
      label: '⚡ RSVP "Yes" (Party Flow)',
      icon: <Sparkles size={14} className="text-emerald-400" />,
      sender: 'Karan Sharma',
      from: '919876543210@c.us',
      body: 'Yes, definitely coming! Count me in for the party! 🥳'
    }
  ];

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/test/incoming-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromNumber,
          senderName: senderName,
          body: messageBody,
          isGroup: false
        })
      });
      if (res.ok) {
        setSuccessNote('Inbound message simulated! Check your chat feed.');
        setTimeout(() => {
          setSuccessNote(null);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to simulate message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#111b21] border border-[#222d34] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 relative text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] flex items-center justify-center">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#e9edef]">Simulate Inbound WhatsApp Message</h2>
            <p className="text-xs text-[#8696a0]">Test AI triage, auto-reply rules, and FSM flows instantly.</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <p className="text-[11px] text-[#8696a0] font-semibold uppercase tracking-wider mb-2">
            Quick Test Scenarios:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSenderName(p.sender);
                  setFromNumber(p.from);
                  setMessageBody(p.body);
                }}
                className="p-2 bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition flex items-center gap-2 group"
              >
                {p.icon}
                <span className="text-xs font-semibold text-[#e9edef] truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSimulate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8696a0] mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8696a0] mb-1">From JID / Phone</label>
              <input
                type="text"
                value={fromNumber}
                onChange={(e) => setFromNumber(e.target.value)}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl px-3 py-2 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8696a0] mb-1">Message Content</label>
            <textarea
              rows={3}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl p-3 text-xs text-[#e9edef] focus:outline-none focus:border-[#00a884] resize-none"
            />
          </div>

          {successNote && (
            <div className="p-2.5 bg-[#00a884]/20 border border-[#00a884]/40 rounded-xl text-[#00a884] text-xs font-semibold text-center animate-in fade-in">
              {successNote}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#202c33] hover:bg-[#2a3942] text-[#8696a0] rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !messageBody.trim()}
              className="px-5 py-2 bg-[#00a884] hover:bg-[#00a884]/90 text-[#111b21] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Simulating...' : 'Dispatch Inbound'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
