import React from "react";
import { useAuth } from "@/contexts/authContext";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, IdCard, 
  GraduationCap, BookOpen, Calendar, BadgeCheck 
} from "lucide-react";
import UpdateDetails from "@/components/updateDetails";
import avator from '@/assets/avator1.webp';

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 transition-all hover:shadow-md">
    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value || 'N/A'}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Clean data extraction using optional chaining
  const userData = user?.user || user; 
  const cohortYear = userData?.cohort?.year || 'N/A';
  const cohortName = userData?.cohort?.name || 'N/A';
  const courseCode = userData?.course?.code || 'N/A';
  const courseName = userData?.course?.name || 'N/A';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto p-6 space-y-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Account Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your personal information and academic details.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
            
            <div className="px-8 pb-8">
              <div className="relative -mt-12 mb-6 flex items-end gap-6">
                <img 
                  src={avator} 
                  alt="Avatar" 
                  className="h-28 w-28 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg object-cover bg-white"
                />
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userData?.name}</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 capitalize">
                    <BadgeCheck size={12} className="mr-1" /> {userData?.role || 'Active Account'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                    <User size={16} /> PERSONAL DETAILS
                  </h3>
                  <div className="space-y-3">
                    {userData?.role !== 'admin' && (
                      <InfoTile icon={IdCard} label="Student ID" value={userData?.studentId} />
                    )}
                    <InfoTile icon={Mail} label="Email Address" value={userData?.email} />
                    <InfoTile icon={Phone} label="Phone Number" value={userData?.phoneNumber} />
                  </div>
                </section>

                {userData?.role !== 'admin' && (
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                      <GraduationCap size={16} /> STUDY DETAILS
                    </h3>
                    <div className="space-y-3">
                      <InfoTile icon={BookOpen} label="Course" value={`${courseCode} - ${courseName}`} />
                      <InfoTile icon={Calendar} label="Cohort" value={`${cohortName} (${cohortYear})`} />
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Update Form Side */}
        <div className="lg:col-span-1">
          <UpdateDetails />
        </div>
      </div>
    </motion.div>
  );
}