import React from 'react';
import { Radio, Search, QrCode, Clock, Zap, Terminal } from 'lucide-react';
import type { WhatsAppConnectionStatus, AutoReplyRule, PendingApproval } from '../types/whatsapp';

interface NavbarProps {
  status: WhatsAppConnectionStatus;
  user: { id: string; pushname: string } | null;
  pendingApprovals: PendingApproval[];
  rules: AutoReplyRule[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQR: () => void;
  onOpenApprovals: () => void;
  onOpenRuleStudio: () => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  user,
  pendingApprovals,
  rules,
  searchQuery,
  setSearchQuery,
  onOpenQR,
  onOpenApprovals,
  onOpenRuleStudio,
  onOpenAudit
}) => {
  const isOnline = status === 'READY' || status === 'AUTHENTICATED';
  const isQr = status === 'QR_READY';

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shadow-emerald-200">
          <Radio size={20} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-slate-900">WhatsApp MCP Command Center</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">v1.0 Stdio</span>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>{user?.pushname ? `Connected as: ${user.pushname}` : 'LocalAuth Engine Ready'}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live SSE Synchronized
            </span>
          </p>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative w-80 max-w-xs">
        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Search chats, VIPs, or keyword triggers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Actions & Health Telemetry */}
      <div className="flex items-center gap-2.5">
        <div
          onClick={() => isQr && onOpenQR()}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isQr
              ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-pointer animate-pulse'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>{status}</span>
          {isQr && <QrCode size={13} className="ml-1" />}
        </div>

        {pendingApprovals.length > 0 && (
          <button
            onClick={onOpenApprovals}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-xs animate-bounce"
          >
            <Clock size={13} />
            <span>{pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''}</span>
          </button>
        )}

        <button
          onClick={onOpenRuleStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Zap size={14} className="text-amber-500" />
          <span>Rule Studio ({rules.filter((r) => r.enabled).length})</span>
        </button>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Terminal size={14} className="text-emerald-400" />
          <span>Audit Terminal</span>
        </button>
      </div>
    </header>
  );
};
