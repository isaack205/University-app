import React, {useState, useEffect} from "react";
import { Button } from "../ui/button";
import { MenuIcon, SettingsIcon, CircleUserRoundIcon, MoonIcon, SunIcon, BellIcon } from "lucide-react";
import { Sidebar } from '@/components/ui/sidebar';
import { useAuth } from "@/contexts/authContext";
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { UserRoundCogIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";

export default function Header () {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);
    const { isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login')
    };

    const handleClick = () => {
        toast.info('Feature coming soon');
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    return(
        <div>
            {isAuthenticated && 
                <div className="flex justify-between px-4 py-3 bg-blue-400 rounded-b-sm">
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="flex gap-3 items-center">
                        <MenuIcon onClick={toggleSidebar} className="h-7 w-7 text-white hover:text-blue-700"/>
                        <p className="font-bold text-2xl" onClick={() => navigate('/dashboard')}>Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <SunIcon className="text-white hover:text-blue-700" onClick={handleClick}/>
                        <BellIcon className="text-white hover:text-blue-700" onClick={() => navigate('/notifications')}/>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <CircleUserRoundIcon className="text-white hover:text-blue-700"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Hi, {user.name || 'user'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')}><UserRoundCogIcon /> Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/settings')}><SettingsIcon /> Settings</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="flex justify-betwe">Log Out <LogOutIcon /> </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            }
        </div>
    )
}