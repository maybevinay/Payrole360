import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePayroll } from '../../context/PayrollContext';
import { api } from '../../api/client';
import { AttendanceRecord } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Calendar, RefreshCw } from 'lucide-react';

export const EmployeeAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = usePayroll();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const data = await api.attendance.getMe();
      setRecords(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch attendance logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = records.find((r) => r.date === todayStr);

  const handleCheckIn = async () => {
    setIsClocking(true);
    try {
      const res = await api.attendance.checkIn(user?.employeeId);
      addToast(res.message || 'Check-in registered successfully', 'success');
      fetchAttendance();
    } catch (err: any) {
      addToast(err.message || 'Check-in failed', 'error');
    } finally {
      setIsClocking(false);
    }
  };

  const handleCheckOut = async () => {
    setIsClocking(true);
    try {
      const res = await api.attendance.checkOut(user?.employeeId);
      addToast(res.message || 'Check-out registered successfully', 'success');
      fetchAttendance();
    } catch (err: any) {
      addToast(err.message || 'Check-out failed', 'error');
    } finally {
      setIsClocking(false);
    }
  };

  // Stats
  const presentDays = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const lateDays = records.filter((r) => r.status === 'Late').length;
  const totalHours = records.reduce((acc, curr) => acc + (curr.workedHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EA]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">Attendance & Timesheet Console</h1>
          <p className="text-xs text-[#5F6773] mt-0.5">
            Log your daily shift timestamps and track verified worked hours for payroll reconciliation.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#D5D9E0] text-[#3D4754] hover:bg-[#F3F4F6]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Clock Action Dock & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Shift Action */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#1E242B]">Today's Shift Status</span>
            <span className="text-xs font-mono text-[#5F6773]">{todayStr}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="p-3 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
              <span className="text-[10px] text-[#5F6773] uppercase tracking-wider block">Checked In At</span>
              <span className="text-base font-bold text-[#1E242B] font-mono mt-0.5 block">
                {todayRecord?.checkIn || '--:--'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#FBFBF9] border border-[#E3E6EA]">
              <span className="text-[10px] text-[#5F6773] uppercase tracking-wider block">Checked Out At</span>
              <span className="text-base font-bold text-[#1E242B] font-mono mt-0.5 block">
                {todayRecord?.checkOut || '--:--'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!todayRecord ? (
              <button
                onClick={handleCheckIn}
                disabled={isClocking}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Clock In for Today</span>
              </button>
            ) : !todayRecord.checkOut || todayRecord.checkOut === '--:--' ? (
              <button
                onClick={handleCheckOut}
                disabled={isClocking}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Clock Out (End Shift)</span>
              </button>
            ) : (
              <div className="w-full py-2 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                Shift completed: {todayRecord.workedHours} hrs logged
              </div>
            )}
          </div>
        </div>

        {/* Total Present Days */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider">Days Logged</span>
          <div className="my-2">
            <div className="text-3xl font-bold text-[#1E242B]">{presentDays}</div>
            <div className="text-xs text-emerald-700 font-medium mt-0.5">Present / Reconciled</div>
          </div>
          <div className="text-[11px] text-[#5F6773]">Includes {lateDays} late check-ins</div>
        </div>

        {/* Total Working Hours */}
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-5 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#5F6773] uppercase tracking-wider">Total Worked</span>
          <div className="my-2">
            <div className="text-3xl font-bold text-[#1E242B]">{totalHours.toFixed(1)}</div>
            <div className="text-xs text-[#5F6773] font-medium mt-0.5">Hours Accumulated</div>
          </div>
          <div className="text-[11px] text-[#5F6773]">Target: ~176.0 hrs/month</div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-xl border border-[#E3E6EA] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#E3E6EA] flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#1E242B] uppercase tracking-wider">Attendance Log History</h2>
          <span className="text-xs text-[#5F6773]">{records.length} Recorded Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] border-b border-[#E3E6EA] text-[#5F6773] font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E6EA]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#FBFBF9] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#1E242B] font-mono">{r.date}</td>
                  <td className="py-3 px-4 text-[#3D4754] font-mono">{r.checkIn}</td>
                  <td className="py-3 px-4 text-[#3D4754] font-mono">{r.checkOut || '--:--'}</td>
                  <td className="py-3 px-4 text-[#1E242B] font-semibold">{r.workedHours} hrs</td>
                  <td className="py-3 px-4 text-[#5F6773]">{r.overtimeHours ? `+${r.overtimeHours} hrs` : '0 hrs'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'Late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
