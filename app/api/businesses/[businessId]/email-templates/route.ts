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

    const { rows: templates } = await query(
      `SELECT * FROM email_templates WHERE business_id = $1 ORDER BY created_at DESC`,
      [businessId],
    );

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Get email templates error:", error);
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
      subject,
      body: templateBody,
      type,
      trigger_event,
      days_after_trigger = 0,
      is_active = true,
      variables = [],
    } = body;

    // Validate required fields
    if (!name || !subject || !templateBody || !type) {
      return NextResponse.json(
        { message: "Missing required fields: name, subject, body, type" },
        { status: 400 },
      );
    }

    // Validate type
    const validTypes = ["confirmation", "notification", "followup", "reminder"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid template type" },
        { status: 400 },
      );
    }

    // Check for duplicate name
    const existingTemplate = await queryOne(
      "SELECT id FROM email_templates WHERE business_id = $1 AND name = $2",
      [businessId, name],
    );

    if (existingTemplate) {
      return NextResponse.json(
        { message: "Template with this name already exists" },
        { status: 400 },
      );
    }

    // Insert template
    const { rows } = await query(
      `INSERT INTO email_templates (
        business_id, name, subject, body, type, trigger_event,
        days_after_trigger, is_active, variables, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        businessId,
        name,
        subject,
        templateBody,
        type,
        trigger_event || null,
        days_after_trigger,
        is_active,
        JSON.stringify(variables),
      ],
    );

    return NextResponse.json({ template: rows[0] });
  } catch (error) {
    console.error("Create email template error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
