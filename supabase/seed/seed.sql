-- Seed data for GladTidings Data Purchase Platform
-- This file populates the database with initial data

-- 1. Insert Networks
INSERT INTO networks (id, name, code, is_active) VALUES
(1, 'MTN', 'mtn', TRUE),
(2, 'GLO', 'glo', TRUE),  
(3, 'AIRTEL', 'airtel', TRUE),
(6, '9MOBILE', '9mobile', TRUE);

-- Reset the sequence to continue from the highest ID
SELECT setval('networks_id_seq', (SELECT MAX(id) FROM networks));

-- 2. Insert System Configuration
INSERT INTO system_config (config_key, config_value, description, is_encrypted) VALUES
('gladtidings_api_base_url', 'https://gladtidingsapihub.com/api/v1', 'GladTidings API base URL', FALSE),
('gladtidings_api_token', 'your_api_token_here', 'GladTidings API authentication token', TRUE),
('gladtidings_webhook_secret', 'your_webhook_secret_here', 'GladTidings webhook verification secret', TRUE),
('gladtidings_timeout_seconds', '30', 'API request timeout in seconds', FALSE),
('gladtidings_retry_attempts', '3', 'Number of retry attempts for failed requests', FALSE),
('ercaspay_public_key', 'your_ercaspay_public_key', 'ErcasPay public key for payment processing', FALSE),
('ercaspay_secret_key', 'your_ercaspay_secret_key', 'ErcasPay secret key for payment processing', TRUE),
('ercaspay_base_url', 'https://api.merchant.staging.ercaspay.com/api/v1', 'ErcasPay API base URL (staging)', FALSE),
('platform_name', 'DataHub MVP', 'Platform name for display', FALSE),
('support_email', 'support@example.com', 'Support contact email', FALSE),
('maintenance_mode', 'false', 'Enable maintenance mode', FALSE);

-- 3. Insert GladTidings Data Plans
INSERT INTO data_plans (
    gladtidings_plan_id, 
    network_id, 
    plan_type, 
    data_amount, 
    data_amount_mb, 
    validity_days, 
    validity_text, 
    original_amount,
    gladtidings_amount, 
    customer_amount, 
    is_available,
    description
) VALUES
-- MTN Plans
('167', 1, 'SME', '2 GB', 2048, 30, '30 days', 1448.00, 1448.00, 1498.00, TRUE, 'MTN 2GB SME data bundle valid for 30 days'),
('168', 1, 'SME', '3.5 GB', 3584, 30, '30 days', 2412.00, 2407.00, 2457.00, TRUE, 'MTN 3.5GB SME data bundle valid for 30 days'),
('169', 1, 'SME', '6 GB', 6144, 7, '7 days', 2412.00, 2412.00, 2462.00, TRUE, 'MTN 6GB SME data bundle valid for 7 days'),
('486', 1, 'SME', '1 GB', 1024, 7, '7 days', 750.00, 620.00, 670.00, TRUE, 'MTN 1GB SME data bundle valid for 7 days'),
('506', 1, 'SME', '2 GB', 2048, 7, '7 days', 2400.00, 2400.00, 2450.00, TRUE, 'MTN 2GB SME data bundle valid for 7 days'),
('528', 1, 'SME', '500 MB', 512, 7, '7 days', 485.00, 480.00, 530.00, TRUE, 'MTN 500MB SME data bundle valid for 7 days'),
('539', 1, 'SME', '10 GB', 10240, 30, '30 days', 4943.00, 4943.00, 4993.00, TRUE, 'MTN 10GB SME data bundle valid for 30 days'),
('649', 1, 'SME', '1 GB', 1024, 30, '30 days', 750.00, 740.00, 790.00, TRUE, 'MTN 1GB SME data bundle valid for 30 days'),

-- GLO Plans  
('491', 2, 'SME', '750 MB', 768, 1, '1 day', 196.00, 196.00, 246.00, TRUE, 'GLO 750MB SME data bundle valid for 1 day'),
('492', 2, 'SME', '1.5 GB', 1536, 1, '1 day', 290.00, 290.00, 340.00, TRUE, 'GLO 1.5GB SME data bundle valid for 1 day'),
('493', 2, 'SME', '2.5 GB', 2560, 2, '2 days', 478.00, 478.00, 528.00, TRUE, 'GLO 2.5GB SME data bundle valid for 2 days'),
('494', 2, 'SME', '10 GB', 10240, 7, '7 days', 1888.00, 1888.00, 1938.00, TRUE, 'GLO 10GB SME data bundle valid for 7 days'),

-- AIRTEL Plans
('476', 3, 'SME', '150 MB', 154, 1, '1 day', 58.00, 55.00, 105.00, TRUE, 'Airtel 150MB SME data bundle valid for 1 day'),
('477', 3, 'SME', '300 MB', 307, 2, '2 days', 105.00, 100.00, 150.00, TRUE, 'Airtel 300MB SME data bundle valid for 2 days'),
('478', 3, 'SME', '600 MB', 614, 2, '2 days', 210.00, 205.00, 255.00, TRUE, 'Airtel 600MB SME data bundle valid for 2 days'),
('481', 3, 'SME', '3 GB', 3072, 2, '2 days', 980.00, 980.00, 1030.00, TRUE, 'Airtel 3GB SME data bundle valid for 2 days'),
('482', 3, 'SME', '7 GB', 7168, 7, '7 days', 2010.00, 2010.00, 2060.00, TRUE, 'Airtel 7GB SME data bundle valid for 7 days'),
('483', 3, 'SME', '10 GB', 10240, 30, '30 days', 3010.00, 3010.00, 3060.00, TRUE, 'Airtel 10GB SME data bundle valid for 30 days'),
('534', 3, 'SME', '10 GB', 10240, 30, '30 days', 4875.00, 4875.00, 4925.00, TRUE, 'Airtel 10GB SME data bundle valid for 30 days (premium)'),

-- 9MOBILE Plans
('344', 6, 'SME', '500 MB', 512, 30, '30 days', 125.00, 120.00, 170.00, TRUE, '9mobile 500MB SME data bundle valid for 30 days'),
('346', 6, 'SME', '3.5 GB', 3584, 30, '30 days', 875.00, 840.00, 890.00, TRUE, '9mobile 3.5GB SME data bundle valid for 30 days'),
('349', 6, 'SME', '7 GB', 7168, 30, '30 days', 1680.00, 1400.00, 1450.00, TRUE, '9mobile 7GB SME data bundle valid for 30 days'),
('350', 6, 'SME', '15 GB', 15360, 30, '30 days', 3000.00, 3000.00, 3050.00, TRUE, '9mobile 15GB SME data bundle valid for 30 days'),
('499', 6, 'SME', '250 MB', 256, 14, '14 days', 75.00, 75.00, 125.00, TRUE, '9mobile 250MB SME data bundle valid for 14 days');