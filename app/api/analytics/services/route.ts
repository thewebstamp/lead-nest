// app/api/analytics/services/route.ts
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

    // Get service analytics with comprehensive metrics
    const { rows: services } = await query<{
      service_type: string;
      total_leads: string;
      booked_leads: string;
      conversion_rate: number;
      avg_response_time: number;
      avg_value: number;
      revenue: number;
    }>(
      `WITH service_stats AS (
                SELECT 
                    service_type,
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_leads,
                    AVG(
                        CASE WHEN EXISTS (
                            SELECT 1 FROM lead_notes ln 
                            WHERE ln.lead_id = l.id 
                            AND ln.note ILIKE '%contacted%'
                        ) THEN 
                            (SELECT EXTRACT(EPOCH FROM (MIN(ln.created_at) - l.created_at)) / 3600 
                             FROM lead_notes ln 
                             WHERE ln.lead_id = l.id 
                             AND ln.note ILIKE '%contacted%')
                        ELSE NULL
                    ) as avg_response_time,
                    AVG(
                        CASE WHEN l.qualification_notes ~ '\\$(\\d+)' 
                        THEN CAST(SUBSTRING(l.qualification_notes FROM '\\$(\\d+)') AS INTEGER)
                        ELSE 1000 END
                    ) as avg_value
                FROM leads l
                WHERE l.business_id = $1
                    AND l.created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
                GROUP BY service_type
            )
            SELECT 
                service_type,
                total_leads,
                booked_leads,
                ROUND(
                    CASE 
                        WHEN total_leads > 0 
                        THEN (booked_leads * 100.0 / total_leads) 
                        ELSE 0 
                    END,
                    1
                ) as conversion_rate,
                COALESCE(avg_response_time, 0) as avg_response_time,
                COALESCE(avg_value, 0) as avg_value,
                (booked_leads * COALESCE(avg_value, 0)) as revenue
            FROM service_stats
            ORDER BY total_leads DESC`,
      [businessId, days],
    );

    // Get additional metrics for each service
    const enhancedServices = await Promise.all(
      services.map(async (service) => {
        // Get status distribution for this service
        const { rows: statusDist } = await query<{
          status: string;
          count: string;
        }>(
          `SELECT status, COUNT(*) as count
                     FROM leads 
                     WHERE business_id = $1
                        AND service_type = $2
                        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $3
                     GROUP BY status`,
          [businessId, service.service_type, days],
        );

        // Get average deal cycle time for booked leads
        const { rows: cycleTime } = await query<{ avg_days: number }>(
          `SELECT 
                        AVG(
                            EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400
                        ) as avg_days
                     FROM leads 
                     WHERE business_id = $1
                        AND service_type = $2
                        AND status = 'booked'
                        AND updated_at > created_at
                        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $3`,
          [businessId, service.service_type, days],
        );

        return {
          ...service,
          status_distribution: statusDist,
          avg_deal_cycle_days: cycleTime[0]?.avg_days || 0,
        };
      }),
    );

    return NextResponse.json({
      services: enhancedServices,
      period: `${days} days`,
      totalServices: services.length,
      totalRevenue: services.reduce((sum, s) => sum + s.revenue, 0),
      avgConversionRate:
        services.length > 0
          ? services.reduce((sum, s) => sum + s.conversion_rate, 0) /
            services.length
          : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Services analytics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
