/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/calendar/calendar-dashboard.tsx
"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths, isSameDay, isValid } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
    ChevronLeft,
    ChevronRight,
    Mail,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";

// Safe date parsing function
const safeParseDate = (dateString: string | Date | null | undefined): Date | null => {
    if (!dateString) return null;

    try {
        const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
        return isValid(date) ? date : null;
    } catch (error) {
        console.error("Failed to parse date:", dateString, error);
        return null;
    }
};

// Safe date formatting function
const safeFormatDate = (dateString: string | Date | null | undefined, formatString: string): string => {
    const date = safeParseDate(dateString);
    if (!date) return "Invalid date";
    return format(date, formatString);
};

interface CalendarEvent {
    id: string;
    title: string;
    description: string;
    event_type: string;
    start_time: string;
    end_time: string;
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
    unscheduledLeads: Lead[];
    scheduledLeads: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        service_type: string;
        lead_status: string;
        event_id: string;
        event_title: string;
        event_status: string;
        event_start_time: string;
        event_end_time: string;
        event_type: string;
    }>;
    upcomingEvents: any[];
    businessId: string;
    userEmail: string;
    userName: string;
}

const eventTypeColors: Record<string, string> = {
    appointment: "border-blue-300 bg-blue-50 text-blue-700",
    followup: "border-green-300 bg-green-50 text-green-700",
    meeting: "border-purple-300 bg-purple-50 text-purple-700",
    task: "border-amber-300 bg-amber-50 text-amber-700",
};

const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    confirmed: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-gray-100 text-gray-600 border-gray-300",
};

const calendarStatusColors: Record<string, string> = {
    scheduled: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
    confirmed: "bg-green-50 text-green-800 border-l-4 border-green-500",
    completed: "bg-purple-50 text-purple-800 border-l-4 border-purple-500",
    cancelled: "bg-gray-50 text-gray-500 border-l-4 border-gray-400 line-through",
};

export default function CalendarDashboard({
    events: initialEvents,
    unscheduledLeads,
    scheduledLeads,
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
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        event_type: "appointment",
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        location: "",
        lead_id: "",
        participants: [] as string[],
        reminders: [] as any[]
    });

    // Get event status color
    const getEventColor = (event: CalendarEvent) => {
        return calendarStatusColors[event.status] ||
            eventTypeColors[event.event_type] ||
            "bg-gray-50 text-gray-800 border-l-4 border-gray-300";
    };

    // Validate and filter events
    const validEvents = events.filter(event => {
        const startDate = safeParseDate(event.start_time);
        const endDate = safeParseDate(event.end_time);
        return startDate !== null && endDate !== null;
    });

    // Calculate calendar days for month view
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get events for a specific day
    const getEventsForDay = (day: Date) => {
        return validEvents.filter(event => {
            const eventDate = safeParseDate(event.start_time);
            if (!eventDate) return false;
            return isSameDay(eventDate, day);
        });
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

    const allLeadsForDropdown = [
        ...unscheduledLeads.map(lead => ({
            ...lead,
            isScheduled: false
        })),
        ...scheduledLeads.map(lead => ({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            service_type: lead.service_type,
            status: lead.lead_status,
            isScheduled: true,
            scheduledEventId: lead.event_id
        }))
    ];

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
                    start_time: new Date().toISOString().slice(0, 16),
                    end_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                    location: "",
                    lead_id: "",
                    participants: [],
                    reminders: []
                });
                toast({
                    title: "Event created",
                    description: "Your event has been scheduled successfully",
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || "Failed to create event");
            }
        } catch (error) {
            console.error("Create event error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create event",
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
            console.error("Update event error:", error);
            toast({
                title: "Error",
                description: "Failed to update event",
                variant: "destructive",
            });
        }
    };

    // Debug function to check events
    const debugEvents = () => {
        console.log("=== EVENTS DEBUG ===");
        console.log("Total events:", events.length);
        console.log("Valid events:", validEvents.length);
        events.forEach((event, index) => {
            const startDate = safeParseDate(event.start_time);
            const endDate = safeParseDate(event.end_time);
            console.log(`Event ${index + 1}:`, {
                id: event.id,
                title: event.title,
                start_time: event.start_time,
                start_date_valid: startDate ? "Valid" : "Invalid",
                end_time: event.end_time,
                end_date_valid: endDate ? "Valid" : "Invalid",
            });
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
                    <p className="text-gray-600">Schedule and manage appointments</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={goToToday}
                        className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                    >
                        Today
                    </Button>
                    <div className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToPreviousMonth}
                            className="rounded-l-xl rounded-r-none px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-medium px-4 py-2 text-gray-900 min-w-32 text-center border-x border-gray-200">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToNextMonth}
                            className="rounded-r-xl rounded-l-none px-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Event
                    </Button>
                    {process.env.NODE_ENV === 'development' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={debugEvents}
                            className="border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                        >
                            Debug
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-3 items-center p-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {Object.entries(statusColors).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className={cn("w-3 h-3 rounded-full", color.split(' ')[0])} />
                        <span className="text-sm text-gray-700 capitalize">{status}</span>
                    </div>
                ))}
            </div>

            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && events.length > 0 && (
                <div className="p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl text-sm">
                    <p className="text-amber-800">
                        <strong>Debug Info:</strong> {events.length} total events, {validEvents.length} valid events
                        {events.length !== validEvents.length && (
                            <span className="text-red-600"> (Some events have invalid dates)</span>
                        )}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-2">
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardContent className="p-0">
                            {/* Calendar Grid */}
                            <div className="p-6">
                                {/* Day headers */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar days */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarDays.map(day => {
                                        const dayEvents = getEventsForDay(day);
                                        const isCurrentMonth = isSameMonth(day, currentDate);
                                        const isTodayDate = isToday(day);

                                        return (
                                            <div
                                                key={day.toString()}
                                                className={cn(
                                                    "min-h-32 p-2 border rounded-xl transition-all",
                                                    isCurrentMonth
                                                        ? "bg-white hover:bg-gray-50/50"
                                                        : "bg-gray-50/50 text-gray-400",
                                                    isTodayDate
                                                        ? "border-blue-300 shadow-sm"
                                                        : "border-gray-200"
                                                )}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        isTodayDate ? "text-blue-600" : "text-gray-700",
                                                        !isCurrentMonth && "text-gray-400"
                                                    )}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {isTodayDate && (
                                                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                    )}
                                                </div>

                                                {/* Events for this day */}
                                                <div className="space-y-1.5">
                                                    {dayEvents.slice(0, 3).map(event => {
                                                        const eventDate = safeParseDate(event.start_time);
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                className={cn(
                                                                    "text-xs p-2 rounded-lg cursor-pointer transition-all",
                                                                    getEventColor(event),
                                                                    "hover:shadow-md"
                                                                )}
                                                                onClick={() => {
                                                                    setSelectedEvent(event);
                                                                    setIsEventDialogOpen(true);
                                                                }}
                                                            >
                                                                <div className="font-medium truncate flex items-center justify-between">
                                                                    <span className="truncate">{event.title}</span>
                                                                    <Badge
                                                                        className={cn(
                                                                            "text-[10px] px-1.5 py-0.5 rounded-full border ml-1 shrink-0",
                                                                            statusColors[event.status]
                                                                        )}
                                                                    >
                                                                        {event.status}
                                                                    </Badge>
                                                                </div>
                                                                {eventDate && (
                                                                    <div className="flex items-center text-[10px] mt-1 text-gray-600">
                                                                        <Clock className="h-2.5 w-2.5 mr-1" />
                                                                        {format(eventDate, 'h:mm a')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                                <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                                </div>
                                Upcoming Events
                            </CardTitle>
                            <CardDescription className="text-gray-600">Next 20 events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {upcomingEvents.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <CalendarIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600">No upcoming events</p>
                                    </div>
                                ) : (
                                    upcomingEvents
                                        .filter(event => {
                                            const eventDate = safeParseDate(event.start_time);
                                            return eventDate !== null;
                                        })
                                        .map(event => {
                                            const eventDate = safeParseDate(event.start_time);
                                            return (
                                                <div
                                                    key={event.id}
                                                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 hover:border-gray-300 cursor-pointer transition-all"
                                                    onClick={() => {
                                                        const fullEvent = events.find(e => e.id === event.id);
                                                        if (fullEvent) {
                                                            setSelectedEvent(fullEvent);
                                                            setIsEventDialogOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">{event.title}</div>
                                                            {eventDate && (
                                                                <div className="text-sm text-gray-500 mt-1">
                                                                    {format(eventDate, 'EEE, MMM d • h:mm a')}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge className={cn("rounded-full px-2.5 py-1 text-xs font-medium", eventTypeColors[event.event_type])}>
                                                            {event.event_type}
                                                        </Badge>
                                                    </div>
                                                    {event.lead_name && (
                                                        <div className="text-sm text-gray-600 mt-2 flex items-center">
                                                            <User className="h-3 w-3 mr-1.5 text-gray-400" />
                                                            With {event.lead_name}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Schedule */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-xl font-semibold text-gray-900">
                                <span>Quick Schedule</span>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-full px-3 py-1">
                                    {unscheduledLeads.length} leads
                                </Badge>
                            </CardTitle>
                            <CardDescription className="text-gray-600">Leads without scheduled appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {unscheduledLeads.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                            <CalendarIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="text-gray-600">All leads are scheduled!</p>
                                    </div>
                                ) : (
                                    unscheduledLeads.slice(0, 5).map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-all">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">{lead.name}</div>
                                                <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                                    <span className="truncate">{lead.service_type}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className="ml-2 text-xs border-gray-300 rounded-full px-2 py-0.5"
                                                    >
                                                        {lead.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="shrink-0 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-lg ml-2"
                                                onClick={() => {
                                                    const now = new Date();
                                                    const tomorrow = new Date(now);
                                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                                    tomorrow.setHours(10, 0, 0, 0);

                                                    const endTime = new Date(tomorrow);
                                                    endTime.setHours(11, 0, 0, 0);

                                                    setNewEvent({
                                                        ...newEvent,
                                                        title: `Meeting with ${lead.name}`,
                                                        lead_id: lead.id,
                                                        participants: [lead.email, userEmail],
                                                        start_time: tomorrow.toISOString().slice(0, 16),
                                                        end_time: endTime.toISOString().slice(0, 16)
                                                    });
                                                    setIsCreateDialogOpen(true);
                                                }}
                                            >
                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                Schedule
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Scheduled Leads Section */}
                    <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-xl font-semibold text-gray-900">
                                <span>Scheduled Leads</span>
                                <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full px-3 py-1">
                                    {scheduledLeads.length} scheduled
                                </Badge>
                            </CardTitle>
                            <CardDescription className="text-gray-600">Leads with scheduled appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {scheduledLeads.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <CalendarIcon className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600">No scheduled leads yet</p>
                                    </div>
                                ) : (
                                    scheduledLeads.slice(0, 5).map(lead => {
                                        const eventDate = safeParseDate(lead.event_start_time);
                                        return (
                                            <div
                                                key={lead.event_id}
                                                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50/50 hover:border-gray-300 cursor-pointer transition-all"
                                                onClick={() => {
                                                    const fullEvent = events.find(e => e.id === lead.event_id);
                                                    if (fullEvent) {
                                                        setSelectedEvent(fullEvent);
                                                        setIsEventDialogOpen(true);
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-gray-900 truncate">{lead.name}</div>
                                                        <div className="text-sm text-gray-500 truncate mt-0.5">
                                                            {lead.service_type}
                                                        </div>
                                                    </div>
                                                    <Badge className={cn("rounded-full px-2.5 py-1 text-xs font-medium", statusColors[lead.event_status])}>
                                                        {lead.event_status}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center justify-between text-sm mt-2">
                                                    <div className="flex items-center text-gray-600">
                                                        <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                                        {eventDate ? format(eventDate, 'MMM d, h:mm a') : 'Invalid date'}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs border-gray-300 rounded-full px-2 py-0.5">
                                                        {lead.event_type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Event Detail Dialog */}
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-6">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center justify-between text-xl font-semibold text-gray-900">
                                    <span className="truncate pr-4">{selectedEvent.title}</span>
                                    <Badge className={cn("rounded-full px-3 py-1.5 text-xs font-medium", statusColors[selectedEvent.status])}>
                                        {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="flex items-center gap-2 mt-2 text-gray-600">
                                    <Badge className={cn("rounded-full px-3 py-1.5 text-xs font-medium", eventTypeColors[selectedEvent.event_type])}>
                                        {selectedEvent.event_type}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        Created by {userName}
                                    </span>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 py-4">
                                {/* Event Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700">Time</Label>
                                        <div className="flex flex-col text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                                                <span className="text-sm">{safeFormatDate(selectedEvent.start_time, 'PPpp')}</span>
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <span className="ml-6 text-sm text-gray-500">to</span>
                                                <span className="ml-2 text-sm">{safeFormatDate(selectedEvent.end_time, 'pp')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedEvent.location && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Location</Label>
                                            <div className="flex items-center text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                                                <span className="text-sm">{selectedEvent.location}</span>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.lead_name && (
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Lead</Label>
                                            <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-200">
                                                <div className="flex items-center min-w-0">
                                                    <User className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                                                    <div className="truncate">
                                                        <div className="font-medium text-gray-900 truncate">{selectedEvent.lead_name}</div>
                                                        <div className="text-sm text-gray-500 truncate">{selectedEvent.lead_email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0 ml-2">
                                                    {selectedEvent.lead_email && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => window.open(`mailto:${selectedEvent.lead_email}`)}
                                                            className="h-8 w-8 p-0 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <Mail className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedEvent.description && (
                                        <div className="col-span-1 md:col-span-2 space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                                            <div className="text-gray-700 whitespace-pre-wrap bg-gray-50/50 p-3 rounded-xl border border-gray-200 text-sm">
                                                {selectedEvent.description}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-gray-700 shrink-0">Status:</Label>
                                        <Select
                                            value={selectedEvent.status}
                                            onValueChange={(value) =>
                                                handleUpdateEvent(selectedEvent.id, { status: value })
                                            }
                                        >
                                            <SelectTrigger className="w-40 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEventDialogOpen(false)}
                                            className="border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                                        >
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
                <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">Create New Event</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Schedule a new appointment, meeting, or task
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                    Title <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Meeting title"
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="event_type" className="text-sm font-medium text-gray-700">Event Type</Label>
                                <Select
                                    value={newEvent.event_type}
                                    onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                                >
                                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
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
                                <Label htmlFor="start_time" className="text-sm font-medium text-gray-700">
                                    Start Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="start_time"
                                    type="datetime-local"
                                    value={newEvent.start_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_time" className="text-sm font-medium text-gray-700">
                                    End Time <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="end_time"
                                    type="datetime-local"
                                    value={newEvent.end_time}
                                    onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="lead_id" className="text-sm font-medium text-gray-700">Link to Lead (Optional)</Label>
                                <Select
                                    value={newEvent.lead_id}
                                    onValueChange={(value) => {
                                        const lead = allLeadsForDropdown.find(l => l.id === value);
                                        setNewEvent({
                                            ...newEvent,
                                            lead_id: value,
                                            participants: lead ? [lead.email, userEmail] : [userEmail]
                                        });
                                    }}
                                >
                                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                        <SelectValue placeholder="Select a lead" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-80">
                                        <div className="max-h-60 overflow-auto">
                                            {/* Unscheduled Leads Section */}
                                            {unscheduledLeads.length > 0 && (
                                                <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                                    Available Leads ({unscheduledLeads.length})
                                                </div>
                                            )}
                                            {unscheduledLeads.map(lead => (
                                                <SelectItem key={lead.id} value={lead.id} className="py-2">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{lead.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">
                                                            {lead.service_type} • {lead.status}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}

                                            {/* Scheduled Leads Section */}
                                            {scheduledLeads.length > 0 && (
                                                <>
                                                    <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-t mt-1">
                                                        Already Scheduled ({scheduledLeads.length})
                                                    </div>
                                                    {scheduledLeads.map(lead => {
                                                        const eventDate = safeParseDate(lead.event_start_time);
                                                        return (
                                                            <SelectItem
                                                                key={lead.id}
                                                                value={lead.id}
                                                                className="py-2 text-gray-500"
                                                                disabled={lead.event_status === 'cancelled'}
                                                            >
                                                                <div className="flex-1">
                                                                    <div className="font-medium flex items-center text-gray-700">
                                                                        {lead.name}
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full border-gray-300"
                                                                            title={`Status: ${lead.event_status}`}
                                                                        >
                                                                            {lead.event_status}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                                        {lead.service_type}
                                                                        {eventDate && (
                                                                            <span className="ml-2">
                                                                                • Scheduled: {format(eventDate, 'MMM d')}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </>
                                            )}

                                            {allLeadsForDropdown.length === 0 && (
                                                <div className="px-2 py-4 text-sm text-gray-500 text-center">
                                                    No leads available
                                                </div>
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>

                                {newEvent.lead_id && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {(() => {
                                            const selectedLead = allLeadsForDropdown.find(l => l.id === newEvent.lead_id);
                                            if (selectedLead?.isScheduled) {
                                                return (
                                                    <div className="flex items-center text-amber-700 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                                                        <svg className="w-4 h-4 mr-1.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        This lead already has a scheduled appointment
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                                <Input
                                    id="location"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    placeholder="Virtual meeting, Office, etc."
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Add meeting agenda, notes, or instructions..."
                                    rows={3}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="border-2 border-gray-300 hover:border-gray-400 rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateEvent}
                                disabled={!newEvent.title || !newEvent.start_time || !newEvent.end_time}
                                className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                            >
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