import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const event = body.event;

        console.log('📥 Paystack webhook:', event);

        if (event === 'charge.success') {
            const { reference, amount } = body.data;
            // reference is TXN****** from Paystack

            console.log('💰 Payment completed:', reference, 'Amount:', amount / 100);

            const { error } = await supabaseAdmin
                .from('payments')
                .update({
                    status: 'completed',
                    updated_at: new Date().toISOString(),
                })
                .eq('transaction_id', reference);

            if (error) {
                console.error('❌ Update error:', error.message);
            } else {
                console.log('✅ Payment updated:', reference);
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}