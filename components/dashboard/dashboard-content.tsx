// components/dashboard/dashboard-content.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Share2,
    Copy,
    Check,
    Zap,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface DashboardContentProps {
    stats: {
        total: number;
        new: number;
        contacted: number;
        quoted: number;
        booked: number;
        lost: number;
    };
    recentLeads: Array<{
        id: string;
        name: string;
        email: string;
        service_type: string;
        status: string;
        priority: string;
        created_at: Date;
    }>;
    leadTrends: Array<{
        date: string;
        count: string;
    }>;
    business: {
        name: string;
        slug: string;
        email: string;
        service_types: string[];
        created_at: Date;
    };
    conversionRate: number;
    avgResponseTime: number;
}

const statusColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    booked: "bg-green-500/20 text-green-400 border-green-500/30",
    lost: "bg-red-500/20 text-red-400 border-red-500/30",
    default: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function DashboardContent({
    stats,
    recentLeads,
    leadTrends,
    business,
    conversionRate,
    avgResponseTime,
}: DashboardContentProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const formUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/form/${business.slug}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(formUrl);
            setCopied(true);
            toast({
                title: "Copied to clipboard",
                description: "Your lead form link is ready to share.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const leadDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return `${Math.floor(diffInHours / 168)}w ago`;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ensureNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : num;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const todayLeads = leadTrends.find((trend) => {
        const trendDate = new Date(trend.date);
        return isSameDay(trendDate, today);
    });

    const yesterdayLeads = leadTrends.find((trend) => {
        const trendDate = new Date(trend.date);
        return isSameDay(trendDate, yesterday);
    });

    const todayCount = todayLeads ? ensureNumber(todayLeads.count) : 0;
    const yesterdayCount = yesterdayLeads ? ensureNumber(yesterdayLeads.count) : 0;

    const trendChange = todayCount - yesterdayCount;
    const trendPercentage =
        yesterdayCount > 0 ? Math.round((trendChange / yesterdayCount) * 100) : todayCount > 0 ? 100 : 0;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {business.name} 👋</h1>
                    <p className="text-gray-300 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push("/dashboard/leads")}
                        className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl px-6 py-5 h-auto"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        View All Leads
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/form/${business.slug}`)}
                        className="border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white rounded-xl px-6 py-5 h-auto"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Form
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300">Total Leads</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                                <div className="flex items-center mt-2">
                                    {trendChange <= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-400 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                                    )}
                                    <span className={`text-sm font-medium ${trendChange <= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {Math.abs(trendChange)} today
                                    </span>
                                    <span className="text-xs text-gray-400 ml-1">({Math.abs(trendPercentage)}%)</span>
                                </div>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <TrendingUp className="h-7 w-7 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300">Conversion Rate</p>
                                <p className="text-3xl font-bold text-white mt-1">{conversionRate}%</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {stats.booked} booked / {stats.total} total
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <CheckCircle className="h-7 w-7 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300">Avg. Response Time</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {avgResponseTime > 0 ? `${avgResponseTime}h` : "—"}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Time to first contact</p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Clock className="h-7 w-7 text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-300">Active Services</p>
                                <p className="text-3xl font-bold text-white mt-1">{business.service_types?.length || 0}</p>
                                <p className="text-xs text-gray-400 mt-2">Services offered</p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Zap className="h-7 w-7 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads - Glass Card */}
                <div className="lg:col-span-2">
                    <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl font-semibold text-white">Recent Leads</CardTitle>
                                <CardDescription className="text-gray-300">Your most recent incoming leads</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard/leads")}
                                className="border-white/10 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-lg"
                            >
                                View All
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="h-20 w-20 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                                        <Users className="h-10 w-10 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">No leads yet</h3>
                                    <p className="text-gray-300 mb-6 max-w-sm mx-auto">Share your form link to start receiving leads instantly.</p>
                                    <Button
                                        onClick={copyToClipboard}
                                        className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl px-6"
                                    >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Your Form
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentLeads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                                            className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:bg-gray-700/30 hover:border-white/20 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                                    <span className="text-blue-400 font-bold text-lg">
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                        {lead.name}
                                                    </p>
                                                    <p className="text-sm text-gray-300">{lead.service_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Badge
                                                    className={cn(
                                                        "px-3 py-1 rounded-full border",
                                                        statusColors[lead.status] || statusColors.default
                                                    )}
                                                >
                                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                </Badge>
                                                <span className="text-sm text-gray-400">{getTimeAgo(lead.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Form Link Card */}
                    <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">Your Form Link</CardTitle>
                            <CardDescription className="text-gray-300">Share this link to capture leads</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-white/10 font-mono text-sm text-gray-200 break-all">
                                {formUrl}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-white/10 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-xl"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>
                                <Button
                                    className="flex-1 bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                                    onClick={() => router.push(`/form/${business.slug}`)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                            <p className="text-xs text-center text-gray-400">Share on your website, social media, or business cards</p>
                        </CardContent>
                    </Card>

                    {/* Pipeline Status */}
                    <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">Pipeline Status</CardTitle>
                            <CardDescription className="text-gray-300">Leads by stage</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { status: "New", count: stats.new, color: "bg-blue-500" },
                                { status: "Contacted", count: stats.contacted, color: "bg-amber-500" },
                                { status: "Quoted", count: stats.quoted, color: "bg-purple-500" },
                                { status: "Booked", count: stats.booked, color: "bg-green-500" },
                                { status: "Lost", count: stats.lost, color: "bg-red-500" },
                            ].map((item) => (
                                <div key={item.status} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-200">{item.status}</span>
                                        <span className="text-white font-semibold">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                            style={{
                                                width: `${(item.count / Math.max(stats.total, 1)) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Performance Metrics */}
            <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-white">Performance Metrics</CardTitle>
                    <CardDescription className="text-gray-300">Key indicators for your business</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-5 border border-white/10 rounded-xl bg-gray-900/30">
                            <div className="text-3xl font-bold text-blue-400">{stats.new}</div>
                            <div className="text-sm font-medium text-gray-200 mt-1">New Leads</div>
                            <p className="text-xs text-gray-400 mt-2">Awaiting first contact</p>
                        </div>
                        <div className="text-center p-5 border border-white/10 rounded-xl bg-gray-900/30">
                            <div className="text-3xl font-bold text-green-400">{conversionRate}%</div>
                            <div className="text-sm font-medium text-gray-200 mt-1">Conversion Rate</div>
                            <p className="text-xs text-gray-400 mt-2">Leads to bookings</p>
                        </div>
                        <div className="text-center p-5 border border-white/10 rounded-xl bg-gray-900/30">
                            <div className="text-3xl font-bold text-amber-400">
                                {avgResponseTime > 0 ? `${avgResponseTime}h` : "—"}
                            </div>
                            <div className="text-sm font-medium text-gray-200 mt-1">Response Time</div>
                            <p className="text-xs text-gray-400 mt-2">Average time to respond</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}