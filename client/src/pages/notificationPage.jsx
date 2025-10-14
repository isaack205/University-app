// Imports
import React, {useEffect, useState} from "react";
import { notificationService } from "@/services/notificationService";
import { CheckCheckIcon, DotIcon } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationPage() {

    const [notifications, setNotifications] = useState([]);
    const unreadCount = notifications.filter(n => !n.read).length // Unread notifications (read: false)
    const readCount = notifications.filter(n => n.read).length // Read notifications

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchNotifications = async () => {
            try {
                const notificationsData = await notificationService.getMyNotifications();
                setNotifications(notificationsData);
            } catch (error) {
                console.error('Failed to load notifications:', error)
            } finally {
                setLoading(false);
            }
        }

        fetchNotifications();

        // Interval that runs 30secs to check for new notifications
        const interval = setInterval(fetchNotifications, 30000);

        // CleanUp
        return () => clearInterval(interval);
    }, []);

    const markAsRead = (id) => {
        setNotifications (prev => (
            prev.map (n => n._id === id ? {...n, read: true} : n))
        )
    };

    return(
        <div>
            <div className="flex flex-col pb-3">
                <div>
                    <h3 className="px-5 font-bold text-3xl underline text-blue-500">Notifications</h3>
                </div>
                <div className="flex justify-end pt-3">
                    <div className="flex flex-row border rounded-xl shadow-xl pr-3 bg-gray-200 max-w-55 md:max-w-[30%] lg:max-w-[30%]">
                        <span className="flex items-center">
                            <DotIcon className="text-green-500 h-7 w-auto md:h-10 md:w-10 lg:h-10 lg:w-10"/>
                            <p className="italic text-[13px] md:text-sm lg:text-sm">Read</p>
                            ({readCount && <p className="text-green-500 rounded-full text-sm">{readCount}</p> })
                        </span>
                        <span className="flex items-center">
                            <DotIcon className="text-red-500 h-7 w-auto md:h-10 md:w-10 lg:h-10 lg:w-10"/>
                            <p className="italic text-[13px] md:text-sm lg:text-sm">Unread</p>
                            ({unreadCount && <p className="text-red-500 rounded-full text-sm">{unreadCount}</p> })
                        </span>
                    </div>
                </div>
            </div>
            {loading ? (
                <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl">Loading notifications</p>
                        <LoaderIcon className="animate-spin h-7 w-7"/>
                    </div>
                </div>
            ) : notifications.length > 0 ? (
                <div>
                    {notifications.map(notification => (
                        <div className="border py-2 m-5 bg-green-100 rounded-xl flex flex-col md:flex-row lg:flex-row md:justify-between lg:justify-between md:items-center lg:items-center p-1" key={notification._id}>
                            <div className="flex flex-row">
                                <div className="flex items-center">
                                    <div>{notification.read === true ? (
                                        <div>
                                            <DotIcon className="text-green-500 h-10 w-10"/>
                                        </div>
                                        ) : (
                                        <div>
                                            <DotIcon className="text-red-500 h-10 w-10"/>
                                        </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold underline text-gray-500 italic ">{notification.type.toUpperCase()}</p>
                                    <span className="flex md:gap-4 lg:gap-4 flex-col md:flex-row lg:flex-row">
                                        <p>{notification.message}</p>
                                    </span>
                                    <p className="text-gray-400 text-sm">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                {!notification.read &&
                                    <Button type='button' onClick={() => markAsRead(notification._id)} className="right-0 bg-blue-300 hover:bg-blue-500 text-black cursor-pointer shadow-md hover:shadow-blue-400 hover:-translate-y-1 transition easeinout duration-500 mr-2 h-5 w-auto md:h-auto lg:h-auto " disabled>
                                        Mark as Read<CheckCheckIcon />
                                    </Button>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <p className="font-bold text-xl">No notifications found!</p>
                </div>
            )}
        </div>
    )
}