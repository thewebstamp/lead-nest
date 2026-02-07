// app/dashboard/leads/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import LeadsDashboard from "@/components/dashboard/leads/leads-dashboard";

export default async function LeadsPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.businessId) {
        redirect("/auth/signin");
    }

    // Fetch leads for this business
    const { rows: leads } = await query<{
        id: string;
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
    }>(
        `SELECT 
      id, name, email, phone, service_type, location,
      status, priority, tags, created_at, message, qualification_notes
     FROM leads 
     WHERE business_id = $1 
     ORDER BY 
       CASE priority 
         WHEN 'high' THEN 1
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 3
         ELSE 4
       END,
       created_at DESC`,
        [session.user.businessId]
    );

    // Fetch lead counts by status for stats
    const { rows: statusCounts } = await query<{ status: string; count: string }>(
        `SELECT status, COUNT(*) as count 
     FROM leads 
     WHERE business_id = $1 
     GROUP BY status`,
        [session.user.businessId]
    );

    const stats = {
        total: leads.length,
        new: leads.filter(lead => lead.status === 'new').length,
        contacted: leads.filter(lead => lead.status === 'contacted').length,
        quoted: leads.filter(lead => lead.status === 'quoted').length,
        booked: leads.filter(lead => lead.status === 'booked').length,
        lost: leads.filter(lead => lead.status === 'lost').length,
    };

    return (
        <LeadsDashboard
            leads={leads}
            stats={stats}
            businessId={session.user.businessId}
        />
    );
}