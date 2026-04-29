import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

// For client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

// For server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
});

// Storage client
export const storage = supabaseAdmin.storage;

// Bucket name from env or default
export const BUCKET = process.env.SUPABASE_BUCKET_NAME || 'EduBridge';

// Initialize bucket on first use
let bucketInitialized = false;

export async function ensureBucket() {
    if (bucketInitialized) return;

    try {
        const { data: buckets, error } = await storage.listBuckets();

        if (error) {
            console.error('Failed to list buckets:', error);
            return;
        }

        const bucketExists = buckets?.some(b => b.name === BUCKET);

        if (!bucketExists) {
            console.log(`Creating bucket: ${BUCKET}`);
            const { error: createError } = await storage.createBucket(BUCKET, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
            });

            if (createError) {
                console.error('Failed to create bucket:', createError);
            } else {
                console.log(`✅ Bucket "${BUCKET}" created`);
            }
        } else {
            console.log(`✅ Bucket "${BUCKET}" already exists`);
        }

        bucketInitialized = true;
    } catch (error) {
        console.error('Bucket initialization error:', error);
    }
}