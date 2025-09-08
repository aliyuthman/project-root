# Render Deployment Guide

## 🚀 Deploying Data Purchase Backend to Render

### Prerequisites
- GitHub repository with your backend code
- Render account (free tier available)
- Production environment variables ready

## Step 1: Prepare for GitHub Push

### Files Ready for Deployment
✅ **render.yaml** - Render service configuration  
✅ **Dockerfile** - Container configuration  
✅ **.dockerignore** - Docker ignore rules  
✅ **.gitignore** - Git ignore rules  
✅ **.env.production** - Production environment template  
✅ **RENDER_DEPLOYMENT.md** - This deployment guide  

### Build Configuration
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/health`
- **Node.js Version**: 18 LTS

## Step 2: Push to GitHub

```bash
# Navigate to backend directory
cd backend

# Add all deployment files
git add .

# Commit deployment configuration
git commit -m "Add Render deployment configuration

- Add render.yaml for service configuration
- Add Dockerfile for containerization
- Add production environment template
- Configure build and start scripts for production"

# Push to your repository
git push origin main
```

## Step 3: Deploy on Render

### 3.1 Create New Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your backend repository

### 3.2 Service Configuration
```
Name: data-purchase-backend
Runtime: Node
Region: Oregon (or closest to your users)
Branch: main
Root Directory: backend (important!)
Build Command: npm ci && npm run build
Start Command: npm start
```

### 3.3 Environment Variables
Set these in Render's Environment Variables section:

**Required Variables:**
```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://tozzapp.vercel.app

# Database (from your .env)
DATABASE_URL=postgresql://postgres.nzohutvhsosjpzbqgoyi:ypg9ZXR-zvz.fjy.vjn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://nzohutvhsosjpzbqgoyi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b2h1dHZoc29zanB6YnFnb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MTc5NTksImV4cCI6MjA0MTE5Mzk1OX0.wOcx3Jxn4kF6YYPRHyMCnTnE7OYB1Zc5O4HCZIjSR74
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b2h1dHZoc29zanB6YnFnb3lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTYxNzk1OSwiZXhwIjoyMDQxMTkzOTU5fQ.Q5nM1z4xNzg7C4BN6jLcXuiI_FgQwMzq3kDq7oKj0Gw

# ErcasPay Production
ERCASPAY_ENVIRONMENT=live
ERCASPAY_LIVE_BASE_URL=https://api.ercaspay.com/api/v1
ERCASPAY_LIVE_PUBLIC_KEY=YOUR_LIVE_PUBLIC_KEY
ERCASPAY_LIVE_SECRET_KEY=YOUR_LIVE_SECRET_KEY
ERCASPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# GladTidings
GLADTIDINGS_BASE_URL=https://gladtidingsapihub.com/api/v1
GLADTIDINGS_API_KEY=15b9d00abc71f46bb29f6a407683655b3ced3c5d
GLADTIDINGS_API_SECRET=your-gladtidings-api-secret

# Security
JWT_SECRET=your-super-secure-jwt-secret-change-in-production
CORS_ORIGINS=https://tozzapp.vercel.app

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
DEBUG_MODE=false
DATABASE_LOGGING=false
```

**⚠️ IMPORTANT**: Replace placeholder values with your actual production keys!

## Step 4: Configure Webhooks

Once deployed, your backend URL will be: `https://your-service-name.onrender.com`

### Update Webhook URLs
Set these environment variables with your actual Render URL:
```bash
ERCASPAY_WEBHOOK_URL=https://your-service-name.onrender.com/api/webhooks/ercaspay
GLADTIDINGS_WEBHOOK_URL=https://your-service-name.onrender.com/api/webhooks/gladtidings
```

### Configure in ErcasPay Dashboard
1. Go to ErcasPay merchant dashboard
2. Navigate to Webhooks settings
3. Set webhook URL: `https://your-service-name.onrender.com/api/webhooks/ercaspay`
4. Enable events: `payment.successful`, `payment.failed`

### Configure CORS for Frontend
Update `CORS_ORIGINS` to include your deployed backend URL:
```bash
CORS_ORIGINS=https://tozzapp.vercel.app,https://your-service-name.onrender.com
```

## Step 5: Health Checks & Monitoring

### Available Endpoints for Testing
```bash
# Health check
GET https://your-service-name.onrender.com/api/health

# Get MTN data plans
GET https://your-service-name.onrender.com/api/data-plans/mtn

# Create transaction (test)
POST https://your-service-name.onrender.com/api/transactions
```

### Monitoring Setup
Render provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Health Checks**: Automatic service monitoring
- **Alerts**: Email notifications for downtime

## Step 6: Post-Deployment Verification

### 6.1 Test API Endpoints
```bash
# Test health endpoint
curl https://your-service-name.onrender.com/api/health

# Test data plans endpoint  
curl https://your-service-name.onrender.com/api/data-plans/mtn
```

### 6.2 Test Database Connectivity
Monitor logs during startup for:
```
✅ Database connection: OK
🌱 Starting database seeding... (if running seed)
🚀 Server running on port 10000
```

### 6.3 Test External API Connections
Check logs for:
```
[GladTidings] Service instantiated successfully
[ErcasPay] Environment: live
```

## Step 7: Frontend Integration

Update your frontend environment variables:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-service-name.onrender.com
```

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check TypeScript compilation errors

**Startup Failures:**
- Verify environment variables are set correctly
- Check database connection string
- Monitor application logs for specific errors

**API Connection Issues:**
- Verify CORS configuration
- Check webhook URLs are accessible
- Test external API connectivity

### Debug Commands
```bash
# View recent logs
render logs --service your-service-name --tail

# Check service status
render services list

# Restart service
render services restart your-service-name
```

## Production Checklist

- [ ] GitHub repository updated with deployment files
- [ ] Render service created and configured
- [ ] All environment variables set correctly
- [ ] ErcasPay production keys configured
- [ ] Webhook URLs updated in payment provider
- [ ] CORS origins configured for frontend
- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] API endpoints responding
- [ ] Frontend integration tested

## Security Notes

- ✅ All sensitive keys stored as environment variables
- ✅ No credentials committed to repository
- ✅ HTTPS enforced for all communications
- ✅ CORS properly configured
- ✅ Rate limiting configured
- ✅ Input validation in place

---

🚀 **Ready for deployment!** Push to GitHub and follow the Render deployment steps above.