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
    DropdownMenuSeparator,
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

        // Poll for new notifications every 30 seconds
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
                    setNotifications(notifications.filter(n => n.id !== notificationId));
                } else {
                    setNotifications([]);
                }
                toast({
                    title: "Success",
                    description: notificationId ? "Notification marked as read" : "All notifications cleared",
                });
            }
        } catch (error) {
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
            case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'lead': return '🎯';
            case 'followup': return '⏰';
            case 'calendar': return '📅';
            case 'system': return '⚙️';
            default: return '🔔';
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
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead()}
                            disabled={isLoading}
                            className="h-6 text-xs"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-gray-500">
                        No new notifications
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start p-3 cursor-pointer hover:bg-gray-50",
                                    "border-l-4",
                                    notification.priority === 'urgent' ? 'border-l-red-500' :
                                        notification.priority === 'high' ? 'border-l-orange-500' :
                                            notification.priority === 'medium' ? 'border-l-blue-500' : 'border-l-gray-300'
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start w-full">
                                    <div className="mr-3 text-lg">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm">{notification.title}</span>
                                            <Badge className={cn("text-xs", getPriorityColor(notification.priority))}>
                                                {notification.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                                {new Date(notification.created_at).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
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