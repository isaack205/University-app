// Imports
const User = require('../models/user')
const Cohort = require('../models/cohort');
const Course = require('../models/course');
const UnitSchedule = require('../models/unit');
const DeliveryLog = require('../models/delivery');

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

        // --- Execute all database operations concurrently ---
        const [ totalUsers, totalCourses, totalUnitSchedules, deliveryFailures, totalCohorts, cohortsPerCourse
        ] = await Promise.all([
            // Total Users
            User.countDocuments(), 

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
                // Add new users count here if needed
            },
            contentMetrics: {
                totalCourses,
                totalCohorts,
                totalUnitSchedules,
                cohortsPerCourseDetail: cohortsPerCourse
            },
            systemHealth: {
                failedPushNotifications: deliveryFailures,
                // Add success rate or other system metrics
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Failed to load dashboard metrics.' });
    }
};