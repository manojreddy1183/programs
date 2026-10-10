import mongoose from 'mongoose';

const busSchema = new mongoose.Schema(
  {
    busNumber: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    capacity: { type: Number, required: true, min: 10, max: 90 },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', default: null },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Maintenance'],
      default: 'Active'
    },
    lastMaintenanceDate: { type: Date },
    nextInspectionDate: { type: Date },
    fuelType: { type: String, default: 'Clean Diesel' },
    mileageKm: { type: Number, default: 0 },
    hasGps: { type: Boolean, default: true },
    hasCctv: { type: Boolean, default: true },
    speedLimitKmh: { type: Number, default: 45 }
  },
  { timestamps: true }
);

export const Bus = mongoose.model('Bus', busSchema);
