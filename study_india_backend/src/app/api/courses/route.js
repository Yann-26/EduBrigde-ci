import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const programLevel = searchParams.get('program_level');
        const universityId = searchParams.get('university_id');

        let query = supabaseAdmin
            .from('course_categories')
            .select(`
                id,
                department,
                program_level,
                courses:courses(*)
            `)
            .order('department');

        if (programLevel && programLevel !== 'all') {
            query = query.eq('program_level', programLevel);
        }

        const { data: categories, error } = await query;

        if (error) {
            console.error('Courses error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // If university specified, filter only courses linked to that university
        if (universityId) {
            const { data: uniCourses } = await supabaseAdmin
                .from('university_courses')
                .select('course_id')
                .eq('university_id', universityId);

            const uniCourseIds = (uniCourses || []).map(uc => uc.course_id);

            const filtered = (categories || []).map(cat => ({
                ...cat,
                courses: (cat.courses || []).filter(c => uniCourseIds.includes(c.id))
            })).filter(cat => cat.courses.length > 0);

            return NextResponse.json({ success: true, data: filtered });
        }

        return NextResponse.json({ success: true, data: categories || [] });

    } catch (error) {
        console.error('Get courses error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}