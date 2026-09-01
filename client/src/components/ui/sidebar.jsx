import React from "react";
import { Button } from "./button";
import { CircleXIcon, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { LayoutDashboardIcon, CalendarDaysIcon, NotebookPenIcon, PencilLineIcon } from "lucide-react";
import { GraduationCapIcon } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { SchoolIcon } from "lucide-react";
import FileMenu from "../fileMenu";
import { User2Icon } from "lucide-react";
import confetti from "canvas-confetti";
import { BrainCircuitIcon } from "lucide-react";

export const Sidebar =  ({ isOpen, toggleSidebar }) => {

    const navigate = useNavigate();
    const {hasRole} = useAuth();

    const handleLecturerClick = () => {
    // 1. Check if they've seen the "New Feature" celebration before
    const hasSeenCelebration = localStorage.getItem('hasSeenLecturerFeature');

    if (!hasSeenCelebration) {
        // 2. Trigger the Confetti!
        confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#10b981'] // Blue, Gold, and Green
        });

        // 3. Save to localStorage so it doesn't repeat
        localStorage.setItem('hasSeenLecturerFeature', 'true');
    }

    // 4. Run your existing navigation logic
    navigate('/lecturers'); 
    if (window.innerWidth < 1024) toggleSidebar();
    };

    return (
        <div className={`min-h-screen border-to-r border-purple-400 flex flex-col p-5 fixed top-15 left-0 h-full w-[60%] md:w-[30%] lg:w-90 z-[999] rounded-r-2xl backdrop-blur-lg border ${ isOpen ? 'translate-x-0' : '-translate-x-full'} lg:transform-none lg:translate-x-0 transition-transform easeinout duration-700`}>
            <div className="flex items-center justify-between pb-5 lg:hidden">
                <p></p>
                <CircleXIcon onClick={toggleSidebar} className="cursor-pointer"/>
            </div>

            {/*ClassRep and student menu */}
            {hasRole(['classRep', 'student']) && 
                <div className="flex flex-col flex-1">
                    <div>
                        <h3 className="font-bold text-xl text-green-600">Dashboard menu</h3>
                        <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/home'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                            <LayoutDashboardIcon /> 
                            My dashboard
                        </Button>
                    </div>
                            <hr className="border-black mt-2 w-full rounded-xl"/>

                    <div className="mt-4">
                        <h3 className="font-bold text-xl  text-green-600">Academics</h3>
                        <div className="flex flex-col items-start">
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/schedule'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <CalendarDaysIcon /> 
                                TimeTable
                            </Button>
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/assignment/assignments'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <NotebookPenIcon /> 
                                Assignments
                            </Button>
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/CAT'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <PencilLineIcon /> 
                                CAT(S)
                            </Button>
                            <FileMenu isOpen={isOpen} toggleSidebar={toggleSidebar} />
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/lecturers'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <User2Icon />
                                Lecturers Directory
                            </Button>
                            {/* <div className="relative inline-block mb-5 group animate-pulse">

                                <div className="absolute -top-3 -right-2 z-10 animate-bounce transition-transform group-hover:scale-125 flex gap-2">
                                    <p className="text-yellow-500 font-bold">NEW</p>
                                    <Crown className="w-5 h-5 text-amber-500 fill-amber-400 drop-shadow-md" />
                                </div>

                                <Button 
                                    className="bg-yellow-200 hover:bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-2 transform transition-all duration-500 flex items-center gap-3 px-6 py-6 rounded-2xl" 
                                    onClick={handleLecturerClick}
                                >
                                    <User2Icon className="w-6 h-6" /> 
                                    <span>Lecturers Directory</span>
                                </Button>
                            </div> */}
                            <div className="relative inline-block mb-5 group cursor-not-allowed opacity-70 ">
                                <Button 
                                    className="bg-no hover:bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointe shadow-lg hover:shadow-2xl hover:underline hover:-translate-y-2 transform transition-all duration-500 flex items-center gap-3 px-6 py-6 rounded-2xl" 
                                    onClick={handleLecturerClick}
                                    disabled
                                >
                                    <BrainCircuitIcon className="w-6 h-6" /> 
                                    <div>
                                        <span>Exam TT</span>
                                        <span className="absolute right-1 top-1/2 -translate-y-6 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-600 border border-amber-200 uppercase tracking-tighter">
                                            Soon
                                        </span>
                                    </div>
                                </Button>
                                <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded whitespace-nowrap">
                                    Coming soon! 🚀
                                </div>
                            </div>
                            <hr className="border-black mb-2 w-full rounded-xl"/>
                            {hasRole('classRep')  && 
                                <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/dashboard'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                    <LayoutDashboardIcon /> 
                                    Rep Dashboard
                                </Button>
                            }
                        </div>
                    </div>
                </div>
            }

            {/*Admin menu */}
            {hasRole(['admin']) && 
                <div className="flex flex-col flex-1">
                    <div>
                        <h3 className="font-bold text-xl">Admin menu</h3>
                        <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/admin/dashboard'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                            <LayoutDashboardIcon /> 
                            My dashboard
                        </Button>
                    </div>
                    <hr className="border-black mt-2 w-full rounded-xl"/>

                    <div className="mt-4">
                        <h3 className="font-bold text-xl"></h3>
                        <div className="flex flex-col items-start">
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/admin/users'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <User2Icon /> 
                                Manage Users
                            </Button>
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/admin/course'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <GraduationCapIcon /> 
                                Manage Courses
                            </Button>
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/admin/cohort'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <SchoolIcon /> 
                                Manage Cohorts
                            </Button>
                            <hr className="border-black mb-2 w-full rounded-xl"/>
                        </div>
                    </div>
                </div>
            }

            <div className="mt-auto mb-10 p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            System Operational
                        </span>
                    </div>
                    <p className="text-[9px] font-medium text-balck">
                        CampusHub v0.1.3 • Chuka Build
                    </p>
                </div>
            </div>
            

        </div>
    )
}