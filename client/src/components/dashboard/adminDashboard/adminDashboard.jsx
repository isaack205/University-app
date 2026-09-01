// Imports
import React, { useEffect, useState } from "react";
import { adminDashboardService } from "@/services/adminDashboardApi";
import { MetricCard } from "@/components/metricCard";
import CourseCohortChart from "@/components/courseCohortChart";
import {
    FaUsers, FaUserCheck, FaUserPlus, FaBookOpen, FaUsersCog,
    FaChalkboardTeacher, FaCalendarAlt, FaTasks, FaExclamationCircle,
    FaClipboardList
} from 'react-icons/fa';

export default function AdminDashboard() {

    const [ fetchedData, setFetchedData ] = useState({
        userMetrics: { totalUsers: 0, activeUsersThisWeek: 0, newUsersThisWeek: 0 },
        contentMetrics: {
            totalCourses: 0, totalCohorts: 0, totalUnitSchedules: 0,
            totalLecturers: 0, totalAssignments: 0, overdueAssignments: 0,
            totalCats: 0, cohortsPerCourseDetail: []
        },
        systemHealth: { failedPushNotifications: 0 },
    });

    const [ recentActivity, setRecentActivity ] = useState([]);
    const [ feedbackSummary, setFeedbackSummary ] = useState({ open: 0, reviewed: 0, resolved: 0 });
    const [ deliveryStats, setDeliveryStats ] = useState({ sent: 0, delivered: 0, failed: 0, successRate: 0 });
    const [ errors, setErrors ] = useState(null);

    const fetchDashboardData = async () => {
        try {
            const res = await adminDashboardService.getDashboardSummary();
            setFetchedData(res);
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'An unexpected error occured!';
            setErrors(message);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            const res = await adminDashboardService.getRecentActivity();
            setRecentActivity(res.recentActivity || []);
        } catch (error) {
            console.error('Failed to fetch recent activity:', error.message);
        }
    };

    const fetchFeedbackSummary = async () => {
        try {
            const res = await adminDashboardService.getFeedbackSummary();
            setFeedbackSummary(res.feedbackSummary || { open: 0, reviewed: 0, resolved: 0 });
        } catch (error) {
            console.error('Failed to fetch feedback summary:', error.message);
        }
    };

    const fetchDeliveryStats = async () => {
        try {
            const res = await adminDashboardService.getDeliveryStats();
            setDeliveryStats(res.deliveryStats || { sent: 0, delivered: 0, failed: 0, successRate: 0 });
        } catch (error) {
            console.error('Failed to fetch delivery stats:', error.message);
        }
    };

    useEffect(() => {

        fetchDashboardData();
        fetchRecentActivity();
        fetchFeedbackSummary();
        fetchDeliveryStats();

        // Auto-refresh activity feed every 30s
        const interval = setInterval(fetchRecentActivity, 30000);
        return () => clearInterval(interval);
    }, []);

    const { userMetrics, contentMetrics, systemHealth } = fetchedData;
    const totalFeedback = feedbackSummary.open + feedbackSummary.reviewed + feedbackSummary.resolved;
    const resolutionRate = totalFeedback > 0 ? Math.round((feedbackSummary.resolved / totalFeedback) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ── Top header ── */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                            <span>Dashboard</span>
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            <span className="text-indigo-600 font-medium">Overview</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 tracking-tight">Admin Overview</h1>
                                <p className="text-xs text-slate-400">Platform metrics, content analytics &amp; system health</p>
                            </div>
                        </div>
                    </div>

                    {/* Live status + date */}
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-xs font-semibold text-emerald-600">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="px-8 py-7 space-y-7">

                {/* Error banner */}
                {errors && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5">
                        <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        <p className="text-sm font-medium text-red-700">{errors}</p>
                    </div>
                )}

                {/* ── System Status Strip ── */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mr-2">System Status</span>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> API Services
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Database
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auth
                    </div>
                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${systemHealth.failedPushNotifications > 0 ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${systemHealth.failedPushNotifications > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} /> Push Notifications
                    </div>
                    <span className="ml-auto text-xs text-slate-400">Last checked: just now</span>
                </div>

                {/* ── Quick Actions ── */}
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-indigo-500" />
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Quick Actions</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                            Add Course
                        </button>
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m0 0A4 4 0 1113 9a4 4 0 01-4 6.13z" /></svg>
                            Manage Users
                        </button>
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-4 w-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0120 9.414V19a2 2 0 01-2 2z" /></svg>
                            View Reports
                        </button>
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export Data
                        </button>
                        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Settings
                        </button>
                    </div>
                </div>

                {/* ── ROW 1: Platform Scale ── */}
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-indigo-500" />
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Platform Scale</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5">
                        <MetricCard
                            title="Total Users"
                            value={userMetrics.totalUsers || 0}
                            icon={FaUsers}
                            accentColor="bg-gradient-to-r from-amber-400 to-orange-400"
                            iconBg="bg-amber-50"
                            iconColor="text-amber-500"
                            trend="up"
                            trendLabel="All time"
                        />
                        <MetricCard
                            title="Active This Week"
                            value={userMetrics.activeUsersThisWeek || 0}
                            icon={FaUserCheck}
                            accentColor="bg-gradient-to-r from-emerald-400 to-green-500"
                            iconBg="bg-emerald-50"
                            iconColor="text-emerald-500"
                            trend="up"
                            trendLabel="Engaged"
                        />
                        <MetricCard
                            title="New This Week"
                            value={userMetrics.newUsersThisWeek || 0}
                            icon={FaUserPlus}
                            accentColor="bg-gradient-to-r from-sky-400 to-blue-500"
                            iconBg="bg-sky-50"
                            iconColor="text-sky-500"
                            trend="up"
                            trendLabel="Growth"
                        />
                        <MetricCard
                            title="Total Courses"
                            value={contentMetrics.totalCourses || 0}
                            icon={FaBookOpen}
                            accentColor="bg-gradient-to-r from-blue-500 to-indigo-500"
                            iconBg="bg-blue-50"
                            iconColor="text-blue-500"
                            trend="up"
                            trendLabel="Published"
                        />
                        <MetricCard
                            title="Total Cohorts"
                            value={contentMetrics.totalCohorts || 0}
                            icon={FaUsersCog}
                            accentColor="bg-gradient-to-r from-violet-500 to-purple-500"
                            iconBg="bg-violet-50"
                            iconColor="text-violet-500"
                            trend="up"
                            trendLabel="Running"
                        />
                        <MetricCard
                            title="Lecturers"
                            value={contentMetrics.totalLecturers || 0}
                            icon={FaChalkboardTeacher}
                            accentColor="bg-gradient-to-r from-teal-400 to-cyan-500"
                            iconBg="bg-teal-50"
                            iconColor="text-teal-500"
                            trend="up"
                            trendLabel="Active"
                        />
                    </div>
                </section>

                {/* ── ROW 2: Academic Activity ── */}
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-violet-500" />
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Academic Activity</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                        <MetricCard
                            title="Unit Schedules"
                            value={contentMetrics.totalUnitSchedules || 0}
                            icon={FaCalendarAlt}
                            accentColor="bg-gradient-to-r from-teal-400 to-cyan-500"
                            iconBg="bg-teal-50"
                            iconColor="text-teal-500"
                            trend="up"
                            trendLabel="Scheduled"
                        />
                        <MetricCard
                            title="Total Assignments"
                            value={contentMetrics.totalAssignments || 0}
                            icon={FaTasks}
                            accentColor="bg-gradient-to-r from-orange-400 to-amber-500"
                            iconBg="bg-orange-50"
                            iconColor="text-orange-500"
                            trend="up"
                            trendLabel="Created"
                        />
                        <MetricCard
                            title="Overdue Assignments"
                            value={contentMetrics.overdueAssignments || 0}
                            icon={FaExclamationCircle}
                            accentColor={contentMetrics.overdueAssignments > 0 ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}
                            iconBg={contentMetrics.overdueAssignments > 0 ? 'bg-red-50' : 'bg-emerald-50'}
                            iconColor={contentMetrics.overdueAssignments > 0 ? 'text-red-500' : 'text-emerald-500'}
                            trend={contentMetrics.overdueAssignments > 0 ? 'down' : 'up'}
                            trendLabel={contentMetrics.overdueAssignments > 0 ? 'Needs attention' : 'All clear'}
                        />
                        <MetricCard
                            title="CATs Scheduled"
                            value={contentMetrics.totalCats || 0}
                            icon={FaClipboardList}
                            accentColor="bg-gradient-to-r from-purple-500 to-fuchsia-500"
                            iconBg="bg-purple-50"
                            iconColor="text-purple-500"
                            trend="up"
                            trendLabel="Scheduled"
                        />
                    </div>
                </section>

                {/* ── ROW 3: Chart + Feedback Panel ── */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Courses & Cohort Breakdown chart */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                                    <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </span>
                                <h2 className="text-sm font-semibold text-slate-800">Courses &amp; Cohort Breakdown</h2>
                            </div>
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 ring-1 ring-violet-200">
                                Analytics
                            </span>
                        </div>
                        <div className="p-6">
                            <CourseCohortChart data={contentMetrics.cohortsPerCourseDetail} />
                        </div>
                    </div>

                    {/* Feedback Overview Panel */}
                    <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                                    <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </span>
                                <h2 className="text-sm font-semibold text-slate-800">Feedback Overview</h2>
                            </div>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200">
                                Live
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Resolution rate bar */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
                                    <span className="text-sm font-bold text-slate-800">{resolutionRate}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-100">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                                        style={{ width: `${resolutionRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Status breakdown */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                        <span className="text-xs font-semibold text-amber-700">Open</span>
                                    </div>
                                    <span className="text-lg font-bold text-amber-700 tabular-nums">{feedbackSummary.open}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                                        <span className="text-xs font-semibold text-sky-700">Reviewed</span>
                                    </div>
                                    <span className="text-lg font-bold text-sky-700 tabular-nums">{feedbackSummary.reviewed}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                        <span className="text-xs font-semibold text-emerald-700">Resolved</span>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-700 tabular-nums">{feedbackSummary.resolved}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <p className="text-center text-xs text-slate-400">{totalFeedback} total ticket{totalFeedback !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </section>

                {/* ── ROW 4: Push Delivery Stats + Recent User Activity ── */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Push Delivery Stats */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                    <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </span>
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-800">Push Notification Delivery</h2>
                                    <p className="text-xs text-slate-400">Last 30 days</p>
                                </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                deliveryStats.successRate >= 90 ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' :
                                deliveryStats.successRate >= 70 ? 'bg-amber-50 text-amber-600 ring-amber-200' :
                                                                  'bg-red-50 text-red-600 ring-red-200'
                            }`}>
                                {deliveryStats.successRate}% Success
                            </span>
                        </div>

                        <div className="p-6">
                            {/* Success rate bar */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-500">Overall Success Rate</span>
                                    <span className="text-sm font-bold text-slate-800">{deliveryStats.successRate}%</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-100">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-700 ${
                                            deliveryStats.successRate >= 90 ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
                                            deliveryStats.successRate >= 70 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' :
                                                                              'bg-gradient-to-r from-red-400 to-rose-500'
                                        }`}
                                        style={{ width: `${deliveryStats.successRate}%` }}
                                    />
                                </div>
                            </div>

                            {/* Sent / Delivered / Failed boxes */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-xl bg-slate-50 px-4 py-4 text-center ring-1 ring-slate-100">
                                    <p className="text-2xl font-bold text-slate-800 tabular-nums">{deliveryStats.sent}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-500">Sent</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 px-4 py-4 text-center ring-1 ring-emerald-100">
                                    <p className="text-2xl font-bold text-emerald-700 tabular-nums">{deliveryStats.delivered}</p>
                                    <p className="mt-1 text-xs font-semibold text-emerald-600">Delivered</p>
                                </div>
                                <div className={`rounded-xl px-4 py-4 text-center ring-1 ${deliveryStats.failed > 0 ? 'bg-red-50 ring-red-100' : 'bg-slate-50 ring-slate-100'}`}>
                                    <p className={`text-2xl font-bold tabular-nums ${deliveryStats.failed > 0 ? 'text-red-600' : 'text-slate-800'}`}>{deliveryStats.failed}</p>
                                    <p className={`mt-1 text-xs font-semibold ${deliveryStats.failed > 0 ? 'text-red-500' : 'text-slate-500'}`}>Failed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent User Activity */}
                    <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100">
                                    <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m0 0A4 4 0 1113 9a4 4 0 01-4 6.13z" />
                                    </svg>
                                </span>
                                <h2 className="text-sm font-semibold text-slate-800">Recent User Activity</h2>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                                Live
                            </span>
                        </div>

                        {recentActivity.length === 0 ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-600">No activity yet</p>
                                <p className="mt-1 text-xs text-slate-400 max-w-[180px] leading-relaxed">
                                    Recent user events will appear here as users log in or register.
                                </p>
                            </div>
                        ) : (
                            /* Activity feed */
                            <ul className="divide-y divide-slate-50 overflow-y-auto max-h-[340px]">
                                {recentActivity.map((event, index) => (
                                    <li key={`${event.userId}-${index}`} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors duration-150">

                                        {/* Avatar */}
                                        <div className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                            event.role === 'admin'    ? 'bg-indigo-100 text-indigo-700' :
                                            event.role === 'classRep' ? 'bg-violet-100 text-violet-700' :
                                                                        'bg-sky-100 text-sky-700'
                                        }`}>
                                            {event.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-slate-700 truncate">{event.name}</p>
                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    event.action === 'registered'
                                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                        : 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
                                                }`}>
                                                    {event.action === 'registered' ? '✦ Registered' : '↩ Logged in'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Timestamp */}
                                        <span className="flex-shrink-0 text-[10px] text-slate-400 mt-0.5">
                                            {(() => {
                                                const diff = Math.floor((Date.now() - new Date(event.timestamp)) / 1000);
                                                if (diff < 60)   return `${diff}s ago`;
                                                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                                                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                                                return `${Math.floor(diff / 86400)}d ago`;
                                            })()}
                                        </span>

                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </section>
            </div>
        </div>
    );
}
