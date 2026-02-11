-- Initial schema for Identity Core (Sprint 1)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    hashed_pin TEXT NOT NULL,
    full_name VARCHAR(100),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    kyc_tier INTEGER DEFAULT 0, -- 0: Unverified, 1: Basic, 2: Standard, 3: Full
    security_question TEXT,
    security_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookup via phone number
CREATE INDEX idx_users_phone ON users(phone_number);

-- Basic audit log table for critical identity changes
CREATE TABLE identity_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- e.g., 'ONBOARDING', 'PIN_CHANGE', 'KYC_UPGRADE'
    previous_state JSONB,
    new_state JSONB,
    actor_id UUID, -- Admin ID or the user themselves
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
