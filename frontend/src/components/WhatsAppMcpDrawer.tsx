import React, { useState } from 'react';
import { X, Terminal, Cpu, Activity, Zap, Bot } from 'lucide-react';
import type { AuditLogEntry, TelemetryMetrics } from '../types/whatsapp';

interface WhatsAppMcpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  analytics?: TelemetryMetrics;
}

export const WhatsAppMcpDrawer: React.FC<WhatsAppMcpDrawerProps> = ({
  isOpen,
  onClose,
  auditLogs,
  analytics
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg h-full bg-white border-l border-[#e9edef] flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="h-[60px] bg-[#f0f2f5] px-5 flex items-center justify-between border-b border-[#e9edef] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#008069]/15 text-[#008069]">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#111b21]">MCP Tool Telemetry</h2>
              <p className="text-[11px] text-[#667781]">Real-time execution stream via /api/stream</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667781] hover:text-[#111b21] hover:bg-[#e9edef] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Telemetry Radar Metrics Card (if available) */}
        {analytics && (
          <div className="p-3.5 bg-[#f0f2f5] border-b border-[#e9edef] space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#111b21] flex items-center gap-1.5">
                <Activity size={13} className="text-[#008069]" />
                Live Engine Radar
              </span>
              <span className="text-[#667781] font-mono">
                {analytics.totalMessagesProcessed} msgs processed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-white border border-[#e9edef] shadow-2xs">
                <span className="text-[#667781] block text-[9px]">Latency</span>
                <span className="text-xs font-bold text-[#008069] font-mono flex items-center justify-center gap-1">
                  <Zap size={11} /> {analytics.avgTriageLatencyMs}ms
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-[#e9edef] shadow-2xs">
                <span className="text-[#667781] block text-[9px]">Suppression</span>
                <span className="text-xs font-bold text-blue-600 font-mono flex items-center justify-center gap-1">
                  <Bot size={11} /> {analytics.botSuppressionRate}%
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-[#e9edef] shadow-2xs">
                <span className="text-[#667781] block text-[9px]">Approvals</span>
                <span className="text-xs font-bold text-amber-700 font-mono">
                  {analytics.humanApprovalsPending} pending
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="px-4 py-2.5 bg-white flex items-center gap-1.5 border-b border-[#e9edef]">
          {(['ALL', 'MCP', 'TRIAGE', 'SYSTEM'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                filter === t
                  ? 'bg-[#008069] text-white shadow-xs'
                  : 'bg-[#f0f2f5] text-[#54656f] hover:text-[#111b21]'
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-[#f8fafc]">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-[#667781] space-y-2">
              <Terminal size={32} className="mx-auto opacity-40 text-[#008069]" />
              <p className="text-sm font-medium">No execution logs yet</p>
              <p className="text-xs text-[#667781]/70">Trigger an auto-reply or run an MCP tool to view live logs.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isMcp = log.type === 'MCP_TOOL' || log.action?.includes('MCP');

              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isMcp
                      ? 'bg-white border-[#008069]/40 shadow-xs'
                      : 'bg-white border-[#e9edef] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isMcp ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#008069]/15 text-[#008069] border border-[#008069]/30">
                          MCP TOOL
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-300">
                          {log.type || 'EVENT'}
                        </span>
                      )}
                      <span className="text-[11px] text-[#111b21] font-semibold">
                        {log.action || 'System Log'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#667781]">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  {log.details && (
                    <div className="mt-2 p-2 bg-[#f0f2f5] rounded-lg border border-[#e9edef] overflow-x-auto text-[11px] text-[#008069]">
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(log.details, null, 2)}
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
