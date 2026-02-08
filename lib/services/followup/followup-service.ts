//lib/services/followup/followup-service.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { query } from "@/lib/db";

interface FollowupSchedule {
  id: string;
  name: string;
  trigger_condition: {
    status: string[];
    priority: string[];
    days_without_contact: number;
    exclude_tags?: string[];
  };
  actions: {
    type: "email" | "notification" | "task";
    template?: string;
    delay_days?: number;
  }[];
  delay_days: number;
  delay_hours: number;
}

export class FollowupService {
  private businessId: string;

  constructor(businessId: string) {
    this.businessId = businessId;
  }

  async checkAndScheduleFollowups(): Promise<void> {
    console.log(
      `[FollowupService] Checking followups for business: ${this.businessId}`,
    );

    // Get all active follow-up schedules
    const schedules = await this.getActiveSchedules();

    for (const schedule of schedules) {
      await this.processSchedule(schedule);
    }
  }

  private async getActiveSchedules(): Promise<FollowupSchedule[]> {
    const { rows } = await query<FollowupSchedule>(
      `SELECT id, name, trigger_condition, actions, delay_days, delay_hours
       FROM followup_schedules
       WHERE business_id = $1 AND is_active = true
       ORDER BY delay_days, delay_hours`,
      [this.businessId],
    );
    return rows;
  }

  private async processSchedule(schedule: FollowupSchedule): Promise<void> {
    const condition = schedule.trigger_condition;

    // Build query based on trigger conditions
    let queryStr = `
      SELECT l.*,
             EXTRACT(DAY FROM NOW() - COALESCE(l.last_contacted_at, l.created_at)) as days_since_contact
      FROM leads l
      WHERE l.business_id = $1
        AND l.status = ANY($2)
        AND l.priority = ANY($3)
        AND (l.last_contacted_at IS NULL OR l.last_contacted_at < NOW() - INTERVAL '1 day' * $4)
    `;

    const params: any[] = [
      this.businessId,
      condition.status,
      condition.priority,
      condition.days_without_contact,
    ];

    // Exclude leads with certain tags
    if (condition.exclude_tags?.length) {
      queryStr += ` AND NOT (l.tags && $${params.length + 1})`;
      params.push(condition.exclude_tags);
    }

    // Exclude leads that already have pending follow-ups
    queryStr += `
      AND NOT EXISTS (
        SELECT 1 FROM followup_executions fe
        WHERE fe.lead_id = l.id
          AND fe.schedule_id = $${params.length + 1}
          AND fe.status IN ('pending', 'sent')
      )
    `;
    params.push(schedule.id);

    const { rows: leads } = await query(queryStr, params);

    console.log(
      `[FollowupService] Found ${leads.length} leads for schedule: ${schedule.name}`,
    );

    for (const lead of leads) {
      await this.scheduleFollowup(lead, schedule);
    }
  }

  private async scheduleFollowup(
    lead: any,
    schedule: FollowupSchedule,
  ): Promise<void> {
    const scheduledFor = new Date();
    scheduledFor.setDate(scheduledFor.getDate() + schedule.delay_days);
    scheduledFor.setHours(scheduledFor.getHours() + schedule.delay_hours);

    await query(
      `INSERT INTO followup_executions (
        business_id, schedule_id, lead_id,
        status, scheduled_for, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [this.businessId, schedule.id, lead.id, "pending", scheduledFor],
    );

    console.log(
      `[FollowupService] Scheduled follow-up for lead ${lead.id} on ${scheduledFor}`,
    );
  }

  async executePendingFollowups(): Promise<void> {
    const { rows: pending } = await query(
      `SELECT fe.*, l.*, s.actions as schedule_actions
       FROM followup_executions fe
       JOIN leads l ON fe.lead_id = l.id
       JOIN followup_schedules s ON fe.schedule_id = s.id
       WHERE fe.business_id = $1
         AND fe.status = 'pending'
         AND fe.scheduled_for <= NOW()
       ORDER BY fe.scheduled_for
       LIMIT 50`,
      [this.businessId],
    );

    console.log(
      `[FollowupService] Executing ${pending.length} pending followups`,
    );

    for (const followup of pending) {
      try {
        await this.executeFollowup(followup);
        await this.markFollowupAsSent(followup.id);
      } catch (error) {
        console.error(
          `[FollowupService] Failed to execute followup ${followup.id}:`,
          error,
        );
        await this.markFollowupAsFailed(
          followup.id,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }
  }

  private async executeFollowup(followup: any): Promise<void> {
    const actions = followup.schedule_actions;

    for (const action of actions) {
      switch (action.type) {
        case "email":
          await this.sendFollowupEmail(followup, action);
          break;
        case "notification":
          await this.sendFollowupNotification(followup, action);
          break;
        case "task":
          await this.createFollowupTask(followup, action);
          break;
      }
    }
  }

  private async sendFollowupEmail(followup: any, action: any): Promise<void> {
    // Import here to avoid circular dependency
    const { EmailService } = await import("../email/email-service");
    const emailService = new EmailService(this.businessId);

    const variables: Record<string, string> = {
      lead_name: String(followup.name ?? ""),
      lead_email: String(followup.email ?? ""),
      service_type: String(followup.service_type ?? ""),
      days_since_contact: String(Math.floor(followup.days_since_contact || 0)),
      business_name: "Your Business",
    };

    await emailService.sendTemplateEmail(
      action.template || "reminder",
      { email: followup.email, name: followup.name },
      variables,
      "followup_due",
    );
  }

  private async sendFollowupNotification(
    followup: any,
    action: any,
  ): Promise<void> {
    // Import here to avoid circular dependency
    const { NotificationService } =
      await import("../notifications/notification-service");
    const notificationService = new NotificationService(this.businessId);

    await notificationService.createLeadNotification(
      followup.lead_id,
      {
        name: followup.name,
        status: followup.status,
        priority: followup.priority,
        serviceType: followup.service_type,
      },
      "stale",
    );
  }

  private async createFollowupTask(followup: any, action: any): Promise<void> {
    // Create calendar event for follow-up task
    await query(
      `INSERT INTO calendar_events (
        business_id, lead_id, title, description, event_type,
        start_time, end_time, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        this.businessId,
        followup.lead_id,
        `Follow-up: ${followup.name}`,
        `Follow up with ${followup.name} about ${followup.service_type}. Last contacted: ${followup.days_since_contact} days ago.`,
        "task",
        new Date(Date.now() + 3600000), // 1 hour from now
        new Date(Date.now() + 7200000), // 2 hours from now
        "scheduled",
      ],
    );
  }

  private async markFollowupAsSent(followupId: string): Promise<void> {
    await query(
      `UPDATE followup_executions 
       SET status = 'sent', executed_at = NOW()
       WHERE id = $1`,
      [followupId],
    );
  }

  private async markFollowupAsFailed(
    followupId: string,
    error: string,
  ): Promise<void> {
    await query(
      `UPDATE followup_executions 
       SET status = 'failed', result = $2
       WHERE id = $1`,
      [followupId, JSON.stringify({ error })],
    );
  }

  async createDefaultSchedules(): Promise<void> {
    const defaultSchedules = [
      {
        name: "Initial Follow-up",
        trigger_condition: {
          status: ["new"],
          priority: ["high", "medium"],
          days_without_contact: 1,
          exclude_tags: ["do-not-contact", "spam"],
        },
        actions: [
          { type: "notification", delay_days: 0 },
          { type: "email", template: "reminder", delay_days: 0 },
        ],
        delay_days: 1,
        delay_hours: 0,
      },
      {
        name: "7-Day Follow-up",
        trigger_condition: {
          status: ["contacted"],
          priority: ["high", "medium"],
          days_without_contact: 7,
          exclude_tags: ["do-not-contact", "lost"],
        },
        actions: [
          { type: "notification", delay_days: 0 },
          { type: "email", template: "reminder", delay_days: 0 },
          { type: "task", delay_days: 0 },
        ],
        delay_days: 7,
        delay_hours: 0,
      },
      {
        name: "14-Day Final Follow-up",
        trigger_condition: {
          status: ["contacted", "quoted"],
          priority: ["high", "medium", "low"],
          days_without_contact: 14,
          exclude_tags: ["do-not-contact", "spam", "lost"],
        },
        actions: [
          { type: "notification", delay_days: 0 },
          { type: "email", template: "reminder", delay_days: 0 },
        ],
        delay_days: 14,
        delay_hours: 0,
      },
    ];

    for (const schedule of defaultSchedules) {
      const existing = await query(
        "SELECT id FROM followup_schedules WHERE business_id = $1 AND name = $2",
        [this.businessId, schedule.name],
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO followup_schedules (
            business_id, name, trigger_condition, actions,
            delay_days, delay_hours, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [
            this.businessId,
            schedule.name,
            JSON.stringify(schedule.trigger_condition),
            JSON.stringify(schedule.actions),
            schedule.delay_days,
            schedule.delay_hours,
          ],
        );
      }
    }
  }
}
