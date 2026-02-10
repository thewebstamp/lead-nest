// app/api/auth/validate-reset-token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 },
      );
    }

    // Check if token exists and is valid
    const tokenData = await queryOne<{
      email: string;
      expires_at: Date;
      used: boolean;
    }>(
      `SELECT email, expires_at, used 
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
      // Delete expired token
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

    return NextResponse.json({
      email: tokenData.email,
      valid: true,
    });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
