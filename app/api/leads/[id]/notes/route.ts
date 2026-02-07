// app/api/leads/[id]/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { note } = body;

    if (!note || note.trim().length === 0) {
      return NextResponse.json(
        { message: "Note is required" },
        { status: 400 },
      );
    }

    // Verify lead belongs to business
    const lead = await queryOne(
      "SELECT id FROM leads WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Add note
    const noteId = uuidv4();
    await query(
      `INSERT INTO lead_notes (id, lead_id, user_id, note, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [noteId, id, session.user.id, note.trim()],
    );

    // Update lead's updated_at
    await query("UPDATE leads SET updated_at = NOW() WHERE id = $1", [id]);

    // Return the new note
    const newNote = await queryOne(
      `SELECT id, note, created_at, user_id 
       FROM lead_notes 
       WHERE id = $1`,
      [noteId],
    );

    return NextResponse.json(newNote);
  } catch (error) {
    console.error("Add note error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
