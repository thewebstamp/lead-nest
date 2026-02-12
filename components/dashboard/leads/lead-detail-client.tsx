// components/dashboard/leads/lead-detail-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Phone,
    Mail,
    MapPin,
    Calendar,
    User,
    MessageSquare,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    Paperclip,
    Send,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface LeadDetailClientProps {
    lead: {
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
        source: string;
        internal_notes: string;
    };
    notes: Array<{
        id: string;
        note: string;
        created_at: Date;
        user_id: string | null;
    }>;
    businessId: string;
}

const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 border-blue-300",
    contacted: "bg-amber-100 text-amber-800 border-amber-300",
    quoted: "bg-purple-100 text-purple-800 border-purple-300",
    booked: "bg-green-100 text-green-800 border-green-300",
    lost: "bg-red-100 text-red-800 border-red-300",
};

const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800 border-red-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-green-100 text-green-800 border-green-300",
};

export default function LeadDetailClient({ lead, notes, businessId }: LeadDetailClientProps) {
    const router = useRouter();
    const [newNote, setNewNote] = useState("");
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [currentNotes, setCurrentNotes] = useState(notes);
    const [internalNotes, setInternalNotes] = useState(lead.internal_notes || "");

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const response = await fetch(`/api/leads/bulk/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    leadIds: [lead.id],
                    status: newStatus,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Status updated",
                    description: `Lead marked as ${newStatus}`,
                });
                router.refresh();
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

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsSubmittingNote(true);
        try {
            const response = await fetch(`/api/leads/${lead.id}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ note: newNote }),
            });

            if (response.ok) {
                const newNoteData = await response.json();
                setCurrentNotes([newNoteData, ...currentNotes]);
                setNewNote("");
            }
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setIsSubmittingNote(false);
        }
    };

    const handleSaveInternalNotes = async () => {
        try {
            const response = await fetch(`/api/leads/${lead.id}/internal-notes`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ internalNotes }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Internal notes saved",
                });
                router.refresh();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to save internal notes",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to save internal notes:", error);
            toast({
                title: "Error",
                description: "Failed to save internal notes",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/dashboard/leads")}
                        className="mb-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Leads
                    </Button>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                            <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-700 text-white text-xl font-semibold">
                                {getInitials(lead.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{lead.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <Badge className={cn("px-3 py-1.5 rounded-full border", statusColors[lead.status])}>
                                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                </Badge>
                                <Badge className={cn("px-3 py-1.5 rounded-full border", priorityColors[lead.priority])}>
                                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(lead.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={lead.status} onValueChange={handleStatusUpdate}>
                        <SelectTrigger className="w-45 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                            <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="booked">Booked</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => window.open(`tel:${lead.phone}`)}
                        className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                    </Button>
                    <Button
                        onClick={() => window.open(`mailto:${lead.email}`)}
                        className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Lead Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Card */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <User className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="font-medium text-gray-900">{lead.name}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <Mail className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{lead.email}</div>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-blue-600 hover:text-blue-700"
                                            onClick={() => window.open(`mailto:${lead.email}`)}
                                        >
                                            Send Email
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <Phone className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{lead.phone}</div>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-blue-600 hover:text-blue-700"
                                            onClick={() => window.open(`tel:${lead.phone}`)}
                                        >
                                            Call Now
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                        <MapPin className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div className="font-medium text-gray-900">{lead.location}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Details */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Service Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Service Type</h4>
                                    <Badge variant="secondary" className="px-3 py-1.5 bg-gray-100 text-gray-800 border-gray-200 rounded-full">
                                        {lead.service_type}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Message</h4>
                                    <div className="p-4 bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-xl text-gray-700 whitespace-pre-wrap">
                                        {lead.message || "No message provided."}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Source</h4>
                                    <Badge variant="outline" className="px-3 py-1.5 border-gray-300 text-gray-700 rounded-full">
                                        {lead.source || "Form"}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes Section */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Notes</CardTitle>
                            <CardDescription className="text-gray-600">
                                Add notes and track communications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Add Note Form */}
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Add a note about this lead..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        rows={3}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="border-2 border-gray-300 hover:border-gray-400 rounded-lg">
                                                <Paperclip className="h-4 w-4 mr-2" />
                                                Attach
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim() || isSubmittingNote}
                                            className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                                        >
                                            {isSubmittingNote ? (
                                                <>
                                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Add Note
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Notes List */}
                                <div className="space-y-4">
                                    {currentNotes.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                <MessageSquare className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-600">No notes yet. Add your first note above.</p>
                                        </div>
                                    ) : (
                                        currentNotes.map((note) => (
                                            <div key={note.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback className="bg-linear-to-br from-gray-600 to-gray-700 text-white text-xs">
                                                            {note.user_id ? "U" : "S"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <div className="flex gap-1.25 items-center justify-between">
                                                            <span className="font-medium text-gray-900">
                                                                {note.user_id ? "You" : "System"}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(note.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                                                            {note.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Internal Notes */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Internal Notes</CardTitle>
                            <CardDescription className="text-gray-600">
                                Private notes for your team
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <Textarea
                                    placeholder="Add internal notes here..."
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    rows={6}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                                <Button
                                    onClick={handleSaveInternalNotes}
                                    disabled={internalNotes === (lead.internal_notes || "")}
                                    className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                                >
                                    Save Notes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Qualification Details */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Qualification</CardTitle>
                            <CardDescription className="text-gray-600">
                                Auto-qualification results
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Priority Score</h4>
                                    <Badge className={cn("px-3 py-1.5 rounded-full border", priorityColors[lead.priority])}>
                                        {lead.priority.toUpperCase()} PRIORITY
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {lead.tags ? (
                                            lead.tags.split(',').map((tag, index) => (
                                                <Badge key={index} variant="outline" className="px-3 py-1 border-gray-300 text-gray-700 rounded-full">
                                                    {tag.trim()}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No tags</span>
                                        )}
                                    </div>
                                </div>
                                {lead.qualification_notes && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Qualification Notes</h4>
                                        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            {lead.qualification_notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                                    onClick={() => handleStatusUpdate('contacted')}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Contacted
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-purple-600 hover:text-purple-600 rounded-xl"
                                    onClick={() => handleStatusUpdate('quoted')}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Mark as Quoted
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-green-600 hover:text-green-600 rounded-xl"
                                    onClick={() => handleStatusUpdate('booked')}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Mark as Booked
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-red-600 hover:text-red-600 rounded-xl"
                                    onClick={() => handleStatusUpdate('lost')}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Lost
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lead Age */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-gray-900">Lead Age</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Since creation</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}