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
} from "@/components/ui/dropdown-menu"
import { use } from "react";

export default function Header () {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);
    const { isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login')
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    
    return(
        <div>
            {isAuthenticated && 
                <div className="border flex justify-between px-4 py-3">
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="flex gap-3 items-center">
                        <Button onClick={toggleSidebar}>
                            <MenuIcon/>
                        </Button>
                        <p>Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <SunIcon />
                        <BellIcon onClick={() => navigate('/notifications')}/>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <CircleUserRoundIcon />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Hi, {user.name || 'user'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            }
        </div>
    )
}