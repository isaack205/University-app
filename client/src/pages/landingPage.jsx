// Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authContext";
import { cohortService } from "@/services/cohortApi";
import { feedbackService } from "@/services/feedbackApi";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  SparklesIcon,
  CalendarDaysIcon,
  ClockIcon,
  FileTextIcon,
  FolderOpenIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ZapIcon,
  Share2Icon,
  LayoutDashboardIcon,
  XCircleIcon,
  DownloadIcon,
  SearchIcon,
  PlusIcon,
  ShieldCheckIcon,
  SendIcon,
  GraduationCapIcon,
  SchoolIcon,
  UserCheckIcon,
  LoaderIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import logo from "../assets/image.png";
import overviewDesktop from "../assets/overview_desktop.png";
import overviewMobile from "../assets/overview_mobile.png";
import timetableDesktop from "../assets/timetable_desktop.png";
import timetableMobile from "../assets/timetable_mobile.png";
import catsDesktop from "../assets/cats_desktop.png";
import catsMobile from "../assets/cats_mobile.png";
import assignmentsDesktop from "../assets/assignments_desktop.png";
import assignmentsMobile from "../assets/assignments_mobile.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // UI States
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  // Data States
  const [cohorts, setCohorts] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Request Form State
  const [requestForm, setRequestForm] = useState({
    courseName: "",
    yearSemester: "",
    contactInfo: "",
    isClassRep: false
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Fetch active cohorts for directory
  useEffect(() => {
    const fetchCohortDirectory = async () => {
      try {
        const data = await cohortService.getAllCohorts();
        setCohorts(data || []);
      } catch (err) {
        console.error("Error loading cohort directory:", err);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchCohortDirectory();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.courseName.trim() || !requestForm.contactInfo.trim()) {
      toast.error("Please fill in your Course Name and Contact Email/Phone");
      return;
    }
    setSubmittingRequest(true);

    try {
      const subject = requestForm.isClassRep
        ? `[Class Rep Verification & Cohort Request] ${requestForm.courseName}`
        : `[Program Request] ${requestForm.courseName}`;

      const message = `
Request Type: ${requestForm.isClassRep ? "Class Rep Verification & Cohort Activation" : "New Program / Cohort Request"}
Course Name: ${requestForm.courseName}
Year & Semester: ${requestForm.yearSemester || "Not specified"}
Contact Info: ${requestForm.contactInfo}
Submitted from: Landing Page Program Request Modal
      `.trim();

      await feedbackService.submitFeedback({
        name: requestForm.contactInfo.split("@")[0] || "Campus Student",
        email: requestForm.contactInfo.includes("@") ? requestForm.contactInfo : "student@campushub.app",
        subject: subject,
        message: message,
        type: requestForm.isClassRep ? "class_rep_request" : "course_request"
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#8b5cf6"]
      });
      toast.success("Request submitted to Admin! Our team will review & activate your cohort shortly. 🚀");
      setIsRequestModalOpen(false);
      setRequestForm({ courseName: "", yearSemester: "", contactInfo: "", isClassRep: false });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to submit request to Admin");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const fuzzyMatch = (text, query) => {
    if (!query || !query.trim()) return true;
    const str = text.toLowerCase();
    const q = query.toLowerCase().trim();
    if (str.includes(q)) return true;
    const tokens = q.split(/\s+/);
    return tokens.every((token) => str.includes(token));
  };

  const filteredCohorts = cohorts.filter((c) => {
    const courseName = c.course?.name || "";
    const courseCode = c.course?.code || "";
    const cohortName = c.name || "";
    const year = c.year ? `Year ${c.year}` : "";
    const combined = `${courseCode} ${courseName} ${cohortName} ${year}`;
    return fuzzyMatch(combined, searchQuery);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Background Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(user ? "/home" : "/")}>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <img src={logo} alt="CampusHub" className="h-full w-full object-contain rounded-xl bg-white p-1" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                CampusHub <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">v{import.meta.env.VITE_APP_VERSION || "0.1.3"}</span>
              </span>
              <p className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase hidden sm:block">
                Academic Operations Platform
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">What We Offer</a>
            <a href="#directory" className="hover:text-blue-600 transition-colors">Active Cohorts</a>
            <a href="#comparison" className="hover:text-blue-600 transition-colors">Why CampusHub</a>
            <a href="#class-reps" className="hover:text-blue-600 transition-colors">For Class Reps</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl px-5 py-2.5"
                onClick={() => navigate("/home")}
              >
                <LayoutDashboardIcon className="mr-1.5 h-4 w-4" /> Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl"
                  onClick={() => navigate("/login")}
                >
                  Log In
                </Button>
                <Button
                  className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl px-5 py-2.5"
                  onClick={() => navigate("/register")}
                >
                  Join Your Class <ArrowRightIcon className="ml-1.5 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-16 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Relatable Student Hook Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/90 border border-blue-200 text-blue-800 text-xs sm:text-sm font-bold shadow-sm backdrop-blur-md">
            <SparklesIcon className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Stop asking "Is there class today?" on WhatsApp group chats</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.12]">
            Your entire academic life, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">synchronized</span> in one place.
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            No more searching through 400 chaotic WhatsApp messages to find assignment briefs or lecture room changes. CampusHub brings your timetable, CAT alerts, lecture slides, and assignment deadlines into one clean cohort hub.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Button
                size="lg"
                className="w-full sm:w-auto text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl h-14 px-8"
                onClick={() => navigate("/home")}
              >
                Go to Your Dashboard <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 rounded-2xl h-14 px-8"
                  onClick={() => navigate("/register")}
                >
                  Join Your Cohort Now <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base font-bold border-2 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-2xl h-14 px-8"
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  <PlusIcon className="mr-2 h-4 w-4 text-blue-600" /> Request My Program
                </Button>
              </>
            )}
          </div>

          {/* Quick Social Trust Indicators */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="h-4 w-4 text-emerald-500" /> Free for Students
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="h-4 w-4 text-emerald-500" /> Verified Class Rep Role Elevation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="h-4 w-4 text-emerald-500" /> 1-Click WhatsApp Invites
            </span>
          </div>
        </div>

        {/* Dual-Device Screenshot & Showcase Section */}
        <div className="mt-12 md:mt-16 relative max-w-6xl mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse pointer-events-none" />
          
          <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-4 sm:p-6 lg:p-8 text-left">
            {/* Window Control Header & Interactive Tabs */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">
                  🔒 https://campushub.app/home — BSCIT Cohort 2024
                </span>
              </div>

              {/* Feature Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  🏠 Overview
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "schedule" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  📅 Timetable
                </button>
                <button
                  onClick={() => setActiveTab("cats")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "cats" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  ⏰ CATs
                </button>
                <button
                  onClick={() => setActiveTab("assignments")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === "assignments" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
                >
                  📝 Assignments
                </button>
              </div>
            </div>

            {/* Dual Device Canvas (Desktop Browser + Smartphone Frame) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Desktop Browser Screen Screenshot Frame (Left 8-cols) */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-2 sm:p-3 space-y-3 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">CH</div>
                    <span className="text-xs font-bold text-slate-300 capitalize">{activeTab} Workspace</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                    Real App View
                  </span>
                </div>

                {/* Tab Specific Content Desktop Image */}
                <div className="rounded-xl overflow-hidden border border-slate-800 shadow-lg animate-in fade-in duration-200 max-h-[420px]">
                  {activeTab === "overview" && (
                    <img src={overviewDesktop} alt="CampusHub Dashboard Overview Desktop" className="w-full h-auto object-cover object-top" />
                  )}
                  {activeTab === "schedule" && (
                    <img src={timetableDesktop} alt="CampusHub Timetable Desktop" className="w-full h-auto object-cover object-top" />
                  )}
                  {activeTab === "cats" && (
                    <img src={catsDesktop} alt="CampusHub CATs Desktop" className="w-full h-auto object-cover object-top" />
                  )}
                  {activeTab === "assignments" && (
                    <img src={assignmentsDesktop} alt="CampusHub Assignments Desktop" className="w-full h-auto object-cover object-top" />
                  )}
                </div>
              </div>

              {/* Smartphone PWA Frame Mockup (Right 4-cols / Floating Overlap) */}
              <div className="lg:col-span-4 relative">
                <div className="bg-slate-950 border-4 border-slate-700 rounded-[2.5rem] p-2.5 shadow-2xl max-w-xs mx-auto space-y-2 relative">
                  
                  {/* Phone Speaker & Notch */}
                  <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-1" />
                  
                  {/* Phone App Status Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 font-mono">
                    <span>9:41 AM</span>
                    <span className="font-bold text-blue-400">CampusHub PWA</span>
                    <span>5G ⚡</span>
                  </div>

                  {/* Phone Active App View Real Mobile Screenshot */}
                  <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner max-h-[520px] animate-in fade-in duration-200">
                    {activeTab === "overview" && (
                      <img src={overviewMobile} alt="CampusHub Mobile Overview" className="w-full h-full object-contain object-top" />
                    )}
                    {activeTab === "schedule" && (
                      <img src={timetableMobile} alt="CampusHub Mobile Timetable" className="w-full h-full object-contain object-top" />
                    )}
                    {activeTab === "cats" && (
                      <img src={catsMobile} alt="CampusHub Mobile CATs" className="w-full h-full object-contain object-top" />
                    )}
                    {activeTab === "assignments" && (
                      <img src={assignmentsMobile} alt="CampusHub Mobile Assignments" className="w-full h-full object-contain object-top" />
                    )}
                  </div>

                  {/* Bottom Home Indicator Bar */}
                  <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Active Campus Programs & Directory Widget */}
      <section id="directory" className="py-16 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black uppercase">
                <SchoolIcon className="h-3.5 w-3.5 text-blue-600" /> Campus Cohort Directory
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                Active Academic Cohorts 🎓
              </h2>
              <p className="text-sm text-slate-600 font-medium max-w-xl">
                Find your active class cohort below. Don't see your specific cohort or year listed? Submit a 10-second request for Admin to activate your program!
              </p>
            </div>

            {/* Search Input & Request Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-64">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search program e.g. BSCIT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-300 rounded-xl text-xs font-medium"
                />
              </div>

              <Button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs h-10 px-4 shrink-0 shadow-md shadow-blue-500/20"
              >
                <PlusIcon className="mr-1.5 h-4 w-4" /> Request My Program
              </Button>
            </div>
          </div>

          {/* Cohorts Badges Grid */}
          {loadingPrograms ? (
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
              <LoaderIcon className="animate-spin h-5 w-5 text-blue-600" />
              <span className="text-xs font-medium">Loading active campus cohorts...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {filteredCohorts.length > 0 ? (
                filteredCohorts.map((cohort) => {
                  const courseName = cohort.course?.name || "Academic Course";
                  const courseCode = cohort.course?.code || "UNI";
                  const cohortLabel = cohort.name || `Year ${cohort.year || 1}`;

                  return (
                    <div
                      key={cohort._id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center gap-3 shadow-sm select-none"
                    >
                      <div className="h-9 w-9 rounded-xl bg-blue-100/90 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                        {courseCode.slice(0, 4)}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 leading-snug">
                          {courseName}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-slate-600">
                            {cohortLabel}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-600">No active cohorts found for "{searchQuery}"</p>
                  <Button
                    size="sm"
                    variant="link"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    onClick={() => setIsRequestModalOpen(true)}
                  >
                    Click here to request "{searchQuery}" to be added! 🚀
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* What CampusHub Currently Offers (The 4 Pillars) */}
      <section id="features" className="py-20 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              What CampusHub Offers Your Class Cohort 🎓
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Designed specifically for continuous university operations. Everything stays organized by Course, Year, and Cohort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 */}
            <Card className="border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-blue-50/50 rounded-3xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">1. Smart Timetable & Overrides</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Never walk to a cancelled class again. Class Reps post room changes, lecture makeup sessions, or venue swaps in real-time.
              </p>
            </Card>

            {/* Pillar 2 */}
            <Card className="border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-amber-50/50 rounded-3xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
                <ClockIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">2. CAT & Exam Countdown Alert</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                No surprise CAT tests. Live countdown timers display exact dates, physical exam venues, and syllabus coverage boundaries.
              </p>
            </Card>

            {/* Pillar 3 */}
            <Card className="border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                <FolderOpenIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">3. Official Course Files & Handouts</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Access lecture slides, course outlines, reference reading materials, and handouts shared by lecturers for your unit.
              </p>
            </Card>

            {/* Pillar 4 */}
            <Card className="border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-b from-white to-indigo-50/50 rounded-3xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                <FileTextIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">4. Assignment Tracker & Uploads</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Track assignment prompts, rubrics, due dates, and upload your PDF coursework directly in CampusHub.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section (Before vs After) */}
      <section id="comparison" className="py-20 bg-white border-y border-slate-200/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
              Why Campus Groups Are Switching to CampusHub 🚀
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              WhatsApp groups are great for chatting, but terrible for tracking academic deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* The Old Way */}
            <div className="bg-red-50/60 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-red-200 pb-4">
                <span className="text-lg font-black text-red-900 flex items-center gap-2">
                  <XCircleIcon className="h-6 w-6 text-red-600" /> The WhatsApp Chaos (Before)
                </span>
                <span className="text-xs bg-red-200 text-red-800 font-extrabold px-3 py-1 rounded-full">Frustrating</span>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-black">✕</span>
                  <span>400 unread messages burying the lecturer's assignment PDF</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-black">✕</span>
                  <span>Walking 15 minutes across campus only to find a lecture was rescheduled 5 mins ago</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-black">✕</span>
                  <span>Panic the night before a CAT because nobody remembers the test room venue</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 font-black">✕</span>
                  <span>Asking "Where are the lecture slides?" 20 times in the class group</span>
                </li>
              </ul>
            </div>

            {/* The CampusHub Way */}
            <div className="bg-emerald-50/60 border border-emerald-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                <span className="text-lg font-black text-emerald-950 flex items-center gap-2">
                  <CheckCircle2Icon className="h-6 w-6 text-emerald-600" /> The CampusHub Way (After)
                </span>
                <span className="text-xs bg-emerald-200 text-emerald-900 font-extrabold px-3 py-1 rounded-full">Organized Cohort</span>
              </div>
              <ul className="space-y-4 text-sm font-semibold text-slate-800">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Open the app see today's timetable, room venues, and active CATs in 3 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>Instant notification when your Class Rep posts a room change or schedule override</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>All lecture slides and course handouts organized neatly under each unit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>1-click WhatsApp cohort invite links that pre-fill registration for your classmates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* For Class Reps & Verified Role Elevation Section */}
      <section id="class-reps" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 text-xs font-bold">
                <UserCheckIcon className="h-4 w-4" /> Class Rep Identity Verification
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Empower your class cohort with verified Rep tools 📲
              </h2>
              <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
                To protect class data integrity, Class Representatives sign up for a standard student account first. Once Admin verifies your identity offline, your account is elevated to Class Rep status to unlock full timetable and cohort management tools.
              </p>
              
              {/* Step-by-step Class Rep Elevation Pipeline */}
              <div className="space-y-3 pt-2 text-sm font-semibold">
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <div className="h-7 w-7 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">1</div>
                  <span>Sign up for a standard student account with your Student Reg ID.</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <div className="h-7 w-7 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-xs">2</div>
                  <span>Contact Admin or submit your Class Rep verification details.</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">3</div>
                  <span>Admin elevates your account to Class Rep to unlock unit & CAT tools!</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl h-12 px-6"
                  onClick={() => navigate(user ? "/home" : "/register")}
                >
                  {user ? "Open Dashboard" : "Register Your Account"} <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-slate-800/90 border border-slate-700 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                  <span className="font-extrabold text-sm text-blue-400">Classroom Growth Hub</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold">Class Rep Dashboard</span>
                </div>
                <div className="bg-slate-900 rounded-2xl p-4 space-y-3 text-xs">
                  <p className="text-slate-400 font-medium">Cohort Share Link:</p>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-slate-300 break-all">
                    https://campushub.app/register?course=BSCIT&cohort=2024
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white">
                      <Share2Icon className="h-3.5 w-3.5 mr-1.5" /> Share on WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to organize your class cohort? 🎓
          </h2>
          <p className="text-base sm:text-xl text-blue-100 font-medium max-w-2xl mx-auto">
            Join university students staying ahead of CATs, assignments, course materials, and timetable updates.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-black rounded-2xl h-14 px-8 shadow-xl"
              onClick={() => navigate(user ? "/home" : "/register")}
            >
              {user ? "Go to Dashboard" : "Get Started for Free"} <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CampusHub" className="h-6 w-6 object-contain rounded-md" />
            <span className="text-slate-200 font-extrabold text-sm">CampusHub</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#directory" className="hover:text-white">Active Cohorts</a>
            <a href="/login" className="hover:text-white">Sign In</a>
            <a href="/register" className="hover:text-white">Register</a>
          </div>
        </div>
      </footer>

      {/* Request Cohort & Class Rep Verification Dialog Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border shadow-2xl space-y-4">
          <DialogHeader className="space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider w-fit">
              <PlusIcon size={14} /> Request New Program
            </div>
            <DialogTitle className="text-xl font-black text-foreground">
              Request Your Course & Cohort 🎓
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Don't see your program on CampusHub yet? Fill in your program details below and Admin will add your cohort!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-1 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Course / Degree Program Name *</label>
              <Input
                required
                placeholder="e.g. BSc. Information Technology or Law"
                value={requestForm.courseName}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, courseName: e.target.value }))}
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Year & Semester / Cohort *</label>
              <Input
                required
                placeholder="e.g. Year 3 Semester 1 (2024)"
                value={requestForm.yearSemester}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, yearSemester: e.target.value }))}
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Your Contact Email or WhatsApp Phone *</label>
              <Input
                required
                placeholder="e.g. student@email.com or +254 700 000000"
                value={requestForm.contactInfo}
                onChange={(e) => setRequestForm((prev) => ({ ...prev, contactInfo: e.target.value }))}
                className="text-xs font-medium"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submittingRequest}
                className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-sm gap-2 shadow-lg shadow-blue-600/20"
              >
                {submittingRequest ? (
                  <>
                    <LoaderIcon className="animate-spin h-4 w-4" /> Sending Ticket to Admin...
                  </>
                ) : (
                  <>
                    <SendIcon size={16} /> Submit Ticket to Admin
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
