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
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-red-600">
                        Sign In Error
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        There was a problem signing in
                    </p>
                </div>

                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{getErrorMessage(error)}</AlertDescription>
                </Alert>

                <div className="space-y-3">
                    <Button asChild className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800">
                        <Link href="/auth/signin">Back to Sign In</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full border-gray-200 hover:bg-gray-50">
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
                    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                            <p className="mt-4 text-sm text-gray-600">Loading...</p>
                        </div>
                    </div>
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}