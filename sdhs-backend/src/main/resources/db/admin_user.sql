CREATE TABLE IF NOT EXISTS admin_user (
    admin_user_id BIGSERIAL PRIMARY KEY,
    volunteer_id VARCHAR(50) NOT NULL UNIQUE,
    admin_role VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_user_volunteer_active
    ON admin_user (volunteer_id, is_active);
