import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface LoginViewProps {
  onLoginSuccess: (doctor: { name: string; email: string; role: string; clinic: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('dr.priya@clinic.com');
  const [password, setPassword] = useState('doctor123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Credentials Required',
        text: 'Please enter your physician email and password.',
        confirmButtonColor: '#0284c7',
      });
      return;
    }

    Swal.fire({
      title: 'Verifying Credentials...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setTimeout(() => {
      Swal.close();
      const doctor = {
        name: email.toLowerCase().includes('priya') ? 'Dr. Priya MD' : 'Dr. Alexander Reed MD',
        email: email.trim(),
        role: 'Attending Physician & Clinical Specialist',
        clinic: 'St. Jude Metropolitan Clinic',
      };

      Swal.fire({
        icon: 'success',
        title: 'Welcome, ' + doctor.name,
        text: 'Access granted to Smart Clinical Documentation Studio.',
        timer: 1500,
        showConfirmButton: false,
      });

      onLoginSuccess(doctor);
    }, 600);
  };

  const handleQuickDemoLogin = (doctorName: string, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('doctor123');
    Swal.fire({
      icon: 'success',
      title: `Welcome, ${doctorName}`,
      text: 'Quick demo login successful.',
      timer: 1200,
      showConfirmButton: false,
    });
    onLoginSuccess({
      name: doctorName,
      email: demoEmail,
      role: 'Attending Physician',
      clinic: 'St. Jude Metropolitan Clinic',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Clinic Brand Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md mb-4">
          <i className="bi bi-heart-pulse-fill text-3xl"></i>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Physician Portal Login
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Smart Clinical Documentation & Medical Coding Assistant
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="medical-card bg-white py-8 px-6 shadow-sm rounded-3xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physician Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-envelope text-sm"></i>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  className="pl-10 pr-3 py-2.5 w-full text-xs medical-input rounded-xl"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <i className="bi bi-shield-lock text-sm"></i>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 py-2.5 w-full text-xs medical-input rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-sm`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>Remember session</span>
              </label>

              <span className="text-sky-700 hover:text-sky-800 font-semibold cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <i className="bi bi-box-arrow-in-right text-sm"></i>
              <span>Sign In to Clinical Studio</span>
            </button>
          </form>

          {/* Quick Demo Logins for Fast Access */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              ⚡ 1-Click Quick Demo Accounts
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Dr. Priya MD', 'dr.priya@clinic.com')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px]">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dr. Priya MD</p>
                    <p className="text-[10px] text-slate-500">Chief Physician</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('Dr. Alexander Reed MD', 'alex.reed@clinic.com')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-left transition-all"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Dr. Reed MD</p>
                    <p className="text-[10px] text-slate-500">General Practice</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & HIPAA Compliance Notice */}
        <p className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
          <i className="bi bi-shield-check text-emerald-600"></i>
          <span>Secure Clinical Access • Encrypted Medical Documentation</span>
        </p>
      </div>
    </div>
  );
};
