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

    // Fetch events for current month
    // const now = new Date();
    // const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [events, leadsForScheduling, upcomingEvents] = await Promise.all([
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
            [session.user.businessId]
        ),

        // FIXED: Include ALL leads (not just new/contacted)
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
                id, name, email, phone, service_type, 
                status, priority, last_contacted_at
             FROM leads 
             WHERE business_id = $1
                AND status IN ('new', 'contacted', 'quoted', 'booked')
             ORDER BY 
                CASE status 
                    WHEN 'new' THEN 1
                    WHEN 'contacted' THEN 2
                    WHEN 'quoted' THEN 3
                    WHEN 'booked' THEN 4
                    ELSE 5
                END,
                created_at DESC
             LIMIT 50`,
            [session.user.businessId]
        ),

        // Upcoming events - ALL future events, not just 7 days
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
            [session.user.businessId]
        )
    ]);

    return (
        <CalendarDashboard
            events={events.rows}
            leads={leadsForScheduling.rows}
            upcomingEvents={upcomingEvents.rows}
            businessId={session.user.businessId}
            userEmail={session.user.email || ''}
            userName={session.user.name || ''}
        />
    );
}