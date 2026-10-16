import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PayrollProvider } from './context/PayrollContext';

// Layouts & Route Protection
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { HRLayout } from './layouts/HRLayout';
import { EmployeeLayout } from './layouts/EmployeeLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Public & Auth Pages
import { LandingPage } from './pages/auth/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';
import { AccountRejectedPage } from './pages/auth/AccountRejectedPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';

// HR Pages
import { DashboardPage as HRDashboardPage } from './pages/DashboardPage';
import { PendingApprovalsPage } from './pages/hr/PendingApprovalsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { AttendancePage } from './pages/AttendancePage';
import { TimeOffPage } from './pages/TimeOffPage';
import { PayRunsPage } from './pages/PayRunsPage';
import { PayslipsPage } from './pages/PayslipsPage';
import { SalaryRulesPage } from './pages/SalaryRulesPage';
import { ReportsPage } from './pages/ReportsPage';

// Employee Pages
import { EmployeeDashboardPage } from './pages/employee/EmployeeDashboardPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';
import { EmployeeAttendancePage } from './pages/employee/EmployeeAttendancePage';
import { EmployeeLeavePage } from './pages/employee/EmployeeLeavePage';
import { EmployeePayslipsPage } from './pages/employee/EmployeePayslipsPage';

// Wrapper for parameterized Employee Detail View
const EmployeeDetailRouteWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <EmployeeDetailPage
      employeeId={id || 'EMP-1001'}
      onBack={() => navigate('/hr/employees')}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PayrollProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/account-rejected" element={<AccountRejectedPage />} />
            </Route>

            {/* Direct Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />

            {/* Administrator Portal Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="departments" element={<AdminUsersPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="logs" element={<AdminLogsPage />} />
              <Route path="settings" element={<AdminDashboardPage />} />
            </Route>

            {/* HR Operations Portal Routes */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                  <HRLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="dashboard" element={<HRDashboardPage />} />
              <Route path="pending-approvals" element={<PendingApprovalsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="employees/:id" element={<EmployeeDetailRouteWrapper />} />
              <Route path="departments" element={<EmployeesPage />} />
              <Route path="contracts" element={<EmployeesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="timeoff" element={<TimeOffPage />} />
              <Route path="payroll" element={<PayRunsPage />} />
              <Route path="payslips" element={<PayslipsPage />} />
              <Route path="salary-rules" element={<SalaryRulesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="documents" element={<ReportsPage />} />
              <Route path="notifications" element={<PendingApprovalsPage />} />
            </Route>

            {/* Employee Self-Service Portal Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEE', 'HR', 'ADMIN']}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboardPage />} />
              <Route path="profile" element={<EmployeeProfilePage />} />
              <Route path="attendance" element={<EmployeeAttendancePage />} />
              <Route path="leave" element={<EmployeeLeavePage />} />
              <Route path="apply-leave" element={<EmployeeLeavePage />} />
              <Route path="payslips" element={<EmployeePayslipsPage />} />
              <Route path="documents" element={<EmployeeProfilePage />} />
              <Route path="notifications" element={<EmployeeDashboardPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PayrollProvider>
    </AuthProvider>
  );
}
