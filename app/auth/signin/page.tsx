// app/(auth)/signin/page.tsx
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

export default function SigninPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your LeadNest account
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </form>

                <div className="hidden relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white/80 px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="hidden w-full border-gray-200 hover:bg-gray-50"
                    onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
                    disabled={isLoading}
                >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        {/* ... Google SVG ... */}
                    </svg>
                    Google
                </Button>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-700">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}