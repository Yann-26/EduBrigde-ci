import { supabaseAdmin } from '@/lib/supabase';

export const notificationQueries = {
    async create(data) {
        const { type = 'info', title, message, userId = null, link = null, metadata = {} } = data;

        const { data: notification, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link,
                metadata,
            })
            .select()
            .single();

        if (error) throw error;
        return notification;
    },

    async findAll({ page = 1, limit = 20, filter = 'all', userId = null }) {
        let query = supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact' });

        if (filter === 'unread') {
            query = query.eq('is_read', false);
        } else if (filter === 'read') {
            query = query.eq('is_read', true);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
            notifications: data,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        };
    },

    async markAsRead(notificationIds) {
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ is_read: true })
            .in('id', notificationIds);

        if (error) throw error;
        return true;
    },

    async markAllAsRead(userId = null) {
        let query = supabaseAdmin
            .from('notifications')
            .update({ is_read: true });

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) throw error;
        return true;
    },

    async delete(notificationIds) {
        const { error } = await supabaseAdmin
            .from('notifications')
            .delete()
            .in('id', notificationIds);

        if (error) throw error;
        return true;
    },

    async clearAll(userId = null) {
        let query = supabaseAdmin
            .from('notifications')
            .delete();

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { error } = await query;

        if (error) throw error;
        return true;
    },

    async getUnreadCount(userId = null) {
        let query = supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { count, error } = await query;

        if (error) throw error;
        return count;
    },
};