// app/api/analytics/sources/route.ts
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

    // Get source analytics with conversion rates
    const { rows: sources } = await query<{
      source: string;
      total_leads: string;
      booked_leads: string;
      conversion_rate: number;
      avg_value: number;
    }>(
      `WITH source_stats AS (
                SELECT 
                    COALESCE(source, 'direct') as source,
                    COUNT(*) as total_leads,
                    SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked_leads,
                    AVG(
                        CASE WHEN qualification_notes ~ '\\$(\\d+)' 
                        THEN CAST(SUBSTRING(qualification_notes FROM '\\$(\\d+)') AS INTEGER)
                        ELSE 1000 END
                    ) as avg_value
                FROM leads 
                WHERE business_id = $1
                    AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $2
                GROUP BY COALESCE(source, 'direct')
            )
            SELECT 
                source,
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
                COALESCE(avg_value, 0) as avg_value
            FROM source_stats
            ORDER BY total_leads DESC`,
      [businessId, days],
    );

    // Get trend data for each source
    const sourceTrends = await Promise.all(
      sources.map(async (source) => {
        const { rows: trend } = await query<{ date: string; count: string }>(
          `SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as count
                     FROM leads 
                     WHERE business_id = $1
                        AND COALESCE(source, 'direct') = $2
                        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                     GROUP BY DATE(created_at)
                     ORDER BY date`,
          [businessId, source.source],
        );

        return {
          source: source.source,
          trend: trend,
        };
      }),
    );

    return NextResponse.json({
      sources,
      sourceTrends,
      period: `${days} days`,
      totalSources: sources.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sources analytics error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
