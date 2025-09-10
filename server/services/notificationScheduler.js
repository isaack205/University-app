// Imports
const cron = require('node-cron');
const Assignment = require('../models/assignement');
// const Event = require('../models/Event');
const UnitSchedule = require('../models/unit');
const User = require('../models/user');
const { sendAppNotification } = require('./notificationService');
const { sendSMS } = require('./smsService');

const getDayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

const isTimeWithin = (targetTime, now, future) => {
  const [hour, minute] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  return target >= now && target <= future;
};

const scheduleNotifications = () => {
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();
    const in20Min = new Date(now.getTime() + 20 * 60000);
    const in1Hour = new Date(now.getTime() + 60 * 60000);
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60000);
    const today = getDayName();

    try {
      // ⏳ Assignment Due Date
      const assignments = await Assignment.find({ dueDate: { $lte: in24Hours } });
      for (const assignment of assignments) {
        const students = await User.find({ cohort: assignment.cohort });
        for (const student of students) {
          await sendAppNotification(student._id, `📚 Assignment "${assignment.title}" is due soon`, 'assignment');
        }
      }

    //   // 🎉 Event Reminder
    //   const events = await Event.find({ startTime: { $gte: now, $lte: in1Hour } });
    //   for (const event of events) {
    //     const students = await User.find({ cohort: event.cohort });
    //     for (const student of students) {
    //       await sendAppNotification(student._id, `🎉 Event "${event.title}" starts soon`, 'event');
    //     }
    //   }

      // 📩 Class Reminder SMS
      const sessions = await UnitSchedule.find({ dayOfWeek: today });
      for (const session of sessions) {
        if (isTimeWithin(session.startTime, now, in20Min)) {
          const students = await User.find({ cohort: session.cohort, 'preferences.smsNotifications': true });
          for (const student of students) {
            await sendSMS(student._id, student.phoneNumber, `📖 Reminder: ${session.unitName} starts at ${session.startTime} in ${session.venue}`);
          }
        }
      }

    } catch (err) {
      console.error('Scheduler error:', err.message);
    }
  });
};

// Export
module.exports = scheduleNotifications;
