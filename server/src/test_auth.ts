import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.resolve('server/data/peoplepay360.db');
const db = new Database(dbPath);

const users = db.prepare('SELECT id, email, password_hash, role, status FROM users').all() as any[];

console.log('--- Current users in DB ---');
for (const u of users) {
  const matchAdmin = bcrypt.compareSync('admin123', u.password_hash);
  const matchPriya = bcrypt.compareSync('priya123', u.password_hash);
  const matchRahul = bcrypt.compareSync('rahul123', u.password_hash);
  const matchArjun = bcrypt.compareSync('arjun123', u.password_hash);
  console.log(`User: ${u.email}`);
  console.log(`  Role: ${u.role}, Status: ${u.status}`);
  console.log(`  Password matches: admin123=${matchAdmin}, priya123=${matchPriya}, rahul123=${matchRahul}, arjun123=${matchArjun}`);
}
