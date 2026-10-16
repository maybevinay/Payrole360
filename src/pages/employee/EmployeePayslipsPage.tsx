import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePayroll } from '../../context/PayrollContext';
import { api } from '../../api/client';
import { Payslip } from '../../types';
import { FileText, Download, Eye, Calendar, Building2, RefreshCw } from 'lucide-react';

export const EmployeePayslipsPage: React.FC = () => {
  const { user } = useAuth();
  const { openPayslip, addToast } = usePayroll();

  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      const data = await api.payslips.getAll();
      setPayslips(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch personal payslips', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E6EA]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E242B]">My Payslips Archive</h1>
          <p className="text-xs text-[#5F6773] mt-0.5">
            Access itemized monthly salary compensation statements, statutory deductions, and tax withholding slips.
          </p>
        </div>

        <button
          onClick={fetchPayslips}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-[#D5D9E0] text-[#3D4754] hover:bg-[#F3F4F6]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Grid or Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-12 text-center text-xs text-[#5F6773]">
          <div className="w-5 h-5 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your personal payslips...
        </div>
      ) : payslips.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3E6EA] p-12 text-center text-xs text-[#5F6773]">
          <FileText className="w-8 h-8 text-[#8A94A6] mx-auto mb-2" />
          <h3 className="font-semibold text-[#1E242B] text-sm">No payslips available</h3>
          <p className="mt-1">Payslips will appear here once monthly payroll runs are validated and finalized by HR.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E3E6EA] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E3E6EA] text-[#5F6773] font-semibold">
                <tr>
                  <th className="py-3 px-4">Pay Period</th>
                  <th className="py-3 px-4">Disbursement Date</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EA]">
                {payslips.map((ps) => (
                  <tr key={ps.id} className="hover:bg-[#FBFBF9] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#1E242B]">
                      {ps.period}
                    </td>
                    <td className="py-3.5 px-4 text-[#5F6773] font-mono">{ps.payDate}</td>
                    <td className="py-3.5 px-4 font-mono text-[#3D4754]">₹{ps.grossPay?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-700">₹{ps.totalDeductions?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1B4332] text-sm">
                      ₹{ps.netPay?.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Paid & Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openPayslip(user?.employeeId || 'EMP-1001')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
