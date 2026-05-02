import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get single application detail
export async function GET(request, { params }) {
    try {
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

        if (error || !visaApp) {
            return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: visaApp });

    } catch (error) {
        console.error('Get visa app error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE - Delete visa application and all related data
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        console.log('🗑️ Deleting visa application:', id);

        // 1. Get all steps for this application
        const { data: steps } = await supabaseAdmin
            .from('visa_steps')
            .select('id')
            .eq('visa_application_id', id);

        if (steps && steps.length > 0) {
            const stepIds = steps.map(s => s.id);

            // 2. Delete documents for these steps
            const { error: docError } = await supabaseAdmin
                .from('visa_documents')
                .delete()
                .in('visa_step_id', stepIds);

            if (docError) console.error('Doc delete error:', docError);

            // 3. Delete steps
            const { error: stepError } = await supabaseAdmin
                .from('visa_steps')
                .delete()
                .eq('visa_application_id', id);

            if (stepError) console.error('Step delete error:', stepError);
        }

        // 4. Delete the visa application
        const { error } = await supabaseAdmin
            .from('visa_applications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('App delete error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('✅ Visa application deleted');

        return NextResponse.json({
            success: true,
            message: 'Visa application deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}