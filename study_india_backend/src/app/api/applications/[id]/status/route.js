import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendStatusUpdateEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body;

        const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        // Get application info
        const { data: app } = await supabaseAdmin
            .from('applications')
            .select('application_id, student_name, student_email')
            .eq('id', id)
            .single();

        // Update status
        const { data: updated, error } = await supabaseAdmin
            .from('applications')
            .update({
                status: status,
                notes: notes || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, status, application_id')
            .single();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // Send email using your existing function
        if (app?.student_email) {
            try {
                await sendStatusUpdateEmail(
                    app.student_email,
                    app.student_name,
                    status,
                    app.application_id
                );
                console.log('✅ Status email sent to:', app.student_email);
            } catch (emailError) {
                console.error('Email failed:', emailError.message);
            }
        }

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update status' },
            { status: 500 }
        );
    }
}