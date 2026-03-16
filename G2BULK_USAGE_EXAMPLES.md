# G2Bulk API Usage Examples

## 1. Get All Services

```javascript
// Get all available services from G2Bulk
const allServices = await G2BulkAPI.getAllServices();

console.log(allServices);
// Output:
// [
//   {
//     service: 1,
//     name: "PUBG Mobile - 60 UC",
//     type: "Package",
//     category: "PUBG Mobile",
//     rate: "0.85",
//     min: "1",
//     max: "1",
//     refill: false,
//     cancel: false
//   },
//   ...
// ]
```

## 2. Get Services by Category

```javascript
// Get only PUBG Mobile services
const pubgServices = await G2BulkAPI.getServicesByCategory("PUBG Mobile");

pubgServices.forEach(service => {
    console.log(`${service.name} - $${service.rate}`);
});
// Output:
// PUBG Mobile - 60 UC - $0.85
// PUBG Mobile - 325 UC - $4.25
// PUBG Mobile - 660 UC - $8.50
```

## 3. Get Service Requirements (Client-side)

```javascript
// Determine what fields are needed for a service
const requirements = G2BulkAPI.parseServiceRequirements("PUBG Mobile - 60 UC", "PUBG Mobile");

console.log(requirements);
// Output:
// [
//   {
//     id: "game_id",
//     name: "Game ID",
//     placeholder: "Enter your in-game ID",
//     type: "text",
//     required: true,
//     description: "Your unique player ID"
//   },
//   {
//     id: "server_id",
//     name: "Server ID (Optional)",
//     placeholder: "e.g., 2001",
//     type: "text",
//     required: false,
//     description: "Some games use Server ID|Player ID format"
//   }
// ]

// For Telegram:
const telegramReq = G2BulkAPI.parseServiceRequirements("Telegram Premium", "Telegram");
console.log(telegramReq);
// Output:
// [
//   {
//     id: "telegram_account",
//     name: "Telegram Username",
//     placeholder: "Enter your Telegram username (without @)",
//     type: "text",
//     required: true
//   }
// ]
```

## 4. Build Link (Correct Format)

```javascript
// PUBG Mobile with Game ID and Server ID
const link1 = G2BulkAPI.buildLink("123456789", "2001");
console.log(link1); // Output: "123456789|2001"

// Game without server ID
const link2 = G2BulkAPI.buildLink("987654321", "");
console.log(link2); // Output: "987654321"

// Telegram username
const link3 = G2BulkAPI.buildLink("myusername", "");
console.log(link3); // Output: "myusername"
```

## 5. Place an Order

```javascript
// Place order for PUBG Mobile UC top-up
const serviceId = 1; // PUBG Mobile - 60 UC
const gameId = "123456789";
const serverId = "2001";
const link = G2BulkAPI.buildLink(gameId, serverId);

try {
    const result = await G2BulkAPI.placeOrder(serviceId, link, 1);
    
    if (result.order) {
        console.log(`Order placed! Order ID: ${result.order}`);
        // Save orderId to database for tracking
    } else if (result.error) {
        console.error(`Order failed: ${result.error}`);
        // Handle error: "Insufficient balance", "Service not found", etc.
    }
} catch (error) {
    console.error('API request failed:', error);
}
```

## 6. Check Order Status

```javascript
// Check status of a specific order
const orderId = 12345;

const status = await G2BulkAPI.checkStatus(orderId);
console.log(status);
// Output:
// {
//   charge: "0.850",
//   start_count: "0",
//   status: "Completed",
//   remains: "0",
//   currency: "USD"
// }

// Interpret status:
// - "Pending" = Waiting to process
// - "In progress" = Currently processing
// - "Completed" = Finished successfully
// - "Partial" = Partially completed
// - "Canceled" = Failed or canceled
```

## 7. Check Multiple Orders

```javascript
// Check status of multiple orders at once
const orderIds = [12345, 12346, 12347];

const statuses = await G2BulkAPI.multiStatus(orderIds);
console.log(statuses);
// Output:
// {
//   "12345": {
//     charge: "0.850",
//     status: "Completed"
//   },
//   "12346": {
//     charge: "4.250",
//     status: "In progress"
//   },
//   "12347": {
//     charge: "8.500",
//     status: "Pending"
//   }
// }
```

## 8. Check Balance

```javascript
// Check your G2Bulk reseller balance
const balance = await G2BulkAPI.getBalance();
console.log(balance);
// Output:
// {
//   balance: "150.5000",
//   currency: "USD"
// }

// Check if we have enough balance for an order
const orderCost = 0.85; // Price of service in USD
if (parseFloat(balance.balance) > orderCost) {
    console.log('✅ Sufficient balance to place order');
} else {
    console.log('❌ Insufficient balance');
}
```

## 9. Error Handling

```javascript
try {
    const result = await G2BulkAPI.placeOrder(1, "invalidGameId", 1);
    
    if (result.error) {
        // Handle specific errors
        if (G2BulkAPI.isBalanceError(result.error)) {
            console.log('Insufficient API balance. Queueing order for later.');
            // Queue order to retry when balance is available
        } else if (result.error.includes('Service not found')) {
            console.log('Service ID is invalid or inactive');
        } else if (result.error.includes('Game is currently unavailable')) {
            console.log('This game is temporarily disabled');
        } else {
            console.log(`Order error: ${result.error}`);
        }
    } else if (result.order) {
        console.log(`Order placed: ${result.order}`);
    }
} catch (error) {
    // Network or API connection error
    console.error('API connection failed:', error.message);
    // Retry with exponential backoff
}
```

## 10. Complete Order Flow

```javascript
async function placeGameTopupOrder(productData, userInputs) {
    try {
        // 1. Get latest balance
        const balanceResult = await G2BulkAPI.getBalance();
        if (!balanceResult || !balanceResult.balance) {
            throw new Error('Failed to check balance');
        }
        
        const balance = parseFloat(balanceResult.balance);
        const orderCost = parseFloat(productData.apiRate); // From G2Bulk service rate
        
        if (balance < orderCost) {
            console.log('❌ Insufficient balance. Queueing order.');
            return { success: false, reason: 'insufficient_balance', queued: true };
        }
        
        // 2. Build the link from user inputs
        const link = G2BulkAPI.buildLink(userInputs.gameId, userInputs.serverId);
        
        // 3. Place order with G2Bulk
        const orderResult = await G2BulkAPI.placeOrder(
            productData.g2bulkServiceId,
            link,
            1
        );
        
        if (orderResult.error) {
            console.error('❌ Order placement failed:', orderResult.error);
            
            if (G2BulkAPI.isBalanceError(orderResult.error)) {
                return { success: false, reason: 'api_balance_error', queued: true };
            } else {
                return { success: false, reason: 'order_error', error: orderResult.error };
            }
        }
        
        // 4. Order placed successfully
        console.log(`✅ Order placed: ${orderResult.order}`);
        return {
            success: true,
            apiOrderId: orderResult.order,
            link: link
        };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return { success: false, reason: 'network_error', error: error.message };
    }
}

// Usage:
const product = {
    id: 'prod_1',
    name: 'PUBG Mobile 60 UC',
    price: 500, // in MMK
    g2bulkServiceId: 1,
    apiRate: 0.85 // in USD
};

const userInput = {
    gameId: '123456789',
    serverId: '2001'
};

const result = await placeGameTopupOrder(product, userInput);
console.log(result);
```

## 11. Polling Order Status

```javascript
// Poll order status until it completes or fails
async function pollOrderStatus(orderId, maxAttempts = 60, interval = 5000) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        try {
            const status = await G2BulkAPI.checkStatus(orderId);
            
            console.log(`[${attempts + 1}/${maxAttempts}] Order ${orderId}: ${status.status}`);
            
            if (status.status === 'Completed') {
                console.log('✅ Order completed!');
                return { success: true, status: status };
            } else if (status.status === 'Canceled') {
                console.log('❌ Order was canceled');
                return { success: false, reason: 'canceled' };
            } else if (status.status === 'Partial') {
                console.log('⚠️ Order partially completed');
                return { success: false, reason: 'partial' };
            }
            
            // Still processing, wait and retry
            attempts++;
            if (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, interval));
            }
        } catch (error) {
            console.error('Error checking status:', error);
            attempts++;
        }
    }
    
    console.log('⏱️ Order still processing after max attempts');
    return { success: false, reason: 'timeout' };
}

// Usage:
const result = await pollOrderStatus(12345, 60, 5000); // Check for 5 minutes
if (result.success) {
    console.log('Order completed successfully');
} else {
    console.log(`Order failed: ${result.reason}`);
}
```

## Key Takeaways

1. **Always use the correct link format**: `gameId|serverId` for multi-field games
2. **No account verification**: Users must enter Game IDs manually; validation happens through order placement
3. **Handle balance errors**: Queue orders when API balance is insufficient
4. **Poll status**: Orders don't complete instantly; poll G2Bulk for updates
5. **Error handling**: Check for specific error messages to determine retry strategy
