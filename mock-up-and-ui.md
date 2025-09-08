# API Mockup Strategy & Gluestack UI Integration Guide

## API Keys & Mockup Strategy

### 1. Mock API Services Approach

Instead of using real API keys during development, we'll create mock services that simulate the exact behavior of ErcasPay and GladTidingsData APIs.

#### Mock Service Structure
```
backend/src/
├── services/
│   ├── payment/
│   │   ├── ercaspay.service.ts      # Real implementation
│   │   └── ercaspay.mock.service.ts # Mock implementation
│   ├── data/
│   │   ├── gladtidings.service.ts      # Real implementation
│   │   └── gladtidings.mock.service.ts # Mock implementation
│   └── index.ts                     # Service factory
```

#### Environment-Based Service Selection
```typescript
// services/index.ts
import { ErcasPayService } from './payment/ercaspay.service';
import { ErcasPayMockService } from './payment/ercaspay.mock.service';
import { GladTidingsService } from './data/gladtidings.service';
import { GladTidingsMockService } from './data/gladtidings.mock.service';

const isDevelopment = process.env.NODE_ENV === 'development';
const useMockAPIs = process.env.USE_MOCK_APIS === 'true';

export const paymentService = (isDevelopment || useMockAPIs) 
  ? new ErcasPayMockService() 
  : new ErcasPayService();

export const dataService = (isDevelopment || useMockAPIs)
  ? new GladTidingsMockService()
  : new GladTidingsService();
```

### 2. Mock Implementation Examples

#### ErcasPay Mock Service
```typescript
// services/payment/ercaspay.mock.service.ts
export class ErcasPayMockService implements IPaymentService {
  async initializePayment(data: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'success',
      payment_url: `http://localhost:3000/mock-payment/${data.reference}`,
      reference: data.reference,
      access_code: `mock_access_${Date.now()}`
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful payment 80% of the time
    const isSuccessful = Math.random() > 0.2;
    
    return {
      status: isSuccessful ? 'successful' : 'failed',
      reference,
      amount: 1000,
      currency: 'NGN',
      paid_at: new Date().toISOString()
    };
  }
}
```

#### GladTidingsData Mock Service
```typescript
// services/data/gladtidings.mock.service.ts
export class GladTidingsMockService implements IDataService {
  private mockPlans = {
    mtn: [
      { id: '1', name: '1GB - 30 Days', price: 350, data: '1GB', validity: '30 days' },
      { id: '2', name: '2GB - 30 Days', price: 700, data: '2GB', validity: '30 days' },
      { id: '3', name: '5GB - 30 Days', price: 1500, data: '5GB', validity: '30 days' }
    ],
    airtel: [
      { id: '4', name: '1.5GB - 30 Days', price: 400, data: '1.5GB', validity: '30 days' },
      { id: '5', name: '3GB - 30 Days', price: 800, data: '3GB', validity: '30 days' }
    ]
    // ... other networks
  };

  async getDataPlans(network: string): Promise<DataPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.mockPlans[network] || [];
  }

  async purchaseData(request: DataPurchaseRequest): Promise<DataPurchaseResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful purchase 90% of the time
    const isSuccessful = Math.random() > 0.1;
    
    return {
      status: isSuccessful ? 'successful' : 'failed',
      reference: `mock_data_${Date.now()}`,
      message: isSuccessful ? 'Data purchase successful' : 'Purchase failed',
      phone: request.phone,
      network: request.network,
      plan: request.plan
    };
  }
}
```

### 3. Mock Payment Page

Create a mock payment page that simulates ErcasPay's interface:

```typescript
// frontend/src/app/mock-payment/[reference]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MockPaymentPage({ params }: { params: { reference: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async (success: boolean) => {
    setLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate webhook call to our backend
    await fetch('/api/webhooks/ercaspay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment.successful',
        data: {
          reference: params.reference,
          status: success ? 'successful' : 'failed',
          amount: 1000,
          currency: 'NGN'
        }
      })
    });

    router.push(`/payment-result?status=${success ? 'success' : 'failed'}&ref=${params.reference}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Mock Payment Gateway</h2>
        <p className="mb-6">Reference: {params.reference}</p>
        <p className="mb-6">Amount: ₦1,000</p>
        
        {!loading ? (
          <div className="space-y-4">
            <button
              onClick={() => handlePayment(true)}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              Simulate Successful Payment
            </button>
            <button
              onClick={() => handlePayment(false)}
              className="w-full bg-red-600 text-white py-3 rounded-lg"
            >
              Simulate Failed Payment
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Processing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Environment Configuration

```bash
# .env.example
# Development Settings
NODE_ENV=development
USE_MOCK_APIS=true

# Real API Keys (leave empty during development)
ERCASPAY_SECRET_KEY=
ERCASPAY_PUBLIC_KEY=
GLADTIDINGS_API_TOKEN=

# Mock Settings
MOCK_PAYMENT_SUCCESS_RATE=0.8
MOCK_DATA_SUCCESS_RATE=0.9
MOCK_API_DELAY=1000

# When ready for real APIs, set:
# USE_MOCK_APIS=false
# Add real API keys
```

## Gluestack UI Integration

### 1. Yes, Gluestack UI is Perfect! 

Gluestack UI is excellent for your use case because:
- **Universal Components** - Works with React Native and Next.js
- **Modern Design System** - Professional, clean UI components
- **TypeScript Support** - Full type safety
- **Accessibility** - Built-in accessibility features
- **Customizable** - Easy theming and customization
- **Mobile-First** - Perfect for Nigerian mobile users

### 2. Installation & Setup

```bash
# Frontend setup
cd frontend
npm install @gluestack-ui/themed @gluestack-ui/components
npm install react-native-svg react-native-safe-area-context
```

### 3. Gluestack Configuration

```typescript
// frontend/src/lib/gluestack-config.ts
import { config } from '@gluestack-ui/config';
import { createConfig } from '@gluestack-ui/themed';

const customConfig = {
  ...config,
  tokens: {
    ...config.tokens,
    colors: {
      ...config.tokens.colors,
      // Nigerian fintech colors
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6',
        600: '#2563eb',
        900: '#1e3a8a'
      },
      // Network colors
      mtn: '#ffcc00',
      airtel: '#ff0000', 
      glo: '#00aa4f',
      '9mobile': '#00a651'
    }
  }
};

export const gluestackConfig = createConfig(customConfig);
```

### 4. Provider Setup

```typescript
// frontend/src/app/layout.tsx
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { gluestackConfig } from '@/lib/gluestack-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GluestackUIProvider config={gluestackConfig}>
          {children}
        </GluestackUIProvider>
      </body>
    </html>
  );
}
```

### 5. Example Components with Gluestack

#### Network Selection Component
```typescript
// frontend/src/components/NetworkSelector.tsx
import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Pressable,
  Image 
} from '@gluestack-ui/themed';

const networks = [
  { id: 'mtn', name: 'MTN', color: '$mtn', logo: '/mtn-logo.png' },
  { id: 'airtel', name: 'Airtel', color: '$airtel', logo: '/airtel-logo.png' },
  { id: 'glo', name: 'Glo', color: '$glo', logo: '/glo-logo.png' },
  { id: '9mobile', name: '9mobile', color: '$9mobile', logo: '/9mobile-logo.png' }
];

export function NetworkSelector({ onSelect, selected }: NetworkSelectorProps) {
  return (
    <VStack space="md" p="$4">
      <Text size="xl" fontWeight="bold">Select Network</Text>
      <HStack space="md" flexWrap="wrap">
        {networks.map(network => (
          <Pressable
            key={network.id}
            onPress={() => onSelect(network.id)}
            flex={1}
            minWidth={150}
          >
            <Box
              bg={selected === network.id ? network.color : '$white'}
              borderColor={network.color}
              borderWidth={2}
              borderRadius="$lg"
              p="$4"
              alignItems="center"
            >
              <Image
                source={{ uri: network.logo }}
                width={40}
                height={40}
                alt={network.name}
              />
              <Text 
                color={selected === network.id ? '$white' : network.color}
                fontWeight="bold"
                mt="$2"
              >
                {network.name}
              </Text>
            </Box>
          </Pressable>
        ))}
      </HStack>
    </VStack>
  );
}
```

#### Data Plan Selection
```typescript
// frontend/src/components/DataPlanSelector.tsx
import {
  VStack,
  Box,
  Text,
  Pressable,
  HStack,
  Badge,
  Spinner
} from '@gluestack-ui/themed';

export function DataPlanSelector({ 
  plans, 
  loading, 
  onSelect, 
  selected 
}: DataPlanSelectorProps) {
  if (loading) {
    return (
      <Box p="$4" alignItems="center">
        <Spinner size="large" />
        <Text mt="$2">Loading data plans...</Text>
      </Box>
    );
  }

  return (
    <VStack space="md" p="$4">
      <Text size="xl" fontWeight="bold">Choose Data Plan</Text>
      {plans.map(plan => (
        <Pressable
          key={plan.id}
          onPress={() => onSelect(plan)}
        >
          <Box
            bg={selected?.id === plan.id ? '$primary100' : '$white'}
            borderColor={selected?.id === plan.id ? '$primary500' : '$gray300'}
            borderWidth={1}
            borderRadius="$lg"
            p="$4"
            shadow="$sm"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <VStack flex={1}>
                <Text fontWeight="bold" size="lg">{plan.data}</Text>
                <Text color="$gray600">{plan.validity}</Text>
              </VStack>
              <VStack alignItems="flex-end">
                <Text fontWeight="bold" size="xl" color="$primary600">
                  ₦{plan.price.toLocaleString()}
                </Text>
                {plan.isPopular && (
                  <Badge colorScheme="success" mt="$1">
                    <Text size="xs">Popular</Text>
                  </Badge>
                )}
              </VStack>
            </HStack>
          </Box>
        </Pressable>
      ))}
    </VStack>
  );
}
```

### 6. Updated Tech Stack

```typescript
// Updated technical requirements
TECHNICAL_REQUIREMENTS:
- NextJS 15+ with App Router and TypeScript
- Gluestack UI for modern, accessible components
- Tailwind CSS for additional custom styling
- Express.js backend API with Node.js
- Supabase PostgreSQL database with Drizzle ORM
- Mock API services for development
- Real API integration (ErcasPay + GladTidingsData) for production
```

### 7. Development Workflow

1. **Start with mocks** - Build entire UI with mock data
2. **Perfect the UX** - Focus on user experience without API constraints
3. **Test all flows** - Ensure complete user journey works
4. **Integrate real APIs** - Swap mock services for real ones
5. **Final testing** - Validate with actual API calls

## Benefits of This Approach

### For Development:
- **Fast iteration** - No API rate limits or authentication issues
- **Reliable testing** - Consistent mock responses
- **Offline development** - Work without internet
- **Complete control** - Test all scenarios (success, failure, edge cases)

### For Production:
- **Easy transition** - Simple environment variable change
- **Risk mitigation** - Test everything before real money
- **Professional UI** - Gluestack provides polished components
- **Mobile optimization** - Built for mobile-first Nigerian users

You can build the entire application with mocks, perfect the user experience, then simply flip `USE_MOCK_APIS=false` and add real API keys when ready to go live!