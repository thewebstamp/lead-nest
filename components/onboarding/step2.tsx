// components/onboarding/step2.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OnboardingStep2Props {
    data: {
        businessEmail: string;
        location: string;
        serviceArea: string;
    };
    onUpdate: (data: Partial<OnboardingStep2Props['data']>) => void;
}

export default function OnboardingStep2({ data, onUpdate }: OnboardingStep2Props) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                        id="businessEmail"
                        type="email"
                        placeholder="hello@yourbusiness.com"
                        value={data.businessEmail}
                        onChange={(e) => onUpdate({ businessEmail: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                        This email will receive lead notifications
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">Business Location</Label>
                    <Input
                        id="location"
                        placeholder="City, State"
                        value={data.location}
                        onChange={(e) => onUpdate({ location: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground">
                        Helps us show relevant leads
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="serviceArea">Service Area</Label>
                    <Textarea
                        id="serviceArea"
                        placeholder="Describe the areas you serve (e.g., 'Metro area within 30 miles', 'All of Los Angeles County')"
                        value={data.serviceArea}
                        onChange={(e) => onUpdate({ serviceArea: e.target.value })}
                        rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                        This helps qualify leads based on location
                    </p>
                </div>
            </div>

            <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-medium mb-2">How this information helps:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email: We&apos;ll notify you instantly when leads come in</li>
                    <li>• Location: Leads outside your service area will be flagged</li>
                    <li>• Service Area: Helps prioritize nearby leads</li>
                </ul>
            </div>
        </div>
    );
}