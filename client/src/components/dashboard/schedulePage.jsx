// Imports
import React, { useEffect, useState} from "react";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/authContext";
import { InfoIcon, CalendarDaysIcon, LoaderIcon, GraduationCapIcon, BookOpenIcon, ClockIcon, Calendar1Icon, MapPinIcon } from "lucide-react";

export default function SchedulePage() {

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const timeBlocks = [
        { start: "07:00", end: "10:00" },
        { start: "10:00", end: "13:00" },
        { start: "13:00", end: "16:00" },
        { start: "16:00", end: "19:00" }
    ];
    const days = [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" ];
    const { user } = useAuth();

    useEffect(() => {

        const fetchSchedules = async () => {

            try {
                const schedulesData = await unitScheduleService.getMyShedule();
                setSchedules(schedulesData);
            } catch (error) {
                console.error('Failed to fetch schedules:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSchedules()
    }, []);

    return(
        <div className="">
            {loading ? (
                <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl">Loading your timetable</p>
                        <LoaderIcon className="animate-spin h-7 w-7"/>
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="font-bold text-3xl underline text-white text-shadow-lg text-shadow-yellow-800 text-center mb-5 lg:text-4xl">Time Table</h1>
                    <div className="border bg-green-100 w-full flex flex-col justify-center p-[10px] shadow-2xl rounded-xl">
                        <div className="flex flex-col items-center underline font-bold italic lg:text-2xl lg:mb-5">
                            <p> Course: {user.course.name || user.user.course.name  || 'N/A'}</p>
                            <p className="mb-3">{user.cohort.name || user.user.cohort.name  || 'N/A'}</p>
                        </div>

                        <div className="overflow-x-auto pb-4">
                            <div className="min-w-max">
                                <div className="grid grid-cols-5 gap-2 pb-2 md:pb-0 lg:pb-0">
                                    <div className="font-bold text-center"></div>
                                    {timeBlocks.map(({ start, end }) => (
                                        <div key={start} className="h-10 md:h-24 lg:h-24 md:w-auto text-sm text-gray-600 font-bold flex items-center justify-center">
                                            <div className="lg:text-2xl md:text-2xl text-[8px] flex flex-col md:flex-row lg:flex-row items-center justify-center"> 
                                                <span>{dayjs(`2025-01-01T${start}`, "YYYY-MM-DDTHH:mm").format("h:mm A")}</span>
                                                <span> – </span>
                                                <span>{dayjs(`2025-01-01T${end}`, "YYYY-MM-DDTHH:mm").format("h:mm A")}</span> 
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {days.map((day) => (
                                    <div key={day} className="grid grid-cols-5">
                                        <h3 className="pr-4 flex justify-end items-center font-bold text-blue-600 text-[14px] md:text-2xl lg:text-2xl">{day}</h3>

                                        {timeBlocks.map(({ start }, index) => {
                                            const classInBlock = schedules.find(
                                            (item) => item.dayOfWeek === day && item.startTime === start
                                            );

                                            return (
                                            <div key={start + day} className="h-10 md:h-20 lg:h-20 border rounded p-1 bg-gray-100 mb-1 mr-1 flex flex-col justify-center">
                                                {classInBlock ? (
                                                <div className="bg-white shadow p-1 rounded text-xs flex flex-col">
                                                    <p className="font-bold flex flex-col sm:text-lg lg:text-lg text-[10px] text-center">{classInBlock.unitCode.toUpperCase()}</p>
                                                    <div className="flex flex-col md:flex-row text-[9px] lg:flex-row md:gap-2 lg:gap-2 justify-center items-center">
                                                        <p className="lg:text-lg md:text-lg font-semibold hidden md:block lg:block">Venue:</p> 
                                                        <p className="lg:text-lg md:text-lg font-semibold text-red-400">{classInBlock.venue}</p>
                                                    </div>
                                                </div>
                                                ) : null}
                                            </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <hr className="border-black mt-6 border-2 rounded-xl"/>
                    <div className="mt-10">
                        <div className="font-bold flex items-center gap-3 mb-5"> 
                            <InfoIcon className="text-red-500"/> 
                            <h1 className="underline text-2xl text-blue-600 text-shadow-md text-shadow-yellow-400">Units undertaking information:</h1>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                            {schedules.map(schedule => (
                                <div key={schedule._id} className="hover:shadow-lg shadow-blue-500 rounded-2xl p-4 max-w-md border bg-blue-100 hover:shadow-xl hover:-translate-y-1 transform easeinout duration-700">
                                    <p className="text-center text-xl font-bold underline">Unit Summary</p>
                                    <hr className="border-green-800"/>
                                    <span className="flex gap-2 justify-between mt-3">
                                        <p className="font-bold">Unit name:</p>
                                        <h4 className="italic">{schedule.unitName}</h4>
                                    </span>
                                    <span className="flex gap-2 justify-between">
                                        <p className="font-bold">Unit code:</p>
                                        <p className="italic">{schedule.unitCode}</p>
                                    </span>
                                    <span className="flex gap-2 justify-between">
                                        <p className="font-bold">Unit lecturer:</p>
                                        <p className="italic">Mr/Mrs.{schedule.lecturer}</p>
                                    </span>
                                    <span className="flex gap-2 justify-between">
                                        <p className="font-bold">Venue:</p>
                                        <p className="italic">{schedule.venue}</p>
                                    </span>
                                    <span className="flex gap-2 items-center justify-center mt-2">
                                        <ClockIcon />
                                        {schedule.dayOfWeek} • {schedule.startTime} - {schedule.endTime}
                                    </span>
                                    <hr className="border-green-800 mt-2"/>
                                    <span className="flex gap-2 justify-end mt-2">
                                        <p className="font-bold">Cohort:</p>
                                        <p className="italic">{schedule.cohort.name}</p>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}