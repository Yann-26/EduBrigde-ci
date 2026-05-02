import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .select(`
                *,
                university:universities(*),
                documents(*)
            `)
            .eq('id', id)
            .single();

        if (error || !application) {
            return NextResponse.json(
                { success: false, error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: application.id,
                applicationId: application.application_id,
                student_name: application.student_name,
                student_email: application.student_email,
                student_phone: application.student_phone,
                student_country: application.student_country,
                university: application.university,
                course: application.course,
                status: application.status,
                payment_status: application.payment_status,
                amount: application.amount,
                transaction_id: application.transaction_id,
                documents: application.documents,
                timeline: application.timeline,
                notes: application.notes,
                created_at: application.created_at,
                updated_at: application.updated_at,
            },
        });

    } catch (error) {
        console.error('Get application error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateData = {};
        const allowedFields = ['notes', 'assigned_to', 'course'];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        updateData.updated_at = new Date().toISOString();

        const { data: application, error } = await supabaseAdmin
            .from('applications')
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
            data: application,
        });

    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}