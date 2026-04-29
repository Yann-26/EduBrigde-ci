-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create storage bucket (skip if already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('documents', 'documents', true);
    END IF;
END $$;

-- Storage policies for documents bucket
DROP POLICY IF EXISTS "Allow public read access to documents" ON storage.objects;
CREATE POLICY "Allow public read access to documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "Allow users to update own documents" ON storage.objects;
CREATE POLICY "Allow users to update own documents"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Allow users to delete own documents" ON storage.objects;
CREATE POLICY "Allow users to delete own documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'documents' AND auth.uid() = owner);