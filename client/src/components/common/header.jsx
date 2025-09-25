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
import { notificationService } from "@/services/notificationService";

export default function Header () {

    const [ isSidebarOpen, setIsSidebarOpen ] = useState(false);
    const { isAuthenticated, user, logout} = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login')
    };

    const handleClick = () => {
        toast.info('Feature coming soon');
    }

    useEffect(() => {
    
        if (!isAuthenticated) return;

        const fetchNotifications = async () => {
            try {
                const notificationsData = await notificationService.getMyNotifications();
                setNotifications(notificationsData);
            } catch (error) {
                console.error('Failed to load notifications:', error)
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();

        // Interval that runs 30secs to check for new notifications
        const interval = setInterval(fetchNotifications, 30000);

        // CleanUp
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const unreadCount = notifications.filter(n => !n.read).length

    return(
        <div>
            {isAuthenticated && 
                <div className="flex justify-between px-4 py-3 bg-blue-400 rounded-b-sm fixed w-full">
                    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                    <div className="flex gap-3 items-center">
                        <MenuIcon onClick={toggleSidebar} className="h-7 w-7 text-white hover:text-blue-700"/>
                        <p className="font-bold text-2xl" onClick={() => navigate('/home')}>CampusHub</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <SunIcon className="text-white hover:text-blue-700 cursor-pointer" onClick={handleClick}/>
                        <div className="flex flex-row relative">
                            <BellIcon className="text-white hover:text-blue-700 cursor-pointer" onClick={() => navigate('/notifications')}/>
                            {unreadCount > 0 ? (<p className="absolute -top-3 -right-4 text-[10px] bg-red-500 rounded-full py-0.5 px-1">{unreadCount}</p>) : ('') }
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <CircleUserRoundIcon className="text-white hover:text-blue-700 cursor-pointer"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Hi, {user.name || 'user'}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate('/profile')}><UserRoundCogIcon /> Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast.info('Feature coming soon!')}><SettingsIcon /> Settings</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout} className="flex justify-betwe">Log Out <LogOutIcon /> </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            }
        </div>
    )
}