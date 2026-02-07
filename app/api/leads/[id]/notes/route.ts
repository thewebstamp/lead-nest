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
    console.log("Add note request started");

    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      console.log("No session or businessId");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("Session data:", {
      userId: session.user.id,
      businessId: session.user.businessId,
      email: session.user.email,
    });

    const { id } = await params;
    console.log("Lead ID from params:", id);

    const body = await request.json();
    const { note } = body;

    console.log("Note content:", note);

    if (!note || note.trim().length === 0) {
      return NextResponse.json(
        { message: "Note is required" },
        { status: 400 },
      );
    }

    // Verify lead belongs to business
    const lead = await queryOne(
      "SELECT id, name FROM leads WHERE id = $1 AND business_id = $2",
      [id, session.user.businessId],
    );

    console.log("Lead verification result:", lead);

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    // Add note
    const noteId = uuidv4();
    console.log("Generated note ID:", noteId);

    await query(
      `INSERT INTO lead_notes (id, lead_id, user_id, note, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [noteId, id, session.user.id, note.trim()],
    );

    console.log("Note inserted successfully");

    // Update lead's updated_at
    await query("UPDATE leads SET updated_at = NOW() WHERE id = $1", [id]);

    // Return the new note
    const newNote = await queryOne(
      `SELECT id, note, created_at, user_id 
       FROM lead_notes 
       WHERE id = $1`,
      [noteId],
    );

    console.log("New note retrieved:", newNote);

    return NextResponse.json(newNote);
  } catch (error) {
    console.error("Add note error details:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
