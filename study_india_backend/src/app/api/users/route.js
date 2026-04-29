import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin, hashPassword } from '@/lib/auth';

export async function GET(request) {
    try {
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const search = searchParams.get('search');
        const role = searchParams.get('role');
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        if (role && role !== 'all') {
            query = query.eq('role', role);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data: users, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        });

    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        await requireAdmin();

        const body = await request.json();
        const { name, email, password, role } = body;

        const passwordHash = await hashPassword(password);

        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                role: role || 'user',
                status: 'active',
            })
            .select('id, name, email, role, status, created_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: user,
        }, { status: 201 });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}