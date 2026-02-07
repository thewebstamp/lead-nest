// components/dashboard/layout-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Home,
    Users,
    BarChart3,
    Settings,
    Menu,
    X,
    FileText,
    Calendar,
    Bell,
    HelpCircle,
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
];

export default function DashboardLayoutClient({
    children,
    user,
    business
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
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold">LN</span>
                            </div>
                            <span className="font-bold text-lg">LeadNest</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Business info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold">
                                    {business.name?.charAt(0) || "B"}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-sm">{business.name || "Your Business"}</p>
                                <p className="text-xs text-gray-500">Business account</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                            return (
                                <Link key={item.name} href={item.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                        )}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center space-x-3">
                            <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{user.name || "User"}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email || ""}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top header */}
                <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">
                            {navItems.find((item) => pathname.startsWith(item.href))?.name || "Dashboard"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Link href="/dashboard/settings">
                            <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}