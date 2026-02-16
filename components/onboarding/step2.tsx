// components/onboarding/step2.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Globe } from "lucide-react";

interface OnboardingStep2Props {
    data: {
        businessEmail: string;
        location: string;
        serviceArea: string;
    };
    onUpdate: (data: Partial<OnboardingStep2Props["data"]>) => void;
}

export default function OnboardingStep2({ data, onUpdate }: OnboardingStep2Props) {
    return (
        <div className="space-y-6">
            <div className="space-y-5">
                {/* Business Email */}
                <div className="space-y-2">
                    <Label htmlFor="businessEmail" className="flex items-center gap-2 text-base font-semibold text-gray-200">
                        <Mail className="h-4 w-4 text-blue-400" />
                        Business Email
                    </Label>
                    <Input
                        id="businessEmail"
                        type="email"
                        placeholder="hello@yourbusiness.com"
                        value={data.businessEmail}
                        onChange={(e) => onUpdate({ businessEmail: e.target.value })}
                        className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                    />
                    <p className="text-sm text-gray-400">
                        We&apos;ll send instant lead notifications to this email
                    </p>
                </div>

                {/* Business Location */}
                <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2 text-base font-semibold text-gray-200">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        Business Location
                    </Label>
                    <Input
                        id="location"
                        placeholder="City, State"
                        value={data.location}
                        onChange={(e) => onUpdate({ location: e.target.value })}
                        className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                    />
                    <p className="text-sm text-gray-400">
                        Helps us show relevant, nearby leads
                    </p>
                </div>

                {/* Service Area */}
                <div className="space-y-2">
                    <Label htmlFor="serviceArea" className="flex items-center gap-2 text-base font-semibold text-gray-200">
                        <Globe className="h-4 w-4 text-blue-400" />
                        Service Area
                    </Label>
                    <Textarea
                        id="serviceArea"
                        placeholder="e.g., Metro area within 30 miles, All of Los Angeles County"
                        value={data.serviceArea}
                        onChange={(e) => onUpdate({ serviceArea: e.target.value })}
                        rows={3}
                        className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                    />
                    <p className="text-sm text-gray-400">
                        Describe the areas you serve – this helps qualify leads based on location
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5">
                <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs">i</span>
                    How we use this information
                </h4>
                <ul className="text-sm text-blue-300 space-y-1.5">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span><span className="font-medium">Email:</span> Instant notifications for every new lead</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span><span className="font-medium">Location:</span> Flags leads outside your service area</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-400">•</span>
                        <span><span className="font-medium">Service Area:</span> Prioritizes leads closest to you</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}