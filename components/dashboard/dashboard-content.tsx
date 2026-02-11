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
    new: "bg-blue-100 text-blue-800 border-blue-200",
    contacted: "bg-amber-100 text-amber-800 border-amber-200",
    quoted: "bg-purple-100 text-purple-800 border-purple-200",
    booked: "bg-green-100 text-green-800 border-green-200",
    lost: "bg-red-100 text-red-800 border-red-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
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
    const formUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/form/${business.slug}`;

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

    // Calculate trend
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (date1: Date, date2: Date) =>
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();

    const todayLeads = leadTrends.find(t => isSameDay(new Date(t.date), today));
    const yesterdayLeads = leadTrends.find(t => isSameDay(new Date(t.date), yesterday));

    const todayCount = todayLeads ? Number(todayLeads.count) : 0;
    const yesterdayCount = yesterdayLeads ? Number(yesterdayLeads.count) : 0;
    const trendChange = todayCount - yesterdayCount;
    const trendPercentage = yesterdayCount > 0
        ? Math.round((trendChange / yesterdayCount) * 100)
        : todayCount > 0 ? 100 : 0;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome back, {business.name} 👋
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Here&apos;s what&apos;s happening with your business today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => router.push("/dashboard/leads")}
                        className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl px-6 py-5 h-auto"
                    >
                        <Users className="h-4 w-4 mr-2" />
                        View All Leads
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/form/${business.slug}`)}
                        className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl px-6 py-5 h-auto"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Form
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                <div className="flex items-center mt-2">
                                    {trendChange >= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                                    )}
                                    <span className={`text-sm font-medium ${trendChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(trendChange)} today
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">({Math.abs(trendPercentage)}%)</span>
                                </div>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                                <TrendingUp className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{conversionRate}%</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {stats.booked} booked / {stats.total} total
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-green-500/10 to-green-600/10 flex items-center justify-center border border-green-200/50">
                                <CheckCircle className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {avgResponseTime > 0 ? `${avgResponseTime}h` : '—'}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">Time to first contact</p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center border border-amber-200/50">
                                <Clock className="h-7 w-7 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Services</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {business.service_types?.length || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">Services offered</p>
                            </div>
                            <div className="h-14 w-14 rounded-xl bg-linear-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center border border-purple-200/50">
                                <Zap className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads - Glass Card */}
                <div className="lg:col-span-2">
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl font-semibold text-gray-900">
                                    Recent Leads
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    Your most recent incoming leads
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => router.push("/dashboard/leads")}
                                className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg"
                            >
                                View All
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="h-20 w-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                        <Users className="h-10 w-10 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
                                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                        Share your form link to start receiving leads instantly.
                                    </p>
                                    <Button
                                        onClick={copyToClipboard}
                                        className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-xl px-6"
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
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-linear-to-br hover:from-blue-50/50 hover:to-white hover:border-blue-200 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="h-12 w-12 rounded-xl bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200">
                                                    <span className="text-blue-700 font-bold text-lg">
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {lead.name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">{lead.service_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <Badge className={cn("px-3 py-1 rounded-full border", statusColors[lead.status] || statusColors.default)}>
                                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {getTimeAgo(lead.created_at)}
                                                </span>
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
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">
                                Your Form Link
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Share this link to capture leads
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-200 font-mono text-sm break-all">
                                {formUrl}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
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
                                    className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-xl"
                                    onClick={() => router.push(`/form/${business.slug}`)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                Share on your website, social media, or business cards
                            </p>
                        </CardContent>
                    </Card>

                    {/* Pipeline Status */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">
                                Pipeline Status
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Leads by stage
                            </CardDescription>
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
                                        <span className="font-medium text-gray-700">{item.status}</span>
                                        <span className="text-gray-900 font-semibold">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Performance Metrics
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Key indicators for your business
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-5 border border-gray-200 rounded-xl bg-linear-to-br from-white to-gray-50/50">
                            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                            <div className="text-sm font-medium text-gray-700 mt-1">New Leads</div>
                            <p className="text-xs text-gray-500 mt-2">Awaiting first contact</p>
                        </div>
                        <div className="text-center p-5 border border-gray-200 rounded-xl bg-linear-to-br from-white to-gray-50/50">
                            <div className="text-3xl font-bold text-green-600">{conversionRate}%</div>
                            <div className="text-sm font-medium text-gray-700 mt-1">Conversion Rate</div>
                            <p className="text-xs text-gray-500 mt-2">Leads to bookings</p>
                        </div>
                        <div className="text-center p-5 border border-gray-200 rounded-xl bg-linear-to-br from-white to-gray-50/50">
                            <div className="text-3xl font-bold text-amber-600">
                                {avgResponseTime > 0 ? `${avgResponseTime}h` : "—"}
                            </div>
                            <div className="text-sm font-medium text-gray-700 mt-1">Response Time</div>
                            <p className="text-xs text-gray-500 mt-2">Average time to respond</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}