import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  employeeId?: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  dateOfBirth?: string;
  address?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['ADMIN', 'HR', 'EMPLOYEE'], default: 'EMPLOYEE', required: true },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING_APPROVAL',
      required: true,
    },
    employeeId: { type: String, default: null },
    phone: { type: String, default: '' },
    department: { type: String, default: 'Engineering' },
    jobTitle: { type: String, default: 'Associate' },
    dateOfBirth: { type: String, default: '' },
    address: { type: String, default: '' },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
