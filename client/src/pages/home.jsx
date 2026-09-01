import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { upcomingsService } from "@/services/upcomingSchedulerApi";
import { notificationService } from "@/services/notificationService";
import dayjs from "dayjs";
import {
  CalendarDays, GraduationCap, BookOpen, Clock,
  PencilLine, FileText, ChevronRight,
  AlertCircle, LayoutDashboard, User, BellIcon, ZapIcon, FlameIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";

// Assets
import personWithLaptop from '@/assets/download.png';
import classImage from '../assets/class 2.jpg';

// UI Components
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { fileUploadService } from "@/services/fileUploadApi";
import Onboarding from "@/components/Onboarding";

// Helpers
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getUrgency(date) {
  if (!date) return { label: 'TBA', badge: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
  const hoursLeft = dayjs(date).diff(dayjs(), 'hour', true);
  if (hoursLeft < 0) return { label: 'Closed', badge: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' };
  if (hoursLeft < 24) return { label: 'Due Soon', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (hoursLeft < 72) return { label: 'Upcoming', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
  return { label: 'Open', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
}

function timeLeftLabel(date) {
  if (!date) return '';
  const target = dayjs(date);
  const diffMins = target.diff(dayjs(), 'minute');
  if (diffMins < 0) return 'Overdue';
  if (diffMins < 60) return `${diffMins}m left`;
  const diffHours = target.diff(dayjs(), 'hour');
  if (diffHours < 24) return `${diffHours}h left`;
  return `${target.diff(dayjs(), 'day')}d left`;
}

function isClassNow(item) {
  const now = dayjs();
  const start = dayjs(`${now.format('YYYY-MM-DD')}T${item.startTime}`);
  const end = dayjs(`${now.format('YYYY-MM-DD')}T${item.endTime}`);
  return now.isAfter(start) && now.isBefore(end);
}

function findNextEvent(todaysClasses, assignments, cats) {
  const now = dayjs();
  const candidates = [];

  (todaysClasses || []).forEach((c) => {
    const start = dayjs(`${now.format('YYYY-MM-DD')}T${c.startTime}`);
    if (start.isAfter(now)) {
      candidates.push({ type: 'class', title: c.unitName, date: start });
    }
  });

  (assignments || []).forEach((a) => {
    candidates.push({ type: 'assignment', title: a.title, date: dayjs(a.dueDate) });
  });

  (cats || []).forEach((c) => {
    candidates.push({ type: 'cat', title: c.title, date: dayjs(c.nextDate) });
  });

  candidates.sort((a, b) => a.date - b.date);
  return candidates[0] || null;
}

function buildTickerMessages({ upcomingAssignments, upcomingCats, unreadCount, nextClass }) {
  const messages = [];

  if (upcomingAssignments?.length > 0) {
    messages.push({ icon: FlameIcon, color: 'text-orange-500', text: `${upcomingAssignments.length} assignment${upcomingAssignments.length > 1 ? 's' : ''} due this week` });
  }
  if (upcomingCats?.length > 0) {
    const next = upcomingCats[0];
    messages.push({ icon: AlertCircle, color: 'text-rose-500', text: `Next CAT: ${next.title} · ${timeLeftLabel(next.nextDate)}` });
  }
  if (unreadCount > 0) {
    messages.push({ icon: BellIcon, color: 'text-blue-500', text: `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` });
  }
  if (nextClass) {
    messages.push({ icon: Clock, color: 'text-emerald-500', text: `Next class: ${nextClass.unitName} at ${nextClass.startTime}` });
  }
  if (messages.length === 0) {
    messages.push({ icon: ZapIcon, color: 'text-blue-500', text: "You're all caught up! ✅" });
  }
  return messages;
}

const AlertTicker = ({ messages }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [messages.length]);

  const current = messages[index] || messages[0];
  const Icon = current.icon;

  return (
    <div className="relative overflow-hidden rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm h-10 flex items-center justify-center gap-3 px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-xs md:text-sm font-semibold"
        >
          <Icon size={14} className={`${current.color} shrink-0`} />
          <span>{current.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subtext, onClick, colorClass }) => (
  <motion.div
    whileHover={{ y: -4 }}
    onClick={onClick}
    className={`p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-3 transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`p-2 w-fit rounded-lg ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-tight">{label}</p>
      {subtext && <p className="text-xs italic text-slate-400 mt-1">{subtext}</p>}
    </div>
  </motion.div>
);

const timelineTypeStyles = {
  class: { icon: Clock, dot: 'bg-blue-600' },
  assignment: { icon: PencilLine, dot: 'bg-amber-500' },
  cat: { icon: AlertCircle, dot: 'bg-rose-500' },
};

const TodayTimeline = ({ items, onViewSchedule }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <ZapIcon className="text-blue-500" size={20} /> Today at a Glance
      </h3>
      <Button variant="ghost" size="sm" onClick={onViewSchedule} className="text-blue-600">
        Timetable <ChevronRight size={16} />
      </Button>
    </div>
    {items.length > 0 ? (
      <ol className="ml-2 space-y-6">
        {items.map((item, idx) => {
          const style = timelineTypeStyles[item.type];
          const Icon = style.icon;
          return (
            <li key={idx} className="relative ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-6 pb-1 last:border-transparent">
              <span className={`absolute -left-[9px] -top-0.5 flex items-center justify-center w-4 h-4 rounded-full ${style.dot} ring-4 ring-white dark:ring-slate-800`} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-slate-400 shrink-0" />
                  <p className="font-semibold text-sm text-slate-800 dark:text-white">{item.title}</p>
                  {item.live && (
                    <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full shrink-0">
                      Now
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 shrink-0">{item.time}</span>
              </div>
              {item.subtitle && <p className="text-xs text-slate-400 mt-1 ml-6">{item.subtitle}</p>}
            </li>
          );
        })}
      </ol>
    ) : (
      <div className="text-center py-10">
        <p className="text-slate-400 text-sm">Nothing else today 🎉</p>
      </div>
    )}
  </div>
);

const ThisWeekList = ({ items, onNavigate }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <CalendarDays className="text-blue-500" size={20} /> This Week
      </h3>
      <Button variant="ghost" size="sm" onClick={() => onNavigate('/assignment/assignments')} className="text-blue-600">
        View All <ChevronRight size={16} />
      </Button>
    </div>
    {items.length > 0 ? (
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        {items.map((item) => {
          const urgency = getUrgency(item._date);
          return (
            <div
              key={`${item._type}-${item._id}`}
              onClick={() => onNavigate(item._type === 'assignment' ? '/assignment/assignments' : '/CAT')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{item.title}</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${urgency.badge}`}>{urgency.label}</span>
              </div>
              <p className="text-xs text-slate-500">
                {item._type === 'assignment' ? item.unit?.unitName : `${item.catNumber || ''}`.trim()}
                {' · '}{dayjs(item._date).format('DD MMM')} · {timeLeftLabel(item._date)}
              </p>
            </div>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-10">
        <p className="text-slate-400 text-sm">All caught up!</p>
      </div>
    )}
  </div>
);

const QuickActionsGrid = ({ actions, onNavigate }) => (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
    <h3 className="font-bold text-lg mb-5">Quick Actions</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map(({ label, icon: Icon, path, color }) => (
        <button
          key={path}
          onClick={() => onNavigate(path)}
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={18} />
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [upcomings, setUpcomings] = useState({});
  const [units, setUnits] = useState([]);
  const [generalFiles, setGeneralFiles] = useState([]);
  const [cohortFiles, setCohortFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  const words = 'Track your classes, assignments, and weekly timetable in one centralized workspace.';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcomingData, unitsData, genFiles, cohFiles] = await Promise.all([
          upcomingsService.getUpcomingItems(),
          unitScheduleService.getMyShedule(),
          fileUploadService.getGeneralFiles(),
          fileUploadService.getMyCohortsFiles()
        ]);
        setUpcomings(upcomingData);
        setUnits(unitsData);
        setGeneralFiles(genFiles);
        setCohortFiles(cohFiles);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getMyNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const seen = localStorage.getItem("isOnboarded");
      if (!seen) setShowOnboarding(true);
    }
  }, [user, authLoading]);

  const todayName = dayjs().format('dddd');
  const todaysClasses = units.filter((u) => u.dayOfWeek === todayName);

  const thisWeekItems = [
    ...(upcomings?.upcomingAssignments || []).map((a) => ({ ...a, _type: 'assignment', _date: a.dueDate })),
    ...(upcomings?.upcomingCats || []).map((c) => ({ ...c, _type: 'cat', _date: c.nextDate })),
  ].sort((a, b) => new Date(a._date) - new Date(b._date));

  const todayStr = dayjs().format('YYYY-MM-DD');
  const timelineItems = [
    ...todaysClasses.map((c) => ({
      type: 'class', time: c.startTime, title: c.unitName, subtitle: c.venue || 'TBA', live: isClassNow(c)
    })),
    ...(upcomings?.upcomingAssignments || [])
      .filter((a) => dayjs(a.dueDate).format('YYYY-MM-DD') === todayStr)
      .map((a) => ({ type: 'assignment', time: dayjs(a.dueDate).format('HH:mm'), title: a.title, subtitle: a.unit?.unitName })),
    ...(upcomings?.upcomingCats || [])
      .filter((c) => dayjs(c.nextDate).format('YYYY-MM-DD') === todayStr)
      .map((c) => ({ type: 'cat', time: dayjs(c.nextDate).format('HH:mm'), title: c.title, subtitle: `CAT ${c.catNumber || ''}`.trim() })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const nextEvent = findNextEvent(todaysClasses, upcomings?.upcomingAssignments, upcomings?.upcomingCats);
  const nextAssignment = upcomings?.upcomingAssignments?.[0];
  const nextCat = upcomings?.upcomingCats?.[0];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const nextClass = todaysClasses.find((c) => dayjs(`${dayjs().format('YYYY-MM-DD')}T${c.startTime}`).isAfter(dayjs()));
  const tickerMessages = buildTickerMessages({
    upcomingAssignments: upcomings?.upcomingAssignments,
    upcomingCats: upcomings?.upcomingCats,
    unreadCount,
    nextClass
  });

  const quickActions = [
    { label: 'Schedule', icon: CalendarDays, path: '/schedule', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Assignments', icon: PencilLine, path: '/assignment/assignments', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'CATs', icon: AlertCircle, path: '/CAT', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
    { label: 'Lecturers', icon: GraduationCap, path: '/lecturers', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    { label: 'Resources', icon: FileText, path: '/upload/general', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Notifications', icon: BellIcon, path: '/notifications', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
    { label: 'Profile', icon: User, path: '/profile', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  ];
  if (user?.role === 'classRep') {
    quickActions.push({ label: 'Manage Cohort', icon: LayoutDashboard, path: '/dashboard', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-20"
    >
      <header className="flex justify-between items-center px-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <LayoutDashboard className="text-blue-600" /> Dashboard
        </h1>
      </header>

      <AlertTicker messages={tickerMessages} />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${classImage})` }}
        />

        <div className="relative z-10 w-full p-6 md:p-8 flex flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-3 text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
              {getGreeting()}, <span className="text-blue-400">{user?.name || user?.user?.name || 'Scholar'}</span>
            </h2>
            <p className="hidden sm:block text-slate-300 text-sm leading-relaxed max-w-md">
              {words}
            </p>
            {nextEvent && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full">
                <Clock size={14} className="text-blue-300 shrink-0" />
                <span>
                  {nextEvent.type === 'class' ? 'Next class: ' : nextEvent.type === 'assignment' ? 'Due: ' : 'CAT: '}
                  {nextEvent.title} · {timeLeftLabel(nextEvent.date)}
                </span>
              </div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative hidden md:block shrink-0"
          >
            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full" />
            <motion.img
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={personWithLaptop}
              alt="Student working"
              className="relative w-28 lg:w-36 h-auto drop-shadow-2xl object-contain"
            />
          </motion.div>
        </div>

        <div className="absolute -top-20 -right-20 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Active Units"
          value={units.length || '0'}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={PencilLine}
          label="Due Assignments"
          value={upcomings?.upcomingAssignments?.length || '0'}
          subtext={nextAssignment ? `Next: ${timeLeftLabel(nextAssignment.dueDate)}` : 'All caught up'}
          onClick={() => navigate('/assignment/assignments')}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          icon={AlertCircle}
          label="Upcoming CATs"
          value={upcomings?.upcomingCats?.length || '0'}
          subtext={nextCat ? `Next: ${timeLeftLabel(nextCat.nextDate)}` : 'None scheduled'}
          onClick={() => navigate('/CAT')}
          colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
        />
        <StatCard
          icon={FileText}
          label="Resources"
          value={(generalFiles?.length || 0) + (cohortFiles?.length || 0)}
          subtext={`Gen: ${generalFiles?.length || 0} | Cohort: ${cohortFiles?.length || 0}`}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
      </div>

      {/* Today's Agenda + This Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayTimeline items={timelineItems} onViewSchedule={() => navigate('/schedule')} />
        <ThisWeekList items={thisWeekItems} onNavigate={navigate} />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid actions={quickActions} onNavigate={navigate} />

      <Onboarding open={showOnboarding} onFinish={() => setShowOnboarding(false)} />
    </motion.div>
  );
}
