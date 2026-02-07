// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl">Welcome to LeadNest!</CardTitle>
                            <CardDescription>
                                Welcome back, {session.user?.name || "User"}!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium">Your Business</h3>
                                    <p className="text-sm text-gray-600">
                                        Slug: {session.user?.businessSlug}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Business ID: {session.user?.businessId}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium">What&apos;s Next?</h3>
                                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                        <li>Share your form link: <code className="bg-gray-100 px-2 py-1 rounded">/form/{session.user?.businessSlug}</code></li>
                                        <li>Check back here to see incoming leads</li>
                                        <li>Set up email notifications in settings</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Leads Overview</CardTitle>
                                <CardDescription>Your incoming leads</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No leads yet</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Share your form link to start receiving leads
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Common tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button className="w-full" variant="outline" onClick={() => router.push(`/form/${session.user?.businessSlug}`)}>
                                        View Your Form
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Settings
                                    </Button>
                                    <Button className="w-full" variant="outline">
                                        Add Team Members
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                                <CardDescription>Coming soon</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Dashboard features coming in Phase 2</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Lead tracking, analytics, and automation
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}