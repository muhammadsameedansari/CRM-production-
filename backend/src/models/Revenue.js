import mongoose from 'mongoose';

const revenueSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['One Time', 'Monthly Retainer'],
      required: true,
    },
    paymentDate: { type: Date, required: true },
    description: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  },
  { timestamps: true }
);

revenueSchema.index({ paymentDate: -1 });
revenueSchema.index({ client: 1, paymentDate: -1 });

const Revenue = mongoose.model('Revenue', revenueSchema);
export default Revenue;
