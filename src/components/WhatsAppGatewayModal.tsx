import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';

interface WhatsAppGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (connected: boolean) => void;
}

export const WhatsAppGatewayModal: React.FC<WhatsAppGatewayModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [status, setStatus] = useState<{
    connected: boolean;
    qrDataUrl: string | null;
    user: string | null;
  }>({
    connected: false,
    qrDataUrl: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const fetchStatusAndQr = async () => {
    try {
      const res = await fetch('/api/whatsapp/qr');
      const data = await res.json();
      setStatus({
        connected: !!data.connected,
        qrDataUrl: data.qrDataUrl,
        user: data.user,
      });
      if (onStatusChange) {
        onStatusChange(!!data.connected);
      }
    } catch (err) {
      console.warn('Failed to fetch WhatsApp gateway status:', err);
    }
  };

  // Poll status while modal is open
  useEffect(() => {
    if (!isOpen) return;

    fetchStatusAndQr();
    const interval = setInterval(fetchStatusAndQr, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsResetting(true);
    try {
      await fetch('/api/whatsapp/logout', { method: 'POST' });
      await fetchStatusAndQr();
      Swal.fire({
        icon: 'info',
        title: 'Session Reset',
        text: 'WhatsApp session disconnected. New QR code generated.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <i className="bi bi-whatsapp text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  Baileys WhatsApp Gateway
                </h3>
                {status.connected ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                    <span>Live Connected</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Scan QR
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-200/80">
                Automated Direct WhatsApp e-Prescription & Billing Delivery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 text-center">
          
          {status.connected ? (
            /* Connected State */
            <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-sm border border-emerald-300">
                <i className="bi bi-check2-circle"></i>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-emerald-950">WhatsApp Gateway Active & Ready!</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Connected Account: <span className="font-mono font-bold text-emerald-950">{status.user || 'Doctor WhatsApp Account'}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  All prescribed medications, clinical summaries, and PDF documents will now be dispatched <strong>automatically in the background</strong> without opening WhatsApp Web.
                </p>
              </div>

              <div className="pt-2 flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isResetting}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 transition-all shadow-sm flex items-center space-x-1.5"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>{isResetting ? 'Disconnecting...' : 'Disconnect / Link Another Device'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* QR Scan State */
            <div className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 text-left space-y-1">
                <p className="font-bold flex items-center space-x-1 text-sky-900">
                  <i className="bi bi-qr-code-scan"></i>
                  <span>How to connect your WhatsApp:</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700">
                  <li>Open <strong>WhatsApp</strong> on your phone.</li>
                  <li>Tap <strong>Menu (3 dots)</strong> or <strong>Settings</strong> &gt; <strong>Linked Devices</strong>.</li>
                  <li>Tap <strong>Link a Device</strong> and point your camera at this QR code.</li>
                </ol>
              </div>

              {/* QR Canvas Box */}
              <div className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center space-y-3 shadow-inner">
                {status.qrDataUrl ? (
                  <div className="relative group">
                    <img
                      src={status.qrDataUrl}
                      alt="Baileys WhatsApp QR Code"
                      className="w-56 h-56 object-contain rounded-xl shadow-md border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-slate-600">Generating Baileys QR Code...</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>QR code refreshes automatically for security</span>
                </div>
              </div>

              <div className="flex justify-center space-x-2">
                <button
                  type="button"
                  onClick={fetchStatusAndQr}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  <span>Refresh QR</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all"
                >
                  Reset Session
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1 text-[11px]">
            <i className="bi bi-shield-lock-fill text-emerald-600"></i>
            <span>End-to-End Encrypted via Baileys</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
