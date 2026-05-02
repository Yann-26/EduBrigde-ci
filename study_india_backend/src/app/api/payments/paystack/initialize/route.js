import { NextResponse } from 'next/server';
import { initializePayment } from '@/lib/paystack';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount, applicationId } = body;

        if (!email || !amount || !applicationId) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        // Generate unique reference
        const reference = `EDU-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Initialize Paystack payment
        const payment = await initializePayment({
            email,
            amount,
            reference,
            metadata: { application_id: applicationId },
        });

        // Save pending payment to database
        await supabaseAdmin.from('payments').insert({
            application_id: applicationId,
            transaction_id: reference,
            amount: amount,
            currency: 'XOF',
            method: 'Paystack',
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: payment.authorization_url,
                reference: payment.reference,
            },
        });

    } catch (error) {
        console.error('Payment init error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}