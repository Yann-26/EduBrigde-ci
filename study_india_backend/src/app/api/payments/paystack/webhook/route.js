import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();

        // Paystack sends webhook events
        const event = body.event;

        console.log('📥 Paystack webhook:', event);

        if (event === 'charge.success') {
            const { reference, amount, metadata, customer } = body.data;

            console.log('✅ Payment successful:', reference, 'Amount:', amount / 100);

            // Update payment status in database
            const { error: payError } = await supabaseAdmin
                .from('payments')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                })
                .eq('transaction_id', reference);

            if (payError) {
                console.error('Payment update error:', payError);
            }

            // Update application payment status
            if (metadata?.application_id) {
                await supabaseAdmin
                    .from('applications')
                    .update({ payment_status: 'paid' })
                    .eq('id', metadata.application_id);
            }

            console.log('✅ Payment confirmed for:', reference);
        }

        // Always return 200 to Paystack
        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}