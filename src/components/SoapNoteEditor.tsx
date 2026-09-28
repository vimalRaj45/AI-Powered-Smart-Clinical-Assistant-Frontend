import React, { useState } from 'react';
import type { SoapNoteData } from '../types';

interface SoapNoteEditorProps {
  soapNote: SoapNoteData | null | undefined;
  onChange: (updatedNote: SoapNoteData) => void;
  isGenerating?: boolean;
}

export const SoapNoteEditor: React.FC<SoapNoteEditorProps> = ({
  soapNote,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'subjective' | 'objective' | 'assessment' | 'plan'>('all');
  const [copied, setCopied] = useState(false);

  if (!soapNote) {
    return (
      <div className="medical-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[260px] border-dashed border-2 border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-3 shadow-sm">
          <i className="bi bi-journal-text text-2xl"></i>
        </div>
        <h4 className="text-sm font-bold text-slate-800">SOAP Clinical Note Pending</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          The system will structure consultation notes into Subjective, Objective, Assessment, and Plan (SOAP) format.
        </p>
      </div>
    );
  }

  const handleFieldChange = (field: keyof SoapNoteData, value: string) => {
    onChange({
      ...soapNote,
      [field]: value,
    });
  };

  const copyFullSoap = () => {
    const text = `CLINICAL SOAP NOTE\n==================\n[S] SUBJECTIVE:\n${soapNote.subjective}\n\n[O] OBJECTIVE:\n${soapNote.objective}\n\n[A] ASSESSMENT:\n${soapNote.assessment}\n\n[P] PLAN:\n${soapNote.plan}\n`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="medical-card rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
            <i className="bi bi-file-earmark-medical-fill text-base"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">SOAP Clinical Documentation</h3>
            <p className="text-xs text-slate-500">Doctor-reviewed and editable clinical note</p>
          </div>
        </div>

        <button
          onClick={copyFullSoap}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95"
        >
          {copied ? (
            <>
              <i className="bi bi-check2-circle text-emerald-600 text-sm"></i>
              <span className="text-emerald-700 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <i className="bi bi-clipboard text-slate-600 text-xs"></i>
              <span>Copy Note</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
        {[
          { key: 'all', label: 'All Sections' },
          { key: 'subjective', label: 'S - Subjective' },
          { key: 'objective', label: 'O - Objective' },
          { key: 'assessment', label: 'A - Assessment' },
          { key: 'plan', label: 'P - Plan' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-sky-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sections Container */}
      <div className="space-y-4">
        {/* Subjective */}
        {(activeTab === 'all' || activeTab === 'subjective') && (
          <div className="rounded-2xl p-3.5 bg-sky-50/40 border border-sky-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-sky-950 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-md bg-sky-600 text-white text-[11px] font-black flex items-center justify-center">
                  S
                </span>
                <span>Subjective (Patient History & Chief Complaint)</span>
              </label>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                Editable
              </span>
            </div>
            <textarea
              value={soapNote.subjective}
              onChange={(e) => handleFieldChange('subjective', e.target.value)}
              rows={3}
              className="w-full medical-input rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-normal bg-white resize-y"
            ></textarea>
          </div>
        )}

        {/* Objective */}
        {(activeTab === 'all' || activeTab === 'objective') && (
          <div className="rounded-2xl p-3.5 bg-emerald-50/40 border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                  O
                </span>
                <span>Objective (Vital Signs & Physical Examination)</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Editable
              </span>
            </div>
            <textarea
              value={soapNote.objective}
              onChange={(e) => handleFieldChange('objective', e.target.value)}
              rows={3}
              className="w-full medical-input rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-normal bg-white resize-y"
            ></textarea>
          </div>
        )}

        {/* Assessment */}
        {(activeTab === 'all' || activeTab === 'assessment') && (
          <div className="rounded-2xl p-3.5 bg-amber-50/40 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-950 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-md bg-amber-600 text-white text-[11px] font-black flex items-center justify-center">
                  A
                </span>
                <span>Assessment (Clinical Impression & Diagnoses)</span>
              </label>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Editable
              </span>
            </div>
            <textarea
              value={soapNote.assessment}
              onChange={(e) => handleFieldChange('assessment', e.target.value)}
              rows={3}
              className="w-full medical-input rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-normal bg-white resize-y"
            ></textarea>
          </div>
        )}

        {/* Plan */}
        {(activeTab === 'all' || activeTab === 'plan') && (
          <div className="rounded-2xl p-3.5 bg-indigo-50/40 border border-indigo-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">
                  P
                </span>
                <span>Plan (Treatment, Medications, Lab Tests & Advice)</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Editable
              </span>
            </div>
            <textarea
              value={soapNote.plan}
              onChange={(e) => handleFieldChange('plan', e.target.value)}
              rows={3}
              className="w-full medical-input rounded-xl p-3 text-xs text-slate-800 leading-relaxed font-normal bg-white resize-y"
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};
