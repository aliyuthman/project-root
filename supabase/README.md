# Supabase Database Setup

This directory contains the database schema and seed data for the GladTidings Data Purchase Platform.

## Files Structure

```
supabase/
├── migrations/
│   ├── 20250907000001_create_gladtidings_schema.sql  # Core schema
│   └── 20250907000002_create_policies.sql            # Security policies
├── seed/
│   └── seed.sql                                      # Initial data
├── config.toml                                       # Supabase configuration
└── README.md                                         # This file
```

## Setup Instructions

### 1. Initialize Supabase (if not already done)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init
```

### 2. Start Local Development
```bash
# Start local Supabase
supabase start

# The following services will be available:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
```

### 3. Run Migrations
```bash
# Apply all migrations
supabase db reset

# Or apply migrations manually
supabase db push
```

### 4. Seed Database
```bash
# Run seed file
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed/seed.sql
```

### 5. Connect to Production
```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push --linked
```

## Database Schema Overview

### Core Tables

- **networks**: MTN, GLO, Airtel, 9mobile
- **data_plans**: Available data plans with GladTidings pricing
- **transactions**: Customer purchase records
- **payments**: Payment processing via ErcasPay
- **gladtidings_logs**: API request/response logs
- **webhook_logs**: Webhook event logs
- **system_config**: Platform configuration

### Key Features

- **Row Level Security**: Enabled on all tables
- **Generated Columns**: Automatic profit calculations
- **Indexes**: Optimized for common queries
- **Functions**: Helper functions for common operations
- **Views**: Simplified data access for frontend

## API Usage Examples

### Get Available Plans
```sql
SELECT * FROM available_plans WHERE network_code = 'mtn';
```

### Create Transaction
```sql
SELECT create_transaction('08012345678', 'mtn', '649');
```

### Check Transaction Status
```sql
SELECT * FROM transaction_status WHERE id = 'your-transaction-id';
```

## Security Notes

- All sensitive configuration is marked as encrypted
- Public API access is controlled via RLS policies
- Phone number validation is built into transaction creation
- System logs are not publicly accessible

## Environment Variables Required

Set these in your application:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# GladTidings (stored in system_config table)
GLADTIDINGS_API_TOKEN=your-gladtidings-token
GLADTIDINGS_WEBHOOK_SECRET=your-webhook-secret

# ErcasPay (stored in system_config table)  
ERCASPAY_PUBLIC_KEY=your-ercaspay-public-key
ERCASPAY_SECRET_KEY=your-ercaspay-secret-key
```

## Maintenance

### Update Data Plans
```sql
-- Disable a plan
UPDATE data_plans SET is_available = false WHERE gladtidings_plan_id = '167';

-- Update pricing
UPDATE data_plans SET 
    gladtidings_amount = 1400.00,
    customer_amount = 1450.00 
WHERE gladtidings_plan_id = '167';
```

### Monitor Performance
```sql
-- Check transaction success rates
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY status;
```