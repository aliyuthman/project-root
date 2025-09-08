# Environment Setup Guide - Data Purchase MVP

## 🚀 Quick Start

1. **Copy environment template**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configure your API keys** in `.env.local` (see sections below)

3. **Validate environment**:
   ```bash
   npm run dev
   ```

## 🔑 Required API Keys & Services

### 1. Supabase Database Setup

**Steps**:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project credentials

**Required Environment Variables**:
```bash
DATABASE_URL="postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. ErcasPay Payment Gateway

**Steps**:
1. Visit [ercaspay.com](https://ercaspay.com)
2. Sign up for merchant account
3. Get sandbox credentials for testing
4. Complete KYC for live credentials

**Required Environment Variables**:
```bash
# Sandbox (Development)
ERCASPAY_SANDBOX_PUBLIC_KEY=test_pk_your-sandbox-public-key
ERCASPAY_SANDBOX_SECRET_KEY=test_sk_your-sandbox-secret-key
ERCASPAY_ENVIRONMENT=sandbox

# Live (Production) - Add after KYC approval
ERCASPAY_LIVE_PUBLIC_KEY=live_pk_your-live-public-key
ERCASPAY_LIVE_SECRET_KEY=live_sk_your-live-secret-key
```

### 3. GladTidingsData API

**Steps**:
1. Visit [gladtidingsdata.com](https://gladtidingsdata.com)
2. Register as reseller/developer
3. Fund your account for testing
4. Get API credentials

**Required Environment Variables**:
```bash
GLADTIDINGS_API_KEY=your-gladtidings-api-key
GLADTIDINGS_API_SECRET=your-gladtidings-api-secret
```

## 📋 Environment Variables Checklist

### ✅ Required (Application won't start without these)
- [ ] `DATABASE_URL`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### ⚠️ Important (Features won't work without these)
- [ ] `ERCASPAY_SANDBOX_PUBLIC_KEY`
- [ ] `ERCASPAY_SANDBOX_SECRET_KEY`
- [ ] `GLADTIDINGS_API_KEY`
- [ ] `GLADTIDINGS_API_SECRET`

### 🎯 Optional (Recommended for production)
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

## 🏗️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
```bash
# Copy and configure environment file
cp .env.example .env.local

# Edit .env.local with your actual API keys
nano .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Verify Setup
Visit `http://localhost:3000` and check:
- [ ] Application loads without errors
- [ ] Network selection works
- [ ] No console errors related to environment variables

## 🧪 Testing API Integrations

### Test ErcasPay Integration
```bash
# Test payment initialization (after setting up API keys)
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "08012345678",
    "network": "mtn",
    "dataPlan": "1GB"
  }'
```

### Test GladTidingsData Integration
```bash
# Test data plans fetching
curl http://localhost:3000/api/data-plans/mtn

# Test balance check
curl http://localhost:3000/api/account/balance
```

## 🔒 Security Configuration

### 1. Generate JWT Secret
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Configure Webhook URLs
For production, update webhook URLs:
```bash
NEXT_PUBLIC_ERCASPAY_WEBHOOK_URL=https://your-domain.com/api/webhooks/ercaspay
GLADTIDINGS_WEBHOOK_URL=https://your-domain.com/api/webhooks/gladtidings
```

### 3. Set CORS Origins
```bash
CORS_ORIGIN=https://your-frontend-domain.com,https://your-admin-domain.com
```

## 🚨 Common Issues & Solutions

### Issue: "Environment variable X is required but not set"
**Solution**: Ensure all required variables are in `.env.local`
```bash
# Check which variables are missing
npm run dev 2>&1 | grep "Environment variable"
```

### Issue: ErcasPay API returns 401 Unauthorized
**Solutions**:
1. Verify API keys are correct
2. Check if using correct environment (sandbox/live)
3. Ensure keys haven't expired

### Issue: GladTidingsData API connection failed
**Solutions**:
1. Check API credentials
2. Verify account has sufficient balance
3. Confirm API endpoints are correct

### Issue: Database connection failed
**Solutions**:
1. Verify Supabase project is active
2. Check database URL format
3. Ensure IP is whitelisted in Supabase dashboard

## 📚 API Documentation Links

- **ErcasPay**: [docs.ercaspay.com](https://docs.ercaspay.com)
- **GladTidingsData**: Contact their support for API docs
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

## 🔄 Environment Migration

### Development → Staging
1. Create new `.env.staging` file
2. Use staging API credentials
3. Update webhook URLs to staging domain

### Staging → Production
1. Create `.env.production` file
2. Switch to live API credentials
3. Update all URLs to production domain
4. Enable production monitoring

## 📞 Support Contacts

- **ErcasPay**: Check their website for support
- **GladTidingsData**: Contact through their platform
- **Supabase**: Platform support dashboard
- **Project Issues**: Create issue in repository

---

**⚡ Pro Tips**:
- Always test with sandbox/test credentials first
- Keep development and production credentials separate
- Never commit actual API keys to version control
- Use environment-specific webhook URLs
- Monitor API rate limits and usage