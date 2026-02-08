import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; scheduleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, scheduleId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const schedule = await queryOne(
      `SELECT * FROM followup_schedules WHERE id = $1 AND business_id = $2`,
      [scheduleId, businessId],
    );

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("Get followup schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; scheduleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, scheduleId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      trigger_condition,
      actions,
      delay_days,
      delay_hours,
      is_active,
    } = body;

    // Check if schedule exists and belongs to business
    const existingSchedule = await queryOne(
      `SELECT id FROM followup_schedules WHERE id = $1 AND business_id = $2`,
      [scheduleId, businessId],
    );

    if (!existingSchedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (trigger_condition !== undefined) {
      updates.push(`trigger_condition = $${paramCount}`);
      values.push(JSON.stringify(trigger_condition));
      paramCount++;
    }
    if (actions !== undefined) {
      updates.push(`actions = $${paramCount}`);
      values.push(JSON.stringify(actions));
      paramCount++;
    }
    if (delay_days !== undefined) {
      updates.push(`delay_days = $${paramCount}`);
      values.push(delay_days);
      paramCount++;
    }
    if (delay_hours !== undefined) {
      updates.push(`delay_hours = $${paramCount}`);
      values.push(delay_hours);
      paramCount++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 },
      );
    }

    updates.push(`updated_at = NOW()`);

    values.push(scheduleId, businessId);

    const queryText = `
      UPDATE followup_schedules 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount} AND business_id = $${paramCount + 1}
      RETURNING *
    `;

    const { rows } = await query(queryText, values);

    return NextResponse.json({ schedule: rows[0] });
  } catch (error) {
    console.error("Update followup schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; scheduleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, scheduleId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const existingSchedule = await queryOne(
      `SELECT id FROM followup_schedules WHERE id = $1 AND business_id = $2`,
      [scheduleId, businessId],
    );

    if (!existingSchedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 },
      );
    }

    await query(
      `DELETE FROM followup_schedules WHERE id = $1 AND business_id = $2`,
      [scheduleId, businessId],
    );

    return NextResponse.json({ success: true, message: "Schedule deleted" });
  } catch (error) {
    console.error("Delete followup schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
