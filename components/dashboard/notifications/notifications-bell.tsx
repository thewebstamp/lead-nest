// components/dashboard/notifications/notifications-bell.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    entity_type?: string;
    entity_id?: string;
    priority: string;
    action_url?: string;
    created_at: string;
}

export function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }

        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/notifications");
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const markAsRead = async (notificationId?: string) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    notificationId,
                    markAll: !notificationId,
                }),
            });

            if (response.ok) {
                if (notificationId) {
                    setNotifications(notifications.filter((n) => n.id !== notificationId));
                } else {
                    setNotifications([]);
                }
                toast({
                    title: "Success",
                    description: notificationId ? "Notification marked as read" : "All notifications cleared",
                });
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to update notifications",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            case "high":
                return "bg-orange-500/20 text-orange-400 border-orange-500/30";
            case "medium":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "low":
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
            default:
                return "bg-gray-500/20 text-gray-300";
        }
    };

    const getPriorityBorder = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "border-l-red-500";
            case "high":
                return "border-l-orange-500";
            case "medium":
                return "border-l-blue-500";
            default:
                return "border-l-gray-500";
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "lead":
                return "🎯";
            case "followup":
                return "⏰";
            case "calendar":
                return "📅";
            case "system":
                return "⚙️";
            default:
                return "🔔";
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification.action_url) {
            window.location.href = notification.action_url;
        }
        markAsRead(notification.id);
    };

    const unreadCount = notifications.length;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="relative text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors rounded-xl"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs bg-linear-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0 bg-gray-900/90 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-white/10">
                    <span className="text-sm font-semibold text-white">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead()}
                            disabled={isLoading}
                            className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
                        >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>

                {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                            <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-200 font-medium">No new notifications</p>
                        <p className="text-xs text-gray-400 mt-1">You&apos;re all caught up!</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto divide-y divide-white/10">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start p-4 cursor-pointer rounded-none border-l-4",
                                    getPriorityBorder(notification.priority),
                                    "bg-transparent hover:bg-gray-800/50 focus:bg-gray-800/50 text-white"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start w-full">
                                    <div className="mr-3 text-xl">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-semibold text-sm text-white truncate">{notification.title}</span>
                                            <Badge className={cn("text-xs px-2 py-0.5 rounded-full border", getPriorityColor(notification.priority))}>
                                                {notification.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">
                                                {new Date(notification.created_at).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                            >
                                                <Check className="h-3 w-3 mr-1" />
                                                Mark read
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}