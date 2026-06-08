import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Task from '../models/Task.js';
import Revenue from '../models/Revenue.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalLeads,
    activeLeads,
    meetingsScheduled,
    closedDeals,
    totalRevenue,
    monthlyRevenue,
    recentActivities,
    leadsByStatus,
    monthlyRevenueChart,
  ] = await Promise.all([
    Lead.countDocuments(),
    Lead.countDocuments({ status: { $nin: ['Won', 'Lost'] } }),
    Lead.countDocuments({ status: 'Meeting Scheduled' }),
    Lead.countDocuments({ status: 'Won' }),
    Revenue.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Revenue.aggregate([
      { $match: { paymentDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Activity.find().populate('user', 'name avatar').sort({ timestamp: -1 }).limit(10),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Revenue.aggregate([
      { $match: { paymentDate: { $gte: startOfYear } } },
      {
        $group: {
          _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalLeads,
        activeLeads,
        meetingsScheduled,
        closedDeals,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      },
      leadsByStatus,
      monthlyRevenueChart,
      recentActivities,
    },
  });
});

export const getTeamPerformance = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select('name email role avatar stats');
  res.json({ success: true, data: users });
});

export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: { leads: [], clients: [], tasks: [] } });

  const [leads, clients, tasks] = await Promise.all([
    Lead.find({ $text: { $search: q } }).limit(10).populate('assignedTo', 'name'),
    Client.find({ $text: { $search: q } }).limit(10),
    Task.find({ title: { $regex: q, $options: 'i' } }).limit(10).populate('assignedTo', 'name'),
  ]);

  res.json({ success: true, data: { leads, clients, tasks } });
});

export const getActivities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [activities, total] = await Promise.all([
    Activity.find()
      .populate('user', 'name avatar role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Activity.countDocuments(),
  ]);
  res.json({ success: true, data: activities, pagination: { total, page: parseInt(page) } });
});
