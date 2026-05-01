import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';


// Force dynamic - no static generation
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get all documents with application info
        const { data: documents, error } = await supabaseAdmin
            .from('documents')
            .select(`
        *,
        application:applications(
          id,
          application_id,
          student_name,
          student_email
        )
      `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const pending = documents.filter(d => d.status === 'pending');
        const verified = documents.filter(d => d.status === 'verified');
        const rejected = documents.filter(d => d.status === 'rejected');

        return NextResponse.json({
            success: true,
            data: {
                all: documents,
                pending,
                verified,
                rejected,
                counts: {
                    total: documents.length,
                    pending: pending.length,
                    verified: verified.length,
                    rejected: rejected.length,
                },
            },
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}