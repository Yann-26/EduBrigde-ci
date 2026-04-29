import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken, comparePasswords } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Please provide email and password' },
                { status: 400 }
            );
        }

        // Find user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (user.status !== 'active') {
            return NextResponse.json(
                { success: false, error: 'Account is deactivated' },
                { status: 403 }
            );
        }

        // Check password
        let isMatch;
        try {
            isMatch = await comparePasswords(password, user.password_hash);
        } catch (compareError) {
            console.error('Password comparison error:', compareError);
            return NextResponse.json(
                { success: false, error: 'Server error during login' },
                { status: 500 }
            );
        }

        if (!isMatch) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update last login
        await supabaseAdmin
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);

        // Generate token
        const token = await generateToken(user.id);

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
            },
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}