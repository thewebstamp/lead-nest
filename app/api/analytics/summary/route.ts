// app/api/analytics/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "0"); // Changed to 0 for all time
    const { businessId } = session.user;

    console.log(`Fetching analytics for business: ${businessId}`);

    // 1. Get ALL lead counts by status (removed date filter)
    const { rows: statusCounts } = await query<{
      status: string;
      count: string;
    }>(
      `SELECT status, COUNT(*) as count
             FROM leads
             WHERE business_id = $1
             GROUP BY status`,
      [businessId],
    );

    console.log("Status counts:", statusCounts);

    // 2. Calculate overall conversion rate
    const { rows: conversionData } = await query<{
      total: string;
      booked: string;
    }>(
      `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
             FROM leads
             WHERE business_id = $1`,
      [businessId],
    );

    // 3. Calculate average response time (for contacted leads)
    const { rows: responseData } = await query<{ avg_hours: number }>(
      `SELECT
                AVG(
                    EXTRACT(EPOCH FROM (last_contacted_at - created_at)) / 3600
                ) as avg_hours
             FROM leads
             WHERE business_id = $1
                AND status IN ('contacted', 'quoted', 'booked')
                AND last_contacted_at > created_at`,
      [businessId],
    );

    // 4. Get ALL lead trends (group by month instead of day)
    const { rows: trendData } = await query<{ month: string; count: string }>(
      `SELECT
                TO_CHAR(created_at, 'YYYY-MM') as month,
                COUNT(*) as count
             FROM leads
             WHERE business_id = $1
             GROUP BY TO_CHAR(created_at, 'YYYY-MM')
             ORDER BY month`,
      [businessId],
    );

    // 5. Get service types (for avg deal size)
    const { rows: serviceData } = await query<{
      service_type: string;
      count: string;
    }>(
      `SELECT service_type, COUNT(*) as count
             FROM leads
             WHERE business_id = $1
                AND status = 'booked'
             GROUP BY service_type`,
      [businessId],
    );

    // Calculate totals
    const totalLeads = statusCounts.reduce(
      (acc, row) => acc + parseInt(row.count),
      0,
    );
    const totalBooked = parseInt(conversionData[0]?.booked || "0");
    const conversionRate =
      totalLeads > 0 ? Math.round((totalBooked / totalLeads) * 100) : 0;

    // Estimate average deal size based on service type
    let avgDealSize = 1000; // Default
    if (serviceData.length > 0) {
      // Simple mapping of service types to average prices
      const servicePrices: Record<string, number> = {
        Painting: 1500,
        Plumbing: 1200,
        Electrical: 1300,
        Cleaning: 500,
        Consulting: 800,
        Repair: 750,
      };

      const totalValue = serviceData.reduce((sum, service) => {
        const price = servicePrices[service.service_type] || 1000;
        return sum + price * parseInt(service.count);
      }, 0);

      avgDealSize = Math.round(
        totalValue / serviceData.reduce((sum, s) => sum + parseInt(s.count), 0),
      );
    }

    // Format trend data for chart
    const formattedTrend = trendData.map((item) => ({
      date: item.month,
      count: item.count,
    }));

    const summary = {
      totalLeads,
      totalBooked,
      conversionRate,
      avgResponseTime: responseData[0]?.avg_hours
        ? Math.round(responseData[0].avg_hours)
        : 24, // Default 24h
      avgDealSize,
      statusBreakdown: statusCounts,
      trend: formattedTrend,
      period: days === 0 ? "All time" : `${days} days`,
      timestamp: new Date().toISOString(),
      debug: {
        statusCounts,
        conversionData: conversionData[0],
        serviceData,
      },
    };

    console.log("Summary prepared:", summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
