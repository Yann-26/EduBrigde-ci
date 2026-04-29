import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Test database connection
        const { data, error } = await supabaseAdmin
            .from('universities')
            .select('count');

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                hint: 'Check your Supabase credentials and table existence'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Database connection working',
            count: data?.length || 0
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}