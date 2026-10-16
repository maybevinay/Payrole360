import mongoose, { Schema, Document } from 'mongoose';

export interface IPayslip extends Document {
  payslipCode: string;
  payRunId: string;
  employeeId: string;
  period: string;
  payDate: string;
  employeeSnapshot: {
    name: string;
    employeeId: string;
    jobTitle: string;
    department: string;
    joinedDate: string;
    pan: string;
    pfNumber: string;
    uan: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    location: string;
  };
  attendanceSnapshot: {
    totalDays: number;
    workedDays: number;
    paidLeaves: number;
    unpaidLeaves: number;
  };
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
  paymentStatus: string;
}

const PayslipSchema = new Schema<IPayslip>(
  {
    payslipCode: { type: String, required: true, unique: true },
    payRunId: { type: String, required: true, index: true },
    employeeId: { type: String, required: true, index: true },
    period: { type: String, required: true },
    payDate: { type: String, required: true },
    employeeSnapshot: { type: Schema.Types.Mixed, required: true },
    attendanceSnapshot: { type: Schema.Types.Mixed, required: true },
    earnings: [{ name: String, amount: Number }],
    deductions: [{ name: String, amount: Number }],
    grossPay: { type: Number, required: true },
    totalDeductions: { type: Number, required: true },
    netPay: { type: Number, required: true },
    netPayInWords: { type: String, required: true },
    paymentStatus: { type: String, default: 'Paid' },
  },
  { timestamps: true }
);

export const PayslipModel = mongoose.models.Payslip || mongoose.model<IPayslip>('Payslip', PayslipSchema);
