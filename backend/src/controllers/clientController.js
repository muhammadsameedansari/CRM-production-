import Client from '../models/Client.js';
import { logActivity } from '../utils/activityLogger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getClients = asyncHandler(async (req, res) => {
  const { status, search, assignedTo, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.$text = { $search: search };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [clients, total] = await Promise.all([
    Client.find(filter)
      .populate('assignedTo', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Client.countDocuments(filter),
  ]);

  res.json({ success: true, data: clients, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('leadId');
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  res.json({ success: true, data: client });
});

export const createClient = asyncHandler(async (req, res) => {
  const client = await Client.create(req.body);
  await logActivity(req.user._id, `Created client: ${client.companyName}`, 'Client', client._id);
  res.status(201).json({ success: true, data: client });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('assignedTo', 'name email avatar');
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  await logActivity(req.user._id, `Updated client: ${client.companyName}`, 'Client', client._id);
  res.json({ success: true, data: client });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  await logActivity(req.user._id, `Deleted client: ${client.companyName}`, 'Client', client._id);
  res.json({ success: true, message: 'Client deleted' });
});

export const addPayment = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  client.payments.push(req.body);
  await client.save();
  await logActivity(req.user._id, `Added payment for ${client.companyName}`, 'Client', client._id);
  res.json({ success: true, data: client });
});

export const addProject = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
  client.projects.push(req.body);
  await client.save();
  res.json({ success: true, data: client });
});

export const exportClients = asyncHandler(async (req, res) => {
  const clients = await Client.find().lean();
  res.json({ success: true, data: clients });
});
