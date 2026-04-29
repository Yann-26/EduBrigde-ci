import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateToken, hashPassword } from '@/lib/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        let passwordHash;
        try {
            passwordHash = await hashPassword(password);
        } catch (hashError) {
            console.error('Password hashing error:', hashError);
            return NextResponse.json(
                { success: false, error: 'Server error during registration' },
                { status: 500 }
            );
        }

        // Create user
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                role: 'user',
                status: 'active',
            })
            .select('id, name, email, role, status, created_at')
            .single();

        if (error) {
            console.error('User creation error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

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
            },
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Registration error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}