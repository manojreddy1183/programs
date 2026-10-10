import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    recordId: { type: String, required: true, unique: true },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    serviceType: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    completionDate: { type: Date },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'In Progress'
    },
    costUsd: { type: Number, default: 0 },
    technician: { type: String },
    notes: { type: String },
    odometerKm: { type: Number }
  },
  { timestamps: true }
);

export const MaintenanceRecord = mongoose.model('MaintenanceRecord', maintenanceSchema);
