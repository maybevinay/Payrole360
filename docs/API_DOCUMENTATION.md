# Payroll360 — RESTful API Documentation

> **Base URL:** `/api`  
> **Documentation Version:** 1.0.0  
> **Format:** Standard JSON with `{ success, data, message }` or `{ success, error }` envelopes  

All protected endpoints require an `Authorization` header with the Bearer token:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication APIs

### 1.1 Register New Employee
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Authentication:** None (Public)
- **Role:** Anyone
- **Purpose:** Allows a candidate to submit self-registration. Creates a user with `role: 'EMPLOYEE'` and `status: 'PENDING_APPROVAL'`.
- **Request Body:**
  ```json
  {
    "name": "Arjun Patel",
    "email": "arjun.patel@example.com",
    "password": "Password123!",
    "phone": "+91 99887 76655",
    "department": "Engineering",
    "jobTitle": "Full Stack Developer",
    "dateOfBirth": "1994-08-22",
    "address": "402 Palm Heights, Whitefield, Bengaluru"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Registration submitted successfully. Your account is awaiting HR review and approval.",
    "data": {
      "id": "64f1a2b3c4d5e6f7a8b9c0e5",
      "name": "Arjun Patel",
      "email": "arjun.patel@example.com",
      "role": "EMPLOYEE",
      "status": "PENDING_APPROVAL"
    }
  }
  ```

---

### 1.2 User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Authentication:** None (Public)
- **Role:** Anyone
- **Purpose:** Authenticates email and password. Validates account status before issuing JWT.
- **Request Body:**
  ```json
  {
    "email": "priya.verma@payroll360.internal",
    "password": "Password123!"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Priya Verma",
        "email": "priya.verma@payroll360.internal",
        "role": "HR",
        "status": "ACTIVE",
        "employeeId": "EMP-1002"
      }
    }
  }
  ```
- **Status Check Responses:**
  - `403 Forbidden` (`ACCOUNT_PENDING_APPROVAL`):
    ```json
    { "success": false, "error": { "code": "ACCOUNT_PENDING_APPROVAL", "message": "Your account is awaiting HR approval." } }
    ```
  - `403 Forbidden` (`ACCOUNT_REJECTED`):
    ```json
    { "success": false, "error": { "code": "ACCOUNT_REJECTED", "message": "Your registration was not approved. Please contact HR." } }
    ```
  - `403 Forbidden` (`ACCOUNT_SUSPENDED`):
    ```json
    { "success": false, "error": { "code": "ACCOUNT_SUSPENDED", "message": "Your account has been suspended. Please contact HR." } }
    ```

---

### 1.3 Verify Current Session (`Me`)
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Authentication:** Bearer Token
- **Role:** `ADMIN`, `HR`, `EMPLOYEE`
- **Purpose:** Validates existing session and returns current profile details.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Priya Verma",
      "email": "priya.verma@payroll360.internal",
      "role": "HR",
      "status": "ACTIVE",
      "employeeId": "EMP-1002"
    }
  }
  ```

---

## 2. Admin APIs

### 2.1 List All Users
- **Method:** `GET`
- **Endpoint:** `/api/admin/users`
- **Authentication:** Bearer Token
- **Role:** `ADMIN`
- **Purpose:** Lists all registered users with status, role, and registration date filters.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "64f1a2b3c4d5e6f7a8b9c0d1",
        "name": "Priya Verma",
        "email": "priya.verma@payroll360.internal",
        "role": "HR",
        "status": "ACTIVE",
        "employeeId": "EMP-1002",
        "createdAt": "2026-01-10T10:00:00.000Z"
      }
    ]
  }
  ```

---

### 2.2 Update User Status
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/users/:id/status`
- **Authentication:** Bearer Token
- **Role:** `ADMIN`
- **Purpose:** Suspend or reactivate user account.
- **Request Body:**
  ```json
  {
    "status": "SUSPENDED"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "User status updated to SUSPENDED",
    "data": { "id": "...", "status": "SUSPENDED" }
  }
  ```

---

### 2.3 System Analytics
- **Method:** `GET`
- **Endpoint:** `/api/admin/analytics`
- **Authentication:** Bearer Token
- **Role:** `ADMIN`
- **Purpose:** System-level metrics: user count by role, active sessions, server uptime, audit counters.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 54,
      "activeUsers": 48,
      "pendingUsers": 4,
      "suspendedUsers": 2,
      "departmentBreakdown": [
        { "department": "Engineering", "count": 28 },
        { "department": "Sales", "count": 12 }
      ],
      "systemHealth": { "dbStatus": "connected", "uptime": "14 days, 6 hours" }
    }
  }
  ```

---

## 3. HR Operations APIs

### 3.1 HR Dashboard Summary
- **Method:** `GET`
- **Endpoint:** `/api/hr/dashboard`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN`
- **Purpose:** Aggregated summary cards, alerts, pending counts, and today's headcount.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "totalEmployees": 48,
      "pendingApprovals": 3,
      "presentToday": 42,
      "onLeaveToday": 4,
      "monthlyPayroll": 3485000,
      "pendingLeaveRequests": 5,
      "attendanceTrend": [
        { "day": "Mon", "rate": 95 },
        { "day": "Tue", "rate": 92 }
      ]
    }
  }
  ```

---

### 3.2 List Pending Registrations
- **Method:** `GET`
- **Endpoint:** `/api/hr/pending-approvals`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN`
- **Purpose:** Retrieves all applicant submissions currently awaiting review.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "64f1a2b3c4d5e6f7a8b9c0e5",
        "name": "Arjun Patel",
        "email": "arjun.patel@example.com",
        "phone": "+91 99887 76655",
        "jobTitle": "Full Stack Developer",
        "department": "Engineering",
        "appliedOn": "2026-09-23T10:15:00.000Z",
        "status": "PENDING_APPROVAL"
      }
    ]
  }
  ```

---

### 3.3 Approve Employee Registration
- **Method:** `PATCH`
- **Endpoint:** `/api/hr/registrations/:id/approve`
- **Authentication:** Bearer Token
- **Role:** `HR`
- **Purpose:** Approves candidate registration, converts status to `ACTIVE`, creates `Employee` entity with code, and assigns salary structure.
- **Request Body:**
  ```json
  {
    "monthlySalary": 85000,
    "department": "Engineering",
    "jobTitle": "Full Stack Developer",
    "employmentType": "Full-Time"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Candidate registration approved. Employee EMP-1043 activated successfully.",
    "data": {
      "employeeCode": "EMP-1043",
      "status": "ACTIVE"
    }
  }
  ```

---

### 3.4 Reject Employee Registration
- **Method:** `PATCH`
- **Endpoint:** `/api/hr/registrations/:id/reject`
- **Authentication:** Bearer Token
- **Role:** `HR`
- **Purpose:** Rejects registration with reason.
- **Request Body:**
  ```json
  {
    "reason": "Department requisitions currently on hold for Q4."
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Candidate registration marked as REJECTED."
  }
  ```

---

## 4. Employee Management APIs

### 4.1 List Employees
- **Method:** `GET`
- **Endpoint:** `/api/employees`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN`, `EMPLOYEE`
- **Query Parameters:** `?search=rahul&department=Engineering&status=Active`
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "EMP-1001",
        "name": "Rahul Sharma",
        "email": "rahul.sharma@payroll360.internal",
        "phone": "+91 98765 43210",
        "jobTitle": "Lead Frontend Architect",
        "department": "Engineering",
        "employmentStatus": "Active",
        "employmentType": "Full-Time",
        "joinedDate": "2023-04-15"
      }
    ]
  }
  ```

---

### 4.2 Get Employee Detail
- **Method:** `GET`
- **Endpoint:** `/api/employees/:id`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN`, or `EMPLOYEE` (own profile only)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "EMP-1001",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@payroll360.internal",
      "phone": "+91 98765 43210",
      "avatarInitials": "RS",
      "jobTitle": "Lead Frontend Architect",
      "department": "Engineering",
      "employmentStatus": "Active",
      "joinedDate": "2023-04-15",
      "manager": "Vikram Malhotra",
      "panNumber": "ABCPS1234D",
      "pfNumber": "MH/BAN/0045612/000/1001",
      "uan": "100904561234",
      "taxRegime": "New",
      "location": "Bengaluru",
      "bankDetails": {
        "accountNumber": "91802001928374",
        "ifscCode": "HDFC0000456",
        "bankName": "HDFC Bank Ltd",
        "isVerified": true
      }
    }
  }
  ```

---

## 5. Attendance APIs

### 5.1 Check In
- **Method:** `POST`
- **Endpoint:** `/api/attendance/check-in`
- **Authentication:** Bearer Token
- **Role:** `EMPLOYEE`
- **Purpose:** Logs check-in timestamp for the authenticated employee for today's date.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Checked in successfully at 09:14 AM",
    "data": {
      "date": "2026-09-23",
      "checkIn": "09:14 AM",
      "status": "Present"
    }
  }
  ```

---

### 5.2 Check Out
- **Method:** `POST`
- **Endpoint:** `/api/attendance/check-out`
- **Authentication:** Bearer Token
- **Role:** `EMPLOYEE`
- **Purpose:** Logs check-out timestamp, calculates worked hours and overtime.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Checked out successfully at 06:18 PM. Total worked: 9.07 hours.",
    "data": {
      "checkOut": "06:18 PM",
      "workedHours": 9.07,
      "overtimeHours": 0.57
    }
  }
  ```

---

### 5.3 Fetch Attendance Records
- **Method:** `GET`
- **Endpoint:** `/api/attendance`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN` (all), `EMPLOYEE` (automatically filtered to own records)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "att-101",
        "employeeId": "EMP-1001",
        "employeeName": "Rahul Sharma",
        "date": "2026-09-23",
        "checkIn": "09:14 AM",
        "checkOut": "06:18 PM",
        "workedHours": 9.07,
        "overtimeHours": 0.57,
        "status": "Present"
      }
    ]
  }
  ```

---

## 6. Time Off & Leave APIs

### 6.1 Apply for Leave
- **Method:** `POST`
- **Endpoint:** `/api/leaves`
- **Authentication:** Bearer Token
- **Role:** `EMPLOYEE`
- **Request Body:**
  ```json
  {
    "leaveType": "Casual Leave",
    "startDate": "2026-09-28",
    "endDate": "2026-09-29",
    "days": 2,
    "reason": "Family function"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Leave application submitted successfully.",
    "data": { "id": "lev-402", "status": "Pending" }
  }
  ```

---

### 6.2 Approve Leave Request
- **Method:** `PATCH`
- **Endpoint:** `/api/leaves/:id/approve`
- **Authentication:** Bearer Token
- **Role:** `HR`
- **Purpose:** Marks request as approved and decrements employee's corresponding leave balance.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Leave request approved and balance updated."
  }
  ```

---

## 7. Payroll & Payslips APIs

### 7.1 Execute Pay Run Calculation
- **Method:** `POST`
- **Endpoint:** `/api/payroll/runs/:id/calculate`
- **Authentication:** Bearer Token
- **Role:** `HR`
- **Purpose:** Recalculates gross, deductions, and net payouts across all eligible employees for the active cycle.
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Payroll calculation finalized for 48 employees.",
    "data": {
      "period": "September 2026",
      "totalGross": 3840000,
      "totalDeductions": 456000,
      "totalNet": 3384000
    }
  }
  ```

---

### 7.2 Get Individual Payslip
- **Method:** `GET`
- **Endpoint:** `/api/payslips/:id`
- **Authentication:** Bearer Token
- **Role:** `HR`, `ADMIN`, or `EMPLOYEE` (own payslip only)
- **Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "PS-202609-1001",
      "period": "September 2026",
      "payDate": "2026-09-30",
      "employeeSnapshot": {
        "name": "Rahul Sharma",
        "employeeId": "EMP-1001",
        "jobTitle": "Lead Frontend Architect",
        "department": "Engineering",
        "pan": "ABCPS1234D",
        "bankName": "HDFC Bank Ltd",
        "accountNumber": "91802001928374",
        "ifscCode": "HDFC0000456"
      },
      "attendanceSnapshot": {
        "totalDays": 30,
        "workedDays": 22,
        "paidLeaves": 0,
        "unpaidLeaves": 0
      },
      "earnings": [
        { "name": "Basic Salary", "amount": 95000 },
        { "name": "House Rent Allowance (HRA)", "amount": 47500 },
        { "name": "Special Allowance", "amount": 47500 }
      ],
      "deductions": [
        { "name": "Provident Fund (PF)", "amount": 11400 },
        { "name": "Professional Tax (PT)", "amount": 200 },
        { "name": "Tax Deducted at Source (TDS)", "amount": 18500 }
      ],
      "grossPay": 190000,
      "totalDeductions": 30100,
      "netPay": 159900,
      "netPayInWords": "One Lakh Fifty Nine Thousand Nine Hundred Rupees Only"
    }
  }
  ```
