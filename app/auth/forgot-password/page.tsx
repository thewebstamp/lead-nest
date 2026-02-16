// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Something went wrong");
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Forgot password?
                    </h1>
                    <p className="mt-2 text-sm text-gray-300">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                {error && (
                    <Alert
                        variant="destructive"
                        className="mb-6 border-red-500/30 bg-red-500/10 text-red-200"
                    >
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success ? (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-white">Check your email</h3>
                            <p className="mt-2 text-sm text-gray-300">
                                We&apos;ve sent a reset link to{" "}
                                <span className="font-medium text-gray-200">{email}</span>
                            </p>
                            <p className="mt-1 text-xs text-gray-400">The link will expire in 1 hour.</p>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm transition-all hover:bg-gray-700/50 hover:text-white"
                            onClick={() => {
                                setSuccess(false);
                                setEmail("");
                            }}
                        >
                            Back to reset
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-gray-200">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send reset link
                                </>
                            )}
                        </Button>
                        <p className="text-center text-sm text-gray-300">
                            Remember your password?{" "}
                            <Link
                                href="/auth/signin"
                                className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}