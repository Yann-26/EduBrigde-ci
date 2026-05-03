import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Only allow updating these fields
        const allowedFields = ['name', 'phone', 'country', 'status', 'role'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        updateData.updated_at = new Date().toISOString();

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, name, email, phone, role, status, created_at')
            .single();

        if (error) {
            console.error('Update user error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, data: user });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
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