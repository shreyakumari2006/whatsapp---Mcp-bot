'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { MessageSquare, Crown, ShieldAlert, Users, User } from 'lucide-react';

export default function RecentChatsWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || { totalChats: 0, chats: [] };
  const chats = data.chats || [];

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
          <MessageSquare size={20} color="#3b82f6" />
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>WhatsApp Inbox Feed</h2>
        </div>
        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
          {chats.length} active chats
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {chats.map((chat: any) => {
          const isVip = chat.isVIP || chat.priority === 'VIP';
          const isCrit = chat.priority === 'CRITICAL';
          const isUrg = chat.priority === 'URGENT';

          return (
            <div key={chat.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: '10px',
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '50%',
                  background: isVip ? '#fef3c7' : isCrit ? '#fee2e2' : isDark ? '#374151' : '#e5e7eb',
                  color: isVip ? '#d97706' : isCrit ? '#dc2626' : isDark ? '#9ca3af' : '#4b5563'
                }}>
                  {isVip ? <Crown size={16} /> : chat.isGroup ? <Users size={16} /> : <User size={16} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{chat.name || chat.id}</span>
                    {isVip && (
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                        VIP
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280', maxWidth: '340px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: isCrit ? '#fee2e2' : isUrg ? '#fef3c7' : isVip ? '#f3e8ff' : isDark ? '#374151' : '#e5e7eb',
                color: isCrit ? '#991b1b' : isUrg ? '#92400e' : isVip ? '#6b21a8' : isDark ? '#d1d5db' : '#374151'
              }}>
                {chat.priority || 'NORMAL'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
