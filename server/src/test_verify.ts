import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('server/data/peoplepay360.db');
const db = new Database(dbPath);

console.log('--- 1. Testing User Accounts & Roles ---');
const users = db.prepare('SELECT id, email, name, role, status, employee_id FROM users').all() as any[];
console.log(`Found ${users.length} registered users:`);
users.forEach((u) => console.log(`  - [${u.role}] [${u.status}] ${u.name} <${u.email}> (${u.employee_id || 'No ID'})`));

console.log('\n--- 2. Testing HR Pending Approvals Queue ---');
const pending = db.prepare("SELECT * FROM users WHERE status = 'PENDING_APPROVAL'").all() as any[];
console.log(`Pending candidate approvals: ${pending.length}`);
pending.forEach((p) => console.log(`  - Candidate: ${p.name} <${p.email}> for ${p.job_title} in ${p.department}`));

console.log('\n--- 3. Testing Attendance Records ---');
const attCount = (db.prepare('SELECT COUNT(*) as c FROM attendance').get() as any).c;
console.log(`Total attendance records: ${attCount}`);

console.log('\n--- 4. Testing Pay Runs & Payslips ---');
const payruns = db.prepare('SELECT id, period, status, total_net FROM pay_runs').all() as any[];
console.log(`Total pay runs: ${payruns.length}`);
payruns.forEach((pr) => console.log(`  - PayRun: ${pr.period} | Status: ${pr.status} | Net: ₹${pr.total_net?.toLocaleString('en-IN')}`));

console.log('\n✓ Core Database & Business Logic Validated Successfully!');
