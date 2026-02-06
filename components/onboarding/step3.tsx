// components/onboarding/step3.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import LeadForm from "@/components/forms/lead-form";

interface OnboardingStep3Props {
    businessSlug: string;
    businessData: {
        serviceTypes: string[];
        businessEmail: string;
        location: string;
        serviceArea: string;
    };
}

export default function OnboardingStep3({ businessSlug, businessData }: OnboardingStep3Props) {
    const [copied, setCopied] = useState(false);
    const [businessName, setBusinessName] = useState("Your Business");

    // Get business name from slug (capitalize words)
    useEffect(() => {
        if (businessSlug) {
            const name = businessSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBusinessName(name);
        }
    }, [businessSlug]);

    const formUrl = `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ''}/form/${businessSlug}`;

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
                    <div className="border rounded-lg p-2 bg-gray-50">
                        <LeadForm
                            businessSlug={businessSlug}
                            businessName={businessName}
                            serviceTypes={businessData.serviceTypes.length > 0 ? businessData.serviceTypes : ["General Inquiry"]}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Share your form link with potential customers</li>
                    <li>• Leads will appear in your dashboard automatically</li>
                    <li>• We&apos;ll notify you instantly when leads come in</li>
                    <li>• Automatically follow up with stale leads</li>
                </ul>
            </div>
        </div>
    );
}