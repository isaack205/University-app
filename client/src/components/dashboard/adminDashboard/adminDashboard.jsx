// Imports
import React, {useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { adminDashboardService } from "@/services/adminDashboardApi";
import Cards from "@/components/metricCard";
import CourseCohortChart from "@/components/courseCohortChart";

export default function AdminDashboard() {

    const [ fetchedData, setFetchedData ] = useState({
        userMetrics: { totalUsers: 0 },
        contentMetrics: { totalCourses: 0, totalCohorts: 0, totalUnitSchedules: 0 },
        systemHealth: { failedPushNotifications: 0 },
        cohortsPerCourseDetail: [],
    });

    const [ errors, setErrors ] = useState(null);

    const fetchDashboardData = async () => {

        try {
            const res = await adminDashboardService.getDashboardSummary();
            setFetchedData(res);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        }
    }

    useEffect(() => {

        fetchDashboardData();
    }, []);

    return(

        <div className="p-6 bg-gray-50 min-h-screen rounded-xl dark:bg-slate-800">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 dark:text-white">📊 Admin Overview</h1>
            {errors && <p className="text-end text-red-500">{errors}</p> }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Cards userMetrics={fetchedData.userMetrics} contentMetrics={fetchedData.contentMetrics} health={fetchedData.systemHealth}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-500 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-white">Courses & Cohort Breakdown</h2>
                    <CourseCohortChart data={fetchedData.contentMetrics.cohortsPerCourseDetail} />
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent User Activity</h2>
                    <p className="text-gray-500">
                        *Fetch recent users from a separate endpoint to populate this list.*
                    </p>
                </div>
            </div>
        </div>
    )
}
