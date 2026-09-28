import React, { useState } from 'react';
import { exportReferenceDatabaseToCsv } from '../utils/medicalCodeExport';

const COMMON_ICD_CODES = [
  { code: 'R50.9', description: 'Fever, unspecified', category: 'General Signs & Symptoms' },
  { code: 'R05.9', description: 'Cough, unspecified', category: 'Respiratory System' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified (URI)', category: 'Respiratory Infections' },
  { code: 'J02.9', description: 'Acute pharyngitis, unspecified (Sore throat)', category: 'Respiratory Infections' },
  { code: 'J20.9', description: 'Acute bronchitis, unspecified', category: 'Respiratory Infections' },
  { code: 'I10', description: 'Essential (primary) hypertension', category: 'Circulatory System' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine & Metabolic' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated', category: 'Respiratory System' },
  { code: 'M25.561', description: 'Pain in right knee', category: 'Musculoskeletal' },
  { code: 'M25.562', description: 'Pain in left knee', category: 'Musculoskeletal' },
  { code: 'R51.9', description: 'Headache, unspecified', category: 'Nervous System' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis (GERD)', category: 'Digestive System' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified (UTI)', category: 'Genitourinary System' },
  { code: 'L20.9', description: 'Atopic dermatitis, unspecified (Eczema)', category: 'Skin & Subcutaneous' },
];

const COMMON_CPT_CODES = [
  { code: '99213', description: 'Office visit, established patient, low complexity (20-29 mins)', category: 'Evaluation & Management (E&M)' },
  { code: '99214', description: 'Office visit, established patient, moderate complexity (30-39 mins)', category: 'Evaluation & Management (E&M)' },
  { code: '99215', description: 'Office visit, established patient, high complexity (40-54 mins)', category: 'Evaluation & Management (E&M)' },
  { code: '99203', description: 'Office visit, new patient, low complexity (30-44 mins)', category: 'Evaluation & Management (E&M)' },
  { code: '99204', description: 'Office visit, new patient, moderate complexity (45-59 mins)', category: 'Evaluation & Management (E&M)' },
  { code: '87880', description: 'Infectious agent antigen detection - Strep A rapid test', category: 'Pathology / Laboratory' },
  { code: '87811', description: 'Severe acute respiratory syndrome coronavirus 2 (COVID-19) rapid test', category: 'Pathology / Laboratory' },
  { code: '93000', description: 'Electrocardiogram (ECG/EKG), routine ECG with at least 12 leads', category: 'Cardiovascular Diagnostics' },
  { code: '94640', description: 'Pressurized or nonpressurized inhalation treatment (Nebulizer)', category: 'Pulmonary Procedures' },
];

export const MedicalCodingReferenceView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'icd' | 'cpt'>('icd');
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredIcd = COMMON_ICD_CODES.filter(
    (c) => c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCpt = COMMON_CPT_CODES.filter(
    (c) => c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleExportCatalog = () => {
    exportReferenceDatabaseToCsv(COMMON_ICD_CODES, COMMON_CPT_CODES);
  };

  return (
    <div className="space-y-6">
      <div className="medical-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <i className="bi bi-journal-medical text-2xl"></i>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Clinical Medical Codes Reference</h2>
              <p className="text-xs text-slate-500">
                Official ICD-10 Diagnostic & CPT Procedural Code Catalog for Physician Documentation
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search codes, diagnoses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input w-52 sm:w-64"
              />
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveSubTab('icd')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'icd' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ICD-10 Diagnoses
              </button>
              <button
                onClick={() => setActiveSubTab('cpt')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeSubTab === 'cpt' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CPT Billing Codes
              </button>
            </div>

            <button
              onClick={handleExportCatalog}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-sm transition-all"
              title="Export complete reference coding database as CSV spreadsheet"
            >
              <i className="bi bi-download text-xs"></i>
              <span>Export Catalog</span>
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeSubTab === 'icd' ? (
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
      </div>
    </div>
  );
};
