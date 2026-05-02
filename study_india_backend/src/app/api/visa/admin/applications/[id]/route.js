import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        await requireAdmin();
        const { id } = await params;

        const { data: visaApp, error } = await supabaseAdmin
            .from('visa_applications')
            .select(`
                *,
                user:users!user_id(id, name, email, phone),
                steps:visa_steps(
                    *,
                    documents:visa_documents(*),
                    reviewer:admin_reviewed_by(id, name)
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: visaApp,
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}