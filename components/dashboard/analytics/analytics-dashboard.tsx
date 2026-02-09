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
    XCircle
} from "lucide-react";

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
    const [timeRange, setTimeRange] = useState<TimeRange>({ label: "All time", value: "0", days: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const timeRanges: TimeRange[] = [
        { label: "All time", value: "0", days: 0 },
        { label: "Last 7 days", value: "7d", days: 7 },
        { label: "Last 30 days", value: "30d", days: 30 },
        { label: "Last 90 days", value: "90d", days: 90 },
        { label: "Last year", value: "1y", days: 365 }
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
            if (process.env.NODE_ENV === 'development') {
                console.log("Using fallback data for development");
                setSummary({
                    totalLeads: 1,
                    totalBooked: 1,
                    conversionRate: 100,
                    avgResponseTime: 4,
                    avgDealSize: 1500,
                    trend: [
                        { date: "2026-02-01", count: "1" }
                    ],
                    statusBreakdown: [
                        { status: "booked", count: "1" }
                    ]
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
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        if (!summary) return;

        const data = {
            summary,
            exportedAt: new Date().toISOString(),
            period: timeRange.label
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `leadnest-analytics-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            new: 'bg-blue-100 text-blue-800 border-blue-300',
            contacted: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            quoted: 'bg-purple-100 text-purple-800 border-purple-300',
            booked: 'bg-green-100 text-green-800 border-green-300',
            lost: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'booked': return <CheckCircle className="h-4 w-4" />;
            case 'lost': return <XCircle className="h-4 w-4" />;
            case 'contacted': return <Clock className="h-4 w-4" />;
            case 'quoted': return <DollarSign className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track performance and optimize conversions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={timeRange.value}
                        onValueChange={(value) => {
                            const range = timeRanges.find(r => r.value === value) || timeRanges[0];
                            setTimeRange(range);
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRanges.map(range => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExport} disabled={isLoading || !summary}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex justify-between items-center">
                        <span>{error}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleRefresh}>
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
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
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : summary ? (
                    <>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                        <p className="text-2xl font-bold">{summary.totalLeads}</p>
                                        <div className="flex items-center mt-1">
                                            {summary.trend.length >= 2 ? (
                                                parseInt(summary.trend[summary.trend.length - 1]?.count || '0') >
                                                    parseInt(summary.trend[summary.trend.length - 2]?.count || '0') ? (
                                                    <>
                                                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                        <span className="text-sm text-green-600">Growing</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                        <span className="text-sm text-red-600">Declining</span>
                                                    </>
                                                )
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    {summary.trend.length === 1 ? "1 lead total" : "No trend data"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                        <p className="text-2xl font-bold">{summary.conversionRate}%</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {summary.totalBooked} booked / {summary.totalLeads} total
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Target className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                                        <p className="text-2xl font-bold">{summary.avgResponseTime}h</p>
                                        <p className="text-sm text-gray-500 mt-1">Time to first contact</p>
                                    </div>
                                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card> */}

                        {/* <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Deal Size</p>
                                        <p className="text-2xl font-bold">${summary.avgDealSize.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500 mt-1">Projected revenue per booking</p>
                                    </div>
                                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card> */}
                    </>
                ) : (
                    // No data state
                    <Card className="col-span-4">
                        <CardContent className="pt-6 text-center py-12">
                            <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
                            <p className="text-gray-600">Start capturing leads to see your analytics dashboard in action.</p>
                            <Button className="mt-4" onClick={() => window.open('/dashboard/leads', '_blank')}>
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
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Lead Status Overview</CardTitle>
                            <CardDescription>Distribution of leads across your pipeline</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {summary.statusBreakdown.length > 0 ? (
                                    summary.statusBreakdown.map((status) => (
                                        <div key={status.status} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor(status.status).split(' ')[0]}`}>
                                                        {getStatusIcon(status.status)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium capitalize">{status.status}</span>
                                                        <p className="text-sm text-gray-500">
                                                            {parseInt(status.count)} lead{parseInt(status.count) !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-lg">{parseInt(status.count)}</span>
                                                    <p className="text-sm text-gray-500">
                                                        {Math.round((parseInt(status.count) / summary.totalLeads) * 100)}%
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(parseInt(status.count) / summary.totalLeads) * 100}%`,
                                                        backgroundColor: getStatusColor(status.status).split(' ')[0].replace('bg-', '').split('-')[0]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>No status data available</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Insights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Insights</CardTitle>
                            <CardDescription>Key performance indicators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center">
                                    <Users className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Lead Volume</p>
                                        <p className="text-2xl font-bold text-blue-600 mt-1">
                                            {summary.trend?.reduce((acc, day) => acc + parseInt(day.count), 0) || summary.totalLeads}
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {summary.trend?.length || 1} {summary.trend?.length === 1 ? 'period' : 'periods'} • {timeRange.label.toLowerCase()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <div className="flex items-center">
                                    <Target className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-green-900">Conversion Health</p>
                                        <p className={`text-2xl font-bold mt-1 ${summary.conversionRate > 20 ? 'text-green-600' :
                                            summary.conversionRate > 10 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {summary.conversionRate}%
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {summary.conversionRate > 20 ? 'Excellent' :
                                                summary.conversionRate > 10 ? 'Good' : 'Needs improvement'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-center">
                                    <Clock className="h-5 w-5 text-purple-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">Response Performance</p>
                                        <p className={`text-2xl font-bold mt-1 ${summary.avgResponseTime <= 4 ? 'text-green-600' :
                                            summary.avgResponseTime <= 8 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {summary.avgResponseTime}h
                                        </p>
                                        <p className="text-xs text-purple-700 mt-1">
                                            {summary.avgResponseTime <= 4 ? 'Fast response' :
                                                summary.avgResponseTime <= 8 ? 'Average' : 'Needs attention'}
                                        </p>
                                    </div>
                                </div>
                            </div> */}

                            {/* Trend Summary */}
                            <div className="pt-4 border-t">
                                <h4 className="font-medium mb-3">Trend Summary</h4>
                                <div className="space-y-2">
                                    {summary.trend && summary.trend.length > 0 ? (
                                        <div className="text-sm text-gray-600">
                                            <p>Your lead activity over time:</p>
                                            <ul className="mt-2 space-y-1">
                                                {summary.trend.slice(-3).map((item, index) => (
                                                    <li key={index} className="flex justify-between">
                                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                                        <span className="font-medium">{item.count} lead{parseInt(item.count) !== 1 ? 's' : ''}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No trend data available for the selected period.</p>
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