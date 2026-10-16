import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
  code: string;
  name: string;
  description: string;
  headOfDepartment: string;
  budget: number;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    headOfDepartment: { type: String, default: '' },
    budget: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const DepartmentModel = mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
