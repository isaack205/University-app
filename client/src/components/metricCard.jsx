//Imports
import React from 'react';
import { FaUsers, FaBookOpen, FaUsersCog, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

export const MetricCard = ({ title, value, icon: Icon, accentColor, iconBg, iconColor, trend, trendLabel }) => (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Top accent bar */}
        <div className={`h-1 w-full ${accentColor}`} />

        <div className="p-5">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </span>
            </div>

            {/* Value */}
            <p className="text-3xl font-bold text-slate-800 tabular-nums">{value}</p>

            {/* Trend chip */}
            {trend && (
                <div className="mt-3 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : trend === 'warn' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                        {trend === 'up' ? '↑' : trend === 'warn' ? '⚠' : '↓'}
                        {trendLabel}
                    </span>
                </div>
            )}
        </div>
    </div>
);

const Cards = ({ userMetrics, contentMetrics, health }) => {

    const hasFailed = health.failedPushNotifications > 0;

    return (
        <>
            <MetricCard
                title="Total Users"
                value={userMetrics.totalUsers || '0'}
                icon={FaUsers}
                accentColor="bg-gradient-to-r from-amber-400 to-orange-400"
                iconBg="bg-amber-50"
                iconColor="text-amber-500"
                trend="up"
                trendLabel="Active"
            />
            <MetricCard
                title="Total Courses"
                value={contentMetrics.totalCourses || '0'}
                icon={FaBookOpen}
                accentColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                iconBg="bg-blue-50"
                iconColor="text-blue-500"
                trend="up"
                trendLabel="Published"
            />
            <MetricCard
                title="Total Cohorts"
                value={contentMetrics.totalCohorts || '0'}
                icon={FaUsersCog}
                accentColor="bg-gradient-to-r from-violet-500 to-purple-500"
                iconBg="bg-violet-50"
                iconColor="text-violet-500"
                trend="up"
                trendLabel="Running"
            />
            <MetricCard
                title="Total Schedules"
                value={contentMetrics.totalUnitSchedules || '0'}
                icon={FaCalendarAlt}
                accentColor="bg-gradient-to-r from-teal-400 to-cyan-500"
                iconBg="bg-teal-50"
                iconColor="text-teal-500"
                trend="up"
                trendLabel="Scheduled"
            />
            <MetricCard
                title="Failed Notifications"
                value={health.failedPushNotifications || '0'}
                icon={FaExclamationTriangle}
                accentColor={hasFailed ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}
                iconBg={hasFailed ? 'bg-red-50' : 'bg-emerald-50'}
                iconColor={hasFailed ? 'text-red-500' : 'text-emerald-500'}
                trend={hasFailed ? 'down' : 'up'}
                trendLabel={hasFailed ? 'Needs attention' : 'All clear'}
            />
        </>
    );
};

export default Cards;