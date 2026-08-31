'use client';
import React from 'react';
import { useWidgetSDK, useTheme } from '@nitrostack/widgets';
import { MessageSquare, Clock, User, CheckCheck } from 'lucide-react';

export default function ChatHistoryWidget() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const data = getToolOutput<any>() || { count: 0, history: [] };
  const history = data.history || [];

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
          <Clock size={20} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>
            Chat History ({data.chatId || 'Selected Chat'})
          </h2>
        </div>
        <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
          {history.length} messages
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
        {history.map((msg: any) => {
          const isMe = msg.from === 'me';
          return (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: isMe ? '#2563eb' : isDark ? '#1f2937' : '#f3f4f6',
              color: isMe ? '#ffffff' : isDark ? '#f9fafb' : '#111827',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              {!isMe && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', marginBottom: '2px' }}>
                  {msg.senderName || msg.from}
                </span>
              )}
              <span style={{ fontSize: '13px', lineHeight: 1.4 }}>{msg.body}</span>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <CheckCheck size={12} color="#93c5fd" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
