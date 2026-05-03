import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Get courses linked to a university
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data, error } = await supabaseAdmin
            .from('university_courses')
            .select('course_id, course:courses(*)')
            .eq('university_id', id);

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PUT - Update courses for a university (admin selects which courses to offer)
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { courseIds } = body; // Array of course IDs

        // Delete existing
        await supabaseAdmin
            .from('university_courses')
            .delete()
            .eq('university_id', id);

        // Insert new
        if (courseIds && courseIds.length > 0) {
            const inserts = courseIds.map(courseId => ({
                university_id: id,
                course_id: courseId,
            }));

            const { error } = await supabaseAdmin
                .from('university_courses')
                .insert(inserts);

            if (error) throw error;
        }

        return NextResponse.json({ success: true, message: 'Courses updated' });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}