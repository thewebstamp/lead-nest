// app/api/leads/[id]/status/route.ts
// app/api/leads/[id]/status/route.ts - DEBUG VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  console.log("=== INDIVIDUAL STATUS UPDATE START ===");

  try {
    // 1. Get session
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");

    if (!session?.user?.businessId) {
      console.log("Unauthorized: No businessId");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("User:", {
      id: session.user.id,
      businessId: session.user.businessId,
      email: session.user.email,
    });

    // 2. Get params
    const { id } = await params;
    console.log("Lead ID from params:", id);

    // 3. Get request body
    const body = await request.json();
    const { status } = body;
    console.log("Request body:", body);
    console.log("Status to update:", status);

    if (
      !status ||
      !["new", "contacted", "quoted", "booked", "lost"].includes(status)
    ) {
      console.log("Invalid status:", status);
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    // 4. Verify lead belongs to business
    console.log("Verifying lead ownership...");
    const leadCheck = await query(
      "SELECT id, status FROM leads WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    console.log("Lead check result rows:", leadCheck.rows.length);

    if (leadCheck.rows.length === 0) {
      console.log("Lead not found or doesn't belong to business");
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    console.log("Current lead status:", leadCheck.rows[0].status);

    // 5. Update lead status
    console.log("Updating lead status...");
    const updateResult = await query(
      `UPDATE leads 
       SET status = $1, updated_at = NOW(), 
           last_contacted_at = CASE WHEN $1 = 'contacted' THEN NOW() ELSE last_contacted_at END
       WHERE id = $2 AND business_id = $3
       RETURNING id, status, updated_at`,
      [status, id, session.user.businessId],
    );

    console.log("Update result:", {
      rowsUpdated: updateResult.rowCount,
      data: updateResult.rows[0],
    });

    // 6. Add system note
    console.log("Adding system note...");
    const noteId = uuidv4();
    console.log("Generated note ID:", noteId);

    const noteResult = await query(
      `INSERT INTO lead_notes (id, lead_id, note, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [
        noteId,
        id,
        `Status changed from ${leadCheck.rows[0].status} to ${status}`,
      ],
    );

    console.log("Note insertion result:", {
      success: noteResult.rowCount > 0,
      noteId: noteResult.rows[0]?.id,
    });

    console.log("=== INDIVIDUAL STATUS UPDATE SUCCESS ===");

    return NextResponse.json({
      success: true,
      message: "Status updated",
      data: {
        id,
        oldStatus: leadCheck.rows[0].status,
        newStatus: status,
        updatedAt: updateResult.rows[0]?.updated_at,
      },
    });
  } catch (error) {
    console.error("=== INDIVIDUAL STATUS UPDATE ERROR ===");
    console.error("Error details:", error);

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
