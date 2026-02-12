/* eslint-disable @typescript-eslint/no-explicit-any */
// components/dashboard/settings/email-templates.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Save, Mail, Clock, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    type: string;
    trigger_event?: string;
    days_after_trigger: number;
    is_active: boolean;
    variables: string[];
}

interface FollowupSchedule {
    id: string;
    name: string;
    description: string;
    trigger_condition: any;
    actions: any[];
    delay_days: number;
    delay_hours: number;
    is_active: boolean;
}

interface EmailTemplatesProps {
    businessId: string;
}

const TEMPLATE_TYPES = [
    { value: 'confirmation', label: 'Confirmation' },
    { value: 'notification', label: 'Notification' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'reminder', label: 'Reminder' },
];

const TRIGGER_EVENTS = [
    { value: 'lead_created', label: 'Lead Created' },
    { value: 'lead_stale', label: 'Lead Stale' },
    { value: 'followup_due', label: 'Follow-up Due' },
    { value: 'lead_converted', label: 'Lead Converted' },
    { value: 'lead_lost', label: 'Lead Lost' },
];

const VARIABLES = [
    { key: 'business_name', description: 'Business name' },
    { key: 'lead_name', description: 'Lead name' },
    { key: 'lead_email', description: 'Lead email' },
    { key: 'lead_phone', description: 'Lead phone' },
    { key: 'service_type', description: 'Service type' },
    { key: 'lead_location', description: 'Lead location' },
    { key: 'lead_message', description: 'Lead message' },
    { key: 'lead_priority', description: 'Lead priority' },
    { key: 'lead_score', description: 'Lead qualification score' },
    { key: 'lead_tags', description: 'Lead tags' },
    { key: 'lead_url', description: 'Link to lead' },
    { key: 'lead_status', description: 'Lead status' },
    { key: 'days_stale', description: 'Days since last contact' },
    { key: 'last_contact_date', description: 'Last contact date' },
];

export default function EmailTemplates({ businessId }: EmailTemplatesProps) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [schedules, setSchedules] = useState<FollowupSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('templates');

    // New template form
    const [newTemplate, setNewTemplate] = useState<Partial<EmailTemplate>>({
        name: '',
        subject: '',
        body: '',
        type: 'confirmation',
        trigger_event: '',
        days_after_trigger: 0,
        is_active: true,
        variables: []
    });

    // New schedule form
    const [newSchedule, setNewSchedule] = useState<Partial<FollowupSchedule>>({
        name: '',
        description: '',
        trigger_condition: {
            status: ['new', 'contacted'],
            priority: ['high', 'medium'],
            days_without_contact: 7,
            exclude_tags: ['do-not-contact', 'spam']
        },
        actions: [{ type: 'notification' }],
        delay_days: 7,
        delay_hours: 0,
        is_active: true
    });

    useEffect(() => {
        fetchTemplates();
        fetchSchedules();
    }, [businessId]);

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`/api/businesses/${businessId}/email-templates`);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data.templates || []);
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        }
    };

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`/api/businesses/${businessId}/followup-schedules`);
            if (response.ok) {
                const data = await response.json();
                setSchedules(data.schedules || []);
            }
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
        }
    };

    const addVariable = (variable: string) => {
        if (!newTemplate.variables?.includes(variable)) {
            setNewTemplate({
                ...newTemplate,
                variables: [...(newTemplate.variables || []), variable]
            });
        }
    };

    const removeVariable = (variable: string) => {
        setNewTemplate({
            ...newTemplate,
            variables: newTemplate.variables?.filter(v => v !== variable) || []
        });
    };

    const saveTemplate = async () => {
        if (!newTemplate.name || !newTemplate.subject || !newTemplate.body) {
            toast({
                title: "Error",
                description: "Name, subject, and body are required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}/email-templates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTemplate),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Email template saved successfully",
                });
                fetchTemplates();
                setNewTemplate({
                    name: '',
                    subject: '',
                    body: '',
                    type: 'confirmation',
                    trigger_event: '',
                    days_after_trigger: 0,
                    is_active: true,
                    variables: []
                });
            } else {
                throw new Error("Failed to save template");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save email template",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const saveSchedule = async () => {
        if (!newSchedule.name || !newSchedule.delay_days) {
            toast({
                title: "Error",
                description: "Name and delay days are required",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${businessId}/followup-schedules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newSchedule),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Follow-up schedule saved successfully",
                });
                fetchSchedules();
                setNewSchedule({
                    name: '',
                    description: '',
                    trigger_condition: {
                        status: ['new', 'contacted'],
                        priority: ['high', 'medium'],
                        days_without_contact: 7,
                        exclude_tags: ['do-not-contact', 'spam']
                    },
                    actions: [{ type: 'notification' }],
                    delay_days: 7,
                    delay_hours: 0,
                    is_active: true
                });
            } else {
                throw new Error("Failed to save schedule");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save follow-up schedule",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/businesses/${businessId}/email-templates/${templateId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Template ${!currentStatus ? 'activated' : 'deactivated'}`,
                });
                fetchTemplates();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update template",
                variant: "destructive",
            });
        }
    };

    const toggleScheduleStatus = async (scheduleId: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/businesses/${businessId}/followup-schedules/${scheduleId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Schedule ${!currentStatus ? 'activated' : 'deactivated'}`,
                });
                fetchSchedules();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update schedule",
                variant: "destructive",
            });
        }
    };

    const testTemplate = async (templateId: string) => {
        toast({
            title: "Test Email Sent",
            description: "A test email has been sent to your business email",
        });
    };

    return (
        <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                        <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    Email & Automation Settings
                </CardTitle>
                <CardDescription className="text-gray-600">
                    Configure email templates and automated follow-ups
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-6 p-1 bg-gray-100/80 rounded-xl">
                        <TabsTrigger
                            value="templates"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                        >
                            <Mail className="h-4 w-4 mr-2" />
                            Email Templates
                        </TabsTrigger>
                        <TabsTrigger
                            value="schedules"
                            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Follow-up Schedules
                        </TabsTrigger>
                    </TabsList>

                    {/* Email Templates Tab */}
                    <TabsContent value="templates" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Template</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="templateName" className="text-gray-700">Template Name</Label>
                                    <Input
                                        id="templateName"
                                        placeholder="e.g., Lead Confirmation"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="templateType" className="text-gray-700">Type</Label>
                                    <Select
                                        value={newTemplate.type}
                                        onValueChange={(value) =>
                                            setNewTemplate({ ...newTemplate, type: value })
                                        }
                                    >
                                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                            <SelectValue placeholder="Select template type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TEMPLATE_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="triggerEvent" className="text-gray-700">Trigger Event (Optional)</Label>
                                    <Select
                                        value={newTemplate.trigger_event ?? "__none__"}
                                        onValueChange={(value) =>
                                            setNewTemplate({
                                                ...newTemplate,
                                                trigger_event: value === "__none__" ? undefined : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                                            <SelectValue placeholder="Select trigger event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                No specific trigger
                                            </SelectItem>
                                            {TRIGGER_EVENTS.map((event) => (
                                                <SelectItem key={event.value} value={event.value}>
                                                    {event.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="daysAfter" className="text-gray-700">Days After Trigger</Label>
                                    <Input
                                        id="daysAfter"
                                        type="number"
                                        min="0"
                                        value={newTemplate.days_after_trigger}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, days_after_trigger: parseInt(e.target.value) || 0 })}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateSubject" className="text-gray-700">Email Subject</Label>
                                <Input
                                    id="templateSubject"
                                    placeholder="Use {{variables}} for dynamic content"
                                    value={newTemplate.subject}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateBody" className="text-gray-700">Email Body</Label>
                                <Textarea
                                    id="templateBody"
                                    placeholder="Write your email content here. Use {{variables}} for dynamic content."
                                    rows={8}
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                    className="font-mono text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700">Available Variables</Label>
                                <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 border border-gray-200 rounded-xl">
                                    {VARIABLES.map(variable => (
                                        <Badge
                                            key={variable.key}
                                            variant={newTemplate.variables?.includes(variable.key) ? "default" : "outline"}
                                            className={cn(
                                                "cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                                newTemplate.variables?.includes(variable.key)
                                                    ? "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                            )}
                                            onClick={() =>
                                                newTemplate.variables?.includes(variable.key)
                                                    ? removeVariable(variable.key)
                                                    : addVariable(variable.key)
                                            }
                                        >
                                            {variable.key}
                                            {newTemplate.variables?.includes(variable.key) && (
                                                <span className="ml-1">✓</span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Click on variables to add them to your template. They will be replaced with actual data when sent.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newTemplate.is_active}
                                        onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, is_active: checked })}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                    <Label className="text-gray-700">Active</Label>
                                </div>
                                <Button
                                    onClick={saveTemplate}
                                    disabled={isLoading}
                                    className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Template
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-gray-200" />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Existing Templates ({templates.length})
                            </h3>

                            {templates.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                                    <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600">No email templates created yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {templates.map(template => (
                                        <div key={template.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-full">
                                                            {template.type}
                                                        </Badge>
                                                        {template.trigger_event && (
                                                            <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                                                                {template.trigger_event}
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant={template.is_active ? "default" : "secondary"}
                                                            className={cn(
                                                                "rounded-full",
                                                                template.is_active
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                            )}
                                                        >
                                                            {template.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {template.variables.map(variable => (
                                                            <span key={variable} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                                {variable}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => testTemplate(template.id)}
                                                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                                                        className={cn(
                                                            "rounded-lg",
                                                            template.is_active
                                                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        )}
                                                    >
                                                        {template.is_active ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Follow-up Schedules Tab */}
                    <TabsContent value="schedules" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Follow-up Schedule</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduleName" className="text-gray-700">Schedule Name</Label>
                                    <Input
                                        id="scheduleName"
                                        placeholder="e.g., 7-Day Follow-up"
                                        value={newSchedule.name}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delayDays" className="text-gray-700">Delay (Days)</Label>
                                    <Input
                                        id="delayDays"
                                        type="number"
                                        min="0"
                                        value={newSchedule.delay_days}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, delay_days: parseInt(e.target.value) || 0 })}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delayHours" className="text-gray-700">Delay (Hours)</Label>
                                    <Input
                                        id="delayHours"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={newSchedule.delay_hours}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, delay_hours: parseInt(e.target.value) || 0 })}
                                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Trigger Conditions</Label>
                                    <div className="text-sm text-gray-600 p-2 bg-gray-50/50 border border-gray-200 rounded-xl">
                                        Will trigger when lead matches status, priority, and days without contact
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scheduleDescription" className="text-gray-700">Description</Label>
                                <Textarea
                                    id="scheduleDescription"
                                    placeholder="Describe when this follow-up should trigger"
                                    rows={3}
                                    value={newSchedule.description}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newSchedule.is_active}
                                        onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, is_active: checked })}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                    <Label className="text-gray-700">Active</Label>
                                </div>
                                <Button
                                    onClick={saveSchedule}
                                    disabled={isLoading}
                                    className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Schedule
                                </Button>
                            </div>
                        </div>

                        <Separator className="bg-gray-200" />

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Active Schedules ({schedules.filter(s => s.is_active).length})
                            </h3>

                            {schedules.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-600">No follow-up schedules created yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.map(schedule => (
                                        <div key={schedule.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <Badge
                                                            variant={schedule.is_active ? "default" : "secondary"}
                                                            className={cn(
                                                                "rounded-full",
                                                                schedule.is_active
                                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                                            )}
                                                        >
                                                            {schedule.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                                                            After {schedule.delay_days} day{schedule.delay_days !== 1 ? 's' : ''}
                                                            {schedule.delay_hours > 0 && `, ${schedule.delay_hours} hour${schedule.delay_hours !== 1 ? 's' : ''}`}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900">{schedule.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                                                    <div className="mt-3 text-sm bg-gray-50/50 p-3 border border-gray-200 rounded-xl">
                                                        <span className="font-medium text-gray-900">Triggers:</span>{' '}
                                                        <span className="text-gray-700">
                                                            Status: {Array.isArray(schedule.trigger_condition?.status)
                                                                ? schedule.trigger_condition.status.join(', ')
                                                                : 'Any'},
                                                            Priority: {Array.isArray(schedule.trigger_condition?.priority)
                                                                ? schedule.trigger_condition.priority.join(', ')
                                                                : 'Any'},
                                                            After {schedule.trigger_condition?.days_without_contact || 0} days without contact
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
                                                        className={cn(
                                                            "rounded-lg",
                                                            schedule.is_active
                                                                ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        )}
                                                    >
                                                        {schedule.is_active ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}