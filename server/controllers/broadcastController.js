// Imports
const { User } = require('../models/user');
const Cohort = require('../models/cohort');
const { sendAppNotification } = require('../services/notificationService');
const logActivity = require('../utils/auditLogger');

// Send Broadcast Announcement
exports.sendBroadcast = async (req, res) => {
  try {
    const { targetType, targetIds = [], title, message, priority = 'normal' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Announcement message body is required' });
    }

    const validTargets = ['cohorts', 'classReps', 'users', 'all'];
    if (!validTargets.includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type specified' });
    }

    let recipients = [];

    // Resolve recipient user documents based on targetType
    if (targetType === 'cohorts') {
      if (!targetIds.length) {
        return res.status(400).json({ message: 'Please select at least one cohort' });
      }
      recipients = await User.find({ cohort: { $in: targetIds } }).select('_id name email role');
    } else if (targetType === 'classReps') {
      const query = { role: 'classRep' };
      if (targetIds.length > 0) {
        query.cohort = { $in: targetIds };
      }
      recipients = await User.find(query).select('_id name email role');
    } else if (targetType === 'users') {
      if (!targetIds.length) {
        return res.status(400).json({ message: 'Please select at least one specific user' });
      }
      recipients = await User.find({ _id: { $in: targetIds } }).select('_id name email role');
    } else if (targetType === 'all') {
      recipients = await User.find({}).select('_id name email role');
    }

    if (recipients.length === 0) {
      return res.status(404).json({ message: 'No active recipients found for the selected criteria' });
    }

    // Format announcement body with priority indicator
    const formattedTitle = title ? title.trim() : '📢 Campus Announcement';
    const urgencyBadge = priority === 'high' ? '🚨 [HIGH PRIORITY] ' : '';
    const fullMessage = `${urgencyBadge}${formattedTitle}\n\n${message.trim()}`;

    // Dispatch in-app & push notifications concurrently
    const notificationPromises = recipients.map((user) =>
      sendAppNotification(
        user._id,
        fullMessage,
        'announcement',
        req.user.id
      ).catch((err) => {
        console.error(`Failed push notification to ${user._id}:`, err.message);
      })
    );

    await Promise.allSettled(notificationPromises);

    // Audit Log Entry
    await logActivity({
      user: req.user,
      action: 'BROADCAST_SENT',
      category: 'ADMIN',
      severity: priority === 'high' ? 'WARNING' : 'INFO',
      details: {
        targetType,
        recipientCount: recipients.length,
        title: formattedTitle,
        priority,
      },
      req,
    });

    res.status(200).json({
      message: `Announcement successfully broadcasted to ${recipients.length} recipients!`,
      recipientCount: recipients.length,
    });
  } catch (error) {
    console.error('Error sending broadcast announcement:', error);
    res.status(500).json({ message: 'Failed to send broadcast announcement', error: error.message });
  }
};

// Helper: Get user search results for recipient picker
exports.searchUsersForBroadcast = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(200).json({ users: [] });
    }

    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { studentId: searchRegex }
      ]
    })
      .select('name email role studentId cohort')
      .populate('cohort', 'name')
      .limit(10);

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};
