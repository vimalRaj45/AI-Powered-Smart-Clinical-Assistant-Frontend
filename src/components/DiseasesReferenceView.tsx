import React, { useState } from 'react';
import {
  ONE_MG_ALL_DISEASES,
  MEDINDIA_MEDICAL_CONDITIONS,
  OneMgDisease,
  MedindiaCondition,
} from '../utils/referenceDiseasesDatabase';
import Swal from 'sweetalert2';

export const DiseasesReferenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'1mg' | 'medindia'>('1mg');

  // 1mg Filter States
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [selected1mgCategory, setSelected1mgCategory] = useState<string>('ALL');
  const [search1mg, setSearch1mg] = useState<string>('');
  const [selectedDiseaseDetail, setSelectedDiseaseDetail] = useState<OneMgDisease | null>(null);

  // Medindia Filter States
  const [selectedMedindiaSpeciality, setSelectedMedindiaSpeciality] = useState<string>('ALL');
  const [searchMedindia, setSearchMedindia] = useState<string>('');
  const [selectedConditionDetail, setSelectedConditionDetail] = useState<MedindiaCondition | null>(null);

  const alphabet = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Z'];

  const oneMgCategories = [
    'ALL',
    'Cardiovascular',
    'Respiratory',
    'Gastrointestinal',
    'Endocrine & Diabetes',
    'Neurology & Brain',
    'Dermatology & Skin',
    'Orthopedics & Joint',
    'Infectious Diseases',
    'Nephrology & Urology',
  ];

  const medindiaSpecialities = [
    'ALL',
    'Cardiology',
    'Endocrinology',
    'Gastroenterology',
    'Pulmonology',
    'Neurology',
    'Rheumatology',
  ];

  // 1mg filtered items
  const filtered1mg = ONE_MG_ALL_DISEASES.filter((d) => {
    const matchesLetter = selectedLetter === 'ALL' || d.alphabet.toUpperCase() === selectedLetter;
    const matchesCategory = selected1mgCategory === 'ALL' || d.category === selected1mgCategory;
    const q = search1mg.toLowerCase();
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.icd10Code.toLowerCase().includes(q) ||
      d.overview.toLowerCase().includes(q) ||
      d.symptoms.some((s) => s.toLowerCase().includes(q)) ||
      d.firstLineMedications.some((m) => m.name.toLowerCase().includes(q));
    return matchesLetter && matchesCategory && matchesSearch;
  });

  // Medindia filtered items
  const filteredMedindia = MEDINDIA_MEDICAL_CONDITIONS.filter((c) => {
    const matchesSpeciality = selectedMedindiaSpeciality === 'ALL' || c.speciality === selectedMedindiaSpeciality;
    const q = searchMedindia.toLowerCase();
    const matchesSearch =
      !q ||
      c.conditionName.toLowerCase().includes(q) ||
      c.overview.toLowerCase().includes(q) ||
      c.prescribedDrugs.some(
        (d) =>
          d.genericName.toLowerCase().includes(q) ||
          d.brandNames.some((b) => b.toLowerCase().includes(q)) ||
          d.drugClass.toLowerCase().includes(q)
      );
    return matchesSpeciality && matchesSearch;
  });

  const handleCopySummary = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${title} Copied!`,
      text: 'Summary copied to clipboard.',
      timer: 2000,
      showConfirmButton: false,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* TOP CLINICAL HERO BANNER WITH EXTERNAL REFERENCE BADGES */}
      <div
        className="rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-sky-800/40 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #091e3a 0%, #034b75 50%, #0c2d48 100%)',
        }}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/15">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center text-2xl shadow-inner shrink-0 mt-0.5">
                <i className="bi bi-capsule-pill"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                    Diseases & Clinical Conditions Reference Hub
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40">
                    Live Medical Directory
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl leading-relaxed">
                  Comprehensive disease pathophysiology, ICD-10 diagnostics, and pharmacological condition guides integrated with official references.
                </p>
              </div>
            </div>

            {/* External Reference Official Links */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.1mg.com/all-diseases"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-black transition-all shadow-md group"
                title="Open Tata 1mg All Diseases directory in new tab"
              >
                <i className="bi bi-link-45deg text-sm"></i>
                <span>1mg.com All Diseases</span>
                <i className="bi bi-box-arrow-up-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
              </a>

              <a
                href="https://www.medindia.net/drugs/medical-condition/index.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 hover:bg-sky-300 text-xs font-black transition-all shadow-md group"
                title="Open Medindia Medical Condition & Drugs Guide in new tab"
              >
                <i className="bi bi-capsule text-sm"></i>
                <span>Medindia Conditions</span>
                <i className="bi bi-box-arrow-up-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
              </a>
            </div>
          </div>

          {/* PRIMARY SUB-TAB SELECTOR (1mg vs Medindia) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('1mg')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm ${
                activeTab === '1mg'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-lg ring-2 ring-amber-300'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 text-amber-200 border border-amber-400/30 font-bold'
              }`}
            >
              <i className="bi bi-journal-medical text-sm"></i>
              <span>Tata 1mg All Diseases Reference</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === '1mg' ? 'bg-black/20 text-slate-950' : 'bg-amber-400/20 text-amber-200'
              }`}>
                {ONE_MG_ALL_DISEASES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('medindia')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm ${
                activeTab === 'medindia'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-lg ring-2 ring-sky-300'
                  : 'bg-slate-900/70 hover:bg-slate-900/90 text-sky-200 border border-sky-400/30 font-bold'
              }`}
            >
              <i className="bi bi-prescription2 text-sm"></i>
              <span>Medindia Conditions & Drug Therapies</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'medindia' ? 'bg-black/20 text-slate-950' : 'bg-sky-400/20 text-sky-200'
              }`}>
                {MEDINDIA_MEDICAL_CONDITIONS.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: TATA 1MG ALL DISEASES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === '1mg' && (
        <div className="space-y-4 animate-fadeIn">
          {/* SEARCH & FILTERS CONTAINER */}
          <div className="medical-card rounded-2xl p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-lg">
                <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search diseases, symptoms, ICD-10, medications..."
                  value={search1mg}
                  onChange={(e) => setSearch1mg(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input bg-white"
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Specialty:</span>
                <select
                  value={selected1mgCategory}
                  onChange={(e) => setSelected1mgCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs medical-input bg-white font-medium"
                >
                  {oneMgCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'ALL' ? 'All Specialties' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* A-Z Alphabet Filter Strip */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1.5 shrink-0">
                Index:
              </span>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                    selectedLetter === letter
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* DISEASES GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered1mg.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center">
                <i className="bi bi-file-earmark-x text-3xl text-slate-300 mb-2"></i>
                <p className="text-sm font-bold text-slate-800">No diseases found matching filters</p>
                <p className="text-xs text-slate-500 mt-1">Try resetting the letter filter or search query.</p>
              </div>
            ) : (
              filtered1mg.map((disease) => (
                <div
                  key={disease.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Top: Category & ICD-10 */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                        {disease.category}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        {disease.icd10Code}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {disease.name}
                    </h3>

                    {/* Overview */}
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {disease.overview}
                    </p>

                    {/* Symptoms Snippet */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Key Symptoms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {disease.symptoms.slice(0, 3).map((symp, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {symp}
                          </span>
                        ))}
                        {disease.symptoms.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold self-center">
                            +{disease.symptoms.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* First-Line Medicines Preview */}
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block mb-0.5">
                        First-Line Therapy:
                      </span>
                      <p className="text-[11px] font-semibold text-slate-800 truncate">
                        {disease.firstLineMedications[0]?.name || 'Standard clinical regimen'}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDiseaseDetail(disease)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <i className="bi bi-eye text-xs"></i>
                      <span>Full Protocol</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() =>
                          handleCopySummary(
                            `${disease.name} (${disease.icd10Code})\n${disease.overview}\n\nKey Medications:\n` +
                              disease.firstLineMedications.map((m) => `- ${m.name} (${m.dosage} - ${m.frequency})`).join('\n') +
                              `\n\nLifestyle Advice:\n${disease.lifestyleAdvice}`,
                            disease.name
                          )
                        }
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                        title="Copy protocol to clipboard"
                      >
                        <i className="bi bi-clipboard text-xs"></i>
                      </button>

                      <a
                        href={disease.oneMgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 flex items-center justify-center transition-all"
                        title="Open on 1mg.com"
                      >
                        <i className="bi bi-box-arrow-up-right text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: MEDINDIA CONDITIONS & DRUG THERAPIES */}
      {/* ========================================================================= */}
      {activeTab === 'medindia' && (
        <div className="space-y-4 animate-fadeIn">
          {/* SEARCH & SPECIALITY FILTER */}
          <div className="medical-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
              <input
                type="text"
                placeholder="Search medical conditions, generic drugs, trade brand, pharmacology..."
                value={searchMedindia}
                onChange={(e) => setSearchMedindia(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input bg-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Specialty:</span>
              <select
                value={selectedMedindiaSpeciality}
                onChange={(e) => setSelectedMedindiaSpeciality(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs medical-input bg-white font-medium"
              >
                {medindiaSpecialities.map((s) => (
                  <option key={s} value={s}>
                    {s === 'ALL' ? 'All Specialities' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CONDITIONS LISTING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMedindia.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center">
                <i className="bi bi-capsule text-3xl text-slate-300 mb-2"></i>
                <p className="text-sm font-bold text-slate-800">No Medindia conditions found</p>
                <p className="text-xs text-slate-500 mt-1">Try a different search query or specialty filter.</p>
              </div>
            ) : (
              filteredMedindia.map((cond) => (
                <div
                  key={cond.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 uppercase tracking-wider">
                        {cond.speciality}
                      </span>
                      <a
                        href={cond.medindiaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1"
                      >
                        <span>Medindia Reference</span>
                        <i className="bi bi-box-arrow-up-right text-[10px]"></i>
                      </a>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {cond.conditionName}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cond.overview}
                    </p>

                    {/* Drug Therapies Table */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1">
                        <i className="bi bi-capsule text-sky-600"></i>
                        <span>Prescribed Drugs & Mechanism (Medindia Protocol):</span>
                      </span>

                      <div className="space-y-1.5">
                        {cond.prescribedDrugs.map((drug, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{drug.genericName}</span>
                              <span className="text-[10px] font-mono font-semibold px-2 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                {drug.drugClass}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Brand Names: {drug.brandNames.join(', ')} • Dose: {drug.standardDose}
                            </p>
                            <p className="text-[11px] text-slate-600 italic">
                              {drug.mechanism}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedConditionDetail(cond)}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <i className="bi bi-info-circle-fill"></i>
                      <span>Clinical Guidance</span>
                    </button>

                    <button
                      onClick={() =>
                        handleCopySummary(
                          `Condition: ${cond.conditionName}\nOverview: ${cond.overview}\n\nPrescribed Drugs:\n` +
                            cond.prescribedDrugs.map((d) => `- ${d.genericName} (${d.drugClass}): ${d.standardDose}`).join('\n') +
                            `\n\nGuidelines: ${cond.clinicalGuidelines}`,
                          cond.conditionName
                        )
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <i className="bi bi-clipboard"></i>
                      <span>Copy Regimen</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 1MG DISEASE FULL DETAIL MODAL */}
      {selectedDiseaseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/20 text-white">
                  Tata 1mg Clinical Disease Monograph
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {selectedDiseaseDetail.name} ({selectedDiseaseDetail.icd10Code})
                </h3>
              </div>
              <button
                onClick={() => setSelectedDiseaseDetail(null)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">Pathophysiology & Clinical Definition:</strong>
                <p className="text-slate-700 leading-relaxed">{selectedDiseaseDetail.overview}</p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1.5">Common Clinical Symptoms:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                  {selectedDiseaseDetail.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1.5">Diagnostic Workup & Lab Investigations:</strong>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDiseaseDetail.diagnosticTests.map((t, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1.5">First-Line Pharmacological Management:</strong>
                <div className="space-y-1.5">
                  {selectedDiseaseDetail.firstLineMedications.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span>{m.name}</span>
                        <span className="font-mono text-[11px]">{m.dosage} • {m.frequency}</span>
                      </div>
                      <p className="text-[11px] text-amber-900 mt-0.5">{m.instructions} ({m.duration})</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <strong className="font-bold block mb-1">Physician Lifestyle & Dietary Advice:</strong>
                <p>{selectedDiseaseDetail.lifestyleAdvice}</p>
              </div>
            </div>

            <div className="p-3 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <a
                href={selectedDiseaseDetail.oneMgUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <span>View Full Page on 1mg.com</span>
                <i className="bi bi-box-arrow-up-right text-xs"></i>
              </a>

              <button
                onClick={() => setSelectedDiseaseDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEDINDIA CONDITION FULL DETAIL MODAL */}
      {selectedConditionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-sky-700 to-blue-800 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Medindia Clinical Guidance
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  {selectedConditionDetail.conditionName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConditionDetail(null)}
                className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 font-bold block mb-1">Clinical Guidelines & Goals:</strong>
                <p className="text-slate-700 leading-relaxed">{selectedConditionDetail.clinicalGuidelines}</p>
              </div>

              <div>
                <strong className="text-slate-900 font-bold block mb-1.5">Prescribed Drug Classes & Regimens:</strong>
                <div className="space-y-2">
                  {selectedConditionDetail.prescribedDrugs.map((d, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-sky-950">
                        <span>{d.genericName}</span>
                        <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.2 rounded border border-purple-200">
                          {d.drugClass}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700">Brands: {d.brandNames.join(', ')} • Dose: {d.standardDose}</p>
                      <p className="text-[11px] text-sky-900 italic">Mechanism: {d.mechanism}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950">
                <strong className="font-bold block mb-1 flex items-center space-x-1 text-rose-700">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>Important Contraindications & Precautions:</span>
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-rose-900">
                  {selectedConditionDetail.contraindications.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <a
                href={selectedConditionDetail.medindiaUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <span>View on Medindia.net</span>
                <i className="bi bi-box-arrow-up-right text-xs"></i>
              </a>

              <button
                onClick={() => setSelectedConditionDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
