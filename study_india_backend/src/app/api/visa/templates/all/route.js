import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    try {
        await requireAdmin();

        const { data: templates, error } = await supabaseAdmin
            .from('visa_step_templates')
            .select('*')
            .order('step_number');

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: templates || [],
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}