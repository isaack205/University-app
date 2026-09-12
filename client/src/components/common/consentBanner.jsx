// Imports
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, XIcon, CheckIcon } from "lucide-react";

const CONSENT_KEY = "ch_consent_v1";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if consent has not been given yet
    try {
      const given = localStorage.getItem(CONSENT_KEY);
      if (!given) setVisible(true);
    } catch {
      // localStorage unavailable (e.g. private browsing in some browsers)
      setVisible(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie and data consent"
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 sm:pb-4"
    >
      <div className="max-w-4xl mx-auto bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 rounded-2xl shadow-2xl shadow-black/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Icon */}
        <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
          <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
        </div>

        {/* Text */}
        <p className="flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
          CampusHub uses cookies and browser storage to keep you logged in, remember your preferences, and deliver academic notifications.
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-blue-400 font-bold hover:underline" onClick={handleAccept}>
            Terms & Conditions
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-blue-400 font-bold hover:underline" onClick={handleAccept}>
            Privacy Policy
          </Link>.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            to="/privacy"
            onClick={handleAccept}
            className="flex-1 sm:flex-none text-center text-xs font-bold text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-4 py-2 rounded-xl transition-colors"
          >
            Learn More
          </Link>
          <button
            id="consent-accept-btn"
            onClick={handleAccept}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            Accept
          </button>
          <button
            id="consent-dismiss-btn"
            onClick={handleAccept}
            aria-label="Dismiss"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
