import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { AudioVisualizer } from './AudioVisualizer';
import { ExtractedEntitiesCard } from './ExtractedEntitiesCard';
import { SoapNoteEditor } from './SoapNoteEditor';
import { MedicalCodingDrawer } from './MedicalCodingDrawer';
import { AutomationController } from './AutomationController';
import { PrescriptionAndBillingModal } from './PrescriptionAndBillingModal';
import { api } from '../services/api';
import type { Patient, AIClinicalResult, SoapNoteData, IcdCodeItem, CptCodeItem } from '../types';

interface LiveConsultationViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onNewPatientClick: () => void;
  onConsultationSaved: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-Detect (Any Language 🌍)', langCode: 'en-US' },
  { code: 'en', name: 'English (US/UK/Global)', langCode: 'en-US' },
  { code: 'hi', name: 'Hindi / हिंदी (India)', langCode: 'hi-IN' },
  { code: 'es', name: 'Spanish / Español', langCode: 'es-ES' },
  { code: 'ta', name: 'Tamil / தமிழ்', langCode: 'ta-IN' },
  { code: 'fr', name: 'French / Français', langCode: 'fr-FR' },
  { code: 'de', name: 'German / Deutsch', langCode: 'de-DE' },
  { code: 'ar', name: 'Arabic / العربية', langCode: 'ar-SA' },
];

const PRESET_SCRIPTS = [
  {
    title: 'Fever & Cough (Acute URI)',
    badge: 'English 🇬🇧',
    icon: 'bi-thermometer-high',
    lang: 'en-US',
    text: 'Patient presents with fever and cough for three days. Body temperature recorded at 101°F. Pulse is 84 bpm, blood pressure 120/80 mmHg, and oxygen saturation is 98% on room air. Mild pharyngeal redness noted. Prescribed Paracetamol 650mg TID for 3 days and advised warm steam inhalation and oral hydration.',
  },
  {
    title: 'बुखार और खांसी (Hindi Dictation)',
    badge: 'Hindi 🇮🇳',
    icon: 'bi-translate',
    lang: 'hi-IN',
    text: 'मरीज को 3 दिनों से तेज बुखार और सूखी खांसी की शिकायत है। शरीर का तापमान 101.4°F मापा गया है। बीपी 120/80 mmHg और पल्स 84 प्रति मिनट है। गले में हल्की लालिमा है। मरीज को पेरासिटामोल 650mg दिन में तीन बार 3 दिन के लिए और गर्म पानी की भाप लेने की सलाह दी गई है।',
  },
  {
    title: 'Fiebre y Tos (Spanish Dictation)',
    badge: 'Spanish 🇪🇸',
    icon: 'bi-globe2',
    lang: 'es-ES',
    text: 'El paciente presenta fiebre y tos productiva desde hace tres días. Temperatura corporal registrada en 101.2°F (38.4°C), presión arterial 120/80 mmHg, pulso 82 lpm y saturación de oxígeno 98%. Se prescribe Paracetamol 650mg cada 8 horas por 3 días y abundantes líquidos.',
  },
  {
    title: 'Fièvre et Toux (French Dictation)',
    badge: 'French 🇫🇷',
    icon: 'bi-chat-left-text',
    lang: 'fr-FR',
    text: 'Le patient consulte pour une fièvre et une toux persistante depuis 3 jours. Température mesurée à 38.3°C (101°F), tension artérielle à 120/80 mmHg, fréquence cardiaque à 84 bpm. Examen oropharyngé montre une légère rougeur. Prescription de Paracétamol 650mg 3 fois par jour pendant 3 jours.',
  },
  {
    title: 'Diabetes & Hypertension Follow-up',
    badge: 'English 🇬🇧',
    icon: 'bi-heart-pulse',
    lang: 'en-US',
    text: '58-year-old patient here for routine hypertension and type 2 diabetes follow-up. Blood pressure is 148/92 mmHg, pulse 76 bpm, BMI 28.4. Patient reports occasional morning headaches and mild fatigue for 2 weeks. Current medication: Metformin 500mg BID. Added Lisinopril 10mg daily for blood pressure control and ordered fasting lipid panel and HbA1c testing.',
  },
  {
    title: 'காய்ச்சல் மற்றும் இருமல் (Tamil Dictation)',
    badge: 'Tamil 🇮🇳',
    icon: 'bi-translate',
    lang: 'ta-IN',
    text: 'நோயாளிக்கு மூன்று நாட்களாக கடுமையான காய்ச்சல் மற்றும் இருமல் உள்ளது. உடல் வெப்பநிலை 101°F, இரத்த அழுத்தம் 120/80 mmHg, நாடித்துடிப்பு 84 bpm. பாராசிட்டமால் 650mg மூன்று வேளை 3 நாட்களுக்கு பரிந்துரைக்கப்பட்டது.',
  },
];

export const LiveConsultationView: React.FC<LiveConsultationViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onNewPatientClick,
  onConsultationSaved,
}) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    frequencyData,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearAudio,
  } = useAudioRecorder();

  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Autonomous Demo State
  const [isAutoDemoRunning, setIsAutoDemoRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDescription, setStepDescription] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [virtualCursor, setVirtualCursor] = useState({ x: -100, y: -100, clicking: false, visible: false });
  const autoDemoAbortRef = useRef(false);

  const [clinicalResult, setClinicalResult] = useState<AIClinicalResult | null>(null);
  const [soapNote, setSoapNote] = useState<SoapNoteData | null>(null);
  const [icdCodes, setIcdCodes] = useState<IcdCodeItem[]>([]);
  const [cptCodes, setCptCodes] = useState<CptCodeItem[]>([]);
  
  const [doctorNotes, setDoctorNotes] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Priya MD');
  const [isApproving, setIsApproving] = useState(false);
  const [isRxBillModalOpen, setIsRxBillModalOpen] = useState(false);

  useEffect(() => {
    if (!selectedPatient && patients.length > 0) {
      onSelectPatient(patients[0]);
    }
  }, [patients, selectedPatient, onSelectPatient]);

  // Play pleasant clinical audio chime using Web Audio API
  const playClinicalChime = (type: 'chime' | 'success' = 'chime') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Helper to move virtual cursor to an element smoothly
  const moveCursorToElement = async (selector: string, click = false, delayMs = 600) => {
    const el = document.querySelector(selector);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await new Promise((r) => setTimeout(r, 250 / playbackSpeed));

    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    setVirtualCursor({ x: targetX, y: targetY, clicking: false, visible: true });
    await new Promise((r) => setTimeout(r, delayMs / playbackSpeed));

    if (click) {
      setVirtualCursor({ x: targetX, y: targetY, clicking: true, visible: true });
      await new Promise((r) => setTimeout(r, 180 / playbackSpeed));
      setVirtualCursor({ x: targetX, y: targetY, clicking: false, visible: true });
    }
  };

  // Transcribe voice with SweetAlert loading
  const handleTranscribeAudio = async () => {
    if (!audioBlob) return;
    try {
      setIsTranscribing(true);
      Swal.fire({
        title: 'Transcribing Audio...',
        text: 'Processing spoken consultation in any language...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const transcriptText = await api.transcribeAudio(audioBlob);
      if (transcriptText) {
        setTranscript((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
        Swal.fire({
          icon: 'success',
          title: 'Transcription Complete',
          text: 'Spoken consultation transcribed accurately.',
          timer: 1600,
          showConfirmButton: false,
        });
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Transcription Failed',
        text: err.message || 'Could not transcribe audio. Please try again or type directly.',
        confirmButtonColor: '#0284c7',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  // Process AI with REAL-TIME SSE (Server-Sent Events) STREAMING
  const handleProcessAI = async (inputText?: string): Promise<AIClinicalResult | null> => {
    const textToProcess = inputText || transcript;
    if (!textToProcess.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Consultation Notes Required',
        text: 'Please dictate or type consultation notes before generating clinical documentation.',
        confirmButtonColor: '#0284c7',
      });
      return null;
    }

    try {
      setIsProcessingAI(true);

      // SweetAlert with live dynamic SSE status container
      Swal.fire({
        title: '⚡ Real-Time Clinical AI Stream',
        html: `
          <div class="text-left text-xs text-slate-700 space-y-3 mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="flex items-center justify-between pb-2 border-b border-slate-200">
              <span id="sse-step-title" class="font-extrabold text-sky-900 text-xs flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                <span>Connecting to Real-time Stream...</span>
              </span>
              <span id="sse-pct" class="font-mono text-sky-600 font-bold">10%</span>
            </div>

            <!-- Real-time Progress Bar -->
            <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div id="sse-bar" class="bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300" style="width: 10%"></div>
            </div>

            <div id="sse-log" class="text-[11px] text-slate-500 space-y-1 font-medium max-h-24 overflow-y-auto">
              <div class="text-emerald-700 font-bold">✓ SSE Stream Connection Established</div>
            </div>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Execute Real-Time SSE Stream with Live progressive state updating
      const result = await api.processAIStream(
        textToProcess,
        selectedPatient?.id,
        (event, data) => {
          const stepTitleEl = document.getElementById('sse-step-title');
          const pctEl = document.getElementById('sse-pct');
          const barEl = document.getElementById('sse-bar');
          const logEl = document.getElementById('sse-log');

          if (event === 'step') {
            if (stepTitleEl) stepTitleEl.innerText = data.title || 'Processing...';
            if (pctEl) pctEl.innerText = `${data.progress}%`;
            if (barEl) barEl.style.width = `${data.progress}%`;
            if (logEl) {
              const div = document.createElement('div');
              div.className = 'text-slate-700';
              div.innerText = `• ${data.title}`;
              logEl.appendChild(div);
              logEl.scrollTop = logEl.scrollHeight;
            }
          } else if (event === 'vitals') {
            // Live populate vitals & symptoms cards on screen
            setClinicalResult((prev) => ({
              structuredData: {
                chiefComplaint: prev?.structuredData?.chiefComplaint || 'Consultation Review',
                vitals: data.vitals,
                symptoms: data.symptoms,
                examinationFindings: prev?.structuredData?.examinationFindings || [],
                medications: prev?.structuredData?.medications || [],
                allergies: prev?.structuredData?.allergies || [],
              },
              soapNote: prev?.soapNote || { subjective: '', objective: '', assessment: '', plan: '' },
              icdCodes: prev?.icdCodes || [],
              cptCodes: prev?.cptCodes || [],
            }));
          } else if (event === 'examination') {
            // Live populate exam & medications cards on screen
            setClinicalResult((prev) => ({
              structuredData: {
                ...prev?.structuredData,
                examinationFindings: data.examinationFindings,
                medications: data.medications,
                allergies: data.allergies,
              },
              soapNote: prev?.soapNote || { subjective: '', objective: '', assessment: '', plan: '' },
              icdCodes: prev?.icdCodes || [],
              cptCodes: prev?.cptCodes || [],
            }));
          } else if (event === 'soap') {
            // Live populate SOAP Note Editor on screen
            setSoapNote(data);
          } else if (event === 'codes') {
            // Live populate ICD-10 & CPT drawer on screen
            setIcdCodes(data.icdCodes || []);
            setCptCodes(data.cptCodes || []);
          }
        }
      );

      // Set final validated data
      setClinicalResult(result);
      setSoapNote(result.soapNote);
      setIcdCodes(result.icdCodes || []);
      setCptCodes(result.cptCodes || []);

      Swal.fire({
        icon: 'success',
        title: 'Real-Time Generation Complete',
        text: 'Vitals, SOAP notes, and medical codes streamed & verified.',
        timer: 1500,
        showConfirmButton: false,
      });

      return result;
    } catch (err: any) {
      console.error('AI Processing error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Analysis Error',
        text: err.message || 'Failed to process consultation.',
        confirmButtonColor: '#0284c7',
      });
      return null;
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Physician Certification & Sign-off
  const handleApproveAndSave = async (customResult?: AIClinicalResult, customTranscript?: string) => {
    const resToSave = customResult || clinicalResult;
    const finalSoap = customResult?.soapNote || soapNote;
    const finalIcd = customResult?.icdCodes || icdCodes;
    const finalCpt = customResult?.cptCodes || cptCodes;
    const textUsed = customTranscript || transcript;

    if (!selectedPatient) {
      Swal.fire({
        icon: 'warning',
        title: 'Select Patient',
        text: 'Please select a patient before certifying the medical record.',
        confirmButtonColor: '#0284c7',
      });
      return;
    }

    if (!finalSoap) {
      Swal.fire({
        icon: 'warning',
        title: 'SOAP Note Required',
        text: 'Generate and review SOAP clinical note before signing.',
        confirmButtonColor: '#0284c7',
      });
      return;
    }

    try {
      setIsApproving(true);
      Swal.fire({
        title: 'Certifying Medical Record...',
        text: 'Applying physician digital signature and archiving encounter.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Save consultation as approved record
      await api.saveConsultation({
        patientId: selectedPatient.id,
        status: 'approved',
        rawTranscript: textUsed,
        structuredData: resToSave?.structuredData || {},
        soapNote: finalSoap,
        icdCodes: finalIcd,
        cptCodes: finalCpt,
        doctorNotes: doctorNotes,
        doctorName: doctorName,
      });

      playClinicalChime('success');

      Swal.fire({
        icon: 'success',
        title: 'Encounter Certified & Saved',
        html: `
          <div class="text-left text-xs text-slate-700 space-y-2 mt-2">
            <p class="font-bold text-emerald-700 flex items-center space-x-1.5">
              <i class="bi bi-shield-fill-check text-base"></i>
              <span>Officially certified by ${doctorName}</span>
            </p>
            <p class="text-slate-500">Documentation filed to patient history with verified ICD-10 & CPT billing codes.</p>
          </div>
        `,
        confirmButtonColor: '#0284c7',
        confirmButtonText: 'View Patient Encounters',
      });

      setIsRxBillModalOpen(true);
      onConsultationSaved();
    } catch (err: any) {
      console.error('Approval failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'Certification Error',
        text: err.message || 'Failed to save record.',
        confirmButtonColor: '#0284c7',
      });
    } finally {
      setIsApproving(false);
    }
  };

  // FULL TRANSPARENT AUTONOMOUS ROBOT DEMO (Playwright-like in-browser automated flow)
  const run1ClickAutomatedDemo = async (scenarioIndex = 0) => {
    if (isAutoDemoRunning) return;
    setIsAutoDemoRunning(true);
    autoDemoAbortRef.current = false;

    const selectedScenario = PRESET_SCRIPTS[scenarioIndex] || PRESET_SCRIPTS[0];
    const demoScript = selectedScenario.text;

    try {
      // Step 1: Patient Selection
      setCurrentStepIndex(0);
      setStepTitle('1. Patient Verification & Selection');
      setStepDescription('Selecting patient record and verifying clinical history.');
      if (patients.length > 0) {
        onSelectPatient(patients[0]);
      }
      await moveCursorToElement('#patient-header-section', true, 600);
      if (autoDemoAbortRef.current) return;

      // Step 2: Spoken Voice Dictation & Audio Capture
      setCurrentStepIndex(1);
      setStepTitle(`2. Multilingual Voice Dictation (${selectedScenario.badge})`);
      setStepDescription(`Simulating doctor voice recording: "${selectedScenario.title}"`);
      await moveCursorToElement('#transcript-input-area', true, 500);

      playClinicalChime('chime');

      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const speechSnippet = demoScript.length > 150 ? demoScript.slice(0, 150) + '...' : demoScript;
          const utterance = new SpeechSynthesisUtterance(speechSnippet);
          utterance.lang = selectedScenario.lang || 'en-US';
          utterance.rate = 1.05 * playbackSpeed;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Speech synthesis note:', e);
        }
      }

      // Stream words dynamically with animated typing
      setTranscript('');
      let typed = '';
      const words = demoScript.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (autoDemoAbortRef.current) return;
        typed += (i === 0 ? '' : ' ') + words[i];
        setTranscript(typed);
        await new Promise((r) => setTimeout(r, 20 / playbackSpeed));
      }

      await new Promise((r) => setTimeout(r, 400 / playbackSpeed));

      // Step 3: Trigger AI Clinical Analysis
      setCurrentStepIndex(2);
      setStepTitle('3. AI Multilingual Understanding & Extraction');
      setStepDescription('Comprehending spoken language, extracting vitals, symptoms, and generating SOAP note.');
      await moveCursorToElement('#generate-clinical-docs-btn', true, 500);

      const result = await handleProcessAI(demoScript);
      if (!result || autoDemoAbortRef.current) return;

      // Step 4: Highlight Extracted Vitals & Physical Exam
      setCurrentStepIndex(3);
      setStepTitle('4. Reviewing Vitals & Clinical Entities');
      setStepDescription('Vitals (BP, HR, Temp), Timeline, and Physical Exam automatically parsed into standard units.');
      await moveCursorToElement('#extracted-entities-card', false, 800);
      if (autoDemoAbortRef.current) return;

      // Step 5: Highlight Structured SOAP Note
      setCurrentStepIndex(4);
      setStepTitle('5. Reviewing Structured SOAP Note');
      setStepDescription('Subjective, Objective, Assessment, and Plan formulated with precision in standard medical English.');
      await moveCursorToElement('#soap-note-editor-card', false, 800);
      if (autoDemoAbortRef.current) return;

      // Step 6: Highlight Medical ICD/CPT Codes
      setCurrentStepIndex(5);
      setStepTitle('6. Reviewing ICD-10 & CPT Billing Codes');
      setStepDescription('Diagnosis & procedure codes mapped with clinical rationale regardless of input language.');
      await moveCursorToElement('#medical-coding-card', false, 800);
      if (autoDemoAbortRef.current) return;

      // Step 7: Official Physician Certification & Sign-off
      setCurrentStepIndex(6);
      setStepTitle('7. Physician Sign-off & Encounter Certification');
      setStepDescription('Applying digital signature and archiving to database.');
      await moveCursorToElement('#sign-certify-btn', true, 600);

      if (!autoDemoAbortRef.current) {
        await handleApproveAndSave(result, demoScript);
      }
    } catch (err) {
      console.error('Autonomous demo exception:', err);
    } finally {
      setIsAutoDemoRunning(false);
      setVirtualCursor({ x: -100, y: -100, clicking: false, visible: false });
    }
  };

  const handleStopDemo = () => {
    autoDemoAbortRef.current = true;
    setIsAutoDemoRunning(false);
    setVirtualCursor({ x: -100, y: -100, clicking: false, visible: false });
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    Swal.fire({
      icon: 'info',
      title: 'Demo Stopped',
      text: 'Autonomous demo was cancelled by user.',
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const handleClearTranscript = () => {
    if (!transcript) return;
    Swal.fire({
      title: 'Clear Notes?',
      text: 'Are you sure you want to clear current consultation text?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Clear',
    }).then((result) => {
      if (result.isConfirmed) {
        setTranscript('');
      }
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* TRANSPARENT AUTOMATION HUD CONTROLLER */}
      <AutomationController
        isRunning={isAutoDemoRunning}
        currentStepIndex={currentStepIndex}
        totalSteps={7}
        stepTitle={stepTitle}
        stepDescription={stepDescription}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
        onStop={handleStopDemo}
        virtualCursorPosition={virtualCursor}
      />

      {/* 1-CLICK AUTOMATED FULL FLOW DEMO HERO BANNER (REFINED HIGH-CONTRAST MEDICAL CARD) */}
      <div 
        className="rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-800/30 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #034b75 50%, #0c2d48 100%)',
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold tracking-wide border border-emerald-400/40 uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Any Language Supported 🌍</span>
                </span>
                <span className="text-xs font-semibold text-sky-200">
                  English • Hindi • Spanish • French • Tamil & More
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                1-Click Multilingual Autonomous Clinical Demo
              </h2>
              <p className="text-xs text-sky-100/90 leading-relaxed">
                Dictate in <strong className="text-white">ANY language</strong> (Hindi, Spanish, French, Tamil, English, etc.). The AI automatically comprehends the clinical conversation, extracts vitals & symptoms, structures standard SOAP notes, assigns ICD-10/CPT codes, and certifies the record!
              </p>
            </div>

            <button
              onClick={() => run1ClickAutomatedDemo(0)}
              disabled={isAutoDemoRunning}
              className="flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap self-start lg:self-center"
            >
              <i className="bi bi-play-circle-fill text-lg"></i>
              <span>{isAutoDemoRunning ? 'Running Automation...' : '⚡ Run 1-Click Full Demo'}</span>
            </button>
          </div>

          {/* Quick Scenario Selection Bar with Multilingual Flags */}
          <div className="pt-3.5 border-t border-white/15 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider mr-1">
              Multilingual Demo Scenarios:
            </span>
            {PRESET_SCRIPTS.map((script, idx) => (
              <button
                key={idx}
                onClick={() => run1ClickAutomatedDemo(idx)}
                disabled={isAutoDemoRunning}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 hover:border-sky-300 flex items-center space-x-2 disabled:opacity-50 shadow-sm"
              >
                <i className={`bi ${script.icon} text-sky-300 text-sm`}></i>
                <span>{script.title}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/15 text-[10px] text-sky-200 font-bold border border-white/20">{script.badge}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Header Card */}
      <div id="patient-header-section" className="medical-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 border border-sky-300 flex items-center justify-center font-bold text-base shadow-sm">
            {selectedPatient?.name ? selectedPatient.name.charAt(0) : <i className="bi bi-person-fill text-xl"></i>}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-base font-bold text-slate-900">
                {selectedPatient?.name || 'No Patient Selected'}
              </h2>
              {selectedPatient && (
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-300 font-extrabold">
                  {selectedPatient.mrn}
                </span>
              )}
            </div>
            {selectedPatient ? (
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-semibold text-slate-700">{selectedPatient.age} yrs</span> • {selectedPatient.gender} • History: {selectedPatient.medicalHistory || 'None'} • Allergies:{' '}
                <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{selectedPatient.allergies || 'NKDA'}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">Select a patient below to start documenting.</p>
            )}
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            id="patient-select-dropdown"
            className="px-3.5 py-2.5 rounded-xl text-xs medical-input bg-white font-semibold text-slate-800 min-w-[220px]"
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const p = patients.find((pat) => pat.id === Number(e.target.value));
              if (p) onSelectPatient(p);
            }}
          >
            {patients.map((pat) => (
              <option key={pat.id} value={pat.id}>
                {pat.name} ({pat.mrn})
              </option>
            ))}
          </select>
          <button
            onClick={onNewPatientClick}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 whitespace-nowrap transition-all"
          >
            <i className="bi bi-person-plus-fill mr-1.5 text-sky-600"></i>
            <span>New Patient</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Dictation, Right = Extracted Entities & SOAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Recording & Dictation Input */}
        <div id="dictation-workspace" className="lg:col-span-5 space-y-4">
          <div className="medical-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <i className="bi bi-mic-fill text-sky-600 text-base"></i>
                <h3 className="text-sm font-bold text-slate-900">Physician Dictation Station</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Any Language 🌐
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                <i className="bi bi-translate text-sky-600 text-base"></i>
                <span>Spoken Language:</span>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:border-sky-500 focus:outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visualizer & Recorder Controls */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      isRecording ? (isPaused ? 'bg-amber-400' : 'bg-rose-500 recording-pulse') : 'bg-slate-300'
                    }`}
                  ></span>
                  <span className="text-xs font-bold text-slate-700">
                    {isRecording ? (isPaused ? 'Recording Paused' : 'Listening in Any Language...') : 'Mic Ready'}
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formatTime(recordingTime)}
                </span>
              </div>

              {/* Real-time Canvas Wave Visualizer */}
              <div className="h-16 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                {isRecording ? (
                  <AudioVisualizer isRecording={isRecording} frequencyData={frequencyData} />
                ) : (
                  <p className="text-xs text-slate-400 font-medium flex items-center space-x-1.5">
                    <i className="bi bi-soundwave text-sky-500 text-base"></i>
                    <span>Speak naturally in English, Hindi, Spanish, French, Tamil...</span>
                  </p>
                )}
              </div>

              {/* Recorder Action Buttons */}
              <div className="flex items-center justify-center space-x-2 pt-1">
                {!isRecording ? (
                  <button
                    id="start-dictation-btn"
                    onClick={startRecording}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <i className="bi bi-record-circle-fill text-rose-300"></i>
                    <span>Start Dictation</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <i className={`bi bi-${isPaused ? 'play' : 'pause'}-fill mr-1`}></i>
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <i className="bi bi-stop-fill mr-1"></i>
                      <span>Stop & Process</span>
                    </button>
                  </>
                )}

                {audioBlob && !isRecording && (
                  <>
                    <button
                      onClick={handleTranscribeAudio}
                      disabled={isTranscribing}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      <i className="bi bi-translate mr-1.5"></i>
                      <span>Transcribe</span>
                    </button>
                    <button
                      onClick={clearAudio}
                      className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
                      title="Clear Audio"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Textarea Dictation Notes */}
            <div id="transcript-input-area" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <i className="bi bi-journal-text text-sky-600"></i>
                  <span>Consultation Notes (Any Language / Mixed)</span>
                </label>
                {transcript && (
                  <button
                    onClick={handleClearTranscript}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Clear Text
                  </button>
                )}
              </div>
              <textarea
                id="transcript-textarea"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Doctor's spoken conversation, observations, symptoms in any language (English, Hindi, Spanish, French, Tamil, etc.)..."
                rows={7}
                className="w-full medical-input rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed resize-y font-medium border-slate-300 focus:border-sky-500"
              ></textarea>
            </div>

            {/* Presets Quick Injection */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Multilingual Clinical Presets:
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_SCRIPTS.map((script, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTranscript(script.text)}
                    className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[11px] text-slate-700 font-medium transition-all group"
                  >
                    <span className="font-bold text-slate-900 group-hover:text-sky-700 block truncate">{script.title}</span>
                    <span className="text-[10px] text-sky-600 font-semibold">{script.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Process Trigger Button */}
            <button
              id="generate-clinical-docs-btn"
              onClick={() => handleProcessAI()}
              disabled={isProcessingAI || !transcript.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <i className="bi bi-stars text-base text-amber-300"></i>
              <span>{isProcessingAI ? 'Analyzing Multilingual Notes...' : 'Generate Clinical Notes & Medical Codes'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Extracted Entities, SOAP Notes, Medical Codes & Certification */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Extracted Clinical Entities Card */}
          <div id="extracted-entities-card">
            <ExtractedEntitiesCard data={clinicalResult?.structuredData} />
          </div>

          {/* SOAP Clinical Note Editor */}
          <div id="soap-note-editor-card">
            <SoapNoteEditor
              soapNote={soapNote}
              onChange={(updated) => setSoapNote(updated)}
            />
          </div>

          {/* Medical Coding & Billing Drawer */}
          <div id="medical-coding-card">
            <MedicalCodingDrawer
              icdCodes={icdCodes}
              cptCodes={cptCodes}
              onIcdChange={setIcdCodes}
              onCptChange={setCptCodes}
              patient={selectedPatient}
              doctorName="Dr. Priya MD"
              consultationDate={new Date().toISOString()}
            />
          </div>

          {/* Physician Sign-Off & Official Certification Bar */}
          <div id="sign-certify-section" className="medical-card rounded-2xl p-5 space-y-4 border-t-4 border-t-emerald-500 bg-gradient-to-br from-white via-white to-emerald-50/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <i className="bi bi-shield-check text-lg"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Physician Certification & Digital Sign-off</h3>
                  <p className="text-xs text-slate-500">Official medical encounter certification & Rx generation</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                Official Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attending Physician Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full medical-input rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physician Final Addendum (Optional)</label>
                <input
                  type="text"
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="e.g., Reviewed in-person with patient..."
                  className="w-full medical-input rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                id="sign-certify-btn"
                onClick={() => handleApproveAndSave()}
                disabled={isApproving || !soapNote}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <i className="bi bi-check2-circle text-lg"></i>
                <span>{isApproving ? 'Saving & Certifying...' : 'Certify & Sign Encounter'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRxBillModalOpen(true)}
                disabled={!selectedPatient}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                <i className="bi bi-printer-fill text-sky-400 text-sm"></i>
                <span>View Prescription (Rx) & Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Patient Prescription (Rx) & Medical Billing Modal */}
      <PrescriptionAndBillingModal
        isOpen={isRxBillModalOpen}
        onClose={() => setIsRxBillModalOpen(false)}
        patient={selectedPatient}
        doctorName={doctorName}
        soapNote={soapNote}
        medications={clinicalResult?.structuredData?.medications || []}
        icdCodes={icdCodes}
        cptCodes={cptCodes}
        onSavePrescription={(updatedMeds, updatedAdvice) => {
          if (clinicalResult) {
            setClinicalResult({
              ...clinicalResult,
              structuredData: {
                ...clinicalResult.structuredData,
                medications: updatedMeds.map((m) => `${m.name} (${m.dosage} - ${m.frequency})`),
              },
            });
          }
          if (soapNote) {
            setSoapNote({
              ...soapNote,
              plan: updatedAdvice,
            });
          }
        }}
      />
    </div>
  );
};
