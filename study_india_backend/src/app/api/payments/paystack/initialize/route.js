import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount } = body;

        console.log('💳 Payment init:', { email, amount });

        if (!email || !amount) {
            return NextResponse.json({ success: false, error: 'Email and amount required' }, { status: 400 });
        }

        // Let Paystack generate the reference (TXN******)
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: Math.round(amount * 100),
                currency: 'XOF',
                // Don't send reference - let Paystack generate TXN******
                callback_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
            }),
        });

        const paystackData = await paystackResponse.json();

        if (!paystackData.status) {
            console.error('❌ Paystack error:', paystackData.message);
            return NextResponse.json({ success: false, error: paystackData.message }, { status: 400 });
        }

        // Use Paystack's generated reference
        const reference = paystackData.data.reference;

        console.log('📝 Paystack reference:', reference);

        // Save payment with Paystack's reference
        const { error: dbError } = await supabaseAdmin.from('payments').insert({
            transaction_id: reference,  // TXN****** from Paystack
            amount: amount,
            currency: 'XOF',
            method: 'Paystack',
            status: 'pending',
            student_name: email?.split('@')[0] || 'Student',
            student_email: email,
        });

        if (dbError) {
            console.error('❌ DB Save error:', dbError.message);
            return NextResponse.json({
                success: false,
                error: 'Database error: ' + dbError.message
            }, { status: 500 });
        }

        console.log('✅ Payment saved:', reference);

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: paystackData.data.authorization_url,
                reference: reference,
                access_code: paystackData.data.access_code,
            },
        });

    } catch (error) {
        console.error('❌ Init error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}