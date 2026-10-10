import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    routeId: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    startingPoint: { type: String, required: true },
    destination: { type: String, required: true, default: 'Oakridge International School Campus' },
    totalStops: { type: Number, default: 0 },
    estimatedDuration: { type: String, default: '40 mins' },
    distanceKm: { type: Number, default: 15 },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', default: null },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    morningStartTime: { type: String, default: '07:05 AM' },
    afternoonStartTime: { type: String, default: '03:15 PM' }
  },
  { timestamps: true }
);

export const Route = mongoose.model('Route', routeSchema);
