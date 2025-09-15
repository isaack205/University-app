// Imports
import React, {useEffect, useState} from "react";
import { notificationService } from "@/services/notificationService";
import { CheckCheckIcon, DotIcon } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { LoaderIcon } from "lucide-react";

export default function NotificationPage() {

    const [notifications, setNotifications] = useState([]);

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
    }, []);

    return(
        <div>
            <h3 className="px-5 font-bold text-3xl underline">Notifications</h3>
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
                        <div className="border m-5 rounded flex flex-row p-1" key={notification._id}>
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
                                <p className="font-bold underline">{notification.type.toUpperCase()}</p>
                                <span className="flex gap-4">
                                    Message: <p>{notification.message}</p>
                                </span>
                                <p className="text-gray-400 text-sm">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}</p>
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