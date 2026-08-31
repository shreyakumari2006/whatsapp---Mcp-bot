'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { Bot, Zap, Clock, Activity, CheckCircle2, PauseCircle } from 'lucide-react';

export default function ActiveAutoRepliesWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || { count: 0, rules: [] };
  const rules = data.rules || [];

  return (
    <div style={{
      padding: '20px',
      borderRadius: '16px',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={20} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Automation Rules Monitor</h2>
        </div>
        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
          {rules.length} configured rules
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rules.map((r: any) => (
          <div key={r.id} style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: isDark ? '#1f2937' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{r.name}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 800,
                background: r.enabled ? '#dcfce7' : '#fee2e2',
                color: r.enabled ? '#15803d' : '#b91c1c'
              }}>
                {r.enabled ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '8px' }}>
              Trigger: <code style={{ color: '#2563eb', fontWeight: 600 }}>{r.triggerType}("{r.triggerPattern}")</code> • Cooldown: {r.cooldownMinutes || 60}m • Executed: {r.matchCount || 0} times
            </div>
            <div style={{ padding: '8px 10px', borderRadius: '6px', background: isDark ? '#374151' : '#e5e7eb', fontSize: '12px', fontStyle: 'italic' }}>
              "{r.replyMessage}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
