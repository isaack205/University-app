import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { courseService } from "@/services/courseApi";
import { cohortService } from "@/services/cohortApi";
import { authService } from "@/services/authApi";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  GraduationCapIcon,
  SchoolIcon,
  IdCardIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  LoaderIcon,
  SparklesIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AcademicOnboardingModal({ isOpen, onSuccess }) {
  const { user, updateUser } = useAuth();

  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState(
    user?.studentId?.startsWith("GOOG-") || user?.studentId?.startsWith("STU-") ? "" : user?.studentId || ""
  );
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState("");
  
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingCohorts, setLoadingCohorts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCourses = async () => {
      try {
        const data = await courseService.getAllCourses();
        setCourses(data || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isOpen]);

  useEffect(() => {
    const fetchCohorts = async () => {
      if (!selectedCourse) return;
      setLoadingCohorts(true);
      try {
        const data = await cohortService.getCohortsByCourse(selectedCourse);
        setCohorts(data || []);
      } catch (err) {
        console.error("Failed to load cohorts:", err);
      } finally {
        setLoadingCohorts(false);
      }
    };

    fetchCohorts();
  }, [selectedCourse]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (!studentId.trim()) {
      toast.error("Please enter your Student Registration/Admission ID");
      return;
    }
    setStep(2);
  };

  const handleCompleteSetup = async () => {
    if (!selectedCourse) {
      toast.error("Please select your academic Course");
      return;
    }
    if (!selectedCohort) {
      toast.error("Please select your Cohorts group");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.completeAcademicOnboarding({
        studentId: studentId.trim(),
        course: selectedCourse,
        cohort: selectedCohort,
      });

      // Fire Celebration Confetti 🎉
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
      });

      toast.success(res.message || "Academic profile setup completed! Welcome aboard!");
      
      if (updateUser) {
        updateUser(res.user);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to complete setup";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs font-black uppercase tracking-wider border border-green-300 dark:border-green-800">
            <SparklesIcon size={14} /> Academic Onboarding
          </div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">
            Welcome to CampusHub, {user?.name?.split(' ')[0] || 'Student'}! 🎓
          </h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto font-medium">
            Please complete your academic profile to load your official timetable, CATs, and course updates.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-center gap-3">
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-green-600 text-white' : 'bg-muted'}`}>1</span>
            Reg ID
          </div>
          <div className={`h-0.5 w-10 ${step >= 2 ? 'bg-green-600' : 'bg-muted'}`} />
          <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-green-600 text-white' : 'bg-muted'}`}>2</span>
            Course & Cohort
          </div>
        </div>

        {/* Step 1: Student ID */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IdCardIcon size={16} className="text-green-600" /> Student Admission / Registration ID *
              </label>
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                placeholder="e.g. EB1/74344/29 or CB1/40090/19"
                className="h-11 text-sm font-mono uppercase bg-background font-bold tracking-wide"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                Your official campus registration number used by class reps and lecturers.
              </p>
            </div>

            <Button
              onClick={handleNextStep}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-green-900/20 active:scale-95 transition-all gap-2"
            >
              Continue to Program Setup <ArrowRightIcon size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: Course & Cohort Selection */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Course Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <GraduationCapIcon size={16} className="text-green-600" /> Select Your Academic Course *
              </label>

              {loadingCourses ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <LoaderIcon className="animate-spin h-4 w-4 text-green-600 mr-2" />
                  <span className="text-xs">Loading available programs...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {courses.map((c) => {
                    const isSelected = selectedCourse === c._id;
                    return (
                      <div
                        key={c._id}
                        onClick={() => {
                          setSelectedCourse(c._id);
                          setSelectedCohort("");
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "bg-green-500/10 border-green-500 font-bold text-green-800 dark:text-green-200 ring-2 ring-green-500/20"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block text-foreground line-clamp-1">{c.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{c.code}</span>
                        </div>
                        {isSelected && <CheckCircle2Icon size={16} className="text-green-600 shrink-0 ml-1" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cohort Selector */}
            {selectedCourse && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SchoolIcon size={16} className="text-purple-600" /> Select Your Class Cohort Group *
                </label>

                {loadingCohorts ? (
                  <div className="flex items-center justify-center py-3 text-muted-foreground">
                    <LoaderIcon className="animate-spin h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-xs">Loading class cohorts...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                    {cohorts.map((cohort) => {
                      const isSelected = selectedCohort === cohort._id;
                      return (
                        <div
                          key={cohort._id}
                          onClick={() => setSelectedCohort(cohort._id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? "bg-purple-500/10 border-purple-500 font-bold text-purple-800 dark:text-purple-200 ring-2 ring-purple-500/20"
                              : "bg-background border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold text-foreground">{cohort.name}</span>
                          {isSelected && <CheckCircle2Icon size={16} className="text-purple-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-11 rounded-xl font-bold text-xs px-4"
              >
                Back
              </Button>

              <Button
                disabled={submitting || !selectedCourse || !selectedCohort}
                onClick={handleCompleteSetup}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs md:text-sm shadow-lg shadow-green-900/20 active:scale-95 transition-all gap-2"
              >
                {submitting ? (
                  <>
                    <LoaderIcon className="animate-spin h-4 w-4" /> Saving Setup...
                  </>
                ) : (
                  <>
                    Complete & Refresh Dashboard 🚀
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
