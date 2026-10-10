import mongoose from 'mongoose';

const stopSchema = new mongoose.Schema(
  {
    stopId: { type: String, required: true, unique: true },
    stopName: { type: String, required: true },
    address: { type: String, required: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    pickupTime: { type: String, required: true },
    dropoffTime: { type: String, required: true },
    sequence: { type: Number, required: true },
    landmark: { type: String },
    studentCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Stop = mongoose.model('Stop', stopSchema);
