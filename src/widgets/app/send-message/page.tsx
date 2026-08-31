'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function SendMessageWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || {};

  const isPending = data?.status === 'pending_approval';
  const isSent = data?.status === 'sent';

  return (
    <div style={{
      padding: '24px',
      borderRadius: '16px',
      background: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#f9fafb' : '#111827',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {isPending ? (
          <div style={{ padding: '10px', borderRadius: '12px', background: '#fef3c7', color: '#d97706' }}>
            <Clock size={28} />
          </div>
        ) : isSent ? (
          <div style={{ padding: '10px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={28} />
          </div>
        ) : (
          <div style={{ padding: '10px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5' }}>
            <ShieldCheck size={28} />
          </div>
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
            {isPending ? 'Staged in Approval Queue' : isSent ? 'Message Dispatched' : 'Message Processed'}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
            {data?.message || 'WhatsApp message operation completed.'}
          </p>
        </div>
      </div>

      <div style={{
        padding: '16px',
        borderRadius: '12px',
        background: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        marginBottom: '16px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 500 }}>Tracking ID:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{data?.id || 'N/A'}</span>

          <span style={{ color: isDark ? '#9ca3af' : '#6b7280', fontWeight: 500 }}>Status:</span>
          <span>
            <span style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              background: isPending ? '#fef3c7' : '#dcfce7',
              color: isPending ? '#92400e' : '#15803d'
            }}>
              {data?.status || 'PROCESSED'}
            </span>
          </span>
        </div>
      </div>

      {isPending && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '8px',
          background: isDark ? '#374151' : '#f3f4f6',
          fontSize: '12px',
          color: isDark ? '#d1d5db' : '#4b5563'
        }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span>This message requires manual confirmation in the Web Dashboard (http://localhost:3000) before sending.</span>
        </div>
      )}
    </div>
  );
}
