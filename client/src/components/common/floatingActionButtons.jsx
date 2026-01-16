import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useNavigate } from "react-router-dom";

export default function FloatingActionButtons() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleHelpClick = () => {
    navigate("/help");
  };

  const handleAiClick = () => {
    // Placeholder for AI feature
    console.log("AI feature coming soon");
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
      {/* AI Button - Only for authenticated users */}
      {isAuthenticated && (
        <button
          onClick={handleAiClick}
          disabled
          className="group relative w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="AI Assistant (Coming Soon)"
          aria-label="AI Assistant"
        >
          <Sparkles className="w-6 h-6 text-white" />
          <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Coming Soon
          </div>
        </button>
      )}

      {/* Help Button - For both authenticated and non-authenticated users */}
      <button
        onClick={handleHelpClick}
        className="group relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        title="Help & Support"
        aria-label="Help & Support"
      >
        <HelpCircle className="w-6 h-6 text-white" />
        <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Help & Support
        </div>
      </button>
    </div>
  );
}
