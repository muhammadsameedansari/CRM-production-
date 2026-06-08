import Revenue from '../models/Revenue.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getRevenue = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, client, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (client) filter.client = client;
  if (startDate || endDate) {
    filter.paymentDate = {};
    if (startDate) filter.paymentDate.$gte = new Date(startDate);
    if (endDate) filter.paymentDate.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [records, total] = await Promise.all([
    Revenue.find(filter)
      .populate('client', 'companyName contactPerson')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Revenue.countDocuments(filter),
  ]);

  res.json({ success: true, data: records, pagination: { total, page: parseInt(page) } });
});

export const createRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.create({ ...req.body, recordedBy: req.user._id });

  if (req.body.assignedTo) {
    await User.findByIdAndUpdate(req.body.assignedTo, { $inc: { 'stats.revenueGenerated': revenue.amount } });
  } else {
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.revenueGenerated': revenue.amount } });
  }

  await logActivity(req.user._id, `Recorded revenue: $${revenue.amount}`, 'Revenue', revenue._id);
  const populated = await Revenue.findById(revenue._id).populate('client', 'companyName');
  res.status(201).json({ success: true, data: populated });
});

export const updateRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('client', 'companyName');
  if (!revenue) return res.status(404).json({ success: false, message: 'Revenue not found' });
  res.json({ success: true, data: revenue });
});

export const deleteRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findByIdAndDelete(req.params.id);
  if (!revenue) return res.status(404).json({ success: false, message: 'Revenue not found' });
  await logActivity(req.user._id, `Deleted revenue record`, 'Revenue', revenue._id);
  res.json({ success: true, message: 'Revenue deleted' });
});

export const getRevenueSummary = asyncHandler(async (req, res) => {
  const summary = await Revenue.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json({ success: true, data: summary });
});
