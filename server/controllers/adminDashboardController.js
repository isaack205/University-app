// Imports
const { User } = require('../models/user');
const Cohort = require('../models/cohort');
const Course = require('../models/course');
const UnitSchedule = require('../models/unit');
const DeliveryLog = require('../models/delivery');
const Assignment = require('../models/assignement');
const Cat = require('../models/cat');
const Feedback = require('../models/feedback');
const Lecturer = require('../models/lecturer');

// Helper function for date filtering (e.g., last 30 days)
const getPastDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
};

// adminDashboardController.js

exports.getDashboardSummary = async (req, res) => {
    try {
        const thirtyDaysAgo = getPastDate(30);
        const sevenDaysAgo = getPastDate(7);
        const now = new Date();

        // --- Execute all database operations concurrently ---
        const [
            totalUsers,
            activeUsersThisWeek,
            newUsersThisWeek,
            totalCourses,
            totalUnitSchedules,
            deliveryFailures,
            totalCohorts,
            totalLecturers,
            totalAssignments,
            overdueAssignments,
            totalCats,
            cohortsPerCourse
        ] = await Promise.all([
            // Total Users
            User.countDocuments(),

            // Users who logged in within the last 7 days
            User.countDocuments({ lastLoginAt: { $gte: sevenDaysAgo } }),

            // Users registered within the last 7 days
            User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),

            // Total Courses
            Course.countDocuments(),

            // Total Unit Schedules
            UnitSchedule.countDocuments(),

            // Failed Push Notifications (Last 30 Days)
            DeliveryLog.countDocuments({
                timestamp: { $gte: thirtyDaysAgo },
                method: 'push',
                status: 'failed',
            }),

            // Total Number of Cohorts
            Cohort.countDocuments(),

            // Active Lecturers (not soft-deleted)
            Lecturer.countDocuments({ isDeleted: false }),

            // Total Assignments
            Assignment.countDocuments(),

            // Overdue Assignments (dueDate is in the past)
            Assignment.countDocuments({ dueDate: { $lt: now } }),

            // Total CATs
            Cat.countDocuments(),

            // Cohorts per Course (Detail)
            Cohort.aggregate([
                { $group: { _id: "$course", cohortsInCourse: { $sum: 1 } } },

                {
                    $lookup: {
                        from: 'courses', // The target collection
                        localField: '_id', // The field from the CURRENT pipeline
                        foreignField: '_id', // The field in the 'courses' collection to match against
                        as: 'courseDetails' // The name of the new array field to store the matched course
                    }
                },

                {
                    $project: {
                        _id: 0, // Exclude _id field
                        courseId: '$_id', // Rename the group ID to something descriptive
                        cohortsCount: '$cohortsInCourse', // Keep the count field
                        courseName: { $arrayElemAt: ['$courseDetails.name', 0] } // Extract the name from the new array
                    }
                }
            ]),
        ]);

        res.status(200).json({
            userMetrics: {
                totalUsers,
                activeUsersThisWeek,
                newUsersThisWeek,
            },
            contentMetrics: {
                totalCourses,
                totalCohorts,
                totalUnitSchedules,
                totalLecturers,
                totalAssignments,
                overdueAssignments,
                totalCats,
                cohortsPerCourseDetail: cohortsPerCourse
            },
            systemHealth: {
                failedPushNotifications: deliveryFailures,
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Failed to load dashboard metrics.' });
    }
};

exports.getFeedbackSummary = async (req, res) => {
    try {
        // Run all 3 status counts concurrently
        const [ open, reviewed, resolved ] = await Promise.all([
            Feedback.countDocuments({ status: 'open' }),
            Feedback.countDocuments({ status: 'reviewed' }),
            Feedback.countDocuments({ status: 'resolved' }),
        ]);

        res.status(200).json({ feedbackSummary: { open, reviewed, resolved } });

    } catch (error) {
        console.error('Error fetching feedback summary:', error);
        res.status(500).json({ message: 'Failed to load feedback summary.' });
    }
};

exports.getDeliveryStats = async (req, res) => {
    try {
        const thirtyDaysAgo = getPastDate(30);

        // Run all 3 delivery status counts concurrently (push only, last 30 days)
        const [ sent, delivered, failed ] = await Promise.all([
            DeliveryLog.countDocuments({ timestamp: { $gte: thirtyDaysAgo }, method: 'push', status: 'sent' }),
            DeliveryLog.countDocuments({ timestamp: { $gte: thirtyDaysAgo }, method: 'push', status: 'delivered' }),
            DeliveryLog.countDocuments({ timestamp: { $gte: thirtyDaysAgo }, method: 'push', status: 'failed' }),
        ]);

        const total = sent + delivered + failed;
        const successRate = total > 0 ? Math.round(((sent + delivered) / total) * 100) : 0;

        res.status(200).json({ deliveryStats: { sent, delivered, failed, successRate } });

    } catch (error) {
        console.error('Error fetching delivery stats:', error);
        res.status(500).json({ message: 'Failed to load delivery stats.' });
    }
};

exports.getRecentUserActivity = async (req, res) => {
    try {
        // Fetch the 10 most recently registered users
        const recentRegistrations = await User
            .find()
            .select('name role createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        // Fetch the 10 most recently logged-in users
        const recentLogins = await User
            .find({ lastLoginAt: { $ne: null } })
            .select('name role lastLoginAt')
            .sort({ lastLoginAt: -1 })
            .limit(10);

        // Map registrations into a unified event shape
        const registrationEvents = recentRegistrations.map((user) => ({
            userId: user._id,
            name: user.name,
            role: user.role,
            action: 'registered',
            timestamp: user.createdAt,
        }));

        // Map logins into the same unified event shape
        const loginEvents = recentLogins.map((user) => ({
            userId: user._id,
            name: user.name,
            role: user.role,
            action: 'logged_in',
            timestamp: user.lastLoginAt,
        }));

        // Merge, sort newest-first, and cap at 10 events
        const allEvents = [...registrationEvents, ...loginEvents]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.status(200).json({ recentActivity: allEvents });

    } catch (error) {
        console.error('Error fetching recent user activity:', error);
        res.status(500).json({ message: 'Failed to load recent user activity.' });
    }
};