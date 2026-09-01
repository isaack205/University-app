// Imports
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { assignmentService } from "@/services/assignementApi";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderIcon,
  InfoIcon,
  CalendarIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  ClockIcon,
  UserIcon,
  HashIcon,
  AlarmClockIcon,
  SearchIcon,
  InboxIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const fetchedData = await assignmentService.getMyCohortsAssignements();
      setAssignments(fetchedData);
    } catch (error) {
      const errorMessage = "Error fetching assignments.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleClick = async (id) => {
    setLoadingAssignment(true);
    setOpen(true);
    setSelectedAssignment(null);
    try {
      const singleAssignmentDetails = await assignmentService.getAssignmentById(id);
      setSelectedAssignment(singleAssignmentDetails);
    } catch (error) {
      const message = "Failed to fetch assignment details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const currentDate = new Date();
  const currentAssignments = assignments.filter((a) => new Date(a.dueDate) >= currentDate);
  const pastAssignments = assignments.filter((a) => new Date(a.dueDate) < currentDate);

  const filterList = (list) =>
    list.filter(
      (a) =>
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.unit?.unitName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredCurrent = filterList(currentAssignments);
  const filteredPast = filterList(pastAssignments);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardCheckIcon className="text-green-600" size={30} />
            My Assignments
          </h1>
          <p className="text-slate-500 text-sm">Track, review, and stay ahead of your deadlines</p>
          {error && <p className="text-red-500 font-medium animate-pulse mt-1">{error}</p>}
        </div>

        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assignments..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Fetching active tasks...</p>
        </div>
      ) : (
        <Tabs defaultValue="current" className="space-y-8">
          <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl inline-flex h-auto">
            <TabsTrigger value="current" className="rounded-xl px-6 py-2.5 flex gap-2">
              <ClockIcon className="w-4 h-4" /> Current
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                {currentAssignments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-6 py-2.5 flex gap-2">
              <CalendarIcon className="w-4 h-4" /> Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {filteredCurrent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredCurrent.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      onClick={() => handleClick(assignment._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState searchTerm={searchTerm} emptyLabel="No current assignments 😊" />
            )}
          </TabsContent>

          <TabsContent value="past">
            {filteredPast.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                <AnimatePresence>
                  {filteredPast.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      onClick={() => handleClick(assignment._id)}
                      past
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState searchTerm={searchTerm} emptyLabel="No history found 📘" />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* FOOTER NOTE */}
      <div className="flex items-center gap-3 justify-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <InfoIcon className="text-blue-500" size={18} />
        <p className="text-slate-500 text-sm font-medium">
          Select a card to view full description, cohort details, and lecturer information.
        </p>
      </div>

      {/* ASSIGNMENT DETAILS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
          {!loadingAssignment && selectedAssignment ? (
            <DialogHeader className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/15 p-2.5 rounded-2xl shrink-0">
                    <BookOpenIcon className="text-white" size={22} />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-white">
                      {selectedAssignment.title || "Assignment Brief"}
                    </DialogTitle>
                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">
                      {selectedAssignment.unit?.unitCode?.toUpperCase()} · {selectedAssignment.unit?.unitName}
                    </p>
                  </div>
                </div>
                <Badge className={`${getUrgency(selectedAssignment.dueDate).badge} shrink-0`}>
                  {getUrgency(selectedAssignment.dueDate).label}
                </Badge>
              </div>
            </DialogHeader>
          ) : (
            <DialogHeader className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 p-6 text-white">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <BookOpenIcon className="text-blue-100" />
                Assignment Brief
              </DialogTitle>
            </DialogHeader>
          )}

          <div className="p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {loadingAssignment ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 gap-3"
                >
                  <LoaderIcon className="animate-spin h-10 w-10 text-blue-500" />
                  <p className="text-blue-500 font-bold animate-pulse uppercase text-xs tracking-widest">Loading Details...</p>
                </motion.div>
              ) : !selectedAssignment ? (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 text-red-500 font-bold"
                >
                  Could not retrieve assignment details.
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center py-2">
                    <DueDateRing createdAt={selectedAssignment.createdAt} dueDate={selectedAssignment.dueDate} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailItem label="Unit Name" value={selectedAssignment.unit.unitName} icon={<BookOpenIcon size={16}/>} color="text-blue-600" />
                    <DetailItem label="Unit Code" value={selectedAssignment.unit.unitCode.toUpperCase()} icon={<HashIcon size={16}/>} color="text-indigo-600" />
                    <DetailItem label="Lecturer" value={`${selectedAssignment.unit.lecturer.name}`} icon={<UserIcon size={16}/>} color="text-emerald-600" />
                    <DetailItem label="Lecturer email" value={`${selectedAssignment.unit.lecturer.email}`} icon={<UserIcon size={16}/>} color="text-emerald-600" />
                    <DetailItem label="Cohort" value={selectedAssignment.cohort.name} icon={<UserIcon size={16}/>} color="text-amber-600" />
                    <DetailItem
                      label="Due Date"
                      value={new Date(selectedAssignment.dueDate).toLocaleString()}
                      icon={<CalendarIcon size={16}/>}
                      color="text-red-500"
                      className="md:col-span-2"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Full Description</p>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                      {selectedAssignment.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                        Issued: {new Date(selectedAssignment.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                        Status: {selectedAssignment.statusByStudent}
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                      Updated: {new Date(selectedAssignment.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Urgency accent based on time left until due
function getUrgency(dueDate) {
  const hoursLeft = (new Date(dueDate) - new Date()) / (1000 * 60 * 60);
  if (hoursLeft < 0) {
    return { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-500", ring: "#94a3b8", label: "Closed" };
  }
  if (hoursLeft < 24) {
    return { bar: "bg-red-500", badge: "bg-red-100 text-red-700", ring: "#ef4444", label: "Due Soon" };
  }
  if (hoursLeft < 72) {
    return { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700", ring: "#f59e0b", label: "Upcoming" };
  }
  return { bar: "bg-green-500", badge: "bg-green-100 text-green-700", ring: "#22c55e", label: "Open" };
}

// Short "time left" string shared by the card and the modal
function timeLeftLabel(dueDate) {
  const msLeft = new Date(dueDate) - new Date();
  if (msLeft <= 0) return "Overdue";

  const hoursLeft = msLeft / (1000 * 60 * 60);
  if (hoursLeft < 24) return `${Math.max(1, Math.round(hoursLeft))}h left`;

  const daysLeft = Math.round(hoursLeft / 24);
  return `${daysLeft}d left`;
}

function EmptyState({ searchTerm, emptyLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
      <InboxIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
      <p className="text-slate-500 dark:text-slate-400 font-medium text-center">
        {searchTerm ? "No assignments match your search" : emptyLabel}
      </p>
    </div>
  );
}

function AssignmentCard({ assignment, onClick, past = false }) {
  const urgency = getUrgency(assignment.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <Card
        onClick={onClick}
        className="cursor-pointer overflow-hidden border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-lg ring-1 ring-slate-200 dark:ring-slate-800"
      >
        <CardContent className="p-0">
          <div className={`h-2 w-full ${past ? "bg-slate-400" : urgency.bar}`} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-2xl">
                <ClipboardCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">
                {past ? "Closed" : urgency.label}
              </Badge>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug line-clamp-2">
              {assignment.title || "N/A"}
            </h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <BookOpenIcon className="w-3 h-3" /> {assignment.unit?.unitName || "N/A"}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  {past ? (
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  ) : (
                    <AlarmClockIcon className="w-4 h-4 text-slate-500" />
                  )}
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                {!past && (
                  <span className="text-[10px] font-bold" style={{ color: urgency.ring }}>
                    {timeLeftLabel(assignment.dueDate)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <span className="text-xs text-slate-500">Status</span>
                <Badge className={past ? "bg-slate-200 dark:bg-slate-700 text-slate-500" : urgency.badge}>
                  {assignment.statusByStudent || (past ? "CLOSED" : "N/A")}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Circular countdown showing how much of the issued -> due window is left
function DueDateRing({ createdAt, dueDate, size = 96 }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalMs = new Date(dueDate) - new Date(createdAt);
  const msLeft = new Date(dueDate) - new Date();
  const percentLeft = totalMs > 0 ? Math.min(1, Math.max(0, msLeft / totalMs)) : 0;

  const urgency = getUrgency(dueDate);
  const offset = circumference * (1 - percentLeft);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-700"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={urgency.ring}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-slate-700 dark:text-white">{timeLeftLabel(dueDate)}</span>
        <span className="text-[9px] text-slate-400 uppercase tracking-widest">{urgency.label}</span>
      </div>
    </div>
  );
}

// Helper component for Dialog items to keep the code dry
function DetailItem({ label, value, icon, color = "text-slate-900 dark:text-white", className = "" }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 ${className}`}>
      <div className={`p-2 rounded-full bg-white dark:bg-slate-900 shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className={`font-bold text-sm truncate ${color}`}>
          {value || "N/A"}
        </span>
      </div>
    </div>
  );
}
