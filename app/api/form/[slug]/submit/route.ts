// app/api/form/[slug]/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { autoQualifyLead } from "@/lib/services/leads/qualification";
import { NotificationService } from "@/lib/services/notifications/notification-service";
import { EmailService } from "@/lib/services/email/email-service";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      settings: any;
    }>(
      "SELECT id, name, email, service_types, settings FROM businesses WHERE slug = $1",
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

    // Auto-qualify the lead
    const businessSettings = business.settings || {};
    const qualification = autoQualifyLead(formData, businessSettings);

    // Create lead
    const leadId = uuidv4();

    await query(
      `INSERT INTO leads (
        id, business_id, name, email, phone, service_type, 
        location, message, priority, status, source,
        qualification_notes, tags, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
      [
        leadId,
        business.id,
        formData.name,
        formData.email,
        formData.phone,
        formData.serviceType,
        formData.location,
        formData.message || "",
        qualification.priority,
        "new",
        "form",
        qualification.notes,
        qualification.tags.join(","), // Store tags as comma-separated string
      ],
    );

    // Send confirmation email to customer
    const emailService = new EmailService(business.id);

    // Create default templates if they don't exist
    await emailService.createDefaultTemplates();

    // Send confirmation email to lead
    await emailService.sendTemplateEmail(
      "confirmation",
      { email: formData.email, name: formData.name },
      {
        business_name: business.name,
        lead_name: formData.name,
        service_type: formData.serviceType,
        lead_location: formData.location,
        lead_message: formData.message || "",
        lead_email: formData.email,
        lead_phone: formData.phone,
        lead_id: leadId,
      },
      "lead_created",
    );

    // Send internal notification to business
    await emailService.sendTemplateEmail(
      "notification",
      { email: business.email, name: business.name },
      {
        lead_name: formData.name,
        lead_email: formData.email,
        lead_phone: formData.phone,
        service_type: formData.serviceType,
        lead_location: formData.location,
        lead_priority: qualification.priority,
        lead_message: formData.message || "",
        lead_score: qualification.score.toString(),
        lead_tags: qualification.tags.join(", "),
        lead_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/leads/${leadId}`,
      },
      "lead_created",
    );

    // Create in-app notifications
    const notificationService = new NotificationService(business.id);
    await notificationService.createLeadNotification(
      leadId,
      {
        name: formData.name,
        status: "new",
        priority: qualification.priority,
        serviceType: formData.serviceType,
      },
      "new",
    );

    return NextResponse.json({
      success: true,
      message: "Lead submitted successfully",
      leadId,
      qualification,
    });
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
