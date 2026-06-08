import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Done'],
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
