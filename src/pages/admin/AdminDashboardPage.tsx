import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { usePayroll } from '../../context/PayrollContext';
import {
  ShieldCheck,
  Users,
  Building2,
  Coins,
  Activity,
  UserPlus,
  RefreshCw,
  Server,
  Lock,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { addToast } = usePayroll();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New HR User Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPassword, setHrPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.admin.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      addToast(err.message || 'Failed to load system analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCreateHr = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.admin.createHrUser({
        name: hrName,
        email: hrEmail,
        password: hrPassword,
      });
      addToast(res.message || 'HR Account provisioned successfully', 'success');
      setModalOpen(false);
      setHrName('');
      setHrEmail('');
      setHrPassword('');
      fetchAnalytics();
    } catch (err: any) {
      addToast(err.message || 'HR provisioning failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Platform Governance Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            System-wide operational oversight, role permissions, infrastructure status, and administrator controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Provision HR Account</span>
          </button>
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {analytics?.totalUsers ?? '—'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">
            {analytics?.activeUsers ?? 0} Active accounts
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Approvals</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {analytics?.pendingUsers ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting HR verification</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Suspended Accounts</span>
            <Lock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
            {analytics?.suspendedUsers ?? '—'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Access suspended</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Database Engine</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-white mt-2 font-mono">
            Operational
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Uptime: {analytics?.systemHealth ? `${Math.floor(analytics.systemHealth.uptime / 60)} mins` : 'Active'}
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Roster */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Department Headcount Distribution
          </h2>
          <div className="space-y-2.5 text-xs">
            {analytics?.departmentCounts?.map((d: any) => (
              <div key={d.department} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50">
                <span className="font-medium text-slate-200">{d.department}</span>
                <span className="font-mono px-2 py-0.5 rounded bg-slate-700 text-indigo-300 font-bold">
                  {d.count} employees
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            User Roles Breakdown
          </h2>
          <div className="space-y-2.5 text-xs">
            {analytics?.roleDistribution?.map((r: any) => (
              <div key={r.role} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/50">
                <span className="font-medium text-slate-200">{r.role}</span>
                <span className="font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                  {r.count} users
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provision HR Account Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Provision HR Administrator</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateHr} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  placeholder="e.g. Priya Verma"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  value={hrEmail}
                  onChange={(e) => setHrEmail(e.target.value)}
                  placeholder="e.g. priya.verma@payroll360.internal"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={hrPassword}
                  onChange={(e) => setHrPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Provision HR Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
