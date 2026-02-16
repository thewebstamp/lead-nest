// app/demo/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowRight, Zap, Play, Calendar, BarChart, Users } from "lucide-react";
import { BackgroundLines } from "@/components/background-lines";

export default async function DemoPage() {
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
                            <span className="text-xl font-bold text-white tracking-tight">LeadNest</span>
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
                            <Play className="h-4 w-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-400">Product Demo</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                            <span className="block">See LeadNest in</span>
                            <span className="block mt-2 bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                                Action
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                            Watch how LeadNest automates lead capture, qualification, and follow-up – turning missed
                            opportunities into closed deals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Video Placeholder Section */}
            <section className="relative pb-20">
                <BackgroundLines variant="dark" />
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-white/10 bg-gray-900/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="aspect-video bg-linear-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center relative group">
                            {/* Animated pulse ring */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-ping" />
                            </div>

                            {/* Play button */}
                            <div className="relative z-10 w-20 h-20 rounded-full bg-linear-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                                <Play className="h-8 w-8 text-white ml-1" />
                            </div>

                            {/* Coming soon label */}
                            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-gray-900/90 backdrop-blur-sm border border-white/10">
                                <span className="text-sm font-medium text-white">Coming soon – schedule a live demo</span>
                            </div>
                        </div>

                        {/* Video description */}
                        <div className="p-8 md:p-10 text-center border-t border-white/10">
                            <h3 className="text-2xl font-semibold text-white mb-3">While we polish our demo video...</h3>
                            <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                                Get hands-on immediately with a full-featured trial. No credit card required.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/auth/signup">
                                    <Button
                                        size="lg"
                                        className="px-8 py-6 text-lg bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                                    >
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/demo">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="px-8 py-6 text-lg border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white rounded-xl"
                                    >
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Schedule Live Demo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What You'll Learn Section */}
            <section className="relative py-20 bg-linear-to-br from-[#0B1120] via-[#0F1A2F] to-[#1A2A3F] overflow-hidden">
                <BackgroundLines variant="dark" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What you&apos;ll see in the demo</h2>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            A complete walkthrough of how LeadNest transforms your lead management workflow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="h-8 w-8 text-blue-400" />,
                                title: "Lead Capture",
                                description: "See how forms, emails, and calls are automatically logged and organized.",
                            },
                            {
                                icon: <BarChart className="h-8 w-8 text-blue-400" />,
                                title: "Qualification & Scoring",
                                description: "Watch AI instantly score and prioritize leads based on conversion probability.",
                            },
                            {
                                icon: <Users className="h-8 w-8 text-blue-400" />,
                                title: "Automated Follow-ups",
                                description: "Experience smart sequences that never let a lead go cold.",
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="inline-flex p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-20 overflow-hidden">
                <BackgroundLines variant="dark" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center bg-gray-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to never miss a lead again?
                        </h2>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses to capture and convert every opportunity.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/signup">
                                <Button
                                    size="lg"
                                    className="px-8 py-6 text-lg bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/25 rounded-xl"
                                >
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="px-8 py-6 text-lg border-white/10 bg-gray-800/30 text-gray-200 backdrop-blur-sm hover:bg-gray-700/50 hover:text-white rounded-xl"
                                >
                                    homepage
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