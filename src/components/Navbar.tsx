import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface NavbarProps {
  activeTab: 'consultation' | 'records' | 'coding-ref' | 'guide';
  setActiveTab: (tab: 'consultation' | 'records' | 'coding-ref' | 'guide') => void;
  onNewPatientClick: () => void;
  onWhatsAppGatewayClick?: () => void;
  isBackendConnected: boolean;
  isWhatsAppConnected?: boolean;
  loggedInDoctor: { name: string; email: string; role: string; clinic: string } | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewPatientClick,
  onWhatsAppGatewayClick,
  isBackendConnected,
  isWhatsAppConnected = false,
  loggedInDoctor,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out of the clinical portal?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
        Swal.fire({
          icon: 'success',
          title: 'Signed Out',
          text: 'Have a great day, Doctor.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Clinic Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sky-600 text-white shadow-sm flex-shrink-0">
            <i className="bi bi-heart-pulse-fill text-xl"></i>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">
                Dr. Priya
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                Medical Assistant
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
              Smart Clinical Documentation & Medical Coding
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('consultation')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'consultation'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <i className="bi bi-mic-fill text-sm"></i>
            <span>New Consultation</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'records'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <i className="bi bi-folder2-open text-sm"></i>
            <span>Patient Records</span>
          </button>
          <button
            onClick={() => setActiveTab('coding-ref')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'coding-ref'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <i className="bi bi-journal-medical text-sm"></i>
            <span>Codes Library</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <i className="bi bi-compass-fill text-sm"></i>
            <span>Workflow Guide</span>
          </button>
        </nav>

        {/* Right Side Actions & Doctor Profile */}
        <div className="flex items-center space-x-2.5">
          {/* WhatsApp Gateway QR Link Button */}
          {onWhatsAppGatewayClick && (
            <button
              onClick={onWhatsAppGatewayClick}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all shadow-sm ${
                isWhatsAppConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title={isWhatsAppConnected ? 'WhatsApp Gateway Connected' : 'Scan WhatsApp QR Code'}
            >
              <i className={`bi bi-whatsapp text-sm ${isWhatsAppConnected ? 'text-emerald-600' : 'text-slate-500'}`}></i>
              <span className="hidden sm:inline">
                {isWhatsAppConnected ? 'WhatsApp Linked' : 'Connect WhatsApp'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            </button>
          )}

          {/* New Patient Button */}
          <button
            onClick={onNewPatientClick}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <i className="bi bi-person-plus-fill text-sm"></i>
            <span>New Patient</span>
          </button>

          {/* Doctor Profile Pill */}
          {loggedInDoctor && (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-bold text-xs">
                {loggedInDoctor.name.charAt(3) || 'D'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {loggedInDoctor.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {loggedInDoctor.email}
                </p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <i className="bi bi-box-arrow-right text-base"></i>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'} text-lg`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2 animate-fade-in shadow-lg">
          <button
            onClick={() => {
              setActiveTab('consultation');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'consultation'
                ? 'bg-sky-50 text-sky-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="bi bi-mic-fill text-base text-sky-600"></i>
            <span>New Consultation</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('records');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'records'
                ? 'bg-sky-50 text-sky-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="bi bi-folder2-open text-base text-sky-600"></i>
            <span>Patient Records</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('coding-ref');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'coding-ref'
                ? 'bg-sky-50 text-sky-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="bi bi-journal-medical text-base text-sky-600"></i>
            <span>Medical Codes Library</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('guide');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
              activeTab === 'guide'
                ? 'bg-sky-50 text-sky-700 font-bold'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <i className="bi bi-compass-fill text-base text-sky-600"></i>
            <span>Clinical Workflow Guide</span>
          </button>

          <button
            onClick={() => {
              onNewPatientClick();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-sm"
          >
            <i className="bi bi-person-plus-fill text-base"></i>
            <span>Register New Patient</span>
          </button>
        </div>
      )}
    </header>
  );
};
