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
          {/* Quick Flow Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">⚡ Quick Templates & Stateful Flows</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRuleName('Birthday Thanks & Party RSVP Flow');
                  setRulePattern('birthday');
                  setRuleType('contains');
                  setRuleReply('Thank you so much for the birthday wishes! 🎉 Are you joining my birthday party tonight at 7 PM? (Reply Yes/No)');
                  setRuleCooldown(60);
                }}
                className="p-2.5 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 group-hover:text-amber-950">
                  <Zap size={12} className="text-amber-600 fill-amber-500" />
                  Birthday RSVP Flow
                </div>
                <p className="text-[10px] text-amber-700 mt-0.5">Multi-turn thanks + party RSVP confirmation</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRuleName('Pricing & Service Inquiries');
                  setRulePattern('pricing');
                  setRuleType('contains');
                  setRuleReply('Thanks for reaching out! You can view our standard pricing tiers at https://example.com/pricing.');
                  setRuleCooldown(60);
                }}
                className="p-2.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 rounded-xl text-left transition-all"
              >
                <div className="text-[11px] font-bold text-blue-900">💼 Pricing Inquiries</div>
                <p className="text-[10px] text-blue-700 mt-0.5">Single-shot pricing guide responder</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRuleName('Office Hours Auto-Response');
                  setRulePattern('office hours');
                  setRuleType('contains');
                  setRuleReply('Hi! Our standard office hours are Mon-Fri 9:00 AM - 6:00 PM EST.');
                  setRuleCooldown(30);
                }}
                className="p-2.5 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-all"
              >
                <div className="text-[11px] font-bold text-emerald-900">🕒 Office Hours</div>
                <p className="text-[10px] text-emerald-700 mt-0.5">Working hours schedule responder</p>
              </button>
            </div>
          </div>

          {/* Create Rule Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Configure Automation Rule</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Thanks & Party RSVP Flow"
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
                  placeholder="e.g. birthday"
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
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Auto-Response / Initial Step Copy</label>
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
              {rules.map((rule) => {
                const isFlow = rule.type === 'flow' || rule.id === 'rule_birthday_wishes' || rule.triggerPattern === 'birthday';
                return (
                  <div key={rule.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rule.name}</span>
                        {isFlow && (
                          <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                            <Zap size={10} className="fill-amber-600 text-amber-600" /> MULTI-TURN FLOW
                          </span>
                        )}
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
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
