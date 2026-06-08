import Activity from '../models/Activity.js';

export const logActivity = async (userId, action, entityType = 'System', entityId = null, metadata = {}) => {
  try {
    await Activity.create({
      user: userId,
      action,
      entityType,
      entityId,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};
