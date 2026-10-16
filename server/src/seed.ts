import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db';
import {
  INITIAL_EMPLOYEES,
  INITIAL_CONTRACTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_BALANCES,
  INITIAL_TIME_OFF_REQUESTS,
  INITIAL_SALARY_STRUCTURES,
  INITIAL_PAY_RUNS,
} from '../../src/data/initialData';

export function seedDatabase() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    // If existing users have old roles like 'HR_ADMIN' or lack 'status', update them
    db.prepare(`UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE role = 'HR_ADMIN' OR email LIKE 'admin%'`).run();
    db.prepare(`UPDATE users SET role = 'HR', status = 'ACTIVE' WHERE role = 'MANAGER' OR email LIKE 'priya%'`).run();
    db.prepare(`UPDATE users SET role = 'EMPLOYEE', status = 'ACTIVE' WHERE email LIKE 'rahul%'`).run();

    // Ensure pending and suspended demo accounts exist
    const pendingExists = db.prepare(`SELECT id FROM users WHERE email = 'arjun.patel@example.com'`).get();
    if (!pendingExists) {
      const salt = bcrypt.genSaltSync(10);
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title, date_of_birth, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-pending-04',
        'arjun.patel@example.com',
        bcrypt.hashSync('arjun123', salt),
        'Arjun Patel',
        'EMPLOYEE',
        'PENDING_APPROVAL',
        null,
        '+91 99887 76655',
        'Engineering',
        'Full Stack Developer',
        '1995-08-14',
        '402 Palm Heights, Bengaluru'
      );
    }

    const suspendedExists = db.prepare(`SELECT id FROM users WHERE email = 'karan.singh@example.com'`).get();
    if (!suspendedExists) {
      const salt = bcrypt.genSaltSync(10);
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title, date_of_birth, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'usr-susp-05',
        'karan.singh@example.com',
        bcrypt.hashSync('karan123', salt),
        'Karan Singh',
        'EMPLOYEE',
        'SUSPENDED',
        null,
        '+91 98112 23344',
        'Sales',
        'Sales Representative',
        '1992-03-21',
        '12 Indiranagar, Bengaluru'
      );
    }

    return;
  }

  console.log('⚡ Seeding database with production-grade relational enterprise records...');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title, date_of_birth, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const salt = bcrypt.genSaltSync(10);

  // 1. System Admin
  insertUser.run(
    'usr-admin-01',
    'admin@payroll360.internal',
    bcrypt.hashSync('admin123', salt),
    'Vikram Malhotra',
    'ADMIN',
    'ACTIVE',
    'EMP-1005',
    '+91 98765 00001',
    'Operations',
    'Vice President of Operations',
    '1982-11-04',
    '701 Prestige Towers, Bengaluru'
  );

  // Also support admin@peoplepay360.com for backward compatibility
  insertUser.run(
    'usr-admin-legacy',
    'admin@peoplepay360.com',
    bcrypt.hashSync('admin123', salt),
    'Vikram Malhotra',
    'ADMIN',
    'ACTIVE',
    'EMP-1005',
    '+91 98765 00001',
    'Operations',
    'Vice President of Operations',
    '1982-11-04',
    '701 Prestige Towers, Bengaluru'
  );

  // 2. HR Manager
  insertUser.run(
    'usr-hr-02',
    'priya.verma@payroll360.internal',
    bcrypt.hashSync('priya123', salt),
    'Priya Verma',
    'HR',
    'ACTIVE',
    'EMP-1002',
    '+91 98765 00002',
    'HR',
    'Senior HR Manager',
    '1988-06-18',
    '304 Coral Spire, Bengaluru'
  );

  // 3. Active Employee
  insertUser.run(
    'usr-emp-03',
    'rahul.sharma@payroll360.internal',
    bcrypt.hashSync('rahul123', salt),
    'Rahul Sharma',
    'EMPLOYEE',
    'ACTIVE',
    'EMP-1001',
    '+91 98765 43210',
    'Engineering',
    'Lead Frontend Architect',
    '1991-04-12',
    '502 Lake View Heights, Bengaluru'
  );

  // 4. Pending Registration Candidate (Awaiting HR review)
  insertUser.run(
    'usr-pending-04',
    'arjun.patel@example.com',
    bcrypt.hashSync('arjun123', salt),
    'Arjun Patel',
    'EMPLOYEE',
    'PENDING_APPROVAL',
    null,
    '+91 99887 76655',
    'Engineering',
    'Full Stack Developer',
    '1995-08-14',
    '402 Palm Heights, Bengaluru'
  );

  // 5. Suspended User Account
  insertUser.run(
    'usr-susp-05',
    'karan.singh@example.com',
    bcrypt.hashSync('karan123', salt),
    'Karan Singh',
    'EMPLOYEE',
    'SUSPENDED',
    null,
    '+91 98112 23344',
    'Sales',
    'Sales Representative',
    '1992-03-21',
    '12 Indiranagar, Bengaluru'
  );

  // Seed Departments
  const departments = [
    { id: 'dept-eng', code: 'ENG', name: 'Engineering', description: 'Core product engineering, architecture & QA', head: 'Rahul Sharma', budget: 15000000 },
    { id: 'dept-sales', code: 'SALES', name: 'Sales', description: 'Enterprise sales, account executives & business development', head: 'Amitabh Sen', budget: 8500000 },
    { id: 'dept-hr', code: 'HR', name: 'HR', description: 'People operations, recruiting, payroll & workplace culture', head: 'Priya Verma', budget: 4500000 },
    { id: 'dept-ops', code: 'OPS', name: 'Operations', description: 'Global operations, compliance & legal administration', head: 'Vikram Malhotra', budget: 6000000 },
    { id: 'dept-fin', code: 'FIN', name: 'Finance', description: 'Financial accounting, corporate taxation & audits', head: 'Neha Gupta', budget: 5200000 },
    { id: 'dept-prod', code: 'PROD', name: 'Product', description: 'Product management, user research & UI/UX design', head: 'Rohan Mehta', budget: 7000000 },
  ];

  const insertDept = db.prepare(`
    INSERT INTO departments (id, code, name, description, head_of_department, budget)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const d of departments) {
    insertDept.run(d.id, d.code, d.name, d.description, d.head, d.budget);
  }

  // Seed Employees
  const insertEmp = db.prepare(`
    INSERT INTO employees (
      id, name, email, phone, avatar_initials, job_title, department,
      employment_status, employment_type, joined_date, manager,
      pan_number, pf_number, uan, active_contract_id, tax_regime,
      location, bank_account, bank_ifsc, bank_name, bank_verified
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  for (const emp of INITIAL_EMPLOYEES) {
    insertEmp.run(
      emp.id,
      emp.name,
      emp.email,
      emp.phone,
      emp.avatarInitials,
      emp.jobTitle,
      emp.department,
      emp.employmentStatus,
      emp.employmentType,
      emp.joinedDate,
      emp.manager,
      emp.panNumber,
      emp.pfNumber,
      emp.uan,
      emp.activeContractId,
      emp.taxRegime,
      emp.location,
      emp.bankDetails.accountNumber,
      emp.bankDetails.ifscCode,
      emp.bankDetails.bankName,
      emp.bankDetails.isVerified ? 1 : 0
    );
  }

  // Seed Contracts
  const insertContract = db.prepare(`
    INSERT INTO contracts (
      id, employee_id, job_title, monthly_salary, annual_ctc,
      salary_structure_id, start_date, end_date, status, year, document_ref
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of INITIAL_CONTRACTS) {
    insertContract.run(
      c.id,
      c.employeeId,
      c.jobTitle,
      c.monthlySalary,
      c.annualCtc,
      c.salaryStructureId,
      c.startDate,
      c.endDate,
      c.status,
      c.year,
      c.documentRef || null
    );
  }

  // Seed Attendance
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (
      id, employee_id, date, check_in, check_out,
      worked_hours, overtime_hours, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of INITIAL_ATTENDANCE) {
    insertAttendance.run(
      a.id,
      a.employeeId,
      a.date,
      a.checkIn,
      a.checkOut,
      a.workedHours,
      a.overtimeHours,
      a.status,
      a.notes || null
    );
  }

  // Seed Leave Balances
  const insertLeaveBal = db.prepare(`
    INSERT INTO leave_balances (
      employee_id, casual_total, casual_used, sick_total, sick_used,
      earned_total, earned_used, unpaid_lwp_days
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const [empId, bal] of Object.entries(INITIAL_LEAVE_BALANCES)) {
    insertLeaveBal.run(
      empId,
      bal.casual.total,
      bal.casual.used,
      bal.sick.total,
      bal.sick.used,
      bal.earned.total,
      bal.earned.used,
      bal.unpaidLwpDays
    );
  }

  // Seed Time Off Requests
  const insertTimeOff = db.prepare(`
    INSERT INTO time_off_requests (
      id, employee_id, leave_type, start_date, end_date,
      days, reason, status, approver, applied_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of INITIAL_TIME_OFF_REQUESTS) {
    insertTimeOff.run(
      t.id,
      t.employeeId,
      t.leaveType,
      t.startDate,
      t.endDate,
      t.days,
      t.reason,
      t.status,
      t.approver,
      t.appliedOn
    );
  }

  // Seed Salary Structures & Rules
  const insertStructure = db.prepare(`
    INSERT INTO salary_structures (id, code, name, description)
    VALUES (?, ?, ?, ?)
  `);

  const insertRule = db.prepare(`
    INSERT INTO salary_rules (
      id, structure_id, sequence, code, name, category,
      calc_type, expression, status, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of INITIAL_SALARY_STRUCTURES) {
    insertStructure.run(s.id, s.code, s.name, s.description);
    for (const r of s.rules) {
      insertRule.run(
        r.id,
        s.id,
        r.sequence,
        r.code,
        r.name,
        r.category,
        r.calcType,
        r.expression,
        r.status,
        r.description || null
      );
    }
  }

  // Seed Pay Runs & Employee Payrolls
  const insertPayRun = db.prepare(`
    INSERT INTO pay_runs (
      id, period, start_date, end_date, pay_date,
      salary_structure_id, status, total_employees, total_gross,
      total_deductions, total_net, last_calculated_at, validated_at, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEmpPayroll = db.prepare(`
    INSERT INTO employee_payrolls (
      id, pay_run_id, employee_id, contract_id, worked_days,
      total_working_days, lwp_days, basic, hra, transport, special,
      overtime, gross, pf, pt, tds, lwp_deduction, total_deductions,
      net_pay, status
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  for (const pr of INITIAL_PAY_RUNS) {
    insertPayRun.run(
      pr.id,
      pr.period,
      pr.startDate,
      pr.endDate,
      pr.payDate,
      pr.salaryStructureId,
      pr.status,
      pr.totalEmployees,
      pr.totalGross,
      pr.totalDeductions,
      pr.totalNet,
      pr.lastCalculatedAt || null,
      pr.validatedAt || null,
      pr.paidAt || null
    );

    for (const ep of pr.employeePayrolls) {
      insertEmpPayroll.run(
        ep.id,
        pr.id,
        ep.employeeId,
        ep.contractId,
        ep.workedDays,
        ep.totalWorkingDays,
        ep.lwpDays,
        ep.earnings.basic,
        ep.earnings.hra,
        ep.earnings.transportAllowance,
        ep.earnings.specialAllowance,
        ep.earnings.overtimePay,
        ep.earnings.gross,
        ep.deductions.pf,
        ep.deductions.pt,
        ep.deductions.tds,
        ep.deductions.lwpDeduction,
        ep.deductions.totalDeductions,
        ep.netPay,
        ep.status
      );
    }
  }

  // Seed Notifications
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, is_read, link)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('notif-1', 'usr-emp-03', 'Payslip Released', 'Your payslip for September 2026 is ready for review and download.', 'success', 0, '/employee/payslips');
  insertNotif.run('notif-2', 'usr-emp-03', 'Attendance Verified', 'Your check-in for today has been reconciled at 09:14 AM.', 'info', 1, '/employee/attendance');
  insertNotif.run('notif-3', 'usr-hr-02', 'Pending Registration', 'Arjun Patel submitted a new employee registration awaiting approval.', 'warning', 0, '/hr/pending-approvals');
  insertNotif.run('notif-4', 'usr-hr-02', 'Leave Request Submitted', 'Rahul Sharma requested 2 days of Casual Leave.', 'info', 0, '/hr/timeoff');

  // Seed Audit Logs
  const insertLog = db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, action, resource_type, resource_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLog.run('log-1', 'usr-admin-01', 'Vikram Malhotra', 'SYSTEM_INITIALIZED', 'Platform', 'SYSTEM', JSON.stringify({ version: '1.0.0' }));
  insertLog.run('log-2', 'usr-hr-02', 'Priya Verma', 'PAYROLL_VALIDATED', 'PayRun', 'PR-2026-09', JSON.stringify({ period: 'September 2026' }));

  console.log('✓ Database successfully seeded with enterprise roles, statuses, and multi-tier demo data.');
}
