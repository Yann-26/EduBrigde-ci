import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get all step templates
export async function GET() {
    try {
        const { data: templates, error } = await supabaseAdmin
            .from('visa_step_templates')
            .select('*')
            .eq('is_active', true)
            .order('step_number');

        if (error) {
            console.error('Get templates error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: templates || [],
        });
    } catch (error) {
        console.error('Get templates error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create new step template (admin only)
export async function POST(request) {
    try {
        await requireAdmin();
        const body = await request.json();

        const { data: template, error } = await supabaseAdmin
            .from('visa_step_templates')
            .insert(body)
            .select()
            .single();

        if (error) {
            console.error('Create template error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: template,
        }, { status: 201 });
    } catch (error) {
        console.error('Create template error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}