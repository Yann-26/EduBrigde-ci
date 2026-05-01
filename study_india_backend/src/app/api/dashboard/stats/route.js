import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';


// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get application counts by status
        const { data: applications, error: appError } = await supabaseAdmin
            .from('applications')
            .select('status');

        if (appError) throw appError;

        // Get payment stats
        const { data: payments, error: payError } = await supabaseAdmin
            .from('payments')
            .select('amount, status');

        // Get university count
        const { count: totalUniversities } = await supabaseAdmin
            .from('universities')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Get user count
        const { count: totalUsers } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Get visa stats
        const { data: visaApps } = await supabaseAdmin
            .from('visa_applications')
            .select('status');

        const { data: visaSteps } = await supabaseAdmin
            .from('visa_steps')
            .select('status');

        // Calculate stats
        const totalApplications = (applications || []).length;
        const pendingReview = (applications || []).filter(a => a.status === 'pending').length;
        const underReview = (applications || []).filter(a => a.status === 'under_review').length;
        const approved = (applications || []).filter(a => a.status === 'approved').length;
        const rejected = (applications || []).filter(a => a.status === 'rejected').length;

        const totalRevenue = (payments || [])
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        // Get recent applications (last 5)
        const { data: recentApps } = await supabaseAdmin
            .from('applications')
            .select(`
                id,
                application_id,
                student_name,
                student_email,
                student_country,
                course,
                status,
                payment_status,
                created_at,
                university:universities(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            success: true,
            data: {
                // Application stats
                total_applications: totalApplications,
                pending_review: pendingReview,
                under_review: underReview,
                approved: approved,
                rejected: rejected,

                // Payment stats
                total_revenue: totalRevenue,

                // Counts
                totalUniversities: totalUniversities || 0,
                totalUsers: totalUsers || 0,

                // Visa stats
                visa: {
                    total: (visaApps || []).length,
                    inProgress: (visaApps || []).filter(v => v.status === 'in_progress').length,
                    completed: (visaApps || []).filter(v => v.status === 'completed').length,
                    stepsPendingReview: (visaSteps || []).filter(s => s.status === 'submitted').length,
                },

                // Recent data
                recentApplications: recentApps || [],
            },
        });

    } catch (error) {
        console.error('❌ Get stats error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}