import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, ArrowRight, User, Mail, Lock, Phone, Briefcase, Calendar, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    try {
      await register({
        name: fullName,
        email,
        password,
        phone,
        department,
        jobTitle: jobTitle || 'Associate',
        dateOfBirth,
        address,
      });

      // Redirect to the pending approval holding screen
      navigate('/pending-approval');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
            <span className="text-[10px] text-[#5F6773] block leading-none mt-0.5">Candidate Registration</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#5F6773]">Already registered?</span>
          <Link
            to="/login"
            className="font-medium text-[#1B4332] hover:text-[#2D6A4F] underline underline-offset-2"
          >
            Sign In Here
          </Link>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-2xl bg-white border border-[#E3E6EA] rounded-xl shadow-xs p-6 sm:p-8">
          <div className="mb-6 pb-4 border-b border-[#E3E6EA]">
            <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">Employee Onboarding Registration</h1>
            <p className="text-xs text-[#5F6773] mt-1">
              Submit your employment information for HR review. Once verified and approved, your employee portal will be activated.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Corporate / Contact Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.internal"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Contact Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Department Preference *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] bg-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="Product">Product</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Designation / Role Title *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Residential Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat 402, Green Glen Layout, Bellandur, Bengaluru"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Create Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#3D4754] mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A94A6] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D5D9E0] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Registration for HR Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#5F6773] border-t border-[#E3E6EA] bg-white">
        Payroll360 Enterprise Onboarding Gateway
      </footer>
    </div>
  );
};
