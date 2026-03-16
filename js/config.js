// ===== Configuration File =====

const CONFIG = {
    // Telegram Bot Configuration
    BOT_TOKEN: '8235749023:AAG95jVQaXjtPqRXU5KZyJyWXEk5sUrIybg',
    BOT_USERNAME: 'mafia_gameshopbot',
    
    // Admin Configuration
    ADMIN_TELEGRAM_ID: '1538232799',
    ADMIN_USERNAME: 'OPPER101',

    // JSONBin.io Configuration (Default/First Account)
    JSONBIN_API_KEY: '$2a$10$qIofQ05vovEVKj99fILB3OtPttEzZylUmfXXKwdomNVuP/LhlYSBS',
    JSONBIN_BASE_URL: 'https://api.jsonbin.io/v3/b',
    
    // Database BIN IDs (Default/First Account)
    BINS: {
        MAIN: '697f241743b1c97be95cfcd2',
        USERS: '697f2418ae596e708f08d3f4',
        PRODUCTS: '69b85e50b7ec241ddc74462b',
        CATEGORIES: '697f2419ae596e708f08d3f6',
        ORDERS: '697f2419d0ea881f4098683a',
        TOPUPS: '697f241aae596e708f08d3fa',
        BANNERS: '697f241aae596e708f08d3fd',
        PAYMENTS: '697f241b43b1c97be95cfcdb',
        INPUT_TABLES: '697f241b43b1c97be95cfcdd',
        IMAGES: '697f241dd0ea881f4098683a',
        BANNED: '697f241c43b1c97be95cfce0'
    },

    // ★★★ MULTI-DB ACCOUNTS ★★★
    // Account အသစ်ထပ်ထည့်ချင်ရင် ဒီ array ထဲ ထပ်ထည့်ပါ
    // Limited ပြည့်တိုင်း အကောင့်သစ်ဖွင့် → bins ဖန်တီး → ဒီမှာထည့်
    JSONBIN_ACCOUNTS: [
        // ---- Account 1 (မူရင်း - ရှိပြီးသား data) ----
        {
            name: 'Database 2',
            apiKey: '$2a$10$RWfTAiUGUEO4lBOCMVEo5.hrI6RfQs71zA7xM3JIIo0a6bKJYZzs2',
            bins: {
                MAIN: '69b86ecbaa77b81da9ee549b',
                USERS: '69b86eccb7ec241ddc747fcc',
                PRODUCTS: '69b86ed1c3097a1dd52f3047',
                CATEGORIES: '69b86ed0c3097a1dd52f3042',
                ORDERS: '69b86ecdaa77b81da9ee54a7',
                TOPUPS: '69b86ecfb7ec241ddc747fd3',
                BANNERS: '69b86ed2c3097a1dd52f304a',
                PAYMENTS: '69b86ed3b7ec241ddc747fe5',
                INPUT_TABLES: '69b86ed4c3097a1dd52f3055',
                IMAGES: '69b86ed6aa77b81da9ee54c9',
                BANNED: '69b86ed5aa77b81da9ee54c3'
            }
        },

        {
            name: 'Database 1 (Original)',
            apiKey: '$2a$10$RWfTAiUGUEO4lBOCMVEo5.hrI6RfQs71zA7xM3JIIo0a6bKJYZzs2',
            bins: {
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
            }
        },
        // ---- Account 2 (အသစ် - ဒီမှာ bins ID အသစ်ထည့်ပါ) ----
        // jsonbin.io အကောင့်သစ်ဖွင့်ပြီး Console code run ပြီးရင်
        // ရလာတဲ့ bins ID တွေ ဒီမှာထည့်ပါ
        /*
        {
            name: 'Database 2 (New)',
            apiKey: 'YOUR_NEW_API_KEY_HERE',
            bins: {
                MAIN: 'xxxxxxxx',
                USERS: 'xxxxxxxx',
                PRODUCTS: 'xxxxxxxx',
                CATEGORIES: 'xxxxxxxx',
                ORDERS: 'xxxxxxxx',
                TOPUPS: 'xxxxxxxx',
                BANNERS: 'xxxxxxxx',
                PAYMENTS: 'xxxxxxxx',
                INPUT_TABLES: 'xxxxxxxx',
                IMAGES: 'xxxxxxxx',
                BANNED: 'xxxxxxxx'
            }
        },
        */

        // ---- Account 3 ---- (နောက်ထပ်လိုရင် ထပ်ထည့်)
        // ---- Account 4 ---- (Limited ပြည့်တိုင်း ထပ်ထည့်သွား)
    ],
    
    // G2Bulk Reseller API Configuration
    G2BULK: {
        API_URL: 'https://api.g2bulk.com/api/v2',
        API_KEY: 'd1c8bcd9a37bbb45c62f6845bc0925a1b0545e30e8390300baaa86ac916f8870',
        ORDER_CHECK_INTERVAL: 30000,
        QUEUE_RETRY_INTERVAL: 60000,
        MAX_RETRY_ATTEMPTS: 50,
        SERVICES_CACHE_TTL: 300000,
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
    USERS: { users: [] },
    PRODUCTS: { products: [] },
    CATEGORIES: { categories: [] },
    ORDERS: { orders: [] },
    TOPUPS: { topups: [] },
    BANNERS: { type1: [], type2: [] },
    PAYMENTS: { payments: [] },
    INPUT_TABLES: { inputTables: [] },
    IMAGES: { images: [] },
    BANNED: { bannedUsers: [] }
};
