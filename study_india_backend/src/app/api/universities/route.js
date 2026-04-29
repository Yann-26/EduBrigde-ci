import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: universities, error } = await supabaseAdmin
            .from('universities')
            .select('*')
            .eq('status', 'active')
            .order('name');

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        // Safely parse JSON fields
        const parsed = (universities || []).map(uni => {
            let courses = [];
            try {
                courses = typeof uni.courses === 'string' ? JSON.parse(uni.courses) : (uni.courses || []);
            } catch (e) { courses = []; }

            return {
                id: uni.id,
                name: uni.name,
                location: uni.location,
                established: uni.established,
                type: uni.type,
                accreditation: uni.accreditation,
                ranking: uni.ranking,
                image: uni.image,
                logo: uni.logo || '🎓',
                website: uni.website,
                description: uni.description,
                courses: courses,
                facilities: uni.facilities || [],
                internationalStudents: uni.international_students || 0,
                placementRate: uni.placement_rate || 'N/A',
                brochure: uni.brochure || '#',
                highlights: uni.highlights || [],
                status: uni.status,
                brochure_pdf: uni.brochure_pdf || null,
                fees_pdf: uni.fees_pdf || null,
            };
        });

        return NextResponse.json({
            success: true,
            data: parsed,
        });

    } catch (error) {
        console.error('❌ Universities API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}