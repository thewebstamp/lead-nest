// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query, queryOne } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await queryOne<{ id: string; email: string }>(
      "SELECT id, email FROM users WHERE email = $1",
      [email],
    );

    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message:
          "If an account exists with this email, you will receive a reset link shortly.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Delete any existing tokens for this user
    await query("DELETE FROM password_reset_tokens WHERE email = $1", [email]);

    // Store new token
    await query(
      `INSERT INTO password_reset_tokens (email, token, expires_at, used)
             VALUES ($1, $2, $3, $4)`,
      [email, token, expiresAt, false],
    );

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    return NextResponse.json({
      message:
        "If an account exists with this email, you will receive a reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
