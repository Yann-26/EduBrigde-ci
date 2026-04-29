import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function generateToken(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
}

export async function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function getCurrentUser() {
    try {
        const headersList = headers();
        const authorization = headersList.get('authorization');

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return null;
        }

        const token = authorization.split(' ')[1];
        const decoded = await verifyToken(token);

        if (!decoded || decoded.expired) {
            return null;
        }

        // Use direct Supabase query instead of Mongoose
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return null;
        }

        if (user.status !== 'active') {
            return null;
        }

        // Remove password hash from response
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error('Get current user error:', error);
        return null;
    }
}

export async function requireAuth() {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    return user;
}

export async function requireAdmin() {
    const user = await requireAuth();

    if (user.role !== 'admin' && user.role !== 'super_admin') {
        throw new Error('Not authorized');
    }

    return user;
}

export async function hashPassword(password) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 12);
}

export async function comparePasswords(password, hash) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
}