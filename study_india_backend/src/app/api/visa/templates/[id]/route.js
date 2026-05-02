import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Get single template
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const { data: template, error } = await supabaseAdmin
            .from('visa_step_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Update step template
export async function PUT(request, { params }) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await request.json();

        // Remove id from body if present
        delete body.id;
        delete body.created_at;

        const { data: template, error } = await supabaseAdmin
            .from('visa_step_templates')
            .update({
                ...body,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update template error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Update template error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete (deactivate) step template
export async function DELETE(request, { params }) {
    try {
        await requireAdmin();
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('visa_step_templates')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            console.error('Delete template error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: 'Template deactivated' });
    } catch (error) {
        console.error('Delete template error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}