// Imports
const UnitSchedule = require('../models/unit');
const ScheduleOverride = require('../models/scheduleOverride');
const { sendAppNotification } = require('../services/notificationService');
const { sendSMS } = require('../services/smsService');
const { User } = require('../models/user');
const Notification = require('../models/notification')

// Create a new schedule
exports.createSchedule = async (req, res) => {
    try {
        const classRep = req.user;

        // Check if class rep's cohort matches the one in request
        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can create schedules' });
        }

        if (classRep.cohort.toString() !== req.body.cohort) {
            return res.status(403).json({ message: 'You can only create schedules for your own cohort' });
        }
        const schedule = await UnitSchedule.create(req.body);
        res.status(201).json({ message: 'Schedule created', schedule });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create schedule', error: err.message });
    }
};

// Get all schedules for a cohort (with active overrides merged)
exports.getMyShedule = async (req, res) => {
    try {
        const user = req.user;

        const schedules = await UnitSchedule.find({ cohort: user.cohort })
                                            .populate([
                                                { path: 'cohort', select: 'name year'},
                                                { path: 'lecturer', select: 'name phoneNumber email'},
                                            ]);

        // Fetch active overrides for this cohort (current week)
        const now = new Date();
        const overrides = await ScheduleOverride.find({
            cohort: user.cohort,
            weekStart: { $lte: now },
            weekEnd: { $gte: now },
        }).populate({ path: 'lecturer', select: 'name phoneNumber email' });

        // Merge overrides on top of base schedules
        const merged = schedules.map(schedule => {
            const scheduleObj = schedule.toObject();
            const override = overrides.find(o => 
                o.unitSchedule.toString() === schedule._id.toString()
            );

            if (override) {
                return {
                    ...scheduleObj,
                    venue: override.venue || scheduleObj.venue,
                    dayOfWeek: override.dayOfWeek || scheduleObj.dayOfWeek,
                    startTime: override.startTime || scheduleObj.startTime,
                    endTime: override.endTime || scheduleObj.endTime,
                    lecturer: override.lecturer || scheduleObj.lecturer,
                    _override: {
                        isOverridden: true,
                        reason: override.reason,
                        expiresAt: override.weekEnd,
                        overrideId: override._id,
                        originalVenue: scheduleObj.venue,
                        originalDayOfWeek: scheduleObj.dayOfWeek,
                        originalStartTime: scheduleObj.startTime,
                        originalEndTime: scheduleObj.endTime,
                    }
                };
            }

            return scheduleObj;
        });

        res.status(200).json(merged);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
    }
};

// Get a single schedule
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await UnitSchedule.findById(req.params.id).populate('lecturer');
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
        res.status(200).json(schedule);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch schedule', error: err.message });
    }
};

// Update a schedule
exports.updateSchedule = async (req, res) => {
    try {
        const classRep = req.user;

        const existingSchedule = await UnitSchedule.findById(req.params.id);
        if (!existingSchedule) return res.status(404).json({ message: 'Schedule not found' });

        // Check cohort match
        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can update schedules' });
        }

        if (classRep.cohort.toString() !== existingSchedule.cohort.toString()) {
            return res.status(403).json({ message: 'You can only update schedules for your own cohort' });
        }

        // Check for changes before updating
        const venueChanged = req.body.venue && req.body.venue !== existingSchedule.venue;
        const timeChanged = req.body.startTime && req.body.startTime !== existingSchedule.startTime;

        const updatedSchedule = await UnitSchedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Notify students if schedule changed
        if (venueChanged || timeChanged) {
            const students = await User.find({ cohort: updatedSchedule.cohort });

            for (const student of students) {

                await sendAppNotification(
                    student._id, 
                    `⚠️ ${updatedSchedule.unitName} schedule updated: ${updatedSchedule.dayOfWeek} - ${updatedSchedule.startTime} at ${updatedSchedule.venue}`,
                    'schedule', 
                    updatedSchedule._id, 
                );

                if (student.preferences.smsNotifications && student.phoneNumber) {
                    await sendSMS(
                        student._id, 
                        student.phoneNumber, 
                        `⚠️ ${updatedSchedule.unitName} schedule updated: ${updatedSchedule.startTime} at ${updatedSchedule.venue}`, 
                        'schedule'
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
        const classRep = req.user;

        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can delete schedules' });
        }

        const schedule = await UnitSchedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (classRep.cohort.toString() !== schedule.cohort.toString()) {
            return res.status(403).json({ message: 'You can only delete schedules for your own cohort' });
        }

        await UnitSchedule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Schedule deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete schedule', error: err.message });
    }
};
