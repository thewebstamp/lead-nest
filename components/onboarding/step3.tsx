// components/onboarding/step3.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Copy, Share2, ExternalLink } from "lucide-react";
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
                title: "Copied to clipboard!",
                description: "Your lead form link is ready to share.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Form Link Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 rounded-full bg-blue-100 items-center justify-center">
                        <Share2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Your unique lead form link</h3>
                        <p className="text-sm text-gray-600">Share this link anywhere to start capturing leads instantly</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={formUrl}
                        readOnly
                        className="font-mono text-sm bg-gray-50 border-gray-200 flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={copyToClipboard}
                        className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 gap-2"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy link
                            </>
                        )}
                    </Button>
                </div>

                <div className="hidden items-center gap-2 text-sm text-gray-500">
                    <ExternalLink className="h-4 w-4" />
                    <span>Preview: <span className="font-mono text-blue-600">/{businessSlug}</span></span>
                </div>
            </div>

            {/* Form Preview */}
            <Card className="hidden border border-gray-200 shadow-md overflow-hidden">
                <CardHeader className="bg-linear-to-br from-gray-50 to-white border-b border-gray-100">
                    <CardTitle className="text-lg">Preview your form</CardTitle>
                    <CardDescription>
                        This is exactly what your customers will see
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                        <LeadForm
                            businessSlug={businessSlug}
                            businessName={businessName}
                            serviceTypes={businessData.serviceTypes.length > 0 ? businessData.serviceTypes : ["General Inquiry"]}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="rounded-xl bg-linear-to-br from-blue-50 to-white border border-blue-100 p-6">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-xs">✓</span>
                    You&apos;re all set – what&apos;s next?
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><span className="font-medium">Share your form link</span> on your website, social media, or business cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><span className="font-medium">Leads appear instantly</span> in your dashboard – you&apos;ll get email notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span><span className="font-medium">Never miss a follow-up</span> – we&apos;ll automatically follow up on stale leads</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}