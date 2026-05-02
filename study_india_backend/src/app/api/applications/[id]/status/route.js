import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendStatusUpdateEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        console.log('Status update:', { id, status });

        // Validate
        const validStatuses = ['pending', 'under_review', 'approved', 'rejected'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        // Simple update - JUST the status field, no timeline
        const { data: updated, error } = await supabaseAdmin
            .from('applications')
            .update({
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, status, application_id')
            .single();

        if (error) {
            console.error('Update error:', error.message);
            console.error('Full error:', JSON.stringify(error));
            return NextResponse.json({
                success: false,
                error: error.message,
                details: error.details,
                hint: error.hint
            }, { status: 500 });
        }

        console.log('✅ Status updated:', updated?.application_id, '→', status);

        return NextResponse.json({
            success: true,
            message: `Status updated to ${status}`,
            data: updated,
        });

    } catch (error) {
        console.error('Update status error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update status' },
            { status: 500 }
        );
    }
}