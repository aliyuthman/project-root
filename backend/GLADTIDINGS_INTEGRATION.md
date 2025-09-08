# GladTidings Data Purchase Integration

## Overview
This document outlines the GladTidings API integration for the Data Purchase MVP platform. The integration enables purchasing data bundles from all major Nigerian networks (MTN, Airtel, Glo, 9mobile) through GladTidings' aggregator service.

## Files Created/Modified

### Service Layer
- **`src/services/gladtidings.ts`** - Main GladTidings service with API client
  - Network mapping (mtn=1, glo=2, airtel=3, 9mobile=6)
  - Phone number formatting for Nigerian numbers
  - Data purchase functionality with proper error handling
  - Request/response logging with phone number masking for security

### Route Updates
- **`src/routes/transactions.ts`** - Enhanced with GladTidings integration
  - Updated transaction creation to use data_plan_id
  - New endpoint: `POST /api/transactions/:id/purchase-data`
  - Proper provider mapping lookup and validation
  - Transaction status tracking (pending → processing → completed/failed)

### Database Seeding
- **`src/db/seed.ts`** - Populated with GladTidings data
  - 24 data plans across 4 networks
  - Provider mappings with GladTidings plan IDs
  - Cost and selling price configuration

### Testing
- **`src/test-gladtidings.ts`** - Integration test script
- All tests pass with proper configuration validation

## API Endpoints

### Data Purchase Flow
1. **Create Transaction**: `POST /api/transactions`
   ```json
   {
     "phone_number": "08012345678",
     "network": "mtn", 
     "data_plan_id": "uuid",
     "amount": 790.00
   }
   ```

2. **Purchase Data**: `POST /api/transactions/:id/purchase-data`
   - Validates transaction status
   - Looks up provider plan mapping
   - Calls GladTidings API
   - Updates transaction with results

3. **Check Status**: `GET /api/transactions/:id/status`
   - Returns current transaction status and details

### Get Available Plans
- **`GET /api/data-plans/:network`** - Returns available plans for network

## Database Schema

The integration uses the multi-aggregator schema with these key tables:
- `data_providers` - GladTidings provider configuration  
- `data_plans` - Normalized data plans
- `provider_plan_mappings` - Maps internal plans to GladTidings plan IDs
- `transactions` - Enhanced with provider references

## Configuration

### Environment Variables
```bash
GLADTIDINGS_BASE_URL=https://www.gladtidingsdata.com
GLADTIDINGS_API_KEY=15b9d00abc71f46bb29f6a407683655b3ced3c5d
```

### Network Mapping
| Network | GladTidings ID |
|---------|----------------|
| MTN     | 1              |
| GLO     | 2              |
| AIRTEL  | 3              |
| 9MOBILE | 6              |

## Data Plans Seeded

### MTN (8 plans)
- 500MB (7 days) - ₦530
- 1GB (7 days) - ₦670  
- 1GB (30 days) - ₦790
- 2GB (7 days) - ₦2450
- 2GB (30 days) - ₦1498
- 3.5GB (30 days) - ₦2457
- 6GB (7 days) - ₦2462
- 10GB (30 days) - ₦4993

### GLO (4 plans)
- 750MB (1 day) - ₦246
- 1.5GB (1 day) - ₦340
- 2.5GB (2 days) - ₦528
- 10GB (7 days) - ₦1938

### AIRTEL (7 plans)
- 150MB (1 day) - ₦105
- 300MB (2 days) - ₦150
- 600MB (2 days) - ₦255
- 3GB (2 days) - ₦1030
- 7GB (7 days) - ₦2060
- 10GB (30 days) - ₦3060
- 10GB (30 days) - ₦4925

### 9MOBILE (5 plans)
- 250MB (14 days) - ₦125
- 500MB (30 days) - ₦170
- 3.5GB (30 days) - ₦890
- 7GB (30 days) - ₦1450
- 15GB (30 days) - ₦3050

## Error Handling

The integration includes comprehensive error handling:
- Network connectivity issues
- Invalid phone numbers
- Plan availability validation
- Provider service downtime
- Transaction state validation
- Proper error logging and user feedback

## Security Features

- Phone number masking in logs
- API key management through environment variables
- Request timeout configuration (30 seconds)
- Retry logic for failed requests
- Proper transaction status tracking

## Next Steps

1. **Payment Integration**: Connect with ErcasPay to handle payments before data purchase
2. **Webhook Handling**: Set up webhooks for real-time status updates
3. **Monitoring**: Add performance metrics and success rate tracking
4. **Testing**: Implement unit tests and integration tests with mock data
5. **Production**: Configure production API credentials and monitoring

## Testing the Integration

Run the test script:
```bash
cd backend
npx ts-node src/test-gladtidings.ts
```

View database data:
```bash
npm run db:studio
```

## API Usage Example

```javascript
// 1. Create transaction
const transaction = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone_number: '08012345678',
    network: 'mtn',
    data_plan_id: 'plan-uuid-here',
    amount: 790.00
  })
});

// 2. After payment confirmation, purchase data
const purchase = await fetch(`/api/transactions/${transaction.id}/purchase-data`, {
  method: 'POST'
});

// 3. Check status
const status = await fetch(`/api/transactions/${transaction.id}/status`);
```

The integration is now complete and ready for testing with proper API credentials.