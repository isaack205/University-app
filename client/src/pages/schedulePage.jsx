// Imports
import React, { useEffect, useRef, useState } from "react";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import dayjs from "dayjs";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authContext";
import {
  InfoIcon, CalendarDaysIcon, LoaderIcon,
  BookOpenIcon, ClockIcon, MapPinIcon, UserIcon,
  GraduationCapIcon, DownloadIcon, SparklesIcon
} from "lucide-react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const timetableRef = useRef(null);

  const timeBlocks = [
    { start: "07:00", end: "10:00" },
    { start: "10:00", end: "13:00" },
    { start: "13:00", end: "16:00" },
    { start: "16:00", end: "19:00" }
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const today = dayjs().format("dddd");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const schedulesData = await unitScheduleService.getMyShedule();
        setSchedules(schedulesData);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  // Optimized logic to find multiple classes for a specific slot
  const getClassesForSlot = (day, blockStart) => {
    return schedules.filter(item => {
      if (item.dayOfWeek !== day) return false;

      const itemStart = dayjs(`2025-01-01T${item.startTime}`);
      const itemEnd = dayjs(`2025-01-01T${item.endTime}`);
      const blockStartDayjs = dayjs(`2025-01-01T${blockStart}`);

      // Returns true if class starts at this block OR is currently happening during this block
      return item.startTime === blockStart || (itemStart.isBefore(blockStartDayjs) && itemEnd.isAfter(blockStartDayjs));
    });
  };

  // Captures only the timetable grid (not the course detail cards) as a PNG
  const handleDownload = async () => {
    if (!timetableRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(timetableRef.current, { scale: 2, useCORS: true });
      const link = document.createElement("a");
      link.download = `campushub-timetable-${dayjs().format("YYYY-MM-DD")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("📥 Timetable downloaded!");
    } catch (error) {
      console.error("Failed to download timetable:", error);
      toast.error("Couldn't download the timetable, please try again");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <LoaderIcon className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-slate-500 font-medium">Loading Timetable...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20 bg-white dark:bg-slate-950">

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 md:p-8 shadow-lg shadow-blue-900/10">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <div className="flex items-center gap-1.5 text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">
              <GraduationCapIcon size={14} />
              Weekly Class Schedule
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <CalendarDaysIcon size={26} />
              Academic Timetable
            </h1>
            <p className="text-xs text-blue-100 mt-2 font-bold tracking-tight">
              {user?.course?.name || user?.user?.course?.name} • {user?.cohort?.name || user?.user?.cohort?.name}
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || schedules.length === 0}
            className="flex items-center gap-2 bg-white text-blue-700 font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <LoaderIcon size={16} className="animate-spin" />
            ) : (
              <DownloadIcon size={16} />
            )}
            {downloading ? "Preparing..." : "Download Timetable"}
          </button>
        </div>
      </div>

      {/* Downloadable Timetable Area */}
      <div
        ref={timetableRef}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      >
        {/* Mini header included in the exported image for context */}
        <div className="flex items-center justify-between gap-3 p-4 md:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <SparklesIcon size={16} className="text-blue-600" />
            <div>
              <h2 className="text-xs md:text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{user?.cohort?.name} Timetable</h2>
              <p className="text-[10px] text-slate-500 font-bold mt-1">
                {user?.course?.name || user?.user?.course?.name} • {user?.cohort?.name || user?.user?.cohort?.name}
              </p>
            </div>
          </div>
          <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">
            Generated {dayjs().format("DD MMM YYYY")}
          </span>
        </div>

        {/* Responsive Scrollable Table Container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          {/* We set a min-width so it scrolls on small screens instead of squashing */}
          <div className="min-w-[400px] lg:min-w-full">

            {/* Table Header: Time Blocks */}
            <div className="grid grid-cols-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <div className="p-3 md:p-5 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Day / Time</span>
              </div>
              {timeBlocks.map(({ start, end }) => (
                <div key={start} className="p-3 md:p-5 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white leading-none">
                    {dayjs(`2025-01-01T${start}`).format("h:mm A")}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1">
                    TO {dayjs(`2025-01-01T${end}`).format("h:mm A")}
                  </p>
                </div>
              ))}
            </div>

            {/* Table Body: Day Rows */}
            {days.map((day) => {
              const isToday = day === today;
              return (
                <div
                  key={day}
                  className={`grid grid-cols-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors ${
                    isToday ? "bg-blue-50/60 dark:bg-blue-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                  }`}
                >

                  {/* Day Label */}
                  <div className={`p-3 md:p-5 border-r flex flex-col items-center justify-center gap-1 ${
                    isToday
                      ? "border-l-2 border-l-blue-600 border-r-slate-200 dark:border-r-slate-800 bg-blue-50 dark:bg-blue-900/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30"
                  }`}>
                    <h3 className={`font-black uppercase text-[10px] md:text-xs tracking-widest leading-none ${
                      isToday ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                    }`}>
                      {day}
                    </h3>
                    {isToday && (
                      <span className="text-[7px] md:text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Units within Slots */}
                  {timeBlocks.map(({ start }) => {
                    const classes = getClassesForSlot(day, start);

                    return (
                      <div key={start + day} className="p-1.5 md:p-3 min-h-[100px] md:min-h-[140px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex flex-col gap-2">
                        {classes.length > 0 ? (
                          classes.map((cls, idx) => (
                            <div
                              key={idx}
                              className="relative flex-1 w-full min-h-[70px] p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-900/20 flex flex-col gap-1.5 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all"
                            >
                              <div className="absolute -top-5 -right-5 h-16 w-16 rounded-full bg-white/10 blur-md pointer-events-none" />

                              <div className="relative flex items-start justify-between gap-1">
                                <span className="text-[8px] md:text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  {cls.unitName}
                                </span>
                                <BookOpenIcon size={12} className="opacity-60 shrink-0" />
                              </div>

                              <p className="relative text-[10px] md:text-xs lg:text-[40px] font-bold leading-tight line-clamp-2">
                                  {cls.unitCode}
                              </p>

                              <div className="relative mt-auto pt-1.5 border-t border-white/15 flex flex-col gap-1">
                                <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-bold text-blue-100">
                                  <MapPinIcon size={10} className="shrink-0" />
                                  <span className="truncate">{cls.venue}</span>
                                </div>
                                {cls.lecturer?.name && (
                                  <div className="flex items-center gap-1 text-[8px] md:text-[9px] font-semibold text-blue-100/80">
                                    <UserIcon size={10} className="shrink-0" />
                                    <span className="truncate">{cls.lecturer.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 w-full rounded-xl border border-dashed border-slate-100 dark:border-slate-800/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Details: Unit Detail Cards */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
          <InfoIcon className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Course Details</h2>
        </div>

        {schedules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-800 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />

                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl text-blue-600 group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all">
                    <BookOpenIcon size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-widest">
                    {schedule.unitCode}
                  </span>
                </div>

                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug mb-4 min-h-[2.5rem] line-clamp-2">
                  {schedule.unitName}
                </h3>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium"><UserIcon size={14}/> Lecturer</span>
                    <span className="text-slate-900 dark:text-white font-bold tracking-tight truncate max-w-[55%] text-right">{schedule.lecturer?.name || "TBA"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium"><MapPinIcon size={14}/> Venue</span>
                    <span className="text-slate-900 dark:text-white font-bold">{schedule.venue}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 w-fit px-2.5 py-1.5 rounded-lg">
                  <ClockIcon size={12} />
                  {schedule.dayOfWeek} • {dayjs(`2025-01-01T${schedule.startTime}`).format("h:mm A")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <GraduationCapIcon className="text-slate-300 dark:text-slate-700" size={36} />
            <p className="text-sm font-bold text-slate-500">No classes scheduled yet 📭</p>
            <p className="text-xs text-slate-400 max-w-xs">Once your class rep sets up the unit schedule, it'll show up here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
