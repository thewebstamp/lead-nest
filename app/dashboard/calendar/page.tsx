/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/calendar/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { query } from "@/lib/db";
import CalendarDashboard from "@/components/dashboard/calendar/calendar-dashboard";

export default async function CalendarPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    const businessId = session.user.businessId;

    /**
     * Fetch all required data in parallel
     */
    const [eventsResult, unscheduledLeadsResult, upcomingEventsResult, scheduledLeadsResult] =
        await Promise.all([
            // Calendar events
            query<{
                id: string;
                title: string;
                description: string;
                event_type: string;
                start_time: Date;
                end_time: Date;
                status: string;
                location: string;
                lead_id: string | null;
                lead_name: string | null;
                lead_email: string | null;
                participants: any;
                reminders: any;
            }>(
                `SELECT 
                    e.*,
                    l.name as lead_name,
                    l.email as lead_email
                 FROM calendar_events e
                 LEFT JOIN leads l ON e.lead_id = l.id
                 WHERE e.business_id = $1
                   AND e.status != 'cancelled'
                 ORDER BY e.start_time`,
                [businessId]
            ),

            // Unscheduled leads (leads without calendar events)
            query<{
                id: string;
                name: string;
                email: string;
                phone: string;
                service_type: string;
                status: string;
                priority: string;
                last_contacted_at: Date | null;
            }>(
                `SELECT 
            l.id,
            l.name,
            l.email,
            l.phone,
            l.service_type,
            l.status,
            l.priority,
            l.last_contacted_at
         FROM leads l
         LEFT JOIN calendar_events ce ON l.id = ce.lead_id 
            AND ce.status NOT IN ('cancelled', 'completed')
         WHERE l.business_id = $1
           AND l.status IN ('new', 'contacted', 'quoted', 'booked')
           AND ce.id IS NULL  -- This ensures no active calendar event exists
         ORDER BY
            CASE l.status
                WHEN 'new' THEN 1
                WHEN 'contacted' THEN 2
                WHEN 'quoted' THEN 3
                WHEN 'booked' THEN 4
                ELSE 5
            END,
            l.created_at DESC
         LIMIT 50`,
                [businessId]
            ),

            // Upcoming events
            query<{
                id: string;
                title: string;
                start_time: Date;
                end_time: Date;
                event_type: string;
                status: string;
                lead_name: string | null;
                location: string | null;
            }>(
                `SELECT 
                    e.id,
                    e.title,
                    e.start_time,
                    e.end_time,
                    e.event_type,
                    e.status,
                    l.name as lead_name,
                    e.location
                 FROM calendar_events e
                 LEFT JOIN leads l ON e.lead_id = l.id
                 WHERE e.business_id = $1
                   AND e.start_time >= NOW()
                   AND e.status != 'cancelled'
                 ORDER BY e.start_time
                 LIMIT 20`,
                [businessId]
            ),

            // New: Scheduled leads (leads with calendar events)
            query<{
                id: string;
                name: string;
                email: string;
                phone: string;
                service_type: string;
                lead_status: string;
                event_id: string;
                event_title: string;
                event_status: string;
                event_start_time: Date;
                event_end_time: Date;
                event_type: string;
            }>(
                `SELECT 
            l.id,
            l.name,
            l.email,
            l.phone,
            l.service_type,
            l.status as lead_status,
            e.id as event_id,
            e.title as event_title,
            e.status as event_status,
            e.start_time as event_start_time,
            e.end_time as event_end_time,
            e.event_type
         FROM leads l
         INNER JOIN calendar_events e ON l.id = e.lead_id
         WHERE l.business_id = $1
           AND e.status IN ('scheduled', 'confirmed', 'completed')
         ORDER BY e.start_time DESC
         LIMIT 20`,
                [businessId]
            ),
        ]);

    /**
     * Convert Date objects → ISO strings
     * (Client components must never receive Date objects)
     */
    const formattedEvents = eventsResult.rows.map(event => ({
        ...event,
        start_time: event.start_time.toISOString(),
        end_time: event.end_time.toISOString(),
    }));

    const formattedUpcomingEvents = upcomingEventsResult.rows.map(event => ({
        ...event,
        start_time: event.start_time.toISOString(),
        end_time: event.end_time.toISOString(),
    }));

    // Format scheduled leads dates
    const formattedScheduledLeads = scheduledLeadsResult.rows.map(lead => ({
        ...lead,
        event_start_time: lead.event_start_time.toISOString(),
        event_end_time: lead.event_end_time.toISOString(),
    }));

    return (
        <CalendarDashboard
            events={formattedEvents}
            unscheduledLeads={unscheduledLeadsResult.rows}
            scheduledLeads={formattedScheduledLeads}
            upcomingEvents={formattedUpcomingEvents}
            businessId={businessId}
            userEmail={session.user.email || ""}
            userName={session.user.name || ""}
        />
    );
}
