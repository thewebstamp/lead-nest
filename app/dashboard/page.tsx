// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    // Fetch business details
    const business = await queryOne<{
        name: string;
        slug: string;
        email: string;
        service_types: string[];
        created_at: Date;
    }>(
        "SELECT name, slug, email, service_types, created_at FROM businesses WHERE id = $1",
        [session.user.businessId]
    );

    if (!business) {
        redirect("/onboarding");
    }

    // Fetch lead statistics
    const { rows: statusCounts } = await query<{ status: string; count: string }>(
        `SELECT status, COUNT(*) as count 
     FROM leads 
     WHERE business_id = $1 
     GROUP BY status`,
        [session.user.businessId]
    );

    // Fetch recent leads
    const { rows: recentLeads } = await query<{
        id: string;
        name: string;
        email: string;
        service_type: string;
        status: string;
        priority: string;
        created_at: Date;
    }>(
        `SELECT id, name, email, service_type, status, priority, created_at
     FROM leads 
     WHERE business_id = $1 
     ORDER BY created_at DESC 
     LIMIT 5`,
        [session.user.businessId]
    );

    // Fetch lead trends (last 7 days)
    const { rows: leadTrends } = await query<{ date: string; count: string }>(
        `SELECT 
       DATE(created_at) as date,
       COUNT(*) as count
     FROM leads 
     WHERE business_id = $1 
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
        [session.user.businessId]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toNumber = (value: any, fallback = 0): number => {
        const num = Number(value);
        return isNaN(num) ? fallback : num;
    };

    // Calculate totals
    const stats = {
        total: statusCounts.reduce((acc, row) => acc + parseInt(row.count), 0),
        new: parseInt(statusCounts.find(row => row.status === 'new')?.count || '0'),
        contacted: parseInt(statusCounts.find(row => row.status === 'contacted')?.count || '0'),
        quoted: parseInt(statusCounts.find(row => row.status === 'quoted')?.count || '0'),
        booked: parseInt(statusCounts.find(row => row.status === 'booked')?.count || '0'),
        lost: parseInt(statusCounts.find(row => row.status === 'lost')?.count || '0'),
    };

    // Calculate conversion rate
    const total = toNumber(stats.total);
    const booked = toNumber(stats.booked);
    const conversionRate = total > 0
        ? Math.round((booked / total) * 100)
        : 0;

    // Calculate average response time (in hours) for contacted leads
    const { rows: responseTimes } = await query<{ hours: number }>(
        `SELECT 
       EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 as hours
     FROM leads 
     WHERE business_id = $1 
       AND status IN ('contacted', 'quoted', 'booked')
       AND updated_at > created_at`,
        [session.user.businessId]
    );

    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((acc, row) => acc + row.hours, 0) / responseTimes.length)
        : 0;

    return (
        <DashboardContent
            stats={stats}
            recentLeads={recentLeads}
            leadTrends={leadTrends}
            business={business}
            conversionRate={conversionRate}
            avgResponseTime={avgResponseTime}
        />
    );
}