import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check environment variables
        const envCheck = {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
        };

        // Try to import supabase
        let supabaseStatus = 'unknown';
        try {
            const { supabaseAdmin } = await import('@/lib/supabase');

            // Try a simple query
            const { data, error } = await supabaseAdmin
                .from('universities')
                .select('count', { count: 'exact', head: true });

            if (error) {
                supabaseStatus = `Error: ${error.message}`;
            } else {
                supabaseStatus = 'Connected successfully';
            }
        } catch (err) {
            supabaseStatus = `Import error: ${err.message}`;
        }

        return NextResponse.json({
            success: true,
            environment: envCheck,
            supabase: supabaseStatus,
            nodeVersion: process.version,
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}