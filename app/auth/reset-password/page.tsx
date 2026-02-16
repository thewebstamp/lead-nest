// app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Lock } from "lucide-react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState("");
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setError("Invalid or expired reset link");
                setIsValidating(false);
                return;
            }
            try {
                const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Invalid token");
                setTokenValid(true);
                setEmail(data.email);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Invalid or expired reset link");
            } finally {
                setIsValidating(false);
            }
        };
        validateToken();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: formData.password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to reset password");
            setSuccess(true);
            setTimeout(() => router.push("/auth/signin"), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                        <p className="mt-4 text-sm text-gray-300">Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-400">Invalid Reset Link</h1>
                        <Alert
                            variant="destructive"
                            className="mt-4 border-red-500/30 bg-red-500/10 text-red-200"
                        >
                            <AlertDescription>
                                {error || "This password reset link is invalid or has expired."}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-6 space-y-3">
                            <p className="text-sm text-gray-300">Please request a new reset link.</p>
                            <Button asChild className="w-full">
                                <Link href="/auth/forgot-password">Request new link</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Reset your password
                    </h1>
                    <p className="mt-2 text-sm text-gray-300">
                        Enter your new password for <span className="font-medium text-gray-200">{email}</span>
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
                            <h3 className="text-lg font-medium text-white">Password updated!</h3>
                            <p className="mt-2 text-sm text-gray-300">
                                Your password has been successfully reset.
                            </p>
                            <p className="mt-1 text-xs text-gray-400">Redirecting to sign in...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-200">
                                New password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                            />
                            <p className="text-xs text-gray-400">At least 8 characters</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-200">
                                Confirm new password
                            </Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Reset password
                                </>
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                        <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                            <p className="mt-4 text-sm text-gray-300">Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}