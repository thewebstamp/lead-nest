import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { FollowupService } from "@/lib/services/followup/followup-service";

export async function GET(request: NextRequest) {
  try {
    // This endpoint would be called by a cron job
    // For security, require an API key
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get all businesses
    const { rows: businesses } = await query<{ id: string }>(
      "SELECT id FROM businesses WHERE onboarding_completed = true",
    );

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const business of businesses) {
      try {
        const followupService = new FollowupService(business.id);

        // Create default schedules if they don't exist
        await followupService.createDefaultSchedules();

        // Check and schedule follow-ups
        await followupService.checkAndScheduleFollowups();

        // Execute pending follow-ups
        await followupService.executePendingFollowups();

        totalProcessed++;
      } catch (error) {
        console.error(`Error processing business ${business.id}:`, error);
        totalErrors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${totalProcessed} businesses, ${totalErrors} errors`,
      processed: totalProcessed,
      errors: totalErrors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
