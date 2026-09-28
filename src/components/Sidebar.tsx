import React from 'react';
import Swal from 'sweetalert2';

interface SidebarProps {
  activeTab: 'consultation' | 'records' | 'coding-ref' | 'guide';
  setActiveTab: (tab: 'consultation' | 'records' | 'coding-ref' | 'guide') => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  onNewPatientClick: () => void;
  onWhatsAppGatewayClick: () => void;
  isBackendConnected: boolean;
  isWhatsAppConnected: boolean;
  loggedInDoctor: { name: string; email: string; role: string; clinic: string } | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  onNewPatientClick,
  onWhatsAppGatewayClick,
  isBackendConnected,
  isWhatsAppConnected,
  loggedInDoctor,
  onLogout,
}) => {
  const handleNavClick = (tab: 'consultation' | 'records' | 'coding-ref' | 'guide') => {
    setActiveTab(tab);
    setIsMobileDrawerOpen(false);
  };

  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: 'Are you sure you want to sign out of Dr. Priya Clinical Studio?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  const navItems = [
    {
      id: 'consultation',
      label: 'New Consultation',
      shortLabel: 'Consult',
      icon: 'bi-mic-fill',
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-700 border-emerald-300',
    },
    {
      id: 'records',
      label: 'Patient Encounters',
      shortLabel: 'Records',
      icon: 'bi-folder2-open',
      badge: null,
    },
    {
      id: 'coding-ref',
      label: 'ICD & CPT Library',
      shortLabel: 'Codes',
      icon: 'bi-journal-medical',
      badge: 'WHO / AMA',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'guide',
      label: 'Clinical Workflow Guide',
      shortLabel: 'Guide',
      icon: 'bi-compass-fill',
      badge: null,
    },
  ] as const;

  return (
    <>
      {/* MOBILE DRAWER BACKDROP */}
      {isMobileDrawerOpen && (
        <div
          onClick={() => setIsMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR CONTAINER (DESKTOP + MOBILE DRAWER) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-sm
          ${/* Mobile Drawer positioning */ ''}
          lg:translate-x-0 ${isMobileDrawerOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${/* Desktop Collapsible Width */ ''}
          ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* TOP SECTION: BRAND & COLLAPSE TOGGLE */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <i className="bi bi-heart-pulse-fill text-xl"></i>
            </div>

            {(!isDesktopCollapsed || isMobileDrawerOpen) && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center space-x-1.5">
                  <h1 className="font-black text-base text-slate-900 tracking-tight truncate">
                    Dr. Priya
                  </h1>
                  <span className="px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase">
                    MD
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  Clinical Studio & Coding
                </p>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setIsDesktopCollapsed((prev) => !prev)}
            className="hidden lg:flex w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 items-center justify-center transition-all"
            title={isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <i className={`bi ${isDesktopCollapsed ? 'bi-layout-sidebar-inset-reverse' : 'bi-layout-sidebar-inset'} text-sm`}></i>
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(false)}
            className="lg:hidden w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {/* MIDDLE SECTION: MAIN NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          
          {/* Main Workspace Navigation */}
          <div className="space-y-1">
            {(!isDesktopCollapsed || isMobileDrawerOpen) && (
              <p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Clinical Workspace
              </p>
            )}

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  title={isDesktopCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl font-bold text-xs transition-all duration-150 ${
                    isDesktopCollapsed && !isMobileDrawerOpen
                      ? 'justify-center p-3'
                      : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <i className={`bi ${item.icon} text-base ${isActive ? 'text-white' : 'text-sky-600'}`}></i>
                    {(!isDesktopCollapsed || isMobileDrawerOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!isDesktopCollapsed || isMobileDrawerOpen) && item.badge && (
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Doctor Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {(!isDesktopCollapsed || isMobileDrawerOpen) && (
              <p className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Doctor Actions
              </p>
            )}

            {/* New Patient Registration Button */}
            <button
              onClick={() => {
                onNewPatientClick();
                setIsMobileDrawerOpen(false);
              }}
              title={isDesktopCollapsed ? 'Register New Patient' : undefined}
              className={`w-full flex items-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all ${
                isDesktopCollapsed && !isMobileDrawerOpen
                  ? 'justify-center p-3'
                  : 'justify-start space-x-3 px-3.5 py-2.5'
              }`}
            >
              <i className="bi bi-person-plus-fill text-sky-400 text-sm"></i>
              {(!isDesktopCollapsed || isMobileDrawerOpen) && <span>New Patient</span>}
            </button>

            {/* WhatsApp Gateway Modal Trigger */}
            <button
              onClick={() => {
                onWhatsAppGatewayClick();
                setIsMobileDrawerOpen(false);
              }}
              title={isDesktopCollapsed ? (isWhatsAppConnected ? 'WhatsApp Gateway Connected' : 'Connect WhatsApp Gateway') : undefined}
              className={`w-full flex items-center rounded-xl font-bold text-xs border transition-all ${
                isDesktopCollapsed && !isMobileDrawerOpen
                  ? 'justify-center p-3'
                  : 'justify-between px-3.5 py-2.5'
              } ${
                isWhatsAppConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <i className={`bi bi-whatsapp text-sm ${isWhatsAppConnected ? 'text-emerald-600' : 'text-slate-500'}`}></i>
                {(!isDesktopCollapsed || isMobileDrawerOpen) && (
                  <span className="truncate">
                    {isWhatsAppConnected ? 'WhatsApp Linked' : 'Connect WhatsApp'}
                  </span>
                )}
              </div>

              {(!isDesktopCollapsed || isMobileDrawerOpen) && (
                <span className={`w-2.5 h-2.5 rounded-full ${isWhatsAppConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM SECTION: SYSTEM STATUS & DOCTOR PROFILE */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 space-y-3">
          
          {/* Neon Database & Server Status Pill */}
          {(!isDesktopCollapsed || isMobileDrawerOpen) ? (
            <div className="p-2 rounded-xl bg-white border border-slate-200 text-[10px] flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`}></span>
                <span className="font-bold text-slate-700 truncate">
                  {isBackendConnected ? 'Neon DB Online' : 'Connecting API...'}
                </span>
              </div>
              <span className="font-mono text-slate-400">Fastify</span>
            </div>
          ) : (
            <div className="flex justify-center" title={isBackendConnected ? 'Backend Connected' : 'Connecting...'}>
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`}></span>
            </div>
          )}

          {/* Doctor Profile Block */}
          {loggedInDoctor && (
            <div
              className={`flex items-center rounded-xl bg-white p-2 border border-slate-200 ${
                isDesktopCollapsed && !isMobileDrawerOpen ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 border border-sky-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {loggedInDoctor.name.charAt(3) || 'P'}
                </div>

                {(!isDesktopCollapsed || isMobileDrawerOpen) && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{loggedInDoctor.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{loggedInDoctor.role}</p>
                  </div>
                )}
              </div>

              {(!isDesktopCollapsed || isMobileDrawerOpen) && (
                <button
                  onClick={handleLogoutClick}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="Sign Out"
                >
                  <i className="bi bi-box-arrow-right text-sm"></i>
                </button>
              )}
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
