import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Employee } from '../../types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export const EmployeeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const empId = user?.employeeId || 'EMP-1001';
        const emp = await api.employees.getById(empId);
        setEmployee(emp);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#E3E6EA] p-12 text-center text-xs text-[#5F6773]">
        <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading your employee profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {employee?.avatarInitials || (user?.name ? user.name[0] : 'E')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">
                  {employee?.name || user?.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {employee?.employmentStatus || 'Active'}
                </span>
              </div>
              <p className="text-xs text-[#5F6773] mt-0.5">
                {employee?.jobTitle || 'Associate'} • {employee?.department || 'Engineering'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#5F6773] mt-1 font-mono">
                <span>ID: {employee?.id || user?.employeeId || 'EMP-1001'}</span>
                <span>•</span>
                <span>Joined: {employee?.joinedDate || '2023-04-15'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1E242B] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#1B4332]" />
            <span>Personal Particulars</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773] flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Work Email
              </span>
              <span className="font-semibold text-[#1E242B]">{employee?.email || user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773] flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Contact Phone
              </span>
              <span className="font-semibold text-[#1E242B]">{employee?.phone || user?.phone || '+91 98765 43210'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Base Location
              </span>
              <span className="font-semibold text-[#1E242B]">{employee?.location || 'Bengaluru'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773] flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> Employment Type
              </span>
              <span className="font-semibold text-[#1E242B]">{employee?.employmentType || 'Full-Time'}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#5F6773] flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Reporting Manager
              </span>
              <span className="font-semibold text-[#1E242B]">{employee?.manager || 'Vikram Malhotra'}</span>
            </div>
          </div>
        </div>

        {/* Banking & Statutory Details */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-[#1E242B] uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1B4332]" />
            <span>Banking & Statutory Identifiers</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773]">Bank Name</span>
              <span className="font-semibold text-[#1E242B]">
                {employee?.bankDetails?.bankName || 'HDFC Bank Ltd'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773]">Account Number</span>
              <span className="font-mono font-semibold text-[#1E242B]">
                {employee?.bankDetails?.accountNumber || '91802001928374'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773]">IFSC Code</span>
              <span className="font-mono font-semibold text-[#1E242B]">
                {employee?.bankDetails?.ifscCode || 'HDFC0000456'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773]">Permanent Account Number (PAN)</span>
              <span className="font-mono font-semibold text-[#1E242B]">{employee?.panNumber || 'ABCPS1234D'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#E3E6EA]/60">
              <span className="text-[#5F6773]">Provident Fund (PF) No.</span>
              <span className="font-mono font-semibold text-[#1E242B]">{employee?.pfNumber || 'MH/BAN/0045612/000/1001'}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#5F6773]">Universal Account Number (UAN)</span>
              <span className="font-mono font-semibold text-[#1E242B]">{employee?.uan || '100904561234'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
