import React, { useState } from 'react';
import { exportReferenceDatabaseToCsv } from '../utils/medicalCodeExport';
import { ICD_10_CHAPTERS, ALL_ICD_CODES, CPT_BILLING_DATABASE } from '../utils/medicalCodeDatabase';

export const MedicalCodingReferenceView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'chapters' | 'search' | 'cpt'>('chapters');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredIcd = ALL_ICD_CODES.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.chapterTitle.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCpt = CPT_BILLING_DATABASE.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleExportCatalog = () => {
    exportReferenceDatabaseToCsv(ALL_ICD_CODES, CPT_BILLING_DATABASE);
  };

  const activeChapterData = ICD_10_CHAPTERS.find((ch) => ch.codeRange === selectedChapter);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="medical-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-md shadow-sky-500/20">
              <i className="bi bi-journal-medical text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">Official Medical Coding Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  ICD-10-CM & CPT 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive 21-Chapter ICD-10 Diagnostic & Procedural Code Hub (Reference: <a href="https://www.icd10data.com/ICD10CM/Codes" target="_blank" rel="noreferrer" className="text-sky-600 underline font-medium">icd10data.com</a>)
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search codes, diseases, organs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.trim() && activeSubTab === 'chapters') {
                    setActiveSubTab('search');
                  }
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  setActiveSubTab('chapters');
                  setSelectedChapter(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'chapters' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="bi bi-diagram-3 mr-1"></i>
                21 Chapters
              </button>
              <button
                onClick={() => setActiveSubTab('search')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'search' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="bi bi-list-check mr-1"></i>
                All Diagnoses ({ALL_ICD_CODES.length})
              </button>
              <button
                onClick={() => setActiveSubTab('cpt')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'cpt' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <i className="bi bi-receipt mr-1"></i>
                CPT Billing ({CPT_BILLING_DATABASE.length})
              </button>
            </div>

            <button
              onClick={handleExportCatalog}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-sm transition-all"
              title="Export complete reference coding database as CSV spreadsheet"
            >
              <i className="bi bi-file-earmark-spreadsheet text-xs"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: 21 ICD-10 CHAPTERS BROWSER */}
        {activeSubTab === 'chapters' && !selectedChapter && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official ICD-10-CM Diagnostic Chapters (A00 - Z99)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Click any chapter to view specific billable clinical codes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ICD_10_CHAPTERS.map((ch, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedChapter(ch.codeRange)}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        {ch.codeRange}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{ch.chapterNumber}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2">
                      {ch.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ch.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-600">{ch.codes.length} Curated Codes</span>
                    <span className="text-sky-600 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                      Browse <i className="bi bi-chevron-right ml-1"></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAPTER DRILL-DOWN VIEW */}
        {activeSubTab === 'chapters' && selectedChapter && activeChapterData && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between bg-sky-50/70 p-4 rounded-xl border border-sky-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="text-xs font-bold text-sky-700 hover:underline flex items-center"
                  >
                    <i className="bi bi-arrow-left mr-1"></i> All Chapters
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-200 text-sky-900">
                    {activeChapterData.codeRange}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{activeChapterData.title}</h3>
                <p className="text-xs text-slate-600">{activeChapterData.description}</p>
              </div>

              <button
                onClick={() => setSelectedChapter(null)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeChapterData.codes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Billable
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">{item.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{item.description}</h4>
                  </div>

                  <button
                    onClick={() => handleCopy(item.code)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Copy code"
                  >
                    {copiedCode === item.code ? (
                      <i className="bi bi-check2 text-emerald-600 text-sm"></i>
                    ) : (
                      <i className="bi bi-clipboard text-xs"></i>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCH ALL DIAGNOSES */}
        {activeSubTab === 'search' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredIcd.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-slate-400">
                <i className="bi bi-search text-3xl mb-2 block"></i>
                <p className="text-xs font-medium">No matching ICD-10 codes found for "{search}"</p>
              </div>
            ) : (
              filteredIcd.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                        {item.code}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">[{item.chapterCodeRange}]</span>
                      <span className="text-[11px] font-medium text-slate-500">{item.category}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{item.description}</h4>
                  </div>

                  <button
                    onClick={() => handleCopy(item.code)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Copy code"
                  >
                    {copiedCode === item.code ? (
                      <i className="bi bi-check2 text-emerald-600 text-sm"></i>
                    ) : (
                      <i className="bi bi-clipboard text-xs"></i>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* VIEW 3: CPT PROCEDURAL & BILLING CODES */}
        {activeSubTab === 'cpt' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCpt.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-slate-400">
                <i className="bi bi-search text-3xl mb-2 block"></i>
                <p className="text-xs font-medium">No matching CPT codes found for "{search}"</p>
              </div>
            ) : (
              filteredCpt.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all flex items-start justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        CPT {item.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">{item.category}</span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ₹{item.basePrice}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{item.description}</h4>
                  </div>

                  <button
                    onClick={() => handleCopy(item.code)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                    title="Copy CPT code"
                  >
                    {copiedCode === item.code ? (
                      <i className="bi bi-check2 text-emerald-600 text-sm"></i>
                    ) : (
                      <i className="bi bi-clipboard text-xs"></i>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
