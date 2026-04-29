import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

// GET - Get current user's visa application
export async function GET() {
    try {
        const user = await requireAuth();

        const { data: visaApp, error } = await supabaseAdmin
            .from('visa_applications')
            .select(`
                *,
                steps:visa_steps(
                    *,
                    documents:visa_documents(*),
                    reviewer:admin_reviewed_by(id, name)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Get visa error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: visaApp || null,
        });

    } catch (error) {
        console.error('Get visa error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Start new visa application
export async function POST() {
    try {
        const user = await requireAuth();

        // Check if user already has an active visa application
        const { data: existing } = await supabaseAdmin
            .from('visa_applications')
            .select('id, status')
            .eq('user_id', user.id)
            .in('status', ['in_progress'])
            .single();

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'You already have an active visa application in progress' },
                { status: 400 }
            );
        }

        // Create visa application with steps using the database function
        const { data: result, error } = await supabaseAdmin
            .rpc('create_visa_application', { p_user_id: user.id });

        if (error) {
            console.error('Create visa error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Visa application started successfully',
            visaId: result,
        }, { status: 201 });

    } catch (error) {
        console.error('Create visa error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}