import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { upcomingsService } from "@/services/upcomingSchedulerApi";
import { 
  CalendarDays, GraduationCap, BookOpen, Clock, 
  MapPin, PencilLine, FileText, ChevronRight, 
  AlertCircle, LayoutDashboard, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";

// Assets
import personWithLaptop from '@/assets/download.png';
import classImage from '../assets/class 2.jpg';

// UI Components
import ColourfulText from "../components/ui/colourful-text";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { fileUploadService } from "@/services/fileUploadApi";
import Onboarding from "@/components/Onboarding";

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

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [upcomings, setUpcomings] = useState([]);
  const [units, setUnits] = useState([]);
  const [generalFiles, setGeneralFiles] = useState([]);
  const [cohortFiles, setCohortFiles] = useState([]);
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
    if (!authLoading && user) {
      const seen = localStorage.getItem("isOnboarded");
      if (!seen) setShowOnboarding(true);
    }
  }, [user, authLoading]);

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

      {/* Hero Section with Integrated Person Image */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl min-h-[20px] flex items-center">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{ backgroundImage: `url(${classImage})` }}
        />
        
        <div className="relative z-10 w-full p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Text Content */}
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, <br />
              <ColourfulText text={user?.name || user?.user?.name || 'Scholar'} />
            </h2>
            <div className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-md mx-auto md:mx-0">
              <TextGenerateEffect words={words} />
            </div>
          </div>

          {/* Revamped Person Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Soft Glow behind the person */}
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
            
            <motion.img 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={personWithLaptop} 
              alt="Student working" 
              className="relative w-48 sm:w-40 md:w-50 lg:w-[250px] h-auto drop-shadow-2xl object-contain"
            />
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
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
          subtext="Next 7 days"
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Upcoming CATs" 
          value={upcomings?.upcomingCats?.length || '0'} 
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

      {/* Rest of the Dashboard Split Content... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments Column */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2 px-2">
            <CalendarDays className="text-blue-500" size={20} /> Deadlines
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {upcomings?.upcomingAssignments?.length > 0 ? (
              upcomings.upcomingAssignments.map((task) => (
                <div key={task._id} className="group p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white line-clamp-1">{task.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/40">URGENT</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{task.unit.unitName}</p>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Clock size={14} />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 text-sm">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Classes Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> Next 24 Hours
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/schedule')} className="text-blue-600">
              Full Timetable <ChevronRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomings?.upcomingClasses?.length > 0 ? (
              upcomings.upcomingClasses.map((item) => (
                <div key={item._id} className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{item.unitName}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <Clock size={16} className="text-blue-500" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin size={16} className="text-rose-500" />
                        <span>{item.venue || 'TBA'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <User size={16} className="text-emerald-500" />
                        <span>Lec: {item.lecturer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500">No classes in the next 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Onboarding open={showOnboarding} onFinish={() => setShowOnboarding(false)} />
    </motion.div>
  );
}