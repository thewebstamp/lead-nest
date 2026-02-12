// app/dashboard/settings/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { query, queryOne } from "@/lib/db";
import SettingsClient from "@/components/dashboard/settings/settings-client";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    // Fetch business details
    const business = await queryOne<{
        id: string;
        name: string;
        email: string;
        slug: string;
        service_types: string[];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        settings: any;
        created_at: Date;
    }>(
        "SELECT id, name, email, slug, service_types, settings, created_at FROM businesses WHERE id = $1",
        [session.user.businessId]
    );

    if (!business) {
        redirect("/onboarding");
    }

    // Fetch team members
    const { rows: teamMembers } = await query<{
        user_id: string;
        email: string;
        name: string | null;
        role: string;
        is_default: boolean;
        created_at: Date;
    }>(
        `SELECT 
      ubr.user_id,
      u.email,
      u.name,
      ubr.role,
      ubr.is_default,
      ubr.created_at
     FROM user_business_relations ubr
     JOIN users u ON ubr.user_id = u.id
     WHERE ubr.business_id = $1
     ORDER BY ubr.created_at DESC`,
        [session.user.businessId]
    );

    return (
        <SettingsClient
            business={business}
            teamMembers={teamMembers}
            currentUserRole={session.user.role || "owner"}
        />
    );
}