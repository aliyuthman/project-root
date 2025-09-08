# Data Purchase MVP - Product Requirements Document (PRD)

## 1. Executive Summary

### 1.1 Product Overview
A minimal viable product (MVP) for a data purchase platform that allows users to buy data bundles for Nigerian telecom networks through a simple web interface, with payments processed via ErcasPay and data delivered through GladTidingsData's aggregator API.

### 1.2 Objectives
- **Primary Goal**: Validate the business concept by enabling end-to-end data purchases
- **Success Metrics**: Complete 10+ successful transactions within first month
- **Timeline**: 3-4 weeks development, 1 week testing

### 1.3 Target Users
- Nigerian mobile phone users who need data bundles
- Tech-savvy individuals comfortable with online payments
- Users of MTN, Airtel, Glo, and 9mobile networks

## 2. Problem Statement

### 2.1 User Problems
- Traditional data purchase requires USSD codes or physical recharge cards
- Limited payment options for data top-ups
- No centralized platform for purchasing data across all networks

### 2.2 Business Opportunity
- Growing demand for convenient digital payment solutions in Nigeria
- Opportunity to earn commission on data sales through aggregator APIs
- Market validation for potential full-scale fintech platform

## 3. Product Scope

### 3.1 In Scope (MVP)
✅ **Core Features**
- Data plan selection for 4 major networks
- Single transaction flow (buy for one number)
- Payment processing via ErcasPay
- Data delivery via GladTidingsData
- Transaction status tracking
- Basic error handling

✅ **Technical Requirements**
- Responsive web application
- Real-time payment processing
- Database transaction logging
- API integrations with payment and data providers

### 3.2 Out of Scope (Future Versions)
❌ **Excluded from MVP**
- User accounts and authentication
- Transaction history dashboard
- Bulk purchases
- Recurring/scheduled purchases
- Mobile app (web-only for MVP)
- Customer support chat
- Referral system
- Advanced analytics

## 4. Functional Requirements

### 4.1 Core User Journey
```
1. User visits landing page
2. Selects telecom network (MTN/Airtel/Glo/9mobile)
3. Chooses data plan from available options
4. Enters recipient phone number
5. Reviews order summary
6. Proceeds to payment (ErcasPay)
7. Completes payment
8. System purchases data via GladTidingsData
9. User receives confirmation
10. Data is delivered to phone number
```

### 4.2 Feature Specifications

#### 4.2.1 Network & Plan Selection
**Requirements:**
- Display 4 network options with logos/branding
- Fetch real-time data plans from GladTidingsData API
- Show plan details: data amount, validity period, price
- Handle API failures gracefully (show cached plans or error message)

**Acceptance Criteria:**
- User can select any of the 4 networks
- Plans load within 3 seconds
- Prices display in Nigerian Naira (₦)
- Out-of-stock plans are clearly marked

#### 4.2.2 Phone Number Input
**Requirements:**
- Accept Nigerian phone numbers (11 digits)
- Support formats: 08012345678, +2348012345678, 2348012345678
- Validate number matches selected network prefix
- Auto-format input for consistency

**Validation Rules:**
- MTN: 0803, 0806, 0813, 0816, 0903, 0906, 0913, 0916
- Airtel: 0701, 0708, 0802, 0808, 0812, 0901, 0902, 0907, 0912
- Glo: 0705, 0805, 0807, 0811, 0815, 0905, 0915
- 9mobile: 0809, 0817, 0818, 0909, 0908

#### 4.2.3 Payment Processing
**Requirements:**
- Integrate ErcasPay payment gateway
- Support card payments (Visa, Mastercard, Verve)
- Support bank transfers
- Handle payment callbacks/webhooks
- Provide clear payment status updates

**Acceptance Criteria:**
- Payment page loads within 2 seconds
- User can complete payment without leaving the platform
- Failed payments show clear error messages
- Successful payments trigger immediate data purchase

#### 4.2.4 Data Purchase & Delivery
**Requirements:**
- Automatically purchase data from GladTidingsData after successful payment
- Handle API responses and status updates
- Provide delivery confirmation
- Implement retry logic for failed purchases

**Acceptance Criteria:**
- Data purchase triggers within 30 seconds of payment
- User receives SMS confirmation of data delivery
- Failed purchases are refunded automatically
- Transaction status updates in real-time

## 5. Technical Requirements

### 5.1 Architecture
```
Frontend: Next.js 15+ (App Router, TypeScript, Tailwind CSS)
Backend: Express.js + Node.js
Database: Supabase PostgreSQL
ORM: Drizzle ORM
Payment: ErcasPay API
Data Provider: GladTidingsData API
```

### 5.2 Database Schema
```sql
-- Transactions table
transactions (
  id: UUID PRIMARY KEY,
  phone_number: VARCHAR(15) NOT NULL,
  network: ENUM('mtn', 'airtel', 'glo', '9mobile'),
  data_plan: VARCHAR(100) NOT NULL,
  amount: DECIMAL(10,2) NOT NULL,
  status: ENUM('pending', 'paid', 'processing', 'completed', 'failed', 'refunded'),
  payment_reference: VARCHAR(100),
  gladtidings_reference: VARCHAR(100),
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)

-- Payments table  
payments (
  id: UUID PRIMARY KEY,
  transaction_id: UUID REFERENCES transactions(id),
  ercaspay_reference: VARCHAR(100),
  amount: DECIMAL(10,2) NOT NULL,
  status: ENUM('pending', 'successful', 'failed'),
  payment_method: VARCHAR(50),
  created_at: TIMESTAMP DEFAULT NOW()
)

-- Data plans cache
data_plans (
  id: UUID PRIMARY KEY,
  network: ENUM('mtn', 'airtel', 'glo', '9mobile'),
  plan_name: VARCHAR(100),
  data_amount: VARCHAR(20),
  price: DECIMAL(10,2),
  validity: VARCHAR(50),
  is_available: BOOLEAN DEFAULT true,
  last_updated: TIMESTAMP DEFAULT NOW()
)
```

### 5.3 API Endpoints
```
GET  /api/data-plans/{network}           // Fetch available plans
POST /api/transactions                   // Create new transaction
POST /api/payments/initialize            // Initialize payment
POST /api/webhooks/ercaspay             // Payment status webhooks
POST /api/webhooks/gladtidings          // Data delivery webhooks
GET  /api/transactions/{id}/status      // Check transaction status
```

### 5.4 External API Integration

#### ErcasPay Integration
- **Sandbox URL**: `https://api.merchant.staging.ercaspay.com/api/v1`
- **Required**: API keys, webhook endpoints
- **Payment Methods**: Cards, bank transfers
- **Webhook Events**: payment.successful, payment.failed

#### GladTidingsData Integration
- **Base URL**: To be provided after account setup
- **Required**: API token, reseller account
- **Services**: Data purchase, balance check, transaction status
- **Response Time**: 1-15 minutes for data delivery

## 6. User Experience Requirements

### 6.1 Design Principles
- **Simplicity**: Minimal steps to complete purchase
- **Trust**: Clear pricing, secure payment indicators
- **Speed**: Fast loading, real-time updates
- **Mobile-First**: Responsive design for mobile users

### 6.2 UI/UX Specifications
- Clean, modern interface using Tailwind CSS
- Maximum 3 steps to complete purchase
- Clear progress indicators
- Prominent security badges (SSL, PCI DSS)
- Loading states for all API calls
- Toast notifications for status updates

### 6.3 Error Handling
- Graceful degradation when APIs are unavailable
- Clear error messages in plain English
- Automatic retry for transient failures
- Support contact information for unresolved issues

## 7. Performance Requirements

### 7.1 Speed Requirements
- Page load time: < 3 seconds
- Payment processing: < 30 seconds
- Data delivery: < 15 minutes
- API response time: < 2 seconds

### 7.2 Availability
- System uptime: 99% (MVP target)
- Graceful handling of third-party API downtime
- Basic monitoring and alerting

## 8. Security Requirements

### 8.1 Data Protection
- HTTPS encryption for all communications
- PCI DSS compliance through ErcasPay
- No storage of sensitive payment data
- Input validation and sanitization

### 8.2 Transaction Security
- Unique transaction references
- Webhook signature verification
- Rate limiting on API endpoints
- Audit logging for all transactions

## 9. Testing Requirements

### 9.1 Test Coverage
- Unit tests for core business logic
- Integration tests for API endpoints
- End-to-end tests for complete user journey
- Payment gateway testing in sandbox environment

### 9.2 Test Scenarios
- Successful purchase flow
- Payment failures
- API timeouts and errors
- Invalid phone numbers
- Network downtime scenarios

## 10. Launch Requirements

### 10.1 Pre-Launch Checklist
- [ ] Complete integration with ErcasPay sandbox
- [ ] Complete integration with GladTidingsData test environment
- [ ] End-to-end testing with real transactions
- [ ] Performance testing under load
- [ ] Security review and penetration testing
- [ ] Error monitoring setup (Sentry/LogRocket)
- [ ] Analytics implementation (Google Analytics)

### 10.2 Success Metrics (First Month)
- **Primary**: 10+ completed transactions
- **Secondary**: < 5% payment failure rate
- **Secondary**: < 10% data delivery failures
- **User Experience**: Average completion time < 5 minutes

### 10.3 Go-Live Criteria
- All critical user journeys tested and working
- Payment processing functional end-to-end
- Data delivery confirmed working
- Basic monitoring and alerting operational
- Error handling tested and functional

## 11. Future Considerations

### 11.1 Post-MVP Features (V2)
- User accounts and login system
- Transaction history dashboard
- Bulk purchase options
- Mobile app development
- Additional payment methods
- Customer referral program

### 11.2 Scale Considerations
- Database optimization for higher transaction volumes
- CDN implementation for faster loading
- Advanced fraud detection
- Customer support system
- Multi-language support

---

**Document Version**: 1.0  
**Last Updated**: September 6, 2025  
**Next Review**: After MVP launch + 30 days