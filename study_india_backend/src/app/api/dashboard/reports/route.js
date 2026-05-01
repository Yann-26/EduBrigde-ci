import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';


// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '6months';

        // Calculate start date
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case '30days':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90days':
                startDate.setDate(now.getDate() - 90);
                break;
            case '1year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 6);
        }

        const startDateStr = startDate.toISOString().split('T')[0];

        // Get all applications for stats
        const { data: allApps, error: appsError } = await supabaseAdmin
            .from('applications')
            .select('id, course, status, student_country, created_at');

        if (appsError) throw appsError;

        // Get payments
        const { data: allPayments, error: payError } = await supabaseAdmin
            .from('payments')
            .select('amount, status, created_at');

        if (payError) throw payError;

        // Calculate monthly application trends
        const monthlyMap = {};
        (allApps || []).forEach(app => {
            const date = new Date(app.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'short' });

            if (!monthlyMap[key]) {
                monthlyMap[key] = { month: monthName, applications: 0, approved: 0, revenue: 0 };
            }
            monthlyMap[key].applications++;
            if (app.status === 'approved') monthlyMap[key].approved++;
        });

        // Add revenue to monthly data
        (allPayments || []).forEach(payment => {
            if (payment.status === 'completed') {
                const date = new Date(payment.created_at);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyMap[key]) {
                    monthlyMap[key].revenue += parseFloat(payment.amount) || 0;
                }
            }
        });

        const applicationTrends = Object.values(monthlyMap)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-6);

        // Country distribution
        const countryMap = {};
        (allApps || []).forEach(app => {
            const country = app.student_country || 'Unknown';
            countryMap[country] = (countryMap[country] || 0) + 1;
        });
        const countryDistribution = Object.entries(countryMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        // Course distribution
        const courseMap = {};
        (allApps || []).forEach(app => {
            const course = app.course || 'Unknown';
            courseMap[course] = (courseMap[course] || 0) + 1;
        });
        const courseDistribution = Object.entries(courseMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        // Calculate KPI stats
        const totalApplications = (allApps || []).length;
        const approvedCount = (allApps || []).filter(a => a.status === 'approved').length;
        const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;
        const totalRevenue = (allPayments || [])
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                applicationTrends,
                countryDistribution,
                courseDistribution,
                kpi: {
                    totalApplications,
                    approvalRate,
                    totalRevenue,
                    activeStudents: totalApplications,
                },
            },
        });

    } catch (error) {
        console.error('❌ Get reports error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch reports' },
            { status: 500 }
        );
    }
}