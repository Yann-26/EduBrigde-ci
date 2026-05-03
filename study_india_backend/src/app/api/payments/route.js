import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        console.log('Fetching payments...');

        let query = supabaseAdmin
            .from('payments')
            .select(`
                *,
                application:applications(application_id, student_name, course)
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`student_name.ilike.%${search}%,transaction_id.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Payments query error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        console.log(`Found ${data?.length || 0} payments`);

        return NextResponse.json({
            success: true,
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });

    } catch (error) {
        console.error('Get payments error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { applicationId, amount, method, studentName, studentEmail } = body;

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .insert({
                application_id: applicationId,
                amount,
                method,
                student_name: studentName,
                student_email: studentEmail,
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: payment,
        }, { status: 201 });

    } catch (error) {
        console.error('Create payment error:', error);
        return NextResponse.json(
            { error: 'Failed to create payment' },
            { status: 500 }
        );
    }
}