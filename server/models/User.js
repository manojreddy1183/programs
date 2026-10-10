import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: 'TransitPass2026!' },
    role: {
      type: String,
      enum: ['Administrator', 'Transport Manager', 'Viewer'],
      default: 'Viewer'
    },
    department: { type: String, default: 'School Transportation' },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    lastLogin: { type: Date, default: Date.now },
    avatar: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
