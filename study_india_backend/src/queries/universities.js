import { supabaseAdmin } from '@/lib/supabase';

export const universityQueries = {
    async findAll() {
        const { data, error } = await supabaseAdmin
            .from('universities')
            .select('*')
            .eq('status', 'active')
            .order('name');

        if (error) throw error;
        return data;
    },

    async findById(id) {
        const { data, error } = await supabaseAdmin
            .from('universities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    },

    async create(data) {
        const { data: university, error } = await supabaseAdmin
            .from('universities')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return university;
    },

    async update(id, data) {
        const { data: university, error } = await supabaseAdmin
            .from('universities')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return university;
    },

    async delete(id) {
        const { error } = await supabaseAdmin
            .from('universities')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async getStats() {
        const { data, error } = await supabaseAdmin
            .from('universities')
            .select('status, type');

        if (error) throw error;

        return {
            total: data.length,
            active: data.filter(u => u.status === 'active').length,
            inactive: data.filter(u => u.status === 'inactive').length,
            public: data.filter(u => u.type === 'Public').length,
            private: data.filter(u => u.type === 'Private').length,
        };
    },
};