// app/api/businesses/[businessId]/team/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; userId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId || session.user.role !== "owner") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, userId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Don't allow removing yourself
    if (session.user.id === userId) {
      return NextResponse.json(
        { message: "Cannot remove yourself" },
        { status: 400 },
      );
    }

    // Check if user is the owner
    const relation = await query(
      `SELECT is_default FROM user_business_relations 
       WHERE business_id = $1 AND user_id = $2`,
      [businessId, userId],
    );

    if (relation.rows[0]?.is_default) {
      return NextResponse.json(
        { message: "Cannot remove the business owner" },
        { status: 400 },
      );
    }

    // Remove team member
    await query(
      `DELETE FROM user_business_relations 
       WHERE business_id = $1 AND user_id = $2`,
      [businessId, userId],
    );

    return NextResponse.json({ success: true, message: "Team member removed" });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
