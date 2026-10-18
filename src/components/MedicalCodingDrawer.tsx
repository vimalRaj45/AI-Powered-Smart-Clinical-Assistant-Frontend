import React, { useState } from 'react';
import type { IcdCodeItem, CptCodeItem, Patient } from '../types';
import { MedicalCodeExportModal } from './MedicalCodeExportModal';
import { ALL_ICD_CODES, CPT_BILLING_DATABASE } from '../utils/medicalCodeDatabase';

interface MedicalCodingDrawerProps {
  icdCodes: IcdCodeItem[];
  cptCodes: CptCodeItem[];
  onIcdChange: (codes: IcdCodeItem[]) => void;
  onCptChange: (codes: CptCodeItem[]) => void;
  patient?: Patient | null;
  consultationDate?: string;
  doctorName?: string;
}

export const MedicalCodingDrawer: React.FC<MedicalCodingDrawerProps> = ({
  icdCodes,
  cptCodes,
  onIcdChange,
  onCptChange,
  patient,
  consultationDate,
  doctorName,
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [newIcdCode, setNewIcdCode] = useState('');
  const [newIcdDesc, setNewIcdDesc] = useState('');
  const [icdSearchQuery, setIcdSearchQuery] = useState('');
  
  const [newCptCode, setNewCptCode] = useState('');
  const [newCptDesc, setNewCptDesc] = useState('');
  const [cptSearchQuery, setCptSearchQuery] = useState('');
  
  const [isAddingIcd, setIsAddingIcd] = useState(false);
  const [isAddingCpt, setIsAddingCpt] = useState(false);

  // Filter ICD-10 from master catalog
  const filteredIcdSuggestions = ALL_ICD_CODES.filter(
    (item) =>
      item.code.toLowerCase().includes(icdSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(icdSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(icdSearchQuery.toLowerCase())
  ).slice(0, 8);

  // Filter CPT from master catalog
  const filteredCptSuggestions = CPT_BILLING_DATABASE.filter(
    (item) =>
      item.code.toLowerCase().includes(cptSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(cptSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(cptSearchQuery.toLowerCase())
  ).slice(0, 8);

  const handleSelectIcdSuggestion = (item: typeof ALL_ICD_CODES[0]) => {
    // Avoid duplicate code
    if (icdCodes.some((c) => c.code === item.code)) {
      setIcdSearchQuery('');
      setIsAddingIcd(false);
      return;
    }
    const newEntry: IcdCodeItem = {
      code: item.code,
      description: item.description,
      category: item.category,
      confidence: 1.0,
      rationale: `Selected from ICD-10 Chapter: ${item.chapterTitle}`,
    };
    onIcdChange([...icdCodes, newEntry]);
    setIcdSearchQuery('');
    setNewIcdCode('');
    setNewIcdDesc('');
    setIsAddingIcd(false);
  };

  const handleManualAddIcd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIcdCode.trim()) return;
    const item: IcdCodeItem = {
      code: newIcdCode.trim().toUpperCase(),
      description: newIcdDesc.trim() || 'Clinical diagnosis',
      category: 'Physician Added',
      confidence: 1.0,
      rationale: 'Assigned by attending physician',
    };
    onIcdChange([...icdCodes, item]);
    setNewIcdCode('');
    setNewIcdDesc('');
    setIsAddingIcd(false);
  };

  const handleRemoveIcd = (index: number) => {
    onIcdChange(icdCodes.filter((_, i) => i !== index));
  };

  const handleSelectCptSuggestion = (item: typeof CPT_BILLING_DATABASE[0]) => {
    if (cptCodes.some((c) => c.code === item.code)) {
      setCptSearchQuery('');
      setIsAddingCpt(false);
      return;
    }
    const newEntry: CptCodeItem = {
      code: item.code,
      description: item.description,
      category: item.category,
      rationale: `Standard procedural billing (₹${item.basePrice})`,
    };
    onCptChange([...cptCodes, newEntry]);
    setCptSearchQuery('');
    setNewCptCode('');
    setNewCptDesc('');
    setIsAddingCpt(false);
  };

  const handleManualAddCpt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCptCode.trim()) return;
    const item: CptCodeItem = {
      code: newCptCode.trim(),
      description: newCptDesc.trim() || 'Clinical procedure / consultation',
      category: 'Physician Added',
      rationale: 'Assigned by physician',
    };
    onCptChange([...cptCodes, item]);
    setNewCptCode('');
    setNewCptDesc('');
    setIsAddingCpt(false);
  };

  const handleRemoveCpt = (index: number) => {
    onCptChange(cptCodes.filter((_, i) => i !== index));
  };

  return (
    <div className="medical-card rounded-2xl p-5 space-y-6">
      {/* Drawer Main Header with Standalone Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-sm">
            <i className="bi bi-file-earmark-medical text-base"></i>
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Medical Coding & Claims Suite</h3>
            <p className="text-[11px] text-slate-500">Autonomous ICD-10 Diagnostic & CPT Procedural Coding</p>
          </div>
        </div>

        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          title="Export Medical Codes (PDF Superbill, CSV, FHIR JSON, Clipboard)"
        >
          <i className="bi bi-box-arrow-up-right text-xs"></i>
          <span>Export Codes</span>
        </button>
      </div>

      {/* ICD-10 Diagnosis Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-sm">
              <i className="bi bi-tag-fill text-sm"></i>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">ICD-10-CM Diagnoses</h4>
              <p className="text-[10px] text-slate-500">Searchable Official 21-Chapter Clinical Codes</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingIcd(!isAddingIcd)}
            className="flex items-center space-x-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg transition-all"
          >
            <i className={`bi ${isAddingIcd ? 'bi-x-lg' : 'bi-plus-lg'} text-[11px]`}></i>
            <span>{isAddingIcd ? 'Cancel' : 'Add ICD-10'}</span>
          </button>
        </div>

        {/* Searchable Add ICD-10 Panel */}
        {isAddingIcd && (
          <div className="mt-3 p-3.5 bg-sky-50/60 rounded-xl border border-sky-200 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                <i className="bi bi-search mr-1 text-sky-600"></i>
                Instant Search Official ICD-10 Catalog (Reference: icd10data.com)
              </label>
              <input
                type="text"
                placeholder="Search disease, e.g. fever, diabetes, hypertension, asthma..."
                value={icdSearchQuery}
                onChange={(e) => setIcdSearchQuery(e.target.value)}
                className="w-full text-xs medical-input py-1.5 px-3 rounded-lg"
                autoFocus
              />
            </div>

            {/* Suggestions list */}
            {icdSearchQuery.trim() && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 bg-white p-2 rounded-lg border border-sky-200 shadow-sm">
                {filteredIcdSuggestions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 p-2 text-center">No exact match found in database.</p>
                ) : (
                  filteredIcdSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectIcdSuggestion(item)}
                      className="p-2 rounded-md hover:bg-sky-50 cursor-pointer border border-transparent hover:border-sky-200 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                            {item.code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">[{item.category}]</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{item.description}</p>
                      </div>
                      <span className="text-xs text-sky-700 font-bold ml-2">
                        + Add
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Manual custom code entry */}
            <details className="text-[11px] text-slate-600 pt-1">
              <summary className="cursor-pointer font-bold text-slate-700 hover:text-sky-700">
                Or enter custom ICD-10 code manually
              </summary>
              <form onSubmit={handleManualAddIcd} className="mt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="ICD Code (e.g. J06.9)"
                    value={newIcdCode}
                    onChange={(e) => setNewIcdCode(e.target.value)}
                    className="text-xs medical-input py-1 px-2.5 rounded-lg font-mono uppercase"
                  />
                  <input
                    type="text"
                    placeholder="Diagnosis description"
                    value={newIcdDesc}
                    onChange={(e) => setNewIcdDesc(e.target.value)}
                    className="text-xs medical-input py-1 px-2.5 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
                >
                  Add Custom Code
                </button>
              </form>
            </details>
          </div>
        )}

        {/* Assigned ICD-10 List */}
        <div className="mt-3 space-y-2">
          {icdCodes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">No ICD-10 diagnostic codes assigned yet.</p>
          ) : (
            icdCodes.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-start justify-between group transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                      {item.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{item.category}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{item.description}</h5>
                  {item.rationale && (
                    <p className="text-[10px] text-slate-500 italic">{item.rationale}</p>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveIcd(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Remove code"
                >
                  <i className="bi bi-trash3 text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CPT Procedural Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <i className="bi bi-receipt-cutoff text-sm"></i>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">CPT Procedural & Billing Codes</h4>
              <p className="text-[10px] text-slate-500">Evaluation, Lab, Diagnostics & Treatment Procedures</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingCpt(!isAddingCpt)}
            className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-all"
          >
            <i className={`bi ${isAddingCpt ? 'bi-x-lg' : 'bi-plus-lg'} text-[11px]`}></i>
            <span>{isAddingCpt ? 'Cancel' : 'Add CPT'}</span>
          </button>
        </div>

        {/* Searchable Add CPT Panel */}
        {isAddingCpt && (
          <div className="mt-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                <i className="bi bi-search mr-1 text-emerald-600"></i>
                Instant Search CPT & Hospital Procedures
              </label>
              <input
                type="text"
                placeholder="Search procedure, e.g. consultation, ECG, CBC, injection, nebulizer..."
                value={cptSearchQuery}
                onChange={(e) => setCptSearchQuery(e.target.value)}
                className="w-full text-xs medical-input py-1.5 px-3 rounded-lg"
                autoFocus
              />
            </div>

            {/* CPT Suggestions list */}
            {cptSearchQuery.trim() && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 bg-white p-2 rounded-lg border border-emerald-200 shadow-sm">
                {filteredCptSuggestions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 p-2 text-center">No exact CPT procedure found.</p>
                ) : (
                  filteredCptSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCptSuggestion(item)}
                      className="p-2 rounded-md hover:bg-emerald-50 cursor-pointer border border-transparent hover:border-emerald-200 flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                            CPT {item.code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">[{item.category}]</span>
                          <span className="text-[10px] font-bold text-emerald-700">₹{item.basePrice}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{item.description}</p>
                      </div>
                      <span className="text-xs text-emerald-700 font-bold ml-2">
                        + Add
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Manual custom CPT entry */}
            <details className="text-[11px] text-slate-600 pt-1">
              <summary className="cursor-pointer font-bold text-slate-700 hover:text-emerald-700">
                Or enter custom CPT procedure code manually
              </summary>
              <form onSubmit={handleManualAddCpt} className="mt-2 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="CPT Code (e.g. 99214)"
                    value={newCptCode}
                    onChange={(e) => setNewCptCode(e.target.value)}
                    className="text-xs medical-input py-1 px-2.5 rounded-lg font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Procedure description"
                    value={newCptDesc}
                    onChange={(e) => setNewCptDesc(e.target.value)}
                    className="text-xs medical-input py-1 px-2.5 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Add Custom CPT
                </button>
              </form>
            </details>
          </div>
        )}

        {/* Assigned CPT List */}
        <div className="mt-3 space-y-2">
          {cptCodes.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">No CPT procedural codes assigned yet.</p>
          ) : (
            cptCodes.map((item, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 flex items-start justify-between group transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                      CPT {item.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{item.category}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800">{item.description}</h5>
                  {item.rationale && (
                    <p className="text-[10px] text-slate-500 italic">{item.rationale}</p>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveCpt(index)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  title="Remove CPT code"
                >
                  <i className="bi bi-trash3 text-xs"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export Codes Modal */}
      <MedicalCodeExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        icdCodes={icdCodes}
        cptCodes={cptCodes}
        patient={patient}
        consultationDate={consultationDate}
        doctorName={doctorName}
      />
    </div>
  );
};
