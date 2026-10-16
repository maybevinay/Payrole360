import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { User } from '../../types';
import { usePayroll } from '../../context/PayrollContext';
import {
  UserCheck,
  XCircle,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const PendingApprovalsPage: React.FC = () => {
  const { addToast } = usePayroll();
  const [candidates, setCandidates] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<User | null>(null);

  // Approve Modal State
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [targetCandidate, setTargetCandidate] = useState<User | null>(null);
  const [monthlySalary, setMonthlySalary] = useState<number>(75000);
  const [department, setDepartment] = useState<string>('Engineering');
  const [jobTitle, setJobTitle] = useState<string>('Associate');
  const [employmentType, setEmploymentType] = useState<string>('Full-Time');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Position requirements not met for current requisition.');

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const data = await api.hr.getPendingApprovals();
      setCandidates(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch pending candidate registrations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openApproveModal = (cand: User) => {
    setTargetCandidate(cand);
    setDepartment(cand.department || 'Engineering');
    setJobTitle(cand.jobTitle || 'Associate');
    setMonthlySalary(75000);
    setApproveModalOpen(true);
  };

  const handleApprove = async () => {
    if (!targetCandidate) return;
    setIsProcessing(true);
    try {
      const res = await api.hr.approveRegistration(targetCandidate.id, {
        monthlySalary,
        department,
        jobTitle,
        employmentType,
      });
      addToast(res.message || `Candidate approved as ${res.data?.employeeId}`, 'success');
      setApproveModalOpen(false);
      fetchPending();
    } catch (err: any) {
      addToast(err.message || 'Approval failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (cand: User) => {
    setTargetCandidate(cand);
    setRejectReason('Position requirements not met for current requisition.');
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!targetCandidate) return;
    setIsProcessing(true);
    try {
      const res = await api.hr.rejectRegistration(targetCandidate.id, rejectReason);
      addToast(res.message || 'Candidate registration rejected', 'info');
      setRejectModalOpen(false);
      fetchPending();
    } catch (err: any) {
      addToast(err.message || 'Rejection failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EA]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">Candidate Approval Center</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {candidates.length} Pending
            </span>
          </div>
          <p className="text-xs text-[#5F6773] mt-1">
            Review applicant submissions, assign Employee IDs and compensation structures, or decline unaligned submissions.
          </p>
        </div>

        <button
          onClick={fetchPending}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#D5D9E0] text-[#3D4754] hover:bg-[#F3F4F6] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Table / Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-12 text-center text-xs text-[#5F6773]">
          <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading candidate submissions...
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#1E242B]">All registrations reviewed</h3>
          <p className="text-xs text-[#5F6773] mt-1 max-w-sm mx-auto">
            There are currently no new employee registrations awaiting HR verification. New applicant submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E3E6EA] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E3E6EA] text-[#5F6773] font-semibold">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EA]">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1E242B]">{cand.name}</div>
                      <div className="text-[11px] text-[#5F6773]">{cand.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6773]">
                      <div>{cand.phone || '—'}</div>
                      <div className="text-[10px] text-[#8A94A6] truncate max-w-[140px]">{cand.address || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1E242B]">
                      {cand.jobTitle || 'Associate'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#3D4754]">
                        {cand.department || 'Engineering'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" />
                        <span>Pending Approval</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCandidate(cand)}
                        title="View Full Profile"
                        className="px-2.5 py-1 rounded bg-[#F3F4F6] text-[#3D4754] hover:bg-[#E5E7EB] font-medium text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => openApproveModal(cand)}
                        className="px-2.5 py-1 rounded bg-[#1B4332] text-white hover:bg-[#2D6A4F] font-medium text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => openRejectModal(cand)}
                        className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-medium text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Reject</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E3E6EA] shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#E3E6EA]">
              <div>
                <h3 className="text-base font-bold text-[#1E242B]">{selectedCandidate.name}</h3>
                <p className="text-xs text-[#5F6773]">Candidate Application Summary</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-[#8A94A6] hover:text-[#1E242B] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Email</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Phone</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.phone || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Department</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.department || '—'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Designation</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.jobTitle || '—'}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Date of Birth</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.dateOfBirth || '—'}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                <span className="text-[10px] text-[#5F6773] block uppercase tracking-wider">Address</span>
                <span className="font-semibold text-[#1E242B]">{selectedCandidate.address || '—'}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E3E6EA]">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5F6773] hover:bg-[#F3F4F6]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const cand = selectedCandidate;
                  setSelectedCandidate(null);
                  openApproveModal(cand);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#1B4332] text-white hover:bg-[#2D6A4F]"
              >
                Proceed to Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation & Compensation Setup Modal */}
      {approveModalOpen && targetCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E3E6EA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="pb-3 border-b border-[#E3E6EA]">
              <h3 className="text-base font-bold text-[#1E242B]">Approve Employee Registration</h3>
              <p className="text-xs text-[#5F6773] mt-0.5">
                Assign compensation and finalize profile for <strong>{targetCandidate.name}</strong>.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-[#3D4754] mb-1">Monthly Base Gross Salary (INR) *</label>
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none font-mono"
                />
                <span className="text-[10px] text-[#5F6773] mt-0.5 block">
                  Annual CTC: ₹{(monthlySalary * 12).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block font-medium text-[#3D4754] mb-1">Confirmed Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none bg-white"
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
                <label className="block font-medium text-[#3D4754] mb-1">Official Designation Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#3D4754] mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none bg-white"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E6EA]">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#5F6773] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                {isProcessing ? 'Activating...' : 'Confirm & Activate Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && targetCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E3E6EA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="pb-3 border-b border-[#E3E6EA]">
              <h3 className="text-base font-bold text-rose-800">Decline Candidate Registration</h3>
              <p className="text-xs text-[#5F6773] mt-0.5">
                Provide a reason for declining <strong>{targetCandidate.name}</strong>.
              </p>
            </div>

            <div className="text-xs">
              <label className="block font-medium text-[#3D4754] mb-1">Rejection Justification *</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
              <span className="text-[10px] text-[#5F6773] mt-1 block">
                This notice will be displayed to the applicant if they attempt to sign in.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E6EA]">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#5F6773] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 shadow-xs"
              >
                {isProcessing ? 'Rejecting...' : 'Reject Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
