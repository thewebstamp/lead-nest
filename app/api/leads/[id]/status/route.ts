// app/api/leads/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { leadId, status } = body;

    console.log("Test status update:", {
      leadId,
      status,
      businessId: session.user.businessId,
    });

    // Simple update without note
    const result = await query(
      `UPDATE leads 
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND business_id = $3
       RETURNING id, status`,
      [status, leadId, session.user.businessId],
    );

    return NextResponse.json({
      success: true,
      rowsUpdated: result.rowCount,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
