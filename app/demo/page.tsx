// app/demo/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            <nav className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600" />
                        <span className="text-xl font-bold text-gray-900">LeadNest</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/auth/signin">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button>Get Started Free</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                        Demo Video
                        <span className="block text-blue-600">Coming Soon</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
                        While we prepare our demo video, why not try LeadNest for yourself?
                    </p>
                    <div className="mt-10">
                        <Link href="/auth/signup">
                            <Button size="lg" className="px-8">
                                Start Free Trial
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-20">
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="mt-4 text-gray-600">Demo video will be available soon</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}