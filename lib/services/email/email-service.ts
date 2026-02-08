import { query } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string[];
}

interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailData {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, string>;
}

export class EmailService {
  private businessId: string;

  constructor(businessId: string) {
    this.businessId = businessId;
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    const recipients = Array.isArray(data.to) ? data.to : [data.to];
    let allSuccessful = true;

    for (const recipient of recipients) {
      const renderedBody = this.replaceVariables(
        data.body,
        data.variables || {},
      );

      try {
        const response = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: recipient.email,
          subject: data.subject,
          html: this.textToHtml(renderedBody),
        });

        await this.logEmail({
          templateId: data.templateId,
          leadId: data.variables?.leadId,
          recipientEmail: recipient.email,
          subject: data.subject,
          body: renderedBody,
          status: "sent",
          metadata: { resendId: response.data?.id },
        });

        console.log(
          `[EmailService] Sent email to ${recipient.email} (Resend ID: ${response.data?.id})`,
        );
      } catch (error) {
        allSuccessful = false;

        console.error(
          `[EmailService] Failed to send email to ${recipient.email}`,
          error,
        );

        await this.logEmail({
          templateId: data.templateId,
          leadId: data.variables?.leadId,
          recipientEmail: recipient.email,
          subject: data.subject,
          body: renderedBody,
          status: "failed",
          metadata: {
            error:
              error instanceof Error ? error.message : "Unknown email error",
          },
        });
      }
    }

    return allSuccessful;
  }

  async getTemplate(
    type: string,
    triggerEvent?: string,
  ): Promise<EmailTemplate | null> {
    const { rows } = await query<EmailTemplate>(
      `SELECT id, name, subject, body, type, variables
       FROM email_templates
       WHERE business_id = $1
         AND type = $2
         AND ($3::varchar IS NULL OR trigger_event = $3)
         AND is_active = true
       ORDER BY trigger_event NULLS LAST
       LIMIT 1`,
      [this.businessId, type, triggerEvent],
    );

    return rows[0] || null;
  }

  async sendTemplateEmail(
    templateType: string,
    recipient: EmailRecipient,
    variables: Record<string, string>,
    triggerEvent?: string,
  ): Promise<boolean> {
    const template = await this.getTemplate(templateType, triggerEvent);

    if (!template) {
      console.warn(
        `[EmailService] No template found for type=${templateType}, trigger=${triggerEvent}`,
      );
      return false;
    }

    return this.sendEmail({
      to: recipient,
      subject: this.replaceVariables(template.subject, variables),
      body: this.replaceVariables(template.body, variables),
      templateId: template.id,
      variables,
    });
  }

  private replaceVariables(
    text: string,
    variables: Record<string, string>,
  ): string {
    let result = text;

    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value));
    }

    return result;
  }

  private textToHtml(text: string): string {
    return text
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("");
  }

  private async logEmail(data: {
    templateId?: string;
    leadId?: string;
    recipientEmail: string;
    subject: string;
    body: string;
    status: "sent" | "failed";
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await query(
      `INSERT INTO email_logs (
        business_id,
        template_id,
        lead_id,
        recipient_email,
        subject,
        body,
        status,
        metadata,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        this.businessId,
        data.templateId,
        data.leadId,
        data.recipientEmail,
        data.subject,
        data.body,
        data.status,
        JSON.stringify(data.metadata || {}),
      ],
    );
  }

  
  async createDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        name: "Lead Confirmation",
        type: "confirmation",
        trigger_event: "lead_created",
        subject: "Thank you for contacting {{business_name}}!",
        body: `Hi {{lead_name}},

Thank you for reaching out to {{business_name}} about {{service_type}}. We've received your request and will get back to you within 24 hours.

Request Details:
- Service: {{service_type}}
- Location: {{lead_location}}
- Message: {{lead_message}}

We'll contact you at {{lead_email}} or {{lead_phone}}.

Best regards,
{{business_name}} Team`,
        variables: [
          "business_name",
          "lead_name",
          "service_type",
          "lead_location",
          "lead_message",
          "lead_email",
          "lead_phone",
        ],
      },
      {
        name: "New Lead Notification",
        type: "notification",
        trigger_event: "lead_created",
        subject: "🚀 New Lead: {{lead_name}} - {{service_type}}",
        body: `New lead received!

Contact: {{lead_name}}
Email: {{lead_email}}
Phone: {{lead_phone}}
Service: {{service_type}}
Location: {{lead_location}}
Priority: {{lead_priority}}

Message:
{{lead_message}}

Lead Score: {{lead_score}}
Tags: {{lead_tags}}

View lead: {{lead_url}}`,
        variables: [
          "lead_name",
          "lead_email",
          "lead_phone",
          "service_type",
          "lead_location",
          "lead_priority",
          "lead_message",
          "lead_score",
          "lead_tags",
          "lead_url",
        ],
      },
      {
        name: "Follow-up Reminder",
        type: "reminder",
        trigger_event: "lead_stale",
        subject: "⏰ Follow-up needed: {{lead_name}}",
        body: `Follow-up reminder for {{lead_name}}.

Lead has been {{lead_status}} for {{days_stale}} days.

Last contacted: {{last_contact_date}}
Service: {{service_type}}
Priority: {{lead_priority}}

View lead: {{lead_url}}`,
        variables: [
          "lead_name",
          "lead_status",
          "days_stale",
          "last_contact_date",
          "service_type",
          "lead_priority",
          "lead_url",
        ],
      },
    ];

    for (const template of defaultTemplates) {
      const existing = await query(
        "SELECT id FROM email_templates WHERE business_id = $1 AND name = $2",
        [this.businessId, template.name],
      );

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO email_templates (
            business_id, name, type, trigger_event, subject, body, variables, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
          [
            this.businessId,
            template.name,
            template.type,
            template.trigger_event,
            template.subject,
            template.body,
            JSON.stringify(template.variables),
          ],
        );
      }
    }
  }
}
