import User from '../models/User.js';
import { generateToken } from '../middleware/protect.js';
import { logActivity } from '../utils/activityLogger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ROLES } from '../config/roles.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Validate role if provided, otherwise default to Fatiq
  const userRole = role && Object.values(ROLES).includes(role) ? role : ROLES.FATIQ;

  const user = await User.create({ name, email, password, role: userRole });
  await logActivity(user._id, `Registered user ${email}`, 'User', user._id);

  res.status(201).json({
    success: true,
    data: user,
    token: generateToken(user._id),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account deactivated' });
  }

  await logActivity(user._id, 'Logged in', 'User', user._id);

  res.json({
    success: true,
    data: user,
    token: generateToken(user._id),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select('-password');
  res.json({ success: true, data: users });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await logActivity(req.user._id, `Updated user ${user.email}`, 'User', user._id);
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await logActivity(req.user._id, `Deactivated user ${user.email}`, 'User', user._id);
  res.json({ success: true, message: 'User deactivated' });
});
