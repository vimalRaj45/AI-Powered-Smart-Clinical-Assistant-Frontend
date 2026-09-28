import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import type { Patient, IcdCodeItem, CptCodeItem } from '../types';
import {
  exportMedicalCodesToCsv,
  exportMedicalCodesToJson,
  copyMedicalCodesToClipboard,
} from '../utils/medicalCodeExport';

interface MedicalCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  icdCodes: IcdCodeItem[];
  cptCodes: CptCodeItem[];
  consultationDate?: string;
  doctorName?: string;
  consultationId?: number | string;
}

export const MedicalCodeExportModal: React.FC<MedicalCodeExportModalProps> = ({
  isOpen,
  onClose,
  patient,
  icdCodes,
  cptCodes,
  consultationDate = new Date().toISOString(),
  doctorName = 'Dr. Priya MD',
  consultationId = 'LIVE-SESSION',
}) => {
  const [activeFormat, setActiveFormat] = useState<'pdf' | 'csv' | 'json' | 'text'>('pdf');
  const [includeRationale, setIncludeRationale] = useState(true);
  const [includeConfidence, setIncludeConfidence] = useState(true);
  const [includePatientMeta, setIncludePatientMeta] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const printableSuperbillRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const exportOptions = {
    patient,
    icdCodes,
    cptCodes,
    consultationDate,
    doctorName,
    consultationId,
    includeRationale,
    includeConfidence,
    includePatientMeta,
  };

  const handleDownloadCsv = () => {
    exportMedicalCodesToCsv(exportOptions);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Medical Codes CSV downloaded successfully',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleDownloadJson = () => {
    exportMedicalCodesToJson(exportOptions);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'FHIR / EHR-Ready JSON exported',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleCopyClipboard = async () => {
    const success = await copyMedicalCodesToClipboard(exportOptions);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Superbill copied to clipboard!',
        showConfirmButton: false,
        timer: 1800,
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!printableSuperbillRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = printableSuperbillRef.current;
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

      const mrn = patient?.mrn || 'encounter';
      const fileName = `Superbill_Coding_Sheet_${mrn}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Superbill PDF downloaded!',
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'PDF Export Failed',
        text: 'An error occurred while generating the Superbill PDF.',
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-4 medical-panel rounded-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-gradient-to-r from-sky-50 via-indigo-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md">
              <i className="bi bi-file-earmark-medical-fill text-xl"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Medical Codes & Superbill Export Studio
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                  ICD-10 & CPT
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Standalone insurance coding sheet, billing data interchange & clinical claims export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
            title="Close"
          >
            <i className="bi bi-x-lg text-base"></i>
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl border border-slate-300/60 shadow-inner">
            <button
              onClick={() => setActiveFormat('pdf')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFormat === 'pdf'
                  ? 'bg-white text-indigo-700 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="bi bi-file-pdf-fill text-red-500"></i>
              <span>Superbill PDF</span>
            </button>

            <button
              onClick={() => setActiveFormat('csv')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFormat === 'csv'
                  ? 'bg-white text-emerald-700 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="bi bi-file-earmark-spreadsheet-fill text-emerald-600"></i>
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={() => setActiveFormat('json')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFormat === 'json'
                  ? 'bg-white text-blue-700 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="bi bi-filetype-json text-blue-600"></i>
              <span>FHIR / EHR JSON</span>
            </button>

            <button
              onClick={() => setActiveFormat('text')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFormat === 'text'
                  ? 'bg-white text-slate-800 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <i className="bi bi-clipboard-check text-slate-600"></i>
              <span>Quick Clipboard</span>
            </button>
          </div>

          {/* Quick Download / Action CTA */}
          <div className="flex items-center space-x-2">
            {activeFormat === 'pdf' && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-sm transition-all"
                >
                  <i className="bi bi-printer text-xs"></i>
                  <span>Print</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Rendering...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download text-xs"></i>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </>
            )}

            {activeFormat === 'csv' && (
              <button
                onClick={handleDownloadCsv}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all"
              >
                <i className="bi bi-file-earmark-arrow-down text-xs"></i>
                <span>Download .CSV</span>
              </button>
            )}

            {activeFormat === 'json' && (
              <button
                onClick={handleDownloadJson}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all"
              >
                <i className="bi bi-download text-xs"></i>
                <span>Download .JSON</span>
              </button>
            )}

            {activeFormat === 'text' && (
              <button
                onClick={handleCopyClipboard}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-300 transition-all"
              >
                <i className={`bi ${copySuccess ? 'bi-check2' : 'bi-clipboard-plus'} text-xs`}></i>
                <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Options Row */}
        <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 cursor-pointer select-none font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeRationale}
                onChange={(e) => setIncludeRationale(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span>Clinical Rationales</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer select-none font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeConfidence}
                onChange={(e) => setIncludeConfidence(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span>Confidence Match %</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer select-none font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includePatientMeta}
                onChange={(e) => setIncludePatientMeta(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span>Patient Demographics</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer select-none font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeSignature}
                onChange={(e) => setIncludeSignature(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
              />
              <span>Physician Stamp</span>
            </label>
          </div>

          <div className="text-[11px] font-bold text-slate-500">
            <span>{icdCodes.length} Diagnoses (ICD-10)</span>
            <span className="mx-1.5">•</span>
            <span>{cptCodes.length} Procedures (CPT)</span>
          </div>
        </div>

        {/* Modal Body / Live Preview Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-100/60">
          {/* Format: Superbill PDF Preview */}
          {activeFormat === 'pdf' && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div ref={printableSuperbillRef} className="p-8 space-y-6 text-slate-900 bg-white">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🩺</span>
                      <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                        Dr. Priya Healthcare & Clinical Studios
                      </h1>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      Autonomous Clinical Documentation & Medical Billing Department
                    </p>
                    <p className="text-[11px] text-slate-500">
                      100 Metro Health Plaza, Suite 400 • NPI: 1982349012 • Taxonomy: 207Q00000X
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider rounded-lg">
                      Official Superbill
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-700 mt-1">
                      Ref #{consultationId}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(consultationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Patient Information Box */}
                {includePatientMeta && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Patient Name
                      </span>
                      <span className="font-bold text-slate-900">{patient?.name || 'Walk-in Patient'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        MRN #
                      </span>
                      <span className="font-mono font-extrabold text-sky-700">{patient?.mrn || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Age / Gender
                      </span>
                      <span className="font-semibold text-slate-800">
                        {patient?.age ? `${patient.age} yrs` : 'N/A'} / {patient?.gender || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Attending Doctor
                      </span>
                      <span className="font-bold text-emerald-700">{doctorName}</span>
                    </div>
                  </div>
                )}

                {/* ICD-10 Diagnosis Codes Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
                      <span>Primary & Secondary Diagnoses (ICD-10-CM)</span>
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500">{icdCodes.length} Codes Documented</span>
                  </div>

                  {icdCodes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-lg">
                      No diagnosis codes assigned for this encounter.
                    </p>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2 px-3 w-10">#</th>
                          <th className="py-2 px-3 w-28">ICD-10 Code</th>
                          <th className="py-2 px-3">Clinical Description</th>
                          {includeConfidence && <th className="py-2 px-3 w-20 text-center">Match</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {icdCodes.map((icd, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-black text-sky-800">
                              {icd.code}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{icd.description}</div>
                              {includeRationale && icd.rationale && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-semibold text-slate-600">Rationale: </span>
                                  {icd.rationale}
                                </div>
                              )}
                            </td>
                            {includeConfidence && (
                              <td className="py-2.5 px-3 text-center">
                                <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {Math.round((icd.confidence || 0.95) * 100)}%
                                </span>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* CPT Procedures Table */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-300">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                      <span>Procedure & Evaluation/Management Codes (CPT)</span>
                    </h2>
                    <span className="text-[10px] font-bold text-slate-500">{cptCodes.length} Codes Documented</span>
                  </div>

                  {cptCodes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-3 text-center bg-slate-50 rounded-lg">
                      No CPT procedure codes assigned for this encounter.
                    </p>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="py-2 px-3 w-10">#</th>
                          <th className="py-2 px-3 w-28">CPT Code</th>
                          <th className="py-2 px-3">Procedure / Service Description</th>
                          <th className="py-2 px-3 w-24 text-right">Units</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {cptCodes.map((cpt, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-black text-emerald-800">
                              {cpt.code}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900">{cpt.description}</div>
                              {includeRationale && cpt.rationale && (
                                <div className="text-[11px] text-slate-500 mt-0.5">
                                  <span className="font-semibold text-slate-600">Justification: </span>
                                  {cpt.rationale}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                              1.0
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Signature / Certification Block */}
                {includeSignature && (
                  <div className="pt-6 border-t border-slate-300 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">
                        I hereby certify that the medical diagnoses and procedural codes listed above reflect
                        documented clinical findings and medical necessity for this patient encounter.
                      </p>
                      <p className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                        Timestamp: {new Date(consultationDate).toISOString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="w-48 border-b-2 border-slate-800 pb-1">
                        <span className="font-serif italic font-bold text-slate-800 text-sm">
                          {doctorName}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 mt-1">
                        Attending Physician Signature
                      </p>
                      <p className="text-[10px] text-slate-500">Board Certified Clinical Examiner</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format: CSV Preview */}
          {activeFormat === 'csv' && (
            <div className="bg-slate-900 rounded-2xl p-4 shadow-xl text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>CSV Stream Preview (RFC 4180 Format)</span>
                <span>{icdCodes.length + cptCodes.length} Rows</span>
              </div>
              <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-emerald-400 font-mono">
                {`"Encounter ID","Date","Patient MRN","Patient Name","Age","Gender","Attending Physician","Code Type","Code","Description","Category","AI Confidence","Rationale"\n`}
                {icdCodes.map((icd) => 
                  `"${consultationId}","${new Date(consultationDate).toLocaleDateString()}","${patient?.mrn || 'N/A'}","${patient?.name || 'N/A'}","${patient?.age || 'N/A'}","${patient?.gender || 'N/A'}","${doctorName}","ICD-10-CM","${icd.code}","${icd.description.replace(/"/g, '""')}","${icd.category || 'Diagnosis'}","${Math.round((icd.confidence || 1) * 100)}%","${(icd.rationale || '').replace(/"/g, '""')}"\n`
                )}
                {cptCodes.map((cpt) => 
                  `"${consultationId}","${new Date(consultationDate).toLocaleDateString()}","${patient?.mrn || 'N/A'}","${patient?.name || 'N/A'}","${patient?.age || 'N/A'}","${patient?.gender || 'N/A'}","${doctorName}","CPT","${cpt.code}","${cpt.description.replace(/"/g, '""')}","${cpt.category || 'Procedure'}","100%","${(cpt.rationale || '').replace(/"/g, '""')}"\n`
                )}
              </pre>
            </div>
          )}

          {/* Format: JSON Preview */}
          {activeFormat === 'json' && (
            <div className="bg-slate-900 rounded-2xl p-4 shadow-xl text-slate-100 font-mono text-xs overflow-x-auto space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>FHIR / EHR Interoperability JSON Bundle</span>
                <span>Schema v1.0.0</span>
              </div>
              <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed text-sky-300 font-mono">
                {JSON.stringify(
                  {
                    resourceType: 'ClinicalCodingBundle',
                    encounterId: consultationId,
                    encounterDate: consultationDate,
                    attendingPhysician: doctorName,
                    patient: {
                      mrn: patient?.mrn || 'N/A',
                      name: patient?.name || 'N/A',
                      age: patient?.age || null,
                      gender: patient?.gender || null,
                    },
                    diagnoses_icd10: icdCodes.map((c) => ({
                      code: c.code,
                      display: c.description,
                      category: c.category,
                      confidence: c.confidence,
                      rationale: c.rationale,
                    })),
                    procedures_cpt: cptCodes.map((c) => ({
                      code: c.code,
                      display: c.description,
                      category: c.category,
                      rationale: c.rationale,
                    })),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {/* Format: Quick Text Preview */}
          {activeFormat === 'text' && (
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl text-slate-100 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                <span>EHR Direct Paste Formatted Text</span>
                <span>1-Click Copy Ready</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-amber-300 whitespace-pre-wrap leading-relaxed">
{`=======================================================
DR. PRIYA CLINICAL STUDIO - MEDICAL CODING SUPERBILL
=======================================================
Date: ${new Date(consultationDate).toLocaleString()}
Patient: ${patient?.name || 'N/A'} (MRN: ${patient?.mrn || 'N/A'}, Age: ${patient?.age || 'N/A'}, Gender: ${patient?.gender || 'N/A'})
Attending Physician: ${doctorName}

--- ICD-10-CM DIAGNOSES ---
${icdCodes.length === 0 ? 'No diagnoses assigned.' : icdCodes.map((c, i) => `${i + 1}. [${c.code}] ${c.description}\n   Rationale: ${c.rationale || 'N/A'}`).join('\n')}

--- CPT PROCEDURES & BILLING ---
${cptCodes.length === 0 ? 'No CPT procedures assigned.' : cptCodes.map((c, i) => `${i + 1}. [CPT ${c.code}] ${c.description}\n   Justification: ${c.rationale || 'N/A'}`).join('\n')}

Certified by: ${doctorName}
=======================================================`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Export standalone coding datasets for insurance claims, hospital EHRs, or billing analytics.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
