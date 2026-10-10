import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    classGrade: { type: String, required: true },
    section: { type: String, required: true },
    parentName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
    assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    pickupStop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', default: null },
    seatNumber: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    emergencyContact: { type: String },
    bloodGroup: { type: String, default: 'O+' },
    allergies: { type: String, default: 'None' },
    registeredDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Student = mongoose.model('Student', studentSchema);
