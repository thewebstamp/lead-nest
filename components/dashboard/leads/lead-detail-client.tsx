// components/dashboard/leads/lead-detail-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Phone,
    Mail,
    MapPin,
    Calendar,
    User,
    MessageSquare,
    Tag,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    Paperclip,
    Send,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    quoted: "bg-purple-100 text-purple-800",
    booked: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
};

const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
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
            // Use bulk API for individual update as workaround
            const response = await fetch(`/api/leads/bulk/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    leadIds: [lead.id], // Single item array
                    status: newStatus,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Status updated",
                    description: `Lead marked as ${newStatus}`,
                });
                // Refresh the page to show updated data
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push("/dashboard/leads")}
                            className="mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Leads
                        </Button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge className={statusColors[lead.status]}>
                                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                    </Badge>
                                    <Badge className={priorityColors[lead.priority]}>
                                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        <Calendar className="inline h-4 w-4 mr-1" />
                                        {formatDate(lead.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={lead.status} onValueChange={handleStatusUpdate}>
                                    <SelectTrigger className="w-45">
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
                                <Button variant="outline" onClick={() => window.open(`tel:${lead.phone}`)}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                </Button>
                                <Button onClick={() => window.open(`mailto:${lead.email}`)}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Lead Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{lead.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{lead.email}</div>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto"
                                                    onClick={() => window.open(`mailto:${lead.email}`)}
                                                >
                                                    Send Email
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{lead.phone}</div>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto"
                                                    onClick={() => window.open(`tel:${lead.phone}`)}
                                                >
                                                    Call Now
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="font-medium">{lead.location}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Service Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-700">Service Type</h4>
                                            <Badge variant="secondary" className="mt-1">
                                                {lead.service_type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Customer Message</h4>
                                            <p className="mt-2 text-gray-600 whitespace-pre-wrap">
                                                {lead.message || "No message provided."}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Source</h4>
                                            <Badge variant="outline" className="mt-1">
                                                {lead.source || "Form"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notes</CardTitle>
                                    <CardDescription>Add notes and track communications</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Add Note Form */}
                                        <div className="space-y-2">
                                            <Textarea
                                                placeholder="Add a note about this lead..."
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                rows={3}
                                            />
                                            <div className="flex justify-between">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Paperclip className="h-4 w-4 mr-2" />
                                                        Attach
                                                    </Button>
                                                </div>
                                                <Button
                                                    onClick={handleAddNote}
                                                    disabled={!newNote.trim() || isSubmittingNote}
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
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                                    <p>No notes yet. Add your first note above.</p>
                                                </div>
                                            ) : (
                                                currentNotes.map((note) => (
                                                    <div key={note.id} className="border rounded-lg p-4">
                                                        <div className="flex items-start gap-3">
                                                            <Avatar>
                                                                <AvatarFallback>
                                                                    {note.user_id ? "U" : "S"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">
                                                                        {note.user_id ? "You" : "System"}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
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
                            <Card>
                                <CardHeader>
                                    <CardTitle>Internal Notes</CardTitle>
                                    <CardDescription>Private notes for your team</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="Add internal notes here..."
                                            value={internalNotes}
                                            onChange={(e) => setInternalNotes(e.target.value)}
                                            rows={6}
                                        />
                                        <Button
                                            onClick={handleSaveInternalNotes}
                                            disabled={internalNotes === (lead.internal_notes || "")}
                                        >
                                            Save Notes
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Qualification Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Qualification</CardTitle>
                                    <CardDescription>Auto-qualification results</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="font-medium text-gray-700">Priority Score</h4>
                                            <div className="mt-1">
                                                <Badge className={priorityColors[lead.priority]}>
                                                    {lead.priority.toUpperCase()} PRIORITY
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-700">Tags</h4>
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {lead.tags ? (
                                                    lead.tags.split(',').map((tag, index) => (
                                                        <Badge key={index} variant="outline">
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
                                                <h4 className="font-medium text-gray-700">Qualification Notes</h4>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {lead.qualification_notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start" onClick={() => handleStatusUpdate('contacted')}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Contacted
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" onClick={() => handleStatusUpdate('quoted')}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Mark as Quoted
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start" onClick={() => handleStatusUpdate('booked')}>
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Mark as Booked
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => handleStatusUpdate('lost')}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Mark as Lost
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lead Age */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lead Age</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {Math.floor((new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Since creation</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}