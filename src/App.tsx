import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { LiveConsultationView } from './components/LiveConsultationView';
import { PatientRecordsView } from './components/PatientRecordsView';
import { MedicalCodingReferenceView } from './components/MedicalCodingReferenceModal';
import { UserGuideView } from './components/UserGuideView';
import { NewPatientModal } from './components/NewPatientModal';
import { WhatsAppGatewayModal } from './components/WhatsAppGatewayModal';
import { api } from './services/api';
import type { Patient } from './types';

interface DoctorUser {
  name: string;
  email: string;
  role: string;
  clinic: string;
}

export function App() {
  const [loggedInDoctor, setLoggedInDoctor] = useState<DoctorUser | null>(() => {
    const saved = localStorage.getItem('priya_doctor_user');
    return saved ? JSON.parse(saved) : {
      name: 'Dr. Priya MD',
      email: 'dr.priya@clinic.com',
      role: 'Chief Attending Physician',
      clinic: 'St. Jude Metropolitan Clinic',
    };
  });

  const [activeTab, setActiveTab] = useState<'consultation' | 'records' | 'coding-ref' | 'guide'>('consultation');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Responsive Navigation States
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Modals & Gateway State
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);

  // Save desktop sidebar preference
  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const loadPatients = async () => {
    try {
      const pts = await api.getPatients();
      setPatients(pts);
      if (pts.length > 0 && !selectedPatient) {
        setSelectedPatient(pts[0]);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.error('Failed to load patients:', err);
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    if (loggedInDoctor) {
      loadPatients();
      
      // Check health and WhatsApp status periodically
      const checkStatus = async () => {
        try {
          await api.getHealth();
          setIsBackendConnected(true);
          const waRes = await fetch('/api/whatsapp/status');
          const waData = await waRes.json();
          setIsWhatsAppConnected(!!waData.connected);
        } catch {
          setIsBackendConnected(false);
        }
      };

      checkStatus();
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [loggedInDoctor]);

  const handleLoginSuccess = (doctor: DoctorUser) => {
    setLoggedInDoctor(doctor);
    localStorage.setItem('priya_doctor_user', JSON.stringify(doctor));
  };

  const handleLogout = () => {
    setLoggedInDoctor(null);
    localStorage.removeItem('priya_doctor_user');
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
    setActiveTab('consultation');
  };

  const handleSelectPatientForConsultation = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('consultation');
  };

  const handleStartWorkflow = () => {
    setActiveTab('consultation');
  };

  if (!loggedInDoctor) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* RESPONSIVE COLLAPSIBLE SIDEBAR & MOBILE DRAWER */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={toggleDesktopSidebar}
        isMobileDrawerOpen={isMobileDrawerOpen}
        setIsMobileDrawerOpen={setIsMobileDrawerOpen}
        onNewPatientClick={() => setIsNewPatientModalOpen(true)}
        onWhatsAppGatewayClick={() => setIsWhatsAppModalOpen(true)}
        isBackendConnected={isBackendConnected}
        isWhatsAppConnected={isWhatsAppConnected}
        loggedInDoctor={loggedInDoctor}
        onLogout={handleLogout}
      />

      {/* MAIN CONTENT WRAPPER (DYNAMIC PADDING ACCORDING TO DESKTOP SIDEBAR STATE) */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full ${
          isDesktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* TOP HEADER WITH HAMBURGER & QUICK ACTIONS */}
        <Header
          activeTab={activeTab}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
          onToggleDesktopSidebar={toggleDesktopSidebar}
          isDesktopCollapsed={isDesktopCollapsed}
          onNewPatientClick={() => setIsNewPatientModalOpen(true)}
          onWhatsAppGatewayClick={() => setIsWhatsAppModalOpen(true)}
          isWhatsAppConnected={isWhatsAppConnected}
          loggedInDoctor={loggedInDoctor}
        />

        {/* MAIN CLINICAL VIEW AREA */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {activeTab === 'consultation' && (
            <LiveConsultationView
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={(p) => setSelectedPatient(p)}
              onNewPatientClick={() => setIsNewPatientModalOpen(true)}
              onConsultationSaved={loadPatients}
            />
          )}

          {activeTab === 'records' && (
            <PatientRecordsView
              onSelectPatientForConsultation={handleSelectPatientForConsultation}
              onNewPatientClick={() => setIsNewPatientModalOpen(true)}
            />
          )}

          {activeTab === 'coding-ref' && <MedicalCodingReferenceView />}

          {activeTab === 'guide' && (
            <UserGuideView onStartWorkflow={handleStartWorkflow} />
          )}
        </main>

        {/* FOOTER */}
        <footer className="w-full border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center space-x-1">
            <i className="bi bi-heart-pulse-fill text-sky-600"></i>
            <span>Dr. Priya Clinical Assistant • Smart Clinical Documentation & Medical Coding Studio</span>
          </p>
        </footer>
      </div>

      {/* MODALS */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onPatientCreated={handlePatientCreated}
      />

      <WhatsAppGatewayModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onStatusChange={(connected) => setIsWhatsAppConnected(connected)}
      />

    </div>
  );
}

export default App;
