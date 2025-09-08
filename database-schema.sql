-- Multi-Aggregator Data Purchase Platform Database Schema
-- Supports multiple aggregators with flexible pricing and routing

-- Aggregators/Providers table
CREATE TABLE aggregators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'GladTidingsData', 'DataHub', 'VTpass'
    slug VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'gladtidings', 'datahub', 'vtpass'
    api_base_url TEXT NOT NULL,
    api_token_encrypted TEXT, -- Store encrypted API tokens
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    priority INTEGER DEFAULT 100, -- Lower number = higher priority for routing
    success_rate DECIMAL(5,2) DEFAULT 100.00, -- Track reliability %
    average_response_time INTEGER, -- In seconds
    daily_limit INTEGER, -- Max transactions per day
    current_daily_usage INTEGER DEFAULT 0,
    supports_webhooks BOOLEAN DEFAULT FALSE,
    webhook_secret_encrypted TEXT,
    rate_limit_per_minute INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Networks table (unchanged from your current structure)
CREATE TABLE networks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- MTN, GLO, AIRTEL, 9MOBILE
    code VARCHAR(10) UNIQUE NOT NULL, -- mtn, glo, airtel, 9mobile
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Plans with multi-aggregator support
CREATE TABLE data_plans (
    id SERIAL PRIMARY KEY,
    aggregator_id INTEGER REFERENCES aggregators(id),
    network_id INTEGER REFERENCES networks(id),
    external_plan_id VARCHAR(100), -- Plan ID from aggregator's system
    plan_type VARCHAR(50), -- SME, GIFTING, CORPORATE, etc.
    data_amount VARCHAR(50) NOT NULL, -- '2 GB', '500 MB', etc.
    data_amount_mb INTEGER, -- Normalized to MB for sorting/comparison
    validity_days INTEGER,
    validity_text VARCHAR(50), -- '30 days', '7 days', etc.
    
    -- Pricing structure
    cost_price DECIMAL(10,2) NOT NULL, -- What we pay to aggregator
    selling_price DECIMAL(10,2) NOT NULL, -- What customer pays
    profit_margin DECIMAL(10,2) GENERATED ALWAYS AS (selling_price - cost_price) STORED,
    
    -- Availability and status
    is_available BOOLEAN DEFAULT TRUE,
    stock_status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
    last_checked_at TIMESTAMP,
    
    -- Metadata
    description TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique plans per aggregator-network combination
    UNIQUE(aggregator_id, network_id, external_plan_id)
);

-- Aggregator capabilities (what each aggregator supports)
CREATE TABLE aggregator_networks (
    id SERIAL PRIMARY KEY,
    aggregator_id INTEGER REFERENCES aggregators(id),
    network_id INTEGER REFERENCES networks(id),
    is_supported BOOLEAN DEFAULT TRUE,
    last_tested_at TIMESTAMP,
    test_status ENUM('passed', 'failed', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aggregator_id, network_id)
);

-- Smart routing configuration
CREATE TABLE routing_rules (
    id SERIAL PRIMARY KEY,
    network_id INTEGER REFERENCES networks(id),
    aggregator_id INTEGER REFERENCES aggregators(id),
    priority INTEGER DEFAULT 100, -- Lower = higher priority
    conditions JSONB, -- Flexible conditions: {"amount_min": 100, "amount_max": 5000, "time_of_day": "business_hours"}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction tracking with aggregator info
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    network_id INTEGER REFERENCES networks(id),
    data_plan_id INTEGER REFERENCES data_plans(id),
    aggregator_id INTEGER REFERENCES aggregators(id),
    
    -- Amounts
    amount DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    profit DECIMAL(10,2) GENERATED ALWAYS AS (amount - cost_price) STORED,
    
    -- Status tracking
    status ENUM('pending', 'payment_pending', 'payment_confirmed', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    
    -- External references
    payment_reference VARCHAR(255),
    aggregator_reference VARCHAR(255),
    aggregator_transaction_id VARCHAR(255),
    
    -- Timing
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_confirmed_at TIMESTAMP,
    processing_started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    user_agent TEXT,
    ip_address INET,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment records (unchanged from your existing structure)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    payment_gateway VARCHAR(50), -- 'ercaspay', 'paystack', etc.
    gateway_reference VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'successful', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    gateway_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook logs for debugging and audit
CREATE TABLE webhook_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- 'ercaspay', 'gladtidings', etc.
    event_type VARCHAR(100),
    reference_id VARCHAR(255),
    payload JSONB,
    status ENUM('received', 'processed', 'failed') DEFAULT 'received',
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aggregator performance tracking
CREATE TABLE aggregator_metrics (
    id SERIAL PRIMARY KEY,
    aggregator_id INTEGER REFERENCES aggregators(id),
    date DATE DEFAULT CURRENT_DATE,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    average_response_time DECIMAL(8,2), -- in seconds
    total_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(aggregator_id, date)
);

-- Indexes for performance
CREATE INDEX idx_data_plans_network_available ON data_plans(network_id, is_available);
CREATE INDEX idx_data_plans_aggregator_network ON data_plans(aggregator_id, network_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_phone_date ON transactions(phone_number, created_at);
CREATE INDEX idx_transactions_aggregator_date ON transactions(aggregator_id, created_at);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_webhook_logs_source_status ON webhook_logs(source, status);

-- Views for easier querying
CREATE VIEW available_plans AS
SELECT 
    dp.id,
    dp.aggregator_id,
    a.name as aggregator_name,
    dp.network_id,
    n.name as network_name,
    dp.external_plan_id,
    dp.plan_type,
    dp.data_amount,
    dp.data_amount_mb,
    dp.validity_text,
    dp.cost_price,
    dp.selling_price,
    dp.profit_margin,
    a.priority as aggregator_priority,
    a.success_rate as aggregator_success_rate
FROM data_plans dp
JOIN aggregators a ON dp.aggregator_id = a.id
JOIN networks n ON dp.network_id = n.id
WHERE dp.is_available = TRUE 
AND a.status = 'active'
AND n.is_active = TRUE
ORDER BY n.name, dp.data_amount_mb, a.priority;

-- Function to get best aggregator for a plan
CREATE OR REPLACE FUNCTION get_best_aggregator_for_plan(
    p_network_id INTEGER,
    p_data_amount_mb INTEGER,
    p_amount DECIMAL DEFAULT NULL
)
RETURNS TABLE(
    aggregator_id INTEGER,
    data_plan_id INTEGER,
    aggregator_name VARCHAR,
    priority INTEGER,
    success_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.aggregator_id,
        dp.id as data_plan_id,
        a.name as aggregator_name,
        a.priority,
        a.success_rate
    FROM data_plans dp
    JOIN aggregators a ON dp.aggregator_id = a.id
    WHERE dp.network_id = p_network_id
    AND dp.data_amount_mb = p_data_amount_mb
    AND dp.is_available = TRUE
    AND a.status = 'active'
    AND (p_amount IS NULL OR dp.selling_price <= p_amount)
    AND a.current_daily_usage < COALESCE(a.daily_limit, 999999)
    ORDER BY a.priority ASC, a.success_rate DESC
    LIMIT 3; -- Return top 3 options
END;
$$ LANGUAGE plpgsql;