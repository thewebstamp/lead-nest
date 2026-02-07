// app/api/leads/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (
      !status ||
      !["new", "contacted", "quoted", "booked", "lost"].includes(status)
    ) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // Update lead status
    await query(
      `UPDATE leads 
       SET status = $1, updated_at = NOW(), 
           last_contacted_at = CASE WHEN $1 = 'contacted' THEN NOW() ELSE last_contacted_at END
       WHERE id = $2 AND business_id = $3`,
      [status, id, session.user.businessId],
    );

    // Add a system note about the status change
    await query(
      `INSERT INTO lead_notes (lead_id, note, created_at)
       VALUES ($1, $2, NOW())`,
      [id, `Status changed to ${status}`],
    );

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
