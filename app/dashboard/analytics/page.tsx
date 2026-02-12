// app/dashboard/analytics/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";
import AnalyticsDashboard from "@/components/dashboard/analytics/analytics-dashboard";
import { TrendingUp, Target, Users, Calendar } from "lucide-react";

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

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
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Track performance and make data-driven decisions
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>Since {new Date(business.rows[0]?.created_at || new Date()).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Initial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Leads (30 days)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {initialSummary.rows[0]?.total_leads || '0'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center border border-blue-200/50">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Booked Leads</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {initialSummary.rows[0]?.booked_leads || '0'}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-500/10 to-green-600/10 flex items-center justify-center border border-green-200/50">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="border border-gray-200 bg-white/80 backdrop-blur-sm shadow-md rounded-xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {initialSummary.rows[0]?.conversion_rate || '0'}%
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center border border-purple-200/50">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Client-side Interactive Dashboard */}
            <AnalyticsDashboard />
        </div>
    );
}