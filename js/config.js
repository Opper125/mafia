// ===== Configuration File =====

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
    
    // Database BIN IDs
    BINS: {
        MAIN: '697f241743b1c97be95cfcd2',
        USERS: '697f2418ae596e708f08d3f4',
        PRODUCTS: '697f241843b1c97be95cfcd5',
        CATEGORIES: '697f2419ae596e708f08d3f6',
        ORDERS: '697f2419d0ea881f40986834',
        TOPUPS: '697f241aae596e708f08d3fa',
        BANNERS: '697f241aae596e708f08d3fd',
        PAYMENTS: '697f241b43b1c97be95cfcdb',
        INPUT_TABLES: '697f241b43b1c97be95cfcdd',
        IMAGES: '697f241dd0ea881f4098683a',
        BANNED: '697f241c43b1c97be95cfce0'
    },
    
    // G2Bulk Reseller API Configuration - NEW
    G2BULK: {
        API_URL: 'https://api.g2bulk.com/api/v2',
        API_KEY: 'd1c8bcd9a37bbb45c62f6845bc0925a1b0545e30e8390300baaa86ac916f8870',
        ORDER_CHECK_INTERVAL: 30000,     // 30s - check processing orders
        QUEUE_RETRY_INTERVAL: 60000,     // 60s - retry queued orders  
        MAX_RETRY_ATTEMPTS: 50,          // Max retries for queued orders
        SERVICES_CACHE_TTL: 300000,      // 5min - services cache
        BALANCE_ERROR_KEYWORDS: ['insufficient', 'balance', 'not enough', 'funds', 'low balance'],
    },
    
    // App Settings
    INTRO_DURATION: 5000,
    BANNER_INTERVAL: 7000,
    ANNOUNCEMENT_SPEED: 15,
    MAX_FAILED_PURCHASE_ATTEMPTS: 5,
    
    // Default Settings
    DEFAULT_CURRENCY: 'MMK',
    DEFAULT_THEME: 'dark',
    
    // Version
    VERSION: '2.0.0'
};

// ===== JSONBin Initial Schema =====

const SCHEMAS = {
    MAIN: {
        websiteName: 'Game Top-Up Shop',
        websiteLogo: '',
        announcement: 'Welcome to our Game Top-Up Shop! Best prices guaranteed!',
        theme: 'dark',
        customEmojis: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    
    USERS: {
        users: []
    },
    
    PRODUCTS: {
        products: []
        // Each product now includes:
        // serviceId: number (G2Bulk service ID)
        // g2bulkRate: string (original G2Bulk rate in USD)
        // g2bulkMin: number
        // g2bulkMax: number
        // g2bulkServiceName: string
    },
    
    CATEGORIES: {
        categories: []
    },
    
    ORDERS: {
        orders: []
        // Each order now includes:
        // serviceId: number (G2Bulk service ID)
        // link: string (game ID string sent to API)
        // apiOrderId: number (G2Bulk order ID)
        // apiStatus: string (Pending/Processing/In progress/Completed/Partial/Canceled)
        // apiCharge: string (amount charged by G2Bulk)
        // apiError: string (error message)
        // autoProcessed: boolean
        // retriedCount: number
        // queuedAt: string (ISO date)
        // completedAt: string (ISO date)
        // refundedAt: string (ISO date)
        // refundAmount: number
    },
    
    TOPUPS: {
        topups: []
    },
    
    BANNERS: {
        type1: [],
        type2: []
    },
    
    PAYMENTS: {
        payments: []
    },
    
    INPUT_TABLES: {
        inputTables: []
        // Each input table now includes:
        // checkerEnabled: boolean
        // checkerConfig: {
        //     apiUrl: string,
        //     method: 'GET' | 'POST',
        //     headers: object,
        //     bodyTemplate: string (JSON with {{value}} placeholder),
        //     responseNamePath: string (dot notation path to player name),
        //     responseValidPath: string (dot notation path to valid boolean),
        //     errorMessage: string
        // }
    },
    
    IMAGES: { images: [] },
    
    BANNED: { bannedUsers: [] }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, SCHEMAS };
}
