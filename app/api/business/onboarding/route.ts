// app/api/business/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { step, completed, businessData } = body;

    // Build update query dynamically
    const updates: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any[] = [];
    let paramCount = 1;

    updates.push(`onboarding_step = $${paramCount}`);
    params.push(step);
    paramCount++;

    if (completed) {
      updates.push(`onboarding_completed = $${paramCount}`);
      params.push(true);
      paramCount++;
    }

    // Add business data if provided
    if (businessData) {
      if (businessData.serviceTypes) {
        updates.push(`service_types = $${paramCount}`);
        params.push(businessData.serviceTypes);
        paramCount++;
      }
      if (businessData.businessEmail) {
        updates.push(`email = $${paramCount}`);
        params.push(businessData.businessEmail);
        paramCount++;
      }
      if (businessData.location || businessData.serviceArea) {
        // For JSONB, we need to handle updates properly
        // Get existing settings first
        const existingBusiness = await query(
          "SELECT settings FROM businesses WHERE id = $1",
          [session.user.businessId],
        );

        const existingSettings = existingBusiness.rows[0]?.settings || {};
        const newSettings = {
          ...existingSettings,
          location: businessData.location,
          serviceArea: businessData.serviceArea,
        };

        updates.push(`settings = $${paramCount}`);
        params.push(JSON.stringify(newSettings));
        paramCount++;
      }
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add business ID as last parameter
    params.push(session.user.businessId);

    const queryText = `
      UPDATE businesses 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
    `;

    await query(queryText, params);

    return NextResponse.json({
      success: true,
      message: completed ? "Onboarding completed" : "Progress saved",
      step,
      completed,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
