import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const userQueries = {
    async create({ name, email, password, role = 'user' }) {
        const passwordHash = await bcrypt.hash(password, 12);

        const { data, error } = await supabaseAdmin
            .from('users')
            .insert({
                name,
                email,
                password_hash: passwordHash,
                role,
                status: 'active',
            })
            .select('id, name, email, role, status, avatar, phone, created_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new Error('Email already exists');
            }
            throw error;
        }

        return data;
    },

    async findByEmail(email) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) return null;
        return data;
    },

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async verifyPassword(user, password) {
        return bcrypt.compare(password, user.password_hash);
    },

    async updateLastLogin(userId) {
        const { error } = await supabaseAdmin
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);

        return !error;
    },

    async findAll({ page = 1, limit = 10, search, role, status }) {
        let query = supabaseAdmin
            .from('users')
            .select('id, name, email, role, status, avatar, phone, last_login, created_at', { count: 'exact' });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }
        if (role && role !== 'all') {
            query = query.eq('role', role);
        }
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
            users: data,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        };
    },

    async update(id, updates) {
        // Don't allow password update through this method
        delete updates.password;
        delete updates.password_hash;

        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select('id, name, email, role, status, avatar, phone, created_at')
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async countByStatus() {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('status, count', { count: 'exact' })
            .not('status', 'is', null);

        if (error) throw error;

        return {
            total: data.length,
            active: data.filter(u => u.status === 'active').length,
            inactive: data.filter(u => u.status === 'inactive').length,
        };
    },
};