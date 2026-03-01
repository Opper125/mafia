// ===== Configuration File =====
// Replace these values with your actual IDs from JSONBin.io

const CONFIG = {
    // Telegram Bot Configuration
    BOT_TOKEN: '8235749023:AAG95jVQaXjtPqRXU5KZyJyWXEk5sUrIybg',
    BOT_USERNAME: 'mafia_gameshopbot',
    
    // Admin Configuration
    ADMIN_TELEGRAM_ID: '1538232799',
    ADMIN_USERNAME: 'OPPER101',

    // JSONBin.io Configuration
    JSONBIN_API_KEY: '$2a$10$qIofQ05vovEVKj99fILB3OtPttEzZylUmfXXKwdomNVuP/LhlYSBS',
    JSONBIN_BASE_URL: 'https://api.jsonbin.io/v3/b',
    
    // Database BIN IDs (Replace with your actual BIN IDs after creation)
    BINS: {
        MAIN: '697f241743b1c97be95cfcd2',           // Main settings and config
        USERS: '697f2418ae596e708f08d3f4',          // Users data
        PRODUCTS: '697f241843b1c97be95cfcd5',    // Products data
        CATEGORIES: '697f2419ae596e708f08d3f6',// Categories data
        ORDERS: '697f2419d0ea881f40986834',        // Orders data
        TOPUPS: '697f241aae596e708f08d3fa',        // Top-up requests
        BANNERS: '697f241aae596e708f08d3fd',      // Banners data
        PAYMENTS: '697f241b43b1c97be95cfcdb',    // Payment methods
        INPUT_TABLES: '697f241b43b1c97be95cfcdd', // Input tables
        IMAGES: '697f241dd0ea881f4098683a',        // Image storage (base64)
        BANNED: '697f241c43b1c97be95cfce0',        // Banned users
        G2BULK_CONFIG: 'G2BULK_CONFIG_BIN_ID',     // G2Bulk API configuration
        G2BULK_PRODUCTS: 'G2BULK_PRODUCTS_BIN_ID', // G2Bulk products mapping
        GAME_TOPUPS: 'GAME_TOPUPS_BIN_ID'          // In-game topup orders
    },
    
    // G2Bulk API Configuration
    G2BULK: {
        ENABLED: true,                             // Enable G2Bulk integration
        API_KEY: '49d362166965e9d793931148a7aba193e0200fbd42c6b7fb1aff4047b4cc0cc2',           // Your G2Bulk API key
        API_BASE_URL: 'https://api.g2bulk.com',    // G2Bulk API endpoint
        WEBHOOK_SECRET: 'YOUR_WEBHOOK_SECRET',     // Webhook secret for verification
        AUTO_VERIFY: true,                         // Auto-verify topups
        RETRY_ATTEMPTS: 3,                         // Retry failed topups
        RETRY_DELAY: 5000                          // Delay between retries (ms)
    },
    
    // App Settings
    INTRO_DURATION: 5000,        // 5 seconds intro
    BANNER_INTERVAL: 7000,       // 7 seconds banner slide
    ANNOUNCEMENT_SPEED: 15,      // Announcement scroll speed in seconds
    MAX_FAILED_PURCHASE_ATTEMPTS: 5,  // Auto-ban after 5 failed attempts
    
    // Default Settings
    DEFAULT_CURRENCY: 'MMK',
    DEFAULT_THEME: 'dark',
    
    // Version
    VERSION: '1.0.0'
};

// ===== JSONBin Initial Schema =====
// Use these schemas when creating new bins in JSONBin.io

const SCHEMAS = {
    MAIN: {
        websiteName: 'Game Top-Up Shop',
        websiteLogo: '',
        announcement: 'Welcome to our Game Top-Up Shop! Best prices guaranteed!',
        theme: 'dark',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    
    USERS: {
        users: []
        // Each user: {
        //     id: string,
        //     telegramId: string,
        //     username: string,
        //     firstName: string,
        //     lastName: string,
        //     photoUrl: string,
        //     isPremium: boolean,
        //     balance: number,
        //     totalOrders: number,
        //     approvedOrders: number,
        //     rejectedOrders: number,
        //     totalSpent: number,
        //     totalTopups: number,
        //     failedPurchaseAttempts: number,
        //     lastFailedAttempt: string,
        //     joinedAt: string,
        //     lastActive: string
        // }
    },
    
    PRODUCTS: {
        products: []
        // Each product: {
        //     id: string,
        //     categoryId: string,
        //     name: string,
        //     price: number,
        //     currency: string,
        //     discount: number,
        //     discountedPrice: number,
        //     icon: string (base64),
        //     deliveryTime: string,
        //     sold: number,
        //     createdAt: string,
        //     updatedAt: string
        // }
    },
    
    CATEGORIES: {
        categories: []
        // Each category: {
        //     id: string,
        //     name: string,
        //     icon: string (base64),
        //     flag: string,
        //     hasDiscount: boolean,
        //     totalSold: number,
        //     createdAt: string,
        //     updatedAt: string
        // }
    },
    
    ORDERS: {
        orders: []
        // Each order: {
        //     id: string,
        //     oderId: string (display),
        //     userId: string,
        //     telegramId: string,
        //     productId: string,
        //     productName: string,
        //     categoryName: string,
        //     amount: number,
        //     currency: string,
        //     inputValues: object,
        //     status: string (pending/approved/rejected),
        //     createdAt: string,
        //     processedAt: string,
        //     processedBy: string
        // }
    },
    
    TOPUPS: {
        topups: []
        // Each topup: {
        //     id: string,
        //     userId: string,
        //     telegramId: string,
        //     amount: number,
        //     paymentMethod: string,
        //     proofImage: string (base64),
        //     status: string (pending/approved/rejected),
        //     createdAt: string,
        //     processedAt: string,
        //     processedBy: string
        // }
    },
    
    BANNERS: {
        type1: [],  // Homepage banners
        type2: []   // Category banners with descriptions
        // Type1: { id, image (base64), createdAt }
        // Type2: { id, categoryId, image (base64), description, createdAt }
    },
    
    PAYMENTS: {
        payments: []
        // Each payment: {
        //     id: string,
        //     name: string,
        //     address: string,
        //     accountName: string,
        //     note: string,
        //     icon: string (base64),
        //     createdAt: string
        // }
    },
    
    INPUT_TABLES: {
        inputTables: []
        // Each input table: {
        //     id: string,
        //     categoryId: string,
        //     name: string,
        //     placeholder: string,
        //     createdAt: string
        // }
    },
    
    IMAGES: {
        images: []
        // Store base64 images with IDs for reference
    },
    
    BANNED: {
        bannedUsers: []
        // Each banned user: {
        //     id: string,
        //     telegramId: string,
        //     username: string,
        //     reason: string,
        //     bannedAt: string,
        //     bannedBy: string
        // }
    },
    
    G2BULK_CONFIG: {
        apiKey: '49d362166965e9d793931148a7aba193e0200fbd42c6b7fb1aff4047b4cc0cc2',
        webhookSecret: 'YOUR_WEBHOOK_SECRET',
        autoVerify: true,
        retryAttempts: 3,
        retryDelay: 5000,
        lastSyncedAt: new Date().toISOString(),
        apiBalance: 0,
        apiBalanceUpdatedAt: new Date().toISOString(),
        syncLogs: []
        // Each log: { timestamp, action, status, message, details }
    },
    
    G2BULK_PRODUCTS: {
        products: [],
        lastUpdated: new Date().toISOString()
        // Each product: { 
        //     id: string,
        //     categoryId: string, 
        //     gameId: string (from g2bulk),
        //     serviceId: string (from g2bulk),
        //     name: string,
        //     price: number,
        //     g2bulkPrice: number,
        //     margin: number,
        //     enabled: boolean,
        //     deliveryTime: string
        // }
    },
    
    GAME_TOPUPS: {
        topups: [],
        // Each topup: {
        //     id: string,
        //     orderId: string,
        //     userId: string,
        //     telegramId: string,
        //     productId: string,
        //     productName: string,
        //     playerId: string,
        //     playerName: string,
        //     gameId: string,
        //     serviceId: string,
        //     amount: number,
        //     apiCost: number,
        //     apiProfit: number,
        //     currency: string,
        //     g2bulkOrderId: string,
        //     status: string (pending/processing/completed/failed/refunded),
        //     errorMessage: string,
        //     apiResponse: object,
        //     retryCount: number,
        //     lastRetryAt: string,
        //     completedAt: string,
        //     refundedAt: string,
        //     createdAt: string,
        //     updatedAt: string
        // }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, SCHEMAS };
}
