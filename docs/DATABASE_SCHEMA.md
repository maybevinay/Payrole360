# Payroll360 — Database Schema Specification

> **Database System:** MongoDB with Mongoose ODM  
> **Documentation Version:** 1.0.0  
> **Status:** Official Schema Definition  

This document specifies the MongoDB collections, fields, data types, validation rules, references, and indexes utilized across Payroll360.

---

## 1. Collection: `users`

### Purpose
Stores identity credentials, system authentication tokens, system roles, and account access statuses.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `email` | String | Yes | Yes | — | — | Work email address (lowercase, trimmed) |
| `passwordHash` | String | Yes | No | — | — | Bcrypt hashed password (10 rounds) |
| `name` | String | Yes | No | — | — | Full name of user |
| `role` | String | Yes | No | `'EMPLOYEE'` | — | Enum: `'ADMIN'`, `'HR'`, `'EMPLOYEE'` |
| `status` | String | Yes | No | `'PENDING_APPROVAL'` | — | Enum: `'PENDING_APPROVAL'`, `'ACTIVE'`, `'REJECTED'`, `'SUSPENDED'` |
| `employeeId` | String | No | No | null | `employees.employeeCode` | Linked corporate Employee ID |
| `rejectionReason`| String | No | No | null | — | Explanation if rejected by HR |
| `lastLogin` | Date | No | No | null | — | Last successful login timestamp |
| `createdAt` | Date | Yes | No | Date.now | — | Timestamp of account creation |
| `updatedAt` | Date | Yes | No | Date.now | — | Timestamp of last modification |

### Indexes
- `{ email: 1 }` (Unique)
- `{ role: 1, status: 1 }`

### Example Document
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "email": "priya.verma@payroll360.internal",
  "passwordHash": "$2a$10$7vN49D...hash",
  "name": "Priya Verma",
  "role": "HR",
  "status": "ACTIVE",
  "employeeId": "EMP-1002",
  "rejectionReason": null,
  "lastLogin": "2026-09-23T08:30:00.000Z",
  "createdAt": "2026-01-10T10:00:00.000Z",
  "updatedAt": "2026-09-23T08:30:00.000Z"
}
```

---

## 2. Collection: `employees`

### Purpose
Represents comprehensive human capital records, departmental alignments, statutory identifiers, and banking details.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `employeeCode` | String | Yes | Yes | — | — | Corporate ID (e.g., `'EMP-1001'`) |
| `userId` | ObjectId | Yes | Yes | — | `users` | Linked authentication user |
| `name` | String | Yes | No | — | — | Official employee name |
| `email` | String | Yes | Yes | — | — | Corporate email address |
| `phone` | String | Yes | No | — | — | Contact telephone number |
| `avatarInitials`| String | No | No | — | — | 2-letter uppercase initials |
| `jobTitle` | String | Yes | No | — | — | Official organizational designation |
| `department` | String | Yes | No | — | `departments.name` | Department name |
| `employmentStatus`| String | Yes | No | `'Active'` | — | Enum: `'Active'`, `'Probation'`, `'Notice Period'`, `'Terminated'` |
| `employmentType`| String | Yes | No | `'Full-Time'`| — | Enum: `'Full-Time'`, `'Contract'`, `'Intern'` |
| `joinedDate` | String | Yes | No | — | — | Joining date (`YYYY-MM-DD`) |
| `manager` | String | No | No | — | — | Name or Code of reporting manager |
| `panNumber` | String | No | No | — | — | Permanent Account Number (PAN) |
| `pfNumber` | String | No | No | — | — | Provident Fund Account Number |
| `uan` | String | No | No | — | — | Universal Account Number (UAN) |
| `activeContractId`| String | No | No | — | `contracts._id` | Current employment contract |
| `taxRegime` | String | Yes | No | `'New'` | — | Enum: `'New'`, `'Old'` |
| `location` | String | Yes | No | `'Bengaluru'` | — | Primary office branch / city |
| `bankDetails` | Object | Yes | No | — | — | Subdocument: account, IFSC, bank name, verification |
| `bankDetails.accountNumber` | String | No | No | `""` | — | Bank account number |
| `bankDetails.ifscCode` | String | No | No | `""` | — | IFSC routing code |
| `bankDetails.bankName` | String | No | No | `""` | — | Name of banking institution |
| `bankDetails.isVerified` | Boolean | Yes | No | `false` | — | Whether bank details are verified |

### Indexes
- `{ employeeCode: 1 }` (Unique)
- `{ userId: 1 }` (Unique)
- `{ department: 1, employmentStatus: 1 }`

### Example Document
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "employeeCode": "EMP-1001",
  "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Rahul Sharma",
  "email": "rahul.sharma@payroll360.internal",
  "phone": "+91 98765 43210",
  "avatarInitials": "RS",
  "jobTitle": "Lead Frontend Architect",
  "department": "Engineering",
  "employmentStatus": "Active",
  "employmentType": "Full-Time",
  "joinedDate": "2023-04-15",
  "manager": "Vikram Malhotra",
  "panNumber": "ABCPS1234D",
  "pfNumber": "MH/BAN/0045612/000/1001",
  "uan": "100904561234",
  "activeContractId": "CNT-2026-001",
  "taxRegime": "New",
  "location": "Bengaluru",
  "bankDetails": {
    "accountNumber": "91802001928374",
    "ifscCode": "HDFC0000456",
    "bankName": "HDFC Bank Ltd",
    "isVerified": true
  }
}
```

---

## 3. Collection: `departments`

### Purpose
Maintains organizational unit groupings, division heads, and operational headcounts.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `code` | String | Yes | Yes | — | — | Short code (e.g. `'ENG'`, `'FIN'`) |
| `name` | String | Yes | Yes | — | — | Department name |
| `description` | String | No | No | `""` | — | Department function description |
| `headOfDepartment` | String | No | No | — | `employees.name` | Designation / name of HOD |
| `budget` | Number | No | No | 0 | — | Annual allocated budget in INR |
| `createdAt` | Date | Yes | No | Date.now | — | Creation timestamp |

### Indexes
- `{ code: 1 }` (Unique)
- `{ name: 1 }` (Unique)

---

## 4. Collection: `contracts`

### Purpose
Records legal employment contracts, compensation packages, and effective tenure dates.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `contractCode` | String | Yes | Yes | — | — | Unique code (e.g. `'CNT-2026-001'`) |
| `employeeId` | String | Yes | No | — | `employees.employeeCode` | Associated employee |
| `jobTitle` | String | Yes | No | — | — | Contracted designation |
| `monthlySalary` | Number | Yes | No | — | — | Monthly base compensation |
| `annualCtc` | Number | Yes | No | — | — | Annual Cost to Company |
| `salaryStructureId` | String | Yes | No | `'STRUCTURE-STANDARD'` | `salarystructures.code` | Active salary ruleset |
| `startDate` | String | Yes | No | — | — | Effective start date (`YYYY-MM-DD`) |
| `endDate` | String | Yes | No | — | — | Renewal / expiration date |
| `status` | String | Yes | No | `'Active'` | — | Enum: `'Active'`, `'Expired'`, `'Draft'` |
| `year` | Number | Yes | No | 2026 | — | Fiscal year |
| `documentRef` | String | No | No | null | — | Storage reference for PDF contract |

---

## 5. Collection: `attendance`

### Purpose
Logs daily check-in, check-out, duration, and punctuality status for each employee.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `employeeId` | String | Yes | No | — | `employees.employeeCode` | Employee reference |
| `date` | String | Yes | No | — | — | Date string (`YYYY-MM-DD`) |
| `checkIn` | String | Yes | No | — | — | Time string (e.g., `'09:14 AM'`) |
| `checkOut` | String | No | No | `""` | — | Time string (e.g., `'06:18 PM'`) |
| `workedHours` | Number | Yes | No | 0 | — | Calculated working hours |
| `overtimeHours` | Number | Yes | No | 0 | — | Overtime hours beyond standard shift |
| `status` | String | Yes | No | `'Present'` | — | Enum: `'Present'`, `'Late'`, `'Absent'`, `'Needs Review'`, `'Half Day'` |
| `notes` | String | No | No | null | — | Attendance remarks or justification |

### Indexes
- `{ employeeId: 1, date: 1 }` (Unique compound index)
- `{ date: 1, status: 1 }`

---

## 6. Collection: `leaveRequests`

### Purpose
Captures time-off applications submitted by employees for HR review.

### Fields Specification
| Field | Type | Required | Unique | Default | References | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Yes | Auto | — | Primary identifier |
| `employeeId` | String | Yes | No | — | `employees.employeeCode` | Applying employee |
| `leaveType` | String | Yes | No | — | — | Enum: `'Casual Leave'`, `'Sick Leave'`, `'Earned Leave'`, `'Unpaid Leave (LWP)'` |
| `startDate` | String | Yes | No | — | — | First day of leave (`YYYY-MM-DD`) |
| `endDate` | String | Yes | No | — | — | Final day of leave (`YYYY-MM-DD`) |
| `days` | Number | Yes | No | 1 | — | Total business days requested |
| `reason` | String | Yes | No | — | — | Justification for leave |
| `status` | String | Yes | No | `'Pending'` | — | Enum: `'Pending'`, `'Approved'`, `'Refused'` |
| `approver` | String | No | No | null | — | HR manager who decided the request |
| `rejectionNote` | String | No | No | null | — | Reason if refused |
| `appliedOn` | String | Yes | No | — | — | Submission timestamp |

### Indexes
- `{ employeeId: 1, status: 1 }`
- `{ status: 1, appliedOn: -1 }`

---

## 7. Collection: `leaveBalances`

### Purpose
Maintains current accruals and usage counters for each leave category per employee.

### Fields Specification
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Auto | Primary identifier |
| `employeeId` | String | Yes (Unique) | — | Ref: `employees.employeeCode` |
| `casualTotal` | Number | Yes | 12 | Total annual casual leave quota |
| `casualUsed` | Number | Yes | 0 | Consumed casual days |
| `sickTotal` | Number | Yes | 10 | Total annual sick leave quota |
| `sickUsed` | Number | Yes | 0 | Consumed sick days |
| `earnedTotal` | Number | Yes | 18 | Total annual earned leave quota |
| `earnedUsed` | Number | Yes | 0 | Consumed earned days |
| `unpaidLwpDays`| Number | Yes | 0 | Accumulated Leave Without Pay days |

---

## 8. Collection: `payRuns`

### Purpose
Represents a monthly organizational payroll processing execution batch.

### Fields Specification
| Field | Type | Required | Unique | Default | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Auto | Primary identifier |
| `period` | String | Yes | Yes | — | e.g. `'September 2026'` |
| `startDate` | String | Yes | — | Start of cycle (`YYYY-MM-DD`) |
| `endDate` | String | Yes | — | End of cycle (`YYYY-MM-DD`) |
| `payDate` | String | Yes | — | Disbursement date (`YYYY-MM-DD`) |
| `status` | String | Yes | `'Draft'` | Enum: `'Draft'`, `'Computed'`, `'Validated'`, `'Paid'` |
| `totalEmployees`| Number | Yes | 0 | Total headcount processed in cycle |
| `totalGross` | Number | Yes | 0 | Cumulative gross earnings (INR) |
| `totalDeductions`| Number| Yes | 0 | Cumulative deductions (INR) |
| `totalNet` | Number | Yes | 0 | Cumulative net payout (INR) |
| `lastCalculatedAt`| Date | No | null | Timestamp of salary recalculation |
| `validatedAt` | Date | No | null | Timestamp of final lock |
| `paidAt` | Date | No | null | Timestamp of disbursement execution |

---

## 9. Collection: `payslips`

### Purpose
Contains the finalized, immutable snapshot of an employee's earnings, deductions, and payment details for a specific payroll cycle.

### Fields Specification
| Field | Type | Required | Unique | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Auto | Primary identifier |
| `payslipCode` | String | Yes | Yes | Unique reference (e.g., `'PS-202609-1001'`) |
| `payRunId` | ObjectId | Yes | No | Linked `payRuns` batch |
| `employeeId` | String | Yes | No | Linked `employees.employeeCode` |
| `period` | String | Yes | No | Pay cycle label (e.g. `'September 2026'`) |
| `payDate` | String | Yes | No | Disbursement date |
| `employeeSnapshot` | Object | Yes | No | Frozen snapshot of employee designation, PAN, bank details |
| `attendanceSnapshot`| Object | Yes | No | Worked days, paid leaves, LWP days |
| `earnings` | Array | Yes | No | Itemized list: `[{ name: 'Basic', amount: 95000 }, ...]` |
| `deductions` | Array | Yes | No | Itemized list: `[{ name: 'PF', amount: 11400 }, ...]` |
| `grossPay` | Number | Yes | No | Total gross earnings |
| `totalDeductions`| Number | Yes | No | Total statutory and tax deductions |
| `netPay` | Number | Yes | No | Final disbursed net amount |
| `netPayInWords` | String | Yes | No | English denomination representation |
| `paymentStatus` | String | Yes | No | `'Paid'` |

---

## 10. Collection: `documents`

### Purpose
Tracks official organizational and employee files (offer letters, contracts, compliance certificates).

### Fields Specification
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Auto | Primary identifier |
| `title` | String | Yes | — | Document title (e.g. `'Employment Agreement'`) |
| `category` | String | Yes | `'Contract'`| Enum: `'Contract'`, `'Offer Letter'`, `'Policy'`, `'Tax Form'` |
| `employeeId` | String | No | null | If null, accessible to all; otherwise bound to employee |
| `fileUrl` | String | Yes | — | Storage path / URL |
| `uploadedBy` | String | Yes | — | User ID of uploader |
| `uploadedAt` | Date | Yes | Date.now | Upload timestamp |

---

## 11. Collection: `notifications`

### Purpose
Provides internal system alerts, approval notices, and broadcast messages.

### Fields Specification
| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Auto | Primary identifier |
| `userId` | ObjectId | Yes | — | Recipient user ID |
| `title` | String | Yes | — | Notification title |
| `message` | String | Yes | — | Notification content |
| `type` | String | Yes | `'info'` | Enum: `'info'`, `'success'`, `'warning'`, `'error'` |
| `isRead` | Boolean | Yes | false | Read receipt flag |
| `link` | String | No | null | Click-through route |
| `createdAt` | Date | Yes | Date.now | Alert generation timestamp |

---

## 12. Collection: `auditLogs`

### Purpose
Maintains an immutable record of system and administrative events for compliance and security forensics.

### Fields Specification
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Yes | Primary identifier |
| `actorId` | String | Yes | User ID or Email of initiator |
| `action` | String | Yes | Event tag (e.g., `'USER_REGISTERED'`, `'REGISTRATION_APPROVED'`, `'PAYROLL_PROCESSED'`) |
| `resourceType` | String | Yes | Entity name (e.g., `'User'`, `'Employee'`, `'PayRun'`) |
| `resourceId` | String | Yes | Identifier of affected entity |
| `details` | Object | No | Metadata or state diff |
| `ipAddress` | String | No | Client IP address |
| `timestamp` | Date | Yes | Time of action (Default: `Date.now`) |
