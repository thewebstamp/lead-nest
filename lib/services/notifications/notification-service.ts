/* eslint-disable @typescript-eslint/no-explicit-any */
import { query } from "@/lib/db";

export interface NotificationData {
  userId?: string;
  title: string;
  message: string;
  type: "lead" | "followup" | "calendar" | "system";
  entityType?: "lead" | "event" | "task";
  entityId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  scheduledFor?: Date;
  metadata?: Record<string, any>;
}

export class NotificationService {
  private businessId: string;

  constructor(businessId: string) {
    this.businessId = businessId;
  }

  async createNotification(data: NotificationData): Promise<string> {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO app_notifications (
        business_id, user_id, title, message, type,
        entity_type, entity_id, priority, status,
        action_url, scheduled_for, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        this.businessId,
        data.userId,
        data.title,
        data.message,
        data.type,
        data.entityType,
        data.entityId,
        data.priority || "medium",
        "unread",
        data.actionUrl,
        data.scheduledFor,
        JSON.stringify(data.metadata || {}),
      ],
    );

    return rows[0].id;
  }

  async getUnreadNotifications(userId?: string): Promise<any[]> {
    const { rows } = await query(
      `SELECT 
        id, title, message, type, entity_type, entity_id,
        priority, action_url, metadata, created_at
       FROM app_notifications
       WHERE business_id = $1
         AND ($2::uuid IS NULL OR user_id = $2)
         AND status = 'unread'
         AND (scheduled_for IS NULL OR scheduled_for <= NOW())
       ORDER BY 
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
           ELSE 5
         END,
         created_at DESC
       LIMIT 50`,
      [this.businessId, userId],
    );

    return rows;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await query(
      `UPDATE app_notifications 
       SET status = 'read', updated_at = NOW()
       WHERE id = $1 AND business_id = $2`,
      [notificationId, this.businessId],
    );
  }

  async markAllAsRead(userId?: string): Promise<void> {
    await query(
      `UPDATE app_notifications 
       SET status = 'read', updated_at = NOW()
       WHERE business_id = $1
         AND ($2::uuid IS NULL OR user_id = $2)
         AND status = 'unread'`,
      [this.businessId, userId],
    );
  }

  async createLeadNotification(
    leadId: string,
    leadData: {
      name: string;
      status: string;
      priority: string;
      serviceType: string;
    },
    notificationType: "new" | "stale" | "overdue" | "converted",
  ): Promise<void> {
    const notifications: Record<string, NotificationData> = {
      new: {
        title: "🎯 New Lead",
        message: `New lead from ${leadData.name} for ${leadData.serviceType}`,
        type: "lead",
        entityType: "lead",
        entityId: leadId,
        priority: "high",
        actionUrl: `/dashboard/leads/${leadId}`,
        metadata: { leadPriority: leadData.priority },
      },
      stale: {
        title: "⏰ Stale Lead",
        message: `${leadData.name} has been ${leadData.status} for 3+ days`,
        type: "followup",
        entityType: "lead",
        entityId: leadId,
        priority: "medium",
        actionUrl: `/dashboard/leads/${leadId}`,
        metadata: { daysStale: 3 },
      },
      overdue: {
        title: "🚨 Overdue Follow-up",
        message: `Urgent: ${leadData.name} requires immediate follow-up`,
        type: "followup",
        entityType: "lead",
        entityId: leadId,
        priority: "urgent",
        actionUrl: `/dashboard/leads/${leadId}`,
        metadata: { daysOverdue: 7 },
      },
      converted: {
        title: "🎉 Lead Converted",
        message: `${leadData.name} has been booked!`,
        type: "lead",
        entityType: "lead",
        entityId: leadId,
        priority: "low",
        actionUrl: `/dashboard/leads/${leadId}`,
        metadata: { status: "booked" },
      },
    };

    const notification = notifications[notificationType];
    if (notification) {
      // Send to all team members in the business
      const teamMembers = await this.getTeamMembers();

      for (const member of teamMembers) {
        await this.createNotification({
          ...notification,
          userId: member.user_id,
        });
      }
    }
  }

  private async getTeamMembers(): Promise<{ user_id: string }[]> {
    const { rows } = await query<{ user_id: string }>(
      `SELECT user_id FROM user_business_relations 
       WHERE business_id = $1`,
      [this.businessId],
    );
    return rows;
  }
}
