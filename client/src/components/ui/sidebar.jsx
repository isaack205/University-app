import React from "react";
import { Button } from "./button";
import { CircleXIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { LayoutDashboardIcon } from "lucide-react";
import { User2Icon } from "lucide-react";
import { GraduationCapIcon } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { SchoolIcon } from "lucide-react";

export const Sidebar =  ({ isOpen, toggleSidebar }) => {

    const navigate = useNavigate();
    const {hasRole} = useAuth();

    return (
        <div className={`min-h-screen border-to-r border-purple-400 flex flex-col p-5 fixed top-15 left-0 h-full w-[60%] md:w-[30%] lg:w-90 z-50 rounded-r-2xl backdrop-blur-md border ${ isOpen ? 'translate-x-0' : '-translate-x-full'} lg:transform-none lg:translate-x-0 transition-transform easeinout duration-700`}>
            <div className="flex items-center justify-between pb-5 lg:hidden">
                <p></p>
                <CircleXIcon onClick={toggleSidebar} className="cursor-pointer"/>
            </div>

            {/*ClassRep and student menu */}
            {hasRole(['classRep', 'student']) && 
                <div className="flex flex-col flex-1">
                    <div>
                        <h3 className="font-bold text-xl">Dashboard menu</h3>
                        <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/home'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                            <LayoutDashboardIcon /> 
                            My dashboard
                        </Button>
                    </div>
                            <hr className="border-black mt-2 w-full rounded-xl"/>

                    <div className="mt-4">
                        <h3 className="font-bold text-xl">Academics</h3>
                        <div className="flex flex-col items-start">
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/schedule'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <CalendarDaysIcon /> 
                                TimeTable
                            </Button>
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/assignment/assignments'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <NotebookPenIcon /> 
                                Assignments
                            </Button>
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
                            {/* <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/auth/users'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <User2Icon /> 
                                Manage Users
                            </Button> */}
                            <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/course'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <GraduationCapIcon /> 
                                Manage Courses
                            </Button>
                            {/* <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/cohort'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                                <SchoolIcon /> 
                                Manage Cohorts
                            </Button> */}
                            <hr className="border-black mb-2 w-full rounded-xl"/>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
}