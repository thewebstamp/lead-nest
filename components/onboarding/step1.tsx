// components/onboarding/step1.tsx
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const DEFAULT_SERVICES = [
    "Cleaning", "Plumbing", "Electrical", "Handyman", "Landscaping",
    "Painting", "Roofing", "HVAC", "Carpentry", "Window Cleaning",
    "Pressure Washing", "Pest Control", "Flooring", "Appliance Repair",
    "Locksmith", "Moving Services", "Home Inspection", "Consulting", "Other",
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
            onUpdate({ serviceTypes: [...selectedServices, customService.trim()] });
            setCustomService("");
        }
    };

    const removeService = (service: string) => {
        onUpdate({ serviceTypes: selectedServices.filter(s => s !== service) });
    };

    return (
        <div className="space-y-8">
            {/* Service Grid */}
            <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-200">Select the services you offer</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {DEFAULT_SERVICES.map((service) => (
                        <div
                            key={service}
                            className={`
                flex items-center space-x-2 p-3 rounded-xl border transition-all
                ${selectedServices.includes(service)
                                    ? "border-blue-500/30 bg-blue-500/10"
                                    : "border-white/10 bg-gray-800/30 hover:bg-gray-700/30"
                                }
              `}
                        >
                            <Checkbox
                                id={`service-${service}`}
                                checked={selectedServices.includes(service)}
                                onChange={() => toggleService(service)}
                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-600"
                            />
                            <Label
                                htmlFor={`service-${service}`}
                                className="cursor-pointer text-sm font-normal text-gray-200 flex-1"
                            >
                                {service}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Service Input */}
            <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-200">Add a custom service</Label>
                <div className="flex space-x-2">
                    <Input
                        placeholder="e.g., Solar Panel Installation"
                        value={customService}
                        onChange={(e) => setCustomService(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomService()}
                        className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addCustomService}
                        disabled={!customService.trim()}
                        className="bg-gray-700 text-gray-200 hover:bg-gray-600 border-0"
                    >
                        Add
                    </Button>
                </div>
            </div>

            {/* Selected Services Preview */}
            {selectedServices.length > 0 && (
                <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-200">Selected services</Label>
                    <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                            <Badge
                                key={service}
                                variant="secondary"
                                className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm font-medium"
                            >
                                {service}
                                <button
                                    type="button"
                                    onClick={() => removeService(service)}
                                    className="ml-2 text-blue-400 hover:text-blue-300"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-sm text-gray-400 pt-2 border-t border-white/10">
                These services will appear on your lead form. You can always update them later.
            </p>
        </div>
    );
}