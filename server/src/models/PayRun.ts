import mongoose, { Schema, Document } from 'mongoose';

export interface IPayRun extends Document {
  period: string; // e.g. 'September 2026'
  startDate: string;
  endDate: string;
  payDate: string;
  salaryStructureId: string;
  status: 'Draft' | 'Computed' | 'Validated' | 'Paid';
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  lastCalculatedAt?: string;
  validatedAt?: string;
  paidAt?: string;
}

const PayRunSchema = new Schema<IPayRun>(
  {
    period: { type: String, required: true, unique: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    payDate: { type: String, required: true },
    salaryStructureId: { type: String, default: 'STRUCTURE-STANDARD' },
    status: {
      type: String,
      enum: ['Draft', 'Computed', 'Validated', 'Paid'],
      default: 'Draft',
    },
    totalEmployees: { type: Number, default: 0 },
    totalGross: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNet: { type: Number, default: 0 },
    lastCalculatedAt: { type: String, default: null },
    validatedAt: { type: String, default: null },
    paidAt: { type: String, default: null },
  },
  { timestamps: true }
);

export const PayRunModel = mongoose.models.PayRun || mongoose.model<IPayRun>('PayRun', PayRunSchema);
