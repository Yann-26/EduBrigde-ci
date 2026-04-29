import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        await requireAdmin();

        const { id } = params;
        const body = await request.json();

        // Don't allow password update through this route
        delete body.password_hash;

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(body)
            .eq('id', id)
            .select('id, name, email, role, status, created_at')
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: user,
        });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        await requireAdmin();

        const { id } = params;

        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}