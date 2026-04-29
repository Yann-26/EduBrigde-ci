import { storage, BUCKET, ensureBucket } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB

/**
 * Validate file before upload
 */
function validateFile(file) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed: PDF, JPEG, PNG`);
    }

    return true;
}

/**
 * Generate unique file path
 */
function generateFilePath(folder, originalName) {
    const ext = path.extname(originalName).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    return {
        filePath: `${folder}/${filename}`,
        filename,
        ext,
    };
}

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(file, folder = 'documents') {
    try {
        // Ensure bucket exists
        await ensureBucket();

        // Validate file
        validateFile(file);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique file path
        const { filePath, filename } = generateFilePath(folder, file.name);

        console.log(`📤 Uploading: ${file.name} → ${filePath}`);

        // Upload to Supabase Storage
        const { data, error } = await storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = storage
            .from(BUCKET)
            .getPublicUrl(filePath);

        console.log(`✅ Uploaded: ${publicUrl}`);

        return {
            success: true,
            filePath,
            publicUrl,
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: buffer.length,
        };
    } catch (error) {
        console.error('File upload error:', error);
        throw error;
    }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(files, folder = 'documents') {
    if (!files || files.length === 0) {
        return [];
    }

    console.log(`📤 Uploading ${files.length} files...`);

    const results = [];
    const errors = [];

    // Upload files sequentially to avoid overwhelming the connection
    for (const file of files) {
        try {
            const result = await uploadFile(file, folder);
            results.push(result);
        } catch (error) {
            errors.push({ file: file.name, error: error.message });
            console.error(`❌ Failed to upload ${file.name}:`, error.message);
        }
    }

    if (errors.length > 0) {
        console.warn(`⚠️  ${errors.length} file(s) failed to upload`);
    }

    return results;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(filePath) {
    try {
        console.log(`🗑️  Deleting: ${filePath}`);

        const { error } = await storage
            .from(BUCKET)
            .remove([filePath]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }

        console.log(`✅ Deleted: ${filePath}`);
        return { success: true };
    } catch (error) {
        console.error('File delete error:', error);
        throw error;
    }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(filePaths) {
    if (!filePaths || filePaths.length === 0) {
        return { success: true };
    }

    console.log(`🗑️  Deleting ${filePaths.length} files...`);

    const { error } = await storage
        .from(BUCKET)
        .remove(filePaths);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }

    console.log(`✅ Deleted ${filePaths.length} files`);
    return { success: true };
}

/**
 * Get public URL for a file
 */
export function getFileUrl(filePath) {
    if (!filePath) return null;

    const { data: { publicUrl } } = storage
        .from(BUCKET)
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Get signed URL (temporary, for private files)
 */
export async function getSignedUrl(filePath, expiresIn = 3600) {
    try {
        const { data, error } = await storage
            .from(BUCKET)
            .createSignedUrl(filePath, expiresIn);

        if (error) throw error;

        return data.signedUrl;
    } catch (error) {
        console.error('Signed URL error:', error);
        throw error;
    }
}

/**
 * List files in a folder
 */
export async function listFiles(folder = 'documents') {
    try {
        const { data, error } = await storage
            .from(BUCKET)
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });

        if (error) throw error;

        return data.map(file => ({
            ...file,
            publicUrl: getFileUrl(`${folder}/${file.name}`),
        }));
    } catch (error) {
        console.error('List files error:', error);
        throw error;
    }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(filePath) {
    try {
        const { data, error } = await storage
            .from(BUCKET)
            .info(filePath);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('File metadata error:', error);
        throw error;
    }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath) {
    try {
        await getFileMetadata(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Move/Rename a file
 */
export async function moveFile(fromPath, toPath) {
    try {
        const { error } = await storage
            .from(BUCKET)
            .move(fromPath, toPath);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Move file error:', error);
        throw error;
    }
}

/**
 * Copy a file
 */
export async function copyFile(fromPath, toPath) {
    try {
        const { error } = await storage
            .from(BUCKET)
            .copy(fromPath, toPath);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Copy file error:', error);
        throw error;
    }
}

/**
 * Download file as buffer
 */
export async function downloadFile(filePath) {
    try {
        const { data, error } = await storage
            .from(BUCKET)
            .download(filePath);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Download file error:', error);
        throw error;
    }
}

/**
 * Upload file from buffer (for server-side usage)
 */
export async function uploadBuffer(buffer, fileName, folder = 'documents', mimeType = 'application/octet-stream') {
    try {
        await ensureBucket();

        const { filePath } = generateFilePath(folder, fileName);

        const { data, error } = await storage
            .from(BUCKET)
            .upload(filePath, buffer, {
                contentType: mimeType,
                cacheControl: '3600',
            });

        if (error) throw error;

        const { data: { publicUrl } } = storage
            .from(BUCKET)
            .getPublicUrl(filePath);

        return {
            success: true,
            filePath,
            publicUrl,
            filename: fileName,
            size: buffer.length,
        };
    } catch (error) {
        console.error('Buffer upload error:', error);
        throw error;
    }
}