// app/api/calendar/auto-create-events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = session.user;

    // Find booked leads without calendar events
    const { rows: bookedLeadsWithoutEvents } = await query<{
      id: string;
      name: string;
      email: string;
      service_type: string;
      location: string | null;
      created_at: Date;
    }>(
      `SELECT 
                l.id, l.name, l.email, l.service_type, 
                l.location, l.created_at
             FROM leads l
             LEFT JOIN calendar_events e ON l.id = e.lead_id
             WHERE l.business_id = $1
                AND l.status = 'booked'
                AND e.id IS NULL
             ORDER BY l.created_at DESC`,
      [businessId],
    );

    const createdEvents = [];

    for (const lead of bookedLeadsWithoutEvents) {
      // Create event ID
      const eventId = uuidv4();

      // Default event time: 2 days from lead creation, 1 hour duration
      const startTime = new Date(lead.created_at);
      startTime.setDate(startTime.getDate() + 2);
      startTime.setHours(10, 0, 0, 0); // 10:00 AM

      const endTime = new Date(startTime);
      endTime.setHours(11, 0, 0, 0); // 11:00 AM

      await query(
        `INSERT INTO calendar_events (
                    id, business_id, lead_id, title, description, event_type,
                    start_time, end_time, status, location, participants, 
                    reminders, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
        [
          eventId,
          businessId,
          lead.id,
          `Appointment: ${lead.name} - ${lead.service_type}`,
          `Booked service: ${lead.service_type}. Customer contact: ${lead.email}`,
          "appointment",
          startTime,
          endTime,
          "scheduled",
          lead.location || "TBD",
          JSON.stringify([lead.email]),
          JSON.stringify([{ type: "email", hours_before: 24 }]),
        ],
      );

      createdEvents.push({
        lead_id: lead.id,
        event_id: eventId,
        title: `Appointment: ${lead.name}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdEvents.length} calendar events`,
      createdEvents,
    });
  } catch (error) {
    console.error("Auto-create events error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
