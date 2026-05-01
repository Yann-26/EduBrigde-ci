import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadFile } from '@/lib/storage';


// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: university, error } = await supabaseAdmin
            .from('universities')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !university) {
            return NextResponse.json({
                success: false,
                error: 'University not found'
            }, { status: 404 });
        }

        // Safely parse JSON fields
        let courses = [];
        try {
            courses = typeof university.courses === 'string'
                ? JSON.parse(university.courses)
                : (university.courses || []);
        } catch (e) {
            courses = [];
        }

        const parsed = {
            id: university.id,
            name: university.name,
            location: university.location,
            established: university.established,
            type: university.type,
            accreditation: university.accreditation,
            ranking: university.ranking,
            image: university.image,
            logo: university.logo || '🎓',
            website: university.website || '#',
            description: university.description,
            courses: courses,
            facilities: university.facilities || [],
            internationalStudents: university.international_students || 0,
            placementRate: university.placement_rate || 'N/A',
            brochure_pdf: university.brochure_pdf || null,
            fees_pdf: university.fees_pdf || null,
            brochure: university.brochure,
            highlights: university.highlights || [],
            status: university.status,
        };

        return NextResponse.json({
            success: true,
            data: parsed,
        });

    } catch (error) {
        console.error('❌ University detail error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}


export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        // Check if request is FormData or JSON
        const contentType = request.headers.get('content-type') || '';
        let updateData = {};

        if (contentType.includes('multipart/form-data')) {
            // Handle FormData (file uploads)
            const formData = await request.formData();

            // Get existing university to preserve data
            const { data: existing } = await supabaseAdmin
                .from('universities')
                .select('*')
                .eq('id', id)
                .single();

            // Text fields
            const textFields = ['name', 'location', 'type', 'accreditation', 'ranking',
                'description', 'status', 'website', 'logo', 'image',
                'placement_rate'];

            textFields.forEach(field => {
                const value = formData.get(field);
                if (value !== null && value !== undefined && value !== '') {
                    updateData[field] = value;
                }
            });

            // Number fields
            const numFields = ['established', 'international_students'];
            numFields.forEach(field => {
                const value = formData.get(field);
                if (value !== null && value !== undefined && value !== '') {
                    updateData[field] = parseInt(value) || existing[field];
                }
            });

            // Preserve courses - don't overwrite if not provided
            const coursesStr = formData.get('courses');
            if (coursesStr) {
                updateData['courses'] = coursesStr;
            }

            // Handle image file upload
            const imageFile = formData.get('image_file') || formData.get('image');
            if (imageFile && imageFile.size > 0) {
                const uploaded = await uploadFile(imageFile, 'universities/images');
                updateData['image'] = uploaded.filePath;
            }

            // Handle brochure PDF
            const brochureFile = formData.get('brochure_pdf');
            if (brochureFile && brochureFile.size > 0) {
                const uploaded = await uploadFile(brochureFile, 'universities/brochures');
                updateData['brochure_pdf'] = uploaded.filePath;
            }

            // Handle fees PDF
            const feesFile = formData.get('fees_pdf');
            if (feesFile && feesFile.size > 0) {
                const uploaded = await uploadFile(feesFile, 'universities/fees');
                updateData['fees_pdf'] = uploaded.filePath;
            }

        } else {
            // Handle JSON data
            const body = await request.json();
            updateData = { ...body };

            // Convert courses to JSON string if it's an array
            if (updateData.courses && Array.isArray(updateData.courses)) {
                updateData.courses = JSON.stringify(updateData.courses);
            }

            // Don't overwrite courses if not provided
            if (!updateData.courses && updateData.courses !== null) {
                delete updateData.courses;
            }

            // Remove file objects that might be sent as JSON
            delete updateData.brochure_pdf_file;
            delete updateData.fees_pdf_file;
        }

        // Remove any fields that shouldn't be updated
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        console.log('Updating university with:', updateData);

        const { data: university, error } = await supabaseAdmin
            .from('universities')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: university,
            message: 'University updated successfully'
        });

    } catch (error) {
        console.error('❌ Update university error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin
            .from('universities')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete error:', error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'University deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete university error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}