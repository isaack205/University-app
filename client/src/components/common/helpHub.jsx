// Imports
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import { feedbackService } from "@/services/feedbackApi";
import { toast } from "sonner";
import {
  HelpCircleIcon,
  XIcon,
  TicketIcon,
  SparklesIcon,
  BugIcon,
  LightbulbIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
  SendIcon,
  LoaderIcon,
  ChevronDownIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Ticket category definitions
const TICKET_CATEGORIES = [
  {
    value: "bug",
    label: "🐞 Bug / Technical Issue",
    description: "App crashes, broken features, unexpected errors",
    priority: "high",
    color: "text-red-500",
    bgColor: "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
  },
  {
    value: "class_rep_elevation",
    label: "👑 Class Rep Role Request",
    description: "Request elevation to Class Rep role after contacting admin",
    priority: "high",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
  },
  {
    value: "feature",
    label: "💡 Feature Request",
    description: "Suggest a new feature or improvement to the platform",
    priority: "normal",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20"
  },
  {
    value: "general",
    label: "❓ General Support",
    description: "Questions or general help with using CampusHub",
    priority: "low",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
  }
];

export default function HelpHub() {
  const { user, isAuthenticated } = useAuth();
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [step, setStep] = useState(1); // 1 = pick category, 2 = fill form
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const hubRef = useRef(null);

  // Close speed dial on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (hubRef.current && !hubRef.current.contains(e.target)) {
        setIsSpeedDialOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const openTicketFlow = () => {
    setIsSpeedDialOpen(false);
    setStep(1);
    setSelectedCategory(null);
    setForm({ subject: "", message: "" });
    setIsTicketModalOpen(true);
  };

  const handleAiClick = () => {
    setIsSpeedDialOpen(false);
    toast.info("🤖 CampusHub AI is in development and coming soon in v2.0!", {
      description: "For now, raise a support ticket below and we'll get back to you.",
      duration: 5000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;

    const category = TICKET_CATEGORIES.find((c) => c.value === selectedCategory);
    if (!form.message.trim()) {
      toast.error("Please describe your issue before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        type: selectedCategory,
        priority: category.priority,
        subject: form.subject.trim() || category.label,
        message: form.message.trim(),
        // For guests
        guestName: !isAuthenticated ? (form.guestName || "Guest") : undefined,
        guestEmail: !isAuthenticated ? form.guestEmail : undefined
      });

      toast.success("✅ Ticket submitted successfully!", {
        description:
          category.priority === "high"
            ? "This is a high-priority ticket. Our team will follow up shortly."
            : "Our admin team will review your ticket soon."
      });
      setIsTicketModalOpen(false);
    } catch (err) {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Help Hub Button (Desktop: bottom-right; Mobile: above bottom nav) */}
      <div
        ref={hubRef}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3"
      >
        {/* Speed Dial Menu — appears above the main button */}
        {isSpeedDialOpen && (
          <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* AI Assistant Option */}
            <div className="flex items-center gap-2 group">
              <span className="text-[11px] font-bold text-slate-200 bg-slate-800/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                AI Assistant — Soon
              </span>
              <button
                onClick={handleAiClick}
                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 shadow-lg shadow-purple-700/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                aria-label="AI Assistant (Coming Soon)"
              >
                <SparklesIcon className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 text-[9px] font-black bg-white text-purple-700 rounded-full px-1 leading-tight">
                  Soon
                </span>
              </button>
            </div>

            {/* Raise Ticket Option */}
            <div className="flex items-center gap-2 group">
              <span className="text-[11px] font-bold text-slate-200 bg-slate-800/90 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-700 shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Raise a Support Ticket
              </span>
              <button
                onClick={openTicketFlow}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                aria-label="Raise a ticket"
              >
                <TicketIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Main FAB Toggle Button */}
        <button
          onClick={() => setIsSpeedDialOpen((p) => !p)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
            isSpeedDialOpen
              ? "bg-slate-700 shadow-slate-900/60 rotate-0"
              : "bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-700/50 hover:scale-110"
          }`}
          aria-label="Help Hub"
        >
          {isSpeedDialOpen ? (
            <XIcon className="h-6 w-6 text-white transition-transform" />
          ) : (
            <HelpCircleIcon className="h-6 w-6 text-white" />
          )}
        </button>
      </div>

      {/* Ticket Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-lg w-full p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <TicketIcon className="h-5 w-5" />
                {step === 1 ? "Raise a Support Ticket" : selectedCategory ? TICKET_CATEGORIES.find(c => c.value === selectedCategory)?.label : "Describe Your Issue"}
              </DialogTitle>
              <DialogDescription className="text-blue-100 text-xs mt-1">
                {step === 1
                  ? "Select the category that best describes your issue."
                  : "Provide details and we will get back to you promptly."}
              </DialogDescription>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-3">
              <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
              <div className={`h-1.5 w-16 rounded-full transition-all ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                {TICKET_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setStep(2);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${cat.bgColor}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${cat.color}`}>
                      {cat.value === "bug" && <BugIcon className="h-4 w-4" />}
                      {cat.value === "class_rep_elevation" && <ShieldCheckIcon className="h-4 w-4" />}
                      {cat.value === "feature" && <LightbulbIcon className="h-4 w-4" />}
                      {cat.value === "general" && <MessageSquareIcon className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cat.description}</p>
                    </div>
                    {cat.priority === "high" && (
                      <span className="ml-auto shrink-0 text-[10px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/30">
                        High Priority
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Ticket Form */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDownIcon className="h-3.5 w-3.5 rotate-90" /> Change Category
                </button>

                {/* Guest fields */}
                {!isAuthenticated && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Your Name *</label>
                      <Input
                        required
                        placeholder="e.g. John Doe"
                        value={form.guestName || ""}
                        onChange={(e) => setForm((p) => ({ ...p, guestName: e.target.value }))}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">Email *</label>
                      <Input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={form.guestEmail || ""}
                        onChange={(e) => setForm((p) => ({ ...p, guestEmail: e.target.value }))}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                )}

                {/* Authenticated user info banner */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
                    <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" />
                    Submitting as <strong className="font-black">{user?.name || user?.email}</strong>
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Subject</label>
                  <Input
                    placeholder="Brief title of your issue..."
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    className="text-xs h-9"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Describe your issue *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={
                      selectedCategory === "class_rep_elevation"
                        ? "Provide your Student ID, course, and the admin you contacted..."
                        : selectedCategory === "bug"
                        ? "Describe what happened, what page you were on, and what you expected..."
                        : "Describe your request in as much detail as possible..."
                    }
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* High Priority notice */}
                {TICKET_CATEGORIES.find(c => c.value === selectedCategory)?.priority === "high" && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 font-medium">
                    🚨 High-priority ticket — a notification email will be sent to the support team.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting || !form.message.trim()}
                  className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-sm gap-2 shadow-lg shadow-blue-600/20"
                >
                  {submitting ? (
                    <><LoaderIcon className="animate-spin h-4 w-4" /> Submitting...</>
                  ) : (
                    <><SendIcon className="h-4 w-4" /> Submit Ticket</>
                  )}
                </Button>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
