import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { uploadMultipleFiles } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// PUT - User submits a step for review
export async function PUT(request, { params }) {
    try {
        const user = await requireAuth();
        const { stepId } = await params;
        const formData = await request.formData();

        // Check if step belongs to user
        const { data: step, error: stepError } = await supabaseAdmin
            .from('visa_steps')
            .select('*, visa_application:visa_applications!inner(user_id, id)')
            .eq('id', stepId)
            .single();

        if (stepError || !step) {
            return NextResponse.json(
                { success: false, error: 'Step not found' },
                { status: 404 }
            );
        }

        if (step.visa_application.user_id !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        if (step.status !== 'unlocked' && step.status !== 'rejected') {
            return NextResponse.json(
                { success: false, error: 'This step cannot be submitted now. Current status: ' + step.status },
                { status: 400 }
            );
        }

        // Upload documents if provided
        const files = formData.getAll('documents');
        if (files.length > 0) {
            const uploaded = await uploadMultipleFiles(files, 'visa-documents');

            const docs = uploaded.map((file, i) => ({
                visa_step_id: stepId,
                name: formData.getAll('documentNames')?.[i] || `Document ${i + 1}`,
                file_path: file.filePath,
                original_name: file.originalName,
                mime_type: file.mimeType,
                file_size: file.size,
            }));

            const { error: docError } = await supabaseAdmin
                .from('visa_documents')
                .insert(docs);

            if (docError) {
                console.error('Document insert error:', docError);
            }
        }

        // Update step status
        const { error: updateError } = await supabaseAdmin
            .from('visa_steps')
            .update({
                status: 'submitted',
                user_submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', stepId);

        if (updateError) {
            console.error('Update step error:', updateError);
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Step submitted for review',
        });

    } catch (error) {
        console.error('Submit step error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PATCH - Admin approves or rejects a step
export async function PATCH(request, { params }) {
    try {
        const admin = await requireAdmin();
        const { stepId } = await params;
        const body = await request.json();
        const { action, notes, reason, rejectDocuments } = body;

        if (action === 'approve') {
            const { error } = await supabaseAdmin
                .rpc('approve_visa_step', {
                    p_step_id: stepId,
                    p_admin_id: admin.id,
                    p_notes: notes || null,
                });

            if (error) throw error;

            // Approve all documents for this step
            await supabaseAdmin
                .from('visa_documents')
                .update({ status: 'verified' })
                .eq('visa_step_id', stepId);

            return NextResponse.json({ success: true, message: 'Step and documents approved' });

        } else if (action === 'reject') {
            if (!reason) {
                return NextResponse.json(
                    { success: false, error: 'Rejection reason is required' },
                    { status: 400 }
                );
            }

            const { error } = await supabaseAdmin
                .rpc('reject_visa_step', {
                    p_step_id: stepId,
                    p_admin_id: admin.id,
                    p_reason: reason,
                });

            if (error) throw error;

            // Also reject all documents for this step
            if (rejectDocuments !== false) {
                await supabaseAdmin
                    .from('visa_documents')
                    .update({ status: 'rejected' })
                    .eq('visa_step_id', stepId);
            }

            return NextResponse.json({ success: true, message: 'Step and documents rejected' });

        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid action. Use "approve" or "reject"' },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error('Review step error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}