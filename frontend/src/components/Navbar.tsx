import React from 'react';
import { Search, QrCode, Clock, Zap, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import type { WhatsAppConnectionStatus, AutoReplyRule, PendingApproval } from '../types/whatsapp';

interface NavbarProps {
  status: WhatsAppConnectionStatus;
  user: { id: string; pushname: string } | null;
  pendingApprovals: PendingApproval[];
  rules: AutoReplyRule[];
  pendingPaymentsCount?: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenQR: () => void;
  onOpenApprovals: () => void;
  onOpenRuleStudio: () => void;
  onOpenAudit: () => void;
  onOpenPayments: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  status,
  user,
  pendingApprovals,
  rules,
  pendingPaymentsCount = 0,
  searchQuery,
  setSearchQuery,
  onOpenQR,
  onOpenApprovals,
  onOpenRuleStudio,
  onOpenAudit,
  onOpenPayments
}) => {
  const isOnline = status === 'READY' || status === 'AUTHENTICATED';
  const isQr = status === 'QR_READY';

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-20 shadow-xs">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-emerald-200">
          ((•))
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              WhatsApp MCP Command Center
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              v1.0 Stdio
            </span>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{user?.pushname ? `Connected: ${user.pushname}` : 'Live SSE Synchronized'}</span>
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-lg mx-2 lg:mx-6 relative hidden md:block">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search chats, VIPs, or keyword triggers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right: Actions & Status Badge */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Status Indicator */}
        <button
          type="button"
          onClick={() => isQr && onOpenQR()}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isQr
              ? 'bg-amber-50 text-amber-800 border-amber-300 cursor-pointer animate-pulse hover:bg-amber-100'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
          title={isQr ? 'Click to scan QR code' : `Connection Status: ${status}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500' : isQr ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
          <span className="capitalize">{status.toLowerCase()}</span>
          {isQr ? (
            <QrCode size={13} className="ml-0.5 text-amber-700" />
          ) : isOnline ? (
            <CheckCircle2 size={13} className="ml-0.5 text-emerald-600" />
          ) : (
            <AlertCircle size={13} className="ml-0.5 text-rose-600" />
          )}
        </button>

        {/* HITL Approvals Alert Button */}
        {pendingApprovals.length > 0 && (
          <button
            onClick={onOpenApprovals}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shadow-xs hover:bg-amber-100 transition-colors whitespace-nowrap"
          >
            <Clock size={13} />
            <span>{pendingApprovals.length} Approval{pendingApprovals.length > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* Payment Agent Button */}
        <button
          onClick={onOpenPayments}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shadow-2xs"
        >
          <span className="text-sm">💳</span>
          <span className="hidden sm:inline">Payment Agent</span>
          {pendingPaymentsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-800 text-[10px]">
              {pendingPaymentsCount}
            </span>
          )}
        </button>

        {/* Rule Studio Button */}
        <button
          onClick={onOpenRuleStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shadow-2xs"
        >
          <Zap size={13} className="text-amber-500" />
          <span className="hidden lg:inline">Rule Studio</span>
          <span className="text-slate-500 text-[11px]">({rules.filter((r) => r.enabled).length})</span>
        </button>

        {/* Audit Terminal Button */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        >
          <Terminal size={13} className="text-emerald-400" />
          <span>Audit Terminal</span>
        </button>
      </div>
    </header>
  );
};
