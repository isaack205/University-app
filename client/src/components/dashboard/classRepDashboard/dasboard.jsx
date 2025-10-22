// Imports
import React, {useState, useEffect} from "react";
import { NavLink, Outlet } from 'react-router-dom';
import imageUrl from '@/assets/manage.webp';
import { toast } from "sonner";

export default function Dashboard() {

    return(
        <div>
            <div className="flex flex-col md:flex-row lg:flex-row gap-5 items-center justify-between shadow-xl p-5 border rounded-xl w-[100%] bg-purple-100 dark:bg-slate-800">
                <div className="flex flex-col md:w-[80%] md:w-[80%] lg:w-[80%]">
                    <h3 className="text-[17px] md:text-2xl lg:text-2xl font-bold">✨ Welcome to your Class Rep Dashboard, </h3>
                    <p className="text-[15px] md:text-xl lg:text-xl italic text-green-500">This is your space to keep the class running smoothly. Post assignments, update unit schedules, and make quick changes whenever things shift around.</p>
                    <p className="text-[15px] md:text-xl lg:text-xl italic text-green-500">Think of it as your backstage pass to keeping the class on point.</p>
                    <p className="text-[10px] md:text-lg lg:text-lg italic text-gray-500 mt-4 text-end md:text-start lg:text-start">"Your class, your flow — all in one place." 🎓✨</p>
                </div>
                <img src={imageUrl} alt="Edit icon" className="h-35 w-auto hidden md:block lg:block"/>
            </div>
            <hr className="border-green-500 mt-5"/>
            <nav className="m-5">
                <ul className="flex gap-2 md:gap-5 lg:gap-5 flex-row items-center justify-center w-[100%]">
                    <li className="bg-green-300 hover:bg-green-400 dark:bg-slate-800 p-2 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition easeinout duration-500 cursor-pointer w-[30%] md:w-50 lg:w-70">
                        <NavLink to='/dashboard/schedule'> 
                            <p className="text-sm md:text-lg lg:text-xl">Manage Units </p>
                        </NavLink>
                    </li>
                    <li className="bg-green-300 hover:bg-green-400 dark:bg-slate-800 p-2 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition easeinout duration-500 cursor-pointer w-[30%] md:w-50 lg:w-70">
                        <NavLink to='/dashboard/assignment'> 
                            <p className="text-sm md:text-lg lg:text-xl">Manage assignments</p>
                        </NavLink>
                    </li>
                    <li className="bg-green-300 hover:bg-green-400 dark:bg-slate-800 p-2 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition easeinout duration-500 cursor-pointer w-[30%] md:w-50 lg:w-70">
                        <NavLink to='/dashboard/emergency' onClick={() => toast.info('Feature coming soon')}> 
                            <p className="text-sm md:text-lg lg:text-xl">Emergencies</p>
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <hr className="border-green-500 mt-5"/>
            <div className="">
                <p className="text-center text-gray-400">Manage like a pro! By clicking the buttons above.</p>
                <Outlet />
            </div>
        </div>
    )
}