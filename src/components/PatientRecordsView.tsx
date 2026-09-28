import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Patient, Consultation } from '../types';
import { ConsultationDetailModal } from './ConsultationDetailModal';
import { PrescriptionAndBillingModal } from './PrescriptionAndBillingModal';
import { exportBatchMedicalCodesToCsv } from '../utils/medicalCodeExport';

interface PatientRecordsViewProps {
  onSelectPatientForConsultation: (patient: Patient) => void;
  onNewPatientClick: () => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  onSelectPatientForConsultation,
  onNewPatientClick,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'in_review' | 'draft'>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [selectedRxConsultation, setSelectedRxConsultation] = useState<Consultation | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pts, consults] = await Promise.all([
        api.getPatients(),
        api.getConsultations(),
      ]);
      setPatients(pts);
      setConsultations(consults);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Patients roster
  const filteredPatients = patients.filter((p) => {
    const q = patientSearchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      (p.medicalHistory && p.medicalHistory.toLowerCase().includes(q))
    );
  });

  // Filter Clinical Encounters by search & status
  const filteredConsultations = consultations.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const q = searchQuery.toLowerCase();
    
    const pName = c.patient?.name?.toLowerCase() || '';
    const mrn = c.patient?.mrn?.toLowerCase() || '';
    const transcript = c.rawTranscript?.toLowerCase() || '';
    const docName = c.doctorName?.toLowerCase() || '';
    
    // Check ICD and CPT code matches
    const matchesIcd = c.icdCodes?.some(
      (code) => code.code.toLowerCase().includes(q) || code.description.toLowerCase().includes(q)
    );
    const matchesCpt = c.cptCodes?.some(
      (code) => code.code.toLowerCase().includes(q) || code.description.toLowerCase().includes(q)
    );

    const matchesSearch =
      !q ||
      pName.includes(q) ||
      mrn.includes(q) ||
      transcript.includes(q) ||
      docName.includes(q) ||
      matchesIcd ||
      matchesCpt;

    return matchesStatus && matchesSearch;
  });

  const totalApproved = consultations.filter((c) => c.status === 'approved').length;
  const totalPending = consultations.filter((c) => c.status === 'in_review' || c.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="medical-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Patients</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{patients.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <i className="bi bi-people-fill text-lg sm:text-xl"></i>
          </div>
        </div>

        <div className="medical-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Consultations</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{consultations.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <i className="bi bi-file-earmark-medical-fill text-lg sm:text-xl"></i>
          </div>
        </div>

        <div className="medical-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Certified Records</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">{totalApproved}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <i className="bi bi-patch-check-fill text-lg sm:text-xl"></i>
          </div>
        </div>

        <div className="medical-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Pending Review</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-0.5">{totalPending}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <i className="bi bi-clock-history text-lg sm:text-xl"></i>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Patients (4 cols on lg) */}
        <div className="lg:col-span-4 medical-card rounded-2xl p-4 sm:p-5 flex flex-col h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <i className="bi bi-people-fill text-sky-600"></i>
              <h3 className="text-sm font-bold text-slate-900">Patient Directory</h3>
            </div>
            <button
              onClick={onNewPatientClick}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center space-x-1"
            >
              <i className="bi bi-person-plus-fill"></i>
              <span>Register</span>
            </button>
          </div>

          {/* Quick Patient Search Input */}
          <div className="mt-3 relative">
            <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by name, MRN, condition..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input"
            />
          </div>

          {/* Patient Cards List */}
          <div className="mt-3 overflow-y-auto space-y-2 pr-1 flex-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No matching patients found.</div>
            ) : (
              filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all cursor-pointer group"
                  onClick={() => onSelectPatientForConsultation(patient)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {patient.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {patient.mrn} • {patient.age} yrs • {patient.gender}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 group-hover:bg-sky-600 group-hover:text-white transition-all">
                      Start Visit
                    </span>
                  </div>

                  {patient.medicalHistory && (
                    <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-1">
                      <strong className="text-slate-700">Hx:</strong> {patient.medicalHistory}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Encounters & Documentation Records (8 cols on lg) */}
        <div className="lg:col-span-8 medical-card rounded-2xl p-4 sm:p-5 flex flex-col h-[580px]">
          {/* Header with Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <i className="bi bi-file-earmark-medical-fill text-sky-600"></i>
              <h3 className="text-sm font-bold text-slate-900">Clinical Encounters & Notes</h3>
            </div>

            <div className="flex items-center space-x-2">
              {/* Encounters Live Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search patient, symptoms, ICD/CPT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 pl-8 pr-3 py-1.5 rounded-xl text-xs medical-input"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs medical-input bg-white font-medium"
              >
                <option value="all">All Status</option>
                <option value="approved">Certified</option>
                <option value="in_review">In Review</option>
                <option value="draft">Draft</option>
              </select>

              {/* Batch Export Codes Button */}
              <button
                onClick={() => exportBatchMedicalCodesToCsv(filteredConsultations)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-sm transition-all"
                title="Batch export all displayed ICD-10 & CPT medical codes as CSV"
              >
                <i className="bi bi-box-arrow-up-right text-xs"></i>
                <span className="hidden sm:inline">Export Codes (.CSV)</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>

          {/* List of Consultations */}
          <div className="mt-3 overflow-y-auto space-y-2.5 pr-1 flex-1">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">Loading clinical records...</div>
            ) : filteredConsultations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center">
                <i className="bi bi-file-earmark-x text-3xl text-slate-300 mb-2"></i>
                <span>No matching clinical records found.</span>
              </div>
            ) : (
              filteredConsultations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConsultation(c)}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl border mt-0.5 ${
                        c.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <i className={`bi ${c.status === 'approved' ? 'bi-shield-check' : 'bi-clock-history'} text-base`}></i>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                            {c.patient?.name || 'Unknown Patient'}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-500 font-medium">
                            ({c.patient?.mrn || 'N/A'})
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                          <span>
                            {new Date(c.consultationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-slate-700 font-semibold">{c.doctorName || 'Dr. Priya MD'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        c.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {c.status === 'approved' ? 'Certified' : c.status}
                      </span>
                      <i className="bi bi-chevron-right text-slate-400 group-hover:text-sky-600 transition-colors text-xs"></i>
                    </div>
                  </div>

                  {/* Dictation preview snippet */}
                  <p className="text-xs text-slate-700 font-mono mt-2 line-clamp-2 bg-white p-2 rounded-lg border border-slate-200">
                    "{c.rawTranscript}"
                  </p>

                  {/* Diagnosis & CPT badges */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {c.icdCodes && c.icdCodes.length > 0 && (
                      c.icdCodes.slice(0, 2).map((icd, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200"
                        >
                          {icd.code} - {icd.description}
                        </span>
                      ))
                    )}
                    {c.cptCodes && c.cptCodes.length > 0 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        CPT {c.cptCodes[0].code}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    
      {/* Patient Prescription & Billing Invoice Modal */}
      {selectedRxConsultation && (
        <PrescriptionAndBillingModal
          isOpen={!!selectedRxConsultation}
          onClose={() => setSelectedRxConsultation(null)}
          patient={selectedRxConsultation.patient || null}
          doctorName={selectedRxConsultation.doctorName || 'Dr. Priya MD'}
          soapNote={selectedRxConsultation.soapNote}
          medications={selectedRxConsultation.structuredData?.medications || []}
          icdCodes={selectedRxConsultation.icdCodes || []}
          cptCodes={selectedRxConsultation.cptCodes || []}
          consultationDate={new Date(selectedRxConsultation.consultationDate).toLocaleDateString()}
        />
      )}
    </div>
  );
};
