import React from 'react';
import { QrCode } from 'lucide-react';

interface QROverlayProps {
  isOpen: boolean;
  qrDataUrl: string | null;
  onClose: () => void;
}

export const QROverlay: React.FC<QROverlayProps> = ({
  isOpen,
  qrDataUrl,
  onClose
}) => {
  if (!isOpen || !qrDataUrl) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
          <QrCode size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Pair WhatsApp Session</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Open WhatsApp on your mobile phone &gt; Settings &gt; Linked Devices &gt; Link a Device.
        </p>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block shadow-inner mb-4">
          <img src={qrDataUrl} alt="WhatsApp Pairing QR" className="w-52 h-52 rounded-xl" />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          Close Window
        </button>
      </div>
    </div>
  );
};
