import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const filter = searchParams.get('filter') || 'all';

        let query = supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' });

        if (filter === 'unread') {
            query = query.eq('is_read', false);
        } else if (filter === 'read') {
            query = query.eq('is_read', true);
        }

        const { data: notifications, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { notificationIds, markAll } = body;

        if (markAll) {
            await supabaseAdmin
                .from('notifications')
                .update({ is_read: true })
                .neq('id', '00000000-0000-0000-0000-000000000000');
        } else if (notificationIds?.length) {
            await supabaseAdmin
                .from('notifications')
                .update({ is_read: true })
                .in('id', notificationIds);
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications updated',
        });

    } catch (error) {
        console.error('Update notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to update notifications' },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { notificationIds, clearAll } = body;

        if (clearAll) {
            await supabaseAdmin
                .from('notifications')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
        } else if (notificationIds?.length) {
            await supabaseAdmin
                .from('notifications')
                .delete()
                .in('id', notificationIds);
        }

        return NextResponse.json({
            success: true,
            message: 'Notifications deleted',
        });

    } catch (error) {
        console.error('Delete notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to delete notifications' },
            { status: 500 }
        );
    }
}