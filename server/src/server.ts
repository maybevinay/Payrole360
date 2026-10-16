import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './config/database';
import { seedDatabase } from './seed';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import hrRoutes from './routes/hr';
import employeeRoutes from './routes/employees';
import contractRoutes from './routes/contracts';
import attendanceRoutes from './routes/attendance';
import timeoffRoutes from './routes/timeoff';
import salaryRulesRoutes from './routes/salaryRules';
import payrunRoutes from './routes/payruns';
import payslipRoutes from './routes/payslips';
import notificationRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for observability
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const elapsed = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${elapsed}ms)`);
  });
  next();
});

// Initialize Database & Seed Records
connectMongoDB().catch(() => {});
seedDatabase();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeoffRoutes);
app.use('/api/leaves', timeoffRoutes);
app.use('/api/salary-rules', salaryRulesRoutes);
app.use('/api/payruns', payrunRoutes);
app.use('/api/payroll', payrunRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Payroll360 Enterprise API Server',
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`✓ Payroll360 enterprise backend running on http://localhost:${PORT}`);
});
