// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowRight, Zap, CheckCircle, Shield, Users, BarChart } from "lucide-react";
import { BackgroundLines } from "@/components/background-lines";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F] font-sans antialiased overflow-x-hidden relative">
      {/* Subtle radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-gray-900/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                LeadNest
              </span>
            </Link>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="hidden md:block text-gray-300 hover:text-white hover:bg-gray-800/50"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800/50"
                    >
                      Dash
                    </Button>
                  </Link>
                  <Link href="/api/auth/signout">
                    <Button className="bg-gray-800/50 text-white border border-white/10 backdrop-blur-sm hover:bg-gray-700/50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-8">
              <span className="text-sm font-medium text-blue-400">
                Enterprise-Grade Lead Management
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
              <span className="block">Never Miss</span>
              <span
                className="block mt-2 bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
              >
                a Lead Again
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
              Automate lead capture, qualification, and follow-up with enterprise-grade precision.
              Designed for modern service businesses that value growth and efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-lg bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 transition-all duration-300 rounded-xl"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white rounded-xl"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[
                { value: "98%", label: "Capture Rate" },
                { value: "3.5x", label: "Conversion" },
                { value: "40%", label: "Faster Response" },
                { value: "24/7", label: "Automation" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-6 rounded-xl border border-white/10 bg-gray-800/30 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F] overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Streamlined Lead Management
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From first touch to closed deal, automate every step with precision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-400" />,
                title: "Intelligent Capture",
                description: "Smart forms that adapt to your business needs, capturing leads from any source automatically.",
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-400" />,
                title: "AI Qualification",
                description: "Machine learning models score and prioritize leads based on conversion likelihood.",
              },
              {
                icon: <Users className="h-8 w-8 text-blue-400" />,
                title: "Automated Follow-ups",
                description: "Never miss a follow-up with smart scheduling and personalized communication sequences.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                <div className="mt-6">
                  <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                    Learn more →
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose LeadNest
            </h2>
            <p className="text-lg text-gray-300">
              Built for businesses that value efficiency and growth
            </p>
          </div>

          <div className="space-y-6 grid md:grid-cols-2 gap-6">
            {[
              "Enterprise-grade security with SOC 2 compliance",
              "Seamless integration with your existing tools",
              "Real-time analytics and performance insights",
              "Customizable workflows for any business model",
              "Dedicated customer success team",
              "99.9% uptime guarantee",
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-800/30 backdrop-blur-sm border border-white/10 hover:bg-gray-700/30 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-lg text-gray-200">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-20 bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F] overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BarChart className="h-12 w-12 text-blue-400 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-medium text-white mb-8 leading-relaxed">
            &quot;LeadNest transformed how we handle leads. Our conversion rate increased by 3.5x in just 90 days.&quot;
          </blockquote>
          <div>
            <div className="font-semibold text-white">Sarah Chen</div>
            <div className="text-gray-400">CEO, GrowthTech Solutions</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Lead Management?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using LeadNest to streamline their sales process.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 py-6 text-lg bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25"
                >
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white"
                >
                  Schedule a Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-400 mt-6">
              No credit card required • Cancel anytime • Full-featured trial
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-gray-900/30 backdrop-blur-xl py-12 overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">LeadNest</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-300">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/security" className="hover:text-white transition-colors">
                Security
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} LeadNest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}