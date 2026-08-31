import React, { useState } from 'react';
import { 
  Zap, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Bot, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import type { TelemetryMetrics } from '../types/whatsapp';

interface AnalyticsRadarProps {
  analytics: TelemetryMetrics;
}

export const AnalyticsRadar: React.FC<AnalyticsRadarProps> = ({ analytics }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    triageDistribution,
    avgTriageLatencyMs,
    botSuppressionRate,
    humanApprovalsPending,
    humanApprovalsResolved,
    totalMessagesProcessed,
    automatedRepliesSent
  } = analytics;

  const total = Math.max(
    1,
    (triageDistribution.CRITICAL || 0) +
      (triageDistribution.URGENT || 0) +
      (triageDistribution.VIP || 0) +
      (triageDistribution.NORMAL || 0) +
      (triageDistribution.NOISE || 0)
  );

  const criticalPct = Math.round(((triageDistribution.CRITICAL || 0) / total) * 100);
  const urgentPct = Math.round(((triageDistribution.URGENT || 0) / total) * 100);
  const vipPct = Math.round(((triageDistribution.VIP || 0) / total) * 100);
  const normalPct = Math.round(((triageDistribution.NORMAL || 0) / total) * 100);
  const noisePct = Math.round(((triageDistribution.NOISE || 0) / total) * 100);

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs transition-all">
      {/* Top compact bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <Radio size={12} className="text-emerald-600 animate-pulse" />
            <span>LIVE TRIAGE RADAR</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Processed: <strong className="text-slate-900 font-mono">{totalMessagesProcessed}</strong> msgs</span>
            <span>•</span>
            <span>Latency: <strong className="text-emerald-700 font-mono">{avgTriageLatencyMs}ms</strong></span>
            <span>•</span>
            <span>Suppression: <strong className="text-indigo-700 font-mono">{botSuppressionRate}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick status pill */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
            <span>HITL:</span>
            <span className="font-bold text-amber-700">{humanApprovalsPending} pending</span>
            <span>/</span>
            <span className="font-bold text-emerald-700">{humanApprovalsResolved} resolved</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            {isExpanded ? (
              <>
                <span className="text-[11px]">Hide</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span className="text-[11px]">Expand</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Metrics Drawer */}
      {isExpanded && (
        <div className="bg-slate-50/70 border-t border-slate-100 px-4 py-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {/* Card 1: 5-Tier Triage Distribution */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={13} className="text-emerald-600" />
                  Triage Priority Distribution ({total} Total)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Two-Pass Classifier</span>
              </div>

              {/* Progress Stack Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                <div style={{ width: `${criticalPct}%` }} className="bg-rose-500 transition-all duration-500" title={`CRITICAL: ${triageDistribution.CRITICAL}`} />
                <div style={{ width: `${urgentPct}%` }} className="bg-amber-500 transition-all duration-500" title={`URGENT: ${triageDistribution.URGENT}`} />
                <div style={{ width: `${vipPct}%` }} className="bg-purple-500 transition-all duration-500" title={`VIP: ${triageDistribution.VIP}`} />
                <div style={{ width: `${normalPct}%` }} className="bg-sky-500 transition-all duration-500" title={`NORMAL: ${triageDistribution.NORMAL}`} />
                <div style={{ width: `${noisePct}%` }} className="bg-slate-400 transition-all duration-500" title={`NOISE: ${triageDistribution.NOISE}`} />
              </div>

              {/* Tier Pills */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 text-center">
                <div className="p-1 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="text-[9px] font-bold text-rose-700 block uppercase">Critical</span>
                  <span className="text-xs font-extrabold text-rose-900 font-mono">{triageDistribution.CRITICAL || 0}</span>
                </div>
                <div className="p-1 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[9px] font-bold text-amber-700 block uppercase">Urgent</span>
                  <span className="text-xs font-extrabold text-amber-900 font-mono">{triageDistribution.URGENT || 0}</span>
                </div>
                <div className="p-1 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="text-[9px] font-bold text-purple-700 block uppercase">VIP</span>
                  <span className="text-xs font-extrabold text-purple-900 font-mono">{triageDistribution.VIP || 0}</span>
                </div>
                <div className="p-1 rounded-lg bg-sky-50 border border-sky-200">
                  <span className="text-[9px] font-bold text-sky-700 block uppercase">Normal</span>
                  <span className="text-xs font-extrabold text-sky-900 font-mono">{triageDistribution.NORMAL || 0}</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-600 block uppercase">Noise</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">{triageDistribution.NOISE || 0}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Latency Speedometer & Inference Speed */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-500" />
                  Inference Speed
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Sub-50ms
                </span>
              </div>

              <div className="my-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">{avgTriageLatencyMs}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">ms avg</span>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Fast-Path Regex:</span>
                <strong className="text-slate-800 font-mono">0ms</strong>
              </div>
            </div>

            {/* Card 3: Safety Guard Efficacy & HITL Stats */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot size={13} className="text-indigo-600" />
                  Automation Safety
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {botSuppressionRate}% Suppressed
                </span>
              </div>

              <div className="my-2 flex items-center justify-between text-xs font-semibold text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Auto-Replied</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">{automatedRepliesSent}</span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">HITL Resolved</span>
                  <span className="text-base font-extrabold text-indigo-600 font-mono">{humanApprovalsResolved}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
                <Sparkles size={11} className="text-amber-500" />
                <span>Protected VIPs &amp; Group Chats</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
