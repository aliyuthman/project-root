# Claude.md - Data Purchase MVP Project

## Project Overview

This document serves as the central reference for the Data Purchase MVP project - a Nigerian telecom data bundle purchasing platform. This file contains all key information discussed with Claude AI assistant and serves as the project's knowledge base.

## Project Summary

**Product**: Data Purchase MVP Platform  
**Goal**: Validate business concept for telecom data bundle sales in Nigeria  
**Timeline**: 3-4 weeks development + 1 week testing  
**Target Market**: Nigerian mobile users across MTN, Airtel, Glo, and 9mobile networks

## Key Decisions Made

### Technology Stack
- **Frontend**: Next.js 15+ (App Router, TypeScript, Tailwind CSS)
- **Backend**: Express.js + Node.js
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Payment Gateway**: ErcasPay (PCI DSS certified, CBN licensed)
- **Data Aggregator**: GladTidingsData API
- **Hosting**: Vercel/Netlify (Frontend), Railway/Render (Backend)

### Service Providers Selected

#### Payment Gateway: ErcasPay
- **Reason**: CBN PSSP licensed, PCI DSS certified, NDPA compliant
- **Features**: Multi-currency support, 5-minute onboarding, 24/7 support
- **API**: RESTful with sandbox environment
- **Website**: https://ercaspay.com/
- **Documentation**: https://docs.ercaspay.com/

#### Data Aggregator: GladTidingsData
- **Reason**: Established aggregator with API for developers
- **Services**: All 4 major Nigerian networks (MTN, Airtel, Glo, 9mobile)
- **Features**: Automated system, 24/7 support, competitive pricing
- **Website**: https://gladtidingsdata.com/
- **Alternative**: https://gladtidingsapihub.com/

## Business Model

### Revenue Streams
- Commission on data bundle sales through aggregator markup
- Transaction fees (minimal to stay competitive)
- Future: Premium features, bulk purchase discounts

### Success Metrics (First Month)
- **Primary**: 10+ completed transactions
- **Secondary**: <5% payment failure rate, <10% data delivery failures
- **UX**: Average completion time <5 minutes

## Core Features (MVP Scope)

### In Scope ✅
- Network selection (MTN, Airtel, Glo, 9mobile)
- Data plan selection with real-time pricing
- Phone number validation (Nigerian numbers only)
- Payment processing via ErcasPay
- Data purchase via GladTidingsData
- Transaction status tracking
- Basic error handling and retries
- Mobile-responsive web interface

### Out of Scope ❌ (Future Versions)
- User accounts and authentication
- Transaction history dashboard
- Bulk purchases
- Recurring purchases
- Mobile app
- Customer support chat
- Referral system
- Advanced analytics

## Technical Architecture

### Database Schema
```sql
-- Core tables
transactions (id, phone_number, network, data_plan, amount, status, payment_reference, gladtidings_reference, timestamps)
payments (id, transaction_id, ercaspay_reference, amount, status, payment_method, created_at)
data_plans (id, network, plan_name, data_amount, price, validity, is_available, last_updated)
webhooks (id, source, event_type, reference_id, payload, status, created_at)
```

### API Endpoints
```
GET  /api/data-plans/{network}     // Fetch available plans
POST /api/transactions             // Create new transaction
POST /api/payments/initialize      // Initialize payment
POST /api/webhooks/ercaspay       // Payment status webhooks
POST /api/webhooks/gladtidings    // Data delivery webhooks
GET  /api/transactions/{id}/status // Check transaction status
GET  /api/health                  // Health check
```

### External Integrations

#### ErcasPay API
- **Sandbox**: `https://api.merchant.staging.ercaspay.com/api/v1`
- **Live**: `https://api.ercaspay.com/api/v1`
- **Auth**: Bearer token
- **Webhooks**: payment.successful, payment.failed

#### GladTidingsData API
- **Base URL**: TBD (after account setup)
- **Auth**: API token
- **Services**: Data purchase, balance check, status updates
- **Response Time**: 1-15 minutes for delivery

## User Journey

```
Landing Page → Network Selection → Data Plan Selection → 
Phone Number Input → Order Summary → Payment (ErcasPay) → 
Data Purchase (GladTidingsData) → Delivery Confirmation
```

## Phone Number Validation Rules

### Network Prefixes
- **MTN**: 0803, 0806, 0813, 0816, 0903, 0906, 0913, 0916
- **Airtel**: 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0907, 0912
- **Glo**: 0705, 0805, 0807, 0811, 0815, 0905, 0915
- **9mobile**: 0809, 0817, 0818, 0909, 0908

### Supported Formats
- 08012345678 (standard)
- +2348012345678 (international)
- 2348012345678 (without +)

## Security Requirements

### Data Protection
- HTTPS/TLS encryption for all communications
- PCI DSS compliance through ErcasPay (no card data storage)
- Input validation and sanitization
- Environment variables for secrets

### Transaction Security
- Unique transaction references
- Webhook signature verification
- Rate limiting on API endpoints
- Audit logging for all transactions
- IP whitelisting for admin access

## Performance Requirements

### Speed Targets
- Page load time: <3 seconds
- API response time: <2 seconds
- Payment processing: <30 seconds
- Data delivery: <15 minutes

### Availability
- System uptime: 99% (MVP target)
- Graceful handling of third-party API downtime
- Automatic retry logic with exponential backoff

## Development Phases

### Phase 1: Core Infrastructure (Week 1)
- Set up Next.js project with TypeScript
- Configure Supabase database and Drizzle ORM
- Create basic API structure with Express.js
- Implement database schema and migrations

### Phase 2: Frontend & Basic Flow (Week 2)
- Build landing page and network selection
- Implement data plan fetching and display
- Create phone number input with validation
- Design order summary and confirmation pages

### Phase 3: Payment Integration (Week 3)
- Integrate ErcasPay payment gateway
- Implement payment flow and webhook handling
- Add transaction status tracking
- Create payment success/failure pages

### Phase 4: Data Integration & Testing (Week 4)
- Integrate GladTidingsData API
- Implement data purchase workflow
- Add comprehensive error handling
- End-to-end testing and bug fixes

### Phase 5: Launch Preparation (Week 5)
- Performance optimization
- Security review
- Monitoring and analytics setup
- Production deployment and go-live

## Risk Mitigation

### Technical Risks
- **API Downtime**: Implement retry logic and graceful degradation
- **Payment Failures**: Automatic refund process and clear error messages
- **Data Delivery Issues**: Retry mechanisms and customer support contact

### Business Risks
- **Low Adoption**: Simple UX and competitive pricing
- **Competition**: Focus on user experience and reliability
- **Regulatory**: Ensure compliance through licensed providers

## Monitoring & Analytics

### Technical Metrics
- API response times and error rates
- Payment success/failure rates
- Data delivery success rates
- System uptime and performance

### Business Metrics
- Daily/monthly transaction volume
- Revenue and commission tracking
- User conversion rates
- Network-specific performance

### Tools
- Error tracking: Sentry or LogRocket
- Analytics: Google Analytics
- Monitoring: Built-in health checks
- Logging: Structured logging with timestamps

## Contact Information

### Service Providers
- **ErcasPay Support**: Check their website for contact details
- **GladTidingsData**: Contact through their platform
- **Supabase Support**: Platform support for database issues

### Next Steps
1. Set up accounts with ErcasPay and GladTidingsData
2. Get API credentials and documentation
3. Set up development environment
4. Begin Phase 1 development

## Project Files Structure

```
/project-root
├── README.md (this file)
├── PRD.md (Product Requirements Document)
├── ARCHITECTURE.md (System Architecture Diagrams)
├── /frontend (Next.js app)
├── /backend (Express.js API)
├── /database (Drizzle schema and migrations)
├── /docs (Additional documentation)
└── /tests (Test files)
```

---

**Document Created**: September 6, 2025  
**Last Updated**: September 6, 2025  
**Version**: 1.0  
**Status**: Planning Phase

## Notes from Claude Discussions

- Aggregator APIs are preferred over direct telecom APIs for MVP due to licensing complexity
- ErcasPay chosen over Flutterwave for competitive features and compliance
- GladTidingsData confirmed as legitimate aggregator with developer APIs
- Focus on validation over feature richness for MVP
- Next.js 15+ with App Router for modern React patterns
- Supabase + Drizzle for type-safe database operations
- Mobile-first design approach for Nigerian market