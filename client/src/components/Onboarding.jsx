// Imports
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import step1Img from "@/assets/step1Img.png";
import step2Img from "@/assets/step2Img.png";
import step3Img from "@/assets/step3Img.png";
import step4Img from "@/assets/step4Img.png";
import step5Img from "@/assets/step5Img.png";
import step6Img from "@/assets/step6Img.png";
import step7Img from "@/assets/step7Img.png";
import step8Img from "@/assets/step8Img.png";
import step9Img from "@/assets/step9Img.png";
import step10Img from "@/assets/step10Img.png";

export default function Onboarding({ open: initialOpen = false, onFinish = () => {} }) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Your Academic Command Center",
      text: "Welcome to your new home base. This dashboard tracks your academic progress, upcoming deadlines, and provides quick access to everything you need.",
      img: step1Img,
    },
    {
      title: "Navigation & AI Assistant",
      text: "The sidebar is your gateway to CampusHub. Access navigation tools or chat with our built-in AI for instant academic help.",
      img: step2Img,
    },
    {
      title: "Master Your Schedule",
      text: "Never miss a lecture. View your weekly timetable complete with venue details, lecturer info, and real-time class tracking.",
      img: step3Img,
    },
    {
      title: "Assignment Management",
      text: "Stay ahead of deadlines. Review detailed assignment briefs, track submission statuses, and look back at past coursework.",
      img: step4Img,
    },
    {
      title: "Assessment Tracking",
      text: "Stay prepared for Continuous Assessment Tests. Monitor upcoming sittings and review your CAT history at a glance.",
      img: step5Img,
    },
    {
      title: "The Resource Library",
      text: "Access essential learning materials. Browse, preview, and download course-specific files and general campus resources.",
      img: step6Img,
    },
    {
      title: "Instant In-App Alerts",
      text: "Stay in the loop with the notification center. Catch up on recent activities, new uploads, and administrative updates.",
      img: step7Img,
    },
    {
      title: "Your Digital Identity",
      text: "Manage your student profile. Keep your academic information current and personalize your CampusHub experience.",
      img: step8Img,
    },
    {
      title: "Stay Notified Everywhere",
      text: "Enable push notifications in Settings to get real-time pop-up alerts for new assignments, uploaded files, and class changes.",
      img: step9Img,
    },
    {
      title: "Support & Troubleshooting",
      text: "Need help? Access detailed FAQs, contact campus support, or explore our troubleshooting guides in the Help Center.",
      img: step10Img,
    },
  ];

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const finish = () => {
    localStorage.setItem("isOnboarded", "1");
    setOpen(false);
    onFinish();
  };

  const skip = () => {
    localStorage.setItem("isOnboarded", "1");
    setOpen(false);
    onFinish();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) skip(); setOpen(val); }}>
      <DialogContent className="p-0 overflow-hidden border-none sm:rounded-2xl w-[92vw] max-w-5xl max-h-[92vh] md:max-h-[85vh] shadow-2xl">
        <div className="flex flex-col md:flex-row h-full min-h-[500px]">
          
            <div className="relative w-full h-full mt-5  flex items-center justify-center">
              {steps[step].img ? (
                <img 
                  src={steps[step].img} 
                  alt={steps[step].title} 
                  className="max-w-full max-h-[300px] md:max-h-[450px] object-contain drop-shadow-xl rounded-lg border border-white/10" 
                />
              ) : (
                <div className="aspect-video w-full bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                  Preview coming soon
                </div>
              )}
            </div>

          <div className="w-full md:w-full lg:w-ful flex flex-col bg-white dark:bg-slate-950">
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  Step {step + 1} of {steps.length}
                </span>
                <Button variant="ghost" size="sm" onClick={skip} className="text-slate-400 text-xs font-bold hover:text-red-500 uppercase tracking-tighter">
                  Skip
                </Button>
              </div>

              <DialogHeader className="text-left space-y-4">
                <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-slate-900 dark:text-white tracking-tighter">
                  {steps[step].title}
                </DialogTitle>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base md:text-lg">
                  {steps[step].text}
                </p>
              </DialogHeader>
            </div>

            <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-6">
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-700 ease-in-out" 
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }} 
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="h-12 w-12 rounded-xl shrink-0 border-slate-200 dark:border-slate-800"
                    onClick={() => setStep(s => Math.max(0, s - 1))} 
                    disabled={step === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  {step < steps.length - 1 ? (
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 text-base group"
                      onClick={() => setStep(s => s + 1)}
                    >
                      Next Step
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 text-base shadow-lg shadow-emerald-200 dark:shadow-none"
                      onClick={finish}
                    >
                      Complete Setup
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}