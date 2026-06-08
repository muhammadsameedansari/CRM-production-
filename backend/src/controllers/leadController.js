import Lead, { LEAD_STATUSES } from '../models/Lead.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { calculateLeadScore } from '../utils/leadScoring.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getLeads = asyncHandler(async (req, res) => {
  const { status, assignedTo, source, industry, search, startDate, endDate, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (source) filter.source = source;
  if (industry) filter.industry = industry;
  if (search) filter.$text = { $search: search };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Lead.countDocuments(filter),
  ]);

  res.json({ success: true, data: leads, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'name email role avatar')
    .populate('createdBy', 'name');
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  res.json({ success: true, data: lead });
});

export const createLead = asyncHandler(async (req, res) => {
  const leadData = { ...req.body, createdBy: req.user._id };
  leadData.aiScore = calculateLeadScore(leadData);

  const lead = await Lead.create(leadData);

  await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.leadsAdded': 1 } });
  await logActivity(req.user._id, `Created lead: ${lead.companyName}`, 'Lead', lead._id);

  if (lead.status === 'Meeting Scheduled') {
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.meetingsBooked': 1 } });
  }

  const populated = await Lead.findById(lead._id).populate('assignedTo', 'name email role avatar');
  req.io?.emit('lead:created', populated);
  res.status(201).json({ success: true, data: populated });
});

export const updateLead = asyncHandler(async (req, res) => {
  const existing = await Lead.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Lead not found' });

  const updateData = { ...req.body };
  if (updateData.status || updateData.source || updateData.estimatedValue) {
    updateData.aiScore = calculateLeadScore({ ...existing.toObject(), ...updateData });
  }

  const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    .populate('assignedTo', 'name email role avatar');

  if (updateData.status === 'Meeting Scheduled' && existing.status !== 'Meeting Scheduled') {
    await User.findByIdAndUpdate(lead.assignedTo?._id || req.user._id, { $inc: { 'stats.meetingsBooked': 1 } });
  }
  if (updateData.status === 'Won' && existing.status !== 'Won') {
    await User.findByIdAndUpdate(lead.assignedTo?._id || req.user._id, { $inc: { 'stats.dealsClosed': 1 } });
  }

  await logActivity(req.user._id, `Updated lead: ${lead.companyName} → ${lead.status}`, 'Lead', lead._id);
  req.io?.emit('lead:updated', lead);
  res.json({ success: true, data: lead });
});

export const updateLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!LEAD_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const existing = await Lead.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Lead not found' });

  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status, aiScore: calculateLeadScore({ ...existing.toObject(), status }) },
    { new: true }
  ).populate('assignedTo', 'name email role avatar');

  await logActivity(req.user._id, `Moved lead ${lead.companyName} to ${status}`, 'Lead', lead._id);
  req.io?.emit('lead:statusChanged', lead);
  res.json({ success: true, data: lead });
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);
  if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
  await logActivity(req.user._id, `Deleted lead: ${lead.companyName}`, 'Lead', lead._id);
  req.io?.emit('lead:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Lead deleted' });
});

export const getKanbanLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find({ status: { $nin: ['Won', 'Lost'] } })
    .populate('assignedTo', 'name email role avatar')
    .sort({ updatedAt: -1 });

  const pipeline = LEAD_STATUSES.filter((s) => !['Won', 'Lost'].includes(s)).reduce((acc, status) => {
    acc[status] = leads.filter((l) => l.status === status);
    return acc;
  }, {});

  res.json({ success: true, data: pipeline });
});

export const importLeads = asyncHandler(async (req, res) => {
  const leads = req.body.leads || [];
  const created = [];

  for (const leadData of leads) {
    const lead = await Lead.create({
      ...leadData,
      createdBy: req.user._id,
      aiScore: calculateLeadScore(leadData),
    });
    created.push(lead);
  }

  await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.leadsAdded': created.length } });
  await logActivity(req.user._id, `Imported ${created.length} leads`, 'Lead');
  res.status(201).json({ success: true, data: created, count: created.length });
});

export const exportLeads = asyncHandler(async (req, res) => {
  const leads = await Lead.find()
    .populate('assignedTo', 'name')
    .lean();

  res.json({ success: true, data: leads });
});

export const scrapeLeads = asyncHandler(async (req, res) => {
  const { industry, country, count = 5 } = req.body;
  const sampleLeads = Array.from({ length: Math.min(count, 20) }, (_, i) => ({
    companyName: `${industry || 'Tech'} Corp ${i + 1}`,
    contactPerson: `Contact ${i + 1}`,
    email: `contact${i + 1}@${(industry || 'tech').toLowerCase().replace(/\s/g, '')}.com`,
    phone: `+1-555-${String(1000 + i).slice(-4)}`,
    website: `https://example${i + 1}.com`,
    country: country || 'USA',
    industry: industry || 'Technology',
    source: 'Cold Outreach',
    status: 'New',
    aiScore: Math.floor(Math.random() * 40) + 30,
    createdBy: req.user._id,
  }));

  const created = await Lead.insertMany(sampleLeads);
  await logActivity(req.user._id, `Scraped ${created.length} leads for ${industry}`, 'Lead');
  res.status(201).json({ success: true, data: created, count: created.length });
});
