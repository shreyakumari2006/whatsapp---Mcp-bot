import React, { useState } from 'react';
import { X, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { WhatsAppConnectionStatus } from '../types/whatsapp';

interface WhatsAppQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrDataUrl: string | null;
  status: WhatsAppConnectionStatus;
  user: { id: string; pushname: string } | null;
}

export const WhatsAppQRModal: React.FC<WhatsAppQRModalProps> = ({
  isOpen,
  onClose,
  qrDataUrl,
  status,
  user
}) => {
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const isConnected = status === 'AUTHENTICATED' || status === 'READY';

  const handleResetQR = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/auth/reset', { method: 'POST' });
    } catch (err) {
      console.error('Failed to reset QR:', err);
    } finally {
      setTimeout(() => setIsResetting(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111b21] border border-[#222d34] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 relative text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition"
        >
          <X size={20} />
        </button>

        {/* Title & Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#00a884] mx-auto flex items-center justify-center mb-3">
          <Smartphone size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#e9edef]">Link WhatsApp Device</h2>
        <p className="text-xs text-[#8696a0] mt-1 mb-5">
          Scan the QR code below to connect your WhatsApp account to the MCP Bot.
        </p>

        {/* Content Container */}
        {isConnected ? (
          <div className="p-6 bg-[#005c4b]/20 border border-[#00a884]/40 rounded-2xl space-y-3">
            <CheckCircle2 size={42} className="text-[#00a884] mx-auto animate-bounce" />
            <p className="text-sm font-bold text-white">WhatsApp is Connected!</p>
            <p className="text-xs text-[#8696a0]">
              Active User: <strong className="text-[#00a884]">{user?.pushname || user?.id || 'Connected'}</strong>
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-[#00a884] text-[#111b21] rounded-xl text-xs font-bold shadow hover:bg-[#00a884]/90 transition"
            >
              Continue to Chats
            </button>
          </div>
        ) : qrDataUrl ? (
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-[#00a884]/80 inline-block">
              <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto rounded-lg block" />
            </div>
            <p className="text-xs text-[#00a884] font-semibold animate-pulse">
              ● Ready to scan • Live Stream Active
            </p>
          </div>
        ) : (
          <div className="p-8 bg-[#202c33] rounded-2xl border border-[#2a3942] space-y-3">
            <div className="animate-spin text-2xl">⏳</div>
            <p className="text-xs text-[#e9edef] font-semibold">Generating QR Code...</p>
            <p className="text-[11px] text-[#8696a0]">Launching WhatsApp Chromium engine in background.</p>
          </div>
        )}

        {/* 3 Step Instructions */}
        <div className="mt-5 pt-4 border-t border-[#222d34] text-left text-xs text-[#8696a0] space-y-1.5">
          <p><strong className="text-[#e9edef]">1.</strong> Open <strong>WhatsApp</strong> on your phone</p>
          <p><strong className="text-[#e9edef]">2.</strong> Tap <strong>Settings</strong> &gt; <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></p>
          <p><strong className="text-[#e9edef]">3.</strong> Point your phone at this screen to scan the QR code</p>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-[#8696a0]">
            Status: <strong className="font-mono text-[#00a884] uppercase">{status}</strong>
          </span>
          <button
            onClick={handleResetQR}
            disabled={isResetting}
            className="px-3 py-1.5 bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] rounded-lg text-xs font-semibold border border-[#2a3942] transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isResetting ? 'animate-spin' : ''} />
            <span>{isResetting ? 'Resetting...' : 'New QR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
