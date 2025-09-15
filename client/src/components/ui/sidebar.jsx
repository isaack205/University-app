import React from "react";
import { Button } from "./button";
import { CircleXIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { LayoutDashboardIcon } from "lucide-react";
import { CalendarDaysIcon } from "lucide-react";
import { NotebookPenIcon } from "lucide-react";

export const Sidebar =  ({ isOpen, toggleSidebar }) => {

    const navigate = useNavigate();
    return (
        <div className={`min-h-screen border-t0-r border-purple-400 flex flex-col p-5 fixed top-15 left-0 h-full w-[60%] md:w-[30%] lg:w-90 z-50 rounded-r-2xl backdrop-blur-md border ${ isOpen ? 'translate-x-0' : '-translate-x-full'} lg:transform-none lg:translate-x-0 transition-transform easeinout duration-700`}>
            <div className="flex items-center justify-between pb-5 lg:hidden">
                <p></p>
                <CircleXIcon onClick={toggleSidebar} className="cursor-pointer"/>
            </div>
            <div className="flex flex-col flex-1">
                <div>
                    <h3 className="font-bold text-xl">Dashboard menu</h3>
                    <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/dashboard'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                        <LayoutDashboardIcon /> 
                        My dashboard
                    </Button>
                </div>
                <div className="mt-4">
                    <h3 className="font-bold text-xl">Academics</h3>
                    <div className="flex flex-col items-start">
                        <Button className="bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/schedule'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                            <CalendarDaysIcon /> 
                            TimeTable
                        </Button>
                        <Button className="bg-no text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => { navigate('/assignments'); if (window.innerWidth < 1024) toggleSidebar(); }}>
                            <NotebookPenIcon /> 
                            Assignments
                        </Button>
                    </div>
                </div>
            </div>
            <div className="">
            </div>
        </div>
    )
}