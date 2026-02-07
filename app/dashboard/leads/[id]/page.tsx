// app/dashboard/leads/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect, notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import LeadDetailClient from "@/components/dashboard/leads/lead-detail-client";

interface LeadDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    const { id } = await params;

    // Fetch lead details
    const lead = await queryOne<{
        id: string;
        business_id: string;
        name: string;
        email: string;
        phone: string;
        service_type: string;
        location: string;
        status: string;
        priority: string;
        tags: string;
        created_at: Date;
        message: string;
        qualification_notes: string;
        source: string;
        internal_notes: string;
    }>(
        `SELECT * FROM leads WHERE id = $1 AND business_id = $2`,
        [id, session.user.businessId]
    );

    if (!lead) {
        notFound();
    }

    // Fetch notes for this lead
    const { rows: notes } = await query<{
        id: string;
        note: string;
        created_at: Date;
        user_id: string | null;
    }>(
        `SELECT id, note, created_at, user_id 
     FROM lead_notes 
     WHERE lead_id = $1 
     ORDER BY created_at DESC`,
        [id]
    );

    return (
        <LeadDetailClient
            lead={lead}
            notes={notes}
            businessId={session.user.businessId}
        />
    );
}