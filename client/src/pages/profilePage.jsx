// Imports
import { useAuth } from "@/contexts/authContext";
import React, { useEffect, useState } from "react";
import { authService } from "@/services/authApi";
import { UserIcon } from "lucide-react";
import UpdateDetails from "@/components/common/updateDetails";
import avator from '@/assets/avator1.webp'

export default function ProfilePage() {

    const { user } = useAuth();
    const cohortYear = user.cohort.year || user.user.cohort.year || 'N/A';
    const cohortName = user.cohort.name || user.user.cohort.name || 'N/A';
    const courseCode = user.course.code || user.user.course.code || 'N/A';
    const courseName = user.course.name || user.user.course.name || 'N/A';

    return(
        <div>
            <h3 className="font-bold text-3xl underline text-white text-shadow-lg text-shadow-blue-800 mb-5 lg:text-4xl">Profile Page</h3>
            <div className="flex items-center justify-center flex-col lg:flex-row w-[100%]">
                <div className="w-full lg:w-[60%] border shadow-xl flex flex-col md:flex-row lg:flex-col md:gap-7 lg:gap-7 md:items-center lg:items-center rounded-2xl m-5 bg-gradient-to-t from-green-300 to-white">
                    <div className="flex justify-center p-5">
                        <img src={avator} alt="Avator icon" className="bg-gray-100 rounded-xl h-30 w-30 lg:h-40 lg:w-40"/>
                    </div>
                    <div className="flex flex-col md:flex-row lg:flex-row gap-7 lg:gap-10 p-4">
                        <div className="flex flex-col px-10 md:px-0 lg:px-0">
                            <p className="underline font-bold text-2xl">Personal Details</p>
                            <span className="flex gap-3">
                                <p className="font-bold">Name: </p>
                                <p className="text-red-600">{user.name || user.user.name || 'N/A'}</p> 
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">Student Id: </p>
                                <p className="text-red-600">{user.studentId || user.user.studentId || 'N/A'}</p>
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">Email: </p>
                                <p className="text-red-600">{user.email || user.user.email || 'N/A'}</p>
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">PhoneNumber: </p>
                                <p className="text-red-600">{user.phoneNumber || user.user.phoneNumber || 'N/A'}</p>
                            </span>
                        </div>
                        <div className="flex flex-col px-10 md:px-0 lg:px-0">
                            <p className="underline font-bold text-2xl">Study Details</p>
                            <span className="flex gap-3">
                                <p className="font-bold">Course: </p>
                                <p className="text-red-600">{courseName}</p>
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">Course code: </p>
                                <p className="text-red-600">{courseCode}</p>
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">Cohort: </p>
                                <p className="text-red-600">{cohortName}</p>
                            </span>
                            <span className="flex gap-3">
                                <p className="font-bold">Enrolled year: </p>
                                <p className="text-red-600">{cohortYear}</p>
                            </span>
                        </div>
                    </div>
                </div>
                <hr className="border-2 border-blue-500 w-full lg:hidden"/>
                <div className="lg:w-[40%]">
                    <UpdateDetails />
                </div>
            </div>
        </div>
    )
}