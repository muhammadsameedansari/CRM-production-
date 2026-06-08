import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['One Time', 'Monthly Retainer'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Completed', 'On Hold'], default: 'Active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { _id: true }
);

const clientSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    services: [{ type: String }],
    monthlyRetainer: { type: Number, default: 0 },
    payments: [paymentSchema],
    projects: [projectSchema],
    notes: { type: String, default: '' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Active', 'Inactive', 'Churned'], default: 'Active' },
  },
  { timestamps: true }
);

clientSchema.index({ companyName: 'text', contactPerson: 'text' });

const Client = mongoose.model('Client', clientSchema);
export default Client;
