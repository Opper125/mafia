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
        MAIN: 'YOUR_MAIN_BIN_ID',           // Main settings and config
        USERS: 'YOUR_USERS_BIN_ID',          // Users data
        PRODUCTS: 'YOUR_PRODUCTS_BIN_ID',    // Products data
        CATEGORIES: 'YOUR_CATEGORIES_BIN_ID',// Categories data
        ORDERS: 'YOUR_ORDERS_BIN_ID',        // Orders data
        TOPUPS: 'YOUR_TOPUPS_BIN_ID',        // Top-up requests
        BANNERS: 'YOUR_BANNERS_BIN_ID',      // Banners data
        PAYMENTS: 'YOUR_PAYMENTS_BIN_ID',    // Payment methods
        INPUT_TABLES: 'YOUR_INPUT_TABLES_BIN_ID', // Input tables
        IMAGES: 'YOUR_IMAGES_BIN_ID',        // Image storage (base64)
        BANNED: 'YOUR_BANNED_BIN_ID'         // Banned users
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
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, SCHEMAS };
}
