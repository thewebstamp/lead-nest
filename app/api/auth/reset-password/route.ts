// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, queryOne } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 },
      );
    }

    // Check if token exists and is valid
    const tokenData = await queryOne<{
      id: string;
      email: string;
      expires_at: Date;
      used: boolean;
    }>(
      `SELECT id, email, expires_at, used 
             FROM password_reset_tokens 
             WHERE token = $1`,
      [token],
    );

    if (!tokenData) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      await query("DELETE FROM password_reset_tokens WHERE token = $1", [
        token,
      ]);

      return NextResponse.json(
        { message: "Reset token has expired" },
        { status: 400 },
      );
    }

    // Check if token has been used
    if (tokenData.used) {
      return NextResponse.json(
        { message: "Reset token has already been used" },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await query(
      `UPDATE users 
             SET password_hash = $1, updated_at = NOW()
             WHERE email = $2`,
      [hashedPassword, tokenData.email],
    );

    // Mark token as used
    await query(
      `UPDATE password_reset_tokens 
             SET used = true 
             WHERE id = $1`,
      [tokenData.id],
    );

    // Delete all other reset tokens for this user
    await query(
      `DELETE FROM password_reset_tokens 
             WHERE email = $1 AND id != $2`,
      [tokenData.email, tokenData.id],
    );

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
