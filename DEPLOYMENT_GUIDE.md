# 🚀 Complete Deployment Guide - Monorepo

## Repository Structure
```
data-purchase-mvp/
├── frontend/          # Next.js app → Deploy to Vercel
├── backend/           # Express API → Deploy to Render  
├── supabase/         # Database configs
└── documentation/    # All .md files
```

## Step 1: Initialize Git Repository

```bash
# From project root
git init
git add .
git commit -m "🚀 Initial commit: Data Purchase MVP

✅ Complete Features:
- Payment-to-data workflow (ErcasPay + GladTidings)
- Multi-aggregator architecture with 24 data plans
- Frontend Next.js app with mobile-responsive design
- Backend API with webhook processing
- Database schema with Supabase integration
- Comprehensive error handling and retry logic

🔧 Tech Stack:
- Frontend: Next.js 15+ + TypeScript + Tailwind
- Backend: Express.js + TypeScript + Drizzle ORM
- Database: Supabase PostgreSQL
- Payments: ErcasPay (live environment)
- Data: GladTidings API integration

📊 Ready for Production:
- 4 Nigerian networks supported (MTN, Airtel, Glo, 9mobile)
- Automated webhook processing
- Real-time transaction status tracking
- Health monitoring and logging
- Security hardening complete"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/data-purchase-mvp.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Render

### 2.1 Create Render Service
1. Go to [render.com](https://render.com)
2. **New** → **Web Service**  
3. Connect your GitHub repository
4. **Service Configuration:**
   ```
   Name: data-purchase-backend
   Runtime: Node
   Region: Oregon
   Root Directory: backend  ← Important!
   Build Command: npm ci && npm run build
   Start Command: npm start
   ```

### 2.2 Environment Variables on Render
Set these in Render dashboard:

```bash
# Server
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://tozzapp.vercel.app

# Database (your existing Supabase)
DATABASE_URL=postgresql://postgres.nzohutvhsosjpzbqgoyi:ypg9ZXR-zvz.fjy.vjn@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://nzohutvhsosjpzbqgoyi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b2h1dHZoc29zanB6YnFnb3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MTc5NTksImV4cCI6MjA0MTE5Mzk1OX0.wOcx3Jxn4kF6YYPRHyMCnTnE7OYB1Zc5O4HCZIjSR74
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b2h1dHZoc29zanB6YnFnb3lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTYxNzk1OSwiZXhwIjoyMDQxMTkzOTU5fQ.Q5nM1z4xNzg7C4BN6jLcXuiI_FgQwMzq3kDq7oKj0Gw

# ErcasPay Production (get from your dashboard)
ERCASPAY_ENVIRONMENT=live
ERCASPAY_LIVE_BASE_URL=https://api.ercaspay.com/api/v1
ERCASPAY_LIVE_PUBLIC_KEY=your-production-public-key
ERCASPAY_LIVE_SECRET_KEY=your-production-secret-key
ERCASPAY_WEBHOOK_SECRET=your-webhook-secret

# GladTidings
GLADTIDINGS_BASE_URL=https://gladtidingsapihub.com/api/v1
GLADTIDINGS_API_KEY=15b9d00abc71f46bb29f6a407683655b3ced3c5d

# Security
JWT_SECRET=your-super-secure-jwt-secret-for-production
CORS_ORIGINS=https://tozzapp.vercel.app

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
DEBUG_MODE=false
```

### 2.3 After Backend Deploys
Your backend will be at: `https://your-service-name.onrender.com`

**Test it:**
```bash
curl https://your-service-name.onrender.com/api/health
curl https://your-service-name.onrender.com/api/data-plans/mtn
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Deployment
1. Go to [vercel.com](https://vercel.com)
2. **Import Project** from GitHub
3. **Framework Preset**: Next.js
4. **Root Directory**: `frontend`
5. Click **Deploy**

### 3.2 Environment Variables on Vercel
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-service-name.onrender.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## Step 4: Configure Webhooks

### Update ErcasPay Webhook URL
1. Go to ErcasPay merchant dashboard
2. Settings → Webhooks
3. Set URL: `https://your-service-name.onrender.com/api/webhooks/ercaspay`
4. Enable events: `payment.successful`, `payment.failed`

### Update Backend Environment
Add these to Render:
```bash
ERCASPAY_WEBHOOK_URL=https://your-service-name.onrender.com/api/webhooks/ercaspay
GLADTIDINGS_WEBHOOK_URL=https://your-service-name.onrender.com/api/webhooks/gladtidings
```

## Step 5: Final Testing

### 5.1 Test Individual Services
```bash
# Backend health
curl https://your-backend.onrender.com/api/health

# Frontend
visit https://your-frontend.vercel.app

# Data plans
curl https://your-backend.onrender.com/api/data-plans/mtn
```

### 5.2 End-to-End Test
1. **Create Transaction** via frontend or API
2. **Process Payment** through ErcasPay
3. **Verify Data Purchase** completed
4. **Check Transaction Status** updates

## ✅ Deployment Checklist

### Pre-Deployment
- [x] Code pushed to GitHub
- [x] Backend build tested locally
- [x] Frontend build tested locally
- [x] Environment variables prepared
- [x] Database seeded with data plans

### Backend Deployment (Render)
- [ ] Service created with correct root directory
- [ ] All environment variables set
- [ ] Health check endpoint passing
- [ ] API endpoints responding
- [ ] Database connectivity verified

### Frontend Deployment (Vercel)
- [ ] Project imported with correct root directory  
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Pages loading correctly
- [ ] API integration working

### Integration Testing
- [ ] Frontend can communicate with backend
- [ ] CORS configuration working
- [ ] Payment flow functional
- [ ] Webhook URLs updated and tested
- [ ] Transaction status updates working

### Go-Live
- [ ] ErcasPay production keys active
- [ ] GladTidings API responding
- [ ] Complete user journey tested
- [ ] Error monitoring active

## 🚨 Common Issues & Solutions

**Backend Build Fails:**
- Check TypeScript errors in logs
- Verify all dependencies in package.json
- Ensure Node.js version compatibility

**Frontend Can't Connect to Backend:**
- Verify CORS_ORIGINS includes frontend URL
- Check NEXT_PUBLIC_BACKEND_URL is correct
- Confirm backend health endpoint is accessible

**Payment Integration Issues:**
- Verify ErcasPay production keys are correct
- Check webhook URL is accessible from internet
- Monitor webhook delivery in ErcasPay dashboard

**Database Connection Issues:**
- Verify DATABASE_URL is correct
- Check Supabase service status
- Confirm IP restrictions allow Render access

---

## 🎉 You're Ready!

After following these steps, you'll have:

✅ **Backend**: `https://your-backend.onrender.com`
✅ **Frontend**: `https://your-frontend.vercel.app` 
✅ **Database**: Supabase with seeded data
✅ **Payments**: ErcasPay live integration
✅ **Data**: GladTidings automatic processing

Your complete data purchase platform will be live and processing real transactions! 🚀