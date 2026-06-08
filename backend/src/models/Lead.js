import mongoose from 'mongoose';

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Interested',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    country: { type: String, default: '' },
    industry: { type: String, default: '' },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'WhatsApp', 'Email', 'Other'],
      default: 'Other',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: 'New',
    },
    notes: { type: String, default: '' },
    aiScore: { type: Number, min: 0, max: 100, default: 50 },
    meetingDate: { type: Date },
    followUpDate: { type: Date },
    estimatedValue: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

leadSchema.index({ companyName: 'text', contactPerson: 'text', email: 'text' });
leadSchema.index({ status: 1, assignedTo: 1, createdAt: -1 });

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
