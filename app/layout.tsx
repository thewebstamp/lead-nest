// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadNest - Never Miss a Lead Again",
  description: "Automated lead capture and follow-up for service businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body className={`${inter.className} bg-bg-space bg-grid-pattern relative mobile-safe`}>
        {/* Responsive Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none mobile-safe">
          {/* Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 bg-orb-mobile rounded-full floating opacity-10"
            style={{ background: 'radial-gradient(circle, var(--neon-blue), transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full floating opacity-8"
            style={{ animationDelay: '5s', background: 'radial-gradient(circle, var(--neon-purple), transparent 70%)' }} />
          <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-48 h-48 md:w-80 md:h-80 rounded-full floating opacity-6"
            style={{ animationDelay: '10s', background: 'radial-gradient(circle, var(--electric-pink), transparent 70%)' }} />

          {/* Grid Lines */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px), linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px)',
              backgroundSize: 'clamp(20px, 5vw, 50px) clamp(20px, 5vw, 50px)'
            }} />

          {/* Particles */}
          <div className="absolute inset-0 particle-animation"
            style={{
              backgroundImage: `radial-gradient(0.5px 0.5px at 10% 20%, rgba(0, 217, 255, 0.3) 0px, transparent 50%),
                                  radial-gradient(0.5px 0.5px at 90% 80%, rgba(185, 103, 255, 0.3) 0px, transparent 50%)`,
              backgroundRepeat: 'repeat'
            }} />

          {/* decorative lines */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-neon-blue/20 to-transparent pulse-glow sm:via-neon-blue/40" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-neon-purple/20 to-transparent pulse-glow sm:via-neon-purple/40" />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 w-full overflow-hidden">
          <div className="w-full max-w-[100vw] overflow-x-hidden">
            <Providers>{children}</Providers>
          </div>
        </div>
      </body>
    </html>
  );
}