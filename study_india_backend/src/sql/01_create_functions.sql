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