-- H2 Database Migration Script for Admin Dashboard
-- For H2 embedded database (Development/Testing)

-- 1. Create service_applications table
CREATE TABLE IF NOT EXISTS service_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_notes VARCHAR(2000),
    rejection_reason VARCHAR(2000),
    certificate_file_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_status ON service_applications(status);
CREATE INDEX IF NOT EXISTS idx_user_service ON service_applications(user_id, service_id);
CREATE INDEX IF NOT EXISTS idx_application_date ON service_applications(application_date);

-- 3. Add file_type column to file_records if it doesn't exist
ALTER TABLE file_records ADD COLUMN IF NOT EXISTS file_type VARCHAR(50) DEFAULT 'USER_UPLOAD';

-- 4. Update rejection_reasons table to add application_id
ALTER TABLE rejection_reasons ADD COLUMN IF NOT EXISTS application_id BIGINT;
ALTER TABLE rejection_reasons ADD COLUMN IF NOT EXISTS created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE rejection_reasons ADD CONSTRAINT IF NOT EXISTS fk_rejection_application FOREIGN KEY (application_id) REFERENCES service_applications(id) ON DELETE CASCADE;

-- ============================================================================
-- SAMPLE DATA FOR TESTING (Optional - Uncomment to use)
-- ============================================================================

-- Sample admin user (password needs to be hashed using bcrypt)
-- INSERT INTO users (name, email, mobile, password, role) 
-- VALUES ('Admin User', 'admin@test.com', '1234567890', '[bcrypt_hashed_password]', 'ADMIN');

-- Sample services for testing
-- INSERT INTO services (name, description, estimated_days, department) 
-- VALUES 
-- ('Birth Certificate', 'Apply for official birth certificate', 3, 'Civic Services'),
-- ('Driver License', 'Apply for new driving license', 7, 'Transport'),
-- ('Property Registration', 'Register property ownership', 14, 'Revenue'),
-- ('Business License', 'Register and get business license', 10, 'Commerce'),
-- ('Passport', 'Apply for a new passport', 21, 'Home Affairs');

-- Sample applications (if users and services exist)
-- INSERT INTO service_applications (user_id, service_id, status, admin_notes, rejection_reason)
-- VALUES 
-- (1, 1, 'PENDING', NULL, NULL),
-- (2, 2, 'IN_PROGRESS', 'Documents under review', NULL),
-- (3, 3, 'APPROVED', 'All documents verified', NULL),
-- (4, 1, 'REJECTED', NULL, 'Missing required identification document');
