import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePayroll } from '../../context/PayrollContext';
import { api } from '../../api/client';
import {
  Clock,
  CalendarDays,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Award,
} from 'lucide-react';

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { openPayslip, addToast } = usePayroll();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>({
    casual: { total: 12, used: 2 },
    sick: { total: 10, used: 1 },
    earned: { total: 18, used: 0 },
    unpaidLwpDays: 0,
  });
  const [recentPayslip, setRecentPayslip] = useState<any | null>(null);
  const [clockLoading, setClockLoading] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial employee stats
  useEffect(() => {
    async function loadData() {
      try {
        const empId = user?.employeeId || 'EMP-1001';
        // Attendance check
        const attRecords = await api.attendance.getMe();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecord = attRecords.find((r) => r.date === todayStr);
        if (todayRecord) {
          setIsCheckedIn(true);
          setCheckInTime(todayRecord.checkIn);
          if (todayRecord.checkOut && todayRecord.checkOut !== '--:--') {
            setCheckOutTime(todayRecord.checkOut);
          }
        }

        // Leave balances
        const balances = await api.timeOff.getBalances(empId);
        if (balances) setLeaveBalance(balances);

        // Recent payslip
        const slips = await api.payslips.getAll();
        if (slips && slips.length > 0) {
          setRecentPayslip(slips[0]);
        }
      } catch {
        // Fallback to static
      }
    }
    loadData();
  }, [user]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.attendance.checkIn(user?.employeeId);
      setIsCheckedIn(true);
      setCheckInTime(res.data.checkIn);
      addToast(res.message || 'Web check-in confirmed', 'success');
    } catch (err: any) {
      addToast(err.message || 'Check-in failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await api.attendance.checkOut(user?.employeeId);
      setCheckOutTime(res.data.checkOut);
      addToast(res.message || 'Web check-out confirmed', 'success');
    } catch (err: any) {
      addToast(err.message || 'Check-out failed', 'error');
    } finally {
      setClockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EA]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">
            Welcome back, {user?.name || 'Employee'}
          </h1>
          <p className="text-xs text-[#5F6773] mt-0.5">
            {user?.department || 'Engineering'} • {user?.jobTitle || 'Associate'} • ID: {user?.employeeId || 'EMP-1001'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/employee/leave"
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-2xs"
          >
            Apply for Leave
          </Link>
        </div>
      </div>

      {/* Grid: Web Clock Console + Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clock In/Out Console */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider">Web Clock Console</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Terminal
              </span>
            </div>

            <div className="my-5 text-center">
              <div className="text-3xl font-mono font-bold tracking-tight text-[#1E242B]">{currentTime}</div>
              <div className="text-xs text-[#5F6773] mt-1">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs p-2.5 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA] mb-4">
              <div>
                <span className="text-[10px] text-[#5F6773] uppercase tracking-wider block">Check In</span>
                <span className="font-semibold text-[#1E242B]">{checkInTime || '--:--'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5F6773] uppercase tracking-wider block">Check Out</span>
                <span className="font-semibold text-[#1E242B]">{checkOutTime || '--:--'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isCheckedIn ? (
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{clockLoading ? 'Logging...' : 'Clock In Now'}</span>
              </button>
            ) : !checkOutTime ? (
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{clockLoading ? 'Logging...' : 'Clock Out (End Shift)'}</span>
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Shift Completed Today</span>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balances Summary Card */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider">Leave Entitlements</span>
              <Link to="/employee/leave" className="text-xs text-[#1B4332] font-medium hover:underline">
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
                <div className="text-[10px] text-[#5F6773] uppercase tracking-wider">Casual Leave</div>
                <div className="text-xl font-bold text-[#1E242B] mt-1">
                  {leaveBalance.casual.total - leaveBalance.casual.used}
                  <span className="text-xs font-normal text-[#5F6773]"> / {leaveBalance.casual.total}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Available</div>
              </div>

              <div className="p-3 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
                <div className="text-[10px] text-[#5F6773] uppercase tracking-wider">Sick Leave</div>
                <div className="text-xl font-bold text-[#1E242B] mt-1">
                  {leaveBalance.sick.total - leaveBalance.sick.used}
                  <span className="text-xs font-normal text-[#5F6773]"> / {leaveBalance.sick.total}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Available</div>
              </div>

              <div className="p-3 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
                <div className="text-[10px] text-[#5F6773] uppercase tracking-wider">Earned Leave</div>
                <div className="text-xl font-bold text-[#1E242B] mt-1">
                  {leaveBalance.earned.total - leaveBalance.earned.used}
                  <span className="text-xs font-normal text-[#5F6773]"> / {leaveBalance.earned.total}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Available</div>
              </div>

              <div className="p-3 rounded-lg border border-[#E3E6EA] bg-[#FBFBF9]">
                <div className="text-[10px] text-[#5F6773] uppercase tracking-wider">Unpaid (LWP)</div>
                <div className="text-xl font-bold text-amber-700 mt-1">
                  {leaveBalance.unpaidLwpDays}
                  <span className="text-xs font-normal text-[#5F6773]"> days</span>
                </div>
                <div className="text-[10px] text-amber-800 font-medium mt-0.5">Deducted</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3E6EA] text-xs text-[#5F6773] flex items-center justify-between">
            <span>Accrual cycle: 2026 Annual</span>
            <Link to="/employee/leave" className="text-[#1B4332] font-semibold hover:underline">
              Request Time Off
            </Link>
          </div>
        </div>

        {/* Latest Payslip Quick Card */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider">Latest Pay Run</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Disbursed
              </span>
            </div>

            {recentPayslip ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
                  <div className="text-xs text-[#5F6773]">Period: {recentPayslip.period}</div>
                  <div className="text-2xl font-bold text-[#1E242B] font-mono mt-1">
                    ₹{recentPayslip.netPay?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Net Take Home Pay
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#5F6773]">
                    <span>Gross Earnings:</span>
                    <span className="font-mono text-[#1E242B]">₹{recentPayslip.grossPay?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#5F6773]">
                    <span>Statutory Deductions:</span>
                    <span className="font-mono text-rose-700">₹{recentPayslip.totalDeductions?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[#5F6773]">
                    <span>Disbursement Date:</span>
                    <span className="text-[#1E242B]">{recentPayslip.payDate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#5F6773] bg-[#FBFBF9] rounded-lg">
                No payslips released yet for your profile.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E3E6EA]">
            {recentPayslip ? (
              <button
                onClick={() => openPayslip(user?.employeeId || 'EMP-1001')}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-white border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Official Payslip</span>
              </button>
            ) : (
              <Link
                to="/employee/payslips"
                className="w-full py-2 rounded-lg text-xs font-semibold text-center text-[#1B4332] hover:underline block"
              >
                Go to Payslips Archive
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Nav Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/employee/attendance"
          className="p-4 bg-white rounded-xl border border-[#E3E6EA] hover:border-[#1B4332] transition-colors shadow-2xs flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E242B]">Monthly Attendance Logs</div>
            <div className="text-[11px] text-[#5F6773]">Inspect daily timestamps, overtime, and worked hours</div>
          </div>
        </Link>

        <Link
          to="/employee/leave"
          className="p-4 bg-white rounded-xl border border-[#E3E6EA] hover:border-[#1B4332] transition-colors shadow-2xs flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E242B]">Time Off & Leave Requests</div>
            <div className="text-[11px] text-[#5F6773]">Submit time-off requests and verify approval queue</div>
          </div>
        </Link>

        <Link
          to="/employee/profile"
          className="p-4 bg-white rounded-xl border border-[#E3E6EA] hover:border-[#1B4332] transition-colors shadow-2xs flex items-center gap-3.5"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1E242B]">My Employee Record</div>
            <div className="text-[11px] text-[#5F6773]">Review PAN, PF, UAN, and verified bank credentials</div>
          </div>
        </Link>
      </div>
    </div>
  );
};
