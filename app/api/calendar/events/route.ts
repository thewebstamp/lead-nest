// app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    const { rows: events } = await query(
      `SELECT 
                e.*,
                l.name as lead_name,
                l.email as lead_email,
                l.phone as lead_phone
             FROM calendar_events e
             LEFT JOIN leads l ON e.lead_id = l.id
             WHERE e.business_id = $1
                AND ($2::timestamp IS NULL OR e.start_time >= $2)
                AND ($3::timestamp IS NULL OR e.end_time <= $3)
                AND e.status != 'cancelled'
             ORDER BY e.start_time`,
      [session.user.businessId, startDate, endDate],
    );

    return NextResponse.json(events);
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      event_type,
      start_time,
      end_time,
      location,
      lead_id,
      participants,
      reminders,
    } = body;

    // Validate required fields
    if (!title || !start_time || !end_time) {
      return NextResponse.json(
        { message: "Title, start time, and end time are required" },
        { status: 400 },
      );
    }

    // Check if lead belongs to business
    if (lead_id) {
      const leadCheck = await queryOne(
        "SELECT id FROM leads WHERE id = $1 AND business_id = $2",
        [lead_id, session.user.businessId],
      );
      if (!leadCheck) {
        return NextResponse.json(
          { message: "Lead not found or unauthorized" },
          { status: 404 },
        );
      }
    }

    const eventId = uuidv4();

    // Create event
    await query(
      `INSERT INTO calendar_events (
                id, business_id, title, description, event_type,
                start_time, end_time, location, lead_id,
                participants, reminders, status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        eventId,
        session.user.businessId,
        title,
        description || "",
        event_type || "appointment",
        new Date(start_time),
        new Date(end_time),
        location || "",
        lead_id || null,
        JSON.stringify(participants || []),
        JSON.stringify(reminders || []),
        "scheduled",
      ],
    );

    // Update lead status if linked
    if (lead_id) {
      await query(
        `UPDATE leads SET status = 'contacted', updated_at = NOW() WHERE id = $1`,
        [lead_id],
      );
    }

    // Return the created event
    const event = await queryOne(
      `SELECT 
                e.*,
                l.name as lead_name,
                l.email as lead_email
             FROM calendar_events e
             LEFT JOIN leads l ON e.lead_id = l.id
             WHERE e.id = $1`,
      [eventId],
    );

    return NextResponse.json(event);
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
