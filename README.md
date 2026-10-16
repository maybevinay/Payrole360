# Payroll360 — Enterprise HR & Automated Payroll Management Platform

A modern, full-stack Human Resources Management System (HRMS) and automated payroll processing platform designed for mid-to-large enterprise teams. Payroll360 unifies the entire workforce lifecycle—from candidate onboarding and self-service registration to biometric/web attendance reconciliation, multi-tier leave administration, statutory payroll processing, automated payslip distribution, and high-level organizational analytics.

---

## 1. Overview

Payroll360 provides organizations with an integrated, secure, and compliant workforce operating system. It eliminates fragmented spreadsheets and disjointed tools by delivering tailored workspaces for **System Administrators**, **HR Managers**, and **Employees**. The platform enforces strict role-based access control, automates complex statutory compensation calculations, and provides an auditable paper trail for organizational governance.

---

## 2. Problem

Modern growing companies face critical challenges in workforce operations:
- **Disjointed Onboarding:** Candidate information is scattered across emails, spreadsheets, and paper forms, resulting in delayed onboarding and data entry errors.
- **Attendance & Payroll Disconnect:** Manual timesheets and leave cards cause inaccurate deductions, delayed salary disbursements, and payroll discrepancies.
- **Complex Statutory Compliance:** Calculating Provident Fund (PF), Professional Tax (PT), Tax Deducted at Source (TDS), and Loss of Pay (LWP) manually is prone to human error and compliance penalties.
- **Lack of Employee Transparency:** Employees frequently struggle to access their current leave balances, historical payslips, or tax deduction breakdowns, placing an avoidable administrative burden on HR teams.

Payroll360 resolves these bottlenecks by connecting attendance, leave approvals, contract salary rules, and statutory calculation logic directly into automated monthly pay runs.

---

## 3. Features

### Core Capabilities
- **Candidate Self-Service Registration (`/signup`):** Candidates register with biographic and contact particulars, automatically queueing into HR review with `PENDING_APPROVAL` status.
- **Centralized HR Approval Center (`/hr/pending-approvals`):** HR managers review submissions, assign official Employee IDs (e.g. `EMP-1042`), configure salary packages, and approve or reject with feedback.
- **Web Clock-In & Timesheet Reconciliation:** Real-time web check-in/out with shift duration calculation, automatic late arrival tagging, and overtime tracking.
- **Multi-Category Leave Management:** Entitlement tracking for Casual, Sick, Earned, and Unpaid Leave (LWP) with automated quota decrements upon HR approval.
- **Statutory Indian Payroll Engine:** Automatic calculation of Basic, HRA, Transport, Special Allowances, Employee PF (12%), Professional Tax slabs, and progressive TDS withholding.
- **Automated Pay Run Lifecycle:** Multi-stage pay run batches: `Draft` $\rightarrow$ `Computed` $\rightarrow$ `Validated` $\rightarrow$ `Paid`.
- **Itemized Digital Payslips:** Print- and PDF-ready payslips featuring company headers, employee snapshots, earnings breakdowns, deductions, and English rupee words.
- **Administrative Account Governance:** Real-time user suspension, reactivation, audit logging, and organization-wide analytics.

---

## 4. User Roles

The platform implements a 3-tier role hierarchy:

| Role | Target Persona | Primary Responsibilities |
| :--- | :--- | :--- |
| **ADMIN** | Executive & IT Admin | Global account governance, provisioning HR administrators, department cost centers, security audit logs, platform analytics. |
| **HR** | People Operations | Reviewing candidate registrations, employee directory CRUD, attendance monitoring, leave approvals, salary structure definition, payroll batch execution, payslip generation. |
| **EMPLOYEE** | Team Members | Web check-in / check-out, personal attendance calendar, leave balance inquiries, time-off requests, personal payslip archive, profile inspection. |

---

## 5. Authentication Flow

```
                      ┌─────────────────────────┐
                      │ Candidate at /signup    │
                      └────────────┬────────────┘
                                   │
                                   ▼
               ┌───────────────────────────────────────┐
               │ role = EMPLOYEE                       │
               │ status = PENDING_APPROVAL             │
               │ (Redirected to /pending-approval)     │
               └───────────────────┬───────────────────┘
                                   │
                                   ▼
               ┌───────────────────────────────────────┐
               │ HR Reviews in Pending Approvals Center │
               └───────────┬───────────────────────┬───┘
                           │                       │
                   Approve │                       │ Reject
                           ▼                       ▼
            ┌────────────────────────┐  ┌────────────────────────┐
            │ status = ACTIVE        │  │ status = REJECTED      │
            │ Assigned Employee ID   │  │ Displays HR rationale  │
            │ Contract & Leave Quota │  └────────────────────────┘
            └──────────────┬─────────┘
                           │
                           ▼
            ┌────────────────────────┐
            │ Candidate logs into    │
            │ /login with email/pwd  │
            └──────────────┬─────────┘
                           │
                           ▼
            ┌────────────────────────┐
            │ Issues JWT Session     │
            │ Routes to /employee/*  │
            └────────────────────────┘
```

---

## 6. Application Workflow

1. **Onboarding:** Applicant signs up $\rightarrow$ HR approves in Pending Approvals center $\rightarrow$ Employee profile is initialized.
2. **Daily Routine:** Employee logs into `/employee/attendance` $\rightarrow$ clicks **Clock In** $\rightarrow$ at day-end clicks **Clock Out** $\rightarrow$ worked hours recorded.
3. **Time Off:** Employee requests leave at `/employee/leave` $\rightarrow$ HR reviews and clicks **Approve** $\rightarrow$ leave quota decremented.
4. **Payroll Processing:** At month-end, HR opens `/hr/payroll` $\rightarrow$ creates Pay Run $\rightarrow$ system automatically factors in base salaries and unpaid leave deductions $\rightarrow$ HR clicks **Validate & Mark Paid** $\rightarrow$ individual payslips are published.
5. **Self-Service Retrieval:** Employee opens `/employee/payslips` $\rightarrow$ views or prints their official payslip.

---

## 7. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (utility-first design system)
- **Routing:** React Router v6 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **HTTP Client:** Axios (configured with request & response interceptors)
- **Visualizations:** Recharts (responsive bar and pie charts)
- **Icons:** Lucide React

### Backend
- **Environment:** Node.js (v18+)
- **Web Framework:** Express.js 5
- **Database Layer:** MongoDB with Mongoose ODM (with seamless, zero-config local persistence fallback)
- **Security & Tokens:** JSON Web Tokens (`jsonwebtoken`) + Bcrypt hashing (`bcryptjs`)
- **Cross-Origin:** CORS middleware

---

## 8. Project Structure

```
payrole360/
├── docs/
│   ├── PROJECT_BLUEPRINT.md        # Comprehensive architectural blueprint
│   ├── DATABASE_SCHEMA.md          # Exhaustive collection & field specifications
│   └── API_DOCUMENTATION.md        # RESTful API specifications
├── server/
│   ├── data/                       # Local database storage
│   ├── src/
│   │   ├── config/                 # Database connection manager (Mongoose & fallback)
│   │   ├── middleware/             # JWT auth, role validation, ownership checks
│   │   ├── models/                 # Mongoose schemas (User, Employee, PayRun, etc.)
│   │   ├── routes/                 # Express REST endpoints (auth, admin, hr, etc.)
│   │   ├── db.ts                   # Database schema definitions & migrations
│   │   ├── seed.ts                 # Production seed records & demo personas
│   │   └── server.ts               # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── api/
│   │   └── client.ts               # Centralized Axios client & typed API wrappers
│   ├── components/
│   │   ├── common/                 # Reusable buttons, badges, modals, toasts
│   │   ├── layout/                 # Navigation bars, sidebars, shell containers
│   │   └── payroll/                # Payslip modal, pay run wizard
│   ├── context/
│   │   ├── AuthContext.tsx         # Session state, login, register, role helpers
│   │   └── PayrollContext.tsx      # Payroll state, data refresh, toasts
│   ├── layouts/
│   │   ├── PublicLayout.tsx        # Public navigation & footer shell
│   │   ├── AdminLayout.tsx         # System administrator portal shell
│   │   ├── HRLayout.tsx            # HR operations portal shell
│   │   └── EmployeeLayout.tsx      # Employee self-service portal shell
│   ├── pages/
│   │   ├── auth/                   # Landing, Login, Signup, Status screens
│   │   ├── admin/                  # Admin console, user governance, analytics, logs
│   │   ├── hr/                     # HR dashboard, approvals, directory, payroll
│   │   └── employee/               # Self-service dashboard, attendance, leaves, slips
│   ├── routes/
│   │   └── ProtectedRoute.tsx      # Role and authentication route guard
│   ├── types/
│   │   └── index.ts                # Master TypeScript interface definitions
│   ├── utils/
│   │   └── formatters.ts           # INR currency, date, and English word utilities
│   ├── App.tsx                     # React Router tree configuration
│   └── main.tsx                    # Vite DOM entry point
├── .env.example
├── package.json
└── README.md
```

---

## 9. Frontend Components

| Component | Purpose | Used By |
| :--- | :--- | :--- |
| `PublicLayout` | Top navigation and brand footer for public visitors | Landing, Login, Signup, Status holding pages |
| `AdminLayout` | Dark-slate theme sidebar with system metrics and audit navigation | Administrator Portal (`/admin/*`) |
| `HRLayout` | Emerald-accented operations sidebar with pending approval counter badges | HR Management Portal (`/hr/*`) |
| `EmployeeLayout` | Self-service sidebar with ID badge and quick navigation | Employee Portal (`/employee/*`) |
| `ProtectedRoute` | Route guard validating authentication, account status, and role | All private subtrees |
| `PayslipModal` | Professional printable salary statement modal with PDF print styling | HR Payslips & Employee Payslips |
| `ToastContainer` | Notification toast stack for operational success/error feedback | Shell, Admin, HR, Employee layouts |
| `StatusBadge` | Semantic status pill indicator (Active, Pending, Late, Approved) | All directories and tables |

---

## 10. Pages / Views

| Page | Role | Purpose | Route |
| :--- | :---: | :--- | :--- |
| `LandingPage` | Public | Product showcase, features summary, and quick login links | `/` |
| `LoginPage` | Public | Unified sign-in validating credentials, status, and role | `/login` |
| `SignupPage` | Public | Candidate self-service registration form | `/signup` |
| `PendingApprovalPage` | Public | Holding screen for applicants awaiting HR review | `/pending-approval` |
| `AccountRejectedPage` | Public | Notice page for declined registration submissions | `/account-rejected` |
| `AdminDashboardPage` | ADMIN | System overview, server metrics, user growth, HR provisioning | `/admin/dashboard` |
| `AdminUsersPage` | ADMIN | User account governance with Suspend / Reactivate controls | `/admin/users` |
| `AdminAnalyticsPage` | ADMIN | Cross-organizational headcount and role charts | `/admin/analytics` |
| `AdminLogsPage` | ADMIN | Immutable activity audit trail | `/admin/logs` |
| `HRDashboardPage` | HR | Operational summary, today's attendance, payroll totals | `/hr/dashboard` |
| `PendingApprovalsPage`| HR | Centralized review queue to approve or reject registrations | `/hr/pending-approvals` |
| `EmployeesPage` | HR | Searchable and filterable employee directory | `/hr/employees` |
| `EmployeeDetailPage` | HR | 360-degree employee view (personal, salary, bank, documents) | `/hr/employees/:id` |
| `AttendancePage` | HR | Company-wide daily attendance monitoring and reconciliation | `/hr/attendance` |
| `TimeOffPage` | HR | Organizational leave queue with approval/refusal actions | `/hr/timeoff` |
| `PayRunsPage` | HR | Multi-stage pay run generator and calculation engine | `/hr/payroll` |
| `PayslipsPage` | HR | Master payslip directory with print preview | `/hr/payslips` |
| `ReportsPage` | HR | Exportable headcount and compliance reports | `/hr/reports` |
| `EmployeeDashboardPage`| EMPLOYEE | Quick web clock console, leave balances, recent payslip | `/employee/dashboard` |
| `EmployeeProfilePage` | EMPLOYEE | View personal info, bank details, and statutory numbers | `/employee/profile` |
| `EmployeeAttendancePage`| EMPLOYEE | Shift clock-in/out and personal monthly logs | `/employee/attendance` |
| `EmployeeLeavePage` | EMPLOYEE | Leave balance counters, request submission, and history | `/employee/leave` |
| `EmployeePayslipsPage`| EMPLOYEE | Archive of personal salary slips with print/download | `/employee/payslips` |

---

## 11. Database Schema

The database architecture is designed with MongoDB Mongoose schemas:

### 1. `users`
- **Purpose:** Stores identity credentials, role permissions, and access status.
- **Fields:** `email`, `passwordHash`, `name`, `role` (`'ADMIN'` | `'HR'` | `'EMPLOYEE'`), `status` (`'PENDING_APPROVAL'` | `'ACTIVE'` | `'REJECTED'` | `'SUSPENDED'`), `employeeId`, `phone`, `department`, `jobTitle`, `rejectionReason`.

### 2. `employees`
- **Purpose:** Full employee personnel records.
- **Fields:** `employeeCode` (`'EMP-1001'`), `userId`, `name`, `email`, `phone`, `jobTitle`, `department`, `employmentStatus`, `employmentType`, `joinedDate`, `manager`, `panNumber`, `pfNumber`, `uan`, `bankDetails` (`accountNumber`, `ifscCode`, `bankName`, `isVerified`).

### 3. `departments`
- **Purpose:** Organizational divisions and cost centers.
- **Fields:** `code`, `name`, `description`, `headOfDepartment`, `budget`.

### 4. `contracts`
- **Purpose:** Legal employment terms and compensation packages.
- **Fields:** `employeeId`, `jobTitle`, `monthlySalary`, `annualCtc`, `salaryStructureId`, `startDate`, `endDate`, `status`.

### 5. `attendance`
- **Purpose:** Daily timestamp records and punctuality tracking.
- **Fields:** `employeeId`, `date`, `checkIn`, `checkOut`, `workedHours`, `overtimeHours`, `status` (`'Present'` | `'Late'` | `'Absent'`).

### 6. `leaveRequests`
- **Purpose:** Employee time-off requests.
- **Fields:** `employeeId`, `leaveType`, `startDate`, `endDate`, `days`, `reason`, `status` (`'Pending'` | `'Approved'` | `'Refused'`), `approver`.

### 7. `leaveBalances`
- **Purpose:** Accrual tracking per employee.
- **Fields:** `employeeId`, `casualTotal`, `casualUsed`, `sickTotal`, `sickUsed`, `earnedTotal`, `earnedUsed`, `unpaidLwpDays`.

### 8. `payRuns`
- **Purpose:** Monthly batch execution record.
- **Fields:** `period`, `startDate`, `endDate`, `payDate`, `status` (`'Draft'` | `'Computed'` | `'Validated'` | `'Paid'`), `totalGross`, `totalDeductions`, `totalNet`.

### 9. `payslips`
- **Purpose:** Immutable snapshot of employee compensation for a cycle.
- **Fields:** `payslipCode`, `payRunId`, `employeeId`, `period`, `payDate`, `employeeSnapshot`, `earnings`, `deductions`, `grossPay`, `netPay`, `netPayInWords`.

### 10. `auditLogs`
- **Purpose:** Security and administrative event logs.
- **Fields:** `actorId`, `actorName`, `action`, `resourceType`, `resourceId`, `details`, `ipAddress`, `createdAt`.

---

## 12. API Documentation

| Method | Endpoint | Authentication | Allowed Roles | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | None | Public | Submit self-service registration (`PENDING_APPROVAL`) |
| `POST` | `/api/auth/login` | None | Public | Authenticate credentials; enforce account status; return JWT |
| `GET` | `/api/auth/me` | Bearer JWT | All | Retrieve current session profile |
| `GET` | `/api/admin/users` | Bearer JWT | ADMIN | List all accounts with status filters |
| `PATCH` | `/api/admin/users/:id/status` | Bearer JWT | ADMIN | Suspend or reactivate user account |
| `POST` | `/api/admin/hr-users` | Bearer JWT | ADMIN | Directly provision an HR account |
| `GET` | `/api/admin/analytics` | Bearer JWT | ADMIN | High-level system & headcount metrics |
| `GET` | `/api/admin/logs` | Bearer JWT | ADMIN | Fetch activity audit logs |
| `GET` | `/api/hr/dashboard` | Bearer JWT | HR, ADMIN | Retrieve consolidated HR operational metrics |
| `GET` | `/api/hr/pending-approvals`| Bearer JWT | HR, ADMIN | Fetch candidate registrations awaiting review |
| `PATCH` | `/api/hr/registrations/:id/approve` | Bearer JWT | HR | Approve registration, assign Employee ID, set `ACTIVE` |
| `PATCH` | `/api/hr/registrations/:id/reject` | Bearer JWT | HR | Reject registration with feedback reason |
| `GET` | `/api/employees` | Bearer JWT | HR, ADMIN, EMPLOYEE | Search and filter employee directory |
| `GET` | `/api/employees/:id` | Bearer JWT | HR, ADMIN, Self | Get detailed employee profile (ownership enforced) |
| `POST` | `/api/attendance/check-in` | Bearer JWT | EMPLOYEE | Log web check-in timestamp for current date |
| `POST` | `/api/attendance/check-out` | Bearer JWT | EMPLOYEE | Log web check-out and compute worked hours |
| `GET` | `/api/attendance/me` | Bearer JWT | EMPLOYEE | Fetch personal monthly attendance logs |
| `POST` | `/api/timeoff` | Bearer JWT | EMPLOYEE | Submit new leave application |
| `PATCH` | `/api/timeoff/:id/approve` | Bearer JWT | HR | Approve leave request and decrement balance |
| `GET` | `/api/payruns` | Bearer JWT | HR, ADMIN | List all monthly pay run batches |
| `POST` | `/api/payruns/:id/compute` | Bearer JWT | HR | Execute statutory salary calculation formulas |
| `GET` | `/api/payslips` | Bearer JWT | All | List payslips (HR sees all; Employee sees own only) |
| `GET` | `/api/payslips/:id` | Bearer JWT | All | Get detailed individual payslip (ownership enforced) |

---

## 13. Authentication & Authorization

1. **Authentication:**
   - Passwords hashed with `bcryptjs` (salt rounds = 10).
   - Standard RFC 7519 JSON Web Tokens signed with server secret (`HS256`).
   - Token stored in local storage and attached to requests via Axios `Authorization: Bearer <token>` interceptor.
2. **Authorization Guards:**
   - Route-level middleware `requireRole('ADMIN' | 'HR' | 'EMPLOYEE')`.
   - Resource-level middleware `validateEmployeeOwnership`: prevents an employee from requesting another employee's profile or payslips.
   - Frontend route protection with `<ProtectedRoute allowedRoles={[...]}>`.

---

## 14. Employee Approval Workflow

1. A candidate opens `/signup` and submits their name, email, phone, password, preferred department, and job title.
2. The user is created in the database with `role: 'EMPLOYEE'` and `status: 'PENDING_APPROVAL'`.
3. The candidate is redirected to `/pending-approval`. If they attempt to log in, login is blocked with: *"Your account is awaiting HR approval."*
4. The HR manager logs in and navigates to `/hr/pending-approvals`.
5. HR clicks **Review**, inspects candidate data, confirms compensation and department, and clicks **Approve**.
6. The backend updates `status: 'ACTIVE'`, assigns a unique Employee ID (e.g. `EMP-1004`), creates the official `Employee` record, generates an active employment `Contract`, and credits the initial `LeaveBalance`.
7. The employee can now sign in at `/login` and is immediately granted access to the Employee Self-Service portal.

---

## 15. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/organization/payroll360.git
cd payroll360
npm install
```

---

## 16. Running Frontend

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 17. Running Backend

Start the Node/Express backend server:

```bash
npm run server
```

The server will initialize the database, seed default demo personas, and listen at `http://localhost:3001`.

---

## 18. Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
PORT=3001
JWT_SECRET=payroll360-enterprise-secure-jwt-secret-key-2026
MONGODB_URI=mongodb://localhost:27017/payroll360
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 19. Demo Accounts

The following demo personas are seeded automatically on first startup:

| Role | Email | Password | Account Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@payroll360.internal` | `admin123` | `ACTIVE` | System Administrator console access |
| **HR** | `priya.verma@payroll360.internal` | `priya123` | `ACTIVE` | HR Operations & Approvals access |
| **EMPLOYEE** | `rahul.sharma@payroll360.internal` | `rahul123` | `ACTIVE` | Active Employee self-service (`EMP-1001`) |
| **EMPLOYEE** | `arjun.patel@example.com` | `arjun123` | `PENDING_APPROVAL` | Demonstrates pending review holding screen |
| **EMPLOYEE** | `karan.singh@example.com` | `karan123` | `SUSPENDED` | Demonstrates suspended account rejection |

---

## 20. Development Workflow

- Run both frontend and backend concurrently in separate terminal tabs (`npm run server` and `npm run dev`).
- Code changes in `src/` trigger instant Vite Fast Refresh.
- Backend edits in `server/src/` hot-reload with `tsx`.
- Run `npm run build` prior to submitting pull requests to ensure TypeScript clean compilation.

---

## 21. Git Workflow

This repository follows standard feature-branch conventions:
- **`main`**: Protected branch representing deployable releases.
- **`feature/frontend-shell`**: Layout, routing, navigation, and auth pages.
- **`feature/frontend-dashboard`**: HR and Employee dashboard widgets.
- **`feature/backend-auth`**: Authentication, roles, and status state machines.
- **`feature/backend-payroll`**: Salary rule engines, statutory calculations, and payslips.

Commit messages must follow the Conventional Commits specification:
```bash
feat: add candidate registration holding screen
fix: resolve LWP deduction recalculation on leave approval
style: refine employee directory table borders
docs: update API documentation catalog
```

---

## 22. Future Improvements

1. **Biometric Device Integration:** Direct webhook listeners for ZKTeco and Hikvision hardware attendance devices.
2. **Direct Bank Payout Gateway:** Direct API integration with RazorpayX or ICICI Corporate Banking for automated NEFT/RTGS disbursements.
3. **Multi-Currency Payroll:** Support for international remote teams with automated currency conversion and regional tax filings.
4. **Income Tax Declaration Proof Uploads:** Section 80C, 80D, and HRA rent receipt upload portal with HR verification workflows.
