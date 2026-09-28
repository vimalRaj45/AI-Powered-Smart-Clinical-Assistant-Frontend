import React from 'react';

interface HeaderProps {
  activeTab: 'consultation' | 'records' | 'coding-ref' | 'guide';
  onToggleMobileDrawer: () => void;
  onToggleDesktopSidebar: () => void;
  isDesktopCollapsed: boolean;
  onNewPatientClick: () => void;
  onWhatsAppGatewayClick: () => void;
  isWhatsAppConnected: boolean;
  loggedInDoctor: { name: string; email: string; role: string; clinic: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleMobileDrawer,
  onToggleDesktopSidebar,
  isDesktopCollapsed,
  onNewPatientClick,
  onWhatsAppGatewayClick,
  isWhatsAppConnected,
  loggedInDoctor,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'consultation':
        return { title: 'Live Consultation', subtitle: 'AI Voice Dictation & Real-Time Documentation' };
      case 'records':
        return { title: 'Patient Encounters', subtitle: 'Certified History & Prescription Archives' };
      case 'coding-ref':
        return { title: 'Medical Coding Library', subtitle: 'ICD-10 & CPT Clinical Codes' };
      case 'guide':
        return { title: 'Workflow Guide', subtitle: 'Interactive End-to-End Clinical Walkthrough' };
      default:
        return { title: 'Clinical Studio', subtitle: 'Dr. Priya Assistant' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left Area: Hamburger on Mobile + Collapse Button on Laptop + Breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all flex items-center justify-center flex-shrink-0"
          title="Open Menu"
        >
          <i className="bi bi-list text-xl"></i>
        </button>

        {/* Laptop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleDesktopSidebar}
          className="hidden lg:flex w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 items-center justify-center transition-all flex-shrink-0"
          title={isDesktopCollapsed ? "Open Sidebar" : "Collapse Sidebar"}
        >
          <i className={`bi ${isDesktopCollapsed ? 'bi-layout-sidebar-inset-reverse' : 'bi-layout-sidebar-inset'} text-base`}></i>
        </button>

        {/* Active Page Title & Subtitle */}
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
            {title}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate hidden xs:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Area: Action Pills */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* WhatsApp Gateway Button */}
        <button
          type="button"
          onClick={onWhatsAppGatewayClick}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm flex-shrink-0 ${
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

        {/* New Patient Button */}
        <button
          type="button"
          onClick={onNewPatientClick}
          className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all flex-shrink-0"
        >
          <i className="bi bi-person-plus-fill text-sm"></i>
          <span className="hidden sm:inline">New Patient</span>
        </button>

        {/* Doctor Avatar Pill */}
        {loggedInDoctor && (
          <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 border border-sky-300 flex items-center justify-center font-bold text-xs">
              {loggedInDoctor.name.charAt(3) || 'P'}
            </div>
            <span className="text-xs font-bold text-slate-800 hidden lg:inline">
              {loggedInDoctor.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
