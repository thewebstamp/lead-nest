// app/(auth)/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorMessage = (errorCode: string | null) => {
        switch (errorCode) {
            case "OAuthSignin":
                return "Error in OAuth sign in process. Please try again.";
            case "OAuthCallback":
                return "Error in OAuth callback. Please try again.";
            case "OAuthCreateAccount":
                return "Could not create OAuth account. Please try again.";
            case "EmailCreateAccount":
                return "Could not create email account. Please try again.";
            case "Callback":
                return "Error in callback. Please try again.";
            case "OAuthAccountNotLinked":
                return "This email is already registered with another sign in method.";
            case "EmailSignin":
                return "Error sending sign in email. Please try again.";
            case "CredentialsSignin":
                return "Sign in failed. Check your credentials.";
            case "SessionRequired":
                return "Please sign in to access this page.";
            default:
                return "An error occurred during sign in.";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-red-600">
                        Sign In Error
                    </CardTitle>
                    <CardDescription className="text-center">
                        There was a problem signing in
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            {getErrorMessage(error)}
                        </AlertDescription>
                    </Alert>

                    <div className="text-center space-y-4">
                        <p className="text-gray-600">
                            Please try again or contact support if the problem persists.
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/auth/signin">
                            Back to Sign In
                        </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/signup">
                            Create New Account
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}