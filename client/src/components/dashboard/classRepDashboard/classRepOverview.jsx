// Imports
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { assignmentService } from "@/services/assignementApi";
import { catService } from "@/services/catApi";
import { lecturerService } from "@/services/lecturerApi";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  CalendarClockIcon,
  ClipboardListIcon,
  NotebookPenIcon,
  UsersIcon,
  FolderIcon,
  ZapIcon,
  PlusIcon,
  ArrowRightIcon,
  SparklesIcon,
  BookOpenIcon,
  ClockIcon,
  MapPinIcon,
  LoaderIcon,
  GraduationCapIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  Share2Icon,
  CopyIcon,
  QrCodeIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassRepOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [cats, setCats] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const cohortId = user?.cohort?._id || user?.cohort;

        const [schedulesData, overridesData, assignmentsData, catsData, lecturersData] =
          await Promise.allSettled([
            unitScheduleService.getMyShedule(),
            unitScheduleService.getOverrides(),
            assignmentService.getMyCohortsAssignements(),
            catService.getCATsForCohort(),
            cohortId ? lecturerService.getLecturersByCohort(cohortId) : Promise.resolve({ currentSemester: [] })
          ]);

        if (schedulesData.status === "fulfilled") setSchedules(schedulesData.value || []);
        if (overridesData.status === "fulfilled") setOverrides(overridesData.value || []);
        if (assignmentsData.status === "fulfilled") setAssignments(assignmentsData.value || []);
        if (catsData.status === "fulfilled") setCats(catsData.value || []);
        if (lecturersData.status === "fulfilled") {
          const lects = lecturersData.value;
          setLecturers(lects?.currentSemester || lects || []);
        }
      } catch (err) {
        console.error("Error loading dashboard overview data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [user]);

  const todayName = dayjs().format("dddd");
  const todayClasses = schedules.filter((s) => s.dayOfWeek === todayName);
  const activeOverridesCount = overrides.length;

  const dueSoonAssignments = assignments.filter((a) => {
    if (!a.dueDate) return false;
    const diffHours = dayjs(a.dueDate).diff(dayjs(), "hour");
    return diffHours >= 0 && diffHours <= 72;
  });

  const upcomingCats = cats.filter((c) => {
    if (!c.date) return false;
    return dayjs(c.date).isAfter(dayjs().subtract(1, "day"));
  });



  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900 p-6 md:p-8 text-white shadow-xl shadow-green-950/10">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-emerald-200 border border-white/10">
                <GraduationCapIcon size={14} /> Class Representative
              </span>
              <span className="text-[11px] font-bold text-emerald-200/80">
                {dayjs().format("dddd, MMMM D, YYYY")}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.firstName || user?.name || "Class Rep"}! 👋
            </h2>

            <p className="text-xs md:text-sm text-emerald-100 max-w-xl font-medium">
              Cohort: <strong className="text-white">{user?.cohort?.name || "Your Group"}</strong> • Course:{" "}
              <strong className="text-white">{user?.course?.name || "Academic Program"}</strong>
            </p>
          </div>

          {/* Banner Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={() => navigate("/dashboard/schedule")}
              className="bg-white/90 text-green-900 hover:bg-white font-bold text-xs shadow-md backdrop-blur-md transition-all active:scale-95"
            >
              <ZapIcon size={14} className="text-amber-600 fill-amber-500" />
              Temp Change
            </Button>
            <Button
              onClick={() => navigate("/dashboard/assignment")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <PlusIcon size={14} />
              Post Assignment
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Units */}
        <div
          onClick={() => navigate("/dashboard/schedule")}
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-800 transition-all duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Units Scheduled</span>
            <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 group-hover:scale-110 transition-transform">
              <CalendarClockIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-foreground">{schedules.length}</span>
            <span className="text-xs text-muted-foreground font-medium">registered</span>
          </div>
          {activeOverridesCount > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md">
              <ZapIcon size={10} /> {activeOverridesCount} Temp {activeOverridesCount === 1 ? "Override" : "Overrides"}
            </div>
          )}
        </div>

        {/* Metric 2: Assignments */}
        <div
          onClick={() => navigate("/dashboard/assignment")}
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assignments</span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:scale-110 transition-transform">
              <ClipboardListIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-foreground">{assignments.length}</span>
            <span className="text-xs text-muted-foreground font-medium">posted</span>
          </div>
          {dueSoonAssignments.length > 0 ? (
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-black bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-md">
              <AlertTriangleIcon size={10} /> {dueSoonAssignments.length} Due Soon
            </div>
          ) : (
            <span className="mt-2 block text-[10px] text-muted-foreground">All current</span>
          )}
        </div>

        {/* Metric 3: CATs */}
        <div
          onClick={() => navigate("/dashboard/CAT")}
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled CATs</span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 group-hover:scale-110 transition-transform">
              <NotebookPenIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-foreground">{cats.length}</span>
            <span className="text-xs text-muted-foreground font-medium">scheduled</span>
          </div>
          <span className="mt-2 block text-[10px] text-muted-foreground">
            {upcomingCats.length} upcoming
          </span>
        </div>

        {/* Metric 4: Lecturers */}
        <div
          onClick={() => navigate("/dashboard/lecturers")}
          className="group cursor-pointer p-4 md:p-5 rounded-2xl bg-card border shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-800 transition-all duration-200 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lecturers</span>
            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 group-hover:scale-110 transition-transform">
              <UsersIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-foreground">{lecturers.length}</span>
            <span className="text-xs text-muted-foreground font-medium">contacts</span>
          </div>
          <span className="mt-2 block text-[10px] text-muted-foreground">Semester faculty</span>
        </div>
      </div>

      {/* Two Column Layout: Today's Classes & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Schedule & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule Preview */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="text-green-600 h-5 w-5" />
                <h3 className="font-bold text-foreground text-base">Today's Class Schedule</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/schedule")}
                className="text-xs font-bold text-green-700 dark:text-green-400 hover:text-green-800"
              >
                Manage Schedule <ArrowRightIcon size={14} className="ml-1" />
              </Button>
            </div>

            {todayClasses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {todayClasses.map((cls) => {
                  const isOverridden = cls._override?.isOverridden;
                  return (
                    <div
                      key={cls._id}
                      className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                        isOverridden
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700"
                          : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                          {cls.unitCode}
                        </span>
                        {isOverridden && (
                          <span className="text-[10px] font-black bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <ZapIcon size={10} /> Temp Change
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{cls.unitName}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <ClockIcon size={12} /> {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPinIcon size={12} /> {cls.venue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed rounded-xl text-muted-foreground flex flex-col items-center justify-center gap-2">
                <BookOpenIcon className="h-8 w-8 opacity-30 text-green-600" />
                <p className="text-xs font-medium">No classes scheduled for today ({dayjs().format("dddd")}).</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/schedule")}
                  className="mt-1 text-xs font-bold"
                >
                  View Full Timetable
                </Button>
              </div>
            )}
          </div>

          {/* Class Rep Quick Tools Navigation Cards */}
          <div className="space-y-3">
            <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-muted-foreground">
              Class Management Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shortcut 1 */}
              <div
                onClick={() => navigate("/dashboard/schedule")}
                className="group p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 group-hover:scale-105 transition-transform">
                    <CalendarClockIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Unit Timetable</h4>
                    <p className="text-xs text-muted-foreground">Register units & set weekly temp overrides</p>
                  </div>
                </div>
                <ArrowRightIcon size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Shortcut 2 */}
              <div
                onClick={() => navigate("/dashboard/assignment")}
                className="group p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 group-hover:scale-105 transition-transform">
                    <ClipboardListIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Assignments</h4>
                    <p className="text-xs text-muted-foreground">Create coursework & track submissions</p>
                  </div>
                </div>
                <ArrowRightIcon size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Shortcut 3 */}
              <div
                onClick={() => navigate("/dashboard/CAT")}
                className="group p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 group-hover:scale-105 transition-transform">
                    <NotebookPenIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">CAT Tests</h4>
                    <p className="text-xs text-muted-foreground">Schedule upcoming assessment tests</p>
                  </div>
                </div>
                <ArrowRightIcon size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Shortcut 4 */}
              <div
                onClick={() => navigate("/dashboard/file")}
                className="group p-4 rounded-xl border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 group-hover:scale-105 transition-transform">
                    <FolderIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Class Resources</h4>
                    <p className="text-xs text-muted-foreground">Upload & manage study files & past papers</p>
                  </div>
                </div>
                <ArrowRightIcon size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Active Overrides Sidebar */}
        <div className="space-y-6">
          {/* Classroom Growth Hub & Referral Widget */}
          <div className="rounded-2xl border bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-900 dark:to-blue-950/40 p-5 shadow-sm space-y-4 border-blue-200 dark:border-blue-900">
            <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800 pb-3">
              <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
                <SparklesIcon size={16} className="text-blue-600" />
                Classroom Growth Hub
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Class Rep
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              Invite your classmates to register so everyone stays updated on CATs & schedule changes.
            </p>

            {/* Link 1: Class Cohort Invite Link */}
            {(() => {
              const courseCode = user?.course?.name?.replace(/\s+/g, "-") || user?.course?.code || user?.course || "";
              const cohortName = user?.cohort?.name?.replace(/\s+/g, "-") || user?.cohort?.year?.toString() || user?.cohort || "";
              const cohortUrl = courseCode && cohortName
                ? `${window.location.origin}/register?course=${encodeURIComponent(courseCode)}&cohort=${encodeURIComponent(cohortName)}`
                : `${window.location.origin}/register`;
              const courseName = user?.course?.name || user?.course?.code || "our class";

              return (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>1. Class Cohort Link (Pre-fills Course)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={cohortUrl}
                      className="w-full text-xs font-mono bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(cohortUrl);
                        toast.success("Cohort Invite Link copied to clipboard! 🚀");
                      }}
                      className="shrink-0 h-9 rounded-xl border-slate-300 dark:border-slate-700"
                    >
                      <CopyIcon size={14} />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs gap-1.5 shadow-md shadow-emerald-600/20"
                    onClick={() => {
                      const message = `Hey class! We are tracking all our ${courseName} CATs, assignments, and timetable updates on CampusHub 🎓\n\nRegister here to join our cohort:\n${cohortUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
                    }}
                  >
                    <Share2Icon size={14} /> Share Cohort Link on WhatsApp
                  </Button>
                </div>
              );
            })()}

            {/* Link 2: General App Link */}
            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                2. General App Link (Standard Registration)
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/register`}
                  className="w-full text-xs font-mono bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/register`);
                    toast.success("General Invite Link copied!");
                  }}
                  className="shrink-0 h-9 rounded-xl border-slate-300 dark:border-slate-700"
                >
                  <CopyIcon size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Overrides Quick Alert */}
          {overrides.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <ZapIcon size={16} className="text-amber-600 fill-amber-500" />
                Active Temp Changes ({overrides.length})
              </div>
              <div className="space-y-2">
                {overrides.map((ov) => (
                  <div key={ov._id} className="text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900">
                    <p className="font-bold text-foreground">{ov.unitSchedule?.unitCode} - {ov.unitSchedule?.unitName}</p>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 space-y-0.5">
                      {ov.venue && <p>📍 Venue: {ov.venue}</p>}
                      {ov.startTime && <p>🕐 Time: {ov.startTime}</p>}
                      {ov.dayOfWeek && <p>📅 Day: {ov.dayOfWeek}</p>}
                      {ov.reason && <p className="italic text-muted-foreground">"{ov.reason}"</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Assignments Widget */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <ClipboardListIcon size={16} className="text-blue-600" />
                Recent Assignments
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/assignment")}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                View all
              </Button>
            </div>

            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.slice(0, 4).map((item) => (
                  <div key={item._id} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.unitCode || "Assignment"}</span>
                    <h5 className="font-bold text-xs text-foreground line-clamp-1">{item.title}</h5>
                    {item.dueDate && (
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        Due: {dayjs(item.dueDate).format("DD MMM, YYYY · h:mm A")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-3 text-center">No assignments posted yet.</p>
            )}
          </div>

          {/* Upcoming CATs Widget */}
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <NotebookPenIcon size={16} className="text-purple-600" />
                Upcoming CATs
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/CAT")}
                className="text-[11px] font-bold text-purple-600 hover:text-purple-700 p-0 h-auto"
              >
                View all
              </Button>
            </div>

            {cats.length > 0 ? (
              <div className="space-y-3">
                {cats.slice(0, 3).map((cat) => (
                  <div key={cat._id} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                      {cat.unitCode} {cat.isPublished ? "• Published" : "• Draft"}
                    </span>
                    <h5 className="font-bold text-xs text-foreground line-clamp-1">{cat.title || cat.unitName}</h5>
                    <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                      📅 {cat.date ? dayjs(cat.date).format("DD MMM YYYY") : "Date TBD"} · {cat.venue || "Venue TBD"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-3 text-center">No CAT tests scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
