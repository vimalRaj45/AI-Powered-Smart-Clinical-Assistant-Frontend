import React from 'react';
import type { TabType } from '../App';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onNewPatientClick: () => void;
  onWhatsAppClick: () => void;
  isWhatsAppConnected: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onNewPatientClick,
  onWhatsAppClick,
  isWhatsAppConnected,
}) => {
  const tabs = [
    {
      id: 'consultation' as TabType,
      label: 'Consult',
      icon: 'bi-mic-fill',
      activeColor: 'text-sky-600',
    },
    {
      id: 'records' as TabType,
      label: 'Records',
      icon: 'bi-folder2-open',
      activeColor: 'text-sky-600',
    },
    {
      id: 'coding-ref' as TabType,
      label: 'Codes',
      icon: 'bi-journal-medical',
      activeColor: 'text-sky-600',
    },
    {
      id: 'diseases-ref' as TabType,
      label: 'Diseases',
      icon: 'bi-capsule-pill',
      activeColor: 'text-amber-600',
    },
    {
      id: 'guide' as TabType,
      label: 'Guide',
      icon: 'bi-compass-fill',
      activeColor: 'text-sky-600',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-sky-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-500'
                  }`}
                >
                  <i className={`bi ${tab.icon} text-lg`}></i>
                </div>
                {isActive && (
                  <span className="absolute -bottom-1 w-4 h-0.5 rounded-full bg-sky-600"></span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-extrabold text-sky-600' : 'font-semibold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Quick Add Patient Button */}
        <button
          onClick={onNewPatientClick}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
          title="Register New Patient"
        >
          <div className="w-8 h-7 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center shadow-sm">
            <i className="bi bi-person-plus-fill text-sm"></i>
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">+ Patient</span>
        </button>
      </div>
    </nav>
  );
};
