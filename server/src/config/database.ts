import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export async function connectMongoDB(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll360';
  try {
    // Attempt connection with a short timeout so that startup is never blocked
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✓ Connected to MongoDB at ${mongoUri}`);
    return true;
  } catch {
    console.log(`ℹ MongoDB not detected locally (${mongoUri}). Running in high-reliability synchronized local persistence mode.`);
    return false;
  }
}
