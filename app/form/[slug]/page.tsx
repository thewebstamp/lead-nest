// app/form/[slug]/page.tsx
import { notFound } from "next/navigation";
import { queryOne } from "@/lib/db";
import LeadForm from "@/components/forms/lead-form";

interface FormPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function FormPage({ params }: FormPageProps) {
    // Await the params promise (Next.js 14+ change)
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

    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            {/* Simple header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600" />
                        <span className="text-lg font-semibold text-gray-900">LeadNest</span>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto px-4 py-8 md:py-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Contact {business.name}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Fill out the form below to get a quote or schedule a service. We&apos;ll get back to you within 24 hours.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Form */}
                        <div>
                            <LeadForm
                                businessSlug={business.slug}
                                businessName={business.name}
                                serviceTypes={business.service_types.length > 0 ? business.service_types : ["General Service"]}
                            />
                        </div>

                        {/* Info panel */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Why choose {business.name}?
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <div className="shrink-0 h-5 w-5 text-blue-600 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="ml-3 text-gray-600">Fast response times</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="shrink-0 h-5 w-5 text-blue-600 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="ml-3 text-gray-600">Professional service</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="shrink-0 h-5 w-5 text-blue-600 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="ml-3 text-gray-600">Free quotes available</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="shrink-0 h-5 w-5 text-blue-600 mt-0.5">
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="ml-3 text-gray-600">Satisfaction guaranteed</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                                <ol className="text-sm text-blue-800 space-y-2">
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">1.</span>
                                        <span>Submit your request using the form</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">2.</span>
                                        <span>Receive a confirmation email</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">3.</span>
                                        <span>{business.name} will contact you within 24 hours</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-bold mr-2">4.</span>
                                        <span>Discuss your project and get a quote</span>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t bg-white py-8 mt-8">
                <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                    <p>Powered by LeadNest • Never miss a lead again</p>
                </div>
            </footer>
        </div>
    );
}