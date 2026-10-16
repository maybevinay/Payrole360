import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Coins,
  Clock,
  UserCheck,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#FBFBF9] text-[#1E242B]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#E3E6EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1B4332]/10 text-[#1B4332] mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enterprise HRMS & Automated Payroll Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1E242B] leading-tight sm:leading-tight">
              Modern workforce operations, unified under one roof.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-[#5F6773] leading-relaxed">
              From employee self-onboarding and biometric/web attendance to Indian statutory payroll processing,
              custom salary rules, and employee self-service.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-sm transition-all"
              >
                <span>Register as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-[#1E242B] bg-white border border-[#D5D9E0] hover:bg-[#F3F4F6] transition-all"
              >
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Portals Breakdown */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-[#1E242B]">
            Engineered for every tier of your organization
          </h2>
          <p className="mt-2 text-sm text-[#5F6773]">
            Strict role-based authorization separates system governance, HR execution, and employee self-service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1E242B]">System Administrator</h3>
            <p className="mt-2 text-xs text-[#5F6773] leading-relaxed">
              Global account governance, department provisioning, security audit trails, account suspension/reactivation, and organization-wide analytics.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#3D4754]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>User account status management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Departmental cost centers & budgets</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Immutable audit & compliance logs</span>
              </li>
            </ul>
          </div>

          {/* HR Management Card */}
          <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs hover:shadow-xs transition-shadow border-t-4 border-t-[#1B4332]">
            <div className="w-10 h-10 rounded-lg bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1E242B]">HR Operations</h3>
            <p className="mt-2 text-xs text-[#5F6773] leading-relaxed">
              Centralized candidate approval queue, full employee directory CRUD, daily attendance reconciliation, leave approvals, and monthly pay runs.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#3D4754]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Pending candidate review & approval</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Statutory payroll processing engine</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Automated payslip publishing</span>
              </li>
            </ul>
          </div>

          {/* Employee Card */}
          <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#1E242B]">Employee Self-Service</h3>
            <p className="mt-2 text-xs text-[#5F6773] leading-relaxed">
              Personalized dashboard for daily web check-in/out, time-off requests, leave balance tracking, and downloading monthly payslips.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#3D4754]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Web check-in with shift counter</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Casual, sick, & earned leave balance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Print-friendly personal payslips</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick-Dock */}
      <section className="py-12 bg-white border-t border-[#E3E6EA]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-base font-semibold text-[#1E242B]">Pre-Seeded Enterprise Demo Credentials</h3>
          <p className="text-xs text-[#5F6773] mt-1 mb-6">
            Use any of the following accounts to experience specific role workflows:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
              <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Administrator</div>
              <div className="text-xs font-mono font-medium text-[#1E242B] mt-1">admin@payroll360.internal</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">Password: <span className="font-mono font-semibold">admin123</span></div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
              <div className="text-[11px] font-bold text-[#1B4332] uppercase tracking-wide">HR Manager</div>
              <div className="text-xs font-mono font-medium text-[#1E242B] mt-1">priya.verma@payroll360.internal</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">Password: <span className="font-mono font-semibold">priya123</span></div>
            </div>

            <div className="p-3.5 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Active Employee</div>
              <div className="text-xs font-mono font-medium text-[#1E242B] mt-1">rahul.sharma@payroll360.internal</div>
              <div className="text-[11px] text-[#5F6773] mt-0.5">Password: <span className="font-mono font-semibold">rahul123</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
