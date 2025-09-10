// Imports
const UnitSchedule = require('../models/unit');
const { sendAppNotification } = require('../services/notificationService');
const { sendSMS } = require('../services/smsService');
const User = require('../models/user');


// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        const schedule = await UnitSchedule.create(req.body);
        res.status(201).json({ message: 'Schedule created', schedule });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create schedule', error: err.message });
    }
};

// Get all schedules for a cohort
exports.getSchedulesByCohort = async (req, res) => {
    try {
        const schedules = await UnitSchedule.find({ cohort: req.params.cohortId });
        res.status(200).json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
    }
};

// Get a single schedule
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await UnitSchedule.findById(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch schedule', error: err.message });
    }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
    try {
        const existingSchedule = await UnitSchedule.findById(req.params.id);
        if (!existingSchedule) return res.status(404).json({ message: 'Schedule not found' });

        // Check for changes before updating
        const venueChanged = req.body.venue && req.body.venue !== existingSchedule.venue;
        const timeChanged = req.body.startTime && req.body.startTime !== existingSchedule.startTime;

        // Proceed with update
        const updatedSchedule = await UnitSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Manual trigger: if venue or time changed, notify students
        if (venueChanged || timeChanged) {
            const students = await User.find({ cohort: updatedSchedule.cohort });

            for (const student of students) {
                // App notification
                await sendAppNotification(
                    student._id,
                    `⚠️ ${updatedSchedule.unitName} schedule updated: ${updatedSchedule.startTime} at ${updatedSchedule.venue}`,
                    'schedule'
                );

                // SMS alert if opted in
                if (student.preferences.smsNotifications) {
                    await sendSMS(
                        student.phoneNumber,
                        `⚠️ Change: ${updatedSchedule.unitName} now at ${updatedSchedule.venue} (${updatedSchedule.startTime})`
                    );
                }
            }
        }

        res.status(200).json({ message: 'Schedule updated', schedule: updatedSchedule });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update schedule', error: err.message });
    }
};

// Delete a schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await UnitSchedule.findByIdAndDelete(req.params.id);
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete schedule', error: err.message });
    }
};
