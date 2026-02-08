// app/api/businesses/[businessId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";

export async function PATCH(
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
    const { name, email, service_types, qualification } = body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Business name is required" },
        { status: 400 },
      );
    }

    // Get existing settings to merge with new qualification rules
    const existingBusiness = await query(
      "SELECT settings FROM businesses WHERE id = $1",
      [businessId],
    );

    const existingSettings = existingBusiness.rows[0]?.settings || {};

    // Merge existing settings with new qualification rules if provided
    const updatedSettings = {
      ...existingSettings,
      ...(qualification && { qualification }),
    };

    // Update business
    await query(
      `UPDATE businesses 
       SET name = $1, email = $2, service_types = $3, settings = $4, updated_at = NOW()
       WHERE id = $5`,
      [
        name.trim(),
        email?.trim() || "",
        service_types || [],
        JSON.stringify(updatedSettings),
        businessId,
      ],
    );

    return NextResponse.json({ success: true, message: "Business updated" });
  } catch (error) {
    console.error("Business update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
