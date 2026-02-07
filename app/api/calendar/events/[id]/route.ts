// app/api/calendar/events/[id]/route.ts
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

    // Verify event belongs to business
    const eventCheck = await query(
      "SELECT id FROM calendar_events WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Build update query
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];
    let paramCount = 1;

    Object.keys(body).forEach((key) => {
      if (key !== "id" && body[key] !== undefined) {
        if (["participants", "reminders"].includes(key)) {
          updates.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(body[key]));
        } else {
          updates.push(`${key} = $${paramCount}`);
          values.push(body[key]);
        }
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 },
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, session.user.businessId);

    const queryText = `
            UPDATE calendar_events 
            SET ${updates.join(", ")}
            WHERE id = $${paramCount} AND business_id = $${paramCount + 1}
            RETURNING *
        `;

    const result = await query(queryText, values);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify event belongs to business
    const eventCheck = await query(
      "SELECT id FROM calendar_events WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Soft delete by marking as cancelled
    await query(
      `UPDATE calendar_events 
             SET status = 'cancelled', updated_at = NOW()
             WHERE id = $1 AND business_id = $2`,
      [id, session.user.businessId],
    );

    return NextResponse.json({ success: true, message: "Event cancelled" });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
