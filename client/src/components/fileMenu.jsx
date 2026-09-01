import React from "react";
import { FileArchiveIcon } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";

export default function FileMenu({ isOpen, toggleSidebar }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/upload');
        if (window.innerWidth < 1024 && toggleSidebar) {
            toggleSidebar();
        }
    };

    return (
        <Button
            className="w-full flex items-center justify-start gap-2 bg-no mb-5 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500"
            onClick={handleClick}
        >
            <FileArchiveIcon className="w-6 h-6 flex-shrink-0" />
            <span>Files</span>
        </Button>
    );
}