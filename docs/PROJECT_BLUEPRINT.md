# Payroll360 — Project Blueprint & Technical Specification

> **Version:** 1.0.0  
> **Target Environment:** Node.js, Express, MongoDB/Mongoose, React 19, Vite, Tailwind CSS  
> **Document Status:** Baseline Architecture Reference  

---

## 1. Product Overview

**Payroll360** is a comprehensive, enterprise-ready Human Resources and Automated Payroll Management platform designed to streamline the complete employee lifecycle. From candidate onboarding and self-service registration to biometric/web attendance tracking, multi-tier leave administration, statutory payroll processing, automated payslip distribution, and high-level organizational analytics, Payroll360 centralizes enterprise workforce operations into a single, cohesive, secure SaaS application.

### Key Value Propositions
- **Unified Employee Lifecycle:** Smooth transition from self-registration to HR verification, active employment, and eventual offboarding.
- **Role-Gated Portals:** Tailored user experiences for System Administrators, HR Managers, and Employees.
- **Accurate Statutory Payroll Engine:** Automated calculations for Indian and global salary components: Basic, HRA, Special Allowances, Provident Fund (PF), Professional Tax (PT), Tax Deducted at Source (TDS), and Loss of Pay (LWP) deductions.
- **Real-Time Attendance & Leave Tracking:** Web check-in/out with automated daily work-hour calculation, overtime tracking, and synchronized leave balance deductions.
- **Strict Data Isolation & Auditability:** Fine-grained authorization models ensuring employees can strictly access only their personal payroll records, contracts, and documents.

---

## 2. User Roles & Permissions Matrix

The platform enforces three distinct system roles alongside independent account status flags:

| Capability / Resource | ADMIN | HR | EMPLOYEE |
| :--- | :---: | :---: | :---: |
| **System Settings & Global Config** | Full Access | No Access | No Access |
| **User Account Status Management (Suspend / Reactivate)** | Full Access | Limited (Employees only) | No Access |
| **HR Administrator Account Provisioning** | Full Access | No Access | No Access |
| **Department Creation & Configuration** | Full Access | Full Access | Read-Only |
| **System-wide Audit & Activity Logs** | Full Access | Department View | No Access |
| **Organization Analytics & Cost Reporting** | Full Access | Full Access | No Access |
| **Review & Approve/Reject Employee Registrations** | Read-Only | Full Access | No Access |
| **Employee Directory Management (Create, Edit, Archive)** | Read-Only | Full Access | View Directory |
| **Salary Rules & Structures Configuration** | Read-Only | Full Access | No Access |
| **Payroll Run Execution & Finalization** | Read-Only | Full Access | No Access |
| **Payslip Generation & Publishing** | Read-Only | Full Access | View Own Only |
| **Leave Request Approval / Rejection** | Read-Only | Full Access | Apply & View Own |
| **Company-wide Attendance Monitoring** | Read-Only | Full Access | View Own Only |
| **Web Check-In / Check-Out** | Optional | Optional | Full Access |
| **Employee Document Repository** | View All | Manage All | View Own Only |

---

## 3. Account Status Workflow & Authentication Flow

### Account Status State Machine

```
              ┌─────────────────────────────────────┐
              │   Employee Self-Service /signup     │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ status =              │
                     │ PENDING_APPROVAL      │
                     └───────────┬───────────┘
                                 │
            ┌────────────────────┴────────────────────┐
            │ HR Reviews in Pending Approvals Center  │
            └──────────┬───────────────────┬──────────┘
                       │                   │
               Approve │                   │ Reject
                       ▼                   ▼
            ┌──────────────────────┐    ┌──────────────────────┐
            │ status = ACTIVE      │    │ status = REJECTED    │
            │ (Employee can login) │    │ (Displays HR message)│
            └──────────┬───────────┘    └──────────────────────┘
                       │
       Admin/HR Suspend│ Reactivate
                       ▼
            ┌──────────────────────┐
            │ status = SUSPENDED   │
            │ (Access blocked)     │
            └──────────────────────┘
```

### Detailed Authentication Flow
1. **Registration (`/signup`)**:
   - The user inputs: Full Name, Work Email, Contact Phone, Password, Department Preference, Designation, Date of Birth, and Residential Address.
   - The system validates input correctness, hashes the password via `bcrypt` (10 rounds), and writes the user record with `role: 'EMPLOYEE'` and `status: 'PENDING_APPROVAL'`.
   - The UI redirects the applicant to `/pending-approval` with the notification: *"Registration submitted successfully. Your account is awaiting HR review and approval."*
   - No JWT session is granted for dashboard access.
2. **HR Verification (`/hr/pending-approvals`)**:
   - HR logs in and accesses the Pending Approvals center.
   - HR inspects the applicant's submitted personal, contact, and job preference data.
   - If approved: The user's status updates to `ACTIVE`, an official `Employee` profile is provisioned with a generated Employee ID (e.g., `EMP-1042`), an initial leave balance is credited, and an approval notification is generated.
   - If rejected: The user's status updates to `REJECTED`, and an optional HR rejection comment is recorded.
3. **Unified Login (`/login`)**:
   - Single entry point for all organizational members.
   - Input: Email & Password.
   - The backend validates credentials and checks `status`:
     - If `PENDING_APPROVAL`: Returns 403 with message *"Your account is awaiting HR approval."*
     - If `REJECTED`: Returns 403 with message *"Your registration was not approved. Please contact HR."*
     - If `SUSPENDED`: Returns 403 with message *"Your account has been suspended. Please contact HR administrator."*
     - If `ACTIVE`: Issues a signed JSON Web Token (JWT) containing `{ id, role, email, employeeId, status }`.
4. **Role-Based Redirect**:
   - `ADMIN` $\rightarrow$ `/admin/dashboard`
   - `HR` $\rightarrow$ `/hr/dashboard`
   - `EMPLOYEE` $\rightarrow$ `/employee/dashboard`

---

## 4. Authorization Rules & Security Model

1. **Backend Route Guards**:
   - `authenticateToken`: Validates incoming Bearer token from the `Authorization` header. Decodes payload and attaches `req.user`.
   - `requireRole(roles: string[])`: Verifies if `req.user.role` matches one of the permitted roles; returns `403 Forbidden` on mismatch.
   - `validateEmployeeOwnership`: Validates that if an `EMPLOYEE` accesses `/api/employees/:id`, `/api/payslips/:id`, `/api/attendance/:employeeId`, or `/api/leaves/:id`, the resource strictly belongs to `req.user.employeeId`.
2. **Data Security**:
   - Passwords hashed with `bcryptjs` salt rounds = 10.
   - Password hashes, salt tokens, and internal recovery tokens are explicitly excluded (`select: false`) from API responses.
   - CORS origin validation bound to configured `CLIENT_URL`.
   - Rate limiting and input sanitization on all public endpoints.

---

## 5. Primary User Journeys

### Journey 1: New Employee Onboarding
1. Applicant fills registration form at `/signup`.
2. Backend persists record as `PENDING_APPROVAL`.
3. HR Manager reviews submission in `/hr/pending-approvals`.
4. HR confirms departmental assignment, base CTC, and clicks **Approve**.
5. Employee logs in at `/login`, arrives at `/employee/dashboard`, checks their personal profile, and downloads company policy documents.

### Journey 2: Daily Attendance & Timesheets
1. Employee accesses `/employee/attendance` and clicks **Check In** (timestamp logged, e.g., 09:14 AM).
2. At the end of the shift, employee clicks **Check Out** (timestamp logged, e.g., 06:18 PM).
3. Backend computes elapsed worked hours (e.g., 9.07 hrs) and overtime if $> 8.5$ hrs. Status tagged as `Present` or `Late`.
4. HR reviews consolidated real-time attendance logs on `/hr/attendance` with filterable date range and department metrics.

### Journey 3: Leave Request Lifecycle
1. Employee navigates to `/employee/apply-leave`.
2. Employee selects Leave Type (`Casual`, `Sick`, `Earned`, `Unpaid LWP`), date range, and inputs justification.
3. System verifies that requested days do not exceed available balance.
4. HR receives item in `/hr/timeoff` approval queue, reviews conflicts, and clicks **Approve**.
5. Employee's leave balance is automatically decremented and notification posted.

### Journey 4: Monthly Payroll Processing & Payslip Distribution
1. At month-end, HR opens `/hr/payroll` and initiates a new Pay Run (e.g., "September 2026").
2. The payroll calculation engine aggregates:
   - Base salary from active employment contract.
   - Prorated earnings based on attendance and unpaid LWP days.
   - Statutory deductions: Employee PF (12% of basic up to statutory ceiling), Professional Tax (slab-based), TDS (income tax withholding).
3. HR reviews calculation anomalies and flags missing bank information.
4. HR clicks **Validate & Execute Payroll**.
5. Individual payslips are generated and immediately made available in `/employee/payslips` for employees to view and download.

---

## 6. Website Pages & URL Hierarchy

### Public / Authentication Pages
- `/` — Product Landing & Value Proposition
- `/login` — Unified Portal Login
- `/signup` — Employee Self-Service Registration
- `/forgot-password` — Password Recovery Request
- `/reset-password` — Credential Reset
- `/pending-approval` — Applicant Holding Screen
- `/account-rejected` — Rejected Applicant Information Screen

### Admin Portal (`/admin/*`)
- `/admin/dashboard` — Platform overview, system metrics, server health
- `/admin/users` — Global user account status & role administration
- `/admin/hr-management` — HR team provisioning and permission allocation
- `/admin/departments` — Organization structure and department budgets
- `/admin/settings` — System configurations, security policies, email templates
- `/admin/analytics` — Cross-organizational headcount, attrition, and cost trends
- `/admin/logs` — Immutable audit trail of critical administrator actions

### HR Management Portal (`/hr/*`)
- `/hr/dashboard` — Operational summary, pending actions, quick actions
- `/hr/pending-approvals` — Centralized queue for new registrations & leave requests
- `/hr/employees` — Searchable employee directory with department filters
- `/hr/employees/:id` — 360-degree employee profile (personal, contract, salary, attendance, documents)
- `/hr/departments` — Departmental rosters and management hierarchy
- `/hr/contracts` — Contract repository, salary brackets, and tenure logs
- `/hr/attendance` — Company-wide daily/monthly attendance reconciliation
- `/hr/timeoff` — Leave queue, approval workflow, and balance adjustments
- `/hr/payroll` — Pay run generation, calculation engine, and ledger review
- `/hr/payslips` — Master payslip directory with mass download and search
- `/hr/reports` — Exportable HR, attendance, attrition, and payroll compliance reports
- `/hr/documents` — Company-wide document management (policies, templates)
- `/hr/notifications` — Notification broadcast and dispatch center

### Employee Self-Service Portal (`/employee/*`)
- `/employee/dashboard` — Quick check-in widget, leave balance summary, latest payslip snapshot
- `/employee/profile` — Personal information, emergency contacts, bank details
- `/employee/attendance` — Personal check-in/out console and monthly calendar view
- `/employee/leave` — Leave balance cards and past request history
- `/employee/apply-leave` — Leave application form with dynamic day calculation
- `/employee/payslips` — Personal payslip archive with print/PDF layout
- `/employee/documents` — Access to offer letters, employment contracts, and tax forms
- `/employee/notifications` — Personal alert history and announcements

---

## 7. Page-to-Component Mapping

| Route | Page Component | Key Subcomponents |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | `AuthCard`, `Input`, `Button`, `ToastContainer` |
| `/signup` | `SignupPage` | `RegistrationForm`, `Input`, `Select`, `Button` |
| `/pending-approval` | `PendingApprovalPage` | `StatusDisplayCard`, `Button` |
| `/account-rejected` | `AccountRejectedPage` | `StatusDisplayCard`, `Button` |
| `/admin/dashboard` | `AdminDashboardPage` | `StatCard`, `SystemHealthWidget`, `UserDistributionChart` |
| `/admin/users` | `AdminUsersPage` | `DataTable`, `Badge`, `ActionDropdown`, `UserModal` |
| `/admin/departments` | `AdminDepartmentsPage`| `DepartmentGrid`, `DepartmentModal`, `ConfirmDialog` |
| `/admin/analytics` | `AdminAnalyticsPage` | `AreaChart`, `BarChart`, `MetricsSummary` |
| `/admin/logs` | `AdminLogsPage` | `AuditLogTable`, `FilterBar`, `DateRangePicker` |
| `/hr/dashboard` | `HRDashboardPage` | `StatCard`, `ApprovalWidget`, `AttendanceBarChart`, `QuickActionDock` |
| `/hr/pending-approvals` | `PendingApprovalsPage` | `ApprovalTable`, `ProfileReviewModal`, `RejectReasonModal` |
| `/hr/employees` | `EmployeesPage` | `EmployeeTable`, `SearchBar`, `FilterPillGroup`, `EmployeeModal` |
| `/hr/employees/:id` | `EmployeeDetailPage` | `TabNav`, `ContractCard`, `BankDetailsCard`, `DocumentList` |
| `/hr/attendance` | `AttendancePage` | `AttendanceSummaryCards`, `DailyAttendanceTable`, `StatusBadge` |
| `/hr/timeoff` | `TimeOffPage` | `LeaveRequestTable`, `LeaveBalanceModal`, `ApproveRejectModal` |
| `/hr/payroll` | `PayRunsPage` | `PayRunStepper`, `CalculationSummary`, `SalaryBreakdownModal` |
| `/hr/payslips` | `PayslipsPage` | `PayslipTable`, `PayslipModal`, `PrintView` |
| `/hr/reports` | `ReportsPage` | `ReportFilterBar`, `RechartsAnalytics`, `ExportCSVButton` |
| `/employee/dashboard` | `EmployeeDashboardPage` | `WebClockWidget`, `MiniLeaveCard`, `RecentPayslipCard` |
| `/employee/profile` | `EmployeeProfilePage` | `ProfileHeader`, `InfoSection`, `BankVerificationBanner` |
| `/employee/attendance` | `EmployeeAttendancePage`| `AttendanceCalendar`, `ClockInButton`, `MonthlyStats` |
| `/employee/leave` | `EmployeeLeavePage` | `BalancePillGroup`, `LeaveHistoryTable`, `ApplyLeaveModal` |
| `/employee/payslips` | `EmployeePayslipsPage` | `PayslipHistoryGrid`, `PayslipModal` |

---

## 8. Database Entities & Schemas

The database layer utilizes MongoDB with Mongoose ODM schemas:

1. **User (`users`)**: Credentials, role (`ADMIN`, `HR`, `EMPLOYEE`), status (`PENDING_APPROVAL`, `ACTIVE`, `REJECTED`, `SUSPENDED`), registration metadata.
2. **Employee (`employees`)**: Biographic data, departmental link, job title, manager reference, PAN, PF, UAN, bank details, tax regime (`New`/`Old`), active contract link.
3. **Department (`departments`)**: Code, name, description, department head reference, cost center.
4. **Contract (`contracts`)**: Salary structure link, monthly base salary, gross CTC, effective start/end dates, status (`Active`, `Expired`, `Draft`).
5. **Attendance (`attendances`)**: Daily check-in, check-out, total hours, overtime, status (`Present`, `Late`, `Absent`, `Half Day`).
6. **LeaveRequest (`leaverequests`)**: Leave type, start date, end date, total days, employee note, status (`Pending`, `Approved`, `Refused`), reviewer comments.
7. **LeaveBalance (`leavebalances`)**: Entitlements and consumed counters for Casual, Sick, Earned, and LWP.
8. **SalaryStructure (`salarystructures`)**: Rule configurations for allowances, statutory deductions, and tax formulas.
9. **PayRun (`payruns`)**: Monthly payroll batch with state (`Draft`, `Computed`, `Validated`, `Paid`), financial totals (Gross, Deductions, Net), and reconciliation flags.
10. **Payslip (`payslips`)**: Static snapshot of employee data, earnings breakdown, statutory deductions, net payable, and payment reference.
11. **Document (`documents`)**: Metadata, file path/URL, document category (`Contract`, `Offer Letter`, `Payslip`, `Identity Proof`), visibility scope.
12. **Notification (`notifications`)**: User recipient, category, message, unread status, priority level, link target.
13. **AuditLog (`auditlogs`)**: Actor ID, action type, affected resource, IP address, timestamp, diff payload.

---

## 9. Database Relationships Diagram

```
                 ┌────────────────────────────────┐
                 │          Department            │
                 └───────────────┬────────────────┘
                                 │ 1:N
                                 ▼
┌──────────────┐ 1:1     ┌────────────────────────┐
│     User     ├────────►│        Employee        │
└──────────────┘         └───────────┬────────────┘
                                     │
         ┌───────────────┬───────────┼───────────────┬───────────────┐
         │ 1:N           │ 1:N       │ 1:N           │ 1:1           │ 1:N
         ▼               ▼           ▼               ▼               ▼
  ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
  │  Attendance  ││ LeaveRequest ││   Contract   ││ LeaveBalance ││   Document   │
  └──────────────┘└──────────────┘└──────┬───────┘└──────────────┘└──────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │SalaryStruct. │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │    PayRun    │
                                  └──────┬───────┘
                                         │ 1:N
                                         ▼
                                  ┌──────────────┐
                                  │   Payslip    │
                                  └──────────────┘
```

---

## 10. API Endpoints Catalog

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Submit new employee self-registration (`PENDING_APPROVAL`).
- `POST /api/auth/login` — Authenticate credentials; return JWT and profile if `ACTIVE`.
- `GET  /api/auth/me` — Retrieve current authenticated session and role context.
- `POST /api/auth/logout` — Invalidate user token / session.

### Admin Operations (`/api/admin`)
- `GET    /api/admin/users` — List all registered accounts with role and status filters.
- `PATCH  /api/admin/users/:id/status` — Modify user status (`ACTIVE`, `SUSPENDED`, `REJECTED`).
- `POST   /api/admin/hr-users` — Create authorized HR manager account.
- `GET    /api/admin/analytics` — Platform-wide headcount, cost, and usage metrics.
- `GET    /api/admin/logs` — Fetch paginated system activity and audit logs.
- `GET    /api/admin/settings` — Get system configuration parameters.
- `PUT    /api/admin/settings` — Update organizational parameters and policies.

### HR Management (`/api/hr`)
- `GET   /api/hr/dashboard` — Consolidated operational stats, alerts, and today's headcount.
- `GET   /api/hr/pending-approvals` — Retrieve pending candidate registrations.
- `PATCH /api/hr/registrations/:id/approve` — Approve registration; provision employee record.
- `PATCH /api/hr/registrations/:id/reject` — Reject registration with reason.

### Employee Management (`/api/employees`)
- `GET    /api/employees` — Search, filter, and paginate employee records.
- `POST   /api/employees` — Create an employee record directly with contract details.
- `GET    /api/employees/:id` — Retrieve comprehensive employee profile.
- `PUT    /api/employees/:id` — Update personal or employment particulars.
- `DELETE /api/employees/:id` — Soft-delete / terminate employee.
- `GET    /api/employees/:id/contract` — Fetch active contract details.

### Attendance Operations (`/api/attendance`)
- `POST /api/attendance/check-in` — Web clock-in for the current user.
- `POST /api/attendance/check-out` — Web clock-out and duration reconciliation.
- `GET  /api/attendance/me` — Retrieve logged-in employee's monthly attendance logs.
- `GET  /api/attendance` — HR view of organizational attendance with date filters.

### Leave & Time-Off (`/api/leaves`)
- `GET   /api/leaves` — List leave requests (filtered by user or organization).
- `POST  /api/leaves` — Submit new leave application.
- `GET   /api/leaves/balances` — Retrieve leave balances for current employee or selected ID.
- `PATCH /api/leaves/:id/approve` — HR approval of pending leave request.
- `PATCH /api/leaves/:id/reject` — HR refusal with feedback note.

### Payroll & Payslips (`/api/payroll` & `/api/payslips`)
- `GET   /api/payroll/runs` — Fetch pay runs list and status.
- `POST  /api/payroll/runs` — Create new monthly pay run batch.
- `POST  /api/payroll/runs/:id/calculate` — Execute computational salary engine.
- `POST  /api/payroll/runs/:id/validate` — Lock payroll batch and freeze calculations.
- `POST  /api/payroll/runs/:id/pay` — Mark batch as paid and release payslips.
- `GET   /api/payslips` — List payslips (HR sees all, employee sees own).
- `GET   /api/payslips/:id` — Fetch detailed individual payslip snapshot.

---

## 11. Request & Response Structure

All responses follow a consistent, predictable JSON envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_PENDING_APPROVAL",
    "message": "Your registration is currently under HR review. Access is restricted until approved."
  }
}
```

---

## 12. Frontend Architecture

### Component Hierarchy
- **Application Core**: `App.tsx` configures `BrowserRouter`, `AuthProvider`, `PayrollProvider`, and Toast notifications.
- **Route Shells / Layouts**:
  - `PublicLayout`: Centered brand header, minimal footer, auth container.
  - `AdminLayout`: Dark-slate primary sidebar, audit monitor, system status badges.
  - `HRLayout`: Emerald/Forest accent navigation, approval alerts badge, quick-action drawer.
  - `EmployeeLayout`: Self-service header, quick clock-in widget, leave balance counters.
- **State Management**:
  - `AuthContext`: Manages current user object, JWT storage, authentication checks, and role helpers (`isHr`, `isAdmin`, `isEmployee`).
  - `PayrollContext`: Active pay run selection, calculation states, employee selection.
- **HTTP Client**: Axios instance configured with base URL, request interceptors for Bearer token insertion, and response interceptors for 401 handling.

---

## 13. Backend Architecture

### Design Pattern: Layered Architecture
```
Routes  ──►  Validators  ──►  Controllers  ──►  Services  ──►  Mongoose Models  ──►  Database
```
- **Routes**: Expose HTTP endpoints, bind path parameters, attach middleware.
- **Validators**: Validate request payloads (presence, email formatting, numeric bounds).
- **Controllers**: Parse request params, invoke corresponding service functions, send HTTP status envelopes.
- **Services**: Encapsulate core business logic (salary computation formulas, leave balance audits, status transitions).
- **Models**: Mongoose schemas enforcing database schema types, indexing, and validation hooks.

---

## 14. Folder Structure

```
payrole360/
├── docs/
│   ├── PROJECT_BLUEPRINT.md
│   ├── DATABASE_SCHEMA.md
│   └── API_DOCUMENTATION.md
├── server/
│   ├── data/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── hrController.ts
│   │   │   ├── employeeController.ts
│   │   │   ├── attendanceController.ts
│   │   │   ├── leaveController.ts
│   │   │   └── payrollController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── validate.ts
│   │   │   └── errorHandler.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Employee.ts
│   │   │   ├── Department.ts
│   │   │   ├── Contract.ts
│   │   │   ├── Attendance.ts
│   │   │   ├── LeaveRequest.ts
│   │   │   ├── LeaveBalance.ts
│   │   │   ├── PayRun.ts
│   │   │   ├── Payslip.ts
│   │   │   ├── Document.ts
│   │   │   └── AuditLog.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   ├── hr.ts
│   │   │   ├── employees.ts
│   │   │   ├── attendance.ts
│   │   │   ├── leaves.ts
│   │   │   ├── payroll.ts
│   │   │   └── payslips.ts
│   │   ├── services/
│   │   │   ├── payrollEngine.ts
│   │   │   └── auditService.ts
│   │   ├── seed.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── HRLayout.tsx
│   │   │   ├── EmployeeLayout.tsx
│   │   │   └── Navbar.tsx
│   │   └── payroll/
│   │       ├── PayslipModal.tsx
│   │       └── SalaryBreakdown.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── PayrollContext.tsx
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── PendingApprovalPage.tsx
│   │   │   └── AccountRejectedPage.tsx
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── AdminUsersPage.tsx
│   │   │   └── AdminAnalyticsPage.tsx
│   │   ├── hr/
│   │   │   ├── HRDashboardPage.tsx
│   │   │   ├── PendingApprovalsPage.tsx
│   │   │   ├── EmployeesPage.tsx
│   │   │   ├── EmployeeDetailPage.tsx
│   │   │   ├── AttendancePage.tsx
│   │   │   ├── TimeOffPage.tsx
│   │   │   ├── PayRunsPage.tsx
│   │   │   ├── PayslipsPage.tsx
│   │   │   └── ReportsPage.tsx
│   │   └── employee/
│   │       ├── EmployeeDashboardPage.tsx
│   │       ├── EmployeeAttendancePage.tsx
│   │       ├── EmployeeLeavePage.tsx
│   │       └── EmployeePayslipsPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── README.md
└── package.json
```

---

## 15. Integration Points

1. **Client-Server Communication**:
   - Standard RESTful JSON exchange over HTTP/HTTPS.
   - Axios client with automatic Bearer token injection.
2. **Payslip PDF Export**:
   - Clean printable HTML/CSS media styling with `window.print()` and vector badge assets for professional hardcopy / PDF export.
3. **Database Connectivity**:
   - Configurable MongoDB connection with automatic fallback to high-reliability local relational storage if external MongoDB daemon is not running in local test mode, ensuring 100% testability across development environments.

---

## 16. Validation Rules

- **User Registration**:
  - `name`: String, minimum 2 chars, required.
  - `email`: Valid RFC 5322 email string, required, unique index.
  - `password`: Minimum 8 chars, at least one letter and one number.
  - `phone`: Valid 10-digit mobile number format.
- **Leave Application**:
  - `startDate` & `endDate`: ISO format (`YYYY-MM-DD`). `endDate >= startDate`.
  - `days`: Positive integer $> 0$.
  - Available balance check: `requestedDays <= availableBalance` for paid categories.
- **Payroll Processing**:
  - Employee must possess an active contract.
  - Basic salary $> 0$.
  - Days worked $+$ LWP days $\le$ Total working days in period.

---

## 17. Error Handling & Logging Strategy

1. **Centralized Backend Error Handler**:
   - Catches all uncaught errors, extracts operational errors, logs stack traces, and returns clean `{ success: false, error: { message, code } }` with appropriate HTTP status (400, 401, 403, 404, 409, 500).
2. **Frontend Interceptors & Feedback**:
   - Axios response interceptor traps 401 (redirects to `/login`), 403 (shows permission banner or status message), and displays contextual toast notifications for network/server errors.
3. **Audit Trails**:
   - Critical events (role changes, payroll execution, salary structure edits, employee terminations) are logged to the `auditlogs` collection with actor metadata.
