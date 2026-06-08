import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['Proposal', 'Contract', 'Client Asset', 'Other'],
      default: 'Other',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    relatedClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  },
  { timestamps: true }
);

const File = mongoose.model('File', fileSchema);
export default File;
