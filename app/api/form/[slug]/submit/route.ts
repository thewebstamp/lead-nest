// app/api/form/[slug]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // Await the params promise
    const { slug } = await params;

    // Get business by slug
    const business = await queryOne<{
      id: string;
      name: string;
      email: string;
      service_types: string[];
    }>(
      "SELECT id, name, email, service_types FROM businesses WHERE slug = $1",
      [slug],
    );

    if (!business) {
      return NextResponse.json(
        { message: "Business not found" },
        { status: 404 },
      );
    }

    // Get form data
    const formData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "serviceType",
      "location",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 },
      );
    }

    // Create lead
    const leadId = uuidv4();

    // Auto-qualification logic
    let priority = "medium";
    // eslint-disable-next-line prefer-const
    let status = "new";

    // Simple qualification rules (MVP)
    if (formData.serviceType.toLowerCase().includes("emergency")) {
      priority = "high";
    }

    if (formData.message && formData.message.length > 100) {
      // Detailed messages might indicate serious interest
      priority = "high";
    }

    await query(
      `INSERT INTO leads (
        id, business_id, name, email, phone, service_type, 
        location, message, priority, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        leadId,
        business.id,
        formData.name,
        formData.email,
        formData.phone,
        formData.serviceType,
        formData.location,
        formData.message || "",
        priority,
        status,
      ],
    );

    // TODO: Send confirmation email to customer
    // TODO: Send notification email to business owner

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully",
      leadId,
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
