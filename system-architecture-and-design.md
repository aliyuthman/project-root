# Data Purchase MVP - System Architecture & Design

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "User Interface"
        UI[Next.js 15+ Frontend<br/>React + TypeScript + Tailwind]
    end
    
    subgraph "Backend Services"
        API[Express.js API Server<br/>Node.js + TypeScript]
        WH[Webhook Handler<br/>Payment & Data Status]
    end
    
    subgraph "Database Layer"
        DB[(Supabase PostgreSQL<br/>Drizzle ORM)]
    end
    
    subgraph "External APIs"
        EP[ErcasPay<br/>Payment Gateway]
        GT[GladTidingsData<br/>Data Aggregator]
    end
    
    subgraph "Infrastructure"
        CDN[CDN/Static Assets]
        MON[Monitoring<br/>Logs & Analytics]
    end
    
    UI --> API
    API --> DB
    API --> EP
    API --> GT
    EP -.-> WH
    GT -.-> WH
    WH --> DB
    UI --> CDN
    API --> MON
    
    style UI fill:#e1f5fe
    style API fill:#f3e5f5
    style DB fill:#e8f5e8
    style EP fill:#fff3e0
    style GT fill:#fff3e0
```

## 2. Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend (Next.js 15+)"
        LP[Landing Page]
        NW[Network Selection]
        DP[Data Plans]
        PI[Phone Input]
        OS[Order Summary]
        PY[Payment Page]
        CS[Confirmation]
        
        LP --> NW --> DP --> PI --> OS --> PY --> CS
    end
    
    subgraph "API Layer (Express.js)"
        RT[Router]
        MW[Middleware]
        CT[Controllers]
        SV[Services]
        UT[Utils]
        
        RT --> MW --> CT --> SV
        CT --> UT
    end
    
    subgraph "Database (Supabase + Drizzle)"
        SC[Schema]
        QU[Queries]
        MG[Migrations]
        
        SC --> QU
        SC --> MG
    end
    
    Frontend --> API
    API --> Database
```

## 3. Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant DB as Database
    participant EP as ErcasPay
    participant GT as GladTidingsData
    
    U->>FE: Select Network & Plan
    FE->>API: GET /api/data-plans/{network}
    API->>GT: Fetch Available Plans
    GT-->>API: Return Plans Data
    API-->>FE: Return Plans
    FE-->>U: Display Plans
    
    U->>FE: Enter Phone & Confirm
    FE->>API: POST /api/transactions
    API->>DB: Create Transaction Record
    DB-->>API: Transaction ID
    
    API->>EP: Initialize Payment
    EP-->>API: Payment URL
    API-->>FE: Payment Details
    FE-->>U: Redirect to Payment
    
    U->>EP: Complete Payment
    EP->>API: Payment Webhook
    API->>DB: Update Payment Status
    
    API->>GT: Purchase Data Bundle
    GT-->>API: Purchase Confirmation
    API->>DB: Update Transaction Status
    
    GT->>API: Data Delivery Webhook
    API->>DB: Mark as Completed
    API-->>U: SMS/Email Confirmation
```

## 4. Database Schema Design

```mermaid
erDiagram
    TRANSACTIONS {
        uuid id PK
        varchar phone_number
        enum network
        varchar data_plan
        decimal amount
        enum status
        varchar payment_reference
        varchar gladtidings_reference
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid transaction_id FK
        varchar ercaspay_reference
        decimal amount
        enum status
        varchar payment_method
        timestamp created_at
    }
    
    DATA_PLANS {
        uuid id PK
        enum network
        varchar plan_name
        varchar data_amount
        decimal price
        varchar validity
        boolean is_available
        timestamp last_updated
    }
    
    WEBHOOKS {
        uuid id PK
        varchar source
        varchar event_type
        varchar reference_id
        json payload
        enum status
        timestamp created_at
    }
    
    TRANSACTIONS ||--|| PAYMENTS : "has"
    TRANSACTIONS ||--o{ WEBHOOKS : "generates"
    DATA_PLANS ||--o{ TRANSACTIONS : "used_in"
```

## 5. API Endpoint Architecture

```mermaid
graph TD
    subgraph "Public Endpoints"
        A[GET /api/data-plans/:network]
        B[POST /api/transactions]
        C[POST /api/payments/initialize]
        D[GET /api/transactions/:id/status]
    end
    
    subgraph "Webhook Endpoints"
        E[POST /api/webhooks/ercaspay]
        F[POST /api/webhooks/gladtidings]
    end
    
    subgraph "Health & Monitoring"
        G[GET /api/health]
        H[GET /api/status]
    end
    
    subgraph "Middleware Stack"
        I[CORS]
        J[Rate Limiting]
        K[Request Validation]
        L[Authentication]
        M[Error Handling]
        N[Logging]
    end
    
    I --> J --> K --> L --> M --> N
    
    A --> I
    B --> I
    C --> I
    D --> I
    E --> I
    F --> I
```

## 6. Payment Flow Architecture

```mermaid
flowchart TD
    A[User Confirms Order] --> B[Create Transaction]
    B --> C[Initialize ErcasPay Payment]
    C --> D[Redirect to Payment Page]
    D --> E[User Completes Payment]
    
    E --> F{Payment Successful?}
    F -->|Yes| G[Payment Webhook Received]
    F -->|No| H[Payment Failed]
    
    G --> I[Update Payment Status]
    I --> J[Trigger Data Purchase]
    J --> K[Call GladTidingsData API]
    
    K --> L{Data Purchase Success?}
    L -->|Yes| M[Update Transaction Status]
    L -->|No| N[Retry Logic]
    
    M --> O[Wait for Delivery Confirmation]
    O --> P[Data Delivered Successfully]
    
    N --> Q{Max Retries Reached?}
    Q -->|No| K
    Q -->|Yes| R[Initiate Refund]
    
    H --> S[Show Error Message]
    R --> T[Process Refund]
    P --> U[Send Confirmation]
    
    style F fill:#fff2cc
    style L fill:#fff2cc
    style Q fill:#fff2cc
```

## 7. Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[HTTPS/TLS 1.3<br/>SSL Certificate]
        B[API Rate Limiting<br/>DDoS Protection]
        C[Input Validation<br/>SQL Injection Prevention]
        D[Webhook Signature<br/>Verification]
        E[Environment Variables<br/>Secret Management]
        F[CORS Policy<br/>Origin Validation]
    end
    
    subgraph "Data Protection"
        G[PCI DSS Compliance<br/>via ErcasPay]
        H[No Card Data Storage<br/>Tokenization]
        I[Audit Logging<br/>Transaction Trail]
        J[Data Encryption<br/>at Rest & Transit]
    end
    
    subgraph "Access Control"
        K[API Key Authentication<br/>External Services]
        L[Request Signing<br/>Webhook Verification]
        M[IP Whitelisting<br/>Admin Access]
    end
    
    A --> B --> C --> D --> E --> F
    G --> H --> I --> J
    K --> L --> M
```

## 8. Monitoring & Observability

```mermaid
graph LR
    subgraph "Application Metrics"
        A[API Response Times]
        B[Error Rates]
        C[Transaction Success Rate]
        D[Payment Success Rate]
    end
    
    subgraph "Business Metrics"
        E[Daily Transactions]
        F[Revenue Tracking]
        G[Network Performance]
        H[User Conversion Rate]
    end
    
    subgraph "Infrastructure"
        I[Server Health]
        J[Database Performance]
        K[External API Status]
        L[CDN Performance]
    end
    
    subgraph "Alerting"
        M[Payment Failures]
        N[API Downtime]
        O[High Error Rates]
        P[Performance Degradation]
    end
    
    A --> M
    B --> N
    C --> O
    I --> P
```

## 9. Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        A[Vercel/Netlify<br/>Frontend Hosting]
        B[Railway/Render<br/>Backend API]
        C[Supabase<br/>Database Hosting]
    end
    
    subgraph "Development Environment"
        D[Local Development<br/>Next.js Dev Server]
        E[Local API<br/>Express.js]
        F[Local Database<br/>PostgreSQL]
    end
    
    subgraph "CI/CD Pipeline"
        G[GitHub Repository]
        H[Automated Testing]
        I[Build Process]
        J[Deployment]
    end
    
    subgraph "External Services"
        K[ErcasPay Sandbox/Live]
        L[GladTidingsData API]
        M[SMS/Email Services]
    end
    
    G --> H --> I --> J
    J --> A
    J --> B
    B --> C
    
    A --> K
    B --> K
    B --> L
    B --> M
```

## 10. Error Handling & Recovery

```mermaid
flowchart TD
    A[API Request] --> B{Request Valid?}
    B -->|No| C[Return 400 Error]
    B -->|Yes| D[Process Request]
    
    D --> E{External API Call}
    E -->|Success| F[Return Success]
    E -->|Timeout| G[Retry Logic]
    E -->|Error| H{Error Type?}
    
    G --> I{Max Retries?}
    I -->|No| E
    I -->|Yes| J[Return 503 Error]
    
    H -->|Network| K[Retry with Backoff]
    H -->|Auth| L[Return 401 Error]
    H -->|Server| M[Return 500 Error]
    
    K --> I
    
    C --> N[Log Error]
    J --> N
    L --> N
    M --> N
    
    N --> O[Send Alert]
    O --> P[Update Metrics]
    
    style B fill:#fff2cc
    style E fill:#fff2cc
    style H fill:#fff2cc
    style I fill:#fff2cc
```

---

**Architecture Version**: 1.0  
**Last Updated**: September 6, 2025  
**Tech Stack**: Next.js 15+, Express.js, Supabase, Drizzle ORM, ErcasPay, GladTidingsData