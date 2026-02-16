// app/(auth)/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case "OAuthAccountNotLinked":
                return "This email is already registered with another sign in method.";
            case "CredentialsSignin":
                return "Sign in failed. Check your credentials.";
            case "SessionRequired":
                return "Please sign in to access this page.";
            default:
                return "An error occurred during sign in. Please try again.";
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-red-400">
                        Sign In Error
                    </h1>
                    <p className="mt-2 text-sm text-gray-300">
                        There was a problem signing in
                    </p>
                </div>

                <Alert
                    variant="destructive"
                    className="mb-6 border-red-500/30 bg-red-500/10 text-red-200"
                >
                    <AlertDescription>{getErrorMessage(error)}</AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <Button
                        asChild
                        className="w-full bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25"
                    >
                        <Link href="/auth/signin">Back to Sign In</Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="w-full border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm transition-all hover:bg-gray-700/50 hover:text-white"
                    >
                        <Link href="/auth/signup">Create New Account</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                            <p className="mt-4 text-sm text-gray-300">Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}