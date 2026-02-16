// app/(auth)/layout.tsx
import Image from "next/image";
import { BackgroundLines } from "@/components/background-lines";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background-dark via-[#0F1A2F] to-[#1A2A3F] font-sans antialiased">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/autt.jpg"
                    alt="Background pattern"
                    fill
                    className="object-cover opacity-15"
                    priority
                />
            </div>

            {/* Subtle radial glow overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />

            {/* Animated background lines */}
            <BackgroundLines variant="dark" />

            {/* Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
                {children}
            </div>
        </div>
    );
}