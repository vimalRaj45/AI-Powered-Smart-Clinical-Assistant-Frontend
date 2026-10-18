import { api } from './api';

export interface PatientReport {
  id: string | number;
  patientId: number | string;
  patientMrn: string;
  title: string;
  category: 'Laboratory & Blood' | 'Radiology & Imaging' | 'Cardiology (ECG/Echo)' | 'Pathology & Biopsy' | 'Discharge & History' | 'Prescription' | 'Other';
  reportDate: string;
  facilityName: string;
  doctorRemarks?: string;
  findingsSummary?: string;
  fileType: 'pdf' | 'image' | 'doc';
  fileName: string;
  fileUrl?: string; // Base64 Data URI blob stored in Neon PostgreSQL
  fileSizeBytes?: number;
  createdAt: string;
}

// Initial realistic mock reports for patients
const DEFAULT_SAMPLE_REPORTS: Record<string, PatientReport[]> = {
  default: [
    {
      id: 'rep-seed-1',
      patientId: 1,
      patientMrn: 'MRN-2026-001',
      title: 'Complete Blood Count (CBC) & ESR Panel',
      category: 'Laboratory & Blood',
      reportDate: '2026-10-12',
      facilityName: 'Metropolis Healthcare Central Diagnostic Lab',
      doctorRemarks: 'Hb: 13.8 g/dL (Normal). Platelets: 280,000/mcL. Mild leukocytosis noted (WBC: 11,200) indicating mild active infection.',
      findingsSummary: 'Hemoglobin: 13.8 g/dL • RBC: 4.6 mil/uL • WBC: 11,200 /uL (High) • Platelets: 280,000 • ESR: 18 mm/hr',
      fileType: 'pdf',
      fileName: 'CBC_ESR_Report_20261012.pdf',
      fileSizeBytes: 245000,
      createdAt: '2026-10-12T09:30:00Z',
    },
    {
      id: 'rep-seed-2',
      patientId: 1,
      patientMrn: 'MRN-2026-001',
      title: 'Chest X-Ray PA View (Digital Radiography)',
      category: 'Radiology & Imaging',
      reportDate: '2026-09-28',
      facilityName: 'St. Jude Metropolitan Advanced Imaging Center',
      doctorRemarks: 'Both lung fields clear. No focal consolidation, pneumothorax, or pleural effusion. Cardiothoracic ratio is normal (< 0.50).',
      findingsSummary: 'Lungs: Clear parenchymal markings • Heart: Normal size • Diaphragm & CP angles: Clear and sharp.',
      fileType: 'image',
      fileName: 'Chest_XRay_PA_Sept2026.jpg',
      fileSizeBytes: 1850000,
      createdAt: '2026-09-28T14:15:00Z',
    },
    {
      id: 'rep-seed-3',
      patientId: 1,
      patientMrn: 'MRN-2026-001',
      title: '12-Lead Electrocardiogram (ECG / EKG)',
      category: 'Cardiology (ECG/Echo)',
      reportDate: '2026-09-15',
      facilityName: 'Apollo Heart Center & Diagnostic Clinic',
      doctorRemarks: 'Normal sinus rhythm, Rate: 74 bpm. Normal axis, PR interval: 148 ms, QTc: 412 ms. No ischemic ST-T segment abnormalities.',
      findingsSummary: 'Rhythm: Normal Sinus • Heart Rate: 74 BPM • PR: 148ms • QRS: 88ms • QTc: 412ms • Axis: Normal.',
      fileType: 'pdf',
      fileName: 'ECG_12Lead_Rhythm_Report.pdf',
      fileSizeBytes: 420000,
      createdAt: '2026-09-15T11:00:00Z',
    },
    {
      id: 'rep-seed-4',
      patientId: 1,
      patientMrn: 'MRN-2026-001',
      title: 'Fasting Blood Sugar & HbA1c Glycated Hemoglobin',
      category: 'Laboratory & Blood',
      reportDate: '2026-08-20',
      facilityName: 'Thyrocare Technologies Diagnostic Lab',
      doctorRemarks: 'HbA1c: 6.8% (Target < 7.0%). Fasting Blood Glucose: 118 mg/dL. Good glycemic control on Metformin.',
      findingsSummary: 'Fasting Plasma Glucose: 118 mg/dL • HbA1c: 6.8% • Estimated Average Glucose (eAG): 148 mg/dL.',
      fileType: 'pdf',
      fileName: 'HbA1c_Fasting_Glucose_Thyrocare.pdf',
      fileSizeBytes: 310000,
      createdAt: '2026-08-20T08:45:00Z',
    },
    {
      id: 'rep-seed-5',
      patientId: 1,
      patientMrn: 'MRN-2026-001',
      title: 'Ultrasound Whole Abdomen & Pelvis (USG)',
      category: 'Radiology & Imaging',
      reportDate: '2026-07-10',
      facilityName: 'St. Jude Metropolitan Ultrasound Division',
      doctorRemarks: 'Grade 1 mild hepatic steatosis (Fatty Liver). Gallbladder, kidneys, spleen, and pancreas are normal. No calculi or hydronephrosis.',
      findingsSummary: 'Liver: Mild diffuse increased echogenicity (Grade 1 fatty liver) • Gallbladder: Normal lumen, no calculi • Kidneys: Normal bilateral corticomedullary differentiation.',
      fileType: 'image',
      fileName: 'USG_Abdomen_Pelvis_Scan.jpg',
      fileSizeBytes: 2100000,
      createdAt: '2026-07-10T16:20:00Z',
    },
  ],
};

const STORAGE_PREFIX = 'priya_patient_reports_';

const mapDbRecordToReport = (record: any): PatientReport => ({
  id: record.id,
  patientId: record.patientId || record.patient_id,
  patientMrn: record.patientMrn || record.patient_mrn,
  title: record.title,
  category: record.category,
  reportDate: record.reportDate || record.report_date,
  facilityName: record.facilityName || record.facility_name,
  doctorRemarks: record.doctorRemarks || record.doctor_remarks || undefined,
  findingsSummary: record.findingsSummary || record.findings_summary || undefined,
  fileType: record.fileType || record.file_type || 'pdf',
  fileName: record.fileName || record.file_name,
  fileUrl: record.fileData || record.file_data || record.fileUrl,
  fileSizeBytes: record.fileSizeBytes || record.file_size_bytes || 0,
  createdAt: record.createdAt || record.created_at || new Date().toISOString(),
});

export const patientReportsService = {
  // Synchronous read from cache for instant UI rendering
  getReports(patientId: number | string, mrn: string): PatientReport[] {
    const key = `${STORAGE_PREFIX}${mrn || patientId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse patient reports from localStorage:', e);
      }
    }

    const initialReports = DEFAULT_SAMPLE_REPORTS.default.map((r, idx) => ({
      ...r,
      id: `rep-${mrn}-${idx + 1}`,
      patientId,
      patientMrn: mrn,
    }));

    localStorage.setItem(key, JSON.stringify(initialReports));
    return initialReports;
  },

  // Asynchronous fetch from Neon PostgreSQL Database with fallback to local storage
  async fetchReportsFromDb(patientId: number | string, mrn: string): Promise<PatientReport[]> {
    const key = `${STORAGE_PREFIX}${mrn || patientId}`;
    try {
      const dbReports = await api.getPatientReports(patientId, mrn);
      if (Array.isArray(dbReports) && dbReports.length > 0) {
        const mapped = dbReports.map(mapDbRecordToReport);
        localStorage.setItem(key, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Neon DB reports fetch failed, using local offline copy:', err);
    }
    return this.getReports(patientId, mrn);
  },

  // Save report to Neon PostgreSQL Database and local storage
  async addReportAsync(reportData: Omit<PatientReport, 'id' | 'createdAt'>): Promise<PatientReport> {
    const key = `${STORAGE_PREFIX}${reportData.patientMrn || reportData.patientId}`;
    const existing = this.getReports(reportData.patientId, reportData.patientMrn);

    // Save to Neon DB via API
    try {
      const dbPayload = {
        patientId: Number(reportData.patientId) || undefined,
        patientMrn: reportData.patientMrn,
        title: reportData.title,
        category: reportData.category,
        reportDate: reportData.reportDate,
        facilityName: reportData.facilityName,
        doctorRemarks: reportData.doctorRemarks,
        findingsSummary: reportData.findingsSummary,
        fileType: reportData.fileType,
        fileName: reportData.fileName,
        fileData: reportData.fileUrl, // Store Base64 Data URI blob in Neon PostgreSQL
        fileSizeBytes: reportData.fileSizeBytes,
      };

      const serverRecord = await api.uploadPatientReport(dbPayload);
      if (serverRecord && serverRecord.id) {
        const saved = mapDbRecordToReport(serverRecord);
        const updated = [saved, ...existing.filter((r) => r.id !== saved.id)];
        localStorage.setItem(key, JSON.stringify(updated));
        return saved;
      }
    } catch (err) {
      console.warn('Failed to upload report to Neon DB, falling back to local storage:', err);
    }

    // Fallback: Local Storage
    const newReport: PatientReport = {
      ...reportData,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReport, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    return newReport;
  },

  // Synchronous add for backwards compatibility
  addReport(reportData: Omit<PatientReport, 'id' | 'createdAt'>): PatientReport {
    // Trigger async DB upload in background
    this.addReportAsync(reportData).catch((e) => console.warn(e));

    const key = `${STORAGE_PREFIX}${reportData.patientMrn || reportData.patientId}`;
    const existing = this.getReports(reportData.patientId, reportData.patientMrn);

    const newReport: PatientReport = {
      ...reportData,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newReport, ...existing];
    localStorage.setItem(key, JSON.stringify(updated));
    return newReport;
  },

  // Delete report from Neon PostgreSQL Database and local storage
  async deleteReportAsync(patientId: number | string, mrn: string, reportId: string | number): Promise<boolean> {
    const key = `${STORAGE_PREFIX}${mrn || patientId}`;
    const existing = this.getReports(patientId, mrn);
    const updated = existing.filter((r) => String(r.id) !== String(reportId));
    localStorage.setItem(key, JSON.stringify(updated));

    // Delete from Neon DB if numeric ID
    if (typeof reportId === 'number' || !isNaN(Number(reportId))) {
      try {
        await api.deletePatientReport(reportId);
      } catch (err) {
        console.warn('Failed to delete report from Neon DB:', err);
      }
    }

    return true;
  },

  deleteReport(patientId: number | string, mrn: string, reportId: string | number): boolean {
    this.deleteReportAsync(patientId, mrn, reportId).catch((e) => console.warn(e));
    const key = `${STORAGE_PREFIX}${mrn || patientId}`;
    const existing = this.getReports(patientId, mrn);
    const updated = existing.filter((r) => String(r.id) !== String(reportId));
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  },

  getReportCount(patientId: number | string, mrn: string): number {
    return this.getReports(patientId, mrn).length;
  },
};
