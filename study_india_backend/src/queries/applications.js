import { supabaseAdmin } from '@/lib/supabase';

export const applicationQueries = {
    async create(data) {
        const { name, email, phone, country, universityId, course } = data;

        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .insert({
                student_name: name,
                student_email: email,
                student_phone: phone,
                student_country: country,
                university_id: universityId,
                course,
                status: 'pending',
                payment_status: 'pending',
                amount: 'ZMW 75',
                timeline: JSON.stringify([{
                    action: 'application_submitted',
                    description: 'Application submitted successfully',
                    timestamp: new Date().toISOString(),
                }]),
            })
            .select('*')
            .single();

        if (error) throw error;
        return application;
    },

    async findAll({ page = 1, limit = 10, status, search, sortBy = 'created_at', sortOrder = 'desc' }) {
        const { data, error, count } = await supabaseAdmin
            .rpc('search_applications', {
                search_term: search || null,
                status_filter: status && status !== 'all' ? status : null,
                page_num: page,
                page_limit: limit,
            });

        if (error) throw error;

        return {
            applications: data || [],
            pagination: {
                page,
                limit,
                total: data?.[0]?.total_count || 0,
                pages: Math.ceil((data?.[0]?.total_count || 0) / limit),
            },
        };
    },

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('applications')
            .select(`
        *,
        university:universities(*),
        documents(*),
        assigned_user:assigned_to(id, name, email)
      `)
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async updateStatus(id, status, userId, notes) {
        // Get current timeline
        const { data: current } = await supabaseAdmin
            .from('applications')
            .select('timeline')
            .eq('id', id)
            .single();

        const timeline = current?.timeline || [];
        timeline.push({
            action: `status_changed_to_${status}`,
            description: notes || `Application status changed to ${status}`,
            performedBy: userId,
            timestamp: new Date().toISOString(),
        });

        const { data, error } = await supabaseAdmin
            .from('applications')
            .update({
                status,
                timeline,
                notes: notes || undefined,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const allowedFields = ['notes', 'assigned_to', 'course'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });

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
        const { data, error } = await supabaseAdmin
            .rpc('get_application_stats');

        if (error) throw error;
        return data;
    },

    async getTrends(startDate) {
        const { data, error } = await supabaseAdmin
            .rpc('get_application_trends', {
                start_date: startDate,
            });

        if (error) throw error;
        return data;
    },

    async getCountryDistribution() {
        const { data, error } = await supabaseAdmin
            .rpc('get_country_distribution');

        if (error) throw error;
        return data;
    },
};