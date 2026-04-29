import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                status: user.status,
            },
        });

    } catch (error) {
        console.error('❌ Get user error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}