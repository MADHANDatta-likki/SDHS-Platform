CREATE TABLE IF NOT EXISTS volunteer_applicant (
    applicant_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255) NOT NULL,
    photo_url TEXT NOT NULL,
    referred_by_volunteer_id VARCHAR(50) NOT NULL,
    applicant_status VARCHAR(50) NOT NULL,
    admin_comments TEXT,
    created_at TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(100),
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_volunteer_applicant_status
    ON volunteer_applicant (applicant_status);

CREATE INDEX IF NOT EXISTS idx_volunteer_applicant_referred_by
    ON volunteer_applicant (referred_by_volunteer_id);
