import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { uploadMultipleFiles } from '@/lib/storage';
import { sendApplicationConfirmation } from '@/lib/email';

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

        console.log('Received application:', { name, email, phone, country, universityId, course });

        if (!name || !email || !phone || !country || !universityId || !course) {
            return NextResponse.json(
                { success: false, error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Handle file uploads
        const documentFiles = formData.getAll('documents');
        const documentNames = formData.getAll('documentNames');

        console.log(`Received ${documentFiles.length} documents`);

        if (!documentFiles.length) {
            return NextResponse.json(
                { success: false, error: 'At least one document is required' },
                { status: 400 }
            );
        }

        // Upload documents to Supabase Storage
        let uploadedFiles = [];
        try {
            uploadedFiles = await uploadMultipleFiles(documentFiles, 'documents');
            console.log('Uploaded files:', uploadedFiles.length);
        } catch (uploadError) {
            console.error('File upload error:', uploadError);
            return NextResponse.json(
                { success: false, error: 'Failed to upload documents' },
                { status: 500 }
            );
        }

        // Create application in database
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
                amount: 'XOF 0',
                timeline: JSON.stringify([{
                    action: 'application_submitted',
                    description: 'Application submitted successfully',
                    timestamp: new Date().toISOString(),
                }]),
            })
            .select('*')
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to create application: ' + error.message },
                { status: 500 }
            );
        }

        // Save documents to database
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
            const { error: docError } = await supabaseAdmin
                .from('documents')
                .insert(documentsToInsert);

            if (docError) {
                console.error('Document save error:', docError);
            }
        }

        // Send confirmation email with real payment amount
        try {
            const paymentRef = formData.get('payment_reference')
            let paymentAmount = null

            // Get actual payment amount from database
            if (paymentRef) {
                const { data: payment } = await supabaseAdmin
                    .from('payments')
                    .select('amount, currency')
                    .eq('transaction_id', paymentRef)
                    .single()

                if (payment) {
                    paymentAmount = `${payment.currency || 'XOF'} ${parseFloat(payment.amount || 0).toFixed(2)}`
                }
            }

            await sendApplicationConfirmation(
                email,
                name,
                application.application_id,
                paymentAmount,
                paymentRef
            )
        } catch (emailError) {
            console.error('Failed to send email:', emailError)
        }

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: application.application_id,
                studentName: application.student_name,
                status: application.status,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('❌ Application submission error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
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