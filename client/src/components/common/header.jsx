import React from "react";
import { MenuIcon, SettingsIcon, CircleUserRoundIcon, HelpCircleIcon, UserRoundCogIcon, GraduationCapIcon } from "lucide-react";
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
import ThemeToggle from "../themeToggle";
import NotificationDialog from "@/pages/notificationPage";
import LogoutDialog from "./logoutDialog";

export default function Header({ isSidebarOpen, toggleSidebar }) {
    const { isAuthenticated, user, hasRole } = useAuth();
    const navigate = useNavigate();

    const handleCampusHubClick = () => {
        if (user?.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/home');
        }
    };

    if (!isAuthenticated) return null;

    return (
        <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-xl border-b border-border/60 pt-safe transition-all shadow-sm">
            <div className="w-full mx-auto px-4 py-2.5 flex items-center justify-between">
                {/* Left Side: Brand Logo & Mobile Sidebar Trigger */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        type="button"
                        className="hidden md:block lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
                        aria-label="Toggle navigation drawer"
                    >
                        <MenuIcon className="h-6 w-6" />
                    </button>

                    <div 
                        onClick={handleCampusHubClick}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-600/20 group-hover:scale-105 transition-transform">
                            <GraduationCapIcon size={18} />
                        </div>
                        <span className="font-black text-xl tracking-tight text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Campus<span className="text-green-600 dark:text-green-400">Hub</span>
                        </span>
                    </div>
                </div>

                {/* Right Side: Theme Toggle, Notifications, User Menu */}
                <div className="flex items-center gap-3 md:gap-4">
                    <ThemeToggle />

                    {hasRole(['classRep', 'student']) && (
                        <div id="header-notifications">
                            <NotificationDialog />
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button 
                                type="button" 
                                className="flex items-center gap-2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none"
                            >
                                <CircleUserRoundIcon className="h-6 w-6 text-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 mt-1">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none">{user?.firstName || user?.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                                <UserRoundCogIcon className="mr-2 h-4 w-4" /> Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                                <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer">
                                <HelpCircleIcon className="mr-2 h-4 w-4" /> Help & Support
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <LogoutDialog /> 
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}