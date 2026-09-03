import React, { useState } from 'react';
import Header from './header.jsx';
import Footer from './footer.jsx';
import BottomNav from './bottomNav.jsx';
import HelpHub from './helpHub.jsx';
import { Sidebar } from '@/components/ui/sidebar.jsx';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground relative selection:bg-green-500 selection:text-white">
            <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            
            <main className="flex-1 w-full pb-20 md:pb-8 lg:pl-72 transition-all">
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>

            <Footer />
            <BottomNav toggleSidebar={toggleSidebar} />
            <HelpHub />
        </div>
    );
}
