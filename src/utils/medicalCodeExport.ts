import type { Patient, IcdCodeItem, CptCodeItem, Consultation } from '../types';

export interface CodeExportOptions {
  patient?: Patient | null;
  icdCodes: IcdCodeItem[];
  cptCodes: CptCodeItem[];
  consultationDate?: string;
  doctorName?: string;
  consultationId?: number | string;
  includeRationale?: boolean;
  includeConfidence?: boolean;
  includePatientMeta?: boolean;
}

/**
 * Escapes a string field for standard RFC 4180 CSV compliance
 */
const escapeCsvField = (field: any): string => {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Triggers a browser download of a Blob file
 */
const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports single encounter medical codes to CSV
 */
export const exportMedicalCodesToCsv = (options: CodeExportOptions) => {
  const {
    patient,
    icdCodes = [],
    cptCodes = [],
    consultationDate = new Date().toISOString(),
    doctorName = 'Dr. Priya MD',
    consultationId = 'LIVE',
    includeRationale = true,
    includeConfidence = true,
  } = options;

  const dateStr = new Date(consultationDate).toLocaleDateString('en-US');
  const mrn = patient?.mrn || 'N/A';
  const patientName = patient?.name || 'Unassigned Patient';
  const age = patient?.age ? String(patient?.age) : 'N/A';
  const gender = patient?.gender || 'N/A';

  const headers = [
    'Encounter ID',
    'Date',
    'Patient MRN',
    'Patient Name',
    'Age',
    'Gender',
    'Attending Physician',
    'Code Type',
    'Code',
    'Description',
    'Category',
  ];

  if (includeConfidence) headers.push('AI Confidence / Match');
  if (includeRationale) headers.push('Clinical Rationale / Billing Justification');

  const rows: string[] = [headers.map(escapeCsvField).join(',')];

  // Add ICD-10 rows
  icdCodes.forEach((icd) => {
    const row = [
      escapeCsvField(consultationId),
      escapeCsvField(dateStr),
      escapeCsvField(mrn),
      escapeCsvField(patientName),
      escapeCsvField(age),
      escapeCsvField(gender),
      escapeCsvField(doctorName),
      escapeCsvField('ICD-10-CM (Diagnosis)'),
      escapeCsvField(icd.code),
      escapeCsvField(icd.description),
      escapeCsvField(icd.category || 'Clinical Diagnosis'),
    ];
    if (includeConfidence) {
      row.push(escapeCsvField(icd.confidence ? `${Math.round(icd.confidence * 100)}%` : '100%'));
    }
    if (includeRationale) {
      row.push(escapeCsvField(icd.rationale || 'Physician Assigned'));
    }
    rows.push(row.join(','));
  });

  // Add CPT rows
  cptCodes.forEach((cpt) => {
    const row = [
      escapeCsvField(consultationId),
      escapeCsvField(dateStr),
      escapeCsvField(mrn),
      escapeCsvField(patientName),
      escapeCsvField(age),
      escapeCsvField(gender),
      escapeCsvField(doctorName),
      escapeCsvField('CPT (Procedure/Billing)'),
      escapeCsvField(cpt.code),
      escapeCsvField(cpt.description),
      escapeCsvField(cpt.category || 'Evaluation & Management'),
    ];
    if (includeConfidence) {
      row.push(escapeCsvField('Verified (1.0)'));
    }
    if (includeRationale) {
      row.push(escapeCsvField(cpt.rationale || 'Standard Clinical Billing'));
    }
    rows.push(row.join(','));
  });

  const csvContent = rows.join('\r\n');
  const filename = `medical_codes_${mrn !== 'N/A' ? mrn : 'encounter'}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(csvContent, filename, 'text/csv');
};

/**
 * Batch exports medical codes from multiple consultations to a consolidated CSV
 */
export const exportBatchMedicalCodesToCsv = (consultations: Consultation[]) => {
  const headers = [
    'Encounter ID',
    'Date',
    'Status',
    'Patient MRN',
    'Patient Name',
    'Age',
    'Gender',
    'Attending Physician',
    'Code Type',
    'Code',
    'Description',
    'Category',
    'AI Confidence',
    'Clinical Justification',
  ];

  const rows: string[] = [headers.map(escapeCsvField).join(',')];

  consultations.forEach((c) => {
    const dateStr = new Date(c.consultationDate).toLocaleDateString('en-US');
    const mrn = c.patient?.mrn || 'N/A';
    const patientName = c.patient?.name || 'Unknown Patient';
    const age = c.patient?.age ? String(c.patient.age) : 'N/A';
    const gender = c.patient?.gender || 'N/A';
    const doctor = c.doctorName || 'Dr. Priya MD';

    (c.icdCodes || []).forEach((icd) => {
      rows.push(
        [
          escapeCsvField(c.id),
          escapeCsvField(dateStr),
          escapeCsvField(c.status),
          escapeCsvField(mrn),
          escapeCsvField(patientName),
          escapeCsvField(age),
          escapeCsvField(gender),
          escapeCsvField(doctor),
          escapeCsvField('ICD-10-CM'),
          escapeCsvField(icd.code),
          escapeCsvField(icd.description),
          escapeCsvField(icd.category || 'Diagnosis'),
          escapeCsvField(icd.confidence ? `${Math.round(icd.confidence * 100)}%` : '100%'),
          escapeCsvField(icd.rationale || 'N/A'),
        ].join(',')
      );
    });

    (c.cptCodes || []).forEach((cpt) => {
      rows.push(
        [
          escapeCsvField(c.id),
          escapeCsvField(dateStr),
          escapeCsvField(c.status),
          escapeCsvField(mrn),
          escapeCsvField(patientName),
          escapeCsvField(age),
          escapeCsvField(gender),
          escapeCsvField(doctor),
          escapeCsvField('CPT'),
          escapeCsvField(cpt.code),
          escapeCsvField(cpt.description),
          escapeCsvField(cpt.category || 'Procedure'),
          escapeCsvField('100%'),
          escapeCsvField(cpt.rationale || 'Standard Clinical Billing'),
        ].join(',')
      );
    });
  });

  const csvContent = rows.join('\r\n');
  const filename = `all_medical_codes_batch_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(csvContent, filename, 'text/csv');
};

/**
 * Exports medical codes in structured EHR / FHIR-compatible JSON format
 */
export const exportMedicalCodesToJson = (options: CodeExportOptions) => {
  const {
    patient,
    icdCodes = [],
    cptCodes = [],
    consultationDate = new Date().toISOString(),
    doctorName = 'Dr. Priya MD',
    consultationId = 'LIVE',
  } = options;

  const exportPayload = {
    schemaVersion: '1.0.0',
    resourceType: 'ClinicalCodingBundle',
    generatedAt: new Date().toISOString(),
    encounter: {
      id: consultationId,
      date: consultationDate,
      attendingPhysician: doctorName,
      facility: 'Dr. Priya Healthcare & Clinical Studios',
    },
    patient: {
      mrn: patient?.mrn || 'N/A',
      name: patient?.name || 'Unassigned Patient',
      age: patient?.age || null,
      gender: patient?.gender || null,
      phone: patient?.phone || null,
    },
    diagnoses_icd10: icdCodes.map((c, index) => ({
      sequence: index + 1,
      codingSystem: 'http://hl7.org/fhir/sid/icd-10-cm',
      code: c.code,
      display: c.description,
      category: c.category || 'Diagnosis',
      confidenceScore: c.confidence || 1.0,
      clinicalRationale: c.rationale || '',
    })),
    procedures_cpt: cptCodes.map((c, index) => ({
      sequence: index + 1,
      codingSystem: 'http://www.ama-assn.org/go/cpt',
      code: c.code,
      display: c.description,
      category: c.category || 'Evaluation & Management',
      billingJustification: c.rationale || '',
    })),
    summary: {
      totalDiagnosisCodes: icdCodes.length,
      totalProcedureCodes: cptCodes.length,
    },
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const mrn = patient?.mrn || 'encounter';
  const filename = `medical_codes_${mrn}_${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(jsonContent, filename, 'application/json');
};

/**
 * Formats coding sheet text and copies to clipboard for direct EHR pasting
 */
export const copyMedicalCodesToClipboard = async (options: CodeExportOptions): Promise<boolean> => {
  const {
    patient,
    icdCodes = [],
    cptCodes = [],
    consultationDate = new Date().toISOString(),
    doctorName = 'Dr. Priya MD',
  } = options;

  const lines: string[] = [];
  lines.push(`=======================================================`);
  lines.push(`DR. PRIYA CLINICAL STUDIO - MEDICAL CODING SUPERBILL`);
  lines.push(`=======================================================`);
  lines.push(`Date: ${new Date(consultationDate).toLocaleString()}`);
  lines.push(`Patient: ${patient?.name || 'N/A'} (MRN: ${patient?.mrn || 'N/A'}, Age: ${patient?.age || 'N/A'}, Gender: ${patient?.gender || 'N/A'})`);
  lines.push(`Attending Physician: ${doctorName}`);
  lines.push(``);
  lines.push(`--- ICD-10-CM DIAGNOSES ---`);
  if (icdCodes.length === 0) {
    lines.push(`No diagnosis codes assigned.`);
  } else {
    icdCodes.forEach((icd, i) => {
      lines.push(`${i + 1}. [${icd.code}] ${icd.description}`);
      if (icd.rationale) lines.push(`   Rationale: ${icd.rationale}`);
    });
  }

  lines.push(``);
  lines.push(`--- CPT PROCEDURES & BILLING ---`);
  if (cptCodes.length === 0) {
    lines.push(`No CPT procedure codes assigned.`);
  } else {
    cptCodes.forEach((cpt, i) => {
      lines.push(`${i + 1}. [CPT ${cpt.code}] ${cpt.description}`);
      if (cpt.rationale) lines.push(`   Billing Justification: ${cpt.rationale}`);
    });
  }
  lines.push(``);
  lines.push(`Certified by: ${doctorName}`);
  lines.push(`=======================================================`);

  const fullText = lines.join('\n');
  try {
    await navigator.clipboard.writeText(fullText);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Exports reference ICD & CPT database to CSV
 */
export const exportReferenceDatabaseToCsv = (
  icdList: Array<{ code: string; description: string; category: string }>,
  cptList: Array<{ code: string; description: string; category: string }>
) => {
  const headers = ['Code System', 'Code', 'Official Description', 'Clinical Category'];
  const rows: string[] = [headers.map(escapeCsvField).join(',')];

  icdList.forEach((item) => {
    rows.push(
      [
        escapeCsvField('ICD-10-CM'),
        escapeCsvField(item.code),
        escapeCsvField(item.description),
        escapeCsvField(item.category),
      ].join(',')
    );
  });

  cptList.forEach((item) => {
    rows.push(
      [
        escapeCsvField('CPT'),
        escapeCsvField(item.code),
        escapeCsvField(item.description),
        escapeCsvField(item.category),
      ].join(',')
    );
  });

  const csvContent = rows.join('\r\n');
  const filename = `medical_coding_reference_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(csvContent, filename, 'text/csv');
};
