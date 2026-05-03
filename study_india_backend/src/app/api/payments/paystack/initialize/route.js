import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, amount, applicationId } = body;

        console.log('💳 Payment init:', { email, amount });

        if (!email || !amount) {
            return NextResponse.json({ success: false, error: 'Email and amount are required' }, { status: 400 });
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
                amount: Math.round(amount * 100),
                reference,
                currency: 'XOF',
                callback_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:5173'}/payment/callback`,
                metadata: { application_id: applicationId || null },
            }),
        });

        const paystackData = await paystackResponse.json();
        console.log('📡 Paystack:', paystackData.status ? 'OK' : 'FAILED', paystackData.message);

        if (!paystackData.status) {
            return NextResponse.json(
                { success: false, error: paystackData.message || 'Payment initialization failed' },
                { status: 400 }
            );
        }

        // ✅ SAVE PAYMENT TO DATABASE IMMEDIATELY
        const { error: dbError } = await supabaseAdmin.from('payments').insert({
            transaction_id: reference,
            amount: amount,
            currency: 'XOF',
            method: 'Paystack',
            status: 'pending',
            student_name: body.studentName || email?.split('@')[0] || 'Student',
            student_email: email,
            application_id: applicationId || null,
        });

        if (dbError) {
            console.error('❌ Failed to save payment to DB:', dbError.message);
        } else {
            console.log('✅ Payment saved to database:', reference);
        }

        return NextResponse.json({
            success: true,
            data: {
                authorization_url: paystackData.data.authorization_url,
                reference: paystackData.data.reference,
            },
        });

    } catch (error) {
        console.error('❌ Payment init error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}