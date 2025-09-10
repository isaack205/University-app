import React from "react";
import { Button } from "./button";
import { CircleXIcon } from "lucide-react";

export const Sidebar =  ({ isOpen, toggleSidebar }) => {

    return (
        <div className={`min-h-screen flex flex-col p-5 fixed top-0 left-0 h-full w-90 z-50 rounded-r-2xl backdrop-blur-md border ${ isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform easeinout duration-700`}>
            <div className="flex items-center justify-between">
                <p>Hi Guest !</p>
                <CircleXIcon onClick={toggleSidebar}/>
            </div>
            <div className="flex flex-col flex-1">
                <Button></Button>
                <Button></Button>
                <Button></Button>
                <Button></Button>
            </div>
            <div className="">
            </div>
        </div>
    )
}