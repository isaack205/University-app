import React from "react";
import { FileArchiveIcon } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button";

export default function FileMenu({ isOpen, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = location.pathname.startsWith('/upload');

    const handleClick = () => {
        navigate('/upload/general');
        if (window.innerWidth < 1024 && toggleSidebar) {
            toggleSidebar();
        }
    };

    return (
        <Button 
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start gap-3 font-semibold text-sm h-10 rounded-xl transition-all ${
                isActive 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold' 
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            }`} 
            onClick={handleClick}
        >
            <FileArchiveIcon className="h-4 w-4 text-amber-500" /> 
            Resource Files
        </Button>
    );
}