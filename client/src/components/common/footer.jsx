import React from "react";

export default function Footer() {
    return (
        <footer className="hidden md:flex flex-col items-center justify-center p-4 border-t border-border/60 bg-card text-muted-foreground text-xs mt-auto">
            <p>{new Date().getFullYear()} © CampusHub. All rights reserved.</p>
            <span className="flex items-center gap-1 mt-0.5">
                <span>Designed with ❤️ by</span>
                <a 
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline" 
                    target="_blank" 
                    rel="noreferrer"
                    href="https://my-portfolio-ivory-five-28.vercel.app/"
                >
                    Isaac Kahura
                </a>
            </span>
        </footer>
    );
}