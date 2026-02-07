// components/dashboard/analytics/analytics-dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    TrendingUp,
    Users,
    Clock,
    DollarSign,
    BarChart3,
    PieChart,
    MapPin,
    Download,
    Calendar,
    Filter,
    RefreshCw,
    AlertCircle,
    Target,
    Globe,
    Briefcase,
    UserCheck,
    TrendingDown,
    Sparkles
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts';

interface AnalyticsSummary {
    totalLeads: number;
    totalBooked: number;
    conversionRate: number;
    avgResponseTime: number;
    avgDealSize: number;
    trend: Array<{ date: string; count: string }>;
    statusBreakdown: Array<{ status: string; count: string }>;
}

interface SourceAnalytics {
    source: string;
    total_leads: string;
    booked_leads: string;
    conversion_rate: number;
    avg_value: number;
    trend: Array<{ date: string; count: string }>;
}

interface ServiceAnalytics {
    service_type: string;
    total_leads: string;
    booked_leads: string;
    conversion_rate: number;
    avg_response_time: number;
    avg_value: number;
    revenue: number;
}

interface TimeRange {
    label: string;
    value: string;
    days: number;
}

export default function AnalyticsDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [timeRange, setTimeRange] = useState<TimeRange>({ label: "Last 30 days", value: "30d", days: 30 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [sources, setSources] = useState<SourceAnalytics[]>([]);
    const [services, setServices] = useState<ServiceAnalytics[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const timeRanges: TimeRange[] = [
        { label: "Last 7 days", value: "7d", days: 7 },
        { label: "Last 30 days", value: "30d", days: 30 },
        { label: "Last 90 days", value: "90d", days: 90 },
        { label: "Last year", value: "1y", days: 365 }
    ];

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [summaryRes, sourcesRes, servicesRes] = await Promise.all([
                fetch(`/api/analytics/summary?days=${timeRange.days}`),
                fetch(`/api/analytics/sources?days=${timeRange.days}`),
                fetch(`/api/analytics/services?days=${timeRange.days}`)
            ]);

            if (!summaryRes.ok || !sourcesRes.ok || !servicesRes.ok) {
                throw new Error("Failed to fetch analytics data");
            }

            const [summaryData, sourcesData, servicesData] = await Promise.all([
                summaryRes.json(),
                sourcesRes.json(),
                servicesRes.json()
            ]);

            setSummary(summaryData);
            setSources(sourcesData.sources || []);
            setServices(servicesData.services || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Analytics fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [timeRange.days]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const handleExport = () => {
        const data = { summary, sources, services, exportedAt: new Date().toISOString() };
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileName = `leadnest-analytics-${new Date().toISOString().split('T')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    };

    // Format data for charts
    const formatTrendData = () => {
        if (!summary?.trend) return [];
        return summary.trend.map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            leads: parseInt(item.count),
            cumulative: summary.trend
                .filter(t => new Date(t.date) <= new Date(item.date))
                .reduce((acc, t) => acc + parseInt(t.count), 0)
        }));
    };

    const formatSourceData = () => {
        return sources.map(source => ({
            name: source.source.charAt(0).toUpperCase() + source.source.slice(1),
            leads: parseInt(source.total_leads),
            conversion: source.conversion_rate,
            revenue: source.avg_value * parseInt(source.booked_leads)
        }));
    };

    const formatServiceData = () => {
        return services.map(service => ({
            name: service.service_type.length > 15
                ? service.service_type.substring(0, 12) + '...'
                : service.service_type,
            value: parseInt(service.total_leads),
            conversion: service.conversion_rate,
            revenue: service.revenue,
            responseTime: service.avg_response_time
        }));
    };

    const formatStatusData = () => {
        if (!summary?.statusBreakdown) return [];
        return summary.statusBreakdown.map(item => ({
            name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            value: parseInt(item.count),
            color: getStatusColor(item.status)
        }));
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            new: '#3b82f6',
            contacted: '#f59e0b',
            quoted: '#8b5cf6',
            booked: '#10b981',
            lost: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600">Track performance and optimize conversions</p>
                    </div>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}. <Button variant="link" onClick={fetchAnalytics} className="p-0 h-auto">Try again</Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Track performance, optimize conversions, and grow your business</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select
                        value={timeRange.value}
                        onValueChange={(value) => {
                            const range = timeRanges.find(r => r.value === value) || timeRanges[1];
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
                    <Button variant="outline" onClick={handleExport} disabled={isLoading}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="pt-6">
                                <Skeleton className="h-24 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                        <p className="text-2xl font-bold">{summary?.totalLeads || 0}</p>
                                        <div className="flex items-center mt-1">
                                            {summary && summary.trend.length >= 2 ? (
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
                                                <span className="text-sm text-gray-500">No trend data</span>
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
                                        <p className="text-2xl font-bold">{summary?.conversionRate || 0}%</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {summary?.totalBooked || 0} booked / {summary?.totalLeads || 0} total
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Target className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                                        <p className="text-2xl font-bold">{summary?.avgResponseTime || 0}h</p>
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
                                        <p className="text-sm font-medium text-gray-600">Avg. Deal Size</p>
                                        <p className="text-2xl font-bold">${summary?.avgDealSize?.toLocaleString() || '0'}</p>
                                        <p className="text-sm text-gray-500 mt-1">Projected revenue per booking</p>
                                    </div>
                                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="sources">Lead Sources</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="conversion">Conversion</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-80 w-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Lead Trends Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lead Trends</CardTitle>
                                    <CardDescription>New leads over {timeRange.label.toLowerCase()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={formatTrendData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip
                                                    formatter={(value, name) => {
                                                        if (value == null) return ['–', name];

                                                        const numericValue =
                                                            typeof value === 'number' ? value : Number(value);

                                                        if (name === 'leads') return [numericValue, 'Daily Leads'];
                                                        if (name === 'cumulative') return [numericValue, 'Total Leads'];

                                                        return [numericValue, name];
                                                    }}
                                                />

                                                <Area
                                                    type="monotone"
                                                    dataKey="leads"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.2}
                                                    name="Daily Leads"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="cumulative"
                                                    stroke="#10b981"
                                                    fill="#10b981"
                                                    fillOpacity={0.1}
                                                    name="Total Leads"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lead Status Distribution</CardTitle>
                                    <CardDescription>Current pipeline status</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={formatStatusData()}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {formatStatusData().map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                {/* Sources Tab */}
                <TabsContent value="sources" className="space-y-6">
                    {isLoading ? (
                        <Skeleton className="h-96 w-full" />
                    ) : sources.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Globe className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No source data available</h3>
                                    <p className="text-gray-600">Lead source data will appear here as you receive more leads</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lead Sources Performance</CardTitle>
                                    <CardDescription>Conversion rates and revenue by source</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={formatSourceData()}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis yAxisId="left" />
                                                <YAxis yAxisId="right" orientation="right" />
                                                <Tooltip
                                                    formatter={(value, name) => {
                                                        if (value == null) return ['–', name];

                                                        const numericValue =
                                                            typeof value === 'number' ? value : Number(value);

                                                        if (name === 'leads') return [numericValue, 'Total Leads'];
                                                        if (name === 'conversion') return [`${numericValue}%`, 'Conversion Rate'];
                                                        if (name === 'revenue') return [`$${numericValue.toLocaleString()}`, 'Revenue'];

                                                        return [numericValue, name];
                                                    }}
                                                />
                                                <Legend />
                                                <Bar yAxisId="left" dataKey="leads" fill="#3b82f6" name="Total Leads" />
                                                <Bar yAxisId="right" dataKey="conversion" fill="#10b981" name="Conversion %" />
                                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#8b5cf6" name="Revenue" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sources.map((source, index) => (
                                    <Card key={index}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <Badge variant="outline" className="text-sm">
                                                    {source.source}
                                                </Badge>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold">{parseInt(source.total_leads)}</div>
                                                    <div className="text-sm text-gray-500">Leads</div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Conversion Rate</span>
                                                    <span className={`font-medium ${source.conversion_rate >= 20 ? 'text-green-600' : source.conversion_rate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {source.conversion_rate.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Booked Leads</span>
                                                    <span className="font-medium">{parseInt(source.booked_leads)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Avg. Value</span>
                                                    <span className="font-medium">${source.avg_value.toLocaleString()}</span>
                                                </div>
                                                <div className="pt-3 border-t">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Projected Revenue</span>
                                                        <span className="font-bold text-purple-600">
                                                            ${(source.avg_value * parseInt(source.booked_leads)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-6">
                    {isLoading ? (
                        <Skeleton className="h-96 w-full" />
                    ) : services.length === 0 ? (
                        <Card>
                            <CardContent className="py-12">
                                <div className="text-center">
                                    <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No service data available</h3>
                                    <p className="text-gray-600">Service analytics will appear here as you receive more leads</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Performance Radar</CardTitle>
                                    <CardDescription>Multi-dimensional service analysis</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart data={formatServiceData()}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="name" />
                                                <PolarRadiusAxis />
                                                <Radar
                                                    name="Leads"
                                                    dataKey="value"
                                                    stroke="#3b82f6"
                                                    fill="#3b82f6"
                                                    fillOpacity={0.6}
                                                />
                                                <Radar
                                                    name="Conversion %"
                                                    dataKey="conversion"
                                                    stroke="#10b981"
                                                    fill="#10b981"
                                                    fillOpacity={0.6}
                                                />
                                                <Radar
                                                    name="Response Time"
                                                    dataKey="responseTime"
                                                    stroke="#f59e0b"
                                                    fill="#f59e0b"
                                                    fillOpacity={0.6}
                                                />
                                                <Legend />
                                                <Tooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="overflow-x-auto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Service Performance Details</CardTitle>
                                        <CardDescription>Detailed metrics for each service type</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4 font-medium">Service Type</th>
                                                    <th className="text-left py-3 px-4 font-medium">Total Leads</th>
                                                    <th className="text-left py-3 px-4 font-medium">Booked</th>
                                                    <th className="text-left py-3 px-4 font-medium">Conversion</th>
                                                    <th className="text-left py-3 px-4 font-medium">Avg. Response</th>
                                                    <th className="text-left py-3 px-4 font-medium">Avg. Value</th>
                                                    <th className="text-left py-3 px-4 font-medium">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {services.map((service, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="font-medium">{service.service_type}</div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold">{parseInt(service.total_leads)}</div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                variant={parseInt(service.booked_leads) > 0 ? "default" : "outline"}
                                                                className={parseInt(service.booked_leads) > 0 ? "bg-green-100 text-green-800" : ""}
                                                            >
                                                                {parseInt(service.booked_leads)}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center">
                                                                <div className={`w-16 h-2 bg-gray-200 rounded-full overflow-hidden mr-2`}>
                                                                    <div
                                                                        className={`h-full ${service.conversion_rate >= 20 ? 'bg-green-500' : service.conversion_rate >= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                        style={{ width: `${Math.min(service.conversion_rate, 100)}%` }}
                                                                    />
                                                                </div>
                                                                <span className={`font-medium ${service.conversion_rate >= 20 ? 'text-green-600' : service.conversion_rate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                    {service.conversion_rate.toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center">
                                                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                                <span>{service.avg_response_time.toFixed(1)}h</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-medium">${service.avg_value.toLocaleString()}</div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-purple-600">
                                                                ${service.revenue.toLocaleString()}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    )}
                </TabsContent>

                {/* Conversion Tab */}
                <TabsContent value="conversion" className="space-y-6">
                    {isLoading ? (
                        <Skeleton className="h-96 w-full" />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conversion Funnel</CardTitle>
                                    <CardDescription>Leads progression through pipeline</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {summary?.statusBreakdown?.map((status, index, array) => (
                                            <div key={status.status}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getStatusColor(status.status)} bg-opacity-10`}>
                                                            <span className={`text-sm font-bold`} style={{ color: getStatusColor(status.status) }}>
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium capitalize">{status.status}</div>
                                                            <div className="text-sm text-gray-500">{parseInt(status.count)} leads</div>
                                                        </div>
                                                    </div>
                                                    {index < array.length - 1 && (
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-gray-700">
                                                                {array[index + 1] ? (
                                                                    `${Math.round((parseInt(array[index + 1].count) / parseInt(status.count)) * 100)}%`
                                                                ) : '0%'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">to next stage</div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${(parseInt(status.count) / (summary?.totalLeads || 1)) * 100}%`,
                                                            backgroundColor: getStatusColor(status.status)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Conversion Insights</CardTitle>
                                    <CardDescription>Key metrics and recommendations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-start">
                                                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                                                <div>
                                                    <h4 className="font-medium text-blue-900">Top Conversion Rate</h4>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        {services.sort((a, b) => b.conversion_rate - a.conversion_rate)[0]?.service_type || 'N/A'}
                                                        at {Math.max(...services.map(s => s.conversion_rate), 0).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-start">
                                                <UserCheck className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                                                <div>
                                                    <h4 className="font-medium text-green-900">Best Response Time</h4>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        {services.sort((a, b) => a.avg_response_time - b.avg_response_time)[0]?.service_type || 'N/A'}
                                                        with {Math.min(...services.map(s => s.avg_response_time), 0).toFixed(1)} hours average
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                            <div className="flex items-start">
                                                <DollarSign className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
                                                <div>
                                                    <h4 className="font-medium text-purple-900">Highest Revenue Service</h4>
                                                    <p className="text-sm text-purple-700 mt-1">
                                                        {services.sort((a, b) => b.revenue - a.revenue)[0]?.service_type || 'N/A'}
                                                        generating ${Math.max(...services.map(s => s.revenue), 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <h4 className="font-medium mb-3">Quick Actions</h4>
                                            <div className="space-y-2">
                                                {summary?.avgResponseTime && summary.avgResponseTime > 24 && (
                                                    <div className="flex items-center text-sm text-amber-600">
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        <span>Consider improving response time (currently {summary.avgResponseTime}h)</span>
                                                    </div>
                                                )}
                                                {summary?.conversionRate && summary.conversionRate < 15 && (
                                                    <div className="flex items-center text-sm text-amber-600">
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        <span>Focus on improving conversion rate (currently {summary.conversionRate}%)</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}