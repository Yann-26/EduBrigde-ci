import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword, comparePasswords } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request) {
    try {
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Get user from token
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const { verifyToken } = await import('@/lib/auth');
        const decoded = await verifyToken(token);
        if (!decoded || decoded.expired) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Get user
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isMatch = await comparePasswords(currentPassword, user.password_hash);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const newHash = await hashPassword(newPassword);

        // Update password
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ password_hash: newHash, updated_at: new Date().toISOString() })
            .eq('id', decoded.id);

        if (updateError) {
            return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}