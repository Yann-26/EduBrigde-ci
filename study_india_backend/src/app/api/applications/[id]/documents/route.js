import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { uploadMultipleFiles } from '@/lib/storage';

export async function POST(request, { params }) {
    try {
        const { id } = params;
        const formData = await request.formData();

        const documentFiles = formData.getAll('documents');
        const documentNames = formData.getAll('documentNames');

        if (!documentFiles.length) {
            return NextResponse.json(
                { error: 'No documents provided' },
                { status: 400 }
            );
        }

        // Upload to storage
        const uploadedFiles = await uploadMultipleFiles(documentFiles, 'documents');

        // Insert documents
        const documentsToInsert = uploadedFiles.map((file, index) => ({
            application_id: id,
            name: documentNames[index] || `Additional Document ${index + 1}`,
            type: 'other',
            file_path: file.filePath,
            original_name: file.originalName,
            mime_type: file.mimeType,
            file_size: file.size,
            status: 'pending',
        }));

        const { error } = await supabaseAdmin
            .from('documents')
            .insert(documentsToInsert);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Documents uploaded successfully',
        });

    } catch (error) {
        console.error('Upload documents error:', error);
        return NextResponse.json(
            { error: 'Failed to upload documents' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const user = await requireAuth();
        const { id } = params;
        const body = await request.json();
        const { documentId, status, rejectionReason } = body;

        const updateData = {
            status,
            verified_by: user.id,
            verified_at: new Date().toISOString(),
        };

        if (status === 'rejected' && rejectionReason) {
            updateData.rejection_reason = rejectionReason;
        }

        const { error } = await supabaseAdmin
            .from('documents')
            .update(updateData)
            .eq('id', documentId)
            .eq('application_id', id);

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: `Document ${status} successfully`,
        });

    } catch (error) {
        console.error('Verify document error:', error);
        return NextResponse.json(
            { error: 'Failed to verify document' },
            { status: 500 }
        );
    }
}