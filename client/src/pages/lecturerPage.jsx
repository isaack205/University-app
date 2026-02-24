// // Imports
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { lecturerService } from "@/services/lecturerApi";
import { toast } from "sonner";
import { 
  LoaderIcon, 
  Phone, 
  Mail, 
  User2, 
  GraduationCap, 
  Search,
  Users2,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function LecturerPage() {
  const [lecturers, setLecturers] = useState({ currentSemester: [], pastSemester: [] });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const fetchLecturers = async () => {
    setLoading(true);
    try {
      const fetchedData = await lecturerService.getLecturersByCohort(user?.cohort?._id);
      setLecturers(fetchedData);
    } catch (error) {
      toast.error("Failed to load faculty directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLecturers(); }, []);

  // Filter logic for search
  const filterList = (list) => 
    list?.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()));

 const LecturerCard = ({ lecturer, type }) => {
  // Add this state inside the card to track if data is hidden
  const [isRevealed, setIsRevealed] = React.useState(false);

  // Helper functions to hide digits
  const maskPhone = (phone) => phone ? phone.slice(0, 8) + " *** ***" : "N/A";
  const maskEmail = (email) => {
    if (!email) return "N/A";
    const [user, domain] = email.split("@");
    return user.charAt(0) + "****" + "@" + domain;
  };

  const handleReveal = (e) => {
    if (!isRevealed) {
      e.preventDefault(); // Prevents the phone/email app from opening on first click
      setIsRevealed(true);
      toast.info("Contact revealed. Use responsibly.", { icon: "🔒" });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <Card className="overflow-hidden border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
        <CardContent className="p-0">
          <div className={`h-2 w-full ${type === 'current' ? 'bg-blue-500' : 'bg-slate-400'}`} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-2xl">
                <User2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">
                {type === 'current' ? 'Active' : 'Previous'}
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {lecturer.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Chuka University Faculty
            </p>

            <div className="space-y-2">
              {/* Phone Link */}
              <a 
                href={isRevealed ? `tel:${lecturer.phoneNumber}` : "#"} 
                onClick={handleReveal}
                className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                  isRevealed ? "bg-blue-50 dark:bg-blue-900/20" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Phone className={`w-4 h-4 ${isRevealed ? "text-blue-500" : "text-slate-500"}`} />
                  <span className={`text-sm font-medium ${!isRevealed && "blur-[1.5px]"}`}>
                    {isRevealed ? lecturer.phoneNumber : maskPhone(lecturer.phoneNumber)}
                  </span>
                </div>
                {!isRevealed && <span className="text-[10px] font-bold text-blue-500">SHOW</span>}
              </a>

              {/* Email Link */}
              <a 
                href={isRevealed ? `mailto:${lecturer.email}` : "#"} 
                onClick={handleReveal}
                className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                  isRevealed ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Mail className={`w-4 h-4 ${isRevealed ? "text-emerald-500" : "text-slate-500"}`} />
                  <span className={`text-sm font-medium truncate ${!isRevealed && "blur-[1.5px]"}`}>
                    {isRevealed ? lecturer.email : maskEmail(lecturer.email)}
                  </span>
                </div>
                {!isRevealed && <span className="text-[10px] font-bold text-emerald-500">SHOW</span>}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Directory
          </h1>
          <p className="text-slate-500 text-sm">Manage and contact your course instructors</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search lecturers..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-8">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl inline-flex">
          <TabsTrigger value="current" className="rounded-xl px-6 py-2.5 flex gap-2">
            <Users2 className="w-4 h-4" /> Current
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-xl px-6 py-2.5 flex gap-2">
            <History className="w-4 h-4" /> History
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Syncing with database...</p>
          </div>
        ) : (
          <>
            <TabsContent value="current">
              {filterList(lecturers.currentSemester)?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {filterList(lecturers.currentSemester)?.map((l) => (
                      <LecturerCard key={l._id} lecturer={l} type="current" />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                  <Users2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
                    {searchTerm ? "No lecturers match your search" : "No active lecturers at the moment"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {filterList(lecturers.pastSemester)?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-80">
                  <AnimatePresence>
                    {filterList(lecturers.pastSemester)?.map((l) => (
                      <LecturerCard key={l._id} lecturer={l} type="past" />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                  <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
                    {searchTerm ? "No lecturers match your search" : "No previous semester lecturers"}
                  </p>
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}