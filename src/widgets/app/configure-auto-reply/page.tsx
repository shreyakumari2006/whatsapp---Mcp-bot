'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { Bot, CheckCircle2, Zap, Clock, Shield } from 'lucide-react';

export default function ConfigureAutoReplyWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || {};
  const rule = data.rule || {};

  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ padding: '10px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a' }}>
          <Zap size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Auto-Reply Rule Configured</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
            Pattern matching rule active in WhatsApp Auto-Responder Engine
          </p>
        </div>
      </div>

      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Rule Name:</span>
          <span style={{ fontWeight: 700 }}>{rule.name || rule.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Trigger Pattern:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
            {rule.triggerType}("{rule.triggerPattern}")
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Sender Cooldown:</span>
          <span style={{ fontWeight: 600 }}>{rule.cooldownMinutes || 60} mins</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Status:</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 800,
            background: rule.enabled !== false ? '#dcfce7' : '#fee2e2',
            color: rule.enabled !== false ? '#15803d' : '#b91c1c'
          }}>
            {rule.enabled !== false ? 'ACTIVE' : 'PAUSED'}
          </span>
        </div>
        <div style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', background: isDark ? '#374151' : '#e5e7eb' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: '2px' }}>
            Auto-Reply Copy:
          </div>
          <div style={{ fontStyle: 'italic' }}>"{rule.replyMessage}"</div>
        </div>
      </div>
    </div>
  );
}
