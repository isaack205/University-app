// Imports
import React from "react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Share2Icon,
  CopyIcon,
  SparklesIcon,
  UsersIcon,
  GlobeIcon
} from "lucide-react";

export default function InviteModal({ isOpen, onClose }) {
  const { user } = useAuth();

  const courseCode =
    user?.course?.name?.replace(/\s+/g, "-") ||
    user?.course?.code ||
    user?.course ||
    "";
  const cohortName =
    user?.cohort?.name?.replace(/\s+/g, "-") ||
    user?.cohort?.year?.toString() ||
    user?.cohort ||
    "";

  const origin = window.location.origin;
  const cohortInviteUrl = courseCode && cohortName
    ? `${origin}/register?course=${encodeURIComponent(courseCode)}&cohort=${encodeURIComponent(cohortName)}`
    : `${origin}/register`;

  const generalInviteUrl = `${origin}/register`;

  const handleShareWhatsApp = (url, isCohort) => {
    const courseLabel = user?.course?.name || user?.course?.code || "our class";
    const message = isCohort
      ? `Hey class! We are tracking all our ${courseLabel} CATs, assignments, and timetable updates on CampusHub 🎓\n\nRegister here to join our cohort:\n${url}`
      : `Hey! I'm using CampusHub to track all our class assignments, CATs, and timetable updates 🎓\n\nCreate your account here:\n${url}`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = (url, label) => {
    navigator.clipboard.writeText(url);
    toast.success(`${label} copied to clipboard! 🚀`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border shadow-2xl space-y-4">
        <DialogHeader className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider w-fit">
            <SparklesIcon size={14} /> CampusHub Viral Share
          </div>
          <DialogTitle className="text-xl font-black text-foreground">
            Invite Classmates & Friends 🚀
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Select an invite link below to drop into WhatsApp groups or send directly to friends.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Card 1: Class Cohort Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-blue-50/50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <UsersIcon size={14} className="text-emerald-600" />
                1. Class Cohort Link (Pre-fills Course)
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                Class Group
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={cohortInviteUrl}
                className="w-full text-xs font-mono bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyLink(cohortInviteUrl, "Cohort Invite Link")}
                className="shrink-0 h-9 rounded-xl border-slate-300 dark:border-slate-700"
              >
                <CopyIcon size={14} />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={() => handleShareWhatsApp(cohortInviteUrl, true)}
              className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 text-xs gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Share2Icon size={14} /> Share Cohort Link on WhatsApp
            </Button>
          </div>

          {/* Card 2: General App Link */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GlobeIcon size={14} className="text-blue-600" />
                2. General App Link (Standard Registration)
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Any Friend
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={generalInviteUrl}
                className="w-full text-xs font-mono bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 truncate"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyLink(generalInviteUrl, "General Invite Link")}
                className="shrink-0 h-9 rounded-xl border-slate-300 dark:border-slate-700"
              >
                <CopyIcon size={14} />
              </Button>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleShareWhatsApp(generalInviteUrl, false)}
              className="w-full font-bold rounded-xl h-9 text-xs gap-1.5"
            >
              <Share2Icon size={14} /> Share General Link on WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
