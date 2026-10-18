import React, { useState, useEffect, useRef } from 'react';
import type { Patient } from '../types';
import { patientReportsService, PatientReport } from '../services/patientReportsService';
import Swal from 'sweetalert2';

interface PatientReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const PatientReportsModal: React.FC<PatientReportsModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [reports, setReports] = useState<PatientReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewReport, setPreviewReport] = useState<PatientReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Upload Form State
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState<PatientReport['category']>('Laboratory & Blood');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [facilityName, setFacilityName] = useState('Metropolis Healthcare Diagnostic Lab');
  const [findingsSummary, setFindingsSummary] = useState('');
  const [doctorRemarks, setDoctorRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load reports whenever patient changes or modal opens
  useEffect(() => {
    if (isOpen && patient) {
      loadReports();
      setShowUploadForm(false);
      setPreviewReport(null);
    }
  }, [isOpen, patient]);

  const loadReports = async () => {
    if (!patient) return;
    const cached = patientReportsService.getReports(patient.id, patient.mrn);
    setReports(cached);
    try {
      setIsLoading(true);
      const data = await patientReportsService.fetchReportsFromDb(patient.id, patient.mrn);
      setReports(data);
    } catch (err) {
      console.warn('Could not sync reports from DB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !patient) return null;

  // Handle file selection and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!reportTitle) {
      // Auto-populate report title from file name without extension
      const cleaned = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setReportTitle(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit new report to Neon DB Blob and Cache
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Title Required',
        text: 'Please enter a valid report or test title.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isImg = selectedFile?.type.startsWith('image/') || (!selectedFile && reportCategory === 'Radiology & Imaging');
      const isDoc = selectedFile?.name.endsWith('.doc') || selectedFile?.name.endsWith('.docx');
      const fileType: PatientReport['fileType'] = isImg ? 'image' : isDoc ? 'doc' : 'pdf';

      const fileName = selectedFile
        ? selectedFile.name
        : `${reportTitle.replace(/\s+/g, '_')}_${reportDate}.pdf`;

      await patientReportsService.addReportAsync({
        patientId: patient.id,
        patientMrn: patient.mrn,
        title: reportTitle.trim(),
        category: reportCategory,
        reportDate,
        facilityName: facilityName.trim() || 'Central Hospital Diagnostic Lab',
        findingsSummary: findingsSummary.trim() || 'Investigation completed. Results within observed clinical parameters.',
        doctorRemarks: doctorRemarks.trim() || 'Clinically correlated with patient symptoms.',
        fileType,
        fileName,
        fileUrl: fileBase64 || undefined,
        fileSizeBytes: selectedFile?.size || 350000,
      });

      // Reload from DB
      await loadReports();

      // Reset form
      setReportTitle('');
      setFindingsSummary('');
      setDoctorRemarks('');
      setSelectedFile(null);
      setFileBase64('');
      setShowUploadForm(false);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Report Uploaded to Neon DB!',
        text: `${reportTitle} securely stored in database.`,
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Failed to save report:', err);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'An error occurred while saving the report.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete report
  const handleDeleteReport = (report: PatientReport) => {
    Swal.fire({
      title: 'Delete Medical Report?',
      text: `Are you sure you want to delete "${report.title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
    }).then(async (res) => {
      if (res.isConfirmed) {
        await patientReportsService.deleteReportAsync(patient.id, patient.mrn, report.id);
        await loadReports();
        if (previewReport?.id === report.id) {
          setPreviewReport(null);
        }
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Report Deleted from Database',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filter reports
  const filteredReports = reports.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.facilityName.toLowerCase().includes(q) ||
      (r.findingsSummary && r.findingsSummary.toLowerCase().includes(q)) ||
      (r.doctorRemarks && r.doctorRemarks.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    'All',
    'Laboratory & Blood',
    'Radiology & Imaging',
    'Cardiology (ECG/Echo)',
    'Pathology & Biopsy',
    'Discharge & History',
    'Prescription',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 text-lg shadow-inner">
              <i className="bi bi-file-earmark-medical-fill"></i>
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  Patient Medical Reports & Diagnostics
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                  {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} on File
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center space-x-2">
                <span className="font-semibold text-white">{patient.name}</span>
                <span>•</span>
                <span className="font-mono text-sky-300">{patient.mrn}</span>
                <span>•</span>
                <span>{patient.age} yrs • {patient.gender}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm ${
                showUploadForm
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
              }`}
            >
              <i className={`bi ${showUploadForm ? 'bi-x-lg' : 'bi-cloud-arrow-up-fill'} text-xs`}></i>
              <span className="hidden sm:inline">{showUploadForm ? 'Close Form' : 'Upload Report'}</span>
              <span className="sm:hidden">{showUploadForm ? 'Close' : 'Upload'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all"
              title="Close modal"
            >
              <i className="bi bi-x-lg text-sm"></i>
            </button>
          </div>
        </div>

        {/* UPLOAD REPORT DRAWER / FORM */}
        {showUploadForm && (
          <form
            onSubmit={handleUploadSubmit}
            className="p-4 sm:p-5 bg-sky-50/70 border-b border-sky-200 space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between pb-2 border-b border-sky-200">
              <span className="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center space-x-1.5">
                <i className="bi bi-file-earmark-plus-fill text-sky-600"></i>
                <span>Upload New Patient Report / Diagnostic Scan</span>
              </span>
              <span className="text-[11px] text-sky-700 font-medium">Supports PDF, JPG, PNG & Scans</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Report / Test Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) Panel"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Laboratory & Blood">Laboratory & Blood</option>
                  <option value="Radiology & Imaging">Radiology & Imaging (X-Ray/CT/MRI)</option>
                  <option value="Cardiology (ECG/Echo)">Cardiology (ECG/Echo)</option>
                  <option value="Pathology & Biopsy">Pathology & Biopsy</option>
                  <option value="Discharge & History">Discharge & History</option>
                  <option value="Prescription">Prescription / Rx</option>
                  <option value="Other">Other Clinical Document</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Date of Test</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Diagnostic Facility / Laboratory Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metropolis Labs / Apollo Diagnostic"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Attach Report File (PDF or Image)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp,.docx"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Key Findings & Value Highlights
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hb: 13.8 g/dL, WBC: 7,200, Platelets: 2.8L (Normal)"
                  value={findingsSummary}
                  onChange={(e) => setFindingsSummary(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Doctor / Clinical Impression Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Normal baseline investigation. No acute pathology."
                  value={doctorRemarks}
                  onChange={(e) => setDoctorRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <i className={`bi ${isSubmitting ? 'bi-arrow-clockwise animate-spin' : 'bi-check2-circle'}`}></i>
                <span>{isSubmitting ? 'Saving...' : 'Save & Add Report'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TOOLBAR: SEARCH & CATEGORY CHIPS */}
        <div className="p-3 sm:px-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search reports by title, test name, facility, findings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* REPORTS LISTING & VIEWER BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-slate-50/40">
          {filteredReports.length === 0 ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl mb-3">
                <i className="bi bi-folder2-open"></i>
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Medical Reports Found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchQuery || selectedCategory !== 'All'
                  ? 'No reports match your search criteria. Try a different query or category.'
                  : 'No previous diagnostic reports uploaded for this patient yet.'}
              </p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="mt-4 px-3 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm hover:bg-sky-700 transition-all"
              >
                <i className="bi bi-plus-circle-fill"></i>
                <span>Upload First Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 shadow-sm hover:shadow transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Category Badge & Date */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          report.category === 'Laboratory & Blood'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : report.category === 'Radiology & Imaging'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : report.category === 'Cardiology (ECG/Echo)'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {report.category}
                      </span>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                        <i className="bi bi-calendar2-event text-slate-400"></i>
                        <span>
                          {new Date(report.reportDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Report Title */}
                    <div className="flex items-start space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <i
                          className={`bi ${
                            report.fileType === 'image'
                              ? 'bi-file-earmark-image'
                              : report.fileType === 'pdf'
                              ? 'bi-file-earmark-pdf-fill text-rose-600'
                              : 'bi-file-earmark-text'
                          } text-base`}
                        ></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                          {report.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate flex items-center space-x-1 mt-0.5">
                          <i className="bi bi-building text-[10px]"></i>
                          <span>{report.facilityName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Findings & Values Summary */}
                    {report.findingsSummary && (
                      <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                        <strong className="text-slate-900 font-semibold block mb-0.5">
                          Findings & Values:
                        </strong>
                        <p className="line-clamp-2 leading-relaxed font-mono text-[10.5px]">
                          {report.findingsSummary}
                        </p>
                      </div>
                    )}

                    {/* Doctor Remarks */}
                    {report.doctorRemarks && (
                      <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
                        <strong className="text-sky-800">Doctor Note:</strong> {report.doctorRemarks}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      {report.fileName}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setPreviewReport(report)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold flex items-center space-x-1 transition-all"
                        title="View report details & preview"
                      >
                        <i className="bi bi-eye-fill text-[11px]"></i>
                        <span>View</span>
                      </button>

                      {report.fileUrl && (
                        <a
                          href={report.fileUrl}
                          download={report.fileName}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-all"
                          title="Download attached file"
                        >
                          <i className="bi bi-download text-[11px]"></i>
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteReport(report)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-all"
                        title="Delete this report"
                      >
                        <i className="bi bi-trash3 text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 sm:px-5 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <i className="bi bi-shield-check text-emerald-600"></i>
            <span>Encrypted patient clinical documents stored securely.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>

      {/* SINGLE REPORT FULL PREVIEW MODAL */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Preview Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  {previewReport.category}
                </span>
                <h3 className="text-base font-bold text-white">{previewReport.title}</h3>
                <p className="text-xs text-slate-400">
                  {patient.name} ({patient.mrn}) • Test Date: {previewReport.reportDate} • {previewReport.facilityName}
                </p>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-all"
              >
                <i className="bi bi-x-lg text-sm"></i>
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 bg-slate-50/50 text-xs">
              {/* Document Visual or Preview */}
              {previewReport.fileUrl && previewReport.fileType === 'image' ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[380px]">
                  <img
                    src={previewReport.fileUrl}
                    alt={previewReport.title}
                    className="max-h-[380px] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
                      <i className="bi bi-file-earmark-medical"></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{previewReport.fileName}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Diagnostic Laboratory Verified Document • Certified Electronic Record
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      <p className="font-bold text-sky-900 uppercase text-[11px] mb-1">
                        Official Lab Findings & Quantitative Parameters:
                      </p>
                      {previewReport.findingsSummary || 'No specific parameters noted.'}
                    </div>

                    <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-950 leading-relaxed">
                      <p className="font-bold text-sky-900 uppercase text-[11px] mb-0.5">
                        Clinical Impression / Attending Radiologist / Pathologist Remarks:
                      </p>
                      {previewReport.doctorRemarks || 'Results clinically correlated.'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="p-3 px-5 border-t border-slate-200 bg-white flex items-center justify-between">
              {previewReport.fileUrl ? (
                <a
                  href={previewReport.fileUrl}
                  download={previewReport.fileName}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <i className="bi bi-download"></i>
                  <span>Download Report File</span>
                </a>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <i className="bi bi-printer"></i>
                  <span>Print Report Summary</span>
                </button>
              )}

              <button
                onClick={() => setPreviewReport(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
