async function testLogin() {
  const personas = [
    { email: 'priya.verma@peoplepay360.internal', password: 'priya123', expected: 'HR' },
    { email: 'admin@peoplepay360.com', password: 'admin123', expected: 'ADMIN' },
    { email: 'rahul.sharma@peoplepay360.internal', password: 'rahul123', expected: 'EMPLOYEE' },
    { email: 'arjun.patel@example.com', password: 'arjun123', expected: 'PENDING' },
  ];

  for (const p of personas) {
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: p.email, password: p.password }),
      });
      const data = await res.json();
      console.log(`Login for ${p.email}: status=${res.status}`, data);
    } catch (e: any) {
      console.error(`Login failed for ${p.email}:`, e.message);
    }
  }
}

testLogin();
