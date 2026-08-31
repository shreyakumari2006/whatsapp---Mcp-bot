import React, { useState } from 'react';
import { Zap, Plus, X } from 'lucide-react';
import type { AutoReplyRule } from '../types/whatsapp';

interface RuleStudioProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AutoReplyRule[];
  onCreateRule: (rule: Partial<AutoReplyRule>) => Promise<void>;
  onToggleRule: (ruleId: string, enabled: boolean) => Promise<void>;
}

export const RuleStudio: React.FC<RuleStudioProps> = ({
  isOpen,
  onClose,
  rules,
  onCreateRule,
  onToggleRule
}) => {
  const [ruleName, setRuleName] = useState('');
  const [rulePattern, setRulePattern] = useState('');
  const [ruleType, setRuleType] = useState<'exact' | 'contains' | 'regex'>('contains');
  const [ruleReply, setRuleReply] = useState('');
  const [ruleCooldown, setRuleCooldown] = useState(30);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rulePattern || !ruleReply) return;

    await onCreateRule({
      name: ruleName || `Rule (${rulePattern})`,
      triggerPattern: rulePattern,
      triggerType: ruleType,
      replyMessage: ruleReply,
      cooldownMinutes: ruleCooldown,
      enabled: true
    });

    setRuleName('');
    setRulePattern('');
    setRuleReply('');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-500" size={20} />
            <h3 className="text-sm font-bold text-slate-900">Auto-Reply Automation Studio</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Create Rule Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Create Pattern Matcher Rule</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pricing Inquiries"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trigger Match Type</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                >
                  <option value="contains">Contains Keyword</option>
                  <option value="exact">Exact Match</option>
                  <option value="regex">Regular Expression (Regex)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trigger Pattern / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. pricing"
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cooldown (Mins)</label>
                <input
                  type="number"
                  value={ruleCooldown}
                  onChange={(e) => setRuleCooldown(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Auto-Response Template Copy</label>
              <textarea
                rows={2}
                placeholder="Enter automated reply message copy..."
                value={ruleReply}
                onChange={(e) => setRuleReply(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={!rulePattern || !ruleReply}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} /> Add Automation Rule
            </button>
          </form>

          {/* Active Rules List */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Configured Rules ({rules.length})</h4>
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {rule.triggerType}("{rule.triggerPattern}")
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic mt-1">"{rule.replyMessage}"</p>
                    <span className="text-[10px] text-slate-400 block mt-1">Cooldown: {rule.cooldownMinutes}m • Executed: {rule.matchCount} times</span>
                  </div>

                  <button
                    onClick={() => onToggleRule(rule.id, !rule.enabled)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      rule.enabled 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
