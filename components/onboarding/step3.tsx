// components/onboarding/step3.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setBusinessName(name);
        }
    }, [businessSlug]);

    const formUrl = `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || ""
        }/form/${businessSlug}`;

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
                    <div className="flex h-10 w-10 rounded-full bg-blue-500/10 items-center justify-center">
                        <Share2 className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Your unique lead form link</h3>
                        <p className="text-sm text-gray-300">Share this link anywhere to start capturing leads instantly</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={formUrl}
                        readOnly
                        className="font-mono text-sm bg-gray-800/50 border-gray-700 text-gray-200 flex-1"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={copyToClipboard}
                        className="border-white/10 bg-gray-800/30 text-gray-200 hover:bg-gray-700/50 hover:text-white gap-2"
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

                <div className="hidden items-center gap-2 text-sm text-gray-400">
                    <ExternalLink className="h-4 w-4" />
                    <span>
                        Preview: <span className="font-mono text-blue-400">/{businessSlug}</span>
                    </span>
                </div>
            </div>

            {/* Form Preview */}
            <Card className="hidden border border-white/10 bg-gray-800/30 backdrop-blur-sm shadow-xl overflow-hidden">
                <CardHeader className="bg-gray-800/50 border-b border-white/10">
                    <CardTitle className="text-lg text-white">Preview your form</CardTitle>
                    <CardDescription className="text-gray-300">
                        This is exactly what your customers will see
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="rounded-xl border border-white/10 bg-gray-800/50 shadow-sm">
                        <LeadForm
                            businessSlug={businessSlug}
                            businessName={businessName}
                            serviceTypes={
                                businessData.serviceTypes.length > 0 ? businessData.serviceTypes : ["General Inquiry"]
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-6">
                <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">
                        ✓
                    </span>
                    You&apos;re all set – what&apos;s next?
                </h4>
                <ul className="space-y-2 text-sm text-blue-300">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>
                            <span className="font-medium">Share your form link</span> on your website, social media, or business
                            cards
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>
                            <span className="font-medium">Leads appear instantly</span> in your dashboard – you&apos;ll get email
                            notifications
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>
                            <span className="font-medium">Never miss a follow-up</span> – we&apos;ll automatically follow up on stale
                            leads
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}