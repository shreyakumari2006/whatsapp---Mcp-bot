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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-[#e9edef] rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150 relative text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#667781] hover:text-[#111b21] hover:bg-[#f0f2f5] transition"
        >
          <X size={20} />
        </button>

        {/* Title & Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#008069]/15 border border-[#008069]/30 text-[#008069] mx-auto flex items-center justify-center mb-3">
          <Smartphone size={24} />
        </div>
        <h2 className="text-xl font-bold text-[#111b21]">Link WhatsApp Device</h2>
        <p className="text-xs text-[#667781] mt-1 mb-5">
          Scan the QR code below to connect your WhatsApp account to the MCP Bot.
        </p>

        {/* Content Container */}
        {isConnected ? (
          <div className="p-6 bg-[#f0f2f5] border border-emerald-300 rounded-2xl space-y-3">
            <CheckCircle2 size={42} className="text-[#008069] mx-auto" />
            <p className="text-sm font-bold text-[#111b21]">WhatsApp Account Active</p>
            <p className="text-xs text-[#667781]">
              Authenticated as <strong className="text-[#111b21]">{user?.pushname || 'User'}</strong>
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 bg-[#008069] text-white font-bold rounded-xl text-xs shadow-xs hover:bg-[#008069]/90 transition"
            >
              Done
            </button>
          </div>
        ) : qrDataUrl ? (
          <div className="space-y-4">
            <div className="p-3 bg-white border border-[#e9edef] rounded-2xl shadow-inner inline-block">
              <img 
                src={qrDataUrl} 
                alt="WhatsApp QR Code" 
                className="w-56 h-56 mx-auto rounded-lg"
              />
            </div>

            <div className="text-xs text-[#667781] text-left bg-[#f0f2f5] p-3 rounded-xl space-y-1">
              <p className="font-semibold text-[#111b21]">How to scan:</p>
              <p>1. Open WhatsApp on your mobile phone.</p>
              <p>2. Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> &gt; <strong>Linked Devices</strong>.</p>
              <p>3. Tap <strong>Link a Device</strong> and point your camera at this QR code.</p>
            </div>

            <button
              onClick={handleResetQR}
              disabled={isResetting}
              className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-[#667781] hover:text-[#111b21] bg-[#f0f2f5] hover:bg-[#e9edef] rounded-xl transition"
            >
              <RefreshCw size={13} className={isResetting ? 'animate-spin' : ''} />
              <span>{isResetting ? 'Regenerating QR Code...' : 'Regenerate QR Code'}</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3 bg-[#f0f2f5] rounded-2xl">
            <RefreshCw size={28} className="text-[#008069] animate-spin mx-auto" />
            <p className="text-xs text-[#667781]">Initializing Chromium session and generating QR code...</p>
          </div>
        )}
      </div>
    </div>
  );
};
