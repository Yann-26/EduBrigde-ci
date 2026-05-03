import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadMultipleFiles } from '@/lib/storage';
import { sendApplicationConfirmation } from '@/lib/email';
import { applicationQueries } from '@/lib/queries/applications';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');
        const country = formData.get('country');
        const universityId = formData.get('university');
        const course = formData.get('course');
        const paymentRef = formData.get('payment_reference');

        if (!name || !email || !phone || !country || !universityId || !course) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
        }

        // Upload documents
        const documentFiles = formData.getAll('documents');
        const documentNames = formData.getAll('documentNames');
        if (!documentFiles.length) {
            return NextResponse.json({ success: false, error: 'At least one document is required' }, { status: 400 });
        }

        let uploadedFiles = [];
        try {
            uploadedFiles = await uploadMultipleFiles(documentFiles, 'documents');
        } catch (uploadError) {
            return NextResponse.json({ success: false, error: 'Failed to upload documents' }, { status: 500 });
        }

        // Create application with real payment amount
        const { application, currency } = await applicationQueries.create({
            name, email, phone, country, universityId, course, paymentRef,
        });

        // Save documents
        const documentsToInsert = uploadedFiles.map((file, index) => ({
            application_id: application.id,
            name: documentNames[index] || `Document ${index + 1}`,
            type: 'certificate',
            file_path: file.filePath,
            original_name: file.originalName,
            mime_type: file.mimeType,
            file_size: file.size,
            status: 'pending',
        }));
        if (documentsToInsert.length > 0) {
            await supabaseAdmin.from('documents').insert(documentsToInsert);
        }

        // Send confirmation email with real amount
        try {
            const amountDisplay = `${currency} ${parseFloat(application.amount || 0).toFixed(2)}`;
            await sendApplicationConfirmation(email, name, application.application_id, amountDisplay, paymentRef);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        return NextResponse.json({
            success: true,
            data: {
                applicationId: application.application_id,
                studentName: application.student_name,
                status: application.status,
                amount: application.amount,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Application error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // Include documents in the select
        let query = supabaseAdmin
            .from('applications')
            .select(`
        *,
        university:universities(id, name, location),
        documents(*)
      `, { count: 'exact' });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`student_name.ilike.%${search}%,student_email.ilike.%${search}%,application_id.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Parse timeline for each application
        const parsedData = (data || []).map(app => ({
            ...app,
            timeline: typeof app.timeline === 'string' ? JSON.parse(app.timeline) : (app.timeline || []),
        }));

        return NextResponse.json({
            success: true,
            data: parsedData,
            pagination: {
                page,
                limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
            },
        });

    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}