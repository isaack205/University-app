// // Imports
// const cron = require('node-cron');
// const Assignment = require('../models/assignement');
// // const Event = require('../models/Event');
// const UnitSchedule = require('../models/unit');
// const User = require('../models/user');
// const { sendAppNotification } = require('./notificationService');
// const { sendSMS } = require('./smsService');

// const getDayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// const isTimeWithin = (targetTime, now, future) => {
//   const [hour, minute] = targetTime.split(':').map(Number);
//   const target = new Date(now);
//   target.setHours(hour, minute, 0, 0);
//   return target >= now && target <= future;
// };

// const scheduleNotifications = () => {
//   cron.schedule('*/5 * * * *', async () => {
//     const now = new Date();
//     const in20Min = new Date(now.getTime() + 20 * 60000);
//     const in1Hour = new Date(now.getTime() + 60 * 60000);
//     const in24Hours = new Date(now.getTime() + 24 * 60 * 60000);
//     const today = getDayName();

//     try {
//       // ⏳ Assignment Due Date
//       const assignments = await Assignment.find({ dueDate: { $lte: in24Hours } });
//       for (const assignment of assignments) {
//         const students = await User.find({ cohort: assignment.cohort });
//         for (const student of students) {
//           await sendAppNotification(student._id, `📚 Assignment "${assignment.title}" is due soon`, 'assignment');
//         }
//       }

//     //   // 🎉 Event Reminder
//     //   const events = await Event.find({ startTime: { $gte: now, $lte: in1Hour } });
//     //   for (const event of events) {
//     //     const students = await User.find({ cohort: event.cohort });
//     //     for (const student of students) {
//     //       await sendAppNotification(student._id, `🎉 Event "${event.title}" starts soon`, 'event');
//     //     }
//     //   }

//       // 📩 Class Reminder SMS
//       const sessions = await UnitSchedule.find({ dayOfWeek: today });
//       for (const session of sessions) {
//         if (isTimeWithin(session.startTime, now, in20Min)) {
//           const students = await User.find({ cohort: session.cohort, 'preferences.smsNotifications': true });
//           for (const student of students) {
//             await sendSMS(student._id, student.phoneNumber, `📖 Reminder: ${session.unitName} starts at ${session.startTime} in ${session.venue}`);
//           }
//         }
//       }

//     } catch (err) {
//       console.error('Scheduler error:', err.message);
//     }
//   });
// };

// // Export
// module.exports = scheduleNotifications;



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
            const exists = await Notification.findOne({
              user: student._id,
              type: 'assignment',
              referenceId: assignment._id,
              message: /24h/, // avoid duplicate 24h reminder
            });

            if (!exists) {
              const msg = `📚 Assignment "${assignment.title}" is due in 24 hours`;
              await Notification.create({
                user: student._id,
                message: msg,
                type: 'assignment',
                referenceId: assignment._id,
                expiresAt: assignment.dueDate
              });
              await sendAppNotification(student._id, msg, 'assignment');
            }
          }

          // If assignment is due within 48h → "due in 2 days"
          else if (assignment.dueDate <= in48Hours) {
            const exists = await Notification.findOne({
              user: student._id,
              type: 'assignment',
              referenceId: assignment._id,
              message: /2 days/,
            });

            if (!exists) {
              const msg = `📚 Assignment "${assignment.title}" is due in 2 days`;
              await Notification.create({
                user: student._id,
                message: msg,
                type: 'assignment',
                referenceId: assignment._id,
                expiresAt: assignment.dueDate
              });
              await sendAppNotification(student._id, msg, 'assignment');
            }
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

              await Notification.create({
                user: student._id,
                message: msg,
                type: 'class',
                referenceId: session._id,
                expiresAt: toDateFromTimeString(session.startTime)
              });

              await sendAppNotification(student._id, msg, 'class');
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

