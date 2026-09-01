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
    <div className="flex-1 h-full bg-[#222e35] flex flex-col items-center justify-center p-8 text-center border-b-[6px] border-[#00a884] select-none">
      <div className="max-w-md w-full flex flex-col items-center space-y-6">
        {/* Lock / WhatsApp Shield Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[#111b21] border border-[#2a3942] flex items-center justify-center text-[#00a884] shadow-2xl">
            <Bot size={48} className="animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center shadow-lg font-bold">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-light text-[#e9edef] tracking-tight">
            WhatsApp Web <span className="font-semibold text-[#00a884]">MCP Bot</span>
          </h1>
          <p className="text-xs text-[#8696a0] leading-relaxed">
            Automate intelligent customer conversations with real-time AI triage, Finite State Machine dialogues, and Human-in-the-Loop approval workflows.
          </p>
        </div>

        {/* Quick Action Badges */}
        <div className="grid grid-cols-3 gap-2 w-full pt-2">
          <button
            onClick={onSimulateChat}
            className="p-3 bg-[#111b21]/80 hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition space-y-1 group"
          >
            <MessageSquare size={16} className="text-[#00a884] group-hover:scale-110 transition" />
            <p className="text-xs font-semibold text-[#e9edef]">Simulate</p>
            <p className="text-[10px] text-[#8696a0]">Test incoming message</p>
          </button>

          <button
            onClick={onOpenPayments}
            className="p-3 bg-[#111b21]/80 hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition space-y-1 group"
          >
            <ShieldCheck size={16} className="text-[#3b82f6] group-hover:scale-110 transition" />
            <p className="text-xs font-semibold text-[#e9edef]">Payments</p>
            <p className="text-[10px] text-[#8696a0]">Conversational agent</p>
          </button>

          <button
            onClick={onOpenAudit}
            className="p-3 bg-[#111b21]/80 hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition space-y-1 group"
          >
            <Terminal size={16} className="text-amber-400 group-hover:scale-110 transition" />
            <p className="text-xs font-semibold text-[#e9edef]">MCP Logs</p>
            <p className="text-[10px] text-[#8696a0]">Live tool execution</p>
          </button>
        </div>

        {/* End to End Encryption Banner */}
        <div className="pt-8 flex items-center justify-center gap-2 text-xs text-[#8696a0]">
          <Lock size={13} className="text-[#8696a0]" />
          <span>End-to-end encrypted with NitroStack MCP Protocol</span>
        </div>
      </div>
    </div>
  );
};
