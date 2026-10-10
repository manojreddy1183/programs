import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiryDate: { type: Date, required: true },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
    assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    employmentStatus: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Under Review'],
      default: 'Full-time'
    },
    yearsExperience: { type: Number, default: 5 },
    rating: { type: Number, default: 4.8 },
    emergencyContact: { type: String }
  },
  { timestamps: true }
);

export const Driver = mongoose.model('Driver', driverSchema);
