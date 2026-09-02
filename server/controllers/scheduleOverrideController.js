// Imports
const ScheduleOverride = require('../models/scheduleOverride');
const UnitSchedule = require('../models/unit');
const { User } = require('../models/user');
const { sendAppNotification } = require('../services/notificationService');
const logActivity = require('../utils/auditLogger');

// Helper: Get Monday 00:00 and Friday 23:59 for a given week offset
const getWeekBounds = (weekOffset = 0) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);

    return { weekStart: monday, weekEnd: friday };
};

// Create a temporary override for a unit
exports.createOverride = async (req, res) => {
    try {
        const classRep = req.user;

        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can create schedule overrides' });
        }

        const unitSchedule = await UnitSchedule.findById(req.params.id);
        if (!unitSchedule) {
            return res.status(404).json({ message: 'Unit schedule not found' });
        }

        if (classRep.cohort.toString() !== unitSchedule.cohort.toString()) {
            return res.status(403).json({ message: 'You can only override schedules for your own cohort' });
        }

        // Check if there's already an active override for this unit
        const existingOverride = await ScheduleOverride.findOne({ unitSchedule: unitSchedule._id });
        if (existingOverride) {
            return res.status(409).json({ message: 'An override already exists for this unit. Cancel it first before creating a new one.' });
        }

        // Calculate week bounds (weekOffset: 0 = this week, 1 = next week, etc.)
        const weekOffset = req.body.weekOffset || 0;
        if (weekOffset < 0 || weekOffset > 4) {
            return res.status(400).json({ message: 'Week offset must be between 0 (this week) and 4 (4 weeks from now)' });
        }

        const { weekStart, weekEnd } = getWeekBounds(weekOffset);

        // Build override data — only include fields that actually differ
        const overrideData = {
            unitSchedule: unitSchedule._id,
            cohort: unitSchedule.cohort,
            weekStart,
            weekEnd,
            reason: req.body.reason || null,
            createdBy: classRep._id,
        };

        // Only set override fields if they differ from the base schedule
        if (req.body.venue && req.body.venue !== unitSchedule.venue) {
            overrideData.venue = req.body.venue;
        }
        if (req.body.dayOfWeek && req.body.dayOfWeek !== unitSchedule.dayOfWeek) {
            overrideData.dayOfWeek = req.body.dayOfWeek;
        }
        if (req.body.startTime && req.body.startTime !== unitSchedule.startTime) {
            overrideData.startTime = req.body.startTime;
        }
        if (req.body.endTime && req.body.endTime !== unitSchedule.endTime) {
            overrideData.endTime = req.body.endTime;
        }
        if (req.body.lecturer && req.body.lecturer !== unitSchedule.lecturer.toString()) {
            overrideData.lecturer = req.body.lecturer;
        }

        // Must have at least one field changed
        const hasChanges = overrideData.venue || overrideData.dayOfWeek || overrideData.startTime || overrideData.endTime || overrideData.lecturer;
        if (!hasChanges) {
            return res.status(400).json({ message: 'No changes detected — at least one field must differ from the current schedule' });
        }

        const override = await ScheduleOverride.create(overrideData);

        // Audit Log Event
        await logActivity({
            user: classRep,
            action: 'TEMP_SCHEDULE_OVERRIDE',
            category: 'ACADEMICS',
            severity: 'WARNING',
            details: { unitCode: unitSchedule.unitCode, unitName: unitSchedule.unitName, weekOffset, changes: changeParts },
            req
        });

        // Notify students about the temporary change (push only)
        const students = await User.find({ cohort: unitSchedule.cohort });
        const weekLabel = weekOffset === 0 ? 'this week' : weekOffset === 1 ? 'next week' : `in ${weekOffset} weeks`;

        const changeParts = [];
        if (overrideData.venue) changeParts.push(`📍 Venue → ${overrideData.venue}`);
        if (overrideData.dayOfWeek) changeParts.push(`📅 Day → ${overrideData.dayOfWeek}`);
        if (overrideData.startTime) changeParts.push(`🕐 Time → ${overrideData.startTime}`);

        const msg = `⚡ Temp change for ${unitSchedule.unitName} (${weekLabel})!\n\n${changeParts.join('\n')}${overrideData.reason ? `\n\n💬 "${overrideData.reason}"` : ''}`;

        for (const student of students) {
            await sendAppNotification(
                student._id,
                msg,
                'schedule',
                override._id,
            );
        }

        res.status(201).json({ message: 'Schedule override created', override });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'An override already exists for this unit' });
        }
        res.status(500).json({ message: 'Failed to create schedule override', error: err.message });
    }
};

// Get active overrides for the class rep's cohort
exports.getOverrides = async (req, res) => {
    try {
        const user = req.user;

        const overrides = await ScheduleOverride.find({ cohort: user.cohort })
            .populate([
                { path: 'unitSchedule', select: 'unitCode unitName venue dayOfWeek startTime endTime' },
                { path: 'lecturer', select: 'name phoneNumber email' },
                { path: 'createdBy', select: 'firstName lastName' },
            ]);

        res.status(200).json(overrides);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch overrides', error: err.message });
    }
};

// Cancel (delete) an active override
exports.cancelOverride = async (req, res) => {
    try {
        const classRep = req.user;

        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can cancel schedule overrides' });
        }

        const override = await ScheduleOverride.findById(req.params.overrideId).populate('unitSchedule');
        if (!override) {
            return res.status(404).json({ message: 'Override not found' });
        }

        if (classRep.cohort.toString() !== override.cohort.toString()) {
            return res.status(403).json({ message: 'You can only cancel overrides for your own cohort' });
        }

        const unitName = override.unitSchedule?.unitName || 'Unknown unit';
        await ScheduleOverride.findByIdAndDelete(override._id);

        // Notify students that the override was cancelled → back to normal (push only)
        const students = await User.find({ cohort: override.cohort });
        const msg = `✅ ${unitName} is back to its regular schedule! The temporary change has been cancelled.`;

        for (const student of students) {
            await sendAppNotification(
                student._id,
                msg,
                'schedule',
                override.unitSchedule?._id,
            );
        }

        res.status(200).json({ message: 'Override cancelled — schedule reverted to normal' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to cancel override', error: err.message });
    }
};
