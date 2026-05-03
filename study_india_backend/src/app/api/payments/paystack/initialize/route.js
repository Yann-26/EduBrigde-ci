import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount } = body;

        console.log('💳 Payment init:', { email, amount });

        if (!email || !amount) {
            return NextResponse.json({ success: false, error: 'Email and amount required' }, { status: 400 });
        }

        const reference = `EDU-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Initialize Paystack
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: Math.round(amount * 100),
                reference,
                currency: 'XOF',
                callback_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            console.error('Paystack error:', paystackData);
            return NextResponse.json({ success: false, error: paystackData.message }, { status: 400 });
        }

        // SAVE TO DATABASE - This must work!
        const { data: payment, error: dbError } = await supabaseAdmin
            .from('payments')
            .insert({
                transaction_id: reference,
                amount: amount,
                currency: 'XOF',
                method: 'Paystack',
                status: 'pending',
                student_name: email?.split('@')[0] || 'Student',
                student_email: email,
            })
            .select('transaction_id')
            .single();

        if (dbError) {
            console.error('❌ DB Save error:', dbError.message, dbError.details, dbError.hint);
            return NextResponse.json({
                success: false,
                error: 'Database error: ' + dbError.message,
                details: dbError.details
            }, { status: 500 });
        }

        console.log('✅ Payment saved:', payment.transaction_id);

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: paystackData.data.authorization_url,
                reference: paystackData.data.reference,
            },
        });

    } catch (error) {
        console.error('❌ Init error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}