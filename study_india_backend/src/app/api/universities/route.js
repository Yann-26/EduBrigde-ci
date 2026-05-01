import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';


export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let insertData = {};

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData (with file uploads)
            const formData = await request.formData();

            const textFields = [
                'name', 'location', 'type', 'accreditation', 'ranking',
                'description', 'status', 'website', 'logo'
            ];

            textFields.forEach(field => {
                const value = formData.get(field);
                if (value) insertData[field] = value;
            });

            // Number fields
            const established = formData.get('established');
            if (established) insertData['established'] = parseInt(established);

            const intlStudents = formData.get('international_students');
            if (intlStudents) insertData['international_students'] = parseInt(intlStudents);

            const placementRate = formData.get('placement_rate');
            if (placementRate) insertData['placement_rate'] = placementRate;

            // Courses
            const courses = formData.get('courses');
            if (courses) {
                insertData['courses'] = typeof courses === 'string' ? courses : JSON.stringify(courses);
            }

            // Handle image upload
            const imageFile = formData.get('image_file') || formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const uploaded = await uploadFile(imageFile, 'universities/images');
                insertData['image'] = uploaded.filePath;
            }

            // Handle brochure PDF
            const brochureFile = formData.get('brochure_pdf');
            if (brochureFile && brochureFile.size > 0) {
                const uploaded = await uploadFile(brochureFile, 'universities/brochures');
                insertData['brochure_pdf'] = uploaded.filePath;
            }

            // Handle fees PDF
            const feesFile = formData.get('fees_pdf');
            if (feesFile && feesFile.size > 0) {
                const uploaded = await uploadFile(feesFile, 'universities/fees');
                insertData['fees_pdf'] = uploaded.filePath;
            }

        } else {
            // Handle JSON data (no files)
            const body = await request.json();

            const allowedFields = [
                'name', 'location', 'established', 'type', 'accreditation',
                'ranking', 'description', 'image', 'logo', 'website',
                'status', 'international_students', 'placement_rate',
                'courses', 'facilities', 'highlights'
            ];

            allowedFields.forEach(field => {
                if (body[field] !== undefined && body[field] !== null) {
                    insertData[field] = body[field];
                }
            });

            // Convert courses to JSON string if it's an array
            if (insertData.courses && Array.isArray(insertData.courses)) {
                insertData.courses = JSON.stringify(insertData.courses);
            }
        }

        // Set defaults
        insertData.status = insertData.status || 'active';
        insertData.type = insertData.type || 'Private';

        console.log('Creating university with:', Object.keys(insertData));

        const { data: university, error } = await supabaseAdmin
            .from('universities')
            .insert(insertData)
            .select('*')
            .single();

        if (error) {
            console.error('Create error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: university,
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Create university error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}


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
                image: uni.image || null,
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