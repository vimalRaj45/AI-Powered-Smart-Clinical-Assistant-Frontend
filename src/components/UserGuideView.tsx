import React from 'react';

interface UserGuideViewProps {
  onStartWorkflow: (presetIndex?: number) => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onStartWorkflow }) => {
  const steps = [
    {
      number: '01',
      title: 'Select or Register Patient',
      icon: 'bi-person-check-fill',
      color: 'sky',
      description: 'Choose a patient from your clinic roster or quickly register a new patient file with their medical history and known allergies.',
      actionText: 'Choose Patient',
      tip: 'Patient medical history and allergies are automatically factored into clinical analysis.',
    },
    {
      number: '02',
      title: 'Dictate or Record Consultation',
      icon: 'bi-mic-fill',
      color: 'rose',
      description: 'Click "Start Dictation" to speak naturally during the consultation, or use one-click clinical scenario presets.',
      actionText: 'Try Voice Dictation',
      tip: 'You can dictate vitals (e.g. "BP 120/80, temp 101F") and the system will structure them automatically.',
    },
    {
      number: '03',
      title: 'Automated Clinical Synthesis',
      icon: 'bi-magic',
      color: 'amber',
      description: 'Click "Generate Clinical Notes" to extract vital signs, reported symptoms, timeline, exam findings, and synthesize a complete SOAP note.',
      actionText: 'Extract Notes',
      tip: 'Creates Subjective, Objective, Assessment, and Plan sections in seconds.',
    },
    {
      number: '04',
      title: 'Smart Medical Coding (ICD-10 & CPT)',
      icon: 'bi-tags-fill',
      color: 'indigo',
      description: 'The assistant suggests official ICD-10 diagnosis codes and CPT billing codes with clinical rationale and match confidence.',
      actionText: 'Review Codes',
      tip: 'Doctors can add custom codes or remove codes with one click.',
    },
    {
      number: '05',
      title: 'Physician Review & Certification',
      icon: 'bi-shield-check',
      color: 'emerald',
      description: 'Review and edit any part of the clinical note. The physician remains in 100% control of the final approved medical record.',
      actionText: 'Certify & Save',
      tip: 'Digitally stamps and records the certified consultation into permanent patient records.',
    },
  ];

  const faqs = [
    {
      q: 'How does the system extract vital signs and symptoms?',
      a: 'When you dictate or type "Patient has fever of 101F, blood pressure 130/85, pulse 78 bpm", the system parses the numerical values and units into dedicated vital signs chips and symptoms timeline.',
    },
    {
      q: 'Can I edit the generated SOAP notes before saving?',
      a: 'Yes! Every section of the SOAP note (Subjective, Objective, Assessment, Plan) is fully editable in real-time by the physician.',
    },
    {
      q: 'Are the ICD-10 and CPT codes customizable?',
      a: 'Absolutely. You can add any custom diagnosis code (e.g. J06.9) or billing code (e.g. 99214) or remove suggestions anytime.',
    },
    {
      q: 'Can I print or copy the certified record for our hospital EMR?',
      a: 'Yes. Every consultation has a "Copy Note" button and a dedicated print-ready Medical Record summary sheet.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner / Hero */}
      <div className="medical-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 border border-sky-200">
        <div className="max-w-3xl">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            Clinical Documentation Workflow Guide
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How to Use Dr. Priya Medical Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
            Learn the 5-step clinical documentation workflow designed to reduce documentation time while keeping the attending physician in complete control of final certified medical records.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartWorkflow(0)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <i className="bi bi-play-circle-fill text-sm"></i>
              <span>Launch Interactive Walkthrough</span>
            </button>
            <button
              onClick={() => onStartWorkflow(1)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition-all"
            >
              <i className="bi bi-lightning-charge-fill text-amber-500"></i>
              <span>Try Hypertension Scenario</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Workflow Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-base font-bold text-slate-900">Standard Clinical Workflow</h2>
            <p className="text-xs text-slate-500">Follow these 5 streamlined steps for every patient visit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="medical-card rounded-2xl p-5 border border-slate-200 hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                    STEP {step.number}
                  </span>
                  <div className={`p-2 rounded-xl bg-${step.color}-50 text-${step.color}-600 border border-${step.color}-200`}>
                    <i className={`bi ${step.icon} text-lg`}></i>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start space-x-1.5">
                <i className="bi bi-lightbulb-fill text-amber-500 flex-shrink-0 mt-0.5"></i>
                <span><strong className="text-slate-700">Tip:</strong> {step.tip}</span>
              </div>
            </div>
          ))}

          {/* Quick Start Card */}
          <div className="medical-card rounded-2xl p-5 bg-gradient-to-br from-sky-600 to-sky-700 text-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                  Ready to Start?
                </span>
                <i className="bi bi-rocket-takeoff-fill text-xl text-white"></i>
              </div>
              <h3 className="text-base font-bold text-white mt-3">Start a Patient Encounter</h3>
              <p className="text-xs text-sky-100 mt-1 leading-relaxed">
                Test the complete pipeline with pre-populated patient data or dictate your own consultation in seconds.
              </p>
            </div>

            <button
              onClick={() => onStartWorkflow(0)}
              className="mt-4 w-full py-2.5 rounded-xl bg-white text-sky-700 hover:bg-sky-50 text-xs font-bold shadow-sm transition-all text-center"
            >
              Start New Consultation
            </button>
          </div>
        </div>
      </div>

      {/* Dictation Best Practices & Tips */}
      <div className="medical-card rounded-2xl p-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <i className="bi bi-mic text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physician Dictation Best Practices</h3>
            <p className="text-xs text-slate-500">Tips for maximum accuracy and swift documentation</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 flex items-center space-x-1.5">
              <i className="bi bi-thermometer-half text-rose-600"></i>
              <span>Explicit Vital Signs</span>
            </p>
            <p className="text-slate-600">
              State values clearly: <em>"Temperature 101 degrees Fahrenheit, blood pressure 135 over 85, oxygen saturation 98 percent."</em>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 flex items-center space-x-1.5">
              <i className="bi bi-capsule text-emerald-600"></i>
              <span>Medication Dosages</span>
            </p>
            <p className="text-slate-600">
              Mention drug name, strength, and schedule: <em>"Prescribed Amoxicillin 500mg PO TID for 7 days."</em>
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900 flex items-center space-x-1.5">
              <i className="bi bi-clock-history text-sky-600"></i>
              <span>Symptom Duration</span>
            </p>
            <p className="text-slate-600">
              Specify timeline clearly: <em>"Productive cough for three days, sore throat since yesterday morning."</em>
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="medical-card rounded-2xl p-6">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <i className="bi bi-question-circle-fill text-lg"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physician FAQ & Guidance</h3>
            <p className="text-xs text-slate-500">Common questions about clinical documentation and medical coding</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <i className="bi bi-check-circle-fill text-sky-600 text-[11px]"></i>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-4">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
