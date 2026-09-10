// Imports
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import {
  HomeIcon,
  CalendarDaysIcon,
  NotebookPenIcon,
  PencilLineIcon,
  MenuIcon,
  User2Icon,
  GraduationCapIcon,
  SchoolIcon
} from "lucide-react";

export default function BottomNav({ toggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  // Admin Tabs
  const adminTabs = [
    {
      label: "Users",
      to: "/admin/users",
      icon: User2Icon,
      isCenter: false
    },
    {
      label: "Courses",
      to: "/admin/course",
      icon: GraduationCapIcon,
      isCenter: false
    },
    {
      label: "Home",
      to: "/admin/dashboard",
      icon: HomeIcon,
      isCenter: true
    },
    {
      label: "Cohorts",
      to: "/admin/cohort",
      icon: SchoolIcon,
      isCenter: false
    },
    {
      label: "More",
      isMoreButton: true,
      icon: MenuIcon,
      isCenter: false
    }
  ];

  // Student / ClassRep Tabs
  const studentTabs = [
    {
      label: "Timetable",
      to: "/schedule",
      icon: CalendarDaysIcon,
      isCenter: false
    },
    {
      label: "Tasks",
      to: "/assignment/assignments",
      icon: NotebookPenIcon,
      isCenter: false
    },
    {
      label: "Home",
      to: "/home",
      icon: HomeIcon,
      isCenter: true
    },
    {
      label: "CATs",
      to: "/CAT",
      icon: PencilLineIcon,
      isCenter: false
    },
    {
      label: "More",
      isMoreButton: true,
      icon: MenuIcon,
      isCenter: false
    }
  ];

  const tabs = isAdmin ? adminTabs : studentTabs;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-t border-border/80 pb-safe shadow-2xl transition-all">
      <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          if (tab.isMoreButton) {
            return (
              <button
                key="more-tab"
                id="bottom-nav-more"
                onClick={toggleSidebar}
                type="button"
                className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
                aria-label="Open navigation menu"
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold tracking-tight mt-0.5">
                  More
                </span>
              </button>
            );
          }

          if (tab.isCenter) {
            return (
              <NavLink
                key={tab.to}
                id="bottom-nav-home"
                to={tab.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center -mt-4 transition-transform active:scale-90 ${
                    isActive ? "scale-105" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                        isActive
                          ? isAdmin
                            ? "bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-600/40 ring-4 ring-background"
                            : "bg-gradient-to-tr from-green-600 to-emerald-500 text-white shadow-green-600/40 ring-4 ring-background"
                          : "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 shadow-slate-900/20"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className={`text-[10px] font-black tracking-tight mt-1 ${
                        isActive
                          ? isAdmin
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      Home
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          const tabId = tab.label === "Timetable" ? "bottom-nav-schedule" : tab.label === "Tasks" ? "bottom-nav-tasks" : undefined;

          return (
            <NavLink
              key={tab.to}
              id={tabId}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full transition-colors active:scale-95 ${
                  isActive
                    ? isAdmin
                      ? "text-purple-600 dark:text-purple-400 font-bold"
                      : "text-green-600 dark:text-green-400 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
