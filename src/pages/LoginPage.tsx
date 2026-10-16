import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ArrowRight, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusAlert, setStatusAlert] = useState<{ type: string; message: string; link?: string } | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusAlert(null);

    try {
      const user = await login(email, password);
      // Route according to user role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'HR') {
        navigate('/hr/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please verify credentials.';
      
      if (msg.includes('awaiting HR') || msg.includes('PENDING_APPROVAL')) {
        setStatusAlert({
          type: 'pending',
          message: 'Your account is awaiting HR approval.',
          link: '/pending-approval',
        });
      } else if (msg.includes('not approved') || msg.includes('REJECTED')) {
        setStatusAlert({
          type: 'rejected',
          message: 'Your registration was not approved. Please contact HR.',
          link: '/account-rejected',
        });
      } else if (msg.includes('suspended') || msg.includes('SUSPENDED')) {
        setStatusAlert({
          type: 'suspended',
          message: 'Your account has been suspended. Please contact HR.',
        });
      } else {
        setErrorMessage(msg);
      }
    }
  };

  const handleQuickFill = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setErrorMessage(null);
    setStatusAlert(null);
    try {
      const user = await login(quickEmail, quickPass);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'HR') navigate('/hr/dashboard');
      else navigate('/employee/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Quick login failed';
      if (msg.includes('awaiting HR') || msg.includes('PENDING_APPROVAL')) {
        setStatusAlert({ type: 'pending', message: 'Your account is awaiting HR approval.', link: '/pending-approval' });
      } else if (msg.includes('not approved') || msg.includes('REJECTED')) {
        setStatusAlert({ type: 'rejected', message: 'Your registration was not approved. Please contact HR.', link: '/account-rejected' });
      } else if (msg.includes('suspended') || msg.includes('SUSPENDED')) {
        setStatusAlert({ type: 'suspended', message: 'Your account has been suspended. Please contact HR.' });
      } else {
        setErrorMessage(msg);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#1E242B]">
      {/* Top Banner */}
      <header className="border-b border-[#E3E6EA] bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm rounded-lg shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#1E242B]">Payroll360</span>
            <span className="text-[10px] text-[#5F6773] block leading-none mt-0.5">Enterprise Portal</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#5F6773]">Don't have an account?</span>
          <Link
            to="/signup"
            className="font-medium text-[#1B4332] hover:text-[#2D6A4F] underline underline-offset-2"
          >
            Register as Employee
          </Link>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#E3E6EA] rounded-xl shadow-xs p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">Sign in to your account</h1>
            <p className="text-xs text-[#5F6773] mt-1">
              Enter your corporate credentials to access your designated workspace
            </p>
          </div>

          {/* Account Status Alerts */}
          {statusAlert && (
            <div className={`mb-5 p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
              statusAlert.type === 'pending'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{statusAlert.message}</div>
                {statusAlert.link && (
                  <Link to={statusAlert.link} className="inline-block mt-1 font-medium underline underline-offset-2 hover:opacity-80">
                    View account status details →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Generic Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#3D4754] mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-[#3D4754]">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#5F6773] hover:text-[#1E242B]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-[#E3E6EA]">
            <span className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2 text-center">
              Quick Test Personas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@payroll360.internal', 'admin123')}
                className="p-2 rounded border border-[#E3E6EA] hover:border-indigo-400 bg-[#FBFBF9] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-indigo-700">Administrator</div>
                <div className="text-[10px] text-[#5F6773] font-mono truncate">admin@payroll360</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('priya.verma@payroll360.internal', 'priya123')}
                className="p-2 rounded border border-[#E3E6EA] hover:border-[#1B4332] bg-[#FBFBF9] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-[#1B4332]">HR Manager</div>
                <div className="text-[10px] text-[#5F6773] font-mono truncate">priya.verma@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('rahul.sharma@payroll360.internal', 'rahul123')}
                className="p-2 rounded border border-[#E3E6EA] hover:border-emerald-500 bg-[#FBFBF9] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-emerald-700">Active Employee</div>
                <div className="text-[10px] text-[#5F6773] font-mono truncate">rahul.sharma@...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('arjun.patel@example.com', 'arjun123')}
                className="p-2 rounded border border-[#E3E6EA] hover:border-amber-500 bg-[#FBFBF9] text-left transition-colors"
              >
                <div className="text-[11px] font-bold text-amber-700">Pending Candidate</div>
                <div className="text-[10px] text-[#5F6773] font-mono truncate">arjun.patel@...</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#5F6773] border-t border-[#E3E6EA] bg-white">
        Payroll360 Enterprise Workforce Infrastructure • Encrypted 256-bit Session
      </footer>
    </div>
  );
};
