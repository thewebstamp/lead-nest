// app/api/leads/[id]/internal-notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    console.log("Internal notes update request started");

    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("Lead ID:", id);

    const body = await request.json();
    const { internalNotes } = body;

    console.log("Internal notes content:", internalNotes);

    // Verify lead belongs to business
    const leadCheck = await query(
      "SELECT id FROM leads WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    if (leadCheck.rows.length === 0) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Update internal notes
    const result = await query(
      `UPDATE leads 
       SET internal_notes = $1, updated_at = NOW()
       WHERE id = $2 AND business_id = $3
       RETURNING id, internal_notes`,
      [internalNotes || "", id, session.user.businessId],
    );

    console.log("Internal notes update result:", result.rows);

    return NextResponse.json({
      success: true,
      message: "Internal notes updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Internal notes update error:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
