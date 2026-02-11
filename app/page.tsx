// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowRight, Zap, CheckCircle, Shield, Users, BarChart } from "lucide-react";
import { motion } from "framer-motion";

// Background lines component for subtle animation
const BackgroundLines = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const lines = Array.from({ length: 8 }, (_, i) => i);
  const color = variant === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((i) => (
        <motion.div
          key={i}
          className="absolute h-px w-full"
          style={{
            top: `${i * 15}%`,
            left: 0,
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
          initial={{ x: "-100%", opacity: 0.3 }}
          animate={{ x: "200%", opacity: 0.5 }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "linear",
          }}
        />
      ))}
      {/* Vertical lines */}
      {lines.slice(0, 4).map((i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute w-px h-full"
          style={{
            left: `${i * 25}%`,
            top: 0,
            background: `linear-gradient(180deg, transparent, ${color}, transparent)`,
          }}
          initial={{ y: "-100%", opacity: 0.3 }}
          animate={{ y: "200%", opacity: 0.5 }}
          transition={{
            duration: 15 + i * 1.5,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white font-sans antialiased overflow-x-hidden relative">
      {/* Navigation - fixed above background lines */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
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
                      className="cursor-pointer hidden md:block text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="cursor-pointer md:hidden text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    >
                      Dash
                    </Button>
                  </Link>
                  <Link href="/api/auth/signout">
                    <Button className="cursor-pointer bg-gray-900 text-white hover:bg-gray-800">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="cursor-pointer text-gray-700 hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button className="cursor-pointer bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm">
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
        <BackgroundLines variant="light" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8">
              <span className="text-sm font-medium text-blue-700">
                Enterprise-Grade Lead Management
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
              <span className="block">Never Miss</span>
              <span
                className="block mt-2"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                a Lead Again
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              Automate lead capture, qualification, and follow-up with enterprise-grade precision.
              Designed for modern service businesses that value growth and efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href={isLoggedIn ? "/dashboard" : "/auth/signup"} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="cursor-pointer w-full sm:w-auto px-8 py-6 text-lg bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Start Free Trial"}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl"
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
                <div key={index} className="text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-gray-50 overflow-hidden">
        <BackgroundLines variant="light" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Streamlined Lead Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From first touch to closed deal, automate every step with precision
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-600" />,
                title: "Intelligent Capture",
                description: "Smart forms that adapt to your business needs, capturing leads from any source automatically.",
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-600" />,
                title: "AI Qualification",
                description: "Machine learning models score and prioritize leads based on conversion likelihood.",
              },
              {
                icon: <Users className="h-8 w-8 text-blue-600" />,
                title: "Automated Follow-ups",
                description: "Never miss a follow-up with smart scheduling and personalized communication sequences.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-lg bg-blue-50 mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
        <BackgroundLines variant="light" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LeadNest
            </h2>
            <p className="text-lg text-gray-600">
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
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-lg text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-20 bg-gray-900 text-white overflow-hidden">
        <BackgroundLines variant="dark" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BarChart className="h-12 w-12 text-blue-400 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed">
            &quot;LeadNest transformed how we handle leads. Our conversion rate increased by 3.5x in just 90 days.&quot;
          </blockquote>
          <div>
            <div className="font-semibold">Sarah Chen</div>
            <div className="text-gray-400">CEO, GrowthTech Solutions</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <BackgroundLines variant="light" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Lead Management?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using LeadNest to streamline their sales process.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="cursor-pointer w-full sm:w-auto px-8 py-6 text-lg bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto px-8 py-6 text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600"
                >
                  Schedule a Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Cancel anytime • Full-featured trial
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 py-12 overflow-hidden">
        <BackgroundLines variant="light" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">LeadNest</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-900">
                Terms
              </Link>
              <Link href="/security" className="hover:text-gray-900">
                Security
              </Link>
              <Link href="/contact" className="hover:text-gray-900">
                Contact
              </Link>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} LeadNest. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}