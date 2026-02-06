// app/onboarding/page.tsx - Updated to pass businessData to step3
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import OnboardingStep1 from "@/components/onboarding/step1";
import OnboardingStep2 from "@/components/onboarding/step2";
import OnboardingStep3 from "@/components/onboarding/step3";

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, update } = useSession();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [businessData, setBusinessData] = useState({
        serviceTypes: [] as string[],
        businessEmail: "",
        location: "",
        serviceArea: "",
    });

    useEffect(() => {
        // Check if user is authenticated
        if (!session) {
            router.push("/auth/signin");
            return;
        }

        // Check if onboarding is already completed
        if (session.user.onboardingCompleted) {
            router.push("/dashboard");
        }
    }, [session, router]);

    const handleNext = async () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            await completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeOnboarding = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/business/onboarding", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    step: currentStep,
                    completed: true,
                    businessData,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to complete onboarding");
            }

            // Update session to reflect onboarding completion
            await update({ onboardingCompleted: true });

            // Redirect to dashboard
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error("Error completing onboarding:", error);
            setIsLoading(false);
        }
    };

    const updateBusinessData = (data: Partial<typeof businessData>) => {
        setBusinessData((prev) => ({ ...prev, ...data }));
    };

    const progress = (currentStep / TOTAL_STEPS) * 100;

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-white font-bold">LN</span>
                            </div>
                            <span className="font-bold text-lg">LeadNest</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-muted-foreground">
                                Step {currentStep} of {TOTAL_STEPS}
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/dashboard")}
                            >
                                Skip for now
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="container mx-auto px-4 py-2">
                <Progress value={progress} className="h-2" />
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl md:text-3xl">
                                {currentStep === 1 && "What services do you offer?"}
                                {currentStep === 2 && "Tell us about your business"}
                                {currentStep === 3 && "Set up your lead form"}
                            </CardTitle>
                            <CardDescription>
                                {currentStep === 1 && "Select the services you provide to your customers"}
                                {currentStep === 2 && "Help us personalize your experience"}
                                {currentStep === 3 && "Customize how leads will contact you"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-6">
                            {currentStep === 1 && (
                                <OnboardingStep1
                                    selectedServices={businessData.serviceTypes}
                                    onUpdate={updateBusinessData}
                                />
                            )}
                            {currentStep === 2 && (
                                <OnboardingStep2
                                    data={businessData}
                                    onUpdate={updateBusinessData}
                                />
                            )}
                            {currentStep === 3 && (
                                <OnboardingStep3
                                    businessSlug={session.user.businessSlug || ""}
                                    businessData={businessData}
                                />
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-between pt-6">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1 || isLoading}
                            >
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentStep === TOTAL_STEPS ? "Complete Setup" : "Continue"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Step Indicators */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-8 rounded-full ${index + 1 <= currentStep
                                        ? "bg-primary"
                                        : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}