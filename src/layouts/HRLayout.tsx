import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePayroll } from '../context/PayrollContext';
import { api } from '../api/client';
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Clock,
  CalendarDays,
  Coins,
  FileText,
  Sliders,
  BarChart3,
  FileBox,
  Bell,
  Menu,
  X,
  Building2,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';
import { PayslipModal } from '../components/payroll/PayslipModal';

export const HRLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { pendingLeavesCount, unresolvedAttendanceCount, missingBankCount } = usePayroll();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const pending = await api.hr.getPendingApprovals();
        setPendingApprovalsCount(pending.length);
      } catch {
        // Fallback
      }
    }
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      path: '/hr/dashboard',
      label: 'HR Overview',
      icon: LayoutDashboard,
    },
    {
      path: '/hr/pending-approvals',
      label: 'Pending Approvals',
      icon: UserCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      path: '/hr/employees',
      label: 'Employee Directory',
      icon: Users,
    },
    {
      path: '/hr/attendance',
      label: 'Attendance Monitor',
      icon: Clock,
      badge: unresolvedAttendanceCount > 0 ? unresolvedAttendanceCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      path: '/hr/timeoff',
      label: 'Leave Requests',
      icon: CalendarDays,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      path: '/hr/payroll',
      label: 'Payroll Processing',
      icon: Coins,
      badge: missingBankCount > 0 ? missingBankCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      path: '/hr/payslips',
      label: 'Payslip Directory',
      icon: FileText,
    },
    {
      path: '/hr/salary-rules',
      label: 'Salary Structures',
      icon: Sliders,
    },
    {
      path: '/hr/reports',
      label: 'Compliance Reports',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1E242B] flex flex-col md:flex-row antialiased">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E3E6EA]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#1B4332] flex items-center justify-center text-white font-bold text-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#1E242B]">Payroll360 HR</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-[#5F6773] hover:text-[#1E242B] rounded"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* HR Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E3E6EA] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#E3E6EA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[#1E242B]">Payroll360</div>
              <div className="text-[10px] uppercase font-mono text-[#2D6A4F] font-semibold">HR Operations Portal</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8A94A6]">
            People Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#1B4332] text-white shadow-xs'
                    : 'text-[#3D4754] hover:bg-[#F3F4F6] hover:text-[#1E242B]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-[#5F6773]'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-amber-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* HR Profile & Logout */}
        <div className="p-3 border-t border-[#E3E6EA] bg-[#FBFBF9]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E3E6EA] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'H'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[#1E242B] truncate">{user?.name}</div>
                <div className="text-[10px] text-[#5F6773] truncate">HR Specialist</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 text-[#5F6773] hover:text-rose-600 transition-colors rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <PayslipModal />
      <ToastContainer />
    </div>
  );
};
