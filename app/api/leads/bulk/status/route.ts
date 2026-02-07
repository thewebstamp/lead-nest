// app/api/leads/bulk/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { leadIds, status } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { message: "No leads selected" },
        { status: 400 },
      );
    }

    if (
      !status ||
      !["new", "contacted", "quoted", "booked", "lost"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Update multiple leads
    await query(
      `UPDATE leads 
       SET status = $1, updated_at = NOW()
       WHERE id = ANY($2) AND business_id = $3`,
      [status, leadIds, session.user.businessId],
    );

    // Add system notes for each lead
    for (const leadId of leadIds) {
      await query(
        `INSERT INTO lead_notes (lead_id, note, created_at)
         VALUES ($1, $2, NOW())`,
        [leadId, `Status changed to ${status} (bulk update)`],
      );
    }

    return NextResponse.json({
      success: true,
      message: `${leadIds.length} leads updated`,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
