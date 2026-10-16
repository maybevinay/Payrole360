import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Building2, ArrowLeft, Mail } from 'lucide-react';

export const AccountRejectedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#1E242B]">
      <header className="border-b border-[#E3E6EA] bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm rounded-lg shadow-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-[#1E242B]">Payroll360</span>
            <span className="text-[10px] text-[#5F6773] block leading-none mt-0.5">Account Status</span>
          </div>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1B4332] hover:text-[#2D6A4F]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#E3E6EA] rounded-xl shadow-xs p-6 sm:p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase tracking-wider mb-2">
            Status: Registration Not Approved
          </span>

          <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">
            Your registration was not approved.
          </h1>

          <p className="text-xs text-[#5F6773] mt-2 leading-relaxed">
            Your candidate onboarding request was reviewed by the Human Resources department and could not be approved at this time.
          </p>

          <div className="mt-6 p-4 rounded-lg bg-rose-50/50 border border-rose-100 text-left text-xs space-y-2">
            <div className="font-semibold text-rose-900">What should you do?</div>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Please contact the Human Resources representative assigned to your hiring requisition to clarify registration requirements or reapply if eligible.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-xs"
            >
              Return to Portal Login
            </Link>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5F6773] mt-2">
              <Mail className="w-3.5 h-3.5" />
              <span>Contact: hr-operations@company.internal</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#5F6773] border-t border-[#E3E6EA] bg-white">
        Payroll360 Enterprise Access Control
      </footer>
    </div>
  );
};
