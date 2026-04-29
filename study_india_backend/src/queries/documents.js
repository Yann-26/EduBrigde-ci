import { supabaseAdmin } from '@/lib/supabase';

export const documentQueries = {
    async create(documentData) {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert(documentData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async createMany(documents) {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .insert(documents)
            .select();

        if (error) throw error;
        return data;
    },

    async findByApplication(applicationId) {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async updateStatus(documentId, applicationId, status, userId, rejectionReason = null) {
        const updateData = {
            status,
            verified_by: userId,
            verified_at: new Date().toISOString(),
        };

        if (status === 'rejected' && rejectionReason) {
            updateData.rejection_reason = rejectionReason;
        }

        const { data, error } = await supabaseAdmin
            .from('documents')
            .update(updateData)
            .eq('id', documentId)
            .eq('application_id', applicationId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getPendingVerification() {
        const { data, error } = await supabaseAdmin
            .from('documents')
            .select(`
        *,
        application:applications(student_name)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getVerifiedToday() {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabaseAdmin
            .from('documents')
            .select('*')
            .eq('status', 'verified')
            .gte('verified_at', today)
            .order('verified_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getStats() {
        const { data: all, error } = await supabaseAdmin
            .from('documents')
            .select('status');

        if (error) throw error;

        return {
            total: all.length,
            verified: all.filter(d => d.status === 'verified').length,
            pending: all.filter(d => d.status === 'pending').length,
            rejected: all.filter(d => d.status === 'rejected').length,
        };
    },
};