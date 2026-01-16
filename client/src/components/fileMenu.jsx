import React, { useEffect, useState} from "react";
import { FileArchiveIcon, ChevronUpIcon, ChevronDownIcon} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/authContext";

export default function FileMenu({ isOpen, toggleSidebar }) {

    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    return(
        <div>
            <Button
                className="w-full flex justify-between bg-no mb-3 text-blue-500 font-bold md:text-xl lg:text-2xl cursor-pointer shadow-lg hover:shadow-xl hover:underline hover:bg-no hover:-translate-y-2 transform easeinout duration-500"
                onClick={() => {setShowMenu(!showMenu)}}
            >
                <div className="flex items-center gap-2">
                    <FileArchiveIcon />
                    <span>Files</span>
                </div>
                {showMenu === true ? (
                        <ChevronUpIcon className="ml-auto" />
                    ) : (
                        <ChevronDownIcon className="ml-auto" />
                    )
                }
                
            </Button>
            {showMenu === true && 
                <div className="flex flex-col items-start ml-10 mb-5 gap-4">
                    <Button className="bg-no text-blue-300  font-bold text-sm md:text-lg lg:text-xl cursor-pointer shadow-lg hover:shadow-xl hover:bg-no hover:-translate-y-2 transform easeinout duration-500" onClick={() => {navigate('/upload');  if (window.innerWidth < 1024) toggleSidebar(); }}>
                        - General Files
                    </Button>
                    <Button className="bg-no text-blue-300 font-bold text-sm md:text-lg lg:text-xl cursor-pointer shadow-lg hover:shadow-xl hover:bg-no hover:-translate-y-2 transform easeinout duration-500 " onClick={() => {navigate('/upload/uploads');  if (window.innerWidth < 1024) toggleSidebar(); }}>
                        - {user.cohort.name || 'Cohort'} Files
                    </Button>
                </div>
            }
           
        </div>
    );
}