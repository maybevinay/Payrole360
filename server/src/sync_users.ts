import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.resolve('server/data/peoplepay360.db');
const db = new Database(dbPath);

const salt = bcrypt.genSaltSync(10);

const usersToEnsure = [
  {
    id: 'usr-admin-payroll360',
    email: 'admin@payroll360.internal',
    password: 'admin123',
    name: 'Vikram Malhotra',
    role: 'ADMIN',
    status: 'ACTIVE',
    employeeId: 'EMP-1005',
    phone: '+91 98765 00001',
    department: 'Operations',
    jobTitle: 'Vice President of Operations',
  },
  {
    id: 'usr-admin-legacy',
    email: 'admin@peoplepay360.com',
    password: 'admin123',
    name: 'Vikram Malhotra',
    role: 'ADMIN',
    status: 'ACTIVE',
    employeeId: 'EMP-1005',
    phone: '+91 98765 00001',
    department: 'Operations',
    jobTitle: 'Vice President of Operations',
  },
  {
    id: 'usr-hr-payroll360',
    email: 'priya.verma@payroll360.internal',
    password: 'priya123',
    name: 'Priya Verma',
    role: 'HR',
    status: 'ACTIVE',
    employeeId: 'EMP-1002',
    phone: '+91 98765 00002',
    department: 'HR',
    jobTitle: 'Senior HR Manager',
  },
  {
    id: 'usr-hr-legacy',
    email: 'priya.verma@peoplepay360.internal',
    password: 'priya123',
    name: 'Priya Verma',
    role: 'HR',
    status: 'ACTIVE',
    employeeId: 'EMP-1002',
    phone: '+91 98765 00002',
    department: 'HR',
    jobTitle: 'Senior HR Manager',
  },
  {
    id: 'usr-emp-payroll360',
    email: 'rahul.sharma@payroll360.internal',
    password: 'rahul123',
    name: 'Rahul Sharma',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employeeId: 'EMP-1001',
    phone: '+91 98765 43210',
    department: 'Engineering',
    jobTitle: 'Lead Frontend Architect',
  },
  {
    id: 'usr-emp-legacy',
    email: 'rahul.sharma@peoplepay360.internal',
    password: 'rahul123',
    name: 'Rahul Sharma',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    employeeId: 'EMP-1001',
    phone: '+91 98765 43210',
    department: 'Engineering',
    jobTitle: 'Lead Frontend Architect',
  },
  {
    id: 'usr-pending-04',
    email: 'arjun.patel@example.com',
    password: 'arjun123',
    name: 'Arjun Patel',
    role: 'EMPLOYEE',
    status: 'PENDING_APPROVAL',
    employeeId: null,
    phone: '+91 99887 76655',
    department: 'Engineering',
    jobTitle: 'Full Stack Developer',
  },
  {
    id: 'usr-susp-05',
    email: 'karan.singh@example.com',
    password: 'karan123',
    name: 'Karan Singh',
    role: 'EMPLOYEE',
    status: 'SUSPENDED',
    employeeId: null,
    phone: '+91 98112 23344',
    department: 'Sales',
    jobTitle: 'Sales Representative',
  },
];

const insertOrUpdate = db.prepare(`
  INSERT INTO users (id, email, password_hash, name, role, status, employee_id, phone, department, job_title)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(email) DO UPDATE SET
    password_hash = excluded.password_hash,
    role = excluded.role,
    status = excluded.status,
    employee_id = excluded.employee_id,
    phone = excluded.phone,
    department = excluded.department,
    job_title = excluded.job_title
`);

for (const u of usersToEnsure) {
  insertOrUpdate.run(
    u.id,
    u.email.toLowerCase(),
    bcrypt.hashSync(u.password, salt),
    u.name,
    u.role,
    u.status,
    u.employeeId,
    u.phone,
    u.department,
    u.jobTitle
  );
  console.log(`✓ Synchronized user: ${u.email} [${u.role}, ${u.status}]`);
}

console.log('All user accounts synchronized.');
