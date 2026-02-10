// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen relative mobile-safe w-full overflow-x-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#0a0a0f] via-[#050508] to-[#0f0c29]" />

      <nav className="responsive-container py-4 sm:py-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl gradient-border flex items-center justify-center">
              <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-md bg-linear-to-br from-neon-blue to-neon-purple" />
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">LeadNest</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="glass-effect text-white hover:text-neon-blue transition-all duration-300 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dash</span>
                  </Button>
                </Link>
                <Link href="/api/auth/signout">
                  <Button className="relative overflow-hidden group bg-linear-to-r from-neon-blue to-neon-purple text-white border-0 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                    <span className="relative z-10 flex items-center">
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                      <span className="sm:hidden">Out</span>
                    </span>
                    <span className="absolute inset-0 bg-linear-to-r from-neon-purple to-electric-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    className="glass-effect text-white hover:text-neon-blue transition-all duration-300 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="relative overflow-hidden group bg-linear-to-r from-neon-blue to-neon-purple text-white border-0 text-sm sm:text-base px-4 sm:px-6 md:px-8 py-1.5 sm:py-2">
                    <span className="relative z-10">
                      <span className="hidden sm:inline">Get Started Free</span>
                      <span className="sm:hidden">Get Started</span>
                    </span>
                    <span className="absolute inset-0 bg-linear-to-r from-neon-purple to-electric-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="responsive-container py-12 sm:py-16 md:py-20 relative">
        <div className="text-center relative z-10">
          {/* Responsive badge */}
          <div className="inline-block mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-effect border border-neon-blue/20">
            <span className="text-xs sm:text-sm text-neon-blue font-semibold tracking-wider">
              🚀 <span className="hidden xs:inline">NEXT-GEN</span> LEAD MANAGEMENT
            </span>
          </div>

          {/* Responsive Headings */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight">
            <span className="gradient-text block">Never Miss</span>
            <span className="gradient-text block mt-1 sm:mt-2" style={{ background: 'var(--cyber-gradient)' }}>
              a Lead Again
            </span>
          </h1>

          {/* Responsive Paragraph */}
          <p className="mx-auto mt-6 sm:mt-8 max-w-full sm:max-w-2xl text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
            Automate lead capture, qualification, and follow-up for your service business.
            <span className="block mt-2 text-neon-blue font-medium text-sm sm:text-base md:text-lg">
              Replace sticky notes, WhatsApp chaos, and missed opportunities.
            </span>
          </p>

          {/* Responsive Buttons */}
          <div className="mt-8 sm:mt-12 flex flex-col xs:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-xs sm:max-w-none mx-auto">
            <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="w-full xs:w-auto">
              <Button
                size="lg"
                className="w-full xs:w-auto px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg relative overflow-hidden group bg-linear-to-r from-neon-blue to-neon-purple text-white border-0 rounded-xl hover:shadow-lg hover:shadow-neon-blue/30 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoggedIn ? (
                    <>
                      <span className="hidden sm:inline">🚀 Go to Dashboard</span>
                      <span className="sm:hidden">Dashboard</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">✨ Start Free Trial</span>
                      <span className="sm:hidden">Start Free</span>
                    </>
                  )}
                </span>
                <span className="absolute inset-0 bg-linear-to-r from-neon-purple to-electric-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Link href="/demo" className="w-full xs:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full xs:w-auto px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-base sm:text-lg glass-effect border-neon-purple/50 text-white hover:border-neon-purple hover:text-neon-purple hover:shadow-lg hover:shadow-neon-purple/20 transition-all duration-300 rounded-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">📽️ Watch Demo</span>
                  <span className="sm:hidden">Demo</span>
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 sm:mt-32 relative">
          {/* Section Decoration - Hidden on mobile */}
          <div className="hidden sm:block absolute -top-10 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-linear-to-r from-transparent via-neon-blue to-transparent" />

          <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text">
            How It Works
          </h2>
          <p className="text-center text-gray-400 mb-8 sm:mb-12 text-sm sm:text-base md:text-lg px-4">
            Seamless automation from capture to conversion
          </p>

          {/* Responsive Grid */}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-6 sm:gap-8 max-w-lg sm:max-w-none mx-auto sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "1. Capture Leads",
                description: "Share your custom form link. Leads come in automatically.",
                color: "from-neon-blue to-cyan-400",
                icon: "📥"
              },
              {
                title: "2. Auto-Qualify",
                description: "Our system labels and prioritizes leads instantly.",
                color: "from-neon-purple to-pink-400",
                icon: "🏷️"
              },
              {
                title: "3. Never Forget",
                description: "Automated follow-ups ensure no lead slips through.",
                color: "from-electric-pink to-orange-400",
                icon: "⏰"
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="gradient-border rounded-2xl p-6 sm:p-8 relative overflow-hidden group hover:transform hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 w-full"
              >
                {/* Step Glow Effect */}
                <div className={`absolute -inset-0.5 sm:-inset-1 bg-linear-to-r ${step.color} opacity-10 sm:opacity-0 group-hover:opacity-20 blur-sm sm:blur-xl transition-opacity duration-500`} />

                {/* Step Number */}
                <div className={`absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold bg-linear-to-r ${step.color} text-white shadow-lg`}>
                  <span className="sm:hidden">{step.icon}</span>
                  <span className="hidden sm:inline">{index + 1}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white pr-10 sm:pr-12">{step.title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{step.description}</p>

                {/* Animated Arrow - Hidden on mobile */}
                <div className="mt-4 sm:mt-6 inline-flex items-center text-neon-blue font-medium group-hover:translate-x-2 transition-transform duration-300 text-sm sm:text-base">
                  <span className="hidden sm:inline">Learn more</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Responsive Footer */}
      <footer className="border-t border-white/10 py-8 sm:py-12 relative">
        <div className="responsive-container">
          <div className="flex flex-col items-center justify-center gap-6 text-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-neon-blue to-neon-purple" />
              <span className="text-xl font-bold gradient-text">LeadNest</span>
            </div>

            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <p className="text-gray-400 text-sm sm:text-base">
                © {new Date().getFullYear()} LeadNest. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-4 sm:gap-6">
                <a href="#" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-neon-purple transition-colors duration-300 text-sm">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-electric-pink transition-colors duration-300 text-sm">Instagram</a>
              </div>
            </div>
          </div>

          {/* Footer Glow Line */}
          <div className="mt-6 sm:mt-8 w-full h-px bg-linear-to-r from-transparent via-neon-blue/20 sm:via-neon-blue/30 to-transparent" />
        </div>
      </footer>
    </div>
  );
}