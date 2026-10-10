import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema(
  {
    scheduleId: { type: String, required: true, unique: true },
    shiftType: {
      type: String,
      enum: ['Morning Pickup', 'Afternoon Drop-off', 'Midday Kindergarten', 'Special Activity'],
      required: true
    },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    startTime: { type: String, required: true },
    campusArrivalTime: { type: String, required: true },
    days: [{ type: String }],
    status: { type: String, default: 'Scheduled' }
  },
  { timestamps: true }
);

export const Schedule = mongoose.model('Schedule', scheduleSchema);
