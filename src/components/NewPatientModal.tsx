import React, { useState } from 'react';
import { api } from '../services/api';
import type { Patient } from '../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(42);
  const [gender, setGender] = useState('Female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('NKDA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || age === '') {
      setError('Please provide patient name and age.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newPatient = await api.createPatient({
        name: name.trim(),
        age: Number(age),
        gender,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        medicalHistory: medicalHistory.trim() || undefined,
        allergies: allergies.trim() || undefined,
      });

      onPatientCreated(newPatient);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg medical-panel rounded-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <i className="bi bi-person-plus-fill text-xl"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Register New Patient</h3>
              <p className="text-xs text-slate-500">Create patient file in clinic records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <i className="bi bi-exclamation-circle-fill text-rose-600 text-sm"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                required
                className="w-full px-3 py-2 rounded-xl text-xs medical-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Age <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                min={1}
                max={120}
                required
                className="w-full px-3 py-2 rounded-xl text-xs medical-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs medical-input bg-white"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl text-xs medical-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-3 py-2 rounded-xl text-xs medical-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Past Medical History</label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                rows={2}
                placeholder="e.g. Hypertension, Hypothyroidism, seasonal asthma..."
                className="w-full px-3 py-2 rounded-xl text-xs medical-input resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Drug & Food Allergies</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, or NKDA"
                className="w-full px-3 py-2 rounded-xl text-xs medical-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <i className="bi bi-person-check-fill text-sm"></i>
              <span>{isSubmitting ? 'Registering...' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
