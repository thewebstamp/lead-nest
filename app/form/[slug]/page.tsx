// app/form/[slug]/page.tsx
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import Link from "next/link";
import { Zap, CheckCircle, Clock, Shield, Sparkles } from "lucide-react";
import { BackgroundLines } from "@/components/background-lines";
import LeadForm from "@/components/forms/lead-form";

interface FormPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function FormPage({ params }: FormPageProps) {
    // Await the params promise
    const { slug } = await params;

    // Get business by slug
    const business = await queryOne<{
        id: string;
        name: string;
        slug: string;
        service_types: string[];
    }>(
        "SELECT id, name, slug, service_types FROM businesses WHERE slug = $1",
        [slug]
    );

    if (!business) {
        notFound();
    }

    const serviceTypes = business.service_types?.length > 0
        ? business.service_types
        : ["General Service"];

    return (
        <div className="min-h-screen bg-linear-to-br from-white to-gray-50 font-sans antialiased overflow-x-hidden relative">
            <BackgroundLines variant="light" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
                                <Zap className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">
                                LeadNest
                            </span>
                        </Link>
                        <span className="text-sm text-gray-500 hidden sm:block">
                            <span className="text-blue-600 font-medium">Trusted</span> lead management
                        </span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative pt-24 pb-20 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                                Request a Quote
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                            Contact{' '}
                            <span
                                className="bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
                            >
                                {business.name}
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600">
                            Fill out the form below and we&apos;ll get back to you within 24 hours.
                        </p>
                    </div>

                    {/* 2-Column Layout */}
                    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* Left Column - Lead Form */}
                        <div className="order-2 lg:order-1">
                            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-xl">
                                <LeadForm
                                    businessSlug={business.slug}
                                    businessName={business.name}
                                    serviceTypes={serviceTypes}
                                />
                            </div>
                        </div>

                        {/* Right Column - Info Panel */}
                        <div className="order-1 lg:order-2 space-y-6">
                            {/* Why Choose Us Card */}
                            <div className="rounded-2xl border border-gray-200 bg-linear-to-br from-white to-gray-50/80 p-6 md:p-8 shadow-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Why choose {business.name}?
                                    </h3>
                                </div>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">Fast response times – typically within 1 hour</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">Professional, licensed & insured service</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">Free quotes with no obligation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-gray-700">100% satisfaction guaranteed</span>
                                    </li>
                                </ul>
                            </div>

                            {/* What Happens Next Card */}
                            <div className="rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-white p-6 md:p-8 shadow-md">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-lg bg-blue-200/50 flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-blue-900">
                                        What happens next?
                                    </h4>
                                </div>
                                <ol className="space-y-4">
                                    {[
                                        "Submit your request using the secure form",
                                        "Receive an instant confirmation email",
                                        `${business.name} will contact you within 24 hours`,
                                        "Discuss your project and get a detailed quote"
                                    ].map((step, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-blue-900">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Trust Badge */}
                            <div className="text-center p-4">
                                <p className="text-sm text-gray-500">
                                    Your information is secure and encrypted. We never share your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative border-t border-gray-200 py-8 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-gray-600">
                                Powered by <span className="font-semibold text-gray-900">LeadNest</span>
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Never miss a lead again • © {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}