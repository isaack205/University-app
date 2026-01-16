import React, { useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { 
  BellIcon, 
  CheckCheckIcon, 
  LoaderIcon, 
  InboxIcon, 
  CircleIcon,
  XIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function NotificationDialog() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 1. Trigger (The Bell Icon for your Navbar) */}
      <DialogTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
              {unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      {/* 2. Modern Dialog Content (Floating Panel style) */}
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl dark:bg-slate-950">
        <DialogHeader className="p-4 border-b bg-white dark:bg-slate-950 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 text-[10px] px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </DialogTitle>
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1 uppercase tracking-tighter"
          >
            Mark all read <CheckCheckIcon size={12} />
          </button>
        </DialogHeader>

        {/* 3. Notification List */}
        <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoaderIcon className="animate-spin text-blue-500 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Checking Inbox...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-50 dark:divide-slate-900">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`p-4 flex gap-3 transition-colors ${
                    !n.read ? "bg-blue-50/40 dark:bg-blue-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  {/* Presence indicator */}
                  <div className="mt-1.5">
                    {!n.read ? (
                       <CircleIcon size={8} className="fill-blue-600 text-blue-600" />
                    ) : (
                       <div className="w-2" /> 
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${!n.read ? 'text-blue-600' : 'text-slate-400'}`}>
                        {n.type}
                      </p>
                      <span className="text-[9px] font-medium text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm leading-tight ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {new Date(n.createdAt).toDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-10 text-center">
              <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-4">
                <InboxIcon size={32} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No new activity to show right now.</p>
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-3 border-t bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <button 
            onClick={() => setOpen(false)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
          >
            Dismiss Panel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}