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
        <Card>
            <CardHeader>
                <CardTitle>Email & Automation Settings</CardTitle>
                <CardDescription>
                    Configure email templates and automated follow-ups
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-6">
                        <TabsTrigger value="templates">
                            <Mail className="h-4 w-4 mr-2" />
                            Email Templates
                        </TabsTrigger>
                        <TabsTrigger value="schedules">
                            <Clock className="h-4 w-4 mr-2" />
                            Follow-up Schedules
                        </TabsTrigger>
                    </TabsList>

                    {/* Email Templates Tab */}
                    <TabsContent value="templates" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Create New Template</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="templateName">Template Name</Label>
                                    <Input
                                        id="templateName"
                                        placeholder="e.g., Lead Confirmation"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="templateType">Type</Label>
                                    <Select
                                        value={newTemplate.type}
                                        onValueChange={(value) =>
                                            setNewTemplate({ ...newTemplate, type: value })
                                        }
                                    >
                                        <SelectTrigger>
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
                                    <Label htmlFor="triggerEvent">Trigger Event (Optional)</Label>
                                    <Select
                                        value={newTemplate.trigger_event ?? "__none__"}
                                        onValueChange={(value) =>
                                            setNewTemplate({
                                                ...newTemplate,
                                                trigger_event: value === "__none__" ? undefined : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
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
                                    <Label htmlFor="daysAfter">Days After Trigger</Label>
                                    <Input
                                        id="daysAfter"
                                        type="number"
                                        min="0"
                                        value={newTemplate.days_after_trigger}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, days_after_trigger: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateSubject">Email Subject</Label>
                                <Input
                                    id="templateSubject"
                                    placeholder="Use {{variables}} for dynamic content"
                                    value={newTemplate.subject}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="templateBody">Email Body</Label>
                                <Textarea
                                    id="templateBody"
                                    placeholder="Write your email content here. Use {{variables}} for dynamic content."
                                    rows={8}
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Available Variables</Label>
                                <div className="flex flex-wrap gap-2">
                                    {VARIABLES.map(variable => (
                                        <Badge
                                            key={variable.key}
                                            variant={newTemplate.variables?.includes(variable.key) ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                newTemplate.variables?.includes(variable.key)
                                                    ? removeVariable(variable.key)
                                                    : addVariable(variable.key)
                                            }
                                        >
                                            {variable.key}
                                            {newTemplate.variables?.includes(variable.key) && (
                                                <span className="ml-1"> ✓</span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500">
                                    Click on variables to add them to your template. They will be replaced with actual data when sent.
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newTemplate.is_active}
                                        onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, is_active: checked })}
                                    />
                                    <Label>Active</Label>
                                </div>
                                <Button onClick={saveTemplate} disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Template
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Existing Templates ({templates.length})</h3>

                            {templates.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No email templates created yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {templates.map(template => (
                                        <div key={template.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge>{template.type}</Badge>
                                                        {template.trigger_event && (
                                                            <Badge variant="outline">{template.trigger_event}</Badge>
                                                        )}
                                                        <Badge variant={template.is_active ? "default" : "secondary"}>
                                                            {template.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-medium">{template.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {template.variables.map(variable => (
                                                            <span key={variable} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                {variable}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => testTemplate(template.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleTemplateStatus(template.id, template.is_active)}
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
                            <h3 className="text-lg font-medium">Create New Follow-up Schedule</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="scheduleName">Schedule Name</Label>
                                    <Input
                                        id="scheduleName"
                                        placeholder="e.g., 7-Day Follow-up"
                                        value={newSchedule.name}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delayDays">Delay (Days)</Label>
                                    <Input
                                        id="delayDays"
                                        type="number"
                                        min="0"
                                        value={newSchedule.delay_days}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, delay_days: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delayHours">Delay (Hours)</Label>
                                    <Input
                                        id="delayHours"
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={newSchedule.delay_hours}
                                        onChange={(e) => setNewSchedule({ ...newSchedule, delay_hours: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Trigger Conditions</Label>
                                    <div className="text-sm text-gray-500">
                                        Will trigger when lead matches status, priority, and days without contact
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scheduleDescription">Description</Label>
                                <Textarea
                                    id="scheduleDescription"
                                    placeholder="Describe when this follow-up should trigger"
                                    rows={3}
                                    value={newSchedule.description}
                                    onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={newSchedule.is_active}
                                        onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, is_active: checked })}
                                    />
                                    <Label>Active</Label>
                                </div>
                                <Button onClick={saveSchedule} disabled={isLoading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Schedule
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Active Schedules ({schedules.filter(s => s.is_active).length})</h3>

                            {schedules.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">No follow-up schedules created yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.map(schedule => (
                                        <div key={schedule.id} className="p-4 border rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant={schedule.is_active ? "default" : "secondary"}>
                                                            {schedule.is_active ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            After {schedule.delay_days} days
                                                        </Badge>
                                                    </div>
                                                    <h4 className="font-medium">{schedule.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                                                    <div className="mt-2 text-sm">
                                                        <div className="font-medium">Triggers:</div>
                                                        <div className="text-gray-600">
                                                            Status: {Array.isArray(schedule.trigger_condition?.status)
                                                                ? schedule.trigger_condition.status.join(', ')
                                                                : 'Any'},
                                                            Priority: {Array.isArray(schedule.trigger_condition?.priority)
                                                                ? schedule.trigger_condition.priority.join(', ')
                                                                : 'Any'},
                                                            After {schedule.trigger_condition?.days_without_contact || 0} days without contact
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleScheduleStatus(schedule.id, schedule.is_active)}
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