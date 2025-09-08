-- GladTidings Data Migration Script
-- Populate the GladTidings-focused schema with your existing data

-- 1. Insert Networks
INSERT INTO networks (id, name, code, is_active) VALUES
(1, 'MTN', 'mtn', TRUE),
(2, 'GLO', 'glo', TRUE),  
(3, 'AIRTEL', 'airtel', TRUE),
(6, '9MOBILE', '9mobile', TRUE);

-- 2. Insert System Configuration for GladTidings
INSERT INTO system_config (config_key, config_value, description, is_encrypted) VALUES
('gladtidings_api_base_url', 'https://gladtidingsapihub.com/api/v1', 'GladTidings API base URL', FALSE),
('gladtidings_api_token', 'your_api_token_here', 'GladTidings API authentication token', TRUE),
('gladtidings_webhook_secret', 'your_webhook_secret_here', 'GladTidings webhook verification secret', TRUE),
('gladtidings_timeout_seconds', '30', 'API request timeout in seconds', FALSE),
('gladtidings_retry_attempts', '3', 'Number of retry attempts for failed requests', FALSE),
('ercaspay_public_key', 'your_ercaspay_public_key', 'ErcasPay public key', FALSE),
('ercaspay_secret_key', 'your_ercaspay_secret_key', 'ErcasPay secret key', TRUE);

-- 3. Insert GladTidings Data Plans from your CSV data
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
    is_available
) VALUES
-- MTN Plans
('167', 1, 'SME', '2 GB', 2048, 30, '30 days', 1448.00, 1448.00, 1498.00, TRUE),
('168', 1, 'SME', '3.5 GB', 3584, 30, '30 days', 2412.00, 2407.00, 2457.00, TRUE),
('169', 1, 'SME', '6 GB', 6144, 7, '7 days', 2412.00, 2412.00, 2462.00, TRUE),
('486', 1, 'SME', '1 GB', 1024, 7, '7 days', 750.00, 620.00, 670.00, TRUE),
('506', 1, 'SME', '2 GB', 2048, 7, '7 days', 2400.00, 2400.00, 2450.00, TRUE),
('528', 1, 'SME', '500 MB', 512, 7, '7 days', 485.00, 480.00, 530.00, TRUE),
('539', 1, 'SME', '10 GB', 10240, 30, '30 days', 4943.00, 4943.00, 4993.00, TRUE),
('649', 1, 'SME', '1 GB', 1024, 30, '30 days', 750.00, 740.00, 790.00, TRUE),

-- GLO Plans  
('491', 2, 'SME', '750 MB', 768, 1, '1 day', 196.00, 196.00, 246.00, TRUE),
('492', 2, 'SME', '1.5 GB', 1536, 1, '1 day', 290.00, 290.00, 340.00, TRUE),
('493', 2, 'SME', '2.5 GB', 2560, 2, '2 days', 478.00, 478.00, 528.00, TRUE),
('494', 2, 'SME', '10 GB', 10240, 7, '7 days', 1888.00, 1888.00, 1938.00, TRUE),

-- AIRTEL Plans
('476', 3, 'SME', '150 MB', 154, 1, '1 day', 58.00, 55.00, 105.00, TRUE),
('477', 3, 'SME', '300 MB', 307, 2, '2 days', 105.00, 100.00, 150.00, TRUE),
('478', 3, 'SME', '600 MB', 614, 2, '2 days', 210.00, 205.00, 255.00, TRUE),
('481', 3, 'SME', '3 GB', 3072, 2, '2 days', 980.00, 980.00, 1030.00, TRUE),
('482', 3, 'SME', '7 GB', 7168, 7, '7 days', 2010.00, 2010.00, 2060.00, TRUE),
('483', 3, 'SME', '10 GB', 10240, 30, '30 days', 3010.00, 3010.00, 3060.00, TRUE),
('534', 3, 'SME', '10 GB', 10240, 30, '30 days', 4875.00, 4875.00, 4925.00, TRUE),

-- 9MOBILE Plans
('344', 6, 'SME', '500 MB', 512, 30, '30 days', 125.00, 120.00, 170.00, TRUE),
('346', 6, 'SME', '3.5 GB', 3584, 30, '30 days', 875.00, 840.00, 890.00, TRUE),
('349', 6, 'SME', '7 GB', 7168, 30, '30 days', 1680.00, 1400.00, 1450.00, TRUE),
('350', 6, 'SME', '15 GB', 15360, 30, '30 days', 3000.00, 3000.00, 3050.00, TRUE),
('499', 6, 'SME', '250 MB', 256, 14, '14 days', 75.00, 75.00, 125.00, TRUE);

-- 4. Verification queries
-- Check all plans are loaded
SELECT 
    n.name as network,
    COUNT(*) as plan_count,
    MIN(dp.customer_amount) as min_price,
    MAX(dp.customer_amount) as max_price,
    ROUND(AVG(dp.profit), 2) as avg_profit
FROM data_plans dp
JOIN networks n ON dp.network_id = n.id
GROUP BY n.id, n.name
ORDER BY n.name;

-- Check profit margins by network
SELECT 
    n.name as network,
    dp.data_amount,
    dp.gladtidings_amount as cost,
    dp.customer_amount as price,
    dp.profit,
    ROUND((dp.profit / dp.customer_amount * 100), 2) as profit_margin_percent
FROM data_plans dp
JOIN networks n ON dp.network_id = n.id
ORDER BY n.name, dp.data_amount_mb;

-- Test the get_plans_by_network function
SELECT 'MTN Plans:' as info;
SELECT * FROM get_plans_by_network('mtn');

SELECT 'GLO Plans:' as info;  
SELECT * FROM get_plans_by_network('glo');

-- Test creating a sample transaction
DO $$
DECLARE
    sample_transaction_id UUID;
BEGIN
    SELECT create_transaction('08012345678', 'mtn', '649') INTO sample_transaction_id;
    RAISE NOTICE 'Sample transaction created: %', sample_transaction_id;
    
    -- Show the created transaction
    PERFORM (
        SELECT 
            t.id,
            t.phone_number,
            n.name as network,
            dp.data_amount,
            t.amount,
            t.gladtidings_cost,
            t.profit,
            t.status
        FROM transactions t
        JOIN networks n ON t.network_id = n.id
        JOIN data_plans dp ON t.data_plan_id = dp.id
        WHERE t.id = sample_transaction_id
    );
END $$;