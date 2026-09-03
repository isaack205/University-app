import React from "react";
import { Button } from "./button";
import { CircleXIcon, LayoutDashboardIcon, CalendarDaysIcon, NotebookPenIcon, PencilLineIcon, FileArchiveIcon, MessageSquareIcon, GraduationCapIcon, SchoolIcon, User2Icon, BrainCircuitIcon, ShieldIcon, ShieldAlertIcon, MegaphoneIcon } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/contexts/authContext";
import { useUpdate } from "@/contexts/updateContext";
import FileMenu from "../fileMenu";
import confetti from "canvas-confetti";

export const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { hasRole } = useAuth();
    const { nudgeVisible, handleUpdate } = useUpdate();

    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 1024 && isOpen) {
            toggleSidebar();
        }
    };

    const handleLecturerClick = () => {
        const hasSeenCelebration = localStorage.getItem('hasSeenLecturerFeature');

        if (!hasSeenCelebration) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#f59e0b', '#10b981']
            });
            localStorage.setItem('hasSeenLecturerFeature', 'true');
        }

        handleNavigation('/lecturers');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div 
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200" 
                />
            )}

            {/* Sidebar / Mobile Drawer Panel */}
            <aside 
                className={`fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-card dark:bg-slate-900 border-r border-border/80 p-5 flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 lg:fixed lg:top-14 lg:left-0 lg:bottom-0 lg:z-30 lg:w-72 shadow-xl lg:shadow-none overflow-y-auto scrollbar-thin`}
            >
                {/* Header close button for mobile */}
                <div className="flex items-center justify-between pb-4 border-b border-border/60 lg:hidden">
                    <div className="flex items-center gap-2">
                        <GraduationCapIcon className="h-6 w-6 text-green-600" />
                        <span className="font-bold text-lg text-foreground">Navigation</span>
                    </div>
                    <button 
                        onClick={toggleSidebar}
                        type="button"
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <CircleXIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* ClassRep and Student Menu */}
                {hasRole(['classRep', 'student']) && (
                    <div id="sidebar-nav" className="flex flex-col flex-1 gap-6 pt-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-green-600 mb-2">Main Navigation</p>
                            <Button 
                                variant={isActive('/home') ? "secondary" : "ghost"}
                                className={`w-full justify-start gap-3 font-bold text-sm h-11 rounded-xl transition-all ${
                                    isActive('/home') 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-extrabold' 
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`} 
                                onClick={() => handleNavigation('/home')}
                            >
                                <LayoutDashboardIcon className="h-5 w-5 text-green-600" /> 
                                My Dashboard
                            </Button>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">Academics</p>
                            <div className="flex flex-col gap-1.5">
                                <Button 
                                    variant={isActive('/schedule') ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl transition-all ${
                                        isActive('/schedule') 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' 
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`} 
                                    onClick={() => handleNavigation('/schedule')}
                                >
                                    <CalendarDaysIcon className="h-4 w-4 text-blue-500" /> 
                                    TimeTable
                                </Button>

                                <Button 
                                    variant={isActive('/assignment/assignments') ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl transition-all ${
                                        isActive('/assignment/assignments') 
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' 
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`} 
                                    onClick={() => handleNavigation('/assignment/assignments')}
                                >
                                    <NotebookPenIcon className="h-4 w-4 text-indigo-500" /> 
                                    Assignments
                                </Button>

                                <Button 
                                    variant={isActive('/CAT') ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl transition-all ${
                                        isActive('/CAT') 
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold' 
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`} 
                                    onClick={() => handleNavigation('/CAT')}
                                >
                                    <PencilLineIcon className="h-4 w-4 text-purple-500" /> 
                                    CAT(s)
                                </Button>

                                <FileMenu isOpen={isOpen} toggleSidebar={toggleSidebar} />

                                <Button 
                                    variant={isActive('/lecturers') ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl transition-all ${
                                        isActive('/lecturers') 
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold' 
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`} 
                                    onClick={handleLecturerClick}
                                >
                                    <User2Icon className="h-4 w-4 text-emerald-500" />
                                    Lecturers Directory
                                </Button>

                                <div className="relative inline-block opacity-60">
                                    <Button 
                                        variant="ghost"
                                        className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl text-muted-foreground cursor-not-allowed" 
                                        disabled
                                    >
                                        <BrainCircuitIcon className="h-4 w-4 text-slate-400" /> 
                                        <span>Exam Timetable</span>
                                        <span className="ml-auto px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase tracking-tighter">
                                            Soon
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {hasRole('classRep') && (
                            <div className="pt-2 border-t border-border/60">
                                <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">Class Rep Management</p>
                                <Button 
                                    variant={isActive('/dashboard') || location.pathname.startsWith('/dashboard') ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 font-bold text-sm h-11 rounded-xl transition-all ${
                                        isActive('/dashboard') || location.pathname.startsWith('/dashboard')
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-black' 
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`} 
                                    onClick={() => handleNavigation('/dashboard')}
                                >
                                    <LayoutDashboardIcon className="h-5 w-5 text-amber-600" /> 
                                    Rep Dashboard
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Admin Menu */}
                {hasRole(['admin']) && (
                    <div className="flex flex-col flex-1 gap-4 pt-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-600 mb-1 flex items-center gap-1">
                            <ShieldIcon size={12} /> Admin Management
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <Button 
                                variant={isActive('/admin/dashboard') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-bold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/dashboard')}
                            >
                                <LayoutDashboardIcon className="h-4 w-4 text-red-500" /> 
                                Admin Dashboard
                            </Button>
                            <Button 
                                variant={isActive('/admin/users') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/users')}
                            >
                                <User2Icon className="h-4 w-4 text-blue-500" /> 
                                Manage Users
                            </Button>
                            <Button 
                                variant={isActive('/admin/course') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/course')}
                            >
                                <GraduationCapIcon className="h-4 w-4 text-green-500" /> 
                                Manage Courses
                            </Button>
                            <Button 
                                variant={isActive('/admin/cohort') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/cohort')}
                            >
                                <SchoolIcon className="h-4 w-4 text-purple-500" /> 
                                Manage Cohorts
                            </Button>
                            <Button 
                                variant={isActive('/admin/files') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/files')}
                            >
                                <FileArchiveIcon className="h-4 w-4 text-amber-500" /> 
                                Manage Files
                            </Button>
                            <Button 
                                variant={isActive('/admin/feedback') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/feedback')}
                            >
                                <MessageSquareIcon className="h-4 w-4 text-pink-500" /> 
                                User Feedback
                            </Button>
                            <Button 
                                variant={isActive('/admin/broadcast') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/broadcast')}
                            >
                                <MegaphoneIcon className="h-4 w-4 text-amber-500" /> 
                                Broadcast Notice
                            </Button>
                            <Button 
                                variant={isActive('/admin/audit') ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl"
                                onClick={() => handleNavigation('/admin/audit')}
                            >
                                <ShieldAlertIcon className="h-4 w-4 text-purple-500" /> 
                                Security Audit
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer status inside sidebar */}
                <div className="mt-auto pt-4 border-t border-border/60 flex flex-col gap-3">
                    {nudgeVisible && (
                        <Button 
                            onClick={handleUpdate} 
                            size="sm" 
                            className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold border border-indigo-200"
                        >
                            Update Ready [Restart]
                        </Button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                CampusHub Active
                            </span>
                        </div>
                        <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                            v{import.meta.env.VITE_APP_VERSION || "0.1.3"} • PWA Ready
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};