// app/api/test/status-test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if we can update a lead
    const testLeadId = "29d23742-2638-48d1-b86c-4d5ec4478cdc"; // Use your actual lead ID

    // First, get current status
    const current = await query("SELECT status FROM leads WHERE id = $1", [
      testLeadId,
    ]);

    const newStatus =
      current.rows[0]?.status === "contacted" ? "booked" : "contacted";

    // Try to update
    const updateResult = await query(
      `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status`,
      [newStatus, testLeadId],
    );

    return NextResponse.json({
      success: true,
      message: "Direct DB update test",
      current: current.rows[0],
      updated: updateResult.rows[0],
      test: {
        leadId: testLeadId,
        oldStatus: current.rows[0]?.status,
        newStatus,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
    );
  }
}
