-- MedFayda Centralized System - Seed Data
-- Sample health centers across Ethiopia

-- Insert sample health centers
INSERT INTO health_centers (id, name, type, level, region, zone, woreda, city, address, phone_number, email, services, operating_hours, is_active, created_at, updated_at) VALUES
-- Addis Ababa
('HC001', 'Black Lion Hospital', 'hospital', 'tertiary', 'Addis Ababa', 'Addis Ababa', 'Gulele', 'Addis Ababa', 'Lideta Sub-City, Addis Ababa', '+251-11-551-7611', 'info@blacklionhospital.gov.et', 
 '["emergency", "surgery", "internal_medicine", "pediatrics", "obstetrics", "cardiology", "neurology"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

('HC002', 'Tikur Anbessa Specialized Hospital', 'hospital', 'tertiary', 'Addis Ababa', 'Addis Ababa', 'Lideta', 'Addis Ababa', 'Lideta Sub-City, Addis Ababa', '+251-11-551-8001', 'info@tash.gov.et',
 '["specialized_surgery", "oncology", "cardiology", "neurology", "transplant", "research"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

('HC003', 'Zewditu Memorial Hospital', 'hospital', 'secondary', 'Addis Ababa', 'Addis Ababa', 'Arada', 'Addis Ababa', 'Arada Sub-City, Addis Ababa', '+251-11-551-2345', 'info@zewditu.gov.et',
 '["general_medicine", "surgery", "pediatrics", "obstetrics", "emergency"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- Oromia Region
('HC004', 'Adama Hospital Medical College', 'hospital', 'secondary', 'Oromia', 'East Shewa', 'Adama', 'Adama', 'Adama City, Oromia Region', '+251-22-111-2345', 'info@adamahospital.edu.et',
 '["general_medicine", "surgery", "pediatrics", "obstetrics", "laboratory", "radiology"]',
 '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "08:00-18:00", "sunday": "08:00-18:00"}',
 true, NOW(), NOW()),

('HC005', 'Jimma University Medical Center', 'hospital', 'tertiary', 'Oromia', 'Jimma', 'Jimma', 'Jimma', 'Jimma University, Jimma', '+251-47-111-2345', 'info@jumc.edu.et',
 '["emergency", "surgery", "internal_medicine", "pediatrics", "obstetrics", "research", "teaching"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- Amhara Region
('HC006', 'University of Gondar Hospital', 'hospital', 'tertiary', 'Amhara', 'North Gondar', 'Gondar', 'Gondar', 'University of Gondar, Gondar', '+251-58-111-2345', 'info@uog.edu.et',
 '["emergency", "surgery", "internal_medicine", "pediatrics", "obstetrics", "research", "teaching"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

('HC007', 'Dessie Referral Hospital', 'hospital', 'secondary', 'Amhara', 'South Wollo', 'Dessie', 'Dessie', 'Dessie City, Amhara Region', '+251-33-111-2345', 'info@dessie.hospital.gov.et',
 '["general_medicine", "surgery", "pediatrics", "obstetrics", "emergency", "laboratory"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- Tigray Region
('HC008', 'Mekelle Hospital', 'hospital', 'secondary', 'Tigray', 'Central Tigray', 'Mekelle', 'Mekelle', 'Mekelle City, Tigray Region', '+251-34-441-2345', 'info@mekelle.hospital.gov.et',
 '["general_medicine", "surgery", "pediatrics", "obstetrics", "emergency"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- SNNP Region
('HC009', 'Hawassa University Referral Hospital', 'hospital', 'tertiary', 'SNNP', 'Sidama', 'Hawassa', 'Hawassa', 'Hawassa University, Hawassa', '+251-46-220-2345', 'info@hu.edu.et',
 '["emergency", "surgery", "internal_medicine", "pediatrics", "obstetrics", "research", "teaching"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- Dire Dawa
('HC010', 'Dire Dawa Regional Hospital', 'hospital', 'secondary', 'Dire Dawa', 'Dire Dawa', 'Dire Dawa', 'Dire Dawa', 'Dire Dawa City', '+251-25-111-2345', 'info@diredawa.hospital.gov.et',
 '["general_medicine", "surgery", "pediatrics", "obstetrics", "emergency"]',
 '{"monday": "24/7", "tuesday": "24/7", "wednesday": "24/7", "thursday": "24/7", "friday": "24/7", "saturday": "24/7", "sunday": "24/7"}',
 true, NOW(), NOW()),

-- Primary Health Centers
('PHC001', 'Bole Health Center', 'health_center', 'primary', 'Addis Ababa', 'Addis Ababa', 'Bole', 'Addis Ababa', 'Bole Sub-City, Addis Ababa', '+251-11-661-2345', 'info@bole.hc.gov.et',
 '["general_medicine", "pediatrics", "maternal_health", "vaccination", "laboratory"]',
 '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "08:00-12:00", "sunday": "closed"}',
 true, NOW(), NOW()),

('PHC002', 'Kirkos Health Center', 'health_center', 'primary', 'Addis Ababa', 'Addis Ababa', 'Kirkos', 'Addis Ababa', 'Kirkos Sub-City, Addis Ababa', '+251-11-551-6789', 'info@kirkos.hc.gov.et',
 '["general_medicine", "pediatrics", "maternal_health", "vaccination", "laboratory"]',
 '{"monday": "08:00-17:00", "tuesday": "08:00-17:00", "wednesday": "08:00-17:00", "thursday": "08:00-17:00", "friday": "08:00-17:00", "saturday": "08:00-12:00", "sunday": "closed"}',
 true, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_centers_region_type ON health_centers(region, type);
CREATE INDEX IF NOT EXISTS idx_health_centers_active_level ON health_centers(is_active, level);

-- Insert sample system configuration
INSERT INTO system_config (key, value, description, created_at, updated_at) VALUES
('system_name', 'MedFayda Centralized Health Records', 'Official system name', NOW(), NOW()),
('version', '1.0.0', 'Current system version', NOW(), NOW()),
('maintenance_mode', 'false', 'System maintenance status', NOW(), NOW()),
('max_records_per_page', '50', 'Maximum records per page for API responses', NOW(), NOW()),
('audit_retention_days', '2555', 'Number of days to retain audit logs (7 years)', NOW(), NOW()),
('encryption_enabled', 'true', 'Whether sensitive data encryption is enabled', NOW(), NOW()),
('fayda_integration_enabled', 'true', 'Whether Fayda ID integration is active', NOW(), NOW()),
('backup_frequency_hours', '24', 'Database backup frequency in hours', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
