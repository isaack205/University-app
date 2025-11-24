import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import step1Img from "@/assets/step1Img.png";
import step2Img from "@/assets/step2Img.png";
import step3Img from "@/assets/step3Img.png";
import step4Img from "@/assets/step4Img.png";
import step5Img from "@/assets/step5Img.png";
import step6Img from "@/assets/step6Img.png";
import step7Img from "@/assets/step7Img.png";
import step8Img from "@/assets/step8Img.png";

export default function Onboarding({ open: initialOpen = false, onFinish = () => {} }) {
  const [open, setOpen] = useState(initialOpen);
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to your Dashboard",
      text: "This is your dashboard — key info and quick links live here.",
      img: step1Img,
    },
    {
      title: "Side Menu Bar",
      text: "This is your Menu with navigation buttons.",
      img: step2Img,
    },
    {
      title: "Time Table Page",
      text: "View the weeks timetable and units details (Lecturer, venue, e.t.c)",
      img: step3Img,
    },
    {
      title: "Assignments Page",
      text: "View the current and past assignments and their full details.",
      img: step4Img,
    },
    {
      title: "CATs Page",
      text: "View both sitting and upcoming CATs",
      img: step5Img,
    },
    {
      title: "Header",
      text: "Contains navigation buttons. Far left button redirects to dashboard.",
      img: step6Img,
    },
    {
      title: "Notifications & Settings",
      text: "Enable push notifications in Settings so you get pop-up alerts for new CATs, new assignments and upcoming classes.",
      img: step7Img,
    },
    {
      title: "Notifications Page",
      text: "View in-app notifications and mark as read",
      img: step8Img,
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
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{steps[step].title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground hidden">{steps[step].text}</DialogDescription>
        </DialogHeader>

        <div className="mt-1 flex flex-col md:flex-row gap-1 items-start h-185">
          <div className="w-full md:w-1/2">
            {/* image placeholder */}
            {steps[step].img ? (
              <img src={steps[step].img} alt={steps[step].title} className="w-full h-150 object-contain rounded-md" />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                Screenshot placeholder
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-3 h-full"> {/* h-full needed for mt-auto */}
            <p className="text-sm">{steps[step].text}</p>

            <div className="flex items-center gap-2 mt-2">
              <div className="text-xs text-gray-500">Step {step + 1} of {steps.length}</div>
              <div className="flex-1 bg-gray-200 h-1 rounded">
                <div className="bg-green-500 h-1 rounded" style={{ width: `${((step+1)/steps.length)*100}%` }} />
              </div>
            </div>

            <div className="flex justify-between items-center mt-auto"> {/* add mt-auto to stick to bottom */}
              <div>
                <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={skip}>Skip</Button>
                {step < steps.length - 1 ? (
                  <Button onClick={() => setStep(s => s + 1)}>Next</Button>
                ) : (
                  <Button onClick={finish}>Finish</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}