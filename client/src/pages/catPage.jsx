// Imports
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { catService } from "@/services/catApi";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LoaderIcon,
  InfoIcon,
  BookOpenIcon,
  ClipboardListIcon,
  SearchIcon,
  MapPinIcon,
  CalendarIcon,
  FileTextIcon,
  HashIcon,
  UserIcon,
  InboxIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CATPage() {
  const [CATS, setCATS] = useState([]);
  const [selectedCAT, setSelectedCAT] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCAT, setLoadingCAT] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();

  // Fetch CATs
  const fetchCATS = async () => {
    setLoading(true);
    try {
      const fetchedData = await catService.getCATsForCohort();
      setCATS(fetchedData);
    } catch (error) {
      const errorMessage = "Error fetching CATs'.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCATS();
  }, []);

  // Handle View CAT Details
  const handleClick = async (id) => {
    setLoadingCAT(true);
    setOpen(true);
    setSelectedCAT(null);

    try {
      const singleCATDetails = await catService.getCATById(id);
      setSelectedCAT(singleCATDetails);
    } catch (error) {
      const message = "Failed to fetch CAT details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingCAT(false);
    }
  };

  // Separate Sitting and Take-away CATs
  const sittingCATS = CATS.filter((c) => c.type?.toLowerCase() === "sitting");
  const takeawayCATS = CATS.filter((c) => c.type?.toLowerCase() === "takeaway");

  const filterList = (list) =>
    list.filter(
      (c) =>
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.unit?.unitName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredSitting = filterList(sittingCATS);
  const filteredTakeaway = filterList(takeawayCATS);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardListIcon className="text-blue-600" size={30} />
            My CATs'
          </h1>
          <p className="text-slate-500 text-sm">
            CATs scheduled for {user?.cohort?.name || "your cohort"}
          </p>
          {error && <p className="text-red-500 font-medium animate-pulse mt-1">{error}</p>}
        </div>

        <div className="relative w-full md:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search CATs..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoaderIcon className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Loading CATs'...</p>
        </div>
      ) : (
        <Tabs defaultValue="sitting" className="space-y-8">
          <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl inline-flex h-auto">
            <TabsTrigger value="sitting" className="rounded-xl px-6 py-2.5 flex gap-2">
              <ClipboardListIcon className="w-4 h-4" /> Sitting
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                {sittingCATS.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="takeaway" className="rounded-xl px-6 py-2.5 flex gap-2">
              <BookOpenIcon className="w-4 h-4" /> Take-away
              <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {takeawayCATS.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sitting">
            {filteredSitting.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredSitting.map((CAT) => (
                    <CATCard
                      key={CAT._id}
                      CAT={CAT}
                      type="sitting"
                      user={user}
                      onClick={() => handleClick(CAT._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState searchTerm={searchTerm} emptyLabel="No sitting CATs' yet 😊" />
            )}
          </TabsContent>

          <TabsContent value="takeaway">
            {filteredTakeaway.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredTakeaway.map((CAT) => (
                    <CATCard
                      key={CAT._id}
                      CAT={CAT}
                      type="takeaway"
                      user={user}
                      onClick={() => handleClick(CAT._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState searchTerm={searchTerm} emptyLabel="No take-away CATs' yet 📘" />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* FOOTER NOTE */}
      <div className="flex items-center gap-3 justify-center py-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <InfoIcon className="text-blue-500" size={18} />
        <p className="text-slate-500 text-sm font-medium">
          Select a card to view full CAT details, venue, and requirements.
        </p>
      </div>

      {/* CATs' DETAILS DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
          {!loadingCAT && selectedCAT ? (
            <DialogHeader
              className={`shrink-0 p-6 text-white ${
                selectedCAT.type === "sitting"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-800 dark:to-teal-900"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-900"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/15 p-2.5 rounded-2xl shrink-0">
                    {selectedCAT.type === "sitting" ? (
                      <ClipboardListIcon className="text-white" size={22} />
                    ) : (
                      <BookOpenIcon className="text-white" size={22} />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl text-white">
                      {selectedCAT.title || "N/A"} ({selectedCAT.catNumber || "N/A"})
                    </DialogTitle>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                      {selectedCAT.unit?.unitCode?.toUpperCase()} · {selectedCAT.unit?.unitName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge className={getUrgency(getCatDateTime(selectedCAT)).badge}>
                    {getUrgency(getCatDateTime(selectedCAT)).label}
                  </Badge>
                  {user.role === "classRep" && (
                    <Badge className={selectedCAT.isPublished ? "bg-white/20 text-white" : "bg-amber-400 text-amber-950"}>
                      {selectedCAT.isPublished ? "Published" : "Draft"}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>
          ) : (
            <DialogHeader className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 p-6 text-white">
              <DialogTitle className="text-2xl flex items-center gap-3">
                <ClipboardListIcon className="text-blue-100" />
                CAT Details
              </DialogTitle>
            </DialogHeader>
          )}

          <div className="p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {loadingCAT ? (
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
              ) : !selectedCAT ? (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 text-red-500 font-bold"
                >
                  Could not retrieve CAT details.
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
                    <CountdownRing createdAt={selectedCAT.createdAt} dueDate={getCatDateTime(selectedCAT)} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailItem label="Unit Name" value={selectedCAT.unit?.unitName} icon={<BookOpenIcon size={16}/>} color="text-blue-600" />
                    <DetailItem label="Unit Code" value={selectedCAT.unit?.unitCode?.toUpperCase()} icon={<HashIcon size={16}/>} color="text-indigo-600" />
                    <DetailItem label="Type" value={selectedCAT.type?.toUpperCase()} icon={<ClipboardListIcon size={16}/>} color="text-emerald-600" />
                    <DetailItem label="Cat Number" value={selectedCAT.catNumber} icon={<HashIcon size={16}/>} color="text-amber-600" />

                    {selectedCAT.type === "sitting" ? (
                      <>
                        <DetailItem
                          label="Sitting Date"
                          value={selectedCAT.sittingDate ? new Date(selectedCAT.sittingDate).toDateString() : "N/A"}
                          icon={<CalendarIcon size={16}/>}
                          color="text-red-500"
                        />
                        <DetailItem label="Sitting Day" value={selectedCAT.sittingDay} icon={<CalendarIcon size={16}/>} color="text-red-500" />
                        <DetailItem label="Sitting Time" value={selectedCAT.sittingTime} icon={<CalendarIcon size={16}/>} color="text-red-500" />
                        <DetailItem label="Venue" value={selectedCAT.venue} icon={<MapPinIcon size={16}/>} color="text-purple-600" />
                      </>
                    ) : (
                      <>
                        <DetailItem
                          label="Submission Date"
                          value={selectedCAT.submissionDate ? new Date(selectedCAT.submissionDate).toLocaleString() : "N/A"}
                          icon={<CalendarIcon size={16}/>}
                          color="text-red-500"
                          className="md:col-span-2"
                        />
                        <DetailItem label="Submission Format" value={selectedCAT.submissionFormat} icon={<FileTextIcon size={16}/>} color="text-purple-600" />
                      </>
                    )}
                  </div>

                  {selectedCAT.type === "sitting" && selectedCAT.requiredItems?.length > 0 && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-emerald-500">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Required Items</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCAT.requiredItems.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase flex items-center gap-1">
                        <UserIcon size={11} /> Posted By: {selectedCAT.createdBy?.name || "N/A"}
                      </span>
                      {user.role === "classRep" && (
                        <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                          Published: {selectedCAT.isPublished ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">
                      Updated: {new Date(selectedCAT.updatedAt).toLocaleDateString()}
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

// Resolves the relevant date/time for a CAT, used for urgency + countdown
function getCatDateTime(CAT) {
  if (!CAT) return null;
  if (CAT.type === "sitting") {
    if (!CAT.sittingDate) return null;
    const date = new Date(CAT.sittingDate);
    if (CAT.sittingTime) {
      const [hours, minutes] = CAT.sittingTime.split(":").map(Number);
      date.setHours(hours || 0, minutes || 0, 0, 0);
    }
    return date;
  }
  return CAT.submissionDate ? new Date(CAT.submissionDate) : null;
}

// Urgency accent based on time left until the CAT's sitting/submission datetime
function getUrgency(date) {
  if (!date) return { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-500", ring: "#94a3b8", label: "N/A" };

  const hoursLeft = (date - new Date()) / (1000 * 60 * 60);
  if (hoursLeft < 0) {
    return { bar: "bg-slate-400", badge: "bg-slate-100 text-slate-500", ring: "#94a3b8", label: "Completed" };
  }
  if (hoursLeft < 24) {
    return { bar: "bg-red-500", badge: "bg-red-100 text-red-700", ring: "#ef4444", label: "Due Soon" };
  }
  if (hoursLeft < 72) {
    return { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-700", ring: "#f59e0b", label: "Upcoming" };
  }
  return { bar: "bg-green-500", badge: "bg-green-100 text-green-700", ring: "#22c55e", label: "Scheduled" };
}

// Short "time left" string shared by the card and the modal
function timeLeftLabel(date) {
  if (!date) return "N/A";
  const msLeft = date - new Date();
  if (msLeft <= 0) return "Completed";

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
        {searchTerm ? "No CATs' match your search" : emptyLabel}
      </p>
    </div>
  );
}

function CATCard({ CAT, type, user, onClick }) {
  const dateTime = getCatDateTime(CAT);
  const urgency = getUrgency(dateTime);
  const isSitting = type === "sitting";

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
          <div className={`h-2 w-full ${urgency.bar}`} />
          <div className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${isSitting ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-indigo-100 dark:bg-indigo-500/20"}`}>
                {isSitting ? (
                  <ClipboardListIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <BookOpenIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="outline" className="text-[10px] uppercase">
                  {urgency.label}
                </Badge>
                {user.role === "classRep" && !CAT.isPublished && (
                  <Badge className="bg-amber-100 text-amber-700 text-[10px] uppercase">Draft</Badge>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-snug line-clamp-2">
              {CAT.title || "N/A"}
              {CAT.catNumber && <span className="text-slate-400 font-medium"> ({CAT.catNumber})</span>}
            </h3>
            <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
              <BookOpenIcon className="w-3 h-3" /> {CAT.unit?.unitCode?.toUpperCase() || "N/A"} · {CAT.unit?.unitName || "N/A"}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {isSitting
                      ? `${CAT.sittingDate ? new Date(CAT.sittingDate).toDateString() : "N/A"} · ${CAT.sittingTime || "N/A"}`
                      : CAT.submissionDate
                      ? new Date(CAT.submissionDate).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: urgency.ring }}>
                  {timeLeftLabel(dateTime)}
                </span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                {isSitting ? (
                  <>
                    <MapPinIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                      {CAT.venue || "N/A"}
                    </span>
                  </>
                ) : (
                  <>
                    <FileTextIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                      {CAT.submissionFormat || "N/A"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Circular countdown showing how much of the issued -> due window is left
function CountdownRing({ createdAt, dueDate, size = 96 }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const urgency = getUrgency(dueDate);

  let percentLeft = 0;
  if (dueDate && createdAt) {
    const totalMs = dueDate - new Date(createdAt);
    const msLeft = dueDate - new Date();
    percentLeft = totalMs > 0 ? Math.min(1, Math.max(0, msLeft / totalMs)) : 0;
  }
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
