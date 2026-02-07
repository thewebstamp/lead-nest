// app/dashboard/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/config";
import { queryOne } from "@/lib/db";
import DashboardLayoutClient from "@/components/dashboard/layout-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    // Fetch business details
    const business = await queryOne<{
        name: string;
        slug: string;
        email: string;
        service_types: string[];
        created_at: Date;
    }>(
        "SELECT name, slug, email, service_types, created_at FROM businesses WHERE id = $1",
        [session.user.businessId]
    );

    if (!business) {
        redirect("/onboarding");
    }

    return (
        <DashboardLayoutClient
            user={{
                name: session.user?.name,
                email: session.user?.email,
            }}
            business={{
                name: business.name,
                slug: business.slug,
            }}
        >
            {children}
        </DashboardLayoutClient>
    );
}