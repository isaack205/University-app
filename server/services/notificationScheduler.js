// Imports
const cron = require('node-cron');
const Assignment = require('../models/assignement');
const UnitSchedule = require('../models/unit');
const { User } = require('../models/user');
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

      // Fetch active overrides for the current week
      const ScheduleOverride = require('../models/scheduleOverride');
      const overrides = await ScheduleOverride.find({
        weekStart: { $lte: now },
        weekEnd: { $gte: now },
      });

      for (const session of sessions) {
        // Check if there's an active override for this session
        const override = overrides.find(o =>
          o.unitSchedule.toString() === session._id.toString()
        );

        // Use overridden values if they exist
        const effectiveDay = (override && override.dayOfWeek) || session.dayOfWeek;
        const effectiveStartTime = (override && override.startTime) || session.startTime;
        const effectiveVenue = (override && override.venue) || session.venue;
        const effectiveUnitName = session.unitName;

        // Skip if the effective day isn't today (override may have moved it)
        if (effectiveDay !== today) continue;

        if (isTimeWithin(effectiveStartTime, now, in20Min)) {
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
              const msg = `📖 Reminder: ${effectiveUnitName} starts at ${effectiveStartTime} in ${effectiveVenue}`;

              await sendAppNotification(
                student._id, 
                msg, 
                'class', 
                session._id, 
                toDateFromTimeString(effectiveStartTime)
              );

              await sendSMS(student._id, student.phoneNumber, msg, 'class');
            }
          }
        }
      }

      // Also check for overrides that moved sessions TO today from a different day
      const movedToToday = overrides.filter(o => 
        o.dayOfWeek === today
      );

      for (const override of movedToToday) {
        const baseSession = await UnitSchedule.findById(override.unitSchedule);
        if (!baseSession || baseSession.dayOfWeek === today) continue; // Already handled above

        const effectiveStartTime = override.startTime || baseSession.startTime;
        const effectiveVenue = override.venue || baseSession.venue;

        if (isTimeWithin(effectiveStartTime, now, in20Min)) {
          const students = await User.find({
            cohort: baseSession.cohort,
            'preferences.smsNotifications': true,
          });

          for (const student of students) {
            const exists = await Notification.findOne({
              user: student._id,
              type: 'class',
              referenceId: baseSession._id,
            });

            if (!exists) {
              const msg = `📖 Reminder: ${baseSession.unitName} starts at ${effectiveStartTime} in ${effectiveVenue} (temp change ⚡)`;

              await sendAppNotification(
                student._id, 
                msg, 
                'class', 
                baseSession._id, 
                toDateFromTimeString(effectiveStartTime)
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

// Override Expiry Notification Job (runs daily at midnight)
const scheduleOverrideExpiryNotifications = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const ScheduleOverride = require('../models/scheduleOverride');
      const now = new Date();

      // Find overrides that expired (weekEnd is in the past)
      const expiredOverrides = await ScheduleOverride.find({
        weekEnd: { $lt: now },
      }).populate({ path: 'unitSchedule', select: 'unitName cohort venue dayOfWeek startTime' });

      for (const override of expiredOverrides) {
        if (!override.unitSchedule) continue;

        const students = await User.find({ cohort: override.cohort });
        const msg = `✅ ${override.unitSchedule.unitName} is back to its regular schedule (${override.unitSchedule.dayOfWeek} at ${override.unitSchedule.startTime} in ${override.unitSchedule.venue}) 📅`;

        for (const student of students) {
          await sendAppNotification(
            student._id,
            msg,
            'schedule',
            override.unitSchedule._id,
          );
        }

        // Clean up — TTL will also handle this, but let's be proactive
        await ScheduleOverride.findByIdAndDelete(override._id);
      }
    } catch (err) {
      console.error('Override Expiry Notification Error:', err.message);
    }
  });
};

// Export combined scheduler
const scheduleNotifications = () => {
  scheduleAssignmentReminders(); // hourly
  scheduleClassReminders(); // every 15 mins
  scheduleOverrideExpiryNotifications(); // daily at midnight
};

module.exports = scheduleNotifications;

