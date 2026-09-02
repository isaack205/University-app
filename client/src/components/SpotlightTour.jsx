import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Bell, Sparkles, CheckCircle2, X } from "lucide-react";
import confetti from "canvas-confetti";

export default function SpotlightTour() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check role & single execution
  useEffect(() => {
    if (!user || user.role === "admin") return;
    const hasSeen = localStorage.getItem("hasSeenSpotlightTour");
    if (!hasSeen) {
      // Delay slightly for DOM to render targets cleanly
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mobileSteps = [
    {
      targetId: "bottom-nav-home",
      title: "Dashboard Home 🏠",
      text: "Your central workspace for today's classes, urgent deadlines & class rep notices.",
      position: "top"
    },
    {
      targetId: "bottom-nav-schedule",
      title: "Timetable & Schedules 📅",
      text: "Tap here to view your complete weekly class timetable & lecture rooms.",
      position: "top"
    },
    {
      targetId: "bottom-nav-tasks",
      title: "Assignments & CATs 📝",
      text: "Access your assignment briefs, submission statuses & CAT exam dates.",
      position: "top"
    },
    {
      targetId: "bottom-nav-more",
      title: "More Tools & Menu ☰",
      text: "Tap More to open your full menu — Resources, Lecturers, Profile & Settings!",
      position: "top"
    },
    {
      targetId: "header-notifications",
      title: "Push Notifications & Instant Alerts 🔔",
      text: "Pro Tip: Remember to enable Push Notifications in Settings to get real-time alerts for schedule changes and announcements!",
      position: "bottom"
    }
  ];

  const desktopSteps = [
    {
      targetId: "sidebar-nav",
      title: "Sidebar Navigation 🧭",
      text: "Your primary navigation bar for Home, Schedule, Assignments, Files & Settings.",
      position: "right"
    },
    {
      targetId: "quick-actions-bar",
      title: "Today's Schedule & Shortcuts ⚡",
      text: "Access your live lecture status and quick shortcuts in one click.",
      position: "top"
    },
    {
      targetId: "header-notifications",
      title: "Push Notifications & Instant Alerts 🔔",
      text: "Pro Tip: Remember to enable Push Notifications in Settings to get real-time alerts for schedule changes and announcements!",
      position: "bottom"
    }
  ];

  const steps = isMobile ? mobileSteps : desktopSteps;
  const currentStep = steps[activeStep] || steps[0];

  // Update target rect on step change or scroll/resize
  const updateTargetRect = useCallback(() => {
    if (!isVisible || !currentStep) return;
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right
      });
    } else {
      setTargetRect(null);
    }
  }, [isVisible, currentStep]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener("scroll", updateTargetRect, true);
    window.addEventListener("resize", updateTargetRect);
    return () => {
      window.removeEventListener("scroll", updateTargetRect, true);
      window.removeEventListener("resize", updateTargetRect);
    };
  }, [updateTargetRect]);

  const finishTour = () => {
    // Fire Celebration Confetti 🎉
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"]
    });
    localStorage.setItem("hasSeenSpotlightTour", "true");
    setIsVisible(false);
  };

  const skipTour = () => {
    localStorage.setItem("hasSeenSpotlightTour", "true");
    setIsVisible(false);
  };

  if (!isVisible || !user || user.role === "admin") return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto animate-in fade-in duration-300">
      {/* Target Cutout Spotlight Ring with 9999px shadow backdrop for 100% crystal clear spotlight */}
      {targetRect && (
        <div
          className="fixed rounded-2xl ring-4 ring-green-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-all duration-300 ease-out z-50 bg-transparent pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Click outside to skip listener overlay */}
      <div className="fixed inset-0 z-40 bg-transparent" onClick={skipTour} />

      {/* Floating Tooltip Card */}
      <div
        className={`fixed z-50 w-[90vw] max-w-sm p-5 rounded-3xl bg-card border border-border shadow-2xl space-y-3 transition-all duration-300 ease-out animate-in zoom-in-95 ${
          isMobile
            ? "bottom-20 left-1/2 -translate-x-1/2"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-auto md:right-12 md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-500/20">
            <Sparkles size={12} /> Step {activeStep + 1} of {steps.length}
          </div>
          <button
            onClick={skipTour}
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full"
          >
            Skip <X size={12} />
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="text-base font-black text-foreground">{currentStep.title}</h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {currentStep.text}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeStep ? "w-4 bg-green-600" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="h-8 px-3 rounded-lg font-bold text-xs"
              >
                <ChevronLeft size={14} /> Back
              </Button>
            )}

            {activeStep < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="h-8 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md gap-1"
              >
                Next <ChevronRight size={14} />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={finishTour}
                className="h-8 px-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md gap-1"
              >
                Got it! 🚀 <CheckCircle2 size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
