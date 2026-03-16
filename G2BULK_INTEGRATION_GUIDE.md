# G2Bulk API Integration Guide

## Overview
This document explains how the G2Bulk API integration works in the application based on the actual G2Bulk SMM Panel API.

## G2Bulk API Endpoints

The G2Bulk API provides only 4 main actions:

1. **`services`** - Get list of services (optionally filtered by category)
2. **`add`** - Place a new order
3. **`status`** - Check order status
4. **`balance`** - Check API account balance

**Important**: G2Bulk does NOT provide account verification or game ID validation endpoints.

## API Methods in G2BulkAPI Module

### Get Services by Category
```javascript
const services = await G2BulkAPI.getServicesByCategory("PUBG Mobile");
// Returns array of services: {service, name, type, category, rate, min, max, refill, cancel}
```

### Get All Services
```javascript
const allServices = await G2BulkAPI.getAllServices();
```

### Parse Service Requirements (Client-side)
```javascript
const requirements = G2BulkAPI.parseServiceRequirements(serviceName, category);
// Returns input field requirements based on service name
```

For example:
- **Telegram products**: Only need Telegram username
- **PUBG Mobile**: Need Game ID, optionally Server ID
- **Mobile Legends**: Need Game ID, optionally Server ID

### Build Link for Order
```javascript
const link = G2BulkAPI.buildLink(gameId, serverId);
// For games with server: "12345|2001"
// For games without server: "12345"
```

### Place Order
```javascript
const result = await G2BulkAPI.placeOrder(serviceId, link, quantity);
// quantity is always 1 for game top-ups
// Returns: {order: orderId} or {error: errorMessage}
```

### Check Order Status
```javascript
const status = await G2BulkAPI.checkStatus(orderId);
// Returns: {charge, start_count, status, remains, currency}
// Possible status values: "Pending", "In progress", "Completed", "Partial", "Canceled"
```

### Check Multiple Order Statuses
```javascript
const statuses = await G2BulkAPI.multiStatus([orderId1, orderId2]);
// Returns object with orderId as keys
```

### Check Balance
```javascript
const balance = await G2BulkAPI.getBalance();
// Returns: {balance: "150.5000", currency: "USD"}
```

## Link Format

The `link` parameter in `placeOrder()` must follow G2Bulk format:

| Game Type | Format | Example |
|-----------|--------|---------|
| Single ID | `playerID` | `5123456789` |
| With Server | `playerID\|serverID` | `5123456789\|2001` |
| Telegram | `username` | `myusername` |

## Service Requirements (Client-side)

Since G2Bulk doesn't provide a verification endpoint, requirements are determined client-side:

```javascript
{
  "service": 1,
  "name": "PUBG Mobile - 60 UC",
  "category": "PUBG Mobile",
  "rate": "0.85",
  // Based on this, we determine:
  // - Field 1: Game ID (required)
  // - Field 2: Server ID (optional)
}
```

## Implementation Notes

### 1. Product-to-Service Mapping
Products in your admin panel should be mapped to G2Bulk services:
- Store G2Bulk `service` ID in product's `serviceId` field
- Product name should match G2Bulk service name
- Category should match G2Bulk category

### 2. Input Field Generation
Input fields are configured in your admin panel (not fetched from G2Bulk):
- Admin creates categories and products
- For each product with a G2Bulk serviceId, configure required input fields
- The app renders these input fields when user selects the product

### 3. Order Placement Flow
```
User selects Product
    ↓
User fills input fields (Game ID, Server ID, etc.)
    ↓
User confirms purchase
    ↓
App builds link: gameId|serverId
    ↓
App calls: G2BulkAPI.placeOrder(serviceId, link, 1)
    ↓
Order saved with apiOrderId
    ↓
App polls G2BulkAPI.checkStatus() periodically
    ↓
Update order status when complete
```

### 4. Error Handling
Common errors from G2Bulk API:
- `"Insufficient balance"` - Reseller balance is low
- `"Service not found or inactive"` - Service ID doesn't exist
- `"Game is currently unavailable"` - Service is temporarily disabled
- `"Invalid API key"` - Check configuration

### 5. Balance Management
- Check `G2BulkAPI.getBalance()` before placing orders
- If balance is insufficient, queue the order for later
- Handle failed orders with retry logic

## Configuration

In your `config.js`, ensure:
```javascript
CONFIG.G2BULK = {
    API_URL: 'https://api.g2bulk.com/api/v2',
    API_KEY: 'your_api_key_here',
    BALANCE_ERROR_KEYWORDS: ['insufficient', 'balance', 'low balance']
}
```

## No Account Verification in G2Bulk API

**Important**: G2Bulk does NOT provide endpoints to:
- Verify if a Game ID is valid
- Get account details (nickname, level, country)
- Check account status before purchase

**Solution**: 
- Users must enter their Game IDs manually
- Display information about what Game ID format is expected
- If the order fails, show the error to the user
- Consider implementing game-specific verification APIs separately if needed

## Testing

To test the integration:
1. Get your G2Bulk API key from their Telegram bot
2. Update CONFIG.G2BULK.API_KEY
3. Call `G2BulkAPI.getBalance()` to verify connection
4. Call `G2BulkAPI.getAllServices()` to see available services
5. Test order placement with small quantities
