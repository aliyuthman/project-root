# Backend Setup Guide - GladTidings Data Platform

This guide will help you set up the backend with Drizzle ORM and seed your Supabase database with GladTidings data.

## Prerequisites

- Node.js 18+ installed
- A Supabase project set up
- GladTidings API account (optional for initial setup)
- ErcasPay account (optional for initial setup)

## Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your Supabase credentials
nano .env
```

**Required Environment Variables:**
```env
# Essential for database connection
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Get these from your Supabase dashboard
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Optional: Add when you have API keys
GLADTIDINGS_API_KEY=your-gladtidings-api-key
ERCASPAY_SANDBOX_PUBLIC_KEY=test_pk_your-sandbox-public-key
ERCASPAY_SANDBOX_SECRET_KEY=test_sk_your-sandbox-secret-key
```

### 3. Database Setup & Migration
```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed database with GladTidings data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Your backend will be running at `http://localhost:3001`

## Database Commands

```bash
# Generate new migrations (after schema changes)
npm run db:generate

# Apply migrations to database  
npm run db:migrate

# Seed database with GladTidings plans
npm run db:seed

# Open Drizzle Studio (database browser)
npm run db:studio
```

## What Gets Seeded

The seeding process creates:

### 1. Data Provider
- **GladTidings**: Primary data aggregator with API configuration

### 2. Data Plans (24 total)
- **MTN**: 8 plans (500MB to 10GB)
- **GLO**: 4 plans (750MB to 10GB)  
- **Airtel**: 7 plans (150MB to 10GB)
- **9mobile**: 5 plans (250MB to 15GB)

### 3. Provider Plan Mappings  
- Links each normalized plan to GladTidings plan ID
- Stores original pricing data for reference
- Maintains GladTidings-specific metadata

## Database Schema Overview

### Core Tables

1. **data_providers**: Aggregator configurations (GladTidings, VTpass, etc.)
2. **data_plans**: Normalized plan data across all providers  
3. **provider_plan_mappings**: Links plans to specific providers
4. **transactions**: Customer purchase records
5. **payments**: Payment processing records
6. **webhooks**: Webhook event logs

### Key Features

- **Multi-provider support**: Ready for additional aggregators
- **Flexible pricing**: Separate customer and cost pricing
- **Type safety**: Full TypeScript support with Zod validation
- **Audit logging**: Complete transaction tracking

## API Endpoints Preview

Once seeded, your API will support:

```typescript
// Get available plans by network
GET /api/plans?network=mtn

// Create transaction  
POST /api/transactions
{
  "phone_number": "08012345678",
  "network": "mtn", 
  "plan_id": "uuid-here"
}

// Get transaction status
GET /api/transactions/:id
```

## Next Steps

1. **Test the seeded data**:
   ```bash
   npm run db:studio
   ```
   Browse your seeded data in Drizzle Studio

2. **Set up API keys**:
   - Get GladTidings API credentials
   - Add ErcasPay payment gateway keys
   - Update your `.env` file

3. **Start building API routes**:
   - Create Express routes in `src/routes/`
   - Use the seeded data for your endpoints

4. **Test integration**:
   - Test data plan fetching
   - Test transaction creation
   - Test payment processing

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check Supabase project status
- Ensure database is not paused

### Migration Errors  
```bash
# Reset and re-run migrations
npm run db:generate
npm run db:migrate
```

### Seeding Issues
- Check your database connection
- Verify schema is migrated
- Review console output for specific errors

### Environment Variables
- Ensure `.env` file exists in backend directory
- Verify all required variables are set
- Check for typos in variable names

## Production Deployment

1. Update environment variables for production
2. Run migrations on production database
3. Run seeding script on production (one time only)
4. Deploy backend to your hosting platform

---

🎉 **Your GladTidings data platform backend is now ready!**

Check the seeded data in Drizzle Studio and start building your API endpoints.