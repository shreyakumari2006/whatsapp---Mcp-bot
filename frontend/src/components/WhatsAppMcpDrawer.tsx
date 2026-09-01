import React, { useState } from 'react';
import { X, Terminal, Cpu } from 'lucide-react';
import type { AuditLogEntry } from '../types/whatsapp';

interface WhatsAppMcpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const WhatsAppMcpDrawer: React.FC<WhatsAppMcpDrawerProps> = ({
  isOpen,
  onClose,
  auditLogs
}) => {
  const [filter, setFilter] = useState<'ALL' | 'MCP' | 'TRIAGE' | 'SYSTEM'>('ALL');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    if (filter === 'MCP') return log.type === 'MCP_TOOL' || log.action?.includes('MCP');
    if (filter === 'TRIAGE') return log.type === 'TRIAGE';
    if (filter === 'SYSTEM') return log.type === 'SYSTEM';
    return true;
  });

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-full bg-[#111b21] border-l border-[#222d34] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="h-[60px] bg-[#202c33] px-5 flex items-center justify-between border-b border-[#222d34] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00a884]/15 text-[#00a884]">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#e9edef]">MCP Tool Telemetry</h2>
              <p className="text-[11px] text-[#8696a0]">Real-time execution stream via /api/stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8696a0] hover:text-[#e9edef] hover:bg-[#374248] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-[#182229] flex items-center gap-1.5 border-b border-[#222d34]">
          {(['ALL', 'MCP', 'TRIAGE', 'SYSTEM'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                filter === t
                  ? 'bg-[#00a884] text-[#111b21]'
                  : 'bg-[#202c33] text-[#8696a0] hover:text-[#e9edef]'
              }`}
            >
              {t === 'ALL' && 'All Logs'}
              {t === 'MCP' && '⚡ MCP Tools'}
              {t === 'TRIAGE' && '🎯 Triage'}
              {t === 'SYSTEM' && '⚙️ System'}
            </button>
          ))}
        </div>

        {/* Logs Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#8696a0] space-y-2">
              <Terminal size={32} className="mx-auto opacity-40 text-[#00a884]" />
              <p className="text-sm font-medium">No execution logs yet</p>
              <p className="text-xs text-[#8696a0]/70">Trigger an auto-reply or run an MCP tool to view live logs.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isMcp = log.type === 'MCP_TOOL' || log.action?.includes('MCP');

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isMcp
                      ? 'bg-[#0c1317] border-[#00a884]/30 shadow-sm'
                      : 'bg-[#202c33]/70 border-[#2a3942]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isMcp ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40">
                          MCP TOOL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          {log.type || 'EVENT'}
                        </span>
                      )}
                      <span className="text-[11px] text-[#e9edef] font-semibold">
                        {log.action || 'System Log'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8696a0]">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-2 p-2 bg-[#111b21] rounded-lg border border-[#222d34] overflow-x-auto text-[11px] text-[#00a884]">
                      <pre className="whitespace-pre-wrap break-all">
                        {typeof log.details === 'string'
                          ? log.details
                          : JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
