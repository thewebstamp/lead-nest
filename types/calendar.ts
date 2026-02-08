//types/calendar.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CalendarEventDTO {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string;
  lead_id: string | null;
  lead_name: string | null;
  lead_email: string | null;
  participants: any;
  reminders: any;
}
