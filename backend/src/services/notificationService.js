import Notification from '../models/Notification.js';
import Lead from '../models/Lead.js';
import Task from '../models/Task.js';

export const checkReminders = async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const leadsNeedingFollowUp = await Lead.find({
    followUpDate: { $lte: tomorrow, $gte: now },
    status: { $nin: ['Won', 'Lost'] },
  }).populate('assignedTo');

  for (const lead of leadsNeedingFollowUp) {
    if (!lead.assignedTo) continue;
    const exists = await Notification.findOne({
      'relatedEntity.entityId': lead._id,
      type: 'Follow Up Reminder',
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    });
    if (!exists) {
      await Notification.create({
        user: lead.assignedTo._id,
        type: 'Follow Up Reminder',
        title: 'Follow Up Reminder',
        message: `Follow up with ${lead.companyName} (${lead.contactPerson})`,
        relatedEntity: { entityType: 'Lead', entityId: lead._id },
        scheduledFor: lead.followUpDate,
      });
    }
  }

  const upcomingMeetings = await Lead.find({
    meetingDate: { $lte: tomorrow, $gte: now },
    status: 'Meeting Scheduled',
  }).populate('assignedTo');

  for (const lead of upcomingMeetings) {
    if (!lead.assignedTo) continue;
    const exists = await Notification.findOne({
      'relatedEntity.entityId': lead._id,
      type: 'Meeting Reminder',
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    });
    if (!exists) {
      await Notification.create({
        user: lead.assignedTo._id,
        type: 'Meeting Reminder',
        title: 'Meeting Reminder',
        message: `Meeting with ${lead.companyName} scheduled`,
        relatedEntity: { entityType: 'Meeting', entityId: lead._id },
        scheduledFor: lead.meetingDate,
      });
    }
  }

  const dueTasks = await Task.find({
    dueDate: { $lte: tomorrow, $gte: now },
    status: { $ne: 'Done' },
  });

  for (const task of dueTasks) {
    const exists = await Notification.findOne({
      'relatedEntity.entityId': task._id,
      type: 'Task Reminder',
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    });
    if (!exists) {
      await Notification.create({
        user: task.assignedTo,
        type: 'Task Reminder',
        title: 'Task Due Soon',
        message: `Task "${task.title}" is due soon`,
        relatedEntity: { entityType: 'Task', entityId: task._id },
        scheduledFor: task.dueDate,
      });
    }
  }
};
