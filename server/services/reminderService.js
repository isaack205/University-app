const Assignment = require('../models/assignement');
const UnitSchedule = require('../models/unit');
const User = require('../models/user');
const { sendAppNotification } = require('./notificationService');
const { sendSMS } = require('./smsService');

exports.runReminders = async () => {
  const now = new Date();
  const in20Min = new Date(now.getTime() + 20 * 60000);
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60000);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 📚 Assignment reminders
  const assignments = await Assignment.find({ dueDate: { $lte: in24Hours } });
  for (const assignment of assignments) {
    const students = await User.find({ cohort: assignment.cohort });
    for (const student of students) {
      const message = `📚 Assignment "${assignment.title}" is due soon`;
      await sendAppNotification(student._id, message, 'assignment');
      if (student.preferences?.smsNotifications && student.phoneNumber) {
        await sendSMS(student._id, student.phoneNumber, message, 'assignment');
      }
    }
  }

  // 📖 Class reminders
  const sessions = await UnitSchedule.find({ dayOfWeek: today });
  for (const session of sessions) {
    if (isTimeWithin(session.startTime, now, in20Min)) {
      const students = await User.find({ cohort: session.cohort, 'preferences.smsNotifications': true });
      for (const student of students) {
        const message = `📖 Reminder: ${session.unitName} starts at ${session.startTime} in ${session.venue}`;
        await sendSMS(student._id, student.phoneNumber, message, 'class');
      }
    }
  }
};

// Helper function
function isTimeWithin(targetTime, now, future) {
  const [hour, minute] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  return target >= now && target <= future;
}
