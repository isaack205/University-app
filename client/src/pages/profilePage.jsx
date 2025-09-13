// Imports
import { useAuth } from "@/contexts/authContext";
import React, { useEffect, useState } from "react";
import { authService } from "@/services/authApi";
import { UserIcon } from "lucide-react";

export default function ProfilePage() {

    const { user } = useAuth();
    const cohortYear = user.user.cohort.year || user.cohort.year
    const cohortName = user.user.cohort.name || user.cohort.name
    const courseCode = user.user.course.code || user.course.code 
    const courseName = user.user.course.name || user.course.name

    return(
        <div className="flex justify-center">
            <div className="w-full shadow-xl flex flex-col md:flex-row lg:flex-row gap-7 md:items-center lg:items-center rounded-2xl m-5 lg:m-30">
                <div className="flex justify-center">
                    <UserIcon className="h-60 w-60"/>
                </div>
                <div className="flex flex-col px-10 md:px-0 lg:px-0">
                    <p className="text-center underline font-bold text-2xl">Personal Details</p>
                    <span className="flex gap-3">
                        <p className="font-bold">Name: </p>
                        {user.name || user.user.name || 'N/A'} 
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">Student Id: </p>
                        {user.studentId || user.user.studentId || 'N/A'}
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">Email: </p>
                        {user.email || user.user.email || 'N/A'}
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">PhoneNumber: </p>
                        {user.phoneNumber || user.user.phoneNumber || 'N/A'}
                    </span>
                </div>
                <div className="flex flex-col px-10 md:px-0 lg:px-0">
                    <p className="text-center underline font-bold text-2xl">Study Details</p>
                    <span className="flex gap-3">
                        <p className="font-bold">Course: </p>
                        {courseName}
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">Course code: </p>
                        {courseCode}
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">Cohort: </p>
                        {cohortName}
                    </span>
                    <span className="flex gap-3">
                        <p className="font-bold">Enrolled year: </p>
                        {cohortYear}
                    </span>
                </div>
            </div>
        </div>
    )
}