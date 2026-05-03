import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { reference } = await params;

        console.log('🔍 Looking up payment:', reference);

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select(`
                *,
                application:applications(application_id, student_name, course, university:universities(name))
            `)
            .eq('transaction_id', reference)
            .single();

        if (error || !payment) {
            console.error('Payment not found:', reference);
            return NextResponse.json(
                { success: false, error: 'Payment not found' },
                { status: 404 }
            );
        }

        console.log('✅ Payment found:', payment.transaction_id);

        return NextResponse.json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error('Get payment error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}