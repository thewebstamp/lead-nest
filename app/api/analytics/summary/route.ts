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
    const days = parseInt(searchParams.get("days") || "30");
    const { businessId } = session.user;

    // 1. Get basic lead counts by status
    const { rows: statusCounts } = await query<{
      status: string;
      count: string;
    }>(
      `SELECT status, COUNT(*) as count
             FROM leads
             WHERE business_id = $1
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
             GROUP BY status`,
      [businessId, days],
    );

    // 2. Calculate overall conversion rate
    const { rows: conversionData } = await query<{
      total: string;
      booked: string;
    }>(
      `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
             FROM leads
             WHERE business_id = $1
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2`,
      [businessId, days],
    );

    // 3. Calculate average response time
    const { rows: responseData } = await query<{ avg_hours: number }>(
      `SELECT
                AVG(
                    EXTRACT(EPOCH FROM (first_contact_at - created_at)) / 3600
                ) as avg_hours
             FROM (
                SELECT
                    l.id,
                    l.created_at,
                    MIN(n.created_at) as first_contact_at
                FROM leads l
                LEFT JOIN lead_notes n ON l.id = n.lead_id
                    AND n.note ILIKE '%contacted%'
                WHERE l.business_id = $1
                    AND l.status IN ('contacted', 'quoted', 'booked')
                    AND l.created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
                GROUP BY l.id, l.created_at
                HAVING MIN(n.created_at) IS NOT NULL
             ) sub`,
      [businessId, days],
    );

    // 4. Get average deal size
    const { rows: dealData } = await query<{ avg_value: number }>(
      `SELECT
                AVG(
                    CASE WHEN qualification_notes ~ '\\$(\\d+)' 
                    THEN CAST(SUBSTRING(qualification_notes FROM '\\$(\\d+)') AS INTEGER)
                    ELSE 1000 END
                ) as avg_value
             FROM leads
             WHERE business_id = $1
                AND status = 'booked'
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2`,
      [businessId, days],
    );

    // 5. Get lead volume trend
    const { rows: trendData } = await query<{ date: string; count: string }>(
      `SELECT
                DATE(created_at) as date,
                COUNT(*) as count
             FROM leads
             WHERE business_id = $1
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
             GROUP BY DATE(created_at)
             ORDER BY date`,
      [businessId, days],
    );

    // 6. Get top performing services (quick overview)
    const { rows: topServices } = await query<{
      service_type: string;
      booked: string;
    }>(
      `SELECT 
                service_type,
                COUNT(*) as booked
             FROM leads
             WHERE business_id = $1
                AND status = 'booked'
                AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
             GROUP BY service_type
             ORDER BY booked DESC
             LIMIT 3`,
      [businessId, days],
    );

    // 7. Get response time distribution
    const { rows: responseDistribution } = await query<{
      hour_range: string;
      count: string;
    }>(
      `SELECT 
                CASE
                    WHEN hours < 1 THEN 'Under 1h'
                    WHEN hours < 4 THEN '1-4h'
                    WHEN hours < 24 THEN '4-24h'
                    WHEN hours < 48 THEN '1-2d'
                    ELSE 'Over 2d'
                END as hour_range,
                COUNT(*) as count
             FROM (
                SELECT 
                    EXTRACT(EPOCH FROM (first_contact_at - created_at)) / 3600 as hours
                FROM (
                    SELECT
                        l.id,
                        l.created_at,
                        MIN(n.created_at) as first_contact_at
                    FROM leads l
                    LEFT JOIN lead_notes n ON l.id = n.lead_id
                        AND n.note ILIKE '%contacted%'
                    WHERE l.business_id = $1
                        AND l.status IN ('contacted', 'quoted', 'booked')
                        AND l.created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
                    GROUP BY l.id, l.created_at
                    HAVING MIN(n.created_at) IS NOT NULL
                ) sub
                WHERE first_contact_at > created_at
             ) hours_data
             GROUP BY hour_range
             ORDER BY 
                CASE hour_range
                    WHEN 'Under 1h' THEN 1
                    WHEN '1-4h' THEN 2
                    WHEN '4-24h' THEN 3
                    WHEN '1-2d' THEN 4
                    ELSE 5
                END`,
      [businessId, days],
    );

    // Calculate totals
    const totalLeads = statusCounts.reduce(
      (acc, row) => acc + parseInt(row.count),
      0,
    );
    const totalBooked = parseInt(conversionData[0]?.booked || "0");
    const conversionRate =
      totalLeads > 0 ? Math.round((totalBooked / totalLeads) * 100) : 0;

    // Format the response
    const summary = {
      totalLeads,
      totalBooked,
      conversionRate,
      avgResponseTime: responseData[0]?.avg_hours
        ? Math.round(responseData[0].avg_hours)
        : 0,
      avgDealSize: dealData[0]?.avg_value
        ? Math.round(dealData[0].avg_value)
        : 1000,
      statusBreakdown: statusCounts,
      trend: trendData,
      topServices,
      responseDistribution,
      period: `${days} days`,
      timestamp: new Date().toISOString(),
      insights: {
        isHighConversion: conversionRate >= 20,
        isFastResponse: responseData[0]?.avg_hours <= 4,
        hasGrowth:
          trendData.length >= 2
            ? parseInt(trendData[trendData.length - 1]?.count || "0") >
              parseInt(trendData[0]?.count || "0")
            : false,
      },
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Analytics summary error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
