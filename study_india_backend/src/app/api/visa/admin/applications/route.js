import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('visa_applications')
            .select(`
                *,
                user:users!user_id(id, name, email),
                steps:visa_steps(
                    *,
                    documents:visa_documents(*),
                    reviewer:admin_reviewed_by(id, name)
                )
            `)
            .order('created_at', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: data || [],
        });

    } catch (error) {
        console.error('Get visa applications error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}