// components/forms/lead-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Send } from "lucide-react";

interface LeadFormProps {
    businessSlug: string;
    businessName: string;
    serviceTypes: string[];
}

export default function LeadForm({ businessSlug, businessName, serviceTypes }: LeadFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        location: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleServiceChange = (value: string) => {
        setFormData({ ...formData, serviceType: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`/api/form/${businessSlug}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to submit");
            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="w-full border-0 bg-transparent shadow-none">
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white">Thank you!</h3>
                        <p className="text-gray-300 mt-2">
                            Your request has been sent to <span className="font-medium text-gray-200">{businessName}</span>.
                            They&apos;ll contact you shortly.
                        </p>
                        <p className="text-sm text-gray-400 mt-4">A confirmation has been sent to your email.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="text-center px-0 pt-0">
                <CardTitle className="text-2xl font-bold text-white">Contact {businessName}</CardTitle>
                <CardDescription className="text-base text-gray-300">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                {error && (
                    <Alert variant="destructive" className="mb-6 border-red-500/30 bg-red-500/10 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-200">
                            Full name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-200">
                            Email address <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-200">
                            Phone number <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="(123) 456-7890"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serviceType" className="text-sm font-semibold text-gray-200">
                            Service needed <span className="text-red-400">*</span>
                        </Label>
                        <Select
                            value={formData.serviceType}
                            onValueChange={handleServiceChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="border-gray-700 bg-gray-800/50 text-white">
                                <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceTypes.map((service) => (
                                    <SelectItem key={service} value={service}>
                                        {service}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-200">
                            Your location <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="location"
                            name="location"
                            placeholder="City, State"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-200">
                            Additional details
                        </Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Tell us about your project..."
                            value={formData.message}
                            onChange={handleChange}
                            rows={3}
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl h-12"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Submit Request
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-gray-400 pt-2">
                        By submitting, you agree to be contacted by {businessName}.
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}