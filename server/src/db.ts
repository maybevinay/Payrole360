import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'peoplepay360.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'EMPLOYEE', -- 'ADMIN' | 'HR' | 'EMPLOYEE'
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'
      employee_id TEXT,
      phone TEXT DEFAULT '',
      department TEXT DEFAULT 'Engineering',
      job_title TEXT DEFAULT 'Associate',
      date_of_birth TEXT DEFAULT '',
      address TEXT DEFAULT '',
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      avatar_initials TEXT,
      job_title TEXT NOT NULL,
      department TEXT NOT NULL,
      employment_status TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      joined_date TEXT NOT NULL,
      manager TEXT,
      pan_number TEXT,
      pf_number TEXT,
      uan TEXT,
      active_contract_id TEXT,
      tax_regime TEXT DEFAULT 'New',
      location TEXT,
      bank_account TEXT DEFAULT '',
      bank_ifsc TEXT DEFAULT '',
      bank_name TEXT DEFAULT '',
      bank_verified INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      head_of_department TEXT DEFAULT '',
      budget REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      job_title TEXT NOT NULL,
      monthly_salary REAL NOT NULL,
      annual_ctc REAL NOT NULL,
      salary_structure_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL, -- 'Active' | 'Expired' | 'Pending'
      year INTEGER NOT NULL,
      document_ref TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      worked_hours REAL NOT NULL,
      overtime_hours REAL DEFAULT 0,
      status TEXT NOT NULL, -- 'Present' | 'Late' | 'Absent' | 'Needs Review' | 'Half Day'
      notes TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      employee_id TEXT PRIMARY KEY,
      casual_total INTEGER DEFAULT 12,
      casual_used INTEGER DEFAULT 0,
      sick_total INTEGER DEFAULT 10,
      sick_used INTEGER DEFAULT 0,
      earned_total INTEGER DEFAULT 18,
      earned_used INTEGER DEFAULT 0,
      unpaid_lwp_days INTEGER DEFAULT 0,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS time_off_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days INTEGER NOT NULL,
      reason TEXT,
      status TEXT NOT NULL, -- 'Pending' | 'Approved' | 'Refused'
      approver TEXT,
      rejection_note TEXT,
      applied_on TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS salary_structures (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS salary_rules (
      id TEXT PRIMARY KEY,
      structure_id TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      calc_type TEXT NOT NULL,
      expression TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      description TEXT,
      FOREIGN KEY (structure_id) REFERENCES salary_structures(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pay_runs (
      id TEXT PRIMARY KEY,
      period TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      pay_date TEXT NOT NULL,
      salary_structure_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'Draft' | 'Computed' | 'Validated' | 'Paid'
      total_employees INTEGER NOT NULL,
      total_gross REAL NOT NULL,
      total_deductions REAL NOT NULL,
      total_net REAL NOT NULL,
      last_calculated_at TEXT,
      validated_at TEXT,
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS employee_payrolls (
      id TEXT PRIMARY KEY,
      pay_run_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      contract_id TEXT NOT NULL,
      worked_days INTEGER NOT NULL,
      total_working_days INTEGER NOT NULL,
      lwp_days INTEGER DEFAULT 0,
      basic REAL NOT NULL,
      hra REAL NOT NULL,
      transport REAL NOT NULL,
      special REAL NOT NULL,
      overtime REAL DEFAULT 0,
      gross REAL NOT NULL,
      pf REAL NOT NULL,
      pt REAL NOT NULL,
      tds REAL NOT NULL,
      lwp_deduction REAL DEFAULT 0,
      total_deductions REAL NOT NULL,
      net_pay REAL NOT NULL,
      status TEXT NOT NULL, -- 'Ready' | 'Missing Bank Details' | 'Computed' | 'Paid'
      FOREIGN KEY (pay_run_id) REFERENCES pay_runs(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Contract' | 'Offer Letter' | 'Policy' | 'Tax Form'
      employee_id TEXT,
      file_url TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info', -- 'info' | 'success' | 'warning' | 'error'
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      details TEXT,
      ip_address TEXT DEFAULT '127.0.0.1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Run dynamic column additions for backwards compatibility if table previously existed without new columns
  const userColumns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  const columnNames = userColumns.map(c => c.name);

  if (!columnNames.includes('status')) {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'ACTIVE'");
  }
  if (!columnNames.includes('phone')) {
    db.exec("ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''");
  }
  if (!columnNames.includes('department')) {
    db.exec("ALTER TABLE users ADD COLUMN department TEXT DEFAULT 'Engineering'");
  }
  if (!columnNames.includes('job_title')) {
    db.exec("ALTER TABLE users ADD COLUMN job_title TEXT DEFAULT 'Associate'");
  }
  if (!columnNames.includes('date_of_birth')) {
    db.exec("ALTER TABLE users ADD COLUMN date_of_birth TEXT DEFAULT ''");
  }
  if (!columnNames.includes('address')) {
    db.exec("ALTER TABLE users ADD COLUMN address TEXT DEFAULT ''");
  }
  if (!columnNames.includes('rejection_reason')) {
    db.exec("ALTER TABLE users ADD COLUMN rejection_reason TEXT DEFAULT NULL");
  }

  const timeOffColumns = db.prepare("PRAGMA table_info(time_off_requests)").all() as { name: string }[];
  if (!timeOffColumns.some(c => c.name === 'rejection_note')) {
    db.exec("ALTER TABLE time_off_requests ADD COLUMN rejection_note TEXT DEFAULT NULL");
  }
}
