// lib/email/resend.ts
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Replace with your actual key

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "LeadNest <noreply@leadnest.app>", // Replace with your domain
      to: email,
      subject: "Reset Your Password - LeadNest",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4f46e5;
                    text-decoration: none;
                }
                .content {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 40px;
                    margin: 20px 0;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .button {
                    display: inline-block;
                    background-color: #4f46e5;
                    color: white;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                }
                .warning {
                    background-color: #fef3c7;
                    border: 1px solid #fbbf24;
                    border-radius: 6px;
                    padding: 12px;
                    margin: 20px 0;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">LeadNest</div>
                </div>
                
                <div class="content">
                    <h1 style="color: #4f46e5; margin-top: 0;">Reset Your Password</h1>
                    
                    <p>Hello,</p>
                    
                    <p>You requested to reset your password for your LeadNest account. Click the button below to create a new password:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #4f46e5; font-size: 14px;">${resetUrl}</p>
                    
                    <div class="warning">
                        <strong>⚠️ This link will expire in 1 hour.</strong>
                        <p style="margin: 8px 0 0 0; font-size: 13px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    </div>
                    
                    <p style="margin-top: 30px;">Best regards,<br>The LeadNest Team</p>
                </div>
                
                <div class="footer">
                    <p>© ${new Date().getFullYear()} LeadNest. All rights reserved.</p>
                    <p>This email was sent to ${email}. If you didn't request this, please ignore it.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Reset Your Password\n\nHello,\n\nYou requested to reset your password for your LeadNest account. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe LeadNest Team`,
    });

    if (error) {
      console.error("Error sending reset email:", error);
      throw error;
    }

    console.log("Password reset email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "LeadNest <welcome@leadnest.app>",
      to: email,
      subject: "Welcome to LeadNest! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to LeadNest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #4f46e5; margin-top: 0;">Welcome to LeadNest, ${name}! 🎉</h1>
                
                <p>Thank you for signing up. We're excited to have you on board!</p>
                
                <p>With LeadNest, you can:</p>
                <ul>
                    <li>Capture leads through customizable intake forms</li>
                    <li>Manage your leads in a centralized dashboard</li>
                    <li>Schedule appointments directly from lead submissions</li>
                    <li>Track your conversion rates and performance</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">Go to Dashboard</a>
                </div>
                
                <p>If you have any questions or need help getting started, please don't hesitate to reach out to our support team.</p>
                
                <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
                    Best regards,<br>
                    The LeadNest Team
                </p>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return;
    }

    console.log("Welcome email sent successfully:", data);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}
