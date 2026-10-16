import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePayroll } from '../../context/PayrollContext';
import { api } from '../../api/client';
import { TimeOffRequest, LeaveType } from '../../types';
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

import { getTodayDateString, calculateLeaveDays } from '../../utils/formatters';

export const EmployeeLeavePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = usePayroll();

  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [balances, setBalances] = useState<any>({
    casual: { total: 12, used: 2 },
    sick: { total: 10, used: 1 },
    earned: { total: 18, used: 0 },
    unpaidLwpDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Apply Modal
  const today = getTodayDateString();
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    let nextEndDate = endDate;
    if (!endDate || endDate < val) {
      nextEndDate = val;
      setEndDate(val);
    }
    const computed = calculateLeaveDays(val, nextEndDate);
    setDays(computed > 0 ? computed : 1);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    if (startDate) {
      const computed = calculateLeaveDays(startDate, val);
      setDays(computed > 0 ? computed : 1);
    }
  };

  const handleOpenModal = () => {
    const curToday = getTodayDateString();
    setStartDate(curToday);
    setEndDate(curToday);
    setDays(1);
    setReason('');
    setModalOpen(true);
  };

  const fetchLeaveData = async () => {
    setIsLoading(true);
    try {
      const empId = user?.employeeId || 'EMP-1001';
      const res = await api.timeOff.getAll();
      setRequests(res.requests);
      if (res.balances && res.balances[empId]) {
        setBalances(res.balances[empId]);
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch leave data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      addToast('Please select valid start and end dates', 'error');
      return;
    }

    if (startDate < today) {
      addToast('Leave cannot be applied for past dates. Please select today or a future date.', 'error');
      return;
    }

    if (endDate < startDate) {
      addToast('End date cannot be prior to start date.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.timeOff.request({
        employeeId: user?.employeeId,
        leaveType,
        startDate,
        endDate,
        days: Number(days),
        reason,
      });

      addToast('Leave request submitted successfully', 'success');
      setModalOpen(false);
      setReason('');
      fetchLeaveData();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit leave request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EA]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">Time Off & Leave Management</h1>
          <p className="text-xs text-[#5F6773] mt-0.5">
            Monitor available quotas, apply for leave, and view approval status from HR.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider block">Casual Leave</span>
          <div className="text-2xl font-bold text-[#1E242B] mt-2">
            {balances.casual.total - balances.casual.used}
            <span className="text-xs font-normal text-[#5F6773]"> / {balances.casual.total}</span>
          </div>
          <div className="text-[11px] text-[#5F6773] mt-1">{balances.casual.used} days consumed</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider block">Sick Leave</span>
          <div className="text-2xl font-bold text-[#1E242B] mt-2">
            {balances.sick.total - balances.sick.used}
            <span className="text-xs font-normal text-[#5F6773]"> / {balances.sick.total}</span>
          </div>
          <div className="text-[11px] text-[#5F6773] mt-1">{balances.sick.used} days consumed</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider block">Earned Leave</span>
          <div className="text-2xl font-bold text-[#1E242B] mt-2">
            {balances.earned.total - balances.earned.used}
            <span className="text-xs font-normal text-[#5F6773]"> / {balances.earned.total}</span>
          </div>
          <div className="text-[11px] text-[#5F6773] mt-1">{balances.earned.used} days consumed</div>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider block">Unpaid Leave (LWP)</span>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {balances.unpaidLwpDays}
            <span className="text-xs font-normal text-[#5F6773]"> days</span>
          </div>
          <div className="text-[11px] text-amber-800 mt-1">Deducted from payroll</div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-[#E3E6EA] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E3E6EA] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#1E242B] uppercase tracking-wider">Leave Applications History</h2>
          <span className="text-xs text-[#5F6773]">{requests.length} Requests</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E3E6EA] text-[#5F6773] font-semibold">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">End Date</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EA]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#5F6773]">
                    No leave requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1E242B]">{r.leaveType}</td>
                    <td className="py-3 px-4 font-mono text-[#5F6773]">{r.startDate}</td>
                    <td className="py-3 px-4 font-mono text-[#5F6773]">{r.endDate}</td>
                    <td className="py-3 px-4 font-semibold text-[#1E242B]">{r.days} day(s)</td>
                    <td className="py-3 px-4 text-[#5F6773] max-w-xs truncate">{r.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {r.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {r.status === 'Refused' && <XCircle className="w-3 h-3" />}
                        <span>{r.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#E3E6EA] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6EA]">
              <h3 className="text-base font-bold text-[#1E242B]">Apply for Time Off</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#8A94A6] hover:text-[#1E242B]">
                ✕
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs">
            {/* Quota indicator */}
            {(() => {
              const quotaRemaining =
                leaveType === 'Casual Leave'
                  ? balances.casual.total - balances.casual.used
                  : leaveType === 'Sick Leave'
                  ? balances.sick.total - balances.sick.used
                  : leaveType === 'Earned Leave'
                  ? balances.earned.total - balances.earned.used
                  : null;

              return (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-medium text-[#3D4754]">Leave Category *</label>
                    {quotaRemaining !== null && (
                      <span className={`text-[11px] font-semibold ${quotaRemaining >= days ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {quotaRemaining} day{quotaRemaining === 1 ? '' : 's'} available
                      </span>
                    )}
                  </div>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none bg-white"
                  >
                    <option value="Casual Leave">Casual Leave (Paid Statutory)</option>
                    <option value="Sick Leave">Sick Leave (Medical Certificate)</option>
                    <option value="Earned Leave">Earned / Privilege Leave</option>
                    <option value="Unpaid Leave (LWP)">Unpaid Leave (LWP - Pro-rata Pay Deduction)</option>
                  </select>
                </div>
              );
            })()}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#3D4754] mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  min={today}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none"
                />
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">Today or future date</span>
              </div>
              <div>
                <label className="block font-medium text-[#3D4754] mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none"
                />
                <span className="text-[10px] text-[#8A94A6] block mt-0.5">On or after start date</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-[#3D4754]">Calculated Working Days *</label>
                <span className="text-[10px] text-[#5F6773]">Excludes weekends (Sat & Sun)</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  max="60"
                  required
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full pl-3 pr-14 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none font-bold text-[#1B4332] bg-[#FBFBF9]"
                />
                <span className="absolute right-3 top-2 text-[11px] font-medium text-[#5F6773] pointer-events-none">
                  {days === 1 ? 'day' : 'days'}
                </span>
              </div>
              {startDate && endDate && (
                <div className="text-[11px] text-[#5F6773] mt-1 flex items-center justify-between">
                  <span>Selected Range: {startDate} to {endDate}</span>
                  <span className="font-semibold text-[#1B4332]">
                    {days} working day{days > 1 ? 's' : ''} to deduct
                  </span>
                </div>
              )}
            </div>

              <div>
                <label className="block font-medium text-[#3D4754] mb-1">Reason / Justification *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide concise reason for time off request..."
                  className="w-full px-3 py-2 rounded-lg border border-[#D5D9E0] focus:ring-1 focus:ring-[#1B4332] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E3E6EA]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5F6773] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
