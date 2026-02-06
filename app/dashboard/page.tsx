// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900">Dashboard</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Welcome to your dashboard, {session.user?.name || "User"}!
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Your business slug: {session.user?.businessSlug}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}