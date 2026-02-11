// app/(auth)/signout/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, Home, Zap } from "lucide-react";

export default function SignOutPage() {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/" });
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <div className="w-full max-w-md">
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">LeadNest</span>
                    </div>
                </div>

                {/* Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <LogOut className="h-8 w-8 text-red-500" />
                </div>

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Sign out of LeadNest?
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        You are currently signed in. Are you sure you want to sign out?
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={handleSignOut}
                        className="w-full bg-linear-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20"
                        size="lg"
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Yes, sign out
                    </Button>

                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="w-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                        size="lg"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Cancel, go back
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full text-gray-500 hover:text-gray-700"
                        size="sm"
                        asChild
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Return to home
                        </Link>
                    </Button>
                </div>

                {/* Footer note */}
                <p className="mt-6 text-center text-xs text-gray-500">
                    You can always sign back in at any time.
                </p>
            </div>
        </div>
    );
}