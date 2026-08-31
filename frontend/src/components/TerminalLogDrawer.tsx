import React from 'react';
import { Terminal, X } from 'lucide-react';
import type { AuditLogEntry } from '../types/whatsapp';

interface TerminalLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
}

export const TerminalLogDrawer: React.FC<TerminalLogDrawerProps> = ({
  isOpen,
  onClose,
  auditLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-950 text-slate-100 shadow-2xl border-l border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200 font-mono text-xs">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-emerald-400" />
          <span className="font-bold">Live Execution & Audit Bus</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {auditLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            No telemetry events recorded yet.
          </div>
        ) : (
          auditLogs.map((log) => (
            <div key={log.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-emerald-400 font-bold">[{log.type}]</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-slate-200 font-semibold">{log.action}</div>
              {log.details && Object.keys(log.details).length > 0 && (
                <pre className="mt-1 text-[10px] text-slate-400 overflow-x-auto bg-black/40 p-1.5 rounded">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
