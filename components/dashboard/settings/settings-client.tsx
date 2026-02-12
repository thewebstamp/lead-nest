// components/dashboard/settings/settings-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import EmailTemplates from "./email-templates";
import {
    Building,
    Users,
    Shield,
    LogOut,
    Trash2,
    Plus,
    Copy,
    Eye,
    Save,
    UserPlus,
} from "lucide-react";
import QualificationRules from "./qualification-rules";
import { QualificationSettings } from "@/lib/services/leads/qualification";
import Link from "next/link";

interface SettingsClientProps {
    business: {
        id: string;
        name: string;
        email: string;
        slug: string;
        service_types: string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: any;
        created_at: Date;
    };
    teamMembers: Array<{
        user_id: string;
        email: string;
        name: string | null;
        role: string;
        is_default: boolean;
        created_at: Date;
    }>;
    currentUserRole: string;
}

export default function SettingsClient({ business, teamMembers, currentUserRole }: SettingsClientProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [businessName, setBusinessName] = useState(business.name);
    const [businessEmail, setBusinessEmail] = useState(business.email);
    const [services, setServices] = useState<string[]>(business.service_types || []);
    const [newService, setNewService] = useState("");
    const [formLink] = useState(`${typeof window !== 'undefined' ? window.location.origin : ''}/form/${business.slug}`);

    // Get qualification settings from business settings
    const qualificationSettings: QualificationSettings = business.settings?.qualification || {
        rules: [],
        priorityThresholds: { high: 80, medium: 60 },
    };

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${business.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: businessName,
                    email: businessEmail,
                    service_types: services,
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Business profile updated successfully",
                });
                router.refresh();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()]);
            setNewService("");
        }
    };

    const handleRemoveService = (service: string) => {
        setServices(services.filter(s => s !== service));
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/businesses/${business.id}/team/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Team member removed",
                });
                router.refresh();
            } else {
                throw new Error("Failed to remove team member");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove team member",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(formLink);
            toast({
                title: "Copied!",
                description: "Form link copied to clipboard",
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-gray-600">Manage your business settings and preferences</p>
            </div>

            {/* Business Profile - Glass card */}
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                            <Building className="h-4 w-4 text-blue-600" />
                        </div>
                        Business Profile
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Update your business information and services offered
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700">Business Name</Label>
                            <Input
                                id="name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Your business name"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700">Business Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={businessEmail}
                                onChange={(e) => setBusinessEmail(e.target.value)}
                                placeholder="contact@business.com"
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700">Form Link</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 p-3 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-xl text-sm font-mono break-all">
                                {formLink}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={copyToClipboard}
                                    className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(formLink, '_blank')}
                                    className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-700">Services Offered</Label>
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Add a service (e.g., Web Design, Consulting)"
                                value={newService}
                                onChange={(e) => setNewService(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                            />
                            <Button
                                onClick={handleAddService}
                                className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {services.map((service, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                                >
                                    {service}
                                    <button
                                        onClick={() => handleRemoveService(service)}
                                        className="ml-2 text-blue-400 hover:text-blue-600 rounded-full p-0.5"
                                    >
                                        <span className="sr-only">Remove</span>
                                        ×
                                    </button>
                                </Badge>
                            ))}
                            {services.length === 0 && (
                                <p className="text-sm text-gray-500">No services added yet</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={isLoading}
                            className="bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/20 rounded-xl"
                        >
                            {isLoading ? "Saving..." : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Lead Qualification Rules */}
            <QualificationRules
                businessId={business.id}
                initialRules={qualificationSettings.rules}
                initialThresholds={qualificationSettings.priorityThresholds}
            />

            <EmailTemplates businessId={business.id} />

            {/* Team Members */}
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        Team Members
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        People who have access to this business
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.user_id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-700 text-white">
                                            {member.name?.charAt(0).toUpperCase() || member.email.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-gray-900">{member.name || "No name"}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="border-gray-300 text-gray-700 rounded-full">
                                                {member.role}
                                            </Badge>
                                            {member.is_default && (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 rounded-full">
                                                    Owner
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                    <span className="text-sm text-gray-500">
                                        Joined {formatDate(member.created_at)}
                                    </span>
                                    {currentUserRole === "owner" && !member.is_default && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.user_id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {currentUserRole === "owner" && (
                        <div className="mt-6 p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Invite Team Members</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Invite team members to collaborate on this business
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => toast({
                                        title: "Coming Soon",
                                        description: "Team invitations will be available in the next update",
                                    })}
                                    className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl whitespace-nowrap"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                            <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        Account Security
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Manage your account security and preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Session Management</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Your current session is active
                            </p>
                            <div className="mt-4 p-4 bg-linear-to-br from-gray-50 to-white border border-gray-200 rounded-xl">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div>
                                        <p className="font-medium text-gray-900">Current Session</p>
                                        <p className="text-sm text-gray-500">
                                            Started {formatDate(new Date())}
                                        </p>
                                    </div>
                                    <Link href="/api/auth/signout">
                                        <Button
                                            variant="outline"
                                            className="border-2 border-gray-300 hover:border-red-600 hover:text-red-600 rounded-xl"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-gray-200" />

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Data & Privacy</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Your data is secured with industry-standard encryption
                            </p>
                            <div className="mt-4 space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
                                    onClick={() => toast({
                                        title: "Coming Soon",
                                        description: "Export feature will be available in the next update",
                                    })}
                                >
                                    Export Lead Data
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start border-2 border-gray-300 hover:border-red-600 hover:text-red-600 rounded-xl"
                                    onClick={() => toast({
                                        title: "Warning",
                                        description: "This action cannot be undone. Please contact support to delete your account.",
                                        variant: "destructive",
                                    })}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}