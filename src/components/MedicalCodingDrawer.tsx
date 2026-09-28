import React, { useState } from 'react';
import type { IcdCodeItem, CptCodeItem, Patient } from '../types';
import { MedicalCodeExportModal } from './MedicalCodeExportModal';

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
  const [newCptCode, setNewCptCode] = useState('');
  const [newCptDesc, setNewCptDesc] = useState('');
  const [isAddingIcd, setIsAddingIcd] = useState(false);
  const [isAddingCpt, setIsAddingCpt] = useState(false);

  const handleAddIcd = (e: React.FormEvent) => {
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

  const handleAddCpt = (e: React.FormEvent) => {
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
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Diagnosis Codes (ICD-10-CM)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                  <i className="bi bi-magic text-[10px]"></i>
                  <span>AI Clinical Match</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Documented medical diagnoses with clinical justification</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingIcd(!isAddingIcd)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
          >
            <i className="bi bi-plus-lg text-xs"></i>
            <span>Add Code</span>
          </button>
        </div>

        {/* Add custom ICD form */}
        {isAddingIcd && (
          <form onSubmit={handleAddIcd} className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Code (e.g. J06.9)"
                value={newIcdCode}
                onChange={(e) => setNewIcdCode(e.target.value)}
                className="medical-input rounded-xl px-3 py-2 text-xs font-bold"
                required
              />
              <input
                type="text"
                placeholder="Diagnosis Description"
                value={newIcdDesc}
                onChange={(e) => setNewIcdDesc(e.target.value)}
                className="sm:col-span-2 medical-input rounded-xl px-3 py-2 text-xs"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingIcd(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Add Diagnosis
              </button>
            </div>
          </form>
        )}

        {/* List of ICD Codes */}
        <div className="mt-3.5 space-y-2.5">
          {icdCodes && icdCodes.length > 0 ? (
            icdCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                      {item.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.description}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                      <i className="bi bi-check2"></i>
                      <span>{Math.round((item.confidence || 0.95) * 100)}% match</span>
                    </span>
                    <button
                      onClick={() => handleRemoveIcd(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Code"
                    >
                      <i className="bi bi-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                {item.rationale && (
                  <p className="text-[11px] text-slate-500 pl-1">
                    <span className="font-bold text-slate-600">Rationale: </span>
                    {item.rationale}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
              No ICD-10 diagnosis codes assigned yet.
            </p>
          )}
        </div>
      </div>

      {/* CPT Procedure & Billing Section */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <i className="bi bi-cash-stack text-sm"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">Billing & Procedure Codes (CPT)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Billing Assisted
                </span>
              </div>
              <p className="text-xs text-slate-500">Evaluation, management & service codes for reimbursement</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddingCpt(!isAddingCpt)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
          >
            <i className="bi bi-plus-lg text-xs"></i>
            <span>Add CPT</span>
          </button>
        </div>

        {/* Add custom CPT form */}
        {isAddingCpt && (
          <form onSubmit={handleAddCpt} className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="CPT Code (e.g. 99213)"
                value={newCptCode}
                onChange={(e) => setNewCptCode(e.target.value)}
                className="medical-input rounded-xl px-3 py-2 text-xs font-bold"
                required
              />
              <input
                type="text"
                placeholder="Procedure / Evaluation Description"
                value={newCptDesc}
                onChange={(e) => setNewCptDesc(e.target.value)}
                className="sm:col-span-2 medical-input rounded-xl px-3 py-2 text-xs"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingCpt(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Add CPT
              </button>
            </div>
          </form>
        )}

        {/* List of CPT Codes */}
        <div className="mt-3.5 space-y-2.5">
          {cptCodes && cptCodes.length > 0 ? (
            cptCodes.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300">
                      CPT {item.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.description}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveCpt(idx)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Remove Code"
                  >
                    <i className="bi bi-trash text-xs"></i>
                  </button>
                </div>

                {item.rationale && (
                  <p className="text-[11px] text-slate-500 pl-1">
                    <span className="font-bold text-slate-600">Billing Justification: </span>
                    {item.rationale}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic p-3 text-center bg-slate-50 rounded-xl">
              No CPT billing codes assigned yet.
            </p>
          )}
        </div>
      </div>

      {/* Standalone Medical Code Export Modal */}
      <MedicalCodeExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        patient={patient}
        icdCodes={icdCodes}
        cptCodes={cptCodes}
        consultationDate={consultationDate}
        doctorName={doctorName}
      />
    </div>
  );
};
