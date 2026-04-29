import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Get application with university and documents
        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .select(`
        *,
        university:universities(*),
        documents(*),
        assigned_to_user:assigned_to(id, name, email)
      `)
            .eq('id', id)
            .single();

        if (error || !application) {
            return NextResponse.json(
                { error: 'Application not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: application.id,
                applicationId: application.application_id,
                student: {
                    name: application.student_name,
                    email: application.student_email,
                    phone: application.student_phone,
                    country: application.student_country,
                },
                university: application.university,
                course: application.course,
                status: application.status,
                paymentStatus: application.payment_status,
                amount: application.amount,
                paymentMethod: application.payment_method,
                transactionId: application.transaction_id,
                documents: application.documents,
                timeline: application.timeline,
                notes: application.notes,
                assignedTo: application.assigned_to_user,
                createdAt: application.created_at,
                updatedAt: application.updated_at,
            },
        });

    } catch (error) {
        console.error('Get application error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch application' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        await requireAuth();
        const { id } = params;
        const body = await request.json();

        const updateData = {};
        const allowedFields = ['notes', 'assigned_to', 'course'];

        allowedFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        const { data: application, error } = await supabaseAdmin
            .from('applications')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            data: application,
        });

    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json(
            { error: 'Failed to update application' },
            { status: 500 }
        );
    }
}