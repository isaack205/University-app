// Imports
const Assignment = require('../models/assignement');
const UnitSchedule = require('../models/unit');
const Cat = require('../models/cat');

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
            dayOfWeek: today
        });

        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        schedules.sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

        const cats = await Cat.find({
            // only cats for the user's cohort that have a sittingDate or submissionDate within next 7 days
            cohort: user.cohort,
            $or: [
                { type: 'takeaway', submissionDate: { $gte: now, $lte: in7Days } },
                { type: 'sitting', sittingDate: { $gte: now, $lte: in7Days } }
            ]
        })
        // students should only see published CATs

        // If the user is a student, filter unpublished cats out (defensive: some callers may already filter server-side)
        const role = user.role || '';
        let filteredCats = Array.isArray(cats) ? cats : [];
        if (role.toLowerCase() === 'student' || 'classRep') {
            filteredCats = filteredCats.filter(c => c.isPublished === true);
        }

        // attach a common nextDate field (either submissionDate or sittingDate) and sort ascending
        const upcomingCats = filteredCats
            .map(c => {
                const nextDate = c.type === 'takeaway' ? c.submissionDate : c.sittingDate;
                return { ...c.toObject ? c.toObject() : c, nextDate };
            })
            .filter(c => c.nextDate) // ensure a date exists
            .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));


        res.status(200).json({
            upcomingAssignments: assignments,
            upcomingClasses: schedules,
            upcomingCats: upcomingCats
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load upcoming items', error: err.message });
    }
};
