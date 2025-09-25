// Imports
const Assignment = require('../models/assignement');
const UnitSchedule = require('../models/unit');

exports.getUpcomingItems = async (req, res) => {
    try {
        const user = req.user;
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60000);

        // 📚 Upcoming Assignments
        const assignments = await Assignment.find({
            cohort: user.cohort,
            dueDate: { $gte: now, $lte: in7Days }
        }).sort({ dueDate: 1 }).populate('cohort').populate('unit');

        // 🕒 Upcoming Classes (today or tomorrow)
        const today = now.toLocaleDateString('en-US', { weekday: 'long' });
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60000).toLocaleDateString('en-US', { weekday: 'long' });

        const schedules = await UnitSchedule.find({
            cohort: user.cohort,
            dayOfWeek: { $in: [today, tomorrow] }
        });

        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        schedules.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

        res.status(200).json({
        upcomingAssignments: assignments,
        upcomingClasses: schedules
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load upcoming items', error: err.message });
    }
};
