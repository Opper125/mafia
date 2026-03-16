# G2Bulk Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER (Telegram Bot)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Your Website/App                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Admin Panel                                             │   │
│  │ - Create categories                                     │   │
│  │ - Create products                                       │   │
│  │ - Set G2Bulk service IDs                               │   │
│  │ - Configure input fields (Game ID, Server ID, etc.)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Database                                                │   │
│  │ - Categories with G2Bulk categories                    │   │
│  │ - Products linked to G2Bulk service IDs                │   │
│  │ - Input field configurations                           │   │
│  │ - Orders with game IDs and API order IDs               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Frontend (app.js)                                       │   │
│  │ - Display products from database                        │   │
│  │ - Render input fields based on product config          │   │
│  │ - Users enter: Game ID, Server ID, Telegram username   │   │
│  │ - Build link: "gameId|serverId"                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ G2BulkAPI Module (app.js)                               │   │
│  │ - getServicesByCategory()                               │   │
│  │ - placeOrder(serviceId, link, 1)                        │   │
│  │ - checkStatus(orderId)                                  │   │
│  │ - getBalance()                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    G2Bulk API (SMM Panel)                       │
│                  https://api.g2bulk.com/api/v2                 │
│                                                                 │
│  Actions:                                                       │
│  - services (get available services, optionally by category)   │
│  - add (place new order)                                       │
│  - status (check order status)                                 │
│  - balance (check account balance)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Game Servers                                 │
│  - PUBG Mobile servers                                          │
│  - Mobile Legends servers                                       │
│  - Freefire servers                                             │
│  - Other game servers                                           │
│                                                                 │
│  (G2Bulk handles the actual top-up delivery)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Order Placement

```
1. USER ACTION
   User selects product (e.g., "PUBG Mobile 60 UC")
   
2. FRONTEND
   App displays input fields for this product:
   - Game ID (required)
   - Server ID (optional)
   
3. USER FILLS
   User enters:
   - Game ID: 123456789
   - Server ID: 2001
   
4. APP PREPARES
   App builds link: "123456789|2001"
   
5. APP CALLS G2BULK
   G2BulkAPI.placeOrder(1, "123456789|2001", 1)
   
6. G2BULK PROCESSES
   - Validates service ID
   - Checks balance
   - Places order with game servers
   
7. G2BULK RESPONDS
   { order: 12345 }  or  { error: "Insufficient balance" }
   
8. APP STORES
   Database.createOrder({
     serviceId: 1,
     link: "123456789|2001",
     apiOrderId: 12345,
     status: "processing"
   })
   
9. APP POLLS
   Loop: checkStatus(12345) → "Pending" → "In progress" → "Completed"
   
10. USER RECEIVES
    Order completed, user's account credited in PUBG Mobile
```

## Database Schema (Simplified)

### Products Table
```javascript
{
  id: 'prod_1',
  categoryId: 'cat_1',
  name: 'PUBG Mobile - 60 UC',
  price: 500,              // in MMK
  currency: 'MMK',
  
  // G2Bulk Integration
  serviceId: 1,            // G2Bulk service ID
  apiRate: 0.85,          // G2Bulk rate in USD
  
  // Input field configuration
  inputTables: [
    {
      id: 'game_id',
      name: 'Game ID',
      placeholder: 'Enter your in-game ID',
      required: true,
      checkerEnabled: false
    },
    {
      id: 'server_id',
      name: 'Server ID (Optional)',
      placeholder: 'e.g., 2001',
      required: false
    }
  ]
}
```

### Orders Table
```javascript
{
  id: 'order_1',
  userId: 'user_123',
  productId: 'prod_1',
  productName: 'PUBG Mobile - 60 UC',
  
  // User input
  inputValues: {
    'Game ID': '123456789',
    'Server ID': '2001'
  },
  link: '123456789|2001',  // Formatted for G2Bulk
  
  // G2Bulk Integration
  serviceId: 1,
  apiOrderId: 12345,       // G2Bulk order ID
  apiStatus: 'Completed',  // From G2Bulk
  
  // Order tracking
  status: 'completed',
  amount: 500,
  createdAt: '2024-03-17T10:00:00Z',
  completedAt: '2024-03-17T10:05:00Z'
}
```

## Configuration (config.js)

```javascript
CONFIG.G2BULK = {
    API_URL: 'https://api.g2bulk.com/api/v2',
    API_KEY: 'your_api_key_here',  // From G2Bulk Telegram bot
    BALANCE_ERROR_KEYWORDS: [
        'insufficient',
        'balance',
        'low balance'
    ]
};
```

## Error Handling Flow

```
Order Placement Attempt
    ↓
┌─ Check G2Bulk Balance
│  ├─ Sufficient? → Continue
│  └─ Insufficient? → Queue order, retry later
│
├─ Call G2BulkAPI.placeOrder()
│  ├─ Success (order ID returned)
│  │  └─ Save to database with apiOrderId
│  │     └─ Start polling for status
│  │
│  └─ Error
│     ├─ Balance error? → Queue for retry
│     ├─ Service not found? → Show error to user
│     ├─ Game unavailable? → Show temporary closure message
│     └─ Other error? → Show error + retry option
│
└─ After Order Created
   └─ Poll G2BulkAPI.checkStatus()
      ├─ Pending/In progress? → Keep polling
      ├─ Completed? → Mark as complete, notify user
      ├─ Canceled/Partial? → Mark as failed, show error
      └─ API error? → Retry with backoff
```

## Link Format Examples

| Game | Format | Example |
|------|--------|---------|
| PUBG Mobile | `gameId\|serverId` | `123456789\|2001` |
| Mobile Legends | `gameId\|serverId` | `987654321\|2005` |
| Freefire | `gameId\|serverId` | `555666777\|2010` |
| Simple Game | `gameId` | `123456789` |
| Telegram | `username` | `myusername` |

## Status Polling Strategy

```javascript
// Initial poll: Immediate after order placement
// If Pending or In progress:
//   - Poll every 2 seconds for first 10 seconds
//   - Then every 5 seconds
//   - Then every 10 seconds
//   - Give up after 5 minutes
//
// This balances:
// - Quick notification for fast completions
// - Reduced API calls for slow orders
// - Not hammering the API
```

## Balance Management

```javascript
// Before placing order:
1. Check G2Bulk balance: G2BulkAPI.getBalance()
2. Compare with order cost from service rate
3. If insufficient:
   - Save order as "queued"
   - Scheduled job runs periodically to retry queued orders
   - When balance is sufficient, place order

// Benefit:
- Users can place orders even if API balance is temporarily low
- Orders automatically process when balance is available
- No user confusion about API balance vs user balance
```

## Retry Logic for Failed Orders

```javascript
const order = {
  status: 'queued',
  apiOrderId: null,
  apiError: 'Insufficient balance',
  failureCount: 0,
  nextRetryTime: now + 60000  // Retry after 1 minute
};

// Retry scheduler (runs every minute):
// 1. Find all queued orders
// 2. For each order past nextRetryTime:
//    - Check G2Bulk balance
//    - If sufficient, call placeOrder() again
//    - If successful, update apiOrderId and start polling
//    - If failed, update failureCount and nextRetryTime
//    - If failureCount > 10, mark as permanently failed
```

## Security Considerations

1. **API Key Protection**
   - Store G2Bulk API key in backend/config only
   - Never expose to frontend JavaScript
   - Use environment variables in production

2. **Input Validation**
   - Validate Game ID format before sending to G2Bulk
   - Sanitize user input to prevent injection attacks
   - Use parameterized queries for database

3. **Link Format**
   - Build link carefully to avoid injection
   - Use G2BulkAPI.buildLink() helper function
   - Don't trust user-provided formatted link

4. **Balance Verification**
   - Re-check balance just before order placement
   - Prevent race conditions with database locks
   - Handle insufficient balance gracefully

## Testing Checklist

- [ ] Test with real G2Bulk API key
- [ ] Verify balance check works
- [ ] Verify service list retrieval
- [ ] Test order placement with valid Game ID
- [ ] Test order status polling
- [ ] Test error handling (insufficient balance)
- [ ] Test error handling (invalid service)
- [ ] Test error handling (game unavailable)
- [ ] Test multiple orders simultaneously
- [ ] Test order queue and retry logic
- [ ] Verify link format is correct
- [ ] Verify database records save properly
