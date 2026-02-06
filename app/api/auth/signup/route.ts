/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { generateSlug } from "@/lib/utils/string";
import { transaction, query, queryOne } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName } = body;

    // Validate input
    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate unique business slug
    const baseSlug = generateSlug(businessName);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (true) {
      const existingBusiness = await queryOne(
        "SELECT id FROM businesses WHERE slug = $1",
        [slug],
      );

      if (!existingBusiness) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create user and business in a transaction
    const result = await transaction(
      async (client: { query: (arg0: string, arg1: any[]) => any }) => {
        // Generate IDs
        const userId = uuidv4();
        const businessId = uuidv4();
        const relationId = uuidv4();

        // Create user
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
          [userId, name, email, hashedPassword],
        );

        // Create business
        await client.query(
          `INSERT INTO businesses (id, name, slug, email, service_types, onboarding_step, onboarding_completed, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [
            businessId,
            businessName,
            slug,
            email,
            [], // Empty array for services
            1, // onboarding_step
            false, // onboarding_completed
          ],
        );

        // Create user-business relation
        await client.query(
          `INSERT INTO user_business_relations (id, user_id, business_id, role, is_default, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
          [relationId, userId, businessId, "owner", true],
        );

        return { userId, businessId, businessName, slug };
      },
    );

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: result.userId,
          email,
          name,
        },
        business: {
          id: result.businessId,
          name: result.businessName,
          slug: result.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
