export interface Patient {
  id: number;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone?: string | null;
  email?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VitalsData {
  temperature?: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  weight?: string;
  height?: string;
  bmi?: string;
}

export interface SymptomItem {
  name: string;
  duration?: string;
  severity?: string;
}

export interface StructuredClinicalData {
  chiefComplaint?: string;
  symptoms?: SymptomItem[];
  vitals?: VitalsData;
  historyOfPresentIllness?: string;
  examinationFindings?: string[];
  medications?: string[];
  allergies?: string[];
  riskFactors?: string[];
}

export interface SoapNoteData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface IcdCodeItem {
  code: string;
  description: string;
  category?: string;
  confidence: number;
  rationale: string;
}

export interface CptCodeItem {
  code: string;
  description: string;
  category?: string;
  rationale?: string;
}

export interface AIClinicalResult {
  structuredData: StructuredClinicalData;
  soapNote: SoapNoteData;
  icdCodes: IcdCodeItem[];
  cptCodes: CptCodeItem[];
}

export interface Consultation {
  id: number;
  patientId: number;
  status: 'draft' | 'in_review' | 'approved';
  consultationDate: string;
  audioUrl?: string | null;
  rawTranscript: string;
  structuredData?: StructuredClinicalData | null;
  soapNote?: SoapNoteData | null;
  icdCodes?: IcdCodeItem[] | null;
  cptCodes?: CptCodeItem[] | null;
  doctorNotes?: string | null;
  doctorName?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
}
