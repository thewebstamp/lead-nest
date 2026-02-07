/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/calendar/calendar-dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths, isSameDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MapPin,
    Users,
    Bell,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Phone,
    Mail,
    Video,
    User,
    Building
} from "lucide-react";

interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    event_type: string;
    start_time: Date;
    end_time: Date;
    status: string;
    location: string;
    lead_id: string | null;
    lead_name: string | null;
    lead_email: string | null;
    participants: any;
    reminders: any;
}

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    service_type: string;
    status: string;
    priority: string;
}

interface CalendarDashboardProps {
    events: CalendarEvent[];
    leads: Lead[];
    upcomingEvents: any[];
    businessId: string;
    userEmail: string;
    userName: string;
}

const eventTypeColors: Record<string, string> = {
    appointment: "bg-blue-100 text-blue-800 border-blue-300",
    followup: "bg-green-100 text-green-800 border-green-300",
    meeting: "bg-purple-100 text-purple-800 border-purple-300",
    task: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const statusColors: Record<string, string> = {
    scheduled: "bg-gray-100 text-gray-800",
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function CalendarDashboard({
    events: initialEvents,
    leads,
    upcomingEvents,
    businessId,
    userEmail,
    userName
}: CalendarDashboardProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [view, setView] = useState<"month" | "week" | "day">("month");
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        event_type: "appointment",
        start_time: "",
        end_time: "",
        location: "",
        lead_id: "",
        participants: [] as string[],
        reminders: [] as any[]
    });

    // Calculate calendar days for month view
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return events.filter(event =>
            isSameDay(parseISO(event.start_time.toString()), day)
        );
    };

    // Handle navigation
    const goToPreviousMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Handle event creation
    const handleCreateEvent = async () => {
        try {
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newEvent,
                    business_id: businessId
                }),
            });

            if (response.ok) {
                const createdEvent = await response.json();
                setEvents([...events, createdEvent]);
                setIsCreateDialogOpen(false);
                setNewEvent({
                    title: "",
                    description: "",
                    event_type: "appointment",
                    start_time: "",
                    end_time: "",
                    location: "",
                    lead_id: "",
                    participants: [],
                    reminders: []
                });
                toast({
                    title: "Event created",
                    description: "Your event has been scheduled successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create event",
                variant: "destructive",
            });
        }
    };

    // Handle event update
    const handleUpdateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedEvent = await response.json();
                setEvents(events.map(event =>
                    event.id === eventId ? updatedEvent : event
                ));
                setSelectedEvent(updatedEvent);
                toast({
                    title: "Event updated",
                    description: "Your event has been updated successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update event",
                variant: "destructive",
            });
        }
    };

    // Handle event deletion
    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const response = await fetch(`/api/calendar/events/${eventId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setEvents(events.filter(event => event.id !== eventId));
                setSelectedEvent(null);
                toast({
                    title: "Event deleted",
                    description: "Your event has been deleted successfully",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete event",
                variant: "destructive",
            });
        }
    };

    // Send event reminder
    const sendReminder = async (eventId: string, reminderType: string) => {
        try {
            const response = await fetch(`/api/calendar/events/${eventId}/reminders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reminder_type: reminderType }),
            });

            if (response.ok) {
                toast({
                    title: "Reminder sent",
                    description: `Reminder sent via ${reminderType}`,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send reminder",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-600">Schedule and manage appointments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={goToToday}>
                        Today
                    </Button>
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-medium mx-4 min-w-32 text-center">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select value={view} onValueChange={(v: any) => setView(v)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="View" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardContent className="p-0">
                            {/* Calendar Grid */}
                            <div className="p-6">
                                {/* Day headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar days */}
                                <div className="grid grid-cols-7 gap-1">
                                    {calendarDays.map(day => {
                                        const dayEvents = getEventsForDay(day);
                                        const isCurrentMonth = isSameMonth(day, currentDate);
                                        const isTodayDate = isToday(day);

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={`
                                                    min-h-32 p-2 border rounded-lg
                                                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                                                    ${isTodayDate ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
                                                `}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`
                                                        font-medium text-sm
                                                        ${isTodayDate ? 'text-blue-600 font-bold' : ''}
                                                        ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                                                    `}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {isTodayDate && (
                                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                    )}
                                                </div>

                                                {/* Events for this day */}
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 3).map(event => (
                                                        <div
                                                            key={event.id}
                                                            className={`
                                                                text-xs p-1 rounded truncate cursor-pointer
                                                                ${eventTypeColors[event.event_type] || 'bg-gray-100'}
                                                                border
                                                            `}
                                                            onClick={() => {
                                                                setSelectedEvent(event);
                                                                setIsEventDialogOpen(true);
                                                            }}
                                                        >
                                                            <div className="font-medium truncate">{event.title}</div>
                                                            <div className="flex items-center text-xs">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {format(parseISO(event.start_time.toString()), 'h:mm a')}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <div className="text-xs text-gray-500 pl-1">
                                                            +{dayEvents.length - 3} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Upcoming Events
                            </CardTitle>
                            <CardDescription>Next 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No upcoming events</p>
                                ) : (
                                    upcomingEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                const fullEvent = events.find(e => e.id === event.id);
                                                if (fullEvent) {
                                                    setSelectedEvent(fullEvent);
                                                    setIsEventDialogOpen(true);
                                                }
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium">{event.title}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {format(parseISO(event.start_time.toString()), 'EEE, MMM d • h:mm a')}
                                                    </div>
                                                </div>
                                                <Badge className={eventTypeColors[event.event_type]}>
                                                    {event.event_type}
                                                </Badge>
                                            </div>
                                            {event.lead_name && (
                                                <div className="text-sm text-gray-600 mt-1 flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    With {event.lead_name}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Schedule</CardTitle>
                            <CardDescription>Schedule with leads</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {leads.slice(0, 5).map(lead => (
                                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-medium">{lead.name}</div>
                                            <div className="text-sm text-gray-500">{lead.service_type}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setNewEvent({
                                                    ...newEvent,
                                                    title: `Meeting with ${lead.name}`,
                                                    lead_id: lead.id,
                                                    participants: [lead.email],
                                                    start_time: `${new Date().toISOString().split('T')[0]}T10:00`,
                                                    end_time: `${new Date().toISOString().split('T')[0]}T11:00`
                                                });
                                                setIsCreateDialogOpen(true);
                                            }}
                                        >
                                            <CalendarIcon className="h-4 w-4 mr-2" />
                                            Schedule
                                        </Button>
                                    </div>
                                ))}
                                {leads.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No leads available for scheduling</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event Detail Dialog */}
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                    <span>{selectedEvent.title}</span>
                                    <Badge className={statusColors[selectedEvent.status]}>
                                        {selectedEvent.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge className={eventTypeColors[selectedEvent.event_type]}>
                                            {selectedEvent.event_type}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            Created by {userName}
                                        </span>
                                    </div>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Event Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium">Time</Label>
                                        <div className="flex items-center text-gray-700">
                                            <Clock className="h-4 w-4 mr-2" />
                                            {format(parseISO(selectedEvent.start_time.toString()), 'PPpp')}
                                            <span className="mx-2">to</span>
                                            {format(parseISO(selectedEvent.end_time.toString()), 'pp')}
                                        </div>
                                    </div>

                                    {selectedEvent.location && (
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Location</Label>
                                            <div className="flex items-center text-gray-700">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {selectedEvent.location}
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.lead_name && (
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Lead</Label>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2" />
                                                    <div>
                                                        <div className="font-medium">{selectedEvent.lead_name}</div>
                                                        <div className="text-sm text-gray-500">{selectedEvent.lead_email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => window.open(`tel:${selectedEvent.lead_email}`)}>
                                                        <Phone className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => window.open(`mailto:${selectedEvent.lead_email}`)}>
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.description && (
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-sm font-medium">Description</Label>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {selectedEvent.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between pt-4 border-t">
                                    <div className="flex gap-2">
                                        <Select
                                            value={selectedEvent.status}
                                            onValueChange={(value) =>
                                                handleUpdateEvent(selectedEvent.id, { status: value })
                                            }
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            onClick={() => sendReminder(selectedEvent.id, 'email')}
                                        >
                                            <Bell className="h-4 w-4 mr-2" />
                                            Send Reminder
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDeleteEvent(selectedEvent.id)}
                                            className="text-red-600"
                                        >
                                            Delete
                                        </Button>
                                        <Button onClick={() => setIsEventDialogOpen(false)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Event Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Event</DialogTitle>
                        <DialogDescription>
                            Schedule a new appointment, meeting, or task
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Meeting title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_type">Event Type</Label>
                                <Select
                                    value={newEvent.event_type}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="appointment">Appointment</SelectItem>
                                        <SelectItem value="followup">Follow-up</SelectItem>
                                        <SelectItem value="meeting">Meeting</SelectItem>
                                        <SelectItem value="task">Task</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="start_time">Start Time *</Label>
                                <Input
                                    id="start_time"
                                    type="datetime-local"
                                    value={newEvent.start_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_time">End Time *</Label>
                                <Input
                                    id="end_time"
                                    type="datetime-local"
                                    value={newEvent.end_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lead_id">Link to Lead (Optional)</Label>
                                <Select
                                    value={newEvent.lead_id}
                                    onValueChange={(value) => {
                                        const lead = leads.find(l => l.id === value);
                                        setNewEvent({
                                            ...newEvent,
                                            lead_id: value,
                                            participants: lead ? [lead.email, userEmail] : [userEmail]
                                        });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a lead" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leads.map(lead => (
                                            <SelectItem key={lead.id} value={lead.id}>
                                                {lead.name} ({lead.service_type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    placeholder="Virtual meeting, Office, etc."
                                />
                            </div>

                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add meeting agenda, notes, or instructions..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateEvent} disabled={!newEvent.title || !newEvent.start_time || !newEvent.end_time}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Event
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}