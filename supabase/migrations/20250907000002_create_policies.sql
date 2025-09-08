-- Row Level Security Policies for GladTidings Platform
-- This migration sets up security policies for public access patterns

-- Enable RLS on all tables
ALTER TABLE networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gladtidings_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Networks policies (public read for active networks)
CREATE POLICY "Anyone can view active networks" ON networks
    FOR SELECT USING (is_active = true);

-- Data plans policies (public read for available plans)
CREATE POLICY "Anyone can view available data plans" ON data_plans
    FOR SELECT USING (is_available = true);

-- Transactions policies (users can read their own transactions)
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (true); -- For MVP, allow reading transactions by reference

CREATE POLICY "Anyone can create transactions" ON transactions
    FOR INSERT WITH CHECK (true); -- For MVP, allow transaction creation

CREATE POLICY "System can update transactions" ON transactions
    FOR UPDATE USING (true); -- For webhooks and status updates

-- Payments policies (similar to transactions)
CREATE POLICY "Users can view payments" ON payments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create payments" ON payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true);

-- Logs are system-only (no public access)
CREATE POLICY "No public access to gladtidings_logs" ON gladtidings_logs
    FOR ALL USING (false);

CREATE POLICY "No public access to webhook_logs" ON webhook_logs
    FOR ALL USING (false);

-- System config - public read for non-encrypted config only
CREATE POLICY "Public can read non-encrypted config" ON system_config
    FOR SELECT USING (is_encrypted = false);

-- Create views for easier public access
CREATE OR REPLACE VIEW available_plans AS
SELECT 
    dp.id,
    dp.gladtidings_plan_id,
    dp.network_id,
    n.name as network_name,
    n.code as network_code,
    dp.plan_type,
    dp.data_amount,
    dp.data_amount_mb,
    dp.validity_text,
    dp.customer_amount,
    dp.profit,
    dp.description
FROM data_plans dp
JOIN networks n ON dp.network_id = n.id
WHERE dp.is_available = true 
AND n.is_active = true;

-- View for transaction status (public can check by ID)
CREATE OR REPLACE VIEW transaction_status AS
SELECT 
    t.id,
    t.phone_number,
    n.name as network_name,
    dp.data_amount,
    t.amount,
    t.status,
    t.payment_reference,
    t.initiated_at,
    t.completed_at,
    t.failure_reason
FROM transactions t
JOIN networks n ON t.network_id = n.id
JOIN data_plans dp ON t.data_plan_id = dp.id;

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_plans_by_network(p_network_code TEXT)
RETURNS TABLE(
    plan_id INTEGER,
    gladtidings_plan_id VARCHAR,
    data_amount VARCHAR,
    validity_text VARCHAR,
    customer_amount DECIMAL,
    profit DECIMAL,
    description TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dp.id,
        dp.gladtidings_plan_id,
        dp.data_amount,
        dp.validity_text,
        dp.customer_amount,
        dp.profit,
        dp.description
    FROM data_plans dp
    JOIN networks n ON dp.network_id = n.id
    WHERE n.code = p_network_code
    AND dp.is_available = true
    AND n.is_active = true
    ORDER BY dp.data_amount_mb;
END;
$$ LANGUAGE plpgsql;

-- Function to create transaction (with basic validation)
CREATE OR REPLACE FUNCTION create_transaction(
    p_phone_number VARCHAR,
    p_network_code VARCHAR,
    p_gladtidings_plan_id VARCHAR
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
    v_transaction_id UUID;
    v_network_id INTEGER;
    v_plan_id INTEGER;
    v_customer_amount DECIMAL;
    v_gladtidings_cost DECIMAL;
BEGIN
    -- Get network ID
    SELECT id INTO v_network_id 
    FROM networks 
    WHERE code = p_network_code AND is_active = true;
    
    IF v_network_id IS NULL THEN
        RAISE EXCEPTION 'Invalid network code: %', p_network_code;
    END IF;
    
    -- Get plan details
    SELECT id, customer_amount, gladtidings_amount 
    INTO v_plan_id, v_customer_amount, v_gladtidings_cost
    FROM data_plans 
    WHERE gladtidings_plan_id = p_gladtidings_plan_id 
    AND is_available = true;
    
    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or unavailable plan ID: %', p_gladtidings_plan_id;
    END IF;
    
    -- Basic phone number validation (Nigerian format)
    IF NOT (p_phone_number ~ '^(\+234|234|0)[7-9][0-9]{9}$') THEN
        RAISE EXCEPTION 'Invalid Nigerian phone number format: %', p_phone_number;
    END IF;
    
    -- Create transaction
    INSERT INTO transactions (
        phone_number, 
        network_id, 
        data_plan_id, 
        amount, 
        gladtidings_cost
    ) VALUES (
        p_phone_number,
        v_network_id,
        v_plan_id,
        v_customer_amount,
        v_gladtidings_cost
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions to anon role (for public API)
GRANT EXECUTE ON FUNCTION get_plans_by_network(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_transaction(VARCHAR, VARCHAR, VARCHAR) TO anon;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON transactions TO anon;
GRANT INSERT ON payments TO anon;
GRANT UPDATE ON transactions TO anon;
GRANT UPDATE ON payments TO anon;