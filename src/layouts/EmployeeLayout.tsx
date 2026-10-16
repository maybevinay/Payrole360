import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarDays,
  FileText,
  Bell,
  LogOut,
  Building2,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ToastContainer } from '../components/common/ToastContainer';
import { PayslipModal } from '../components/payroll/PayslipModal';

export const EmployeeLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/employee/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { path: '/employee/profile', label: 'My Profile', icon: User },
    { path: '/employee/attendance', label: 'My Attendance & Clock', icon: Clock },
    { path: '/employee/leave', label: 'My Time Off & Leaves', icon: CalendarDays },
    { path: '/employee/payslips', label: 'My Payslips', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1E242B] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E3E6EA]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#1B4332] flex items-center justify-center text-white font-bold text-xs">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-[#1E242B]">Employee Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-[#5F6773] hover:text-[#1E242B] rounded"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Employee Sidebar */}
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
              <div className="text-[10px] uppercase font-mono text-[#2D6A4F] font-semibold">Self-Service Portal</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-[#F4F6F8] mx-3 my-3 rounded-lg border border-[#E3E6EA]/60 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#1B4332]" />
          <div className="text-[11px] leading-tight text-[#3D4754]">
            ID: <span className="font-mono font-semibold text-[#1E242B]">{user?.employeeId || 'EMP-Active'}</span>
            <div className="text-[10px] text-[#5F6773]">{user?.department || 'Engineering'}</div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#8A94A6]">
            Employee Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
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
                {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />}
              </Link>
            );
          })}
        </nav>

        {/* Profile Card & Logout */}
        <div className="p-3 border-t border-[#E3E6EA] bg-[#FBFBF9]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E3E6EA] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name[0].toUpperCase() : 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-[#1E242B] truncate">{user?.name}</div>
                <div className="text-[10px] text-[#5F6773] truncate">{user?.email}</div>
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <PayslipModal />
      <ToastContainer />
    </div>
  );
};
