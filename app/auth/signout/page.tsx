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
            <div className="rounded-2xl border border-white/10 bg-gray-900/30 backdrop-blur-xl p-8 shadow-2xl">
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">LeadNest</span>
                    </div>
                </div>

                {/* Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                    <LogOut className="h-8 w-8 text-red-400" />
                </div>

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Sign out of LeadNest?
                    </h1>
                    <p className="mt-2 text-sm text-gray-300">
                        You are currently signed in. Are you sure you want to sign out?
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        onClick={handleSignOut}
                        className="w-full bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-red-600 hover:to-red-700 hover:shadow-red-500/25"
                        size="lg"
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Yes, sign out
                    </Button>

                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="w-full border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm transition-all hover:bg-gray-700/50 hover:text-white"
                        size="lg"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Cancel, go back
                    </Button>

                    <Button
                        variant="ghost"
                        className="flex w-full text-gray-300 transition-colors hover:bg-gray-800/50 hover:text-white"
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
                <p className="mt-6 text-center text-xs text-gray-400">
                    You can always sign back in at any time.
                </p>
            </div>
        </div>
    );
}