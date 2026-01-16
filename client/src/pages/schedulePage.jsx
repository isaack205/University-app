import React, { useEffect, useState } from "react";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/authContext";
import { 
  InfoIcon, CalendarDaysIcon, LoaderIcon, 
  BookOpenIcon, ClockIcon, MapPinIcon, UserIcon, 
  LayoutIcon 
} from "lucide-react";

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const timeBlocks = [
    { start: "07:00", end: "10:00" },
    { start: "10:00", end: "13:00" },
    { start: "13:00", end: "16:00" },
    { start: "16:00", end: "19:00" }
  ];
  
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDaysIcon className="text-blue-600" size={24} />
            Academic Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-tight">
            {user?.course?.name || user?.user?.course?.name} • {user?.cohort?.name || user?.user?.cohort?.name}
          </p>
        </div>
      </div>

      {/* Responsive Scrollable Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
            {days.map((day) => (
              <div key={day} className="grid grid-cols-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                
                {/* Day Label */}
                <div className="p-3 md:p-5 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center bg-slate-50/30 dark:bg-slate-800/30">
                  <h3 className="font-black text-slate-600 dark:text-slate-400 uppercase text-[10px] md:text-xs tracking-widest leading-none">
                    {day}
                  </h3>
                </div>

                {/* Units within Slots */}
                {timeBlocks.map(({ start }) => {
                  const classes = getClassesForSlot(day, start);

                  return (
                    <div key={start + day} className="p-1.5 md:p-3 min-h-[90px] md:min-h-[120px] border-r border-slate-100 dark:border-slate-800 last:border-r-0 flex flex-col gap-2 justify-center">
                      {classes.length > 0 ? (
                        classes.map((cls, idx) => (
                          <div 
                            key={idx} 
                            className="w-full p-2 md:p-3 rounded-lg md:rounded-xl bg-blue-600 text-white shadow-sm flex flex-col justify-center"
                          >
                            <span className="text-[8px] md:text-[9px] font-black opacity-80 uppercase tracking-tighter">{cls.unitCode}</span>
                            <p className="text-[10px] md:text-xs font-bold leading-tight line-clamp-2">{cls.unitName}</p>
                            <div className="mt-1.5 flex items-center gap-1 text-[8px] md:text-[9px] font-bold bg-white/20 w-fit px-1.5 py-0.5 rounded">
                              <MapPinIcon size={10} />
                              {cls.venue}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full w-full rounded-xl border border-dashed border-slate-100 dark:border-slate-800/50" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Appeals Section: Unit Detail Cards */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-1">
          <InfoIcon className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Course Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <div 
              key={schedule._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all group"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpenIcon size={20} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{schedule.unitCode}</span>
              </div>

              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug mb-4">
                {schedule.unitName}
              </h3>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium"><UserIcon size={14}/> Lecturer</span>
                  <span className="text-slate-900 dark:text-white font-bold tracking-tight">Mr/Mrs. {schedule.lecturer}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium"><MapPinIcon size={14}/> Venue</span>
                  <span className="text-slate-900 dark:text-white font-bold">{schedule.venue}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-blue-600 flex items-center gap-1.5 font-bold"><ClockIcon size={14}/> Time Slot</span>
                  <span className="text-blue-600 font-bold">{schedule.dayOfWeek} • {schedule.startTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}