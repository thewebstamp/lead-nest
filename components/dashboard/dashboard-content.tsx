// components/dashboard/dashboard-content.tsx - UPDATED types
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
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Mail,
    Share2,
    Copy,
    Check,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    quoted: "bg-purple-100 text-purple-800",
    booked: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
};

// const priorityColors: Record<string, string> = {
//     high: "bg-red-100 text-red-800",
//     medium: "bg-yellow-100 text-yellow-800",
//     low: "bg-green-100 text-green-800",
// };

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
                title: "Copied!",
                description: "Form link copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    // const formatDate = (date: Date) => {
    //     return new Date(date).toLocaleDateString("en-US", {
    //         month: "short",
    //         day: "numeric",
    //         hour: "2-digit",
    //         minute: "2-digit",
    //     });
    // };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const leadDate = new Date(date);
        const diffInHours = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return `${Math.floor(diffInHours / 168)}w ago`;
    };

    // Calculate trend data
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

    // Function to compare dates without time
    const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    };

    // Convert leadTrends dates to Date objects for comparison
    const todayLeads = leadTrends.find(trend => {
        const trendDate = new Date(trend.date);
        return isSameDay(trendDate, today);
    });

    const yesterdayLeads = leadTrends.find(trend => {
        const trendDate = new Date(trend.date);
        return isSameDay(trendDate, yesterday);
    });

    // Get counts (default to 0 if not found)
    const todayCount = todayLeads ? ensureNumber(todayLeads.count) : 0;
    const yesterdayCount = yesterdayLeads ? ensureNumber(yesterdayLeads.count) : 0;

    // Calculate change
    const trendChange = todayCount - yesterdayCount;
    const trendPercentage = yesterdayCount > 0
        ? Math.round((trendChange / yesterdayCount) * 100)
        : todayCount > 0 ? 100 : 0;

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {business.name}!</h1>
                    <p className="text-gray-600">
                        Here&apos;s what&apos;s happening with your business today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => router.push("/dashboard/leads")}>
                        <Users className="h-4 w-4 mr-2" />
                        View All Leads
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/form/${business.slug}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Form
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                <p className="text-2xl font-bold mt-1">{stats.total}</p>
                                <div className="flex items-center mt-1">
                                    {trendChange >= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                    )}
                                    <span className={`text-sm ${trendChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {Math.abs(trendChange)} today • {Math.abs(trendPercentage)}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p className="text-2xl font-bold mt-1">{conversionRate}%</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {stats.booked} booked / {stats.total} total
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                                <p className="text-2xl font-bold mt-1">{avgResponseTime}h</p>
                                <p className="text-sm text-gray-500 mt-1">Time to first contact</p>
                            </div>
                            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Services</p>
                                <p className="text-2xl font-bold mt-1">{business.service_types?.length || 0}</p>
                                <p className="text-sm text-gray-500 mt-1">Services offered</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Leads */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Leads</CardTitle>
                                <CardDescription>Your most recent incoming leads</CardDescription>
                            </div>
                            <Button variant="outline" onClick={() => router.push("/dashboard/leads")}>
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentLeads.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                                    <p className="text-gray-600 mb-4">
                                        Share your form link to start receiving leads
                                    </p>
                                    <Button onClick={() => router.push(`/form/${business.slug}`)}>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Your Form
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentLeads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">
                                                        {lead.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    <p className="text-sm text-gray-500">{lead.service_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge className={statusColors[lead.status]}>
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

                {/* Quick Actions & Form Link */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Form Link</CardTitle>
                            <CardDescription>Share this link to capture leads</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded-lg border">
                                    <code className="text-sm break-all">{formUrl}</code>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
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
                                    <Button className="flex-1" onClick={() => router.push(`/form/${business.slug}`)}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        Preview
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Share on website, social media, or business cards
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push("/dashboard/leads")}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    View All Leads
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push("/dashboard/settings")}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Business Settings
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => router.push("/dashboard/analytics")}
                                >
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    View Analytics
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => window.open(`mailto:${business.email}`)}
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pipeline Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Status</CardTitle>
                            <CardDescription>Leads by status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { status: "New", count: stats.new, color: "bg-blue-500" },
                                    { status: "Contacted", count: stats.contacted, color: "bg-yellow-500" },
                                    { status: "Quoted", count: stats.quoted, color: "bg-purple-500" },
                                    { status: "Booked", count: stats.booked, color: "bg-green-500" },
                                    { status: "Lost", count: stats.lost, color: "bg-red-500" },
                                ].map((item) => (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium">{item.status}</span>
                                            <span>{item.count}</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color} transition-all duration-500`}
                                                style={{
                                                    width: `${(item.count / Math.max(stats.total, 1)) * 100}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Key metrics for your business</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                            <div className="text-sm text-gray-600 mt-1">New Leads</div>
                            <p className="text-xs text-gray-500 mt-2">Awaiting first contact</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-green-600">{conversionRate}%</div>
                            <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
                            <p className="text-xs text-gray-500 mt-2">Leads to bookings</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-3xl font-bold text-purple-600">
                                {avgResponseTime > 0 ? `${avgResponseTime}h` : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Response Time</div>
                            <p className="text-xs text-gray-500 mt-2">Average time to respond</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}