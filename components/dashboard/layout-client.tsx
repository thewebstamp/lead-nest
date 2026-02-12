// components/dashboard/layout-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "@/components/dashboard/notifications/notifications-bell";
import { Button } from "@/components/ui/button";
import { BackgroundLines } from "@/components/background-lines";
import {
    Home,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    Calendar,
    HelpCircle,
    LogOut,
    Zap,
    ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: {
        name?: string | null;
        email?: string | null;
    };
    business: {
        name?: string;
        slug?: string;
    };
}

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Leads", href: "/dashboard/leads", icon: Users },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Logout", href: "/api/auth/signout", icon: LogOut },
];

export default function DashboardLayoutClient({
    children,
    user,
    business,
}: DashboardLayoutClientProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative min-h-screen bg-linear-to-br from-white to-gray-50 font-sans antialiased overflow-hidden">
            {/* Animated background lines */}
            <BackgroundLines variant="light" />

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - visible on large screens, slides in on mobile */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-72 transform bg-white/80 backdrop-blur-xl border-r border-gray-200/80 shadow-xl transition-transform duration-300 ease-in-out",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200/80 shrink-0">
                        <Link href="/dashboard" className="flex items-center space-x-3 group">
                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                LeadNest
                            </span>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden text-gray-500 hover:text-gray-900"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                            return (
                                <Link key={item.name} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-between group px-4 py-5 h-auto rounded-xl transition-all",
                                            isActive
                                                ? "bg-linear-to-r from-blue-50 to-white text-blue-700 shadow-sm border border-blue-100"
                                                : "text-gray-700 hover:bg-gray-100/80"
                                        )}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="flex items-center">
                                            <Icon className={cn(
                                                "h-5 w-5 mr-3",
                                                isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600 transition-colors"
                                            )} />
                                            <span className="font-medium">{item.name}</span>
                                        </span>
                                        {isActive && (
                                            <ChevronRight className="h-4 w-4 text-blue-600" />
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Business info */}
                    <div className="px-4 py-4 mx-4 mb-2 rounded-xl bg-linear-to-br from-gray-50 to-white border border-gray-200/80">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-700 font-bold text-lg">
                                    {business.name?.charAt(0) || "B"}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                    {business.name || "Your Business"}
                                </p>
                                <p className="text-xs text-gray-500">Business account</p>
                            </div>
                        </div>
                    </div>

                    {/* User info */}
                    <div className="border-t border-gray-200/80 p-4 shrink-0">
                        <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100/50 transition-colors">
                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-700 text-white font-medium">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {user.email || ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl px-6 lg:px-8 shadow-sm lg:left-72">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>

                    <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                        {navItems.find((item) => pathname.startsWith(item.href))?.name || "Dashboard"}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    >
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Help</span>
                    </Button>
                    <NotificationsBell />
                    <Link href="/dashboard/settings" className="flex items-center">
                        <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm cursor-pointer hover:ring-blue-200 transition-all">
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-700 text-white font-medium">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 min-h-screen pt-20 lg:pl-72">
                <div className="p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}