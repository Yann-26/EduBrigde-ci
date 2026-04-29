import { NextResponse } from 'next/server';
import { uploadFile, uploadMultipleFiles } from '@/lib/storage';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');
        const folder = formData.get('folder') || 'documents';

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        let result;

        if (files.length === 1) {
            result = await uploadFile(files[0], folder);
        } else {
            result = await uploadMultipleFiles(files, folder);
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}