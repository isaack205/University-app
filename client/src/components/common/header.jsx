import React, {useState, useEffect} from "react";
import { Button } from "../ui/button";
import { MenuIcon, SettingsIcon, CircleUserRoundIcon, MoonIcon, SunIcon, BellIcon } from "lucide-react";
import { Sidebar } from '@/components/ui/sidebar';

export default function Header () {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    return(
        <div className="border flex justify-between px-4 py-3">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex gap-3 items-center">
                <Button onClick={toggleSidebar}>
                    <MenuIcon/>
                </Button>
                <p>Dashboard</p>
            </div>
            <div className="flex gap-3">
                <SunIcon />
                <BellIcon />
                <CircleUserRoundIcon />
            </div>
        </div>
    )
}