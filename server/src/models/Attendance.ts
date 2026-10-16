import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workedHours: number;
  overtimeHours: number;
  status: 'Present' | 'Late' | 'Absent' | 'Needs Review' | 'Half Day';
  notes?: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: '' },
    workedHours: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Absent', 'Needs Review', 'Half Day'],
      default: 'Present',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
