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