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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
      <div className="bg-[#111b21] rounded-2xl border border-[#222d34] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-[#222d34] flex items-center justify-between bg-[#202c33]">
          <div className="flex items-center gap-2">
            <Zap className="text-[#00a884]" size={20} />
            <h3 className="text-sm font-bold text-[#e9edef]">Auto-Reply Automation Studio</h3>
          </div>
          <button onClick={onClose} className="text-[#8696a0] hover:text-[#e9edef] p-1 rounded-lg hover:bg-[#2a3942]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Quick Flow Presets */}
          <div>
            <span className="text-[11px] font-bold text-[#8696a0] uppercase tracking-wider block mb-2">⚡ Quick Templates & Stateful Flows</span>
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
                className="p-2.5 bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 group-hover:text-amber-200">
                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                  Birthday RSVP Flow
                </div>
                <p className="text-[10px] text-[#8696a0] mt-0.5">Multi-turn thanks + party RSVP</p>
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
                className="p-2.5 bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition-all"
              >
                <div className="text-[11px] font-bold text-blue-300">💼 Pricing Inquiries</div>
                <p className="text-[10px] text-[#8696a0] mt-0.5">Pricing guide responder</p>
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
                className="p-2.5 bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-xl text-left transition-all"
              >
                <div className="text-[11px] font-bold text-emerald-300">🕒 Office Hours</div>
                <p className="text-[10px] text-[#8696a0] mt-0.5">Working hours responder</p>
              </button>
            </div>
          </div>

          {/* Create Rule Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
            <h4 className="text-xs font-bold text-[#e9edef] uppercase tracking-wider">Configure Automation Rule</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-[#8696a0] block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Birthday Thanks & Party RSVP Flow"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#111b21] text-[#e9edef] border border-[#2a3942] rounded-lg focus:outline-none focus:border-[#00a884]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#8696a0] block mb-1">Trigger Match Type</label>
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs bg-[#111b21] text-[#e9edef] border border-[#2a3942] rounded-lg focus:outline-none focus:border-[#00a884]"
                >
                  <option value="contains">Contains Keyword</option>
                  <option value="exact">Exact Match</option>
                  <option value="regex">Regular Expression (Regex)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-[#8696a0] block mb-1">Trigger Pattern / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. birthday"
                  value={rulePattern}
                  onChange={(e) => setRulePattern(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-[#111b21] text-[#e9edef] border border-[#2a3942] rounded-lg focus:outline-none focus:border-[#00a884]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#8696a0] block mb-1">Cooldown (Mins)</label>
                <input
                  type="number"
                  value={ruleCooldown}
                  onChange={(e) => setRuleCooldown(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-[#111b21] text-[#e9edef] border border-[#2a3942] rounded-lg focus:outline-none focus:border-[#00a884]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8696a0] block mb-1">Auto-Response / Initial Step Copy</label>
              <textarea
                rows={2}
                placeholder="Enter automated reply message copy..."
                value={ruleReply}
                onChange={(e) => setRuleReply(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#111b21] text-[#e9edef] border border-[#2a3942] rounded-lg focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <button
              type="submit"
              disabled={!rulePattern || !ruleReply}
              className="px-4 py-2 bg-[#00a884] hover:bg-[#00a884]/90 disabled:opacity-50 text-[#111b21] rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Add Automation Rule
            </button>
          </form>

          {/* Active Rules List */}
          <div>
            <h4 className="text-xs font-bold text-[#8696a0] uppercase tracking-wider mb-3">Configured Rules ({rules.length})</h4>
            <div className="space-y-2">
              {rules.map((rule) => {
                const isFlow = rule.type === 'flow' || rule.id === 'rule_birthday_wishes' || rule.triggerPattern === 'birthday';
                return (
                  <div key={rule.id} className="p-3.5 bg-[#202c33] border border-[#2a3942] rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#e9edef]">{rule.name}</span>
                        {isFlow && (
                          <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 flex items-center gap-1">
                            <Zap size={10} className="fill-amber-400 text-amber-400" /> MULTI-TURN FLOW
                          </span>
                        )}
                        <span className="text-[10px] font-mono bg-[#111b21] text-[#8696a0] px-1.5 py-0.5 rounded border border-[#2a3942]">
                          {rule.triggerType}("{rule.triggerPattern}")
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8696a0] italic mt-1">"{rule.replyMessage}"</p>
                      <span className="text-[10px] text-[#8696a0]/70 block mt-1">Cooldown: {rule.cooldownMinutes}m • Executed: {rule.matchCount} times</span>
                    </div>

                    <button
                      onClick={() => onToggleRule(rule.id, !rule.enabled)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        rule.enabled 
                          ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40' 
                          : 'bg-[#111b21] text-[#8696a0] border border-[#2a3942]'
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
