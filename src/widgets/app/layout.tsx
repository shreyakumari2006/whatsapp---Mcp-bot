'use client';
import React from 'react';

export default function WidgetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: 0,
      padding: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      boxSizing: 'border-box'
    }}>
      {children}
    </div>
  );
}
