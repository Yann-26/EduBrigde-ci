import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (5MB)
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PDF, JPG, PNG' },
                { status: 400 }
            );
        }

        // Upload file
        const result = await uploadFile(file, 'documents');

        return NextResponse.json({
            success: true,
            filePath: result.filePath,
            publicUrl: result.publicUrl,
            fileName: result.originalName,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}