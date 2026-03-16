# Player ID Validation - Code Examples

## Complete Flow Example

### 1. User Selects PUBG Mobile Product

```javascript
// In App.selectProduct('product-123')
const product = {
    id: 'product-123',
    name: 'PUBG Mobile - 60 UC',
    serviceId: 1,
    icon: 'pubg.png'
};

// Category is "PUBG Mobile"
this.state.currentCategory = { id: 1, name: 'PUBG Mobile' };

// Auto-detect game code
this.state.g2bulkGameCode = this.getG2BulkGameCode('PUBG Mobile');
// Result: 'pubgm'
```

### 2. User Enters Game ID and Clicks Verify

```javascript
// Input values
this.state.inputValues = {
    'Game ID': '5123456789',
    'Server ID': '2001'
};

// User clicks verify button
// checkGameId('game-id-field') is called
```

### 3. Validation Request

```javascript
// In checkGameId()
const result = await G2BulkAPI.checkPlayerId(
    'pubgm',           // game code (from category)
    '5123456789',      // Game ID input
    '2001'             // Server ID input
);

// API Request to G2Bulk
POST https://api.g2bulk.com/v1/games/checkPlayerId
{
    "game": "pubgm",
    "user_id": "5123456789",
    "server_id": "2001"
}
```

### 4. Validation Response - Success

```json
{
    "valid": "valid",
    "name": "PlayerName",
    "openid": "41581795132966184"
}

// Converted to local format:
{
    valid: true,
    nickname: "PlayerName",
    playerName: "PlayerName",
    country: null,
    openid: "41581795132966184"
}

// UI shows:
// ✓ Account Verified
// Nickname: PlayerName
```

### 5. Validation Response - Error

```json
{
    "valid": "invalid",
    "message": "Player not found"
}

// Converted to local format:
{
    valid: false,
    nickname: null,
    error: "Invalid player ID"
}

// UI shows:
// ✗ Account Not Found
// Invalid Game ID. Please check and try again.
```

## Game-Specific Examples

### Mobile Legends (mlbb)

```javascript
// Category: "Mobile Legends"
// Game code auto-detected: "mlbb"

// Validation request
await G2BulkAPI.checkPlayerId('mlbb', '123456789', '2001');

// Example valid ID format: 123456789 (integer)
// Server ID: 2001, 2002, etc. (Southeast Asia)
```

### Free Fire (ff)

```javascript
// Category: "Free Fire"
// Game code auto-detected: "ff"

// Validation request
await G2BulkAPI.checkPlayerId('ff', '5678901234');

// Free Fire uses long integer format
// May not require server ID
```

### Lost Ark (lostarkonline)

```javascript
// Category: "Lost Ark"
// Game code auto-detected: "lostarkonline"

// Validation request
await G2BulkAPI.checkPlayerId('lostarkonline', '1234567890');

// Lost Ark uses character name or ID
```

## API Method Implementation

### G2BulkAPI.checkPlayerId() Code

```javascript
async checkPlayerId(gameCode, userId, serverId = null) {
    try {
        const publicApiUrl = 'https://api.g2bulk.com/v1/games/checkPlayerId';
        
        const payload = {
            game: gameCode,
            user_id: userId
        };
        
        if (serverId && serverId.trim()) {
            payload.server_id = serverId;
        }
        
        console.log('[v0] Validating player ID:', payload);
        
        const response = await fetch(publicApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.valid === 'valid') {
            return {
                valid: true,
                name: result.name,
                openid: result.openid
            };
        } else {
            return {
                valid: false,
                error: 'Invalid player ID'
            };
        }
    } catch (error) {
        console.warn('[v0] Player ID validation error:', error);
        return {
            valid: false,
            error: error.message
        };
    }
}
```

## Game Code Mapping

### Default Mapping

```javascript
const gameCodeMap = {
    'pubg': 'pubgm',
    'pubg mobile': 'pubgm',
    'mobile legends': 'mlbb',
    'ml': 'mlbb',
    'freefire': 'ff',
    'free fire': 'ff',
    'lost ark': 'lostarkonline',
    'lineage': 'l2',
    'ragnarok': 'ragnarokm',
    'honkai': 'honkaistarrail',
    'genshin': 'genshinimpact',
    'diablo': 'diabloimmortal',
    'arena of valor': 'aov',
    'call of duty': 'codm'
};
```

## Full Validation Flow Diagram

```
1. User selects product
   └─> selectProduct('product-id')
       └─> game code detected: getG2BulkGameCode()

2. User enters game ID
   └─> input stored in: inputValues['Game ID']

3. User clicks verify button
   └─> checkGameId('game-id-field')
       └─> Determine validation method
           ├─> If G2Bulk product
           │   └─> checkPlayerId(gameCode, userId, serverId)
           │       └─> API call to G2Bulk
           └─> Else (custom API)
               └─> GameIdChecker.check()

4. API Response received
   └─> Transform to local format
       └─> Update checkerResults state

5. UI Updated
   └─> Display validation result
       ├─> Success: Show player name
       ├─> Error: Show error message
       └─> Network issue: Show retry option

6. User can purchase
   └─> openBuyModal()
       └─> confirmPurchase()
```

## Error Scenarios

### Scenario 1: Invalid Game ID

```javascript
// User enters: "invalid123"
// System calls:
const result = await G2BulkAPI.checkPlayerId('pubgm', 'invalid123', '2001');

// API Response:
{ "valid": "invalid" }

// UI Display:
// ✗ Account Not Found
// Invalid Game ID. Please check and try again.

// User can edit and retry
```

### Scenario 2: Wrong Server ID

```javascript
// User enters: Game ID "123456789", Server ID "9999"
// System calls:
const result = await G2BulkAPI.checkPlayerId('mlbb', '123456789', '9999');

// API Response:
{ "valid": "invalid" }

// UI Display:
// ✗ Account Not Found
// Likely cause: Wrong server ID

// User selects different server and retries
```

### Scenario 3: Network Timeout

```javascript
// System calls:
const result = await G2BulkAPI.checkPlayerId('pubgm', '123456789', '2001');

// Fetch fails with timeout error
// Catch block executes:
return {
    valid: false,
    error: 'Network timeout'
};

// UI Display:
// ⚠ Verification Failed
// Unable to verify account at this time. Please try again later.

// User can click retry button
```

## Testing the Integration

### Manual Test: Mobile Legends

```
1. Open website
2. Select category: "Mobile Legends"
3. Select any product
4. Input Game ID: 123456789
5. Input Server ID: 2001
6. Click "Verify" button
7. Expected: Shows player name or validation result
```

### Manual Test: PUBG Mobile

```
1. Open website
2. Select category: "PUBG Mobile"
3. Select any product
4. Input Game ID: 5123456789
5. Input Server ID: 2001
6. Click "Verify" button
7. Expected: Shows verification result
```

## Configuration for Custom Game

To add a new game to the validation:

### Step 1: Add to Game Code Mapping

```javascript
getG2BulkGameCode(categoryName) {
    const gameCodeMap = {
        // Add this line:
        'my new game': 'g2bulk_game_code'
    };
    // ...
}
```

### Step 2: Ensure Product has serviceId

In product setup, set the `serviceId` to the G2Bulk service ID for that game.

### Step 3: Test Validation

- Select product
- Enter game ID
- Click verify
- Check API response

## Debugging

### Enable Validation Logs

Add to browser console:

```javascript
// Check if game code is detected
console.log(App.state.g2bulkGameCode);

// Test validation directly
const result = await G2BulkAPI.checkPlayerId('pubgm', '123456789', '2001');
console.log(result);

// Check input values
console.log(App.state.inputValues);

// Check selected product
console.log(App.state.selectedProduct);
```

### Common Issues

| Issue | Cause | Solution |
|---|---|---|
| No verify button shown | `checkerEnabled` not set | Enable checker in admin |
| Validation always fails | Wrong game code | Update `getG2BulkGameCode()` |
| Server ID ignored | Not in payload | Check if included in API call |
| No player name shown | G2Bulk doesn't return name | Normal - validation still works |

---

**Related**: See `PLAYER_VALIDATION_GUIDE.md` for architecture overview
