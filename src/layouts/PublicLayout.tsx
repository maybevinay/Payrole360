import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PublicLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPortalLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'HR') return '/hr/dashboard';
    return '/employee/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1E242B] flex flex-col font-sans">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E3E6EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-[#1E242B]">Payroll360</span>
              <span className="text-[10px] text-[#5F6773] tracking-wide uppercase font-mono">Enterprise HRMS</span>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="text-xs font-medium text-[#5F6773] hover:text-[#1E242B] transition-colors"
              >
                Product
              </Link>
            )}

            {user ? (
              <Link
                to={getPortalLink()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-all shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#1E242B] hover:bg-[#F3F4F6] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md text-xs font-medium bg-[#1B4332] text-white hover:bg-[#2D6A4F] transition-all shadow-xs"
                >
                  <span>Register Employee</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3E6EA] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5F6773] gap-3">
          <p>© {new Date().getFullYear()} Payroll360 Inc. Enterprise Human Resources & Statutory Payroll Engine.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Security & Compliance</span>
            <span>•</span>
            <span>Statutory Tax Rules</span>
            <span>•</span>
            <span>Role-Based Governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
