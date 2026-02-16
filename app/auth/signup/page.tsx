// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        businessName: "",
    });

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
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    businessName: formData.businessName,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Signup failed");

            const signInResult = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (signInResult?.error) throw new Error(signInResult.error);

            router.push("/onboarding");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Create your account
                    </h1>
                    <p className="mt-2 text-sm text-gray-300">
                        Get started with LeadNest in minutes
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-gray-200">
                            Your name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-200">
                            Email
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
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="businessName" className="text-sm font-semibold text-gray-200">
                            Business name
                        </Label>
                        <Input
                            id="businessName"
                            name="businessName"
                            placeholder="My Service Business"
                            value={formData.businessName}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                        <p className="text-xs text-gray-400">You can change this later</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-200">
                            Password
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-200">
                            Confirm password
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
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create account
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="hidden relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-gray-900/30 px-2 text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </div>

                {/* Google button (hidden) */}
                <Button
                    type="button"
                    variant="outline"
                    className="hidden w-full border-gray-700 bg-gray-800/50 text-gray-200 hover:bg-gray-700/50"
                    onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </Button>

                <p className="mt-6 text-center text-sm text-gray-300">
                    Already have an account?{" "}
                    <Link
                        href="/auth/signin"
                        className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}