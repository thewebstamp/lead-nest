// components/dashboard/leads/leads-dashboard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    MoreVertical,
    Phone,
    Mail,
    MessageSquare,
    User,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Users,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    service_type: string;
    location: string;
    status: string;
    priority: string;
    tags: string;
    created_at: Date;
    message: string;
    qualification_notes: string;
}

interface LeadsDashboardProps {
    leads: Lead[];
    stats: {
        total: number;
        new: number;
        contacted: number;
        quoted: number;
        booked: number;
        lost: number;
    };
    businessId: string;
}

const statusOptions = [
    { value: "all", label: "All Leads" },
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800 border-blue-300" },
    { value: "contacted", label: "Contacted", color: "bg-amber-100 text-amber-800 border-amber-300" },
    { value: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800 border-purple-300" },
    { value: "booked", label: "Booked", color: "bg-green-100 text-green-800 border-green-300" },
    { value: "lost", label: "Lost", color: "bg-red-100 text-red-800 border-red-300" },
];

const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-green-100 text-green-800 border-green-300",
};

export default function LeadsDashboard({ leads, stats, businessId }: LeadsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            searchTerm === "" ||
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.location.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || lead.status === statusFilter;

        const matchesPriority =
            priorityFilter === "all" || lead.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleStatusUpdate = async (leadId: string, newStatus: string) => {
        console.log("Using bulk API for individual update");

        try {
            const response = await fetch(`/api/leads/bulk/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    leadIds: [leadId],
                    status: newStatus,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Status updated",
                    description: "Lead status has been updated successfully",
                });
                setTimeout(() => window.location.reload(), 1000);
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to update status",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (selectedLeads.size === 0) return;

        try {
            const response = await fetch(`/api/leads/bulk/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    leadIds: Array.from(selectedLeads),
                    status: newStatus,
                }),
            });

            if (response.ok) {
                setSelectedLeads(new Set());
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to bulk update status:", error);
        }
    };

    const toggleLeadSelection = (leadId: string) => {
        const newSelected = new Set(selectedLeads);
        if (newSelected.has(leadId)) {
            newSelected.delete(leadId);
        } else {
            newSelected.add(leadId);
        }
        setSelectedLeads(newSelected);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leads</h1>
                <p className="text-gray-600">Manage and track your incoming leads</p>
            </div>

            {/* Stats Cards - Premium glass style */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">New</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.new}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Contacted</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.contacted}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-amber-500/10 to-amber-600/10 flex items-center justify-center border border-amber-200/50">
                                <Phone className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Quoted</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.quoted}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center border border-purple-200/50">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Booked</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.booked}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-green-500/10 to-green-600/10 flex items-center justify-center border border-green-200/50">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Lost</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">{stats.lost}</p>
                            </div>
                            <div className="h-10 w-10 rounded-lg bg-linear-to-br from-red-500/10 to-red-600/10 flex items-center justify-center border border-red-200/50">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls - Clean, modern */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search leads by name, email, phone, service..."
                            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-45 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-45 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                            <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bulk Actions - Glass panel */}
            {selectedLeads.size > 0 && (
                <div className="p-4 bg-linear-to-br from-blue-50/80 to-white backdrop-blur-sm border border-blue-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-blue-900">
                            {selectedLeads.size} lead{selectedLeads.size > 1 ? "s" : ""} selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLeads(new Set())}
                            className="text-blue-700 hover:text-blue-800 hover:bg-blue-100/50"
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Select onValueChange={handleBulkStatusUpdate}>
                            <SelectTrigger className="w-50 border-blue-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white">
                                <SelectValue placeholder="Update status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="contacted">Mark as Contacted</SelectItem>
                                <SelectItem value="quoted">Mark as Quoted</SelectItem>
                                <SelectItem value="booked">Mark as Booked</SelectItem>
                                <SelectItem value="lost">Mark as Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Leads Table - Modern card */}
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
                                            } else {
                                                setSelectedLeads(new Set());
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">Lead</TableHead>
                                <TableHead className="font-semibold text-gray-700">Service</TableHead>
                                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                                <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                                <TableHead className="font-semibold text-gray-700">Received</TableHead>
                                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12">
                                        {leads.length === 0 ? (
                                            <div className="text-center">
                                                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                                    <Users className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 mb-2">No leads yet</p>
                                                <p className="text-sm text-gray-600">
                                                    Share your form link to start receiving leads
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                    <Search className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-semibold text-gray-900 mb-2">No matching leads</p>
                                                <p className="text-sm text-gray-600">
                                                    Try adjusting your search or filters
                                                </p>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <TableRow
                                        key={lead.id}
                                        className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                                    >
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedLeads.has(lead.id)}
                                                onChange={() => toggleLeadSelection(lead.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{lead.name}</span>
                                                <span className="text-sm text-gray-500">{lead.email}</span>
                                                <span className="text-sm text-gray-500">{lead.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900">{lead.service_type}</div>
                                            {lead.message && (
                                                <div className="text-sm text-gray-500 truncate max-w-50">
                                                    {lead.message.substring(0, 50)}
                                                    {lead.message.length > 50 ? "..." : ""}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-700">{lead.location}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Select
                                                value={lead.status}
                                                onValueChange={(value) => handleStatusUpdate(lead.id, value)}
                                            >
                                                <SelectTrigger className="w-32 h-8 border-0 bg-transparent focus:ring-0">
                                                    <SelectValue>
                                                        <Badge
                                                            className={cn(
                                                                "px-3 py-1 rounded-full border text-sm font-medium",
                                                                lead.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-300' : '',
                                                                lead.status === 'contacted' ? 'bg-amber-100 text-amber-800 border-amber-300' : '',
                                                                lead.status === 'quoted' ? 'bg-purple-100 text-purple-800 border-purple-300' : '',
                                                                lead.status === 'booked' ? 'bg-green-100 text-green-800 border-green-300' : '',
                                                                lead.status === 'lost' ? 'bg-red-100 text-red-800 border-red-300' : '',
                                                            )}
                                                        >
                                                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                        </Badge>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="contacted">Contacted</SelectItem>
                                                    <SelectItem value="quoted">Quoted</SelectItem>
                                                    <SelectItem value="booked">Booked</SelectItem>
                                                    <SelectItem value="lost">Lost</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Badge className={cn("px-3 py-1 rounded-full border", priorityColors[lead.priority] || "bg-gray-100 text-gray-800 border-gray-300")}>
                                                {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                                            </Badge>
                                            {lead.tags && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {lead.tags.split(',').slice(0, 2).map((tag, index) => (
                                                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                            {tag.trim()}
                                                        </span>
                                                    ))}
                                                    {lead.tags.split(',').length > 2 && (
                                                        <span className="text-xs text-gray-400">
                                                            +{lead.tags.split(',').length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-700">{formatDate(lead.created_at)}</div>
                                            <div className="text-xs text-gray-500">{getTimeAgo(lead.created_at)}</div>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl p-1.5">
                                                    <DropdownMenuItem onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}>
                                                        <User className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, 'contacted')}>
                                                        <MessageSquare className="h-4 w-4 mr-2" />
                                                        Mark as Contacted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(lead.id, 'booked')}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark as Booked
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Pipeline Visualization */}
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">Lead Pipeline</CardTitle>
                    <CardDescription className="text-gray-600">
                        Visual representation of your leads through the pipeline
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between h-8 bg-gray-100 rounded-full overflow-hidden">
                        {[
                            { status: "new", count: stats.new, color: "bg-blue-500" },
                            { status: "contacted", count: stats.contacted, color: "bg-amber-500" },
                            { status: "quoted", count: stats.quoted, color: "bg-purple-500" },
                            { status: "booked", count: stats.booked, color: "bg-green-500" },
                            { status: "lost", count: stats.lost, color: "bg-red-500" },
                        ].map((item, index) => (
                            <div
                                key={item.status}
                                className={`h-full ${item.color} transition-all duration-500`}
                                style={{
                                    width: `${(item.count / Math.max(stats.total, 1)) * 100}%`,
                                }}
                                title={`${item.status.charAt(0).toUpperCase() + item.status.slice(1)}: ${item.count}`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-between mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> New: {stats.new}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Contacted: {stats.contacted}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Quoted: {stats.quoted}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Booked: {stats.booked}</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Lost: {stats.lost}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}