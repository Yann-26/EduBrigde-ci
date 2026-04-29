-- Combined Migration Script
-- Generated: 2026-04-29T05:39:17.164Z

-- ====================================
-- File: 00_create_tables.sql
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin', 'editor', 'viewer')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    avatar VARCHAR(500),
    phone VARCHAR(50),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    established INTEGER,
    type VARCHAR(50) DEFAULT 'Private' CHECK (type IN ('Public', 'Private', 'Deemed')),
    accreditation VARCHAR(255),
    ranking VARCHAR(255),
    image VARCHAR(500),
    logo VARCHAR(10),
    description TEXT,
    courses JSONB DEFAULT '[]',
    facilities TEXT[] DEFAULT '{}',
    international_students INTEGER DEFAULT 0,
    placement_rate VARCHAR(50),
    brochure VARCHAR(500),
    highlights TEXT[] DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id VARCHAR(50) UNIQUE NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    student_phone VARCHAR(50) NOT NULL,
    student_country VARCHAR(100) NOT NULL,
    university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
    course VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    amount VARCHAR(50) DEFAULT 'ZMW 75',
    payment_method VARCHAR(50) DEFAULT 'WhatsApp',
    transaction_id VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    timeline JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'certificate' CHECK (type IN ('passport', 'certificate', 'marksheet', 'identification', 'other')),
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ZMW',
    method VARCHAR(50) DEFAULT 'WhatsApp' CHECK (method IN ('WhatsApp', 'Mobile Money', 'Bank Transfer', 'Cash')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    student_name VARCHAR(255),
    student_email VARCHAR(255),
    receipt_path VARCHAR(500),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'alert')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_student_email ON applications(student_email);
CREATE INDEX idx_applications_university ON applications(university_id);
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_payments_application ON payments(application_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ====================================
-- File: 01_create_functions.sql
-- ====================================

-- Function to generate application ID
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TRIGGER AS $$
DECLARE
    app_count INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO app_count FROM applications;
    NEW.application_id := 'APP' || LPAD(app_count::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TRIGGER AS $$
DECLARE
    txn_count INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO txn_count FROM payments;
    NEW.transaction_id := 'TXN' || LPAD(txn_count::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get application stats
CREATE OR REPLACE FUNCTION get_application_stats()
RETURNS TABLE(
    total_applications BIGINT,
    pending_review BIGINT,
    under_review BIGINT,
    approved BIGINT,
    rejected BIGINT,
    total_revenue DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_applications,
        COUNT(*) FILTER (WHERE a.status = 'pending')::BIGINT as pending_review,
        COUNT(*) FILTER (WHERE a.status = 'under_review')::BIGINT as under_review,
        COUNT(*) FILTER (WHERE a.status = 'approved')::BIGINT as approved,
        COUNT(*) FILTER (WHERE a.status = 'rejected')::BIGINT as rejected,
        COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) as total_revenue
    FROM applications a
    LEFT JOIN payments p ON a.id = p.application_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly application trends
CREATE OR REPLACE FUNCTION get_application_trends(start_date DATE)
RETURNS TABLE(
    year INTEGER,
    month INTEGER,
    total BIGINT,
    approved BIGINT,
    rejected BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        EXTRACT(YEAR FROM created_at)::INTEGER as year,
        EXTRACT(MONTH FROM created_at)::INTEGER as month,
        COUNT(*)::BIGINT as total,
        COUNT(*) FILTER (WHERE status = 'approved')::BIGINT as approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected
    FROM applications
    WHERE created_at >= start_date
    GROUP BY year, month
    ORDER BY year, month;
END;
$$ LANGUAGE plpgsql;

-- Function to get country distribution
CREATE OR REPLACE FUNCTION get_country_distribution()
RETURNS TABLE(
    country VARCHAR,
    student_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        student_country as country,
        COUNT(*)::BIGINT as student_count
    FROM applications
    GROUP BY student_country
    ORDER BY student_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search applications
CREATE OR REPLACE FUNCTION search_applications(
    search_term TEXT DEFAULT NULL,
    status_filter TEXT DEFAULT NULL,
    page_num INTEGER DEFAULT 1,
    page_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    application_id VARCHAR,
    student_name VARCHAR,
    student_email VARCHAR,
    student_phone VARCHAR,
    student_country VARCHAR,
    university_id UUID,
    university_name VARCHAR,
    university_location VARCHAR,
    course VARCHAR,
    status VARCHAR,
    payment_status VARCHAR,
    amount VARCHAR,
    total_documents INTEGER,
    verified_documents INTEGER,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT
            a.*,
            u.name as univ_name,
            u.location as univ_location,
            COUNT(d.id) as total_docs,
            COUNT(d.id) FILTER (WHERE d.status = 'verified') as verified_docs,
            COUNT(*) OVER() as total_count
        FROM applications a
        LEFT JOIN universities u ON a.university_id = u.id
        LEFT JOIN documents d ON a.id = d.application_id
        WHERE
            (search_term IS NULL OR
             a.student_name ILIKE '%' || search_term || '%' OR
             a.student_email ILIKE '%' || search_term || '%' OR
             a.application_id ILIKE '%' || search_term || '%' OR
             u.name ILIKE '%' || search_term || '%')
            AND (status_filter IS NULL OR a.status = status_filter)
        GROUP BY a.id, u.name, u.location
    )
    SELECT
        f.id,
        f.application_id,
        f.student_name,
        f.student_email,
        f.student_phone,
        f.student_country,
        f.university_id,
        f.univ_name,
        f.univ_location,
        f.course,
        f.status,
        f.payment_status,
        f.amount,
        f.total_docs::INTEGER,
        f.verified_docs::INTEGER,
        f.created_at,
        f.total_count
    FROM filtered f
    ORDER BY f.created_at DESC
    LIMIT page_limit
    OFFSET (page_num - 1) * page_limit;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- File: 02_create_triggers.sql
-- ====================================

-- Trigger for application ID generation
CREATE TRIGGER trigger_generate_application_id
    BEFORE
INSERT ON
applications
FOR
EACH
ROW
EXECUTE FUNCTION generate_application_id
();

-- Trigger for transaction ID generation
CREATE TRIGGER trigger_generate_transaction_id
    BEFORE
INSERT ON
payments
FOR
EACH
ROW
EXECUTE FUNCTION generate_transaction_id
();

-- Trigger for updated_at timestamp on users
CREATE TRIGGER trigger_update_users_timestamp
    BEFORE
UPDATE ON users
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for updated_at timestamp on universities
CREATE TRIGGER trigger_update_universities_timestamp
    BEFORE
UPDATE ON universities
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for updated_at timestamp on applications
CREATE TRIGGER trigger_update_applications_timestamp
    BEFORE
UPDATE ON applications
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger for updated_at timestamp on payments
CREATE TRIGGER trigger_update_payments_timestamp
    BEFORE
UPDATE ON payments
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column
();

-- Trigger to create notification on new application
CREATE OR REPLACE FUNCTION notify_new_application
()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications
        (type, title, message, metadata)
    VALUES
        (
            'info',
            'New Application',
            'New application received from ' || NEW.student_name || ' for ' || NEW.course,
            jsonb_build_object('application_id', NEW.id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_application_notification
    AFTER
INSERT ON
applications
FOR
EACH
ROW
EXECUTE FUNCTION notify_new_application );

-- Trigger to create notification on status change
CREATE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
    INSERT INTO notifications
        (type, title, message, metadata)
    VALUES
        (
            CASE 
                WHEN NEW.status = 'approved' THEN 'success'
                WHEN NEW.status = 'rejected' THEN 'error'
                ELSE 'info'
            END,
            'Application Status Updated',
            'Application ' || NEW.application_id || ' status changed to ' || NEW.status,
            jsonb_build_object('application_id', NEW.id, 'status', NEW.status)
        );
END
IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_application_status_change
    AFTER
UPDATE ON applications
    FOR EACH ROW
EXECUTE FUNCTION notify_status_change
();

-- ====================================
-- File: 03_create_policies.sql
-- ====================================

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create storage bucket
INSERT INTO storage.buckets
    (id, name, "public")
VALUES
    ('documents', 'documents', true);

-- Storage policies (fixed formatting)
CREATE POLICY "Allow public read access to documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated users to upload documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow users to update own documents"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete own documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'documents' AND auth.uid() = owner);

CREATE POLICY "Allow users to delete own documents"
    ON storage.objects FOR
DELETE
    USING (bucket_id
= 'documents' AND auth.uid
() = owner);

-- ====================================
-- File: 04_seed_data.sql
-- ====================================

-- Insert sample universities
INSERT INTO universities
    (name, location, established, type, accreditation, ranking, description, courses, facilities, status)
VALUES
    (
        'Invertis University',
        'Bareilly, Uttar Pradesh',
        1998,
        'Private',
        'UGC, NAAC A+',
        'Top 100 in India',
        'Invertis University is a leading private university offering world-class education.',
        '[
        {"name": "B.Tech Computer Science", "duration": "4 Years", "fees": "₹1,20,000/year", "eligibility": "10+2 with PCM, minimum 60%"},
        {"name": "MBA", "duration": "2 Years", "fees": "₹1,50,000/year", "eligibility": "Bachelor degree with minimum 50%"},
        {"name": "BCA", "duration": "3 Years", "fees": "₹80,000/year", "eligibility": "10+2 with minimum 50%"}
    ]',
    '["Library", "Hostel", "Sports Complex", "WiFi Campus", "Cafeteria"]',
    'active'
),
(
    'Amity University',
    'Noida, Uttar Pradesh',
    2005,
    'Private',
    'UGC, NAAC A+',
    'Top 50 in India',
    'Amity University is one of India''s leading private universities.',
    '[
        {"name": "B.Tech Computer Science", "duration": "4 Years", "fees": "₹2,50,000/year", "eligibility": "10+2 with PCM, minimum 70%"},
        {"name": "BBA", "duration": "3 Years", "fees": "₹2,00,000/year", "eligibility": "10+2 with minimum 60%"},
        {"name": "B.Arch", "duration": "5 Years", "fees": "₹2,75,000/year", "eligibility": "10+2 with Mathematics"}
    ]',
    '["Library", "Hostel", "Gym", "WiFi Campus", "Medical Center"]',
    'active'
),
(
    'Lovely Professional University',
    'Phagwara, Punjab',
    2005,
    'Private',
    'UGC, NAAC A++',
    'Top 80 in India',
    'LPU is one of India''s largest single-campus universities.',
    '[
        {"name": "B.Tech CSE", "duration": "4 Years", "fees": "₹1,40,000/year", "eligibility": "10+2 with PCM, minimum 60%"},
        {"name": "B.Sc Agriculture", "duration": "4 Years", "fees": "₹1,20,000/year", "eligibility": "10+2 with PCB/PCM"},
        {"name": "MBA", "duration": "2 Years", "fees": "₹1,80,000/year", "eligibility": "Graduation with 55%"}
    ]',
    '["Library", "Hostel", "Mall", "Hospital", "Indoor Stadium"]',
    'active'
);

