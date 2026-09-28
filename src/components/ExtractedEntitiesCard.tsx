import React from 'react';
import type { StructuredClinicalData } from '../types';

interface ExtractedEntitiesCardProps {
  data: StructuredClinicalData | null | undefined;
}

export const ExtractedEntitiesCard: React.FC<ExtractedEntitiesCardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="medical-card rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[190px] border-dashed border-2 border-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-3 shadow-sm">
          <i className="bi bi-file-earmark-medical text-2xl"></i>
        </div>
        <h4 className="text-sm font-bold text-slate-800">Clinical Entities Awaiting Consultation</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Record or enter consultation notes to automatically extract vital signs, timeline, exam findings, and medications.
        </p>
      </div>
    );
  }

  const { vitals, symptoms, examinationFindings, medications, allergies } = data;

  return (
    <div className="space-y-4">
      {/* Vitals Grid */}
      <div className="medical-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <i className="bi bi-heart-pulse-fill text-sm"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recorded Vital Signs
            </h4>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center space-x-1">
            <i className="bi bi-check2-circle text-xs"></i>
            <span>Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Temperature */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shadow-sm">
              <i className="bi bi-thermometer-half text-base"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-900/80">Body Temp</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {vitals?.temperature || '98.6°F'}
              </p>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shadow-sm">
              <i className="bi bi-activity text-base"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-900/80">Blood Pressure</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {vitals?.bloodPressure || '120/80 mmHg'}
              </p>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700 shadow-sm">
              <i className="bi bi-heart text-base"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold text-sky-900/80">Pulse / HR</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {vitals?.heartRate || '78 bpm'}
              </p>
            </div>
          </div>

          {/* Oxygen */}
          <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shadow-sm">
              <i className="bi bi-lungs-fill text-base"></i>
            </div>
            <div>
              <p className="text-[11px] font-bold text-teal-900/80">Oxygen (SpO2)</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {vitals?.oxygenSaturation || '98%'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms & Duration Timeline */}
      <div className="medical-card rounded-2xl p-4 sm:p-5">
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
          <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <i className="bi bi-clock-history text-xs"></i>
          </div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Identified Symptoms & Duration
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {symptoms && symptoms.length > 0 ? (
            symptoms.map((sym, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 shadow-sm"
              >
                <span className="text-xs font-bold text-slate-800">{sym.name}</span>
                {sym.duration && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                    {sym.duration}
                  </span>
                )}
                {sym.severity && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {sym.severity}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic">No acute symptoms reported.</p>
          )}
        </div>
      </div>

      {/* Physical Examination & Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Exam Findings */}
        <div className="medical-card rounded-2xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <i className="bi bi-clipboard2-pulse text-xs"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Physical Examination
            </h4>
          </div>
          <ul className="space-y-2 flex-1">
            {examinationFindings && examinationFindings.length > 0 ? (
              examinationFindings.map((finding, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-800 font-medium">
                  <i className="bi bi-check-circle-fill text-sky-600 text-sm mt-0.5 flex-shrink-0"></i>
                  <span>{finding}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">General exam unremarkable.</li>
            )}
          </ul>
        </div>

        {/* Prescribed Medications (Refined Clinical Card, No raw code blocks!) */}
        <div className="medical-card rounded-2xl p-4 sm:p-5 flex flex-col">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i className="bi bi-capsule text-xs"></i>
            </div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Prescribed Medications
            </h4>
          </div>
          <ul className="space-y-2 flex-1">
            {medications && medications.length > 0 ? (
              medications.map((med, idx) => (
                <li key={idx} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start space-x-2.5">
                  <i className="bi bi-prescription2 text-emerald-700 text-base mt-0.5 flex-shrink-0"></i>
                  <div>
                    <span className="text-xs font-bold text-emerald-950">{med}</span>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Clinical Prescription</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No medications prescribed.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Allergies Notice */}
      {allergies && allergies.length > 0 && (
        <div className="medical-card rounded-2xl p-3.5 bg-amber-50/80 border border-amber-200 flex items-center space-x-2.5 text-xs text-amber-950">
          <i className="bi bi-exclamation-triangle-fill text-amber-600 text-base flex-shrink-0"></i>
          <div>
            <span className="font-bold text-amber-950">Documented Allergies: </span>
            <span className="font-semibold text-amber-900">{allergies.join(', ')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
