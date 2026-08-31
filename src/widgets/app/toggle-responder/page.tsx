'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ToggleResponderWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || {};
  const isEnabled = data.enabled === true;

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
        <div style={{
          padding: '10px',
          borderRadius: '12px',
          background: isEnabled ? '#dcfce7' : '#fee2e2',
          color: isEnabled ? '#16a34a' : '#dc2626'
        }}>
          {isEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            Rule {isEnabled ? 'Activated' : 'Paused'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
            Auto-responder rule state changed dynamically
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
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Rule ID:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{data.ruleId || data.rule?.id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Current State:</span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 800,
            background: isEnabled ? '#dcfce7' : '#fee2e2',
            color: isEnabled ? '#15803d' : '#b91c1c'
          }}>
            {isEnabled ? 'ACTIVE / RUNNING' : 'PAUSED / OFF'}
          </span>
        </div>
      </div>
    </div>
  );
}
