# Data Purchase MVP Development Prompt

I want you to create a modern, professional data purchase platform for Nigerian telecom networks. Here's my complete vision:

## APPLICATION OVERVIEW
Build a complete data bundle purchasing web application that allows users to buy data for MTN, Airtel, Glo, and 9mobile networks. The app should feel modern, trustworthy, and professional - like a fintech platform users would trust with their money.

## CORE FEATURES
- Network selection (MTN, Airtel, Glo, 9mobile) with proper branding
- Data plan selection with real-time pricing and validity periods
- Phone number input with Nigerian number validation
- Payment processing integration with secure checkout
- Transaction status tracking and confirmation
- Order summary and receipt generation
- Basic error handling and user feedback

## TECHNICAL REQUIREMENTS
- NextJS 15+ with App Router and TypeScript
- Tailwind CSS for modern, responsive design
- Express.js backend API with Node.js
- Supabase PostgreSQL database with Drizzle ORM
- ErcasPay payment gateway integration
- GladTidingsData aggregator API for data purchases
- Proper API error handling and retry logic
- Form validation for all user inputs
- Mobile-first responsive design

## ARCHITECTURE REQUIREMENTS
- **Frontend**: Next.js 15+ (App Router, TypeScript, Tailwind CSS)
- **Backend**: Express.js + Node.js with TypeScript
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Payment**: ErcasPay API integration
- **Data Provider**: GladTidingsData API integration
- Proper separation of concerns and clean code structure

## DATABASE SCHEMA
```sql
transactions (
  id, phone_number, network, data_plan, amount, status, 
  payment_reference, gladtidings_reference, timestamps
)

payments (
  id, transaction_id, ercaspay_reference, amount, 
  status, payment_method, created_at
)

data_plans (
  id, network, plan_name, data_amount, price, 
  validity, is_available, last_updated
)

webhooks (
  id, source, event_type, reference_id, 
  payload, status, created_at
)
```

## PHONE NUMBER VALIDATION
- **MTN**: 0803, 0806, 0813, 0816, 0903, 0906, 0913, 0916
- **Airtel**: 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0907, 0912
- **Glo**: 0705, 0805, 0807, 0811, 0815, 0905, 0915
- **9mobile**: 0809, 0817, 0818, 0909, 0908
- **Support formats**: 08012345678, +2348012345678, 2348012345678

## USER JOURNEY
```
Landing Page → Network Selection → Data Plan Selection → 
Phone Number Input → Order Summary → Payment (ErcasPay) → 
Data Purchase (GladTidingsData) → Delivery Confirmation
```

## API ENDPOINTS
```
GET  /api/data-plans/{network}           // Fetch available plans
POST /api/transactions                   // Create new transaction
POST /api/payments/initialize            // Initialize payment
POST /api/webhooks/ercaspay             // Payment status webhooks
POST /api/webhooks/gladtidings          // Data delivery webhooks
GET  /api/transactions/{id}/status      // Check transaction status
GET  /api/health                        // Health check
```

## DESIGN REQUIREMENTS
- Clean, modern fintech-style interface with trustworthy design
- Nigerian telecom network branding and colors
- Professional payment flow with security indicators
- Intuitive navigation and clear progress indicators
- Visual feedback for all user actions
- Loading states and comprehensive error handling
- Mobile-responsive design optimized for Nigerian users
- Clear pricing display in Nigerian Naira (₦)

## SPECIFIC FUNCTIONALITY
- Network selection with proper logos and validation
- Dynamic data plan fetching from GladTidingsData API
- Phone number validation matching network prefixes
- Secure payment processing via ErcasPay
- Real-time transaction status updates
- Webhook handling for payment and data delivery confirmations
- Comprehensive error handling with user-friendly messages
- Transaction logging and audit trail
- Basic analytics and monitoring setup

## SECURITY REQUIREMENTS
- HTTPS encryption for all communications
- PCI DSS compliance through ErcasPay
- Input validation and sanitization
- Webhook signature verification
- Rate limiting on API endpoints
- No storage of sensitive payment data
- Environment variable management for secrets

## PERFORMANCE REQUIREMENTS
- Page load time: <3 seconds
- API response time: <2 seconds
- Payment processing: <30 seconds
- Data delivery: <15 minutes
- Mobile-optimized for Nigerian internet speeds

## EXTERNAL API INTEGRATIONS

### ErcasPay Integration
- **Sandbox URL**: `https://api.merchant.staging.ercaspay.com/api/v1`
- **Live URL**: `https://api.ercaspay.com/api/v1`
- **Required**: API keys, webhook endpoints
- **Payment Methods**: Cards, bank transfers
- **Webhook Events**: payment.successful, payment.failed
- **Documentation**: https://docs.ercaspay.com/

### GladTidingsData Integration
- **Website**: https://gladtidingsdata.com/
- **Required**: API token, reseller account
- **Services**: Data purchase, balance check, transaction status
- **Response Time**: 1-15 minutes for data delivery
- **Networks**: MTN, Airtel, Glo, 9mobile support

## ENVIRONMENT VARIABLES
```bash
# Payment Gateway
ERCASPAY_SECRET_KEY=your_ercaspay_secret_key
ERCASPAY_PUBLIC_KEY=your_ercaspay_public_key
ERCASPAY_WEBHOOK_SECRET=your_webhook_secret

# Data Provider
GLADTIDINGS_API_TOKEN=your_gladtidings_token
GLADTIDINGS_BASE_URL=https://gladtidingsdata.com/api

# Database
DATABASE_URL=your_supabase_connection_string
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
WEBHOOK_BASE_URL=https://your-domain.com

# Security
JWT_SECRET=your_jwt_secret
WEBHOOK_SECRET=your_webhook_secret
```

## PROJECT STRUCTURE
```
data-purchase-mvp/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── lib/            # Utilities and configurations
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # External API integrations
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Helper functions
│   │   └── types/          # TypeScript types
│   └── package.json
├── database/               # Database schema and migrations
│   ├── schema/            # Drizzle schema definitions
│   ├── migrations/        # Database migration files
│   └── seed/             # Database seeding scripts
├── shared/                # Shared types and utilities
└── docs/                 # Documentation
```

## DEVELOPMENT WORKFLOW
1. **Set up project structure** with monorepo configuration
2. **Initialize database** with Supabase and Drizzle schema
3. **Create API endpoints** with proper error handling
4. **Build frontend components** with responsive design
5. **Integrate payment gateway** with ErcasPay
6. **Connect data provider** with GladTidingsData
7. **Implement webhook handlers** for status updates
8. **Add comprehensive testing** for all user flows
9. **Set up monitoring** and error tracking
10. **Deploy to production** with proper CI/CD

## TESTING REQUIREMENTS
- Unit tests for core business logic
- Integration tests for API endpoints
- End-to-end tests for complete user journey
- Payment gateway testing in sandbox environment
- Data delivery testing with test phone numbers
- Error scenario testing (timeouts, failures, retries)
- Mobile responsiveness testing
- Performance testing under load

## DEPLOYMENT REQUIREMENTS
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or DigitalOcean
- **Database**: Supabase (managed PostgreSQL)
- **Monitoring**: Basic health checks and error tracking
- **CI/CD**: GitHub Actions for automated deployment
- **SSL**: HTTPS certificates for secure communication

---

## DELIVERABLES

Please create this as a complete, production-ready MVP application. Set up the entire project structure with frontend and backend, implement all core features, integrate with ErcasPay and GladTidingsData APIs, and ensure everything works together seamlessly. Focus on creating something that looks professional and that Nigerian users would trust to purchase data bundles.

### When you're done, provide:

1. **Complete project setup instructions**
   - Installation and configuration steps
   - Environment setup guide
   - Database initialization commands

2. **Environment variables configuration**
   - All required environment variables
   - Setup instructions for each service
   - Security best practices

3. **Database setup and migration commands**
   - Schema creation and migration steps
   - Seeding data for testing
   - Database relationship explanations

4. **API integration testing steps**
   - ErcasPay sandbox testing procedures
   - GladTidingsData API testing methods
   - Webhook testing instructions

5. **Deployment instructions for production**
   - Step-by-step production deployment
   - Environment configuration for live services
   - Monitoring and maintenance procedures

6. **Testing procedures for the complete user journey**
   - End-to-end testing scenarios
   - Payment flow testing
   - Data delivery verification
   - Error handling validation

### Success Criteria:
The goal is to validate the business concept with a functional MVP that can:
- Process real payments through ErcasPay
- Purchase data bundles via GladTidingsData
- Deliver data to actual phone numbers
- Handle errors gracefully
- Provide a professional user experience
- Scale for initial user testing

The application should be ready for immediate deployment and real-world testing with actual transactions.