import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Simple connection test - just count universities
        const { data, error, count } = await supabaseAdmin
            .from('universities')
            .select('*', { count: 'exact', head: true });

        // Check environment safely
        const env = {
            supabaseUrl: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').substring(0, 30) + '...',
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            bucketName: process.env.SUPABASE_BUCKET_NAME || 'not set',
        };

        return NextResponse.json({
            success: true,
            connection: error ? `ERROR: ${error.message}` : 'OK',
            universityCount: count || 0,
            environment: env,
            timestamp: new Date().toISOString(),
        });

    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err.message || 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        }, { status: 500 });
    }
}