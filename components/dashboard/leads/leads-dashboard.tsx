// components/dashboard/leads/leads-dashboard.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Calendar,
    User,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
    { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
    { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
    { value: "quoted", label: "Quoted", color: "bg-purple-100 text-purple-800" },
    { value: "booked", label: "Booked", color: "bg-green-100 text-green-800" },
    { value: "lost", label: "Lost", color: "bg-red-100 text-red-800" },
];

const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
};

export default function LeadsDashboard({ leads, stats, businessId }: LeadsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    // Filter leads based on search and filters
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
        try {
            const response = await fetch(`/api/leads/${leadId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                toast({
                    title: "Status updated",
                    description: "Lead status has been updated successfully",
                });
                // Refresh the page to show updated data
                setTimeout(() => window.location.reload(), 500);
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Lead Dashboard</h1>
                        <p className="text-gray-600">Manage and track your incoming leads</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                        <p className="text-2xl font-bold">{stats.total}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">New</p>
                                        <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Contacted</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Phone className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Quoted</p>
                                        <p className="text-2xl font-bold text-purple-600">{stats.quoted}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Booked</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.booked}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Lost</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search leads by name, email, phone, service..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-45">
                                    <Filter className="h-4 w-4 mr-2" />
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
                                <SelectTrigger className="w-45">
                                    <Filter className="h-4 w-4 mr-2" />
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

                    {/* Bulk Actions */}
                    {selectedLeads.size > 0 && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {selectedLeads.size} lead{selectedLeads.size > 1 ? "s" : ""} selected
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLeads(new Set())}
                                >
                                    Clear
                                </Button>
                            </div>
                            <div className="flex gap-2">
                                <Select onValueChange={handleBulkStatusUpdate}>
                                    <SelectTrigger className="w-50">
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

                    {/* Leads Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
                                                        } else {
                                                            setSelectedLeads(new Set());
                                                        }
                                                    }}
                                                />
                                            </TableHead>
                                            <TableHead>Lead</TableHead>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Received</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLeads.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                    {leads.length === 0 ? (
                                                        <div className="text-center">
                                                            <p className="text-lg font-medium">No leads yet</p>
                                                            <p className="text-sm text-gray-400 mt-2">
                                                                Share your form link to start receiving leads
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <p className="text-lg font-medium">No matching leads</p>
                                                            <p className="text-sm text-gray-400 mt-2">
                                                                Try adjusting your search or filters
                                                            </p>
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredLeads.map((lead) => (
                                                <TableRow key={lead.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300"
                                                            checked={selectedLeads.has(lead.id)}
                                                            onChange={() => toggleLeadSelection(lead.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <div className="font-medium">{lead.name}</div>
                                                            <div className="text-sm text-gray-500">{lead.email}</div>
                                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{lead.service_type}</div>
                                                        {lead.message && (
                                                            <div className="text-sm text-gray-500 truncate max-w-50">
                                                                {lead.message.substring(0, 50)}
                                                                {lead.message.length > 50 ? "..." : ""}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{lead.location}</TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={lead.status}
                                                            onValueChange={(value) => handleStatusUpdate(lead.id, value)}
                                                        >
                                                            <SelectTrigger className="w-32.5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`
                                    ${lead.status === 'new' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${lead.status === 'quoted' ? 'bg-purple-100 text-purple-800' : ''}
                                    ${lead.status === 'booked' ? 'bg-green-100 text-green-800' : ''}
                                    ${lead.status === 'lost' ? 'bg-red-100 text-red-800' : ''}
                                  `}
                                                                >
                                                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                                                </Badge>
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
                                                    <TableCell>
                                                        <Badge className={priorityColors[lead.priority] || "bg-gray-100 text-gray-800"}>
                                                            {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                                                        </Badge>
                                                        {lead.tags && (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {lead.tags.split(',').slice(0, 2).map((tag, index) => (
                                                                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                        {tag}
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
                                                        <div className="text-sm">{formatDate(lead.created_at)}</div>
                                                        <div className="text-xs text-gray-500">{getTimeAgo(lead.created_at)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
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
                        </CardContent>
                    </Card>

                    {/* Stats Summary */}
                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Pipeline</CardTitle>
                                <CardDescription>
                                    Visual representation of your leads through the pipeline
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between h-8 bg-gray-100 rounded-lg overflow-hidden">
                                    {[
                                        { status: "new", count: stats.new, color: "bg-blue-500" },
                                        { status: "contacted", count: stats.contacted, color: "bg-yellow-500" },
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
                                <div className="flex justify-between mt-2 text-sm text-gray-600">
                                    <span>New: {stats.new}</span>
                                    <span>Contacted: {stats.contacted}</span>
                                    <span>Quoted: {stats.quoted}</span>
                                    <span>Booked: {stats.booked}</span>
                                    <span>Lost: {stats.lost}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}