# Data Purchase MVP Platform

A Nigerian telecom data bundle purchasing platform with automated payment processing and data delivery.

## 🏗️ Project Structure

```
├── frontend/          # Next.js 15+ frontend application
├── backend/           # Express.js API server
├── supabase/         # Database migrations and configuration
├── *.md              # Project documentation and guides
└── *.sql             # Database schemas and seed data
```

## 🚀 Features

### Core Functionality
- ✅ **Multi-Network Support**: MTN, Airtel, Glo, 9mobile
- ✅ **Automated Payment Processing**: ErcasPay integration
- ✅ **Instant Data Delivery**: GladTidings API integration
- ✅ **Real-time Status Tracking**: Complete transaction lifecycle
- ✅ **Mobile-Responsive Design**: Optimized for Nigerian mobile users

### Technical Features
- ✅ **Multi-Aggregator Architecture**: Support for multiple data providers
- ✅ **Webhook Processing**: Automated payment-to-data workflow
- ✅ **Error Handling & Retry Logic**: Robust failure recovery
- ✅ **Transaction Audit Trail**: Complete logging and monitoring
- ✅ **Security Hardening**: Input validation, CORS, rate limiting

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Deployment**: Render

### External Services
- **Payments**: ErcasPay (CBN Licensed)
- **Data Provider**: GladTidings Data
- **Database Hosting**: Supabase
- **Monitoring**: Built-in health checks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase recommended)
- ErcasPay merchant account
- GladTidings API credentials

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd data-purchase-mvp

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Configure Environment
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend configuration
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your settings
```

### 3. Database Setup
```bash
cd backend

# Generate database schema
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with data plans
npm run db:seed
```

### 4. Development
```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)  
npm run dev
```

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Connect Render to your repository
3. Set root directory to `backend`
4. Configure environment variables
5. Deploy

See `backend/RENDER_DEPLOYMENT.md` for detailed instructions.

### Frontend (Vercel)
1. Connect Vercel to your repository
2. Set root directory to `frontend`
3. Configure environment variables
4. Deploy

## 📊 API Endpoints

### Core Endpoints
```
GET  /api/health                          # Health check
GET  /api/data-plans/:network             # Get available plans
POST /api/transactions                    # Create transaction
POST /api/payments/initialize             # Initialize payment
GET  /api/transactions/:id/status         # Check status
POST /api/transactions/:id/retry-data-purchase  # Retry failed purchase
```

### Webhook Endpoints
```
POST /api/webhooks/ercaspay              # Payment status updates
POST /api/webhooks/gladtidings           # Data delivery updates
```

## 📋 Database Schema

### Core Tables
- `transactions` - Transaction lifecycle management
- `payments` - Payment processing records
- `data_plans` - Available data plans catalog
- `data_providers` - Multi-aggregator provider config
- `provider_plan_mappings` - Provider-specific plan mappings
- `webhooks` - Webhook audit trail

## 🔐 Security

- **HTTPS/TLS**: All communications encrypted
- **PCI DSS Compliance**: Via ErcasPay (no card data storage)
- **Input Validation**: Comprehensive request sanitization
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Origin validation
- **Webhook Verification**: Signature-based authentication

## 📈 Monitoring

### Health Checks
- API endpoint monitoring
- Database connectivity checks
- External service availability

### Logging
- Structured application logs
- Transaction audit trail
- Error tracking and alerting
- Performance metrics

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Test GladTidings integration
npm run test:gladtidings

# Test payment flow
npm run test:payment-flow
```

### Manual Testing
1. Create transaction via API
2. Initialize payment with test data
3. Simulate webhook delivery
4. Verify data purchase completion

## 📚 Documentation

- `prd.md` - Product Requirements Document
- `system-architecture-and-design.md` - Technical Architecture
- `backend/RENDER_DEPLOYMENT.md` - Backend deployment guide
- `backend/PAYMENT_INTEGRATION_COMPLETE.md` - Payment flow documentation
- `backend/GLADTIDINGS_INTEGRATION.md` - Data provider integration

## 🛠️ Development Workflow

1. **Plan** - Update PRD and architecture docs
2. **Develop** - Implement features with tests
3. **Test** - Validate with test data
4. **Deploy** - Push to staging/production
5. **Monitor** - Track performance and errors

## 🚨 Production Checklist

### Backend Deployment
- [ ] Environment variables configured
- [ ] ErcasPay production keys set
- [ ] Webhook URLs updated
- [ ] Database migrated and seeded
- [ ] Health checks passing

### Frontend Deployment
- [ ] Backend API URL configured
- [ ] Payment flow tested
- [ ] Mobile responsiveness verified
- [ ] Error handling tested

### Go-Live
- [ ] End-to-end transaction flow tested
- [ ] Payment processing verified
- [ ] Data delivery confirmed
- [ ] Monitoring and alerts active

## 📞 Support

For deployment issues or questions:
1. Check the relevant documentation files
2. Review application logs
3. Test individual API endpoints
4. Verify external service connectivity

---

**Built for Nigerian mobile users with love** 🇳🇬

*Ready for production deployment with comprehensive payment-to-data automation*