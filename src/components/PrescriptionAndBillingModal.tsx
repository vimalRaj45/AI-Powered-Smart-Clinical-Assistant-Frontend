import React, { useState, useEffect, useRef } from 'react';
import type { Patient, SoapNoteData, IcdCodeItem, CptCodeItem } from '../types';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface EditableMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionAndBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  doctorName?: string;
  soapNote?: SoapNoteData | null;
  medications?: string[];
  icdCodes?: IcdCodeItem[];
  cptCodes?: CptCodeItem[];
  consultationDate?: string;
  onSavePrescription?: (updatedMedications: EditableMedication[], updatedAdvice: string) => void;
}

export const PrescriptionAndBillingModal: React.FC<PrescriptionAndBillingModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctorName = 'Dr. Priya MD',
  soapNote,
  medications = [],
  icdCodes = [],
  cptCodes = [],
  consultationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  onSavePrescription,
}) => {
  const [activeView, setActiveView] = useState<'rx' | 'bill'>('rx');
  const [isEditingRx, setIsEditingRx] = useState<boolean>(false);
  const [editableMeds, setEditableMeds] = useState<EditableMedication[]>([]);
  const [physicianAdvice, setPhysicianAdvice] = useState<string>('');
  const [showSavedNotification, setShowSavedNotification] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<boolean>(false);
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [showPhonePrompt, setShowPhonePrompt] = useState<boolean>(false);

  const documentRef = useRef<HTMLDivElement>(null);

  // Initialize editable prescription items when modal opens or props change
  useEffect(() => {
    if (patient) {
      setRecipientPhone(patient.phone || '+1 555-0192');
    }

    if (medications && medications.length > 0) {
      const parsed: EditableMedication[] = medications.map((med, idx) => {
        return {
          id: `med-${Date.now()}-${idx}`,
          name: typeof med === 'string' ? med : 'Prescribed Medication',
          dosage: 'Standard clinical dosage',
          frequency: 'As directed',
          duration: '5 to 7 days',
          instructions: 'Take orally after meals with water',
        };
      });
      setEditableMeds(parsed);
    } else {
      setEditableMeds([
        {
          id: `med-${Date.now()}-0`,
          name: 'Paracetamol 650mg Tab',
          dosage: '650mg tablet',
          frequency: '3 times daily (TID)',
          duration: '5 days',
          instructions: 'Take after meals for fever/pain',
        }
      ]);
    }

    setPhysicianAdvice(soapNote?.plan || 'Adequate hydration, warm fluid intake, rest for 48-72 hours. Return immediately if symptoms worsen or high fever persists.');
    setIsEditingRx(false);
    setShowPhonePrompt(false);
  }, [isOpen, patient, medications, soapNote]);

  if (!isOpen || !patient) return null;

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download via html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // Temporarily ensure high quality rendering
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = activeView === 'rx'
        ? `Prescription_${patient.name.replace(/\s+/g, '_')}_${patient.mrn}.pdf`
        : `Medical_Bill_${patient.name.replace(/\s+/g, '_')}_${patient.mrn}.pdf`;

      pdf.save(fileName);

      Swal.fire({
        icon: 'success',
        title: 'PDF Downloaded!',
        text: `Official ${activeView === 'rx' ? 'Prescription' : 'Invoice'} PDF saved as ${fileName}`,
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'PDF Generation Failed',
        text: 'Falling back to standard browser print/save dialog.',
      });
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Send WhatsApp via Baileys Gateway & Direct Web Link
  const handleSendWhatsApp = async () => {
    if (!recipientPhone.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Phone Number Required',
        text: 'Please provide a valid patient phone number with country code.',
      });
      return;
    }

    setIsSendingWhatsApp(true);
    try {
      const payload = {
        phone: recipientPhone,
        patientName: patient.name,
        mrn: patient.mrn,
        doctorName: doctorName,
        diagnosis: icdCodes && icdCodes.length > 0 ? `${icdCodes[0].code} - ${icdCodes[0].description}` : 'Clinical Consultation',
        medications: editableMeds,
        advice: physicianAdvice,
        total: total,
      };

      const res = await api.sendPrescriptionWhatsApp(payload);

      Swal.fire({
        title: 'Prescription Dispatched to WhatsApp! 📱',
        html: `
          <div class="text-left text-xs space-y-3 p-2">
            <p class="font-bold text-slate-800">Transmitted to: <span class="font-mono text-emerald-700 font-bold">${res.recipient}</span></p>
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap">
${res.messagePreview}
            </div>
            <p class="text-[11px] text-slate-500">Official digital Take-Home summary delivered via Baileys WhatsApp Gateway.</p>
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-whatsapp mr-1"></i> Open in WhatsApp Web',
        cancelButtonText: 'Done',
        confirmButtonColor: '#25D366',
        cancelButtonColor: '#64748b',
      }).then((result) => {
        if (result.isConfirmed && res.whatsappLink) {
          window.open(res.whatsappLink, '_blank');
        }
      });

      setShowPhonePrompt(false);
    } catch (err: any) {
      console.error('WhatsApp dispatch error:', err);
      // Fallback to direct client-side WhatsApp link
      const fallbackMsg = encodeURIComponent(
        `🏥 *PRIYA HEALTHCARE* - e-Prescription for *${patient.name}* (MRN: ${patient.mrn})\n` +
        `Prescribed Medications: ${editableMeds.map(m => m.name).join(', ')}\n` +
        `Doctor Advice: ${physicianAdvice}`
      );
      const directWaUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${fallbackMsg}`;

      Swal.fire({
        title: 'Open WhatsApp Directly',
        text: 'Dispatch via Web WhatsApp link:',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Open WhatsApp',
        confirmButtonColor: '#25D366',
      }).then((res) => {
        if (res.isConfirmed) {
          window.open(directWaUrl, '_blank');
        }
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const handleAddMedication = (templateName?: string) => {
    const newMed: EditableMedication = {
      id: `med-${Date.now()}-${editableMeds.length}`,
      name: templateName || '',
      dosage: '1 tablet / capsule',
      frequency: 'Twice daily (BID)',
      duration: '5 days',
      instructions: 'Take with water after meals',
    };
    setEditableMeds([...editableMeds, newMed]);
    setIsEditingRx(true);
  };

  const handleUpdateMedication = (id: string, field: keyof EditableMedication, value: string) => {
    setEditableMeds((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleRemoveMedication = (id: string) => {
    setEditableMeds((prev) => prev.filter((med) => med.id !== id));
  };

  const handleSavePrescription = () => {
    if (onSavePrescription) {
      onSavePrescription(editableMeds, physicianAdvice);
    }
    setIsEditingRx(false);
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  // Quick preset medication templates
  const quickTemplates = [
    { label: 'Paracetamol 650mg', name: 'Paracetamol 650mg Tab' },
    { label: 'Amoxicillin 500mg', name: 'Amoxicillin 500mg Cap' },
    { label: 'Cetirizine 10mg', name: 'Cetirizine 10mg Tab' },
    { label: 'Pantoprazole 40mg', name: 'Pantoprazole 40mg Tab (OD before food)' },
    { label: 'Ibuprofen 400mg', name: 'Ibuprofen 400mg Tab' },
  ];

  // Calculate standard itemized billing fees based on CPT codes
  const billingItems = (cptCodes && cptCodes.length > 0 ? cptCodes : [
    { code: '99213', description: 'Office Consultation (Outpatient Evaluation & Management)' }
  ]).map((cpt, index) => {
    const fee = cpt.code.startsWith('99214') ? 110 : cpt.code.startsWith('99213') ? 75 : 50;
    return {
      itemNo: index + 1,
      service: cpt.description || 'Clinical Evaluation & Management',
      code: `CPT ${cpt.code}`,
      fee: fee,
    };
  });

  const subtotal = billingItems.reduce((acc, item) => acc + item.fee, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header Navigation & Action Bar (Hidden on Print) */}
        <div className="no-print p-3.5 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-file-earmark-medical-fill text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-extrabold text-white tracking-wide truncate">
                  Doctor Clinical Orders & Documents
                </h3>
                {isEditingRx && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    Edit Active
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Prescription (Rx), PDF Download & WhatsApp Gateway
              </p>
            </div>
          </div>

          {/* Action Tools Header */}
          <div className="flex items-center justify-between sm:justify-end space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {/* View Switcher Pills */}
            <div className="flex items-center bg-slate-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-700 text-[11px] sm:text-xs font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('rx')}
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all ${
                  activeView === 'rx'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="bi bi-capsule"></i>
                <span className="hidden xs:inline">Rx</span>
                <span className="xs:hidden">Prescription</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('bill')}
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all ${
                  activeView === 'bill'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="bi bi-receipt"></i>
                <span className="hidden xs:inline">Bill</span>
                <span className="xs:hidden">Invoice</span>
              </button>
            </div>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-[11px] sm:text-xs font-bold transition-all shadow-sm flex-shrink-0"
              title="Download High-Res PDF"
            >
              <i className={`bi ${isGeneratingPdf ? 'bi-arrow-clockwise animate-spin' : 'bi-file-earmark-pdf-fill'} text-rose-600`}></i>
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-[11px] sm:text-xs font-bold transition-all shadow-sm flex-shrink-0"
              title="Print Document"
            >
              <i className="bi bi-printer-fill text-sky-600"></i>
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all flex-shrink-0"
            >
              <i className="bi bi-x-lg text-xs sm:text-sm"></i>
            </button>
          </div>
        </div>

        {/* WhatsApp Phone Bar Prompt (Collapsible) */}
        {showPhonePrompt && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold w-full sm:w-auto">
              <i className="bi bi-whatsapp text-emerald-600 text-lg"></i>
              <span>Patient WhatsApp Phone:</span>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+1 555-0192 or +91 9876543210"
                className="px-2.5 py-1 rounded-lg border border-emerald-300 font-mono text-xs text-slate-900 bg-white flex-1 sm:w-48"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                disabled={isSendingWhatsApp}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1 transition-all shadow-sm"
              >
                <i className={`bi ${isSendingWhatsApp ? 'bi-arrow-clockwise animate-spin' : 'bi-send-fill'}`}></i>
                <span>{isSendingWhatsApp ? 'Sending...' : 'Send WhatsApp Now'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPhonePrompt(false)}
                className="px-2 py-1 rounded-lg text-slate-500 hover:bg-emerald-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Success notification banner */}
        {showSavedNotification && (
          <div className="no-print bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center space-x-2 shadow-inner">
            <i className="bi bi-check-circle-fill"></i>
            <span>Prescription modifications saved successfully!</span>
          </div>
        )}

        {/* Document Body */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-4 sm:space-y-6">
          
          {/* Printable / PDF Capture Container */}
          <div ref={documentRef} className="space-y-4 sm:space-y-6">
            
            {/* TAB 1: OFFICIAL PRESCRIPTION (Rx) */}
            {activeView === 'rx' && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6 text-slate-800">
                
                {/* Doctor Letterhead Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 sm:pb-6 border-b-2 border-sky-600 gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{doctorName}</h2>
                    <p className="text-xs font-bold text-sky-700">MD, Internal & Family Medicine</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Registration Lic. #MED-749201 • Clinical Associate</p>
                    <p className="text-[11px] text-slate-500">Priya Healthcare Medical Studio & Clinic</p>
                  </div>
                  <div className="sm:text-right space-y-0.5 text-xs text-slate-600">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200 mb-1 text-[11px]">
                      <i className="bi bi-shield-check text-xs"></i>
                      <span>Certified e-Prescription</span>
                    </div>
                    <p className="font-semibold text-slate-800">Date: <span className="font-normal">{consultationDate}</span></p>
                    <p className="font-semibold text-slate-800">Prescription #: <span className="font-mono font-bold text-sky-700">RX-{patient.mrn.replace('MRN-', '')}</span></p>
                  </div>
                </div>

                {/* Patient Demographics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                    <span className="font-bold text-slate-900 truncate block">{patient.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                    <span className="font-semibold text-slate-800">{patient.age} yrs • {patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient MRN</span>
                    <span className="font-mono font-bold text-sky-700">{patient.mrn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Allergies</span>
                    <span className="font-bold text-rose-700 truncate block">{patient.allergies || 'NKDA'}</span>
                  </div>
                </div>

                {/* Diagnosis Indication */}
                {icdCodes && icdCodes.length > 0 && (
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-500 tracking-wider">Clinical Diagnosis:</span>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {icdCodes.map((item, i) => (
                        <span key={i} className="inline-flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-blue-50 text-blue-900 text-[11px] sm:text-xs font-semibold border border-blue-200">
                          <span className="font-mono font-bold text-blue-700">{item.code}:</span>
                          <span>{item.description}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Edit Prescription Controls (Hidden on Print) */}
                <div className="no-print bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                        <i className="bi bi-pencil-square text-sky-600"></i>
                        <span className="hidden xs:inline">Prescription Controls:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingRx(!isEditingRx)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                          isEditingRx
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-sm'
                        }`}
                      >
                        {isEditingRx ? '✓ Done Editing' : '✏️ Edit Prescription'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddMedication()}
                        className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Add Med</span>
                      </button>
                      {isEditingRx && (
                        <button
                          type="button"
                          onClick={handleSavePrescription}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                        >
                          <i className="bi bi-check2-circle"></i>
                          <span>Save</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick 1-Click Medication Templates */}
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1 border-t border-slate-200 text-[10px] sm:text-[11px]">
                    <span className="font-semibold text-slate-500">Quick:</span>
                    {quickTemplates.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddMedication(tpl.name)}
                        className="px-2 py-0.5 rounded-md bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 font-medium transition-all"
                      >
                        + {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Rx Symbol & Medications Table */}
                <div className="space-y-2 sm:space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sky-700 font-serif text-xl sm:text-2xl font-bold">
                      <span>℞</span>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Medications</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                      {editableMeds.length} item{editableMeds.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs min-w-[500px] sm:min-w-full">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-3 sm:px-4 w-2/5">Medication & Strength</th>
                          <th className="py-2.5 px-3 sm:px-4 w-1/4">Dosage / Frequency</th>
                          <th className="py-2.5 px-3 sm:px-4">Instructions & Duration</th>
                          {isEditingRx && <th className="no-print py-2.5 px-2 w-10 text-center">Del</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editableMeds.length > 0 ? (
                          editableMeds.map((item, index) => (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 text-center font-bold text-slate-400">{index + 1}</td>
                              
                              {/* Medication Name */}
                              <td className="py-2 px-3 sm:px-4">
                                {isEditingRx ? (
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleUpdateMedication(item.id, 'name', e.target.value)}
                                    placeholder="Drug name & strength"
                                    className="w-full px-2 py-1 rounded-lg border border-slate-300 focus:border-sky-500 text-xs font-bold text-slate-900 bg-white"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                                )}
                              </td>

                              {/* Dosage & Frequency */}
                              <td className="py-2 px-3 sm:px-4">
                                {isEditingRx ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={item.dosage}
                                      onChange={(e) => handleUpdateMedication(item.id, 'dosage', e.target.value)}
                                      placeholder="Dosage"
                                      className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={item.frequency}
                                      onChange={(e) => handleUpdateMedication(item.id, 'frequency', e.target.value)}
                                      placeholder="Frequency"
                                      className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs text-slate-700"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-slate-800 font-semibold block">{item.frequency}</span>
                                    <span className="text-[11px] text-slate-500">{item.dosage}</span>
                                  </div>
                                )}
                              </td>

                              {/* Instructions & Duration */}
                              <td className="py-2 px-3 sm:px-4">
                                {isEditingRx ? (
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={item.instructions}
                                      onChange={(e) => handleUpdateMedication(item.id, 'instructions', e.target.value)}
                                      placeholder="Instructions"
                                      className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={item.duration}
                                      onChange={(e) => handleUpdateMedication(item.id, 'duration', e.target.value)}
                                      placeholder="Duration"
                                      className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs text-slate-600"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-slate-700 block">{item.instructions}</span>
                                    <span className="text-[11px] font-semibold text-sky-700">Duration: {item.duration}</span>
                                  </div>
                                )}
                              </td>

                              {/* Delete Action (Only when Editing) */}
                              {isEditingRx && (
                                <td className="no-print py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMedication(item.id)}
                                    className="w-6 h-6 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all mx-auto"
                                    title="Remove medication"
                                  >
                                    <i className="bi bi-trash3 text-xs"></i>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={isEditingRx ? 5 : 4} className="py-6 text-center text-slate-400 italic">
                              No prescription medications added. Click "Add Med" above to prescribe.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* General Care & Follow-up Instructions (Editable) */}
                <div className="p-3 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
                  <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                    <i className="bi bi-clipboard2-pulse-fill text-amber-700"></i>
                    <span>Physician Advice & General Care Instructions:</span>
                  </span>

                  {isEditingRx ? (
                    <textarea
                      rows={3}
                      value={physicianAdvice}
                      onChange={(e) => setPhysicianAdvice(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-amber-300 bg-white text-slate-800 text-xs leading-relaxed focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      placeholder="Enter lifestyle advice, hydration, follow-up timeline..."
                    />
                  ) : (
                    <p className="text-amber-900 leading-relaxed font-medium whitespace-pre-line text-xs sm:text-sm">
                      {physicianAdvice}
                    </p>
                  )}
                </div>

                {/* Footer Signature Seal */}
                <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 space-y-0.5">
                    <p>✓ Digitally signed via Dr. Priya Clinical Studio</p>
                    <p>Valid for pharmacy fulfillment • Emergency: Call 911 / 112</p>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <div className="font-serif italic text-base sm:text-lg text-sky-800 font-bold border-b border-slate-300 pb-1 sm:px-4">
                      {doctorName}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authorized Physician Signature</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MEDICAL BILLING INVOICE RECEIPT */}
            {activeView === 'bill' && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6 text-slate-800">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 sm:pb-6 border-b-2 border-emerald-600 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                        $
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Clinical Medical Invoice</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Priya Healthcare Medical Billing & Claims Department</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">Tax ID / TIN: 84-9201948 • Clinic Code: CLINIC-01</p>
                  </div>

                  <div className="sm:text-right space-y-0.5 text-xs text-slate-600">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 mb-1 text-[11px]">
                      <i className="bi bi-check-circle-fill text-emerald-600 text-xs"></i>
                      <span>Payment Verified</span>
                    </span>
                    <p className="font-semibold text-slate-800">Invoice #: <span className="font-mono font-bold text-emerald-700">INV-{patient.mrn.replace('MRN-', '')}</span></p>
                    <p className="font-semibold text-slate-800">Date: <span className="font-normal">{consultationDate}</span></p>
                  </div>
                </div>

                {/* Patient & Attending Physician Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Billed To (Patient)</span>
                    <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                    <p className="text-slate-600">MRN: <span className="font-mono font-bold">{patient.mrn}</span> • Age: {patient.age} ({patient.gender})</p>
                    <p className="text-slate-500">Contact: {recipientPhone || patient.phone || 'On file'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Attending Clinician</span>
                    <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
                    <p className="text-slate-600">Department: General & Internal Medicine</p>
                    <p className="text-slate-500">Payment Mode: Direct Billing / Insurance Ready</p>
                  </div>
                </div>

                {/* Itemized Services Breakdown Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Itemized Clinical Services (CPT / E&M)</span>
                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs min-w-[450px] sm:min-w-full">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-4">Service Description</th>
                          <th className="py-2.5 px-4">Procedure Code</th>
                          <th className="py-2.5 px-4 text-right">Fee (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billingItems.map((item) => (
                          <tr key={item.itemNo} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{item.itemNo}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{item.service}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{item.code}</td>
                            <td className="py-2.5 px-4 text-right font-bold text-slate-900">${item.fee.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Calculation Box */}
                <div className="flex justify-end pt-1">
                  <div className="w-full sm:w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Clinical Facility Surcharge (5%):</span>
                      <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t-2 border-slate-200">
                      <span>Total Amount:</span>
                      <span className="text-emerald-700 font-mono">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Insurance Filing Note */}
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-[11px] sm:text-xs text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <i className="bi bi-info-circle-fill text-sky-600 text-sm"></i>
                    <span>Includes all ICD-10 & CPT codes required for insurance claims.</span>
                  </div>
                  <span className="font-mono font-bold text-sky-800">HCFA-1500 Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="no-print p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          
          {/* Left Actions: WhatsApp & Mobile Edit */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* WhatsApp Dispatch Button */}
            <button
              type="button"
              onClick={() => setShowPhonePrompt(!showPhonePrompt)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              title="Send to patient WhatsApp"
            >
              <i className="bi bi-whatsapp text-sm"></i>
              <span className="hidden xs:inline">WhatsApp Rx</span>
            </button>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200 transition-all"
            >
              <i className="bi bi-download text-xs text-sky-700"></i>
              <span>PDF</span>
            </button>
          </div>

          {/* Right Actions: Print & Close */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              <i className="bi bi-printer-fill text-xs"></i>
              <span>Print {activeView === 'rx' ? 'Rx' : 'Bill'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
