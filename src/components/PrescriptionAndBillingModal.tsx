import React, { useState, useEffect, useRef } from 'react';
import type { Patient, SoapNoteData, IcdCodeItem, CptCodeItem } from '../types';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { downloadOrSharePdf } from '../utils/mobilePdfService';
import {
  MASTER_DISEASES,
  ALL_MASTER_DRUGS,
  DiseaseCategory,
  MasterMedication,
} from '../utils/diseaseMedicationDatabase';

export interface EditableMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing?: string;
  instructions: string;
  unitPrice?: number;
}

export interface BillingItem {
  id: string;
  category: 'Doctor Consultation' | 'Pharmacy / Medications' | 'Diagnostic & Lab' | 'Nursing & Procedures' | 'Room & Bed' | 'Other Clinical Services';
  description: string;
  code?: string;
  quantity: number;
  unitPrice: number;
  total: number;
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

  // Disease Library & Medicine Lookup States (1mg & Medindia catalog)
  const [showDiseaseCatalog, setShowDiseaseCatalog] = useState<boolean>(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseCategory | null>(null);
  const [drugSearchQuery, setDrugSearchQuery] = useState<string>('');

  // Hospital Billing State & CRUD Controls
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [isEditingBill, setIsEditingBill] = useState<boolean>(false);
  const [showAddBillForm, setShowAddBillForm] = useState<boolean>(false);
  const [newBillDesc, setNewBillDesc] = useState<string>('');
  const [newBillCategory, setNewBillCategory] = useState<BillingItem['category']>('Diagnostic & Lab');
  const [newBillCode, setNewBillCode] = useState<string>('HOSP-01');
  const [newBillQty, setNewBillQty] = useState<number>(1);
  const [newBillRate, setNewBillRate] = useState<number>(200);

  const [doctorConsultFee, setDoctorConsultFee] = useState<number>(450);
  const [hospitalDiscount, setHospitalDiscount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI / GPay' | 'Card' | 'Insurance / TPA'>('UPI / GPay');

  const documentRef = useRef<HTMLDivElement>(null);

  // Initialize prescription medications & advice
  useEffect(() => {
    if (patient) {
      setRecipientPhone(patient.phone || '+91 98765 43210');
    }

    if (medications && medications.length > 0) {
      const parsed: EditableMedication[] = medications.map((med, idx) => {
        const medName = typeof med === 'string' ? med : 'Prescribed Medication';
        // Check if med matches master catalog
        const match = ALL_MASTER_DRUGS.find((d) => d.name.toLowerCase().includes(medName.toLowerCase()));
        return {
          id: `med-${Date.now()}-${idx}`,
          name: match ? match.name : medName,
          dosage: match ? match.dosage : 'Standard clinical dose',
          frequency: match ? match.frequency : '1-0-1',
          duration: match ? match.duration : '5 days',
          timing: match ? match.timing : 'After Food (PC)',
          instructions: match ? match.instructions : 'Take with water after meals',
          unitPrice: match ? match.unitPrice : 5.0,
        };
      });
      setEditableMeds(parsed);
    } else {
      // Default to acute URI medicines
      const defaultDisease = MASTER_DISEASES[0];
      setEditableMeds(
        defaultDisease.medications.map((m) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          timing: m.timing,
          instructions: m.instructions,
          unitPrice: m.unitPrice,
        }))
      );
    }

    setPhysicianAdvice(
      soapNote?.plan ||
        'Adequate oral hydration (3L water/day), warm fluid intake, rest for 48-72 hours. Avoid spicy and fried foods. Return immediately if symptoms worsen or high fever persists.'
    );
    setIsEditingRx(false);
    setShowPhonePrompt(false);
  }, [isOpen, patient, medications, soapNote]);

  // Helper to construct initial billing items from consultation & medications
  const generateDefaultBillingItems = (): BillingItem[] => {
    const items: BillingItem[] = [];

    // 1. Doctor Consultation Fee
    items.push({
      id: `bill-consult-${Date.now()}`,
      category: 'Doctor Consultation',
      description: 'Attending Physician Clinical Consultation & Evaluation (OP)',
      code: cptCodes && cptCodes[0] ? `CPT ${cptCodes[0].code}` : 'CPT 99214',
      quantity: 1,
      unitPrice: doctorConsultFee,
      total: doctorConsultFee,
    });

    // 2. Pharmacy / Tablets from Prescription
    if (editableMeds.length > 0) {
      editableMeds.forEach((med, idx) => {
        const pricePerUnit = med.unitPrice || 6;
        const totalQty = 10;
        items.push({
          id: `bill-rx-${idx}-${Date.now()}`,
          category: 'Pharmacy / Medications',
          description: `${med.name} (${med.dosage})`,
          code: `RX-${idx + 101}`,
          quantity: totalQty,
          unitPrice: pricePerUnit,
          total: pricePerUnit * totalQty,
        });
      });
    }

    // 3. Diagnostics / Procedures if present in CPT
    if (cptCodes && cptCodes.length > 1) {
      cptCodes.slice(1).forEach((cpt, idx) => {
        const fee = cpt.code.startsWith('93') ? 350 : cpt.code.startsWith('85') ? 300 : cpt.code.startsWith('94') ? 200 : 250;
        items.push({
          id: `bill-proc-${idx}-${Date.now()}`,
          category: cpt.code.startsWith('8') ? 'Diagnostic & Lab' : 'Nursing & Procedures',
          description: cpt.description || 'Clinical Diagnostic Procedure',
          code: `CPT ${cpt.code}`,
          quantity: 1,
          unitPrice: fee,
          total: fee,
        });
      });
    }

    return items;
  };

  // Initialize Billing Items when modal opens without wiping doctor edits
  useEffect(() => {
    if (isOpen) {
      setBillingItems(generateDefaultBillingItems());
      setIsEditingBill(false);
      setShowAddBillForm(false);
    }
  }, [isOpen]);

  if (!isOpen || !patient) return null;

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  // Direct PDF Download & Share (Compatible with Android Capacitor & Web)
  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsGeneratingPdf(true);

    try {
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

      const imgWidth = 210;
      const pageHeight = 297;
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

      const fileName =
        activeView === 'rx'
          ? `Prescription_${patient.name.replace(/\s+/g, '_')}_${patient.mrn}.pdf`
          : `Hospital_Invoice_${patient.name.replace(/\s+/g, '_')}_${patient.mrn}.pdf`;

      await downloadOrSharePdf(
        pdf,
        fileName,
        activeView === 'rx' ? `Prescription for ${patient.name}` : `Hospital Bill for ${patient.name}`
      );
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'PDF Generation Failed',
        text: 'Falling back to standard print dialog.',
      });
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Send WhatsApp
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
        total: grandTotal,
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
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '<i class="bi bi-whatsapp mr-1"></i> Open in WhatsApp Web',
        cancelButtonText: 'Done',
        confirmButtonColor: '#25D366',
      }).then((result) => {
        if (result.isConfirmed && res.whatsappLink) {
          window.open(res.whatsappLink, '_blank');
        }
      });

      setShowPhonePrompt(false);
    } catch (err: any) {
      console.error('WhatsApp dispatch error:', err);
      const fallbackMsg = encodeURIComponent(
        `🏥 *PRIYA HEALTHCARE* - e-Prescription for *${patient.name}* (MRN: ${patient.mrn})\n` +
          `Prescribed Medications: ${editableMeds.map((m) => m.name).join(', ')}\n` +
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
      }).then((r) => {
        if (r.isConfirmed) {
          window.open(directWaUrl, '_blank');
        }
      });
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  // Add medication manually or from catalog
  const handleAddMedication = (masterMed?: MasterMedication) => {
    const newMed: EditableMedication = {
      id: `med-${Date.now()}-${editableMeds.length}`,
      name: masterMed ? masterMed.name : '',
      dosage: masterMed ? masterMed.dosage : '1 tablet / capsule',
      frequency: masterMed ? masterMed.frequency : '1-0-1',
      duration: masterMed ? masterMed.duration : '5 days',
      timing: masterMed ? masterMed.timing : 'After Food (PC)',
      instructions: masterMed ? masterMed.instructions : 'Take with water after meals',
      unitPrice: masterMed ? masterMed.unitPrice : 5.0,
    };
    setEditableMeds([...editableMeds, newMed]);
    setIsEditingRx(true);
  };

  // Add all medications for a disease (from 1mg / Medindia library)
  const handleApplyDiseasePrescription = (disease: DiseaseCategory) => {
    const newMeds: EditableMedication[] = disease.medications.map((m) => ({
      id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      timing: m.timing,
      instructions: m.instructions,
      unitPrice: m.unitPrice,
    }));
    setEditableMeds(newMeds);
    setPhysicianAdvice(disease.defaultAdvice);
    setShowDiseaseCatalog(false);
    setSelectedDisease(null);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Applied standard prescription for ${disease.name}`,
      timer: 2500,
      showConfirmButton: false,
    });
  };

  const handleUpdateMedication = (id: string, field: keyof EditableMedication, value: any) => {
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

  // ==================== HOSPITAL BILLING CRUD HANDLERS ====================
  // Create: Add new custom line item or preset
  const handleAddCustomBillItem = (preset?: Partial<BillingItem>) => {
    const item: BillingItem = {
      id: `bill-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: preset?.category || newBillCategory,
      description: preset?.description || newBillDesc.trim() || 'Additional Clinical Service',
      code: preset?.code || newBillCode.trim() || 'HOSP-SRV',
      quantity: preset?.quantity || newBillQty || 1,
      unitPrice: preset?.unitPrice !== undefined ? preset.unitPrice : newBillRate || 100,
      total: (preset?.quantity || newBillQty || 1) * (preset?.unitPrice !== undefined ? preset.unitPrice : newBillRate || 100),
    };
    setBillingItems((prev) => [...prev, item]);
    setNewBillDesc('');
    setShowAddBillForm(false);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Bill Item Added',
      text: `${item.description} added to invoice.`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // Update: Modify line item fields and reactive amounts
  const handleUpdateBillingItem = (id: string, field: keyof BillingItem, val: any) => {
    setBillingItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Math.max(1, parseInt(val) || 1) : item.quantity;
          const u = field === 'unitPrice' ? Math.max(0, parseFloat(val) || 0) : item.unitPrice;
          updated.quantity = q;
          updated.unitPrice = u;
          updated.total = Math.round(q * u * 100) / 100;
        } else if (field === 'total') {
          const t = Math.max(0, parseFloat(val) || 0);
          updated.total = t;
          if (item.quantity > 0) {
            updated.unitPrice = Math.round((t / item.quantity) * 100) / 100;
          }
        }
        return updated;
      })
    );
  };

  // Delete: Remove line item from bill
  const handleDeleteBillingItem = (id: string) => {
    setBillingItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Reset: Re-sync from prescription
  const handleResetBillingItems = () => {
    Swal.fire({
      title: 'Reset Hospital Bill?',
      text: 'Recalculate all billing charges from current prescription & consultation?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0284c7',
    }).then((res) => {
      if (res.isConfirmed) {
        setBillingItems(generateDefaultBillingItems());
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Reset to default prescription rates',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter drugs search
  const filteredDrugCatalog = ALL_MASTER_DRUGS.filter(
    (d) =>
      d.name.toLowerCase().includes(drugSearchQuery.toLowerCase()) ||
      d.genericName.toLowerCase().includes(drugSearchQuery.toLowerCase())
  ).slice(0, 6);

  // Financial Calculations for Hospital Billing
  const rawSubtotal = billingItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = hospitalDiscount;
  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxPercent) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const pharmacyTotal = billingItems
    .filter((b) => b.category === 'Pharmacy / Medications')
    .reduce((acc, item) => acc + item.total, 0);

  const labTotal = billingItems
    .filter((b) => b.category === 'Diagnostic & Lab')
    .reduce((acc, item) => acc + item.total, 0);

  const procTotal = billingItems
    .filter((b) => b.category === 'Nursing & Procedures')
    .reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Navigation & Action Bar */}
        <div className="no-print p-3.5 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center flex-shrink-0">
              <i className="bi bi-hospital-fill text-lg sm:text-xl"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-extrabold text-white tracking-wide truncate">
                  Clinical Orders & Hospital Billing Suite
                </h3>
                {isEditingRx && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
                    Edit Active
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                Official Rx, Disease Drug Master, Hospital Invoice & Mobile PDF Export
              </p>
            </div>
          </div>

          {/* Action Tools Header */}
          <div className="flex items-center justify-between sm:justify-end space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-700 text-[11px] sm:text-xs font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('rx')}
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all ${
                  activeView === 'rx' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="bi bi-capsule"></i>
                <span>Prescription (Rx)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('bill')}
                className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all ${
                  activeView === 'bill' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <i className="bi bi-receipt"></i>
                <span>Hospital Bill</span>
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

        {/* WhatsApp Phone Bar Prompt */}
        {showPhonePrompt && (
          <div className="no-print bg-emerald-50 border-b border-emerald-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-900 font-semibold w-full sm:w-auto">
              <i className="bi bi-whatsapp text-emerald-600 text-lg"></i>
              <span>Patient WhatsApp Phone:</span>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="+91 9876543210"
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

        {/* Document Body */}
        <div className="p-3 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-4 sm:space-y-6">
          {/* Printable / PDF Capture Container */}
          <div ref={documentRef} className="space-y-4 sm:space-y-6">
            
            {/* ========================================================================= */}
            {/* TAB 1: OFFICIAL PRESCRIPTION (Rx) */}
            {/* ========================================================================= */}
            {activeView === 'rx' && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6 text-slate-800">
                {/* Doctor Letterhead Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 sm:pb-6 border-b-2 border-sky-600 gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{doctorName}</h2>
                    <p className="text-xs font-bold text-sky-700">MD, Internal & Family Medicine</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Registration Lic. #TN-MED-749201 • Senior Physician</p>
                    <p className="text-[11px] text-slate-500">St. Jude Metropolitan Multispecialty Hospital</p>
                  </div>
                  <div className="sm:text-right space-y-0.5 text-xs text-slate-600">
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 font-bold border border-sky-200 mb-1 text-[11px]">
                      <i className="bi bi-shield-check text-xs"></i>
                      <span>Certified e-Prescription</span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      Date: <span className="font-normal">{consultationDate}</span>
                    </p>
                    <p className="font-semibold text-slate-800">
                      Prescription #: <span className="font-mono font-bold text-sky-700">RX-{patient.mrn.replace('MRN-', '')}</span>
                    </p>
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
                    <span className="font-semibold text-slate-800">
                      {patient.age} yrs • {patient.gender}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient MRN</span>
                    <span className="font-mono font-bold text-sky-700">{patient.mrn}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Allergies</span>
                    <span className="font-bold text-rose-700 truncate block">{patient.allergies || 'NKDA (None)'}</span>
                  </div>
                </div>

                {/* Diagnosis Indication */}
                {icdCodes && icdCodes.length > 0 && (
                  <div className="text-xs space-y-1">
                    <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                      Clinical Diagnosis:
                    </span>
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                      {icdCodes.map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-blue-50 text-blue-900 text-[11px] sm:text-xs font-semibold border border-blue-200"
                        >
                          <span className="font-mono font-bold text-blue-700">{item.code}:</span>
                          <span>{item.description}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Prescription Toolbar (Disease Master 1mg/Medindia) */}
                <div className="no-print bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl sm:rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                        <i className="bi bi-capsule-pill text-sky-600"></i>
                        <span>Prescription Assistant (1mg & Medindia Catalog)</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Open Disease Selector Modal / Dropdown */}
                      <button
                        type="button"
                        onClick={() => setShowDiseaseCatalog(!showDiseaseCatalog)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <i className="bi bi-journal-medical"></i>
                        <span>{showDiseaseCatalog ? 'Close Diseases' : 'Choose by Disease (1mg/Medindia)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingRx(!isEditingRx)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                          isEditingRx
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 shadow-sm'
                        }`}
                      >
                        {isEditingRx ? '✓ Done Editing' : '✏️ Edit Custom'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddMedication()}
                        className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                      >
                        <i className="bi bi-plus-circle-fill"></i>
                        <span>Add Med</span>
                      </button>
                    </div>
                  </div>

                  {/* Disease Selection Drawer / Grid */}
                  {showDiseaseCatalog && (
                    <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-indigo-950">
                            Select Patient Medical Condition / Disease:
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            Pre-linked with Indian Clinical Formulations
                          </span>
                        </div>

                        {/* Direct Reference Links to 1mg and Medindia */}
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <a
                            href="https://www.1mg.com/all-diseases"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold flex items-center space-x-1"
                          >
                            <span>1mg.com All Diseases</span>
                            <i className="bi bi-box-arrow-up-right text-[9px]"></i>
                          </a>
                          <a
                            href="https://www.medindia.net/drugs/medical-condition/index.html"
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 font-bold flex items-center space-x-1"
                          >
                            <span>Medindia Conditions</span>
                            <i className="bi bi-box-arrow-up-right text-[9px]"></i>
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {MASTER_DISEASES.map((dis) => (
                          <div
                            key={dis.id}
                            onClick={() => setSelectedDisease(dis)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                              selectedDisease?.id === dis.id
                                ? 'bg-indigo-50 border-indigo-400 shadow-sm ring-1 ring-indigo-400'
                                : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                                {dis.icdCode}
                              </span>
                              <span className="text-[9px] font-medium text-slate-500">{dis.category}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{dis.name}</h5>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{dis.medications.length} Tablets/Drugs linked</p>
                          </div>
                        ))}
                      </div>

                      {/* Selected Disease Details & 1-Click Apply */}
                      {selectedDisease && (
                        <div className="mt-3 p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-extrabold text-indigo-950">{selectedDisease.name}</h5>
                              <p className="text-[11px] text-slate-600">{selectedDisease.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyDiseasePrescription(selectedDisease)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1"
                            >
                              <i className="bi bi-check-all"></i>
                              <span>Prescribe All ({selectedDisease.medications.length} Drugs)</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedDisease.medications.map((med, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 block">{med.name}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {med.frequency} • {med.timing} • {med.duration}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddMedication(med)}
                                  className="px-2 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[10px] border border-sky-200"
                                >
                                  + Add Single
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Drug Fast Search Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="relative">
                      <i className="bi bi-search absolute left-3 top-2 text-slate-400 text-xs"></i>
                      <input
                        type="text"
                        placeholder="Quick search any medicine/tablet (e.g. Dolo, Pantoprazole, Azithromycin, Telmisartan)..."
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>

                    {drugSearchQuery.trim() && (
                      <div className="bg-white rounded-lg border border-sky-200 p-2 space-y-1 shadow-md">
                        {filteredDrugCatalog.length === 0 ? (
                          <p className="text-[11px] text-slate-400 p-1 text-center">No exact match in pharmacy master.</p>
                        ) : (
                          filteredDrugCatalog.map((drug, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                handleAddMedication(drug);
                                setDrugSearchQuery('');
                              }}
                              className="p-1.5 rounded hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{drug.name}</span>
                                <span className="text-[10px] text-slate-500 ml-2 font-mono">[{drug.genericName}]</span>
                              </div>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                                + Add ({drug.frequency})
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Rx Symbol & Medications Table */}
                <div className="space-y-2 sm:space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sky-700 font-serif text-xl sm:text-2xl font-bold">
                      <span>℞</span>
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                        Prescribed Medications
                      </span>
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
                          <th className="py-2.5 px-3 sm:px-4 w-1/4">Dosage / Timing</th>
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

                              {/* Dosage & Timing */}
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
                                      placeholder="Frequency (e.g. 1-0-1)"
                                      className="w-full px-1.5 py-0.5 rounded border border-slate-300 text-xs text-slate-700"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-slate-900 font-bold block">{item.frequency}</span>
                                    <span className="text-[11px] text-sky-700 font-semibold">{item.timing || 'After Food'}</span>
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
                                    <span className="text-[11px] font-semibold text-emerald-700">
                                      Duration: {item.duration}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Delete Action */}
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
                              No prescription medications added. Click "Choose by Disease" or "Add Med" above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* General Care & Follow-up Instructions */}
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
                    <p>✓ Digitally verified via Dr. Priya Clinical Studio</p>
                    <p>Valid for pharmacy fulfillment • Emergency: Call 108 / 112</p>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <div className="font-serif italic text-base sm:text-lg text-sky-800 font-bold border-b border-slate-300 pb-1 sm:px-4">
                      {doctorName}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Authorized Physician Signature
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: HOSPITAL ITEMIZED BILLING PROCEDURE & INVOICE RECEIPT */}
            {/* ========================================================================= */}
            {activeView === 'bill' && (
              <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-6 text-slate-800">
                {/* Hospital Invoice Letterhead */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 sm:pb-6 border-b-2 border-emerald-600 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                        <i className="bi bi-hospital"></i>
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        Hospital Medical Bill & Tax Invoice
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">St. Jude Metropolitan Multispecialty Hospital & Clinic</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">GSTIN / Hospital Reg: 33AAACH1234F1Z5 • NABH Accredited</p>
                  </div>

                  <div className="sm:text-right space-y-0.5 text-xs text-slate-600">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300 mb-1 text-[11px]">
                      <i className="bi bi-check-circle-fill text-emerald-600 text-xs"></i>
                      <span>Payment Verified ({paymentMode})</span>
                    </span>
                    <p className="font-semibold text-slate-800">
                      Invoice #: <span className="font-mono font-bold text-emerald-700">INV-2026-{patient.mrn.replace('MRN-', '')}</span>
                    </p>
                    <p className="font-semibold text-slate-800">
                      Date & Time: <span className="font-normal">{consultationDate}</span>
                    </p>
                  </div>
                </div>

                {/* Patient & Doctor Demographics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Billed Patient Details</span>
                    <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                    <p className="text-slate-600">
                      MRN: <span className="font-mono font-bold">{patient.mrn}</span> • Age: {patient.age} ({patient.gender})
                    </p>
                    <p className="text-slate-500">Phone: {recipientPhone || patient.phone || 'On file'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Consulting Doctor & Facility</span>
                    <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
                    <p className="text-slate-600">Department: General Medicine & Clinical Care</p>
                    <p className="text-slate-500">Billing Category: Outpatient Consultation & Pharmacy</p>
                  </div>
                </div>

                {/* Category Breakdown Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-[10px] font-bold text-sky-800 uppercase block">Doctor Fees</span>
                    <span className="text-sm font-extrabold text-sky-950 font-mono">₹{doctorConsultFee}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] font-bold text-purple-800 uppercase block">Pharmacy / Tablets</span>
                    <span className="text-sm font-extrabold text-purple-950 font-mono">₹{pharmacyTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Diagnostics / Lab</span>
                    <span className="text-sm font-extrabold text-emerald-950 font-mono">₹{labTotal}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Nursing / Procedures</span>
                    <span className="text-sm font-extrabold text-amber-950 font-mono">₹{procTotal}</span>
                  </div>
                </div>

                {/* Billing Editor & CRUD Toolbar */}
                <div className="no-print bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide flex items-center space-x-1.5">
                      <i className="bi bi-pencil-square text-emerald-600"></i>
                      <span>Bill Items & Amount Controls (CRUD)</span>
                    </span>
                    {isEditingBill && (
                      <span className="text-[10px] uppercase font-mono px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black animate-pulse">
                        Live Edit Mode
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsEditingBill(!isEditingBill)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center space-x-1 ${
                        isEditingBill
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400 font-black'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <i className={`bi ${isEditingBill ? 'bi-check2-circle' : 'bi-pencil-fill'}`}></i>
                      <span>{isEditingBill ? '✓ Done Editing' : '✏️ Edit Bill Amounts'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddBillForm(!showAddBillForm)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-all flex items-center space-x-1 shadow-sm"
                    >
                      <i className="bi bi-plus-circle-fill text-emerald-600"></i>
                      <span>+ Add Item</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetBillingItems}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition-all flex items-center space-x-1 shadow-sm"
                      title="Reset items to prescription defaults"
                    >
                      <i className="bi bi-arrow-counterclockwise text-slate-500"></i>
                      <span className="hidden sm:inline">Reset Defaults</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Bill Item Drawer (Create) */}
                {showAddBillForm && (
                  <div className="no-print p-3.5 bg-white rounded-xl border border-emerald-300 shadow-sm space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <i className="bi bi-plus-circle text-emerald-600"></i>
                        <span>Add Custom Service or Diagnostic Charge</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">Automatic quantity and rate multiplication</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Description *</label>
                        <input
                          type="text"
                          placeholder="e.g. Fasting Blood Glucose (FBS)"
                          value={newBillDesc}
                          onChange={(e) => setNewBillDesc(e.target.value)}
                          className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Category</label>
                        <select
                          value={newBillCategory}
                          onChange={(e) => setNewBillCategory(e.target.value as any)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                        >
                          <option value="Doctor Consultation">Doctor Consultation</option>
                          <option value="Pharmacy / Medications">Pharmacy / Medications</option>
                          <option value="Diagnostic & Lab">Diagnostic & Lab</option>
                          <option value="Nursing & Procedures">Nursing & Procedures</option>
                          <option value="Room & Bed">Room & Bed</option>
                          <option value="Other Clinical Services">Other Clinical Services</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={newBillQty}
                          onChange={(e) => setNewBillQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Unit Rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={newBillRate}
                          onChange={(e) => setNewBillRate(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                      {/* Quick presets */}
                      <div className="flex items-center space-x-1.5 overflow-x-auto text-[10px] py-0.5">
                        <span className="font-bold text-slate-400">Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleAddCustomBillItem({ description: 'Fasting Blood Sugar Test (Glucometer)', category: 'Diagnostic & Lab', code: 'LAB-FBS', quantity: 1, unitPrice: 120 })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          + FBS (₹120)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomBillItem({ description: '12-Lead Electrocardiogram (ECG)', category: 'Diagnostic & Lab', code: 'CPT 93000', quantity: 1, unitPrice: 350 })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          + ECG (₹350)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomBillItem({ description: 'Nebulization Therapy (Duolin + Budecort)', category: 'Nursing & Procedures', code: 'PROC-NEB', quantity: 1, unitPrice: 200 })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          + Nebulizer (₹200)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomBillItem({ description: 'Aseptic Wound Dressing & Suture Care', category: 'Nursing & Procedures', code: 'NURS-DRS', quantity: 1, unitPrice: 250 })}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                        >
                          + Dressing (₹250)
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setShowAddBillForm(false)}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddCustomBillItem()}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                        >
                          + Add Line Item
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Itemized Services Breakdown Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hospital Itemized Charges & Clinical Procedure Breakdown
                    </span>
                    {isEditingBill && (
                      <span className="text-[11px] text-amber-700 font-semibold">
                        ✏️ Editable: Change description, quantity, rate, or amount directly
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-xs min-w-[550px] sm:min-w-full">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 w-8 text-center">#</th>
                          <th className="py-2.5 px-4 w-1/3">Service / Medication Description</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-center">Qty / Days</th>
                          <th className="py-2.5 px-3 text-right">Unit Rate</th>
                          <th className="py-2.5 px-4 text-right">Total (₹)</th>
                          {isEditingBill && <th className="no-print py-2.5 px-2 text-center w-10">Delete</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {billingItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            
                            {/* Description & Code */}
                            <td className="py-2 px-4">
                              {isEditingBill ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => handleUpdateBillingItem(item.id, 'description', e.target.value)}
                                    className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                                    placeholder="Service Description"
                                  />
                                  <input
                                    type="text"
                                    value={item.code || ''}
                                    onChange={(e) => handleUpdateBillingItem(item.id, 'code', e.target.value)}
                                    className="w-32 px-1.5 py-0.5 rounded border border-slate-300 text-[10px] font-mono text-slate-600 bg-white"
                                    placeholder="Code / CPT"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className="font-bold text-slate-900 block">{item.description}</span>
                                  {item.code && <span className="text-[10px] font-mono text-slate-500">{item.code}</span>}
                                </div>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-2 px-3">
                              {isEditingBill ? (
                                <select
                                  value={item.category}
                                  onChange={(e) => handleUpdateBillingItem(item.id, 'category', e.target.value)}
                                  className="px-2 py-1 rounded border border-slate-300 text-[11px] bg-white font-medium"
                                >
                                  <option value="Doctor Consultation">Doctor Consultation</option>
                                  <option value="Pharmacy / Medications">Pharmacy / Medications</option>
                                  <option value="Diagnostic & Lab">Diagnostic & Lab</option>
                                  <option value="Nursing & Procedures">Nursing & Procedures</option>
                                  <option value="Room & Bed">Room & Bed</option>
                                  <option value="Other Clinical Services">Other Clinical Services</option>
                                </select>
                              ) : (
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    item.category === 'Doctor Consultation'
                                      ? 'bg-sky-100 text-sky-800'
                                      : item.category === 'Pharmacy / Medications'
                                      ? 'bg-purple-100 text-purple-800'
                                      : item.category === 'Diagnostic & Lab'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {item.category}
                                </span>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="py-2 px-3 text-center">
                              {isEditingBill ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateBillingItem(item.id, 'quantity', e.target.value)}
                                  className="w-16 px-1.5 py-1 rounded border border-slate-300 text-xs text-center font-mono font-bold bg-white"
                                />
                              ) : (
                                <span className="font-medium text-slate-700">{item.quantity}</span>
                              )}
                            </td>

                            {/* Unit Rate */}
                            <td className="py-2 px-3 text-right">
                              {isEditingBill ? (
                                <div className="flex items-center justify-end space-x-1">
                                  <span className="text-slate-400 text-xs">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.unitPrice}
                                    onChange={(e) => handleUpdateBillingItem(item.id, 'unitPrice', e.target.value)}
                                    className="w-20 px-1.5 py-1 rounded border border-slate-300 text-xs text-right font-mono font-bold bg-white"
                                  />
                                </div>
                              ) : (
                                <span className="font-medium text-slate-600">₹{item.unitPrice.toFixed(2)}</span>
                              )}
                            </td>

                            {/* Total Line Amount (DIRECTLY EDITABLE AS WELL!) */}
                            <td className="py-2 px-4 text-right">
                              {isEditingBill ? (
                                <div className="flex items-center justify-end space-x-1">
                                  <span className="text-emerald-700 text-xs font-bold">₹</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.total}
                                    onChange={(e) => handleUpdateBillingItem(item.id, 'total', e.target.value)}
                                    className="w-24 px-1.5 py-1 rounded border border-emerald-400 text-xs text-right font-mono font-extrabold text-emerald-900 bg-emerald-50/50"
                                    title="Edit line item total amount directly"
                                  />
                                </div>
                              ) : (
                                <span className="font-bold text-slate-900">₹{item.total.toFixed(2)}</span>
                              )}
                            </td>

                            {/* Delete Action Button (in Edit Mode) */}
                            {isEditingBill && (
                              <td className="no-print py-2 px-2 text-center w-10">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBillingItem(item.id)}
                                  className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all mx-auto"
                                  title="Delete this billing item"
                                >
                                  <i className="bi bi-trash3 text-xs"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Calculation & Payment Mode Box */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-1">
                  <div className="text-xs space-y-1 text-slate-500">
                    <span className="font-bold text-slate-700 block">Payment Mode Selected:</span>
                    <div className="flex items-center space-x-2">
                      {(['UPI / GPay', 'Cash', 'Card', 'Insurance / TPA'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setPaymentMode(mode)}
                          className={`no-print px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            paymentMode === mode
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Hospital Subtotal:</span>
                      <span className="font-bold text-slate-800 font-mono text-sm">₹{rawSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-700">
                      <div className="flex items-center space-x-1">
                        <span>Discount:</span>
                        {isEditingBill ? (
                          <div className="flex items-center space-x-0.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={hospitalDiscount}
                              onChange={(e) => setHospitalDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                              className="w-12 px-1 py-0.5 rounded border border-emerald-300 text-xs font-mono text-right bg-white"
                            />
                            <span className="font-bold">%</span>
                          </div>
                        ) : (
                          <span>({hospitalDiscount}%)</span>
                        )}
                      </div>
                      <span className="font-bold font-mono">- ₹{discountAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <div className="flex items-center space-x-1">
                        <span>GST / Health Tax:</span>
                        {isEditingBill ? (
                          <select
                            value={taxPercent}
                            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                            className="px-1 py-0.5 rounded border border-slate-300 text-xs bg-white font-mono"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                          </select>
                        ) : (
                          <span>({taxPercent}%)</span>
                        )}
                      </div>
                      <span className="font-bold text-slate-800 font-mono">₹{taxAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-base font-black text-slate-900 pt-2 border-t-2 border-slate-200">
                      <span>Grand Total:</span>
                      <span className="text-emerald-700 font-mono text-lg">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Hospital Billing Procedure Footer */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <p>Computer generated invoice • Verified by Hospital Accounts Desk</p>
                  <p className="font-bold text-slate-600">Thank you for visiting Priya Healthcare</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="no-print p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          {/* Left Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              type="button"
              onClick={() => setShowPhonePrompt(!showPhonePrompt)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              title="Send to patient WhatsApp"
            >
              <i className="bi bi-whatsapp text-sm"></i>
              <span>WhatsApp Rx</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200 transition-all"
            >
              <i className="bi bi-download text-xs text-sky-700"></i>
              <span>Download PDF</span>
            </button>
          </div>

          {/* Right Actions */}
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
