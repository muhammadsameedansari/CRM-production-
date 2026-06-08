import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['Follow Up Reminder', 'Meeting Reminder', 'Task Reminder', 'System'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntity: {
      entityType: { type: String, enum: ['Lead', 'Task', 'Client', 'Meeting'] },
      entityId: { type: mongoose.Schema.Types.ObjectId },
    },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
