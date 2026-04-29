import { NextResponse } from 'next/server';
import { deleteFile, deleteMultipleFiles } from '@/lib/storage';

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { filePath, filePaths } = body;

        if (!filePath && !filePaths) {
            return NextResponse.json(
                { error: 'No file path provided' },
                { status: 400 }
            );
        }

        let result;

        if (filePaths) {
            result = await deleteMultipleFiles(filePaths);
        } else {
            result = await deleteFile(filePath);
        }

        return NextResponse.json({
            success: true,
            data: result,
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: error.message || 'Delete failed' },
            { status: 500 }
        );
    }
}