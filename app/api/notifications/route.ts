import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { NotificationService } from "@/lib/services/notifications/notification-service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const notificationService = new NotificationService(
      session.user.businessId,
    );
    const notifications = await notificationService.getUnreadNotifications(
      session.user.id,
    );

    return NextResponse.json({
      notifications,
      unreadCount: notifications.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get notifications error:", error);
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
    const { notificationId, markAll } = body;

    const notificationService = new NotificationService(
      session.user.businessId,
    );

    if (markAll) {
      await notificationService.markAllAsRead(session.user.id);
      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    if (notificationId) {
      await notificationService.markAsRead(notificationId);
      return NextResponse.json({
        success: true,
        message: "Notification marked as read",
      });
    }

    return NextResponse.json(
      { message: "No action specified" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
