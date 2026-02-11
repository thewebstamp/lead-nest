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
        <div className="min-h-screen bg-linear-to-br from-white to-gray-50 font-sans antialiased overflow-x-hidden relative">
            {/* Navigation */}
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
                            <Play className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                                Product Demo
                            </span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                            <span className="block">See LeadNest in</span>
                            <span
                                className="block mt-2"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                Action
                            </span>
                        </h1>

                        {/* Subheading */}
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                            Watch how LeadNest automates lead capture, qualification, and follow-up –
                            turning missed opportunities into closed deals.
                        </p>
                    </div>
                </div>
            </section>

            {/* Video Placeholder Section */}
            <section className="relative pb-20">
                <BackgroundLines variant="light" />
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl overflow-hidden">
                        <div className="aspect-video bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center relative group">
                            {/* Animated pulse ring */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-blue-500/10 animate-ping" />
                            </div>

                            {/* Play button */}
                            <div className="relative z-10 w-20 h-20 rounded-full bg-linear-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                                <Play className="h-8 w-8 text-white ml-1" />
                            </div>

                            {/* Coming soon label */}
                            <div className="absolute bottom-6 left-6 px-4 py-2 rounded-full bg-gray-900/90 backdrop-blur-sm border border-gray-700">
                                <span className="text-sm font-medium text-white">Coming soon – schedule a live demo</span>
                            </div>
                        </div>

                        {/* Video description */}
                        <div className="p-8 md:p-10 text-center border-t border-gray-100">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                                While we polish our demo video...
                            </h3>
                            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                                Get hands-on immediately with a full-featured trial. No credit card required.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link href="/auth/signup">
                                    <Button size="lg" className="px-8 py-6 text-lg bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-xl">
                                        Start Free Trial
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/demo">
                                    <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl">
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
            <section className="relative py-20 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
                <BackgroundLines variant="light" />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            What you&apos;ll see in the demo
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            A complete walkthrough of how LeadNest transforms your lead management workflow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="h-8 w-8 text-blue-600" />,
                                title: "Lead Capture",
                                description: "See how forms, emails, and calls are automatically logged and organized."
                            },
                            {
                                icon: <BarChart className="h-8 w-8 text-blue-600" />,
                                title: "Qualification & Scoring",
                                description: "Watch AI instantly score and prioritize leads based on conversion probability."
                            },
                            {
                                icon: <Users className="h-8 w-8 text-blue-600" />,
                                title: "Automated Follow-ups",
                                description: "Experience smart sequences that never let a lead go cold."
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-linear-to-br from-white to-gray-50/80 p-8 rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="inline-flex p-3 rounded-lg bg-blue-50 mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative py-20 overflow-hidden">
                <BackgroundLines variant="light" />
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Ready to never miss a lead again?
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses to capture and convert every opportunity.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/signup">
                                <Button size="lg" className="px-8 py-6 text-lg bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg rounded-xl">
                                    Start Free Trial
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/">
                                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 rounded-xl">
                                    homepage
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
                            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
                            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
                            <Link href="/security" className="hover:text-gray-900">Security</Link>
                            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
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