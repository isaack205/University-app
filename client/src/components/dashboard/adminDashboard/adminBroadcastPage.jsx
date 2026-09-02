// Imports
import React, { useEffect, useState } from "react";
import { broadcastService } from "@/services/broadcastApi";
import { cohortService } from "@/services/cohortApi";
import {
  MegaphoneIcon,
  SendIcon,
  UsersIcon,
  GraduationCapIcon,
  UserCheckIcon,
  GlobeIcon,
  SearchIcon,
  SparklesIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  SmartphoneIcon,
  LoaderIcon,
  XIcon,
  ZapIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminBroadcastPage() {
  const [targetType, setTargetType] = useState("cohorts"); // "cohorts" | "classReps" | "users" | "all"
  const [selectedCohortIds, setSelectedCohortIds] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal"); // "normal" | "high"

  const [cohorts, setCohorts] = useState([]);
  const [loadingCohorts, setLoadingCohorts] = useState(true);

  // User search state
  const [userQuery, setUserQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Pre-flight confirmation modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        const data = await cohortService.getAllCohorts();
        setCohorts(data || []);
      } catch (err) {
        console.error("Failed to fetch cohorts:", err);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCohorts();
  }, []);

  // Handle user autocomplete search
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (userQuery.trim().length >= 2) {
        setIsSearchingUsers(true);
        try {
          const res = await broadcastService.searchUsers(userQuery);
          setUserSearchResults(res.users || []);
        } catch (err) {
          console.error("Search error:", err);
        } finally {
          setIsSearchingUsers(false);
        }
      } else {
        setUserSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [userQuery]);

  const handleToggleCohort = (cohortId) => {
    setSelectedCohortIds((prev) =>
      prev.includes(cohortId)
        ? prev.filter((id) => id !== cohortId)
        : [...prev, cohortId]
    );
  };

  const handleSelectAllCohorts = () => {
    if (selectedCohortIds.length === cohorts.length) {
      setSelectedCohortIds([]);
    } else {
      setSelectedCohortIds(cohorts.map((c) => c._id));
    }
  };

  const handleAddUser = (user) => {
    if (!selectedUsers.some((u) => u._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserQuery("");
    setUserSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
  };

  const handleOpenConfirmation = () => {
    if (!message.trim()) {
      toast.error("Please enter an announcement message");
      return;
    }

    if (targetType === "cohorts" && selectedCohortIds.length === 0) {
      toast.error("Please select at least one cohort");
      return;
    }

    if (targetType === "users" && selectedUsers.length === 0) {
      toast.error("Please select at least one target user");
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleSendBroadcast = async () => {
    setIsSending(true);
    try {
      const payload = {
        targetType,
        targetIds:
          targetType === "cohorts" || targetType === "classReps"
            ? selectedCohortIds
            : targetType === "users"
            ? selectedUsers.map((u) => u._id)
            : [],
        title,
        message,
        priority,
      };

      const res = await broadcastService.sendBroadcast(payload);
      toast.success(res.message || "Announcement broadcasted successfully!");
      setIsConfirmOpen(false);

      // Reset form
      setTitle("");
      setMessage("");
      setSelectedCohortIds([]);
      setSelectedUsers([]);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to send announcement";
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <MegaphoneIcon size={24} />
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
            Broadcast Announcement Studio 📢
          </h1>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Compose and dispatch targeted in-app & web push notifications directly to cohorts, class reps, specific users, or globally.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Selection Mode Cards */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
              1. Choose Recipient Target Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTargetType("cohorts")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetType === "cohorts"
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/30"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <UsersIcon size={18} />
                <span className="text-xs">Cohorts</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType("classReps")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetType === "classReps"
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/30"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheckIcon size={18} />
                <span className="text-xs">Class Reps</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType("users")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetType === "users"
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/30"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCapIcon size={18} />
                <span className="text-xs">Specific Users</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType("all")}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  targetType === "all"
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/30"
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <GlobeIcon size={18} />
                <span className="text-xs">All Users</span>
              </button>
            </div>
          </div>

          {/* Dynamic Target Selection Area */}
          <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-sm">
            {targetType === "cohorts" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Select Target Cohort(s):</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllCohorts}
                    className="h-7 text-[11px] font-bold text-amber-600 dark:text-amber-400"
                  >
                    {selectedCohortIds.length === cohorts.length ? "Deselect All" : "Select All"}
                  </Button>
                </div>

                {loadingCohorts ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <LoaderIcon className="animate-spin h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-xs">Loading cohorts...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {cohorts.map((c) => {
                      const isSelected = selectedCohortIds.includes(c._id);
                      return (
                        <div
                          key={c._id}
                          onClick={() => handleToggleCohort(c._id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500/80 font-bold text-amber-800 dark:text-amber-200"
                              : "bg-background border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs line-clamp-1">{c.name}</span>
                          {isSelected && <CheckCircle2Icon size={16} className="text-amber-600 dark:text-amber-400 shrink-0 ml-1" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {targetType === "classReps" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Notice will be sent specifically to all registered <strong>Class Representatives</strong>. Optionally filter by cohort below:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {cohorts.map((c) => {
                    const isSelected = selectedCohortIds.includes(c._id);
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleToggleCohort(c._id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition-all ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 font-bold text-amber-800 dark:text-amber-200"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        <span className="line-clamp-1">{c.name} Reps</span>
                        {isSelected && <CheckCircle2Icon size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {targetType === "users" && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-foreground">Search and Select Specific Recipients:</span>
                
                {/* Search Box */}
                <div className="relative">
                  <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Type student name, email, or student ID..."
                    className="pl-9 text-xs bg-background"
                  />
                  {isSearchingUsers && (
                    <LoaderIcon size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>

                {/* Autocomplete Results Dropdown */}
                {userSearchResults.length > 0 && (
                  <div className="p-1 rounded-xl border bg-popover text-popover-foreground shadow-lg space-y-1 max-h-40 overflow-y-auto">
                    {userSearchResults.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => handleAddUser(u)}
                        className="p-2 rounded-lg hover:bg-muted cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold block text-foreground">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email} • {u.role}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">+ Add</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Users Chips */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedUsers.map((u) => (
                      <span
                        key={u._id}
                        className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800"
                      >
                        {u.name}
                        <button
                          type="button"
                          onClick={() => handleRemoveUser(u._id)}
                          className="hover:text-red-500"
                        >
                          <XIcon size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {targetType === "all" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
                <GlobeIcon size={18} className="text-amber-600 shrink-0" />
                <span>This announcement will be delivered to <strong>ALL registered users</strong> across the platform.</span>
              </div>
            )}
          </div>

          {/* Message Composition Area */}
          <div className="space-y-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                2. Announcement Title (Optional)
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 📢 End of Semester Exam Schedule Released"
                className="text-xs md:text-sm font-bold bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                3. Announcement Body Message *
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type the detailed announcement message here..."
                className="text-xs md:text-sm bg-background font-medium"
              />
            </div>

            {/* Priority Switcher */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-foreground">Set Priority Level:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("normal")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    priority === "normal"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("high")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    priority === "high"
                      ? "bg-red-600 text-white shadow-md animate-pulse"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <AlertTriangleIcon size={12} /> High / Urgent
                </button>
              </div>
            </div>

            <Button
              onClick={handleOpenConfirmation}
              className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-900/20 active:scale-95 transition-all gap-2"
            >
              <SendIcon size={16} /> Preview & Dispatch Announcement
            </Button>
          </div>
        </div>

        {/* Right Column: Live Device Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="flex items-center gap-2">
            <SmartphoneIcon size={18} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Live Smartphone Push Preview
            </h3>
          </div>

          {/* Smartphone Frame */}
          <div className="relative mx-auto w-full max-w-[320px] rounded-[40px] border-[8px] border-slate-900 bg-slate-950 p-4 shadow-2xl overflow-hidden text-white min-h-[460px] flex flex-col justify-between">
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-28 bg-slate-900 rounded-full z-20" />

            {/* Lockscreen Header */}
            <div className="pt-6 text-center space-y-1">
              <span className="text-[10px] font-medium text-slate-400">Wednesday, September 2</span>
              <h4 className="text-3xl font-light tracking-tight">16:45</h4>
            </div>

            {/* Push Notification Banner Card */}
            <div className="my-auto space-y-2 animate-in slide-in-from-top-4 duration-300">
              <div className="p-3 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="h-5 w-5 rounded-lg bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white text-[9px] font-black">
                      CH
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">CampusHub</span>
                  </div>
                  <span className="text-[9px] text-slate-400">now</span>
                </div>

                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-white line-clamp-1">
                    {priority === "high" && "🚨 [HIGH PRIORITY] "}
                    {title.trim() || "📢 Campus Announcement"}
                  </h5>
                  <p className="text-[11px] text-slate-300 line-clamp-3 font-normal leading-relaxed">
                    {message.trim() || "Your announcement message body will appear here as a native push notification banner on students' devices..."}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <span className="text-[9px] text-slate-500 font-mono">Tap notification to open CampusHub</span>
              </div>
            </div>

            {/* Lockscreen Footer */}
            <div className="pb-2 flex justify-between items-center text-slate-500 px-4">
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-xs">🔦</div>
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-xs">📷</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-flight Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] p-6 bg-card text-card-foreground border-border rounded-2xl shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <MegaphoneIcon size={22} />
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                Confirm Announcement Dispatch
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Please review target details before launching push notifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs mt-2">
            <div className="p-3 rounded-xl bg-muted/60 space-y-1.5 border border-border/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground uppercase text-[10px]">Target Mode:</span>
                <span className="font-bold uppercase text-amber-600 dark:text-amber-400">{targetType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground uppercase text-[10px]">Priority Level:</span>
                <span className={`font-bold ${priority === "high" ? "text-red-500" : "text-blue-500"}`}>
                  {priority.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="font-bold text-muted-foreground uppercase text-[10px]">Title:</span>
                <span className="font-bold text-foreground">{title || "Campus Announcement"}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                variant="outline"
                disabled={isSending}
                onClick={() => setIsConfirmOpen(false)}
                className="h-10 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                disabled={isSending}
                onClick={handleSendBroadcast}
                className="h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-2"
              >
                {isSending ? (
                  <>
                    <LoaderIcon className="animate-spin h-4 w-4" />
                    Dispatching...
                  </>
                ) : (
                  <>
                    <SendIcon size={14} /> Send Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
