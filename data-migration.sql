-- Data Migration Script: Populate multi-aggregator schema with existing data
-- Run this after creating the main schema

-- 1. Insert Networks
INSERT INTO networks (id, name, code, is_active) VALUES
(1, 'MTN', 'mtn', TRUE),
(2, 'GLO', 'glo', TRUE),  
(3, 'AIRTEL', 'airtel', TRUE),
(6, '9MOBILE', '9mobile', TRUE);

-- 2. Insert Sample Aggregator (GladTidingsData based on your CLAUDE.md)
INSERT INTO aggregators (
    name, 
    slug, 
    api_base_url, 
    status, 
    priority, 
    success_rate, 
    supports_webhooks,
    daily_limit,
    rate_limit_per_minute
) VALUES (
    'GladTidingsData',
    'gladtidings',
    'https://gladtidingsapihub.com/api/v1',
    'active',
    10, -- High priority
    98.5,
    TRUE,
    1000, -- 1000 transactions per day limit
    30 -- 30 requests per minute
);

-- Get the aggregator ID for data insertion
DO $$
DECLARE
    gladtidings_id INTEGER;
BEGIN
    SELECT id INTO gladtidings_id FROM aggregators WHERE slug = 'gladtidings';
    
    -- 3. Insert your existing data plans
    -- MTN Plans
    INSERT INTO data_plans (aggregator_id, network_id, external_plan_id, plan_type, data_amount, data_amount_mb, validity_days, validity_text, cost_price, selling_price, is_available) VALUES
    (gladtidings_id, 1, '167', 'SME', '2 GB', 2048, 30, '30 days', 1448.00, 1498.00, TRUE),
    (gladtidings_id, 1, '168', 'SME', '3.5 GB', 3584, 30, '30 days', 2407.00, 2457.00, TRUE),
    (gladtidings_id, 1, '169', 'SME', '6 GB', 6144, 7, '7 days', 2412.00, 2462.00, TRUE),
    (gladtidings_id, 1, '486', 'SME', '1 GB', 1024, 7, '7 days', 620.00, 670.00, TRUE),
    (gladtidings_id, 1, '506', 'SME', '2 GB', 2048, 7, '7 days', 2400.00, 2450.00, TRUE),
    (gladtidings_id, 1, '528', 'SME', '500 MB', 512, 7, '7 days', 480.00, 530.00, TRUE),
    (gladtidings_id, 1, '539', 'SME', '10 GB', 10240, 30, '30 days', 4943.00, 4993.00, TRUE),
    (gladtidings_id, 1, '649', 'SME', '1 GB', 1024, 30, '30 days', 740.00, 790.00, TRUE);

    -- GLO Plans  
    INSERT INTO data_plans (aggregator_id, network_id, external_plan_id, plan_type, data_amount, data_amount_mb, validity_days, validity_text, cost_price, selling_price, is_available) VALUES
    (gladtidings_id, 2, '491', 'SME', '750 MB', 768, 1, '1 day', 196.00, 246.00, TRUE),
    (gladtidings_id, 2, '492', 'SME', '1.5 GB', 1536, 1, '1 day', 290.00, 340.00, TRUE),
    (gladtidings_id, 2, '493', 'SME', '2.5 GB', 2560, 2, '2 days', 478.00, 528.00, TRUE),
    (gladtidings_id, 2, '494', 'SME', '10 GB', 10240, 7, '7 days', 1888.00, 1938.00, TRUE);

    -- AIRTEL Plans
    INSERT INTO data_plans (aggregator_id, network_id, external_plan_id, plan_type, data_amount, data_amount_mb, validity_days, validity_text, cost_price, selling_price, is_available) VALUES
    (gladtidings_id, 3, '476', 'SME', '150 MB', 154, 1, '1 day', 55.00, 105.00, TRUE),
    (gladtidings_id, 3, '477', 'SME', '300 MB', 307, 2, '2 days', 100.00, 150.00, TRUE),
    (gladtidings_id, 3, '478', 'SME', '600 MB', 614, 2, '2 days', 205.00, 255.00, TRUE),
    (gladtidings_id, 3, '481', 'SME', '3 GB', 3072, 2, '2 days', 980.00, 1030.00, TRUE),
    (gladtidings_id, 3, '482', 'SME', '7 GB', 7168, 7, '7 days', 2010.00, 2060.00, TRUE),
    (gladtidings_id, 3, '483', 'SME', '10 GB', 10240, 30, '30 days', 3010.00, 3060.00, TRUE),
    (gladtidings_id, 3, '534', 'SME', '10 GB', 10240, 30, '30 days', 4875.00, 4925.00, TRUE);

    -- 9MOBILE Plans
    INSERT INTO data_plans (aggregator_id, network_id, external_plan_id, plan_type, data_amount, data_amount_mb, validity_days, validity_text, cost_price, selling_price, is_available) VALUES
    (gladtidings_id, 6, '344', 'SME', '500 MB', 512, 30, '30 days', 120.00, 170.00, TRUE),
    (gladtidings_id, 6, '346', 'SME', '3.5 GB', 3584, 30, '30 days', 840.00, 890.00, TRUE),
    (gladtidings_id, 6, '349', 'SME', '7 GB', 7168, 30, '30 days', 1400.00, 1450.00, TRUE),
    (gladtidings_id, 6, '350', 'SME', '15 GB', 15360, 30, '30 days', 3000.00, 3050.00, TRUE),
    (gladtidings_id, 6, '499', 'SME', '250 MB', 256, 14, '14 days', 75.00, 125.00, TRUE);

    -- 4. Set up aggregator network support
    INSERT INTO aggregator_networks (aggregator_id, network_id, is_supported, test_status) VALUES
    (gladtidings_id, 1, TRUE, 'passed'), -- MTN
    (gladtidings_id, 2, TRUE, 'passed'), -- GLO  
    (gladtidings_id, 3, TRUE, 'passed'), -- AIRTEL
    (gladtidings_id, 6, TRUE, 'passed'); -- 9MOBILE

    -- 5. Set up default routing rules (prioritize this aggregator for all networks)
    INSERT INTO routing_rules (network_id, aggregator_id, priority, conditions, is_active) VALUES
    (1, gladtidings_id, 10, '{"max_amount": 10000}', TRUE), -- MTN
    (2, gladtidings_id, 10, '{"max_amount": 10000}', TRUE), -- GLO
    (3, gladtidings_id, 10, '{"max_amount": 10000}', TRUE), -- AIRTEL  
    (6, gladtidings_id, 10, '{"max_amount": 10000}', TRUE); -- 9MOBILE
    
END $$;

-- 6. Create sample queries to verify data
-- View all available plans grouped by network
SELECT 
    n.name as network,
    COUNT(*) as plan_count,
    MIN(dp.selling_price) as min_price,
    MAX(dp.selling_price) as max_price,
    AVG(dp.profit_margin) as avg_profit
FROM data_plans dp
JOIN networks n ON dp.network_id = n.id
WHERE dp.is_available = TRUE
GROUP BY n.id, n.name
ORDER BY n.name;

-- Test the best aggregator function
SELECT * FROM get_best_aggregator_for_plan(1, 2048, NULL); -- MTN 2GB plans
SELECT * FROM get_best_aggregator_for_plan(2, 1536, NULL); -- GLO 1.5GB plans

-- View available plans with aggregator info
SELECT * FROM available_plans WHERE network_name = 'MTN' ORDER BY data_amount_mb;