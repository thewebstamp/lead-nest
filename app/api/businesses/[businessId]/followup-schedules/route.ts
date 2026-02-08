import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { rows: schedules } = await query(
      `SELECT * FROM followup_schedules WHERE business_id = $1 ORDER BY created_at DESC`,
      [businessId],
    );

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Get followup schedules error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = await params;

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
      delay_days = 0,
      delay_hours = 0,
      is_active = true,
    } = body;

    // Validate required fields
    if (!name || !trigger_condition || !actions) {
      return NextResponse.json(
        {
          message: "Missing required fields: name, trigger_condition, actions",
        },
        { status: 400 },
      );
    }

    // Validate trigger_condition structure
    if (
      !trigger_condition.status ||
      !trigger_condition.priority ||
      !trigger_condition.days_without_contact
    ) {
      return NextResponse.json(
        {
          message:
            "Trigger condition must include status, priority, and days_without_contact",
        },
        { status: 400 },
      );
    }

    // Validate actions structure
    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json(
        { message: "Actions must be a non-empty array" },
        { status: 400 },
      );
    }

    // Check for duplicate name
    const existingSchedule = await queryOne(
      "SELECT id FROM followup_schedules WHERE business_id = $1 AND name = $2",
      [businessId, name],
    );

    if (existingSchedule) {
      return NextResponse.json(
        { message: "Schedule with this name already exists" },
        { status: 400 },
      );
    }

    // Insert schedule
    const { rows } = await query(
      `INSERT INTO followup_schedules (
        business_id, name, description, trigger_condition, actions,
        delay_days, delay_hours, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        businessId,
        name,
        description || null,
        JSON.stringify(trigger_condition),
        JSON.stringify(actions),
        delay_days,
        delay_hours,
        is_active,
      ],
    );

    return NextResponse.json({ schedule: rows[0] });
  } catch (error) {
    console.error("Create followup schedule error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
