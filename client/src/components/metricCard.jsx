//Imports
import React from 'react';
import { FaUsers, FaBookOpen, FaUsersCog, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

const MetricCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
    <div className={`p-5 rounded-xl shadow-lg flex items-center justify-between ${bgColor}`}>
        <div>
            <p className="text-sm font-medium uppercase text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${textColor} opacity-50`} />
    </div>
);

const Cards = ({ userMetrics, contentMetrics, health }) => {
    
    // Determine the color of the failed notification card
    const notificationColor = health.failedPushNotifications > 0 ? 
        'bg-red-100 border-red-500' : 'bg-green-100 border-green-500';
    const notificationTextColor = health.failedPushNotifications > 0 ? 'text-red-700' : 'text-green-700';

    return (
        <>
            <MetricCard 
                title="Total Users" 
                value={userMetrics.totalUsers || '0'} 
                icon={FaUsers} 
                bgColor="bg-yellow-100"
                textColor="text-yellow-600"
            />
            <MetricCard 
                title="Total Courses" 
                value={contentMetrics.totalCourses || '0'} 
                icon={FaBookOpen} 
                bgColor="bg-blue-100" 
                textColor="text-blue-600"
            />
            <MetricCard 
                title="Total Cohorts" 
                value={contentMetrics.totalCohorts || '0'} 
                icon={FaUsersCog} 
                bgColor="bg-purple-100" 
                textColor="text-purple-600"
            />
            <MetricCard 
                title="Total Schedules" 
                value={contentMetrics.totalUnitSchedules || '0'} 
                icon={FaCalendarAlt} 
                bgColor="bg-yellow-100" 
                textColor="text-yellow-600"
            />
            <MetricCard 
                title="Failed push Notifications" 
                value={health.failedPushNotifications || '0'} 
                icon={FaExclamationTriangle} 
                bgColor={notificationColor} 
                textColor={notificationTextColor}
            />
        </>
    );
};

export default Cards;