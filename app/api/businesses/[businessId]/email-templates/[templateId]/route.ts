import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; templateId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, templateId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const template = await queryOne(
      `SELECT * FROM email_templates WHERE id = $1 AND business_id = $2`,
      [templateId, businessId],
    );

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Get email template error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; templateId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, templateId } = await params;

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
      days_after_trigger,
      is_active,
      variables,
    } = body;

    // Check if template exists and belongs to business
    const existingTemplate = await queryOne(
      `SELECT id FROM email_templates WHERE id = $1 AND business_id = $2`,
      [templateId, businessId],
    );

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
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
    if (subject !== undefined) {
      updates.push(`subject = $${paramCount}`);
      values.push(subject);
      paramCount++;
    }
    if (templateBody !== undefined) {
      updates.push(`body = $${paramCount}`);
      values.push(templateBody);
      paramCount++;
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }
    if (trigger_event !== undefined) {
      updates.push(`trigger_event = $${paramCount}`);
      values.push(trigger_event);
      paramCount++;
    }
    if (days_after_trigger !== undefined) {
      updates.push(`days_after_trigger = $${paramCount}`);
      values.push(days_after_trigger);
      paramCount++;
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }
    if (variables !== undefined) {
      updates.push(`variables = $${paramCount}`);
      values.push(JSON.stringify(variables));
      paramCount++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 },
      );
    }

    updates.push(`updated_at = NOW()`);

    values.push(templateId, businessId);

    const queryText = `
      UPDATE email_templates 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount} AND business_id = $${paramCount + 1}
      RETURNING *
    `;

    const { rows } = await query(queryText, values);

    return NextResponse.json({ template: rows[0] });
  } catch (error) {
    console.error("Update email template error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string; templateId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId, templateId } = await params;

    // Verify the business belongs to the user
    if (session.user.businessId !== businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const existingTemplate = await queryOne(
      `SELECT id FROM email_templates WHERE id = $1 AND business_id = $2`,
      [templateId, businessId],
    );

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 },
      );
    }

    await query(
      `DELETE FROM email_templates WHERE id = $1 AND business_id = $2`,
      [templateId, businessId],
    );

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error) {
    console.error("Delete email template error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
