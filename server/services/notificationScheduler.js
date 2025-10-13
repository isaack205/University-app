// Imports
const cron = require('node-cron');
const Assignment = require('../models/assignement');
const UnitSchedule = require('../models/unit');
const User = require('../models/user');
const Notification = require('../models/notification');
const { sendAppNotification } = require('./notificationService');
const { sendSMS } = require('./smsService');

// Helper: Get today's day name (e.g., "Monday")
const getDayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

function toDateFromTimeString(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

// Helper: Check if a session time falls between now and a future cutoff
const isTimeWithin = (targetTime, now, future) => {
  const [hour, minute] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  return target >= now && target <= future;
};

// Assignment Reminder Job (runs every hour)
const scheduleAssignmentReminders = () => {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60000);

    try {
      // Find assignments due within 24h OR 48h
      const assignments = await Assignment.find({
        dueDate: { $gte: now, $lte: in48Hours },
      });

      for (const assignment of assignments) {
        const students = await User.find({ cohort: assignment.cohort });

        for (const student of students) {
          // If assignment is due within 24h → "due tomorrow"
          if (assignment.dueDate <= in24Hours) {

            const msg = `⏰ Reminder! The clock’s ticking!\n\n📚 "${assignment.title}" assignment is due in 24 hours! ⌛ Don’t wait till the last minute 🚀.`;

            await sendAppNotification(
              student._id, 
              msg, 
              'assignment', 
              assignment._id, 
              assignment.dueDate ,
              '24h'
            );
          }

          // If assignment is due within 48h → "due in 2 days"
          else if (assignment.dueDate <= in48Hours) {

            const msg = `🚨 Heads up, legend!\n\n"${assignment.title}" assignment is due in 2 days! Time to lock in before panic mode hits 😅💪`;

            await sendAppNotification(
              student._id, 
              msg, 
              'assignment', 
              assignment._id, 
              assignment.dueDate,
              '48h'
            );
          }
        }
      }
    } catch (err) {
      console.error('Assignment Reminder Error:', err.message);
    }
  });
};

// Class Reminder Job (runs every 15 minutes)
const scheduleClassReminders = () => {
  cron.schedule('*/15 * * * *', async () => {
    const now = new Date();
    const in20Min = new Date(now.getTime() + 20 * 60000);
    const today = getDayName();

    try {
      const sessions = await UnitSchedule.find({ dayOfWeek: today });

      for (const session of sessions) {
        if (isTimeWithin(session.startTime, now, in20Min)) {
          const students = await User.find({
            cohort: session.cohort,
            'preferences.smsNotifications': true,
          });

          for (const student of students) {
            const exists = await Notification.findOne({
              user: student._id,
              type: 'class',
              referenceId: session._id,
            });

            if (!exists) {
              const msg = `📖 Reminder: ${session.unitName} starts at ${session.startTime} in ${session.venue}`;

              await sendAppNotification(
                student._id, 
                msg, 
                'class', 
                session._id, 
                toDateFromTimeString(session.startTime)
              );

              await sendSMS(student._id, student.phoneNumber, msg, 'class');
            }
          }
        }
      }
    } catch (err) {
      console.error('Class Reminder Error:', err.message);
    }
  });
};

// Export combined scheduler
const scheduleNotifications = () => {
  scheduleAssignmentReminders(); // hourly
  scheduleClassReminders(); // every 15 mins
};

module.exports = scheduleNotifications;

