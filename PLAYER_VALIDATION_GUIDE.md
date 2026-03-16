# G2Bulk Player ID Validation Integration

## Overview

The website now integrates with **G2Bulk's Public API** for real-time player ID validation using the `POST /v1/games/checkPlayerId` endpoint.

## How It Works

### 1. Player ID Validation Flow

When a user enters a Game ID and clicks the verification button:

```
User enters Game ID
        ↓
Click "Verify" button
        ↓
G2BulkAPI.checkPlayerId(gameCode, userId, serverId)
        ↓
API returns: { valid: "valid", name: "PlayerName", openid: "..." }
        ↓
Display verified player info
```

### 2. Supported Games

The system automatically maps category names to G2Bulk game codes:

| Category Name | G2Bulk Code | Notes |
|---|---|---|
| PUBG Mobile | `pubgm` | |
| Mobile Legends | `mlbb` | |
| Free Fire | `ff` | |
| Lost Ark | `lostarkonline` | |
| Lineage | `l2` | |
| Ragnarok M | `ragnarokm` | |
| Honkai Star Rail | `honkaistarrail` | |
| Genshin Impact | `genshinimpact` | |
| Diablo Immortal | `diabloimmortal` | |
| Arena of Valor | `aov` | |
| Call of Duty Mobile | `codm` | |

### 3. API Endpoints Used

#### SMM Panel API (for ordering)
- **Base**: `https://api.g2bulk.com/api/v2`
- **Methods**: `services`, `add`, `status`, `balance`
- **Auth**: API key in request body

#### Public Games API (for validation)
- **Base**: `https://api.g2bulk.com/v1`
- **Endpoint**: `POST /v1/games/checkPlayerId`
- **Auth**: No authentication required
- **Body**: `{ game, user_id, server_id? }`

### 4. Player Validation Implementation

**File**: `/js/app.js`

**Method**: `G2BulkAPI.checkPlayerId(gameCode, userId, serverId)`

```javascript
// Example usage
const result = await G2BulkAPI.checkPlayerId('mlbb', '123456789', '2001');

// Success response
{
    valid: true,
    name: 'PlayerName',
    openid: '41581795132966184'
}

// Error response
{
    valid: false,
    error: 'Invalid player ID'
}
```

### 5. Auto-Detection of Game Code

When a product is selected, the system automatically detects the game code from the category name:

```javascript
selectProduct(productId) {
    // ...
    if (product.serviceId && this.state.currentCategory?.name) {
        this.state.g2bulkGameCode = this.getG2BulkGameCode(this.state.currentCategory.name);
    }
    // ...
}

getG2BulkGameCode(categoryName) {
    // Maps category names to game codes
    // Returns the appropriate G2Bulk game code
}
```

### 6. Server ID Handling

For games that require server ID:

```
Game ID input: 123456789
Server ID input: 2001
Link format sent to G2Bulk: "123456789|2001"
Validation uses both: { user_id: "123456789", server_id: "2001" }
```

### 7. Checker Configuration

The system supports two validation methods:

**Method 1: G2Bulk Validation (Recommended)**
- Used when `product.serviceId` is set
- Automatically uses `G2BulkAPI.checkPlayerId()`
- No configuration needed

**Method 2: Custom Checker (Fallback)**
- Used if no `serviceId` is present
- Uses `table.checkerConfig` with custom API endpoints
- Configurable through admin panel

### 8. Verification UI Flow

```
[User enters Game ID]
         ↓
[Click Verify button]
         ↓
[Loading spinner appears]
         ↓
[Validation API call]
         ↓
┌─────────────────────┐
│ Success             │ Failure
├─────────────────────┤
│ Show player name    │ Show error
│ Show status details │ Suggest retry
│ Enable purchase     │ Allow re-enter
└─────────────────────┘
```

## Configuration

### Required Configuration (in `config.js`)

```javascript
G2BULK: {
    API_URL: 'https://api.g2bulk.com/api/v2',
    API_KEY: 'your_api_key_here',
    // ... other settings
}
```

### Optional: Custom Game Code Mapping

To add more games or customize codes, edit the `getG2BulkGameCode()` method:

```javascript
getG2BulkGameCode(categoryName) {
    const gameCodeMap = {
        'your-game': 'g2bulk_code',
        // ... more mappings
    };
    // ...
}
```

## Error Handling

### Validation Errors

| Error | Cause | Solution |
|---|---|---|
| Invalid player ID | ID doesn't exist in game | Check spelling, verify in game |
| Server ID invalid | Wrong server for this game | Select correct server |
| Network error | API unavailable | Retry validation |
| Timeout | API slow response | Wait and retry |

### Display Messages

- **Valid**: Green checkmark + player name displayed
- **Invalid**: Red X + error message shown
- **Error**: Yellow warning + retry option

## Testing

### Test Player IDs

To test the validation, use known player IDs from your games:

```bash
# Example: PUBG Mobile
POST https://api.g2bulk.com/v1/games/checkPlayerId
{
    "game": "pubgm",
    "user_id": "5123456789",
    "server_id": "2001"
}

# Example: Mobile Legends
POST https://api.g2bulk.com/v1/games/checkPlayerId
{
    "game": "mlbb",
    "user_id": "123456789",
    "server_id": "2001"
}
```

## Code Changes Made

### 1. Added G2BulkAPI.checkPlayerId()
- New method for player ID validation
- Uses public API endpoint (no auth required)
- Returns standardized response format

### 2. Updated checkGameId()
- Now detects G2Bulk service products
- Routes to G2BulkAPI.checkPlayerId() for validation
- Transforms response to UI format

### 3. Added getG2BulkGameCode()
- Maps category names to G2Bulk game codes
- Auto-called when product selected
- Enables automatic game detection

### 4. Enhanced selectProduct()
- Sets `g2bulkGameCode` when product selected
- Enables downstream validation to work

## Troubleshooting

### Validation not working?

1. **Check game code mapping**: Ensure category name matches a game in `getG2BulkGameCode()`
2. **Check player ID format**: Some games have specific ID formats
3. **Check server ID**: Make sure server ID is provided for games that require it
4. **Check network**: Ensure API is reachable

### Player name not showing?

- G2Bulk API may not return player name for this game
- System will show "Valid Game ID" instead
- This is normal and validation still succeeds

### Server ID issues?

- Some games don't require server ID (API returns 403)
- System handles this gracefully
- Player ID validation will work with or without server ID

## Related Files

- `/js/app.js` - Main integration code
- `/js/config.js` - API configuration
- `G2BULK_INTEGRATION_GUIDE.md` - Full API documentation
- `G2BULK_USAGE_EXAMPLES.md` - Code examples

## Support

For G2Bulk API issues:
- API Documentation: https://api.g2bulk.com/docs
- Public Games API: https://api.g2bulk.com/docs (Games section)
