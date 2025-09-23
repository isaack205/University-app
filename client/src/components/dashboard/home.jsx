import React, {useEffect, useState} from "react";
import { useAuth } from "@/contexts/authContext";
import { upcomingsService } from "@/services/upcomingSchedulerApi";
import { CalendarDaysIcon, LoaderIcon, GraduationCapIcon, BookOpenIcon, ClockIcon, Calendar1Icon, MapPinIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from 'react-router-dom';
import imageUrl from '@/assets/download.png';
import ColourfulText from "../ui/colourful-text";
import { TextGenerateEffect } from "../ui/text-generate-effect";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { UserIcon } from "lucide-react";
import { InfoIcon } from "lucide-react";

export default function Home () {

    const { user, loading } = useAuth();

    const [upcomings, setUpcomings] = useState([]);
    const [units, setUnits] = useState([]);
    const navigate = useNavigate();
    const words = 'Hello, this is a Learner management system which tracks upcoming classes, due assignements, fetches your weekly timetable and helps one plan adequately.';
    
    const handleViewTimetable = () => {
        navigate('/schedule')
    }

    useEffect(() => {

        const fetchUpcomingList = async () => {
            try {
                const upcomingData = await upcomingsService.getUpcomingItems();
                setUpcomings(upcomingData);
            } catch (error) {
                console.log('Failed to load notifications:', error);
            }
        };

        const fetchUnits = async () => {
            try {
                const unitsData = await unitScheduleService.getMyShedule();
                setUnits(unitsData);
            } catch (error) {
                console.error('Error fetching units:', error)
            }
        }

        fetchUnits();
        fetchUpcomingList();
    }, []);

    return(
        <div className="">
            <h3 className="text-3xl font-bold text-green-500 ">Dashboard</h3>
            <div className="flex flex-col gap-3 bg-purple-100 shadow-xl rounded justify-between border rounded-xl items-center p-5 md:flex-row lg:flex-row">
                <div className="flex flex-col sm:max-w-lg">
                    <span className="flex gap-2 text-xl md:text-2xl lg:text-2xl mb-3 items-end">
                        <h3 className="font-bold ">Welcome back, </h3>
                        <p className="font-bold text-2xl md:text-3xl lg:text-3xl">
                            <ColourfulText text={user ? (user.name || user.user.name) : ('User')} />
                        </p>
                    </span>
                    <span className="">
                        <TextGenerateEffect words={words}/>
                    </span>
                </div>
                <div>
                    <img src={imageUrl} alt="User with laptop" className="h-35 w-auto"/>
                </div>
            </div>
            <div className="flex flex-col md:flex-row lg:flex-row gap-5 mt-10">
                <div className="flex flex-col md:w-[50%] lg:w-[50%]">
                    <div className=" rounded-xl bg-gray-200">
                        <span className="flex gap-3 pl-5 pt-5">
                            <GraduationCapIcon />
                            <h1 className="font-bold text-xl text-blue-600">Academic Overview</h1>
                        </span>
                        <div className="flex flex-row gap-5 max-w-sm lg:max-w-[100%] p-4 rounded-xl justify-center">
                            <div className="border w-[50%] w-full shadow-xl rounded-xl p-5 flex flex-col gap-1 bg-blue-100">
                                <GraduationCapIcon  className="text-red-500 h-10 w-10 p-1 rounded-lg bg-blue-300 mb-1"/>
                                <p className="font-bold text-2xl">{units.length || '0'}</p>
                                <h1 className="font-bold text-xl">Units</h1>
                                <p className="text-sm italic">This semester</p>
                            </div>
                            <div className="border w-[50%] w-full shadow-xl rounded-xl p-5 flex flex-col gap-1 bg-blue-100">
                                <BookOpenIcon className="text-red-500 h-10 w-10 p-1 rounded-lg bg-blue-300 mb-1"/>
                                <p className="font-bold text-2xl">{upcomings && upcomings.upcomingAssignments ? upcomings.upcomingAssignments.length : 0}</p>
                                <h1 className="font-bold text-xl">Assignements</h1>
                                <p className="text-sm italic">⚠️ Due in next 7 days?</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 bg-gray-200 rounded-xl p-5 h-60 overflow-x-auto">
                        <span className="flex gap-3 mb-5">
                            <Calendar1Icon />
                            <h3 className="font-bold text-xl text-blue-600">Due Assignements</h3>
                        </span>
                        <div>
                            {upcomings && upcomings?.upcomingAssignments?.length > 0 ? (
                                upcomings.upcomingAssignments.map((upcoming) => (
                                <div key={upcoming._id} className="border shadow-lg rounded-xl p-2 max-w-sm w-full lg:max-w-[100%] bg-blue-100 hover:shadow-xl hover:-translate-y-1 transform easeinout duration-500">
                                    <h3 className="font-bold text-center">{upcoming.title || 'Assignement name'}</h3>
                                    <hr className="border-green-500 mt-1 mb-1"/>
                                    <span className="flex gap-3">
                                        <p className="font-bold">Unit Name: </p>
                                        {upcoming.unit.unitName}
                                    </span>
                                    <span className="flex gap-3">
                                        <p className="font-bold">Cohort Name: </p>
                                        {upcoming.cohort.name}
                                    </span>
                                    <span className="flex gap-3">
                                        <p className="font-bold">Due date: </p>
                                        {new Date(upcoming.dueDate).toLocaleString() || 'N/A'}
                                    </span>
                                    <span className="flex gap-3 text-gray-500 text-sm justify-end mt-3">
                                        {new Date(upcoming.createdAt).toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                            ))
                            ) : (
                                <div className="p-2 m-2 bg-green-100 shadow-xl max-w-sm rounded-xl flex flex-col items-center">
                                    <CalendarDaysIcon className="h-30 w-80"/>
                                    <p className="text-gray-500">No upcoming assignements.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-200 rounded-xl p-5 md:w-[50%] lg:w-[50%] h-130 overflow-x-auto">
                    <span className="flex gap-3 mb-8">
                        <ClockIcon />
                        <h3 className="font-bold text-xl text-blue-600">Upcoming Classes (in 24 hours)</h3>
                    </span>
                    <div className="flex flex-col gap-10">
                        {upcomings && upcomings?.upcomingClasses?.length > 0 ? (
                            upcomings.upcomingClasses.map((upcoming) => (
                            <div key={upcoming._id} className="shadow-lg border p-2 max-w-sm rounded-xl bg-blue-100 w-full lg:max-w-[100%] flex flex-col gap-1 hover:shadow-xl hover:-translate-y-1 transform easeinout duration-500">
                                <h3 className="text-center font-bold">{upcoming.unitName || 'Unit'} ({upcoming.unitCode})</h3>
                                <hr className="border-green-600"/>
                                <span className="flex gap-3 items-center">
                                    <ClockIcon className="text-red-500 h-5 w-5"/>
                                    <p>{upcoming.dayOfWeek || 'Day of week'} • {upcoming.startTime} - {upcoming.endTime}</p>
                                </span>
                                <span className="flex gap-3 items-center">
                                    <MapPinIcon className="text-red-500 h-5 w-5"/>
                                    <p>{upcoming.venue || 'N/A'}</p>
                                </span>
                                <span className="flex gap-3 items-center">
                                    <UserIcon className="text-red-500 h-5 w-5"/>
                                    Mr/Mrs.{upcoming.lecturer || 'N/A'}
                                </span>
                                <div className="flex justify-end mt-3">
                                    <Button className="bg-green-500 text-black font-bold hover:bg-green-600 hover:shadow-xl hover:shadow-blue-200 cursor-pointer" onClick={handleViewTimetable} disabled={loading}>
                                        {loading ? (
                                        <div>
                                                <p>Wait a moment!</p>
                                        </div> 
                                        ) : (
                                            <div>
                                                <p>View full timetable</p>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))
                        ) : (
                            <div className="p-2 bg-green-100 shadow-xl max-w-sm rounded-xl flex flex-col items-center">
                                <CalendarDaysIcon className="h-30 w-80"/>
                                <p className="text-gray-500">No upcoming classes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-gray-200 rounded-xl p-5 flex flex-col items-center mt-10">
                <div className="flex flex-row gap-3 items-center p-3">
                    <CalendarDaysIcon className="md:w-10 lg:w-10 md:h-10 lg:h-10"/>
                    <h3 className="font-bold text-2xl text-blue-600 md:text-4xl lg:text-4xl">Events</h3>
                </div>
                <div className="shadow-xl rounded-xl w-full flex flex-col items-center bg-green-100 p-3">
                    <div className="flex gap-3">
                        <InfoIcon className="text-red-500"/>
                        <p>Coming soon !</p>
                    </div>
                    <CalendarDaysIcon className="h-40 w-40"/>
                </div>
            </div>
        </div>
    )
}