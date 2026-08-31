'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { Flame, AlertTriangle, ShieldAlert, Clock, User } from 'lucide-react';

export default function UrgentMessagesWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || { totalCount: 0, messages: [] };
  const messages = data.messages || [];

  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626' }}>
            <Flame size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Urgency Triage Radar</h2>
            <p style={{ margin: 0, fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
              High-priority alerts and critical communications
            </p>
          </div>
        </div>
        <span style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          background: messages.length > 0 ? '#ef4444' : '#10b981',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {messages.length} Urgent Alerts
        </span>
      </div>

      {messages.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: isDark ? '#9ca3af' : '#6b7280', fontSize: '14px' }}>
          ✨ Inbox is calm. No high-priority or critical alerts in the selected window.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg: any) => {
            const isCritical = msg.priority === 'CRITICAL';
            return (
              <div key={msg.id} style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: isDark ? '#1f2937' : '#f9fafb',
                borderLeft: `4px solid ${isCritical ? '#ef4444' : '#f59e0b'}`,
                borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRight: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{msg.senderName || msg.from}</span>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 800,
                    background: isCritical ? '#fee2e2' : '#fef3c7',
                    color: isCritical ? '#991b1b' : '#92400e'
                  }}>
                    {msg.priority} (Score: {msg.urgencyScore || 0})
                  </span>
                </div>
                <p style={{ margin: '4px 0 8px', fontSize: '13px', lineHeight: 1.4 }}>
                  {msg.body}
                </p>
                {msg.matchedKeywords && msg.matchedKeywords.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {msg.matchedKeywords.map((kw: string, i: number) => (
                      <span key={i} style={{
                        fontSize: '11px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isDark ? '#374151' : '#e5e7eb',
                        color: isDark ? '#d1d5db' : '#374151'
                      }}>
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
