// app/onboarding/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, ArrowRight, ArrowLeft } from "lucide-react";
import { BackgroundLines } from "@/components/background-lines";
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
        if (!session) router.push("/auth/signin");
        else if (session.user.onboardingCompleted) router.push("/dashboard");
    }, [session, router]);

    const handleNext = async () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            await completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const completeOnboarding = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/business/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ step: currentStep, completed: true, businessData }),
            });
            if (!response.ok) throw new Error("Failed to complete onboarding");
            await update({ onboardingCompleted: true });
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const updateBusinessData = (data: Partial<typeof businessData>) => {
        setBusinessData((prev) => ({ ...prev, ...data }));
    };

    const progress = (currentStep / TOTAL_STEPS) * 100;

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F] font-sans antialiased">
            {/* Subtle radial glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />

            {/* Animated background lines */}
            <BackgroundLines variant="dark" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-900/30 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">LeadNest</span>
                        </Link>

                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-300 hidden sm:block">
                                Step {currentStep} of {TOTAL_STEPS}
                            </span>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/dashboard")}
                                className="text-gray-300 hover:text-white hover:bg-gray-800/50"
                            >
                                Skip for now
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Progress Bar */}
            <div className="fixed top-18.25 left-0 right-0 z-40 bg-gray-900/30 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-3">
                    <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-linear-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative pt-32 pb-20 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Glass card */}
                    <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
                                {currentStep === 1 && "What services do you offer?"}
                                {currentStep === 2 && "Tell us about your business"}
                                {currentStep === 3 && "Your lead form is ready!"}
                            </h1>
                            <p className="text-lg text-gray-300 max-w-xl mx-auto">
                                {currentStep === 1 && "Select the services you provide to your customers"}
                                {currentStep === 2 && "Help us personalize your experience"}
                                {currentStep === 3 && "Share this link to start capturing leads instantly"}
                            </p>
                        </div>

                        {/* Step Content */}
                        <div className="mb-8">
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
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1 || isLoading}
                                className="border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white rounded-xl px-6 py-5 h-auto"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl px-6 py-5 h-auto"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {currentStep === TOTAL_STEPS ? (
                                    <>Complete Setup <ArrowRight className="ml-2 h-4 w-4" /></>
                                ) : (
                                    <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Step Dots */}
                    <div className="flex justify-center mt-8 space-x-3">
                        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2.5 w-2.5 rounded-full transition-all ${index + 1 === currentStep
                                        ? "bg-blue-500 scale-125"
                                        : index + 1 < currentStep
                                            ? "bg-blue-400"
                                            : "bg-gray-600"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}