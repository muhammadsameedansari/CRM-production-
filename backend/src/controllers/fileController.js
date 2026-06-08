import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import File from '../models/File.js';
import { logActivity } from '../utils/activityLogger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  },
});

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `crm/${folder}`, resource_type: 'auto' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const result = await uploadToCloudinary(req.file.buffer, req.body.category || 'other');

  const file = await File.create({
    filename: result.public_id,
    originalName: req.file.originalname,
    url: result.secure_url,
    publicId: result.public_id,
    mimeType: req.file.mimetype,
    size: req.file.size,
    category: req.body.category || 'Other',
    uploadedBy: req.user._id,
    relatedLead: req.body.relatedLead || undefined,
    relatedClient: req.body.relatedClient || undefined,
  });

  await logActivity(req.user._id, `Uploaded file: ${file.originalName}`, 'File', file._id);
  res.status(201).json({ success: true, data: file });
});

export const getFiles = asyncHandler(async (req, res) => {
  const { category, relatedLead, relatedClient } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (relatedLead) filter.relatedLead = relatedLead;
  if (relatedClient) filter.relatedClient = relatedClient;

  const files = await File.find(filter)
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: files });
});

export const deleteFile = asyncHandler(async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) return res.status(404).json({ success: false, message: 'File not found' });

  await cloudinary.uploader.destroy(file.publicId);
  await File.findByIdAndDelete(req.params.id);
  await logActivity(req.user._id, `Deleted file: ${file.originalName}`, 'File', file._id);
  res.json({ success: true, message: 'File deleted' });
});

export const sendLeadEmail = asyncHandler(async (req, res) => {
  const { sendLeadEmail: sendEmail } = await import('../services/emailService.js');
  const Lead = (await import('../models/Lead.js')).default;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  const result = await sendEmail(lead, req.body.template || 'followUp');
  res.json({ success: result.success, message: result.message || 'Email sent' });
});

export const sendLeadWhatsApp = asyncHandler(async (req, res) => {
  const { sendLeadWhatsApp: sendWA } = await import('../services/whatsappService.js');
  const Lead = (await import('../models/Lead.js')).default;
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  const result = await sendWA(lead, req.body.template || 'followUp');
  res.json({ success: result.success, message: result.message || 'Message sent' });
});
