'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { Search, Crown, Phone, User, CheckCircle } from 'lucide-react';

export default function SearchContactsWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || { count: 0, contacts: [] };
  const contacts = data.contacts || [];

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
          <Search size={20} color="#10b981" />
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Contact & VIP Directory</h2>
        </div>
        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
          {contacts.length} matching contacts
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {contacts.map((c: any) => (
          <div key={c.id} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderRadius: '12px',
            background: isDark ? '#1f2937' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '50%',
                background: c.isVIP ? '#fef3c7' : isDark ? '#374151' : '#e5e7eb',
                color: c.isVIP ? '#d97706' : isDark ? '#9ca3af' : '#4b5563'
              }}>
                {c.isVIP ? <Crown size={20} /> : <User size={20} />}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{c.name}</span>
                  {c.isVIP && (
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontWeight: 800 }}>
                      {c.vipTier || 'VIP'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                  <Phone size={12} />
                  <span>{c.phone || c.id}</span>
                </div>
              </div>
            </div>
            {c.isVIP && (
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Auto-Reply Protected
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
