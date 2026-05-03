import { supabaseAdmin } from '@/lib/supabase';

export const applicationQueries = {
    async create(data) {
        const { name, email, phone, country, universityId, course, paymentRef } = data;

        // Generate application ID
        const { count } = await supabaseAdmin
            .from('applications')
            .select('*', { count: 'exact', head: true });
        const appId = `APP${String((count || 0) + 1).padStart(6, '0')}`;

        // Get actual payment amount from database
        let amount = 0;
        let currency = 'XOF';
        if (paymentRef) {
            const { data: payment } = await supabaseAdmin
                .from('payments')
                .select('amount, currency')
                .eq('transaction_id', paymentRef)
                .single();
            if (payment) {
                amount = parseFloat(payment.amount) || 0;
                currency = payment.currency || 'XOF';
            }
        }

        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .insert({
                application_id: appId,
                student_name: name,
                student_email: email,
                student_phone: phone,
                student_country: country,
                university_id: universityId,
                course,
                status: 'pending',
                payment_status: paymentRef ? 'paid' : 'pending',
                transaction_id: paymentRef || null,
                amount: amount,
                timeline: JSON.stringify([{
                    action: 'application_submitted',
                    description: 'Application submitted successfully',
                    timestamp: new Date().toISOString(),
                }]),
            })
            .select('*')
            .single();

        if (error) throw error;

        // Link payment to application
        if (paymentRef) {
            await supabaseAdmin
                .from('payments')
                .update({ application_id: application.id })
                .eq('transaction_id', paymentRef);
        }

        return { application, currency };
    },

    async findAll({ page = 1, limit = 10, status, search }) {
        let query = supabaseAdmin
            .from('applications')
            .select(`*, university:universities(id, name, location)`, { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status && status !== 'all') query = query.eq('status', status);
        if (search) query = query.or(`student_name.ilike.%${search}%,student_email.ilike.%${search}%,application_id.ilike.%${search}%`);

        const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1);
        if (error) throw error;

        return {
            applications: data || [],
            pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
        };
    },

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('applications')
            .select(`*, university:universities(*), documents(*)`)
            .eq('id', id)
            .single();
        if (error) return null;
        return data;
    },

    async updateStatus(id, status, userId, notes) {
        const { data: current } = await supabaseAdmin.from('applications').select('timeline').eq('id', id).single();
        const timeline = current?.timeline || [];
        timeline.push({
            action: `status_changed_to_${status}`,
            description: notes || `Application status changed to ${status}`,
            performedBy: userId,
            timestamp: new Date().toISOString(),
        });

        const { data, error } = await supabaseAdmin
            .from('applications')
            .update({ status, timeline, notes: notes || undefined })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const allowedFields = ['notes', 'assigned_to', 'course'];
        const updateData = {};
        allowedFields.forEach(field => { if (updates[field] !== undefined) updateData[field] = updates[field]; });

        const { data, error } = await supabaseAdmin
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async getStats() {
        const { data: applications } = await supabaseAdmin.from('applications').select('status');
        const { data: payments } = await supabaseAdmin.from('payments').select('amount, status');

        return {
            total_applications: (applications || []).length,
            pending_review: (applications || []).filter(a => a.status === 'pending').length,
            under_review: (applications || []).filter(a => a.status === 'under_review').length,
            approved: (applications || []).filter(a => a.status === 'approved').length,
            rejected: (applications || []).filter(a => a.status === 'rejected').length,
            total_revenue: (payments || []).filter(p => p.status === 'completed').reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
        };
    },
};