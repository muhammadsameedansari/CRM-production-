import Task from '../models/Task.js';
import User from '../models/User.js';
import { logActivity } from '../utils/activityLogger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getTasks = asyncHandler(async (req, res) => {
  const { status, assignedTo, priority, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (priority) filter.priority = priority;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name')
      .populate('relatedLead', 'companyName')
      .populate('relatedClient', 'companyName')
      .sort({ dueDate: 1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: tasks, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('relatedLead', 'companyName')
    .populate('relatedClient', 'companyName');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  res.json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  await logActivity(req.user._id, `Created task: ${task.title}`, 'Task', task._id);
  const populated = await Task.findById(task._id).populate('assignedTo', 'name email avatar');
  res.status(201).json({ success: true, data: populated });
});

export const updateTask = asyncHandler(async (req, res) => {
  const existing = await Task.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('assignedTo', 'name email avatar');

  if (req.body.status === 'Done' && existing.status !== 'Done') {
    await User.findByIdAndUpdate(task.assignedTo._id, { $inc: { 'stats.tasksCompleted': 1 } });
  }

  await logActivity(req.user._id, `Updated task: ${task.title}`, 'Task', task._id);
  res.json({ success: true, data: task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
  await logActivity(req.user._id, `Deleted task: ${task.title}`, 'Task', task._id);
  res.json({ success: true, message: 'Task deleted' });
});
