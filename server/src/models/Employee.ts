import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeCode: string; // e.g. EMP-1001
  userId?: string;
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  jobTitle: string;
  department: string;
  employmentStatus: 'Active' | 'Probation' | 'Notice Period' | 'Terminated';
  employmentType: 'Full-Time' | 'Contract' | 'Intern';
  joinedDate: string;
  manager: string;
  panNumber: string;
  pfNumber: string;
  uan: string;
  activeContractId?: string;
  taxRegime: 'New' | 'Old';
  location: string;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    isVerified: boolean;
  };
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeCode: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    avatarInitials: { type: String, default: 'EP' },
    jobTitle: { type: String, required: true },
    department: { type: String, required: true },
    employmentStatus: {
      type: String,
      enum: ['Active', 'Probation', 'Notice Period', 'Terminated'],
      default: 'Active',
    },
    employmentType: {
      type: String,
      enum: ['Full-Time', 'Contract', 'Intern'],
      default: 'Full-Time',
    },
    joinedDate: { type: String, required: true },
    manager: { type: String, default: 'Vikram Malhotra' },
    panNumber: { type: String, default: '' },
    pfNumber: { type: String, default: '' },
    uan: { type: String, default: '' },
    activeContractId: { type: String, default: '' },
    taxRegime: { type: String, enum: ['New', 'Old'], default: 'New' },
    location: { type: String, default: 'Bengaluru' },
    bankDetails: {
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
