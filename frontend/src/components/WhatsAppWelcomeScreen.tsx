import React from 'react';
import { Lock, Bot, ShieldCheck, Sparkles, Terminal, MessageSquare } from 'lucide-react';

interface WhatsAppWelcomeScreenProps {
  onSimulateChat: () => void;
  onOpenAudit: () => void;
  onOpenPayments: () => void;
}

export const WhatsAppWelcomeScreen: React.FC<WhatsAppWelcomeScreenProps> = ({
  onSimulateChat,
  onOpenAudit,
  onOpenPayments
}) => {
  return (
    <div className="flex-1 h-full bg-[#f0f2f5] flex flex-col items-center justify-center p-8 text-center border-b-[6px] border-[#008069] select-none">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        {/* Lock / WhatsApp Shield Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white border border-[#e9edef] flex items-center justify-center text-[#008069] shadow-md">
            <Bot size={48} className="animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#008069] text-white flex items-center justify-center shadow-lg font-bold">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-light text-[#111b21] tracking-tight">
            WhatsApp Web <span className="font-semibold text-[#008069]">MCP Bot</span>
          </h1>
          <p className="text-xs text-[#667781] leading-relaxed">
            Automate intelligent customer conversations with real-time AI triage, Finite State Machine dialogues, and Human-in-the-Loop approval workflows.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="grid grid-cols-3 gap-2.5 w-full pt-2">
          <button
            onClick={onSimulateChat}
            className="p-3 bg-white hover:bg-[#f5f6f6] border border-[#e9edef] rounded-xl text-left transition space-y-1 group shadow-2xs"
          >
            <MessageSquare size={16} className="text-[#008069] group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#111b21]">Simulate</p>
            <p className="text-[10px] text-[#667781]">Test incoming msg</p>
          </button>

          <button
            onClick={onOpenPayments}
            className="p-3 bg-white hover:bg-[#f5f6f6] border border-[#e9edef] rounded-xl text-left transition space-y-1 group shadow-2xs"
          >
            <ShieldCheck size={16} className="text-blue-600 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#111b21]">Payments</p>
            <p className="text-[10px] text-[#667781]">Payment agent</p>
          </button>

          <button
            onClick={onOpenAudit}
            className="p-3 bg-white hover:bg-[#f5f6f6] border border-[#e9edef] rounded-xl text-left transition space-y-1 group shadow-2xs"
          >
            <Terminal size={16} className="text-amber-600 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-[#111b21]">MCP Logs</p>
            <p className="text-[10px] text-[#667781]">Telemetry feed</p>
          </button>
        </div>

        {/* Encrypted Footer */}
        <div className="flex items-center gap-1.5 text-xs text-[#667781] pt-4">
          <Lock size={13} className="text-[#008069]" />
          <span>End-to-end encrypted session via local MCP node</span>
        </div>
      </div>
    </div>
  );
};
