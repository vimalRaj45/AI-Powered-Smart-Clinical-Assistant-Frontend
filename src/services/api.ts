import type { Patient, Consultation, AIClinicalResult } from '../types';

const getApiBase = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || '';
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const API_BASE = getApiBase();

export const api = {
  // Health & Connection
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Patients
  async getPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/patients`);
    const data = await res.json();
    return data.data || [];
  },

  async getPatient(id: number): Promise<Patient & { consultations: Consultation[] }> {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    const data = await res.json();
    return data.data;
  },

  async createPatient(patient: {
    name: string;
    age: number;
    gender: string;
    phone?: string;
    email?: string;
    medicalHistory?: string;
    allergies?: string;
    mrn?: string;
  }): Promise<Patient> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patient),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create patient');
    return data.data;
  },

  // Audio Transcription via Cloudflare Whisper
  async transcribeAudio(file: Blob | File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file, 'recording.webm');

    const res = await fetch(`${API_BASE}/consultations/transcribe`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Transcription failed');
    return data.text || '';
  },

  // Process Clinical Note via Cloudflare Mistral AI (Standard JSON)
  async processAI(transcript: string, patientId?: number): Promise<AIClinicalResult> {
    const res = await fetch(`${API_BASE}/consultations/process-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, patientId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI processing failed');
    return data.data;
  },

  // Process Clinical Note via Real-Time Server-Sent Events (SSE Stream)
  async processAIStream(
    transcript: string,
    patientId?: number,
    onEvent?: (event: string, data: any) => void
  ): Promise<AIClinicalResult> {
    try {
      const response = await fetch(`${API_BASE}/consultations/process-ai-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, patientId }),
      });

      if (!response.ok || !response.body) {
        // Fallback to standard processAI
        return await this.processAI(transcript, patientId);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalResult: AIClinicalResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const chunk of lines) {
          if (!chunk.trim()) continue;
          const matchEvent = chunk.match(/^event:\s*(.*)$/m);
          const matchData = chunk.match(/^data:\s*(.*)$/m);
          if (matchEvent && matchData) {
            const eventName = matchEvent[1].trim();
            try {
              const eventData = JSON.parse(matchData[1]);
              if (onEvent) onEvent(eventName, eventData);
              if (eventName === 'complete' && eventData.data) {
                finalResult = eventData.data;
              }
            } catch (err) {
              console.warn('SSE JSON parse error:', err);
            }
          }
        }
      }

      if (!finalResult) {
        return await this.processAI(transcript, patientId);
      }

      return finalResult;
    } catch (e) {
      console.warn('SSE Streaming connection failed, falling back to standard REST AI...', e);
      return await this.processAI(transcript, patientId);
    }
  },

  // Consultations CRUD
  async getConsultations(): Promise<Consultation[]> {
    const res = await fetch(`${API_BASE}/consultations`);
    const data = await res.json();
    return data.data || [];
  },

  async getConsultation(id: number): Promise<Consultation> {
    const res = await fetch(`${API_BASE}/consultations/${id}`);
    const data = await res.json();
    return data.data;
  },

  async saveConsultation(payload: {
    patientId: number;
    status: 'draft' | 'in_review' | 'approved';
    rawTranscript: string;
    structuredData?: any;
    soapNote?: any;
    icdCodes?: any;
    cptCodes?: any;
    doctorNotes?: string;
    doctorName?: string;
  }): Promise<Consultation> {
    const res = await fetch(`${API_BASE}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save consultation');
    return data.data;
  },

  async updateConsultation(id: number, payload: Partial<Consultation>): Promise<Consultation> {
    const res = await fetch(`${API_BASE}/consultations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update consultation');
    return data.data;
  },

  async approveConsultation(id: number, payload: {
    doctorNotes?: string;
    doctorName?: string;
    soapNote?: any;
    icdCodes?: any;
    cptCodes?: any;
  }): Promise<Consultation> {
    const res = await fetch(`${API_BASE}/consultations/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve consultation');
    return data.data;
  },

  async deleteConsultation(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/consultations/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // WhatsApp Gateway API
  async sendPrescriptionWhatsApp(payload: {
    phone: string;
    patientName: string;
    mrn?: string;
    doctorName?: string;
    diagnosis?: string;
    medications?: any[];
    advice?: string;
    total?: number;
    pdfBase64?: string;
  }): Promise<{
    success: boolean;
    whatsappLink?: string;
    messagePreview: string;
    recipient: string;
  }> {
    const res = await fetch(`${API_BASE}/whatsapp/send-prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp message');
    return data;
  },

  async getWhatsAppStatus(): Promise<{ connected: boolean; qrAvailable: boolean }> {
    const res = await fetch(`${API_BASE}/whatsapp/status`);
    return res.json();
  },
};
