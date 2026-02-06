// components/onboarding/step1.tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

const DEFAULT_SERVICES = [
    "Cleaning",
    "Plumbing",
    "Electrical",
    "Handyman",
    "Landscaping",
    "Painting",
    "Roofing",
    "HVAC",
    "Carpentry",
    "Window Cleaning",
    "Pressure Washing",
    "Pest Control",
    "Flooring",
    "Appliance Repair",
    "Locksmith",
    "Moving Services",
    "Home Inspection",
    "Consulting",
    "Other",
];

interface OnboardingStep1Props {
    selectedServices: string[];
    onUpdate: (data: { serviceTypes: string[] }) => void;
}

export default function OnboardingStep1({ selectedServices, onUpdate }: OnboardingStep1Props) {
    const [customService, setCustomService] = useState("");

    const toggleService = (service: string) => {
        const newServices = selectedServices.includes(service)
            ? selectedServices.filter(s => s !== service)
            : [...selectedServices, service];

        onUpdate({ serviceTypes: newServices });
    };

    const addCustomService = () => {
        if (customService.trim() && !selectedServices.includes(customService.trim())) {
            const newServices = [...selectedServices, customService.trim()];
            onUpdate({ serviceTypes: newServices });
            setCustomService("");
        }
    };

    const removeService = (service: string) => {
        const newServices = selectedServices.filter(s => s !== service);
        onUpdate({ serviceTypes: newServices });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label>Select the services you offer (select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_SERVICES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                            <Checkbox
                                id={`service-${service}`}
                                checked={selectedServices.includes(service)}
                                // onCheckedChange={() => toggleService(service)}
                                onChange={() => toggleService(service)}
                            />
                            <Label
                                htmlFor={`service-${service}`}
                                className="cursor-pointer text-sm font-normal"
                            >
                                {service}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Service Input */}
            <div className="space-y-3">
                <Label>Add a custom service</Label>
                <div className="flex space-x-2">
                    <Input
                        placeholder="Enter custom service"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomService()}
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addCustomService}
                        disabled={!customService.trim()}
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Selected Services Preview */}
            {selectedServices.length > 0 && (
                <div className="space-y-3">
                    <Label>Selected Services</Label>
                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                            <Badge
                                key={service}
                                variant="secondary"
                                className="px-3 py-1"
                            >
                                {service}
                                <button
                                    type="button"
                                    onClick={() => removeService(service)}
                                    className="ml-2 text-muted-foreground hover:text-foreground"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-sm text-muted-foreground pt-4">
                These services will appear on your lead form. You can always update them later in settings.
            </p>
        </div>
    );
}