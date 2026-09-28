import React, { useRef, useState } from 'react';
import type { Consultation } from '../types';
import { MedicalCodeExportModal } from './MedicalCodeExportModal';

interface ConsultationDetailModalProps {
  consultation: Consultation | null;
  onClose: () => void;
}

export const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  consultation,
  onClose,
}) => {
  const [showExportCodesModal, setShowExportCodesModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!consultation) return null;

  const handlePrint = () => {
    window.print();
  };

  const { patient, soapNote, structuredData, icdCodes, cptCodes } = consultation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 medical-panel rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${
              consultation.status === 'approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <i className="bi bi-shield-check text-xl"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Clinical Consultation Record #{consultation.id}
                </h3>
                <span className={`text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                  consultation.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {consultation.status === 'approved' ? 'Certified' : consultation.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {new Date(consultation.consultationDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExportCodesModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-sm transition-all"
              title="Export standalone ICD-10 & CPT medical codes (PDF Superbill, CSV, JSON, Clipboard)"
            >
              <i className="bi bi-file-earmark-medical text-xs"></i>
              <span>Export Codes</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
            >
              <i className="bi bi-printer text-xs"></i>
              <span>Print Record</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            >
              <i className="bi bi-x-lg text-sm"></i>
            </button>
          </div>
        </div>

        {/* Printable Clinical Sheet */}
        <div ref={printRef} className="p-6 space-y-6 overflow-y-auto">
          {/* Patient Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Patient Name</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">{patient?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Medical Record #</p>
              <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">{patient?.mrn || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Age / Gender</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {patient?.age} yrs / {patient?.gender}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Attending Physician</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">
                {consultation.doctorName || 'Dr. Priya MD'}
              </p>
            </div>
          </div>

          {/* Original Dictation */}
          <div className="p-4 rounded-xl bg-white border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Original Consultation Dictation
            </h4>
            <p className="text-xs text-slate-800 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
              {consultation.rawTranscript}
            </p>
          </div>

          {/* SOAP Clinical Note */}
          {soapNote && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                <i className="bi bi-file-earmark-medical-fill text-sky-600"></i>
                <span>SOAP Clinical Documentation</span>
              </h4>

              <div className="space-y-3 text-xs text-slate-800">
                <div className="p-3 rounded-lg bg-sky-50/50 border border-sky-100">
                  <span className="font-bold text-sky-800">[S] Subjective:</span>
                  <p className="mt-1 leading-relaxed">{soapNote.subjective}</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <span className="font-bold text-emerald-800">[O] Objective:</span>
                  <p className="mt-1 leading-relaxed">{soapNote.objective}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <span className="font-bold text-amber-800">[A] Assessment:</span>
                  <p className="mt-1 leading-relaxed">{soapNote.assessment}</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <span className="font-bold text-indigo-800">[P] Plan:</span>
                  <p className="mt-1 leading-relaxed whitespace-pre-wrap">{soapNote.plan}</p>
                </div>
              </div>
            </div>
          )}

          {/* Medical Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ICD-10 */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5 pb-2 border-b border-slate-100">
                <i className="bi bi-tag-fill text-sky-600"></i>
                <span>Diagnosis Codes (ICD-10)</span>
              </h4>
              <div className="space-y-2">
                {icdCodes && icdCodes.length > 0 ? (
                  icdCodes.map((code, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-sky-800">{code.code}</span>
                        {code.confidence && (
                          <span className="text-[11px] text-emerald-700 font-semibold">
                            {Math.round(code.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">{code.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No ICD codes assigned.</p>
                )}
              </div>
            </div>

            {/* CPT Codes */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5 pb-2 border-b border-slate-100">
                <i className="bi bi-cash-stack text-emerald-600"></i>
                <span>Billing & Service Codes (CPT)</span>
              </h4>
              <div className="space-y-2">
                {cptCodes && cptCodes.length > 0 ? (
                  cptCodes.map((code, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-mono text-xs font-bold text-emerald-800">CPT {code.code}</span>
                      <p className="text-xs text-slate-700 mt-0.5">{code.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No CPT codes assigned.</p>
                )}
              </div>
            </div>
          </div>

          {/* Doctor Signature Stamp */}
          {consultation.status === 'approved' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <i className="bi bi-check-circle-fill text-xl"></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Certified Clinical Record
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Electronically verified by {consultation.doctorName || 'Attending Physician'} on{' '}
                    {consultation.approvedAt ? new Date(consultation.approvedAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-white border border-emerald-200 text-emerald-800">
                  Physician Certified
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Standalone Medical Code Export Modal */}
      <MedicalCodeExportModal
        isOpen={showExportCodesModal}
        onClose={() => setShowExportCodesModal(false)}
        patient={patient}
        icdCodes={icdCodes || []}
        cptCodes={cptCodes || []}
        consultationDate={consultation.consultationDate}
        doctorName={consultation.doctorName || 'Dr. Priya MD'}
        consultationId={consultation.id}
      />
    </div>
  );
};
