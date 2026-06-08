import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: {
      type: String,
      enum: ['Lead', 'Client', 'Task', 'Revenue', 'File', 'User', 'System'],
      default: 'System',
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

activitySchema.index({ timestamp: -1 });
activitySchema.index({ user: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
