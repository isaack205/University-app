import React, {useState, useEffect} from "react";
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
import { UserRoundCogIcon } from "lucide-react";
import { LogOutIcon } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import ThemeToggle from "../themeToggle";
import NotificationDialog from "@/pages/notificationPage";
import LogoutDialog from "./logoutDialog";

export default function Header () {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);
    const { isAuthenticated, user, logout, hasRole} = useAuth();
    const navigate = useNavigate();
    // const [notifications, setNotifications] = useState([]);


    const handleLogout = () => {
        logout();
        navigate('/login')
    };

    // useEffect(() => {
    
    //     if (!isAuthenticated) return;

    //     const fetchNotifications = async () => {
    //         try {
    //             const notificationsData = await notificationService.getMyNotifications();
    //             setNotifications(notificationsData);
    //         } catch (error) {
    //             console.error('Failed to load notifications:', error)
    //         };
    //     }

    //     fetchNotifications();

    //     // Interval that runs 30secs to check for new notifications
    //     const interval = setInterval(fetchNotifications, 30000);

    //     // CleanUp
    //     return () => clearInterval(interval);
    // }, [isAuthenticated]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleCampusHubClick = () => {

        if (user.role === 'admin') {
            navigate('/admin/dashboard')
        } else {
            navigate('/home')
        };

    };

    if (!isAuthenticated) return null;

    // const unreadCount = notifications.filter(n => !n.read).length;

    return(
        <div>
            {isAuthenticated && 
                <div className="flex justify-between px-4 py-3 bg-gradient-to-b z-90 from-blue-600 to-blue-200 dark:bg-slate-800 rounded-b-sm fixed w-full">
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="flex gap-3 items-center">
                        <MenuIcon onClick={toggleSidebar} className="h-7 w-7 text-white hover:text-blue-700 cursor-pointer"/>
                        <p className="font-bold text-2xl cursor-pointer" onClick={handleCampusHubClick}>CampusHub</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        {/* {hasRole(['classRep', 'student']) && 
                            <div className="flex flex-row relative">
                                <BellIcon className="text-white hover:text-blue-700 cursor-pointer" onClick={() => navigate('/notifications')}/>
                                {unreadCount > 0 ? (<p className="absolute -top-3 -right-4 text-[10px] bg-red-500 rounded-full py-0.5 px-1">{unreadCount}</p>) : ('') }
                            </div>
                        } */}

                        {hasRole(['classRep', 'student']) && (
                            <NotificationDialog />
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <CircleUserRoundIcon className="text-white hover:text-blue-700 cursor-pointer"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Hi, {user.name || 'user'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer"><UserRoundCogIcon /> Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer"><SettingsIcon /> Settings</DropdownMenuItem>
                                
                                <LogoutDialog /> 
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            }
        </div>
    )
}