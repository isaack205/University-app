// Imports
import React from "react";
import { NavLink, Outlet } from 'react-router-dom';
import { Separator } from "@/components/ui/separator";
import {
    CalendarClockIcon,
    ClipboardListIcon,
    NotebookPenIcon,
    FolderIcon,
    UsersIcon,
} from "lucide-react";

const manageLinks = [
    { to: '/dashboard/schedule', label: 'Units', icon: CalendarClockIcon },
    { to: '/dashboard/assignment', label: 'Assignments', icon: ClipboardListIcon },
    { to: '/dashboard/CAT', label: 'CAT(s)', icon: NotebookPenIcon },
    { to: '/dashboard/file', label: 'Files', icon: FolderIcon },
    { to: '/dashboard/lecturers', label: 'Lecturers', icon: UsersIcon },
];

export default function Dashboard() {

    return(
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Class Rep Tools</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Class Rep Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 mb-5">Post assignments, update unit schedules, and manage your class in one place. 🎓</p>

            <nav className="overflow-x-auto">
                <ul className="bg-muted text-muted-foreground inline-flex w-fit items-center gap-1 rounded-lg p-1">
                    {manageLinks.map(({ to, label, icon: Icon }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                className={({ isActive }) =>
                                    `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                                        isActive
                                            ? 'bg-background text-green-700 dark:text-green-400 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`
                                }
                            >
                                <Icon className="size-4" />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <Separator className="my-5"/>

            <Outlet />
        </div>
    )
}
