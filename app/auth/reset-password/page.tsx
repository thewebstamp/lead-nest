// app/(auth)/reset-password/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Lock } from "lucide-react";

// Create a component that uses useSearchParams
function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState("");

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    // Validate token on page load
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

                if (!response.ok) {
                    throw new Error(data.message || "Invalid token");
                }

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
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            setSuccess(true);

            // Redirect to signin after 3 seconds
            setTimeout(() => {
                router.push("/auth/signin");
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-gray-600">Validating reset link...</p>
                </CardContent>
            </Card>
        );
    }

    if (!tokenValid) {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-red-600">
                        Invalid Reset Link
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {error || "This password reset link is invalid or has expired."}
                        </AlertDescription>
                    </Alert>
                    <div className="text-center space-y-2">
                        <p className="text-gray-600">
                            Please request a new password reset link.
                        </p>
                        <Button asChild>
                            <Link href="/auth/forgot-password">
                                Request new reset link
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                    Reset your password
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your new password for {email}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success ? (
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Password updated!
                            </h3>
                            <p className="text-gray-600">
                                Your password has been successfully reset.
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Redirecting to sign in page...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
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
            </CardContent>

            {!success && (
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        Remember your password?{" "}
                        <Link href="/auth/signin" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}

// Main page component with Suspense
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <Suspense fallback={
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </CardContent>
                </Card>
            }>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}