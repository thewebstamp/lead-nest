// components/onboarding/step3.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface OnboardingStep3Props {
    businessSlug: string;
}

export default function OnboardingStep3({ businessSlug }: OnboardingStep3Props) {
    const [copied, setCopied] = useState(false);
    const formUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/form/${businessSlug}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(formUrl);
            setCopied(true);
            toast({
                title: "Copied!",
                description: "Form link copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Your Lead Form is Ready!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Share this link with customers to start capturing leads
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Form Link</Label>
                    <div className="flex space-x-2">
                        <Input
                            value={formUrl}
                            readOnly
                            className="font-mono text-sm"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Share this link on your website, social media, or business cards
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Preview Your Form</CardTitle>
                    <CardDescription>
                        This is what your customers will see
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 rounded-lg border p-4 bg-gray-50">
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-white border rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-white border rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            <div className="h-10 bg-white border rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            <div className="h-20 bg-white border rounded"></div>
                        </div>
                        <div className="h-10 bg-blue-600 rounded"></div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your form link with potential customers</li>
                    <li>• Leads will appear in your dashboard automatically</li>
                    <li>• Set up automated follow-ups in settings</li>
                    <li>• Add team members as your business grows</li>
                </ul>
            </div>
        </div>
    );
}