import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const user = await requireAuth();
        const { id } = params;
        const body = await request.json();
        const { status, notes } = body;

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .update({
                status,
                verified_by: user.id,
                verified_at: new Date().toISOString(),
                notes: notes || undefined,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Update application payment status if completed
        if (status === 'completed') {
            await supabaseAdmin
                .from('applications')
                .update({ payment_status: 'paid' })
                .eq('id', payment.application_id);
        }

        return NextResponse.json({
            success: true,
            data: payment,
        });

    } catch (error) {
        console.error('Update payment error:', error);
        return NextResponse.json(
            { error: 'Failed to update payment' },
            { status: 500 }
        );
    }
}