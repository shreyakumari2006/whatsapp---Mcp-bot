'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { Calendar, Clock, CheckCircle2, User, Send } from 'lucide-react';

export default function ScheduleMessageWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || {};

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
        <div style={{ padding: '10px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5' }}>
          <Calendar size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Message Scheduled</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
            Queued for automated dispatch by WhatsApp Engine
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
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Recipient:</span>
          <span style={{ fontWeight: 600 }}>{data.recipientName || data.recipient}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Scheduled For:</span>
          <span style={{ fontWeight: 600, color: '#4f46e5' }}>
            {data.sendAt ? new Date(data.sendAt).toLocaleString() : 'Pending'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Tracking ID:</span>
          <span style={{ fontFamily: 'monospace' }}>{data.id || 'N/A'}</span>
        </div>
        <div style={{ marginTop: '8px', padding: '10px', borderRadius: '8px', background: isDark ? '#374151' : '#e5e7eb', fontSize: '13px', fontStyle: 'italic' }}>
          "{data.message}"
        </div>
      </div>
    </div>
  );
}
