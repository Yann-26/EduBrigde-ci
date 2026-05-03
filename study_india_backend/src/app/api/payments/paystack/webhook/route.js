import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const event = body.event;

        console.log('📥 Paystack webhook:', event);

        if (event === 'charge.success') {
            const { reference, amount, metadata, customer } = body.data;

            console.log('✅ Payment successful:', reference);

            // Update payment in database
            const { error } = await supabaseAdmin
                .from('payments')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                })
                .eq('transaction_id', reference);

            if (error) {
                console.error('Payment update error:', error);
            } else {
                console.log('Payment marked as completed:', reference);
            }

            // Update application payment status
            if (metadata?.application_id) {
                await supabaseAdmin
                    .from('applications')
                    .update({ payment_status: 'paid' })
                    .eq('id', metadata.application_id);
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}