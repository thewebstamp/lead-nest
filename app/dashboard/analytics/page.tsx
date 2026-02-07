// app/dashboard/analytics/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";
import AnalyticsDashboard from "@/components/dashboard/analytics/analytics-dashboard";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    // For server-side rendering, we can fetch some initial data
    // The client-side component will handle real-time updates
    const initialSummary = await query<{
        total_leads: string;
        booked_leads: string;
        conversion_rate: number;
    }>(
        `SELECT 
            COUNT(*) as total_leads,
            SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_leads,
            CASE 
                WHEN COUNT(*) > 0 
                THEN ROUND(SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1)
                ELSE 0 
            END as conversion_rate
         FROM leads
         WHERE business_id = $1
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
        [session.user.businessId]
    );

    // Get business info for the dashboard
    const business = await query<{
        name: string;
        service_types: string[];
        created_at: Date;
    }>(
        "SELECT name, service_types, created_at FROM businesses WHERE id = $1",
        [session.user.businessId]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Analytics Dashboard - {business.rows[0]?.name || 'Your Business'}
                    </h1>
                    <p className="text-gray-600">
                        Track performance and make data-driven decisions
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Since {new Date(business.rows[0]?.created_at || new Date()).toLocaleDateString()}
                </div>
            </div>

            {/* Initial Stats (Server-rendered) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {initialSummary.rows[0]?.total_leads || '0'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Total Leads (30 days)</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {initialSummary.rows[0]?.booked_leads || '0'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Booked Leads</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {initialSummary.rows[0]?.conversion_rate || '0'}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
                    </div>
                </div>
            </div>

            {/* Client-side Interactive Dashboard */}
            <AnalyticsDashboard />
        </div>
    );
}