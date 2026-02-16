// components/dashboard/analytics/analytics-dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    TrendingUp,
    Users,
    Clock,
    DollarSign,
    Download,
    Calendar,
    RefreshCw,
    AlertCircle,
    Target,
    TrendingDown,
    PieChart,
    BarChart3,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsSummary {
    totalLeads: number;
    totalBooked: number;
    conversionRate: number;
    avgResponseTime: number;
    avgDealSize: number;
    trend: Array<{ date: string; count: string }>;
    statusBreakdown: Array<{ status: string; count: string }>;
}

interface TimeRange {
    label: string;
    value: string;
    days: number;
}

export default function AnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState<TimeRange>({
        label: "All time",
        value: "0",
        days: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const timeRanges: TimeRange[] = [
        { label: "All time", value: "0", days: 0 },
        { label: "Last 7 days", value: "7d", days: 7 },
        { label: "Last 30 days", value: "30d", days: 30 },
        { label: "Last 90 days", value: "90d", days: 90 },
        { label: "Last year", value: "1y", days: 365 },
    ];

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log(`Fetching analytics for ${timeRange.label} (${timeRange.days} days)`);

            const summaryRes = await fetch(`/api/analytics/summary?days=${timeRange.days}`);

            console.log("API response status:", summaryRes.status);

            if (summaryRes.status === 401) {
                throw new Error("You need to log in again. Please refresh the page.");
            }

            if (!summaryRes.ok) {
                const errorData = await summaryRes.json().catch(() => ({ message: summaryRes.statusText }));
                throw new Error(errorData.message || `API error: ${summaryRes.status}`);
            }

            const summaryData = await summaryRes.json();
            console.log("Analytics data received:", summaryData);

            setSummary(summaryData);
        } catch (err) {
            console.error("Analytics fetch error:", err);

            let errorMessage = "Failed to fetch analytics data";
            if (err instanceof Error) {
                if (err.message.includes("401") || err.message.includes("unauthorized")) {
                    errorMessage = "Session expired. Please refresh the page or log in again.";
                } else if (err.message.includes("Failed to fetch")) {
                    errorMessage = "Network error. Please check your connection and try again.";
                } else {
                    errorMessage = err.message;
                }
            }

            setError(errorMessage);

            // Fallback to dummy data for development
            if (process.env.NODE_ENV === "development") {
                console.log("Using fallback data for development");
                setSummary({
                    totalLeads: 1,
                    totalBooked: 1,
                    conversionRate: 100,
                    avgResponseTime: 4,
                    avgDealSize: 1500,
                    trend: [{ date: "2026-02-01", count: "1" }],
                    statusBreakdown: [{ status: "booked", count: "1" }],
                });
                setError(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [timeRange.days, timeRange.label]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics, refreshKey]);

    const handleRefresh = () => {
        console.log("Manual refresh triggered");
        setRefreshKey((prev) => prev + 1);
    };

    const handleExport = () => {
        if (!summary) return;

        const data = {
            summary,
            exportedAt: new Date().toISOString(),
            period: timeRange.label,
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileName = `leadnest-analytics-${new Date().toISOString().split("T")[0]}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileName);
        linkElement.click();
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
            contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            quoted: "bg-purple-500/20 text-purple-400 border-purple-500/30",
            booked: "bg-green-500/20 text-green-400 border-green-500/30",
            lost: "bg-red-500/20 text-red-400 border-red-500/30",
        };
        return colors[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "booked":
                return <CheckCircle className="h-4 w-4" />;
            case "lost":
                return <XCircle className="h-4 w-4" />;
            case "contacted":
                return <Clock className="h-4 w-4" />;
            case "quoted":
                return <DollarSign className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Analytics Dashboard</h1>
                    <p className="text-gray-300">Track performance and optimize conversions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={timeRange.value}
                        onValueChange={(value) => {
                            const range = timeRanges.find((r) => r.value === value) || timeRanges[0];
                            setTimeRange(range);
                        }}
                    >
                        <SelectTrigger className="w-40 border-gray-700 bg-gray-800/50 text-white rounded-xl">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRanges.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="border-white/10 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-xl"
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isLoading || !summary}
                        className="border-white/10 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:text-white rounded-xl"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    variant="destructive"
                    className="border-red-500/30 bg-red-500/10 text-red-200 rounded-xl backdrop-blur-sm"
                >
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <span className="text-red-200">{error}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg"
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                                className="border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    Array(4)
                        .fill(0)
                        .map((_, i) => (
                            <Card key={i} className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                                <CardContent className="pt-6">
                                    <Skeleton className="h-24 w-full rounded-xl bg-gray-700" />
                                </CardContent>
                            </Card>
                        ))
                ) : summary ? (
                    <>
                        <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">Total Leads</p>
                                        <p className="text-3xl font-bold text-white mt-1">{summary.totalLeads}</p>
                                        <div className="flex items-center mt-2">
                                            {summary.trend.length >= 2 ? (
                                                parseInt(summary.trend[summary.trend.length - 1]?.count || "0") >
                                                    parseInt(summary.trend[summary.trend.length - 2]?.count || "0") ? (
                                                    <>
                                                        <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                                                        <span className="text-sm font-medium text-green-400">Growing</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingDown className="h-4 w-4 text-red-400 mr-1" />
                                                        <span className="text-sm font-medium text-red-400">Declining</span>
                                                    </>
                                                )
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    {summary.trend.length === 1 ? "1 lead total" : "No trend data"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-14 w-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Users className="h-7 w-7 text-blue-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">Conversion Rate</p>
                                        <p className="text-3xl font-bold text-white mt-1">{summary.conversionRate}%</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {summary.totalBooked} booked / {summary.totalLeads} total
                                        </p>
                                    </div>
                                    <div className="h-14 w-14 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <Target className="h-7 w-7 text-green-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    // No data state
                    <Card className="col-span-2 border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                        <CardContent className="pt-6 text-center py-12">
                            <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                                <BarChart3 className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No analytics data yet</h3>
                            <p className="text-gray-300 mb-6">
                                Start capturing leads to see your analytics dashboard in action.
                            </p>
                            <Button
                                onClick={() => window.open("/dashboard/leads", "_blank")}
                                className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                View Leads
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Analytics Content */}
            {!isLoading && !error && summary && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lead Status Overview */}
                    <Card className="lg:col-span-2 border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">Lead Status Overview</CardTitle>
                            <CardDescription className="text-gray-300">
                                Distribution of leads across your pipeline
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                {summary.statusBreakdown.length > 0 ? (
                                    summary.statusBreakdown.map((status) => (
                                        <div key={status.status} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className={cn(
                                                            "h-9 w-9 rounded-full flex items-center justify-center border",
                                                            getStatusColor(status.status).split(" ")[0],
                                                            getStatusColor(status.status).split(" ")[1],
                                                            getStatusColor(status.status).split(" ")[2]
                                                        )}
                                                    >
                                                        {getStatusIcon(status.status)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-white capitalize">{status.status}</span>
                                                        <p className="text-sm text-gray-400">
                                                            {parseInt(status.count)} lead{parseInt(status.count) !== 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-lg text-white">{parseInt(status.count)}</span>
                                                    <p className="text-sm text-gray-400">
                                                        {Math.round((parseInt(status.count) / summary.totalLeads) * 100)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(parseInt(status.count) / summary.totalLeads) * 100}%`,
                                                        backgroundColor: getStatusColor(status.status)
                                                            .split(" ")[0]
                                                            .replace("bg-", "")
                                                            .split("-")[0] === "blue"
                                                            ? "#3b82f6"
                                                            : getStatusColor(status.status)
                                                                .split(" ")[0]
                                                                .replace("bg-", "")
                                                                .split("-")[0] === "amber"
                                                                ? "#f59e0b"
                                                                : getStatusColor(status.status)
                                                                    .split(" ")[0]
                                                                    .replace("bg-", "")
                                                                    .split("-")[0] === "purple"
                                                                    ? "#8b5cf6"
                                                                    : getStatusColor(status.status)
                                                                        .split(" ")[0]
                                                                        .replace("bg-", "")
                                                                        .split("-")[0] === "green"
                                                                        ? "#10b981"
                                                                        : getStatusColor(status.status)
                                                                            .split(" ")[0]
                                                                            .replace("bg-", "")
                                                                            .split("-")[0] === "red"
                                                                            ? "#ef4444"
                                                                            : "#9ca3af",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                                            <PieChart className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-300">No status data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Insights */}
                    <Card className="border border-white/10 bg-gray-800/30 backdrop-blur-xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-white">Quick Insights</CardTitle>
                            <CardDescription className="text-gray-300">Key performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Lead Volume */}
                            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3 shrink-0">
                                        <Users className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-400">Lead Volume</p>
                                        <p className="text-2xl font-bold text-blue-400 mt-1">
                                            {summary.trend?.reduce((acc, day) => acc + parseInt(day.count), 0) || summary.totalLeads}
                                        </p>
                                        <p className="text-xs text-blue-300 mt-1">
                                            {summary.trend?.length || 1} {summary.trend?.length === 1 ? "period" : "periods"} •{" "}
                                            {timeRange.label.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Conversion Health */}
                            <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <div className="flex items-start">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center mr-3 shrink-0">
                                        <Target className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-green-400">Conversion Health</p>
                                        <p
                                            className={cn(
                                                "text-2xl font-bold mt-1",
                                                summary.conversionRate > 20
                                                    ? "text-green-400"
                                                    : summary.conversionRate > 10
                                                        ? "text-amber-400"
                                                        : "text-red-400"
                                            )}
                                        >
                                            {summary.conversionRate}%
                                        </p>
                                        <p
                                            className="text-xs mt-1"
                                            style={{
                                                color:
                                                    summary.conversionRate > 20
                                                        ? "#4ade80"
                                                        : summary.conversionRate > 10
                                                            ? "#fbbf24"
                                                            : "#f87171",
                                            }}
                                        >
                                            {summary.conversionRate > 20
                                                ? "Excellent"
                                                : summary.conversionRate > 10
                                                    ? "Good"
                                                    : "Needs improvement"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trend Summary */}
                            <div className="pt-3 border-t border-white/10">
                                <h4 className="font-semibold text-white mb-3">Recent Activity</h4>
                                <div className="space-y-2">
                                    {summary.trend && summary.trend.length > 0 ? (
                                        <div className="text-sm">
                                            <ul className="space-y-2">
                                                {summary.trend.slice(-3).map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg"
                                                    >
                                                        <span className="text-gray-300">
                                                            {new Date(item.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                        <span className="font-medium text-white">
                                                            {item.count} lead{parseInt(item.count) !== 1 ? "s" : ""}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            No trend data available for the selected period.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}