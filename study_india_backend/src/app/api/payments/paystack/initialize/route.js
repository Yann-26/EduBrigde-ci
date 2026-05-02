import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount, applicationId } = body;

        console.log('Payment init request:', { email, amount, applicationId });

        const errors = [];
        if (!email) errors.push('Email is required');
        if (!amount) errors.push('Amount is required');
        if (amount <= 0) errors.push('Amount must be greater than 0');

        if (errors.length > 0) {
            return NextResponse.json(
                { success: false, error: errors.join(', ') },
                { status: 400 }
            );
        }

        const reference = `EDU-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Initialize Paystack payment
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: Math.round(amount * 100), // Convert to kobo/cents
                reference,
                currency: 'XOF',
                callback_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
                metadata: {
                    application_id: applicationId || null,
                },
            }),
        });

        const paystackData = await paystackResponse.json();
        console.log('Paystack response:', paystackData);

        if (!paystackData.status) {
            return NextResponse.json(
                { success: false, error: paystackData.message || 'Payment initialization failed' },
                { status: 400 }
            );
        }

        // Save pending payment
        if (applicationId) {
            await supabaseAdmin.from('payments').insert({
                application_id: applicationId,
                transaction_id: reference,
                amount: amount,
                currency: 'XOF',
                method: 'Paystack',
                status: 'pending',
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: paystackData.data.authorization_url,
                reference: paystackData.data.reference,
            },
        });

    } catch (error) {
        console.error('Payment init error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}