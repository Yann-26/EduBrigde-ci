import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sendStatusUpdateEmail } from '@/lib/email';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const user = await requireAuth();
        const { id } = params;
        const body = await request.json();
        const { status, notes } = body;

        const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        // Get current application
        const { data: application } = await supabaseAdmin
            .from('applications')
            .select('timeline, student_name, student_email, application_id')
            .eq('id', id)
            .single();

        if (!application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        // Update timeline
        const timeline = application.timeline || [];
        timeline.push({
            action: `status_changed_to_${status}`,
            description: notes || `Application status changed to ${status}`,
            performedBy: user.id,
            timestamp: new Date().toISOString(),
        });

        // Update application
        const { data: updated, error } = await supabaseAdmin
            .from('applications')
            .update({
                status,
                timeline,
                notes: notes || application.notes,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Send email notification
        try {
            await sendStatusUpdateEmail(
                application.student_email,
                application.student_name,
                status,
                application.application_id
            );
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
        }

        return NextResponse.json({
            success: true,
            data: updated,
        });

    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json(
            { error: 'Failed to update status' },
            { status: 500 }
        );
    }
}