// app/(auth)/layout.tsx
import Image from "next/image";
import { BackgroundLines } from "@/components/background-lines";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-white font-sans antialiased">
            {/* Background image with overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/autt.jpg"
                    alt="Authentication background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-br from-white/95 via-white/90 to-white/85 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-gray-950/85" />
            </div>

            {/* Animated background lines (light variant) */}
            <BackgroundLines variant="light" />

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </div>
    );
}