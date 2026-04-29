import { supabaseAdmin } from '@/lib/supabase';

export const paymentQueries = {
    async create(data) {
        const { applicationId, amount, method, studentName, studentEmail } = data;

        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .insert({
                application_id: applicationId,
                amount,
                method,
                student_name: studentName,
                student_email: studentEmail,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;
        return payment;
    },

    async findAll({ page = 1, limit = 10, status, search }) {
        let query = supabaseAdmin
            .from('payments')
            .select(`
        *,
        application:applications(application_id, student_name, course)
      `, { count: 'exact' });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        if (search) {
            query = query.or(`student_name.ilike.%${search}%,transaction_id.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return {
            payments: data,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit),
            },
        };
    },

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select(`
        *,
        application:applications(application_id, student_name, course)
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async updateStatus(id, status, userId, notes) {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .update({
                status,
                verified_by: userId,
                verified_at: new Date().toISOString(),
                notes,
            })
            .eq('id', id)
            .select('application_id')
            .single();

        if (error) throw error;

        // Update application payment status if completed
        if (status === 'completed') {
            await supabaseAdmin
                .from('applications')
                .update({ payment_status: 'paid' })
                .eq('id', data.application_id);
        }

        return data;
    },

    async getRevenueStats() {
        const { data, error } = await supabaseAdmin
            .from('payments')
            .select('amount, status');

        if (error) throw error;

        const completed = data.filter(p => p.status === 'completed');
        const pending = data.filter(p => p.status === 'pending');

        return {
            totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
            pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
            completedCount: completed.length,
            pendingCount: pending.length,
            averageAmount: completed.length > 0
                ? completed.reduce((sum, p) => sum + p.amount, 0) / completed.length
                : 0,
        };
    },
};