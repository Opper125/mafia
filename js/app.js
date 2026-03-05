// ===== Main Application - G2Bulk Integrated + Enhanced Game ID Checker =====

// ===== G2Bulk Reseller API (FIXED: Retry + Timeout) =====
const G2BulkAPI = {
    get URL() { return CONFIG.G2BULK.API_URL; },
    get KEY() { return CONFIG.G2BULK.API_KEY; },
    
    async request(action, params = {}, maxRetries = 3) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`📡 G2Bulk API (attempt ${attempt}/${maxRetries}):`, action, params);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);
                
                const response = await fetch(this.URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: this.KEY, action, ...params }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('📡 G2Bulk Response:', result);
                return result;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ G2Bulk API attempt ${attempt}/${maxRetries} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    const delay = attempt * 2000;
                    console.log(`⏳ Retrying in ${delay / 1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }
        
        console.error('❌ G2Bulk API all retries failed:', lastError);
        throw lastError;
    },
    
    async getServices() { return await this.request('services'); },
    async getBalance() { return await this.request('balance'); },
    
    async placeOrder(serviceId, link, quantity = 1) {
        return await this.request('add', { service: serviceId, link, quantity }, 3);
    },
    
    async checkStatus(orderId) {
        return await this.request('status', { order: orderId }, 2);
    },
    
    async multiStatus(orderIds) {
        return await this.request('status', { orders: orderIds.join(',') }, 2);
    },
    
    isBalanceError(error) {
        if (!error) return false;
        const errorStr = String(error).toLowerCase();
        return CONFIG.G2BULK.BALANCE_ERROR_KEYWORDS.some(kw => errorStr.includes(kw));
    }
};
window.G2BulkAPI = G2BulkAPI;

// ===== Order Checker System (Auto Processing) =====
const OrderChecker = {
    checkInterval: null,
    queueInterval: null,
    isChecking: false,
    
    start() {
        console.log('🔄 OrderChecker started');
        this.checkInterval = setInterval(() => this.checkProcessingOrders(), CONFIG.G2BULK.ORDER_CHECK_INTERVAL);
        this.queueInterval = setInterval(() => this.retryQueuedOrders(), CONFIG.G2BULK.QUEUE_RETRY_INTERVAL);
        setTimeout(() => {
            this.checkProcessingOrders();
            this.retryQueuedOrders();
        }, 5000);
    },
    
    stop() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        if (this.queueInterval) clearInterval(this.queueInterval);
    },
    
    async checkProcessingOrders() {
        if (this.isChecking || !App.state.user) return;
        this.isChecking = true;
        
        try {
            const orders = await Database.getOrdersByUser(App.state.user.telegramId);
            const processingOrders = orders.filter(o => 
                o.status === 'processing' && o.apiOrderId
            );
            
            for (const order of processingOrders) {
                await this.checkSingleOrder(order);
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (error) {
            console.error('Check processing orders error:', error);
        } finally {
            this.isChecking = false;
        }
    },
    
    async checkSingleOrder(order) {
        try {
            const result = await G2BulkAPI.checkStatus(order.apiOrderId);
            
            if (!result || result.error) {
                console.warn(`Order ${order.orderId} status check failed:`, result?.error);
                return;
            }
            
            const apiStatus = result.status;
            console.log(`📋 Order ${order.orderId} API status: ${apiStatus}`);
            
            switch (apiStatus) {
                case 'Completed':
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: 'Completed',
                        status: 'completed',
                        apiCharge: result.charge
                    });
                    try { await TelegramBot.notifyOrderCompleted(order); } catch(e) { console.warn('Notify error:', e); }
                    Utils.showToast(`✅ Order #${order.orderId} completed!`, 'success');
                    TelegramApp.hapticFeedback('notification', 'success');
                    await App.refreshUserData();
                    break;
                    
                case 'Canceled':
                case 'Refunded':
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: apiStatus,
                        status: 'failed',
                        apiCharge: '0',
                        apiError: `Order ${apiStatus.toLowerCase()} by provider`
                    });
                    try { await TelegramBot.notifyOrderFailed(order, `Order ${apiStatus.toLowerCase()} by provider`); } catch(e) { console.warn('Notify error:', e); }
                    Utils.showToast(`❌ Order #${order.orderId} ${apiStatus.toLowerCase()}. Balance refunded.`, 'warning');
                    TelegramApp.hapticFeedback('notification', 'error');
                    await App.refreshUserData();
                    break;
                    
                case 'Partial':
                    const remains = parseInt(result.remains) || 0;
                    const charge = parseFloat(result.charge) || 0;
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: 'Partial',
                        status: 'partial',
                        apiCharge: result.charge
                    });
                    try { await TelegramBot.notifyOrderPartial(order); } catch(e) { console.warn('Notify error:', e); }
                    Utils.showToast(`⚠️ Order #${order.orderId} partially completed`, 'warning');
                    break;
                    
                default:
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: apiStatus
                    });
                    break;
            }
        } catch (error) {
            console.error(`Check order ${order.orderId} error:`, error);
        }
    },
    
    async retryQueuedOrders() {
        if (!App.state.user) return;
        
        try {
            const orders = await Database.getQueuedOrders();
            const userQueuedOrders = orders.filter(o => 
                String(o.telegramId) === String(App.state.user.telegramId)
            );
            
            if (userQueuedOrders.length === 0) return;
            
            const balanceResult = await G2BulkAPI.getBalance();
            if (!balanceResult || !balanceResult.balance || parseFloat(balanceResult.balance) <= 0) {
                console.log('⏳ API balance still insufficient for queued orders');
                return;
            }
            
            console.log(`💰 API Balance: ${balanceResult.balance} ${balanceResult.currency}`);
            
            for (const order of userQueuedOrders) {
                if ((order.retriedCount || 0) >= CONFIG.G2BULK.MAX_RETRY_ATTEMPTS) {
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: 'Failed',
                        status: 'failed',
                        apiError: 'Max retry attempts exceeded'
                    });
                    try { await TelegramBot.notifyOrderFailed(order, 'Max retry attempts exceeded'); } catch(e) {}
                    continue;
                }
                
                try {
                    const apiResult = await G2BulkAPI.placeOrder(order.serviceId, order.link, 1);
                    
                    if (apiResult && apiResult.order) {
                        await Database.updateOrderApiStatus(order.id, {
                            apiOrderId: apiResult.order,
                            apiStatus: 'Processing',
                            status: 'processing',
                            apiError: null
                        });
                        Utils.showToast(`🔄 Queued order #${order.orderId} is now processing!`, 'success');
                    } else if (apiResult && apiResult.error) {
                        await Database.incrementOrderRetry(order.id);
                        if (!G2BulkAPI.isBalanceError(apiResult.error)) {
                            await Database.updateOrderApiStatus(order.id, {
                                apiStatus: 'Failed',
                                status: 'failed',
                                apiError: apiResult.error
                            });
                            try { await TelegramBot.notifyOrderFailed(order, apiResult.error); } catch(e) {}
                        }
                    }
                } catch (e) {
                    console.error(`Retry order ${order.orderId} error:`, e);
                    await Database.incrementOrderRetry(order.id);
                }
                
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (error) {
            console.error('Retry queued orders error:', error);
        }
    }
};
window.OrderChecker = OrderChecker;

// ===== Enhanced Game ID Checker (supports RapidAPI JSON Config) =====
const GameIdChecker = {
    debounceTimers: {},
    
    async check(config, value, allInputValues = {}) {
        if (!config) return null;
        
        if (typeof config === 'string') {
            try { config = JSON.parse(config); } 
            catch(e) { 
                console.error('Invalid checker config JSON:', e); 
                return null; 
            }
        }
        
        const url = config.url || config.apiUrl;
        if (!url) return null;
        
        const method = (config.method || 'POST').toUpperCase();
        const headers = config.headers || { 'Content-Type': 'application/json' };
        
        try {
            let fetchUrl = url;
            let options = { method, headers: { ...headers } };
            
            const safeEscape = (val) => {
                return String(val || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
            };
            
            if (method === 'POST') {
                if (config.body) {
                    let bodyStr = JSON.stringify(config.body);
                    bodyStr = bodyStr.replace(/\{\{value\}\}/gi, safeEscape(value));
                    Object.entries(allInputValues).forEach(([name, val]) => {
                        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        bodyStr = bodyStr.replace(
                            new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), 
                            safeEscape(val)
                        );
                    });
                    options.body = bodyStr;
                } else if (config.bodyTemplate) {
                    options.body = config.bodyTemplate.replace(/\{\{value\}\}/gi, safeEscape(value));
                }
            } else if (method === 'GET') {
                fetchUrl = fetchUrl.replace(/\{\{value\}\}/gi, encodeURIComponent(value));
                Object.entries(allInputValues).forEach(([name, val]) => {
                    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    fetchUrl = fetchUrl.replace(
                        new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'),
                        encodeURIComponent(val || '')
                    );
                });
            }
            
            console.log('🔍 Game ID Check Request:', fetchUrl);
            const response = await fetch(fetchUrl, options);
            const data = await response.json();
            console.log('🔍 Game ID Check Response:', data);
            
            let isValid = false;
            let nickname = null;
            let country = null;
            
            if (config.responsePath || config.response) {
                const rp = config.responsePath || config.response;
                const validValue = rp.valid ? this.getNestedValue(data, rp.valid) : null;
                nickname = rp.nickname ? this.getNestedValue(data, rp.nickname) : null;
                country = rp.country ? this.getNestedValue(data, rp.country) : null;
                
                if (validValue !== null && validValue !== undefined) {
                    isValid = !!validValue;
                } else {
                    isValid = !!nickname;
                }
            } else {
                nickname = config.responseNamePath ? this.getNestedValue(data, config.responseNamePath) : null;
                const validValue = config.responseValidPath ? this.getNestedValue(data, config.responseValidPath) : null;
                isValid = validValue !== null && validValue !== undefined ? !!validValue : !!nickname;
                country = null;
            }
            
            return {
                valid: isValid,
                nickname: nickname || null,
                playerName: nickname || null,
                country: country || null,
                raw: data
            };
        } catch (error) {
            console.error('Game ID check error:', error);
            return { valid: false, nickname: null, playerName: null, country: null, error: error.message };
        }
    },
    
    getNestedValue(obj, path) {
        if (!path) return null;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },
    
    autoCheck(tableId, callback, delay = 800) {
        if (this.debounceTimers[tableId]) {
            clearTimeout(this.debounceTimers[tableId]);
        }
        this.debounceTimers[tableId] = setTimeout(callback, delay);
    },
    
    getRequiredInputs(config) {
        if (!config) return [];
        if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch(e) { return []; }
        }
        if (!config.body) return [];
        const bodyStr = JSON.stringify(config.body);
        const matches = bodyStr.match(/\{\{([^}]+)\}\}/g) || [];
        return matches
            .map(m => m.replace(/\{\{|\}\}/g, ''))
            .filter(name => name.toLowerCase() !== 'value');
    }
};
window.GameIdChecker = GameIdChecker;

// ===== Country Display Helper =====
const CountryHelper = {
    countries: {
        'AF': '🇦🇫 Afghanistan', 'AL': '🇦🇱 Albania', 'DZ': '🇩🇿 Algeria',
        'AD': '🇦🇩 Andorra', 'AO': '🇦🇴 Angola', 'AR': '🇦🇷 Argentina',
        'AM': '🇦🇲 Armenia', 'AU': '🇦🇺 Australia', 'AT': '🇦🇹 Austria',
        'AZ': '🇦🇿 Azerbaijan', 'BH': '🇧🇭 Bahrain', 'BD': '🇧🇩 Bangladesh',
        'BY': '🇧🇾 Belarus', 'BE': '🇧🇪 Belgium', 'BZ': '🇧🇿 Belize',
        'BJ': '🇧🇯 Benin', 'BT': '🇧🇹 Bhutan', 'BO': '🇧🇴 Bolivia',
        'BA': '🇧🇦 Bosnia', 'BW': '🇧🇼 Botswana', 'BR': '🇧🇷 Brazil',
        'BN': '🇧🇳 Brunei', 'BG': '🇧🇬 Bulgaria', 'KH': '🇰🇭 Cambodia',
        'CM': '🇨🇲 Cameroon', 'CA': '🇨🇦 Canada', 'CL': '🇨🇱 Chile',
        'CN': '🇨🇳 China', 'CO': '🇨🇴 Colombia', 'CR': '🇨🇷 Costa Rica',
        'HR': '🇭🇷 Croatia', 'CU': '🇨🇺 Cuba', 'CY': '🇨🇾 Cyprus',
        'CZ': '🇨🇿 Czech Republic', 'DK': '🇩🇰 Denmark', 'DO': '🇩🇴 Dominican Republic',
        'EC': '🇪🇨 Ecuador', 'EG': '🇪🇬 Egypt', 'SV': '🇸🇻 El Salvador',
        'EE': '🇪🇪 Estonia', 'ET': '🇪🇹 Ethiopia', 'FI': '🇫🇮 Finland',
        'FR': '🇫🇷 France', 'GE': '🇬🇪 Georgia', 'DE': '🇩🇪 Germany',
        'GH': '🇬🇭 Ghana', 'GR': '🇬🇷 Greece', 'GT': '🇬🇹 Guatemala',
        'HN': '🇭🇳 Honduras', 'HK': '🇭🇰 Hong Kong', 'HU': '🇭🇺 Hungary',
        'IS': '🇮🇸 Iceland', 'IN': '🇮🇳 India', 'ID': '🇮🇩 Indonesia',
        'IR': '🇮🇷 Iran', 'IQ': '🇮🇶 Iraq', 'IE': '🇮🇪 Ireland',
        'IL': '🇮🇱 Israel', 'IT': '🇮🇹 Italy', 'JM': '🇯🇲 Jamaica',
        'JP': '🇯🇵 Japan', 'JO': '🇯🇴 Jordan', 'KZ': '🇰🇿 Kazakhstan',
        'KE': '🇰🇪 Kenya', 'KP': '🇰🇵 North Korea', 'KR': '🇰🇷 South Korea',
        'KW': '🇰🇼 Kuwait', 'KG': '🇰🇬 Kyrgyzstan', 'LA': '🇱🇦 Laos',
        'LV': '🇱🇻 Latvia', 'LB': '🇱🇧 Lebanon', 'LY': '🇱🇾 Libya',
        'LT': '🇱🇹 Lithuania', 'LU': '🇱🇺 Luxembourg', 'MO': '🇲🇴 Macau',
        'MG': '🇲🇬 Madagascar', 'MY': '🇲🇾 Malaysia', 'MV': '🇲🇻 Maldives',
        'ML': '🇲🇱 Mali', 'MT': '🇲🇹 Malta', 'MX': '🇲🇽 Mexico',
        'MD': '🇲🇩 Moldova', 'MN': '🇲🇳 Mongolia', 'ME': '🇲🇪 Montenegro',
        'MA': '🇲🇦 Morocco', 'MZ': '🇲🇿 Mozambique', 'MM': '🇲🇲 Myanmar',
        'NA': '🇳🇦 Namibia', 'NP': '🇳🇵 Nepal', 'NL': '🇳🇱 Netherlands',
        'NZ': '🇳🇿 New Zealand', 'NI': '🇳🇮 Nicaragua', 'NE': '🇳🇪 Niger',
        'NG': '🇳🇬 Nigeria', 'NO': '🇳🇴 Norway', 'OM': '🇴🇲 Oman',
        'PK': '🇵🇰 Pakistan', 'PS': '🇵🇸 Palestine', 'PA': '🇵🇦 Panama',
        'PY': '🇵🇾 Paraguay', 'PE': '🇵🇪 Peru', 'PH': '🇵🇭 Philippines',
        'PL': '🇵🇱 Poland', 'PT': '🇵🇹 Portugal', 'QA': '🇶🇦 Qatar',
        'RO': '🇷🇴 Romania', 'RU': '🇷🇺 Russia', 'RW': '🇷🇼 Rwanda',
        'SA': '🇸🇦 Saudi Arabia', 'SN': '🇸🇳 Senegal', 'RS': '🇷🇸 Serbia',
        'SG': '🇸🇬 Singapore', 'SK': '🇸🇰 Slovakia', 'SI': '🇸🇮 Slovenia',
        'SO': '🇸🇴 Somalia', 'ZA': '🇿🇦 South Africa', 'ES': '🇪🇸 Spain',
        'LK': '🇱🇰 Sri Lanka', 'SD': '🇸🇩 Sudan', 'SE': '🇸🇪 Sweden',
        'CH': '🇨🇭 Switzerland', 'SY': '🇸🇾 Syria', 'TW': '🇹🇼 Taiwan',
        'TJ': '🇹🇯 Tajikistan', 'TZ': '🇹🇿 Tanzania', 'TH': '🇹🇭 Thailand',
        'TN': '🇹🇳 Tunisia', 'TR': '🇹🇷 Turkey', 'TM': '🇹🇲 Turkmenistan',
        'UG': '🇺🇬 Uganda', 'UA': '🇺🇦 Ukraine', 'AE': '🇦🇪 UAE',
        'GB': '🇬🇧 United Kingdom', 'US': '🇺🇸 United States', 'UY': '🇺🇾 Uruguay',
        'UZ': '🇺🇿 Uzbekistan', 'VE': '🇻🇪 Venezuela', 'VN': '🇻🇳 Vietnam',
        'YE': '🇾🇪 Yemen', 'ZM': '🇿🇲 Zambia', 'ZW': '🇿🇼 Zimbabwe'
    },
    
    getDisplay(code) {
        if (!code) return '';
        code = String(code).toUpperCase().trim();
        return this.countries[code] || `🌍 ${code}`;
    },
    
    getFlag(code) {
        if (!code) return '🌍';
        code = String(code).toUpperCase().trim();
        const display = this.countries[code];
        if (display) return display.split(' ')[0];
        return '🌍';
    }
};
window.CountryHelper = CountryHelper;

// ===== Main App =====
const App = {
    state: {
        currentPage: 'home',
        currentCategory: null,
        selectedProduct: null,
        selectedPayment: null,
        inputValues: {},
        user: null,
        settings: null,
        categories: [],
        banners: [],
        payments: [],
        products: [],
        inputTables: [],
        categoryBanners: [],
        orders: [],
        topups: [],
        isLoading: false,
        customEmojis: [],
        checkerResults: {},
        isProcessingPurchase: false  // ADDED: prevent double-click
    },
    
    async init() {
        try {
            console.log('🚀 Initializing App v' + CONFIG.VERSION);
            
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied();
                return;
            }
            
            const telegramUser = await TelegramApp.init();
            console.log('✅ Telegram user:', telegramUser);
            
            await this.showIntro();
            
            const isBanned = await Database.isUserBanned(telegramUser.id);
            if (isBanned) {
                this.showBannedScreen();
                return;
            }
            
            this.state.user = await Database.createUser({
                telegramId: telegramUser.id,
                username: telegramUser.username,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                photoUrl: telegramUser.photo_url,
                isPremium: telegramUser.is_premium
            });
            
            await this.loadAppData();
            this.setupUI();
            this.hideIntro();
            TelegramApp.ready();
            
            OrderChecker.start();
            
            console.log('✅ App initialized successfully!');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showAccessDenied();
        }
    },
    
    showAccessDenied() {
        document.getElementById('intro-screen').classList.add('hidden');
        document.getElementById('access-denied').classList.remove('hidden');
    },
    
    showBannedScreen() {
        document.getElementById('intro-screen').classList.add('hidden');
        document.body.innerHTML = `
            <div class="access-denied">
                <div class="denied-content">
                    <i class="fas fa-ban" style="color: var(--danger);"></i>
                    <h2>Account Banned</h2>
                    <p>Your account has been banned from using this service.</p>
                    <p>Please contact support if you believe this is a mistake.</p>
                </div>
            </div>
        `;
    },
    
    showIntro() {
        return new Promise(async (resolve) => {
            const introLogo = document.getElementById('intro-logo');
            const particles = document.getElementById('particles');
            
            try {
                const settings = await Database.getSettings();
                this.state.settings = settings;
                introLogo.src = settings.websiteLogo || this.getDefaultLogo();
            } catch (e) {
                introLogo.src = this.getDefaultLogo();
            }
            
            Utils.createParticles(particles, 30);
            setTimeout(resolve, CONFIG.INTRO_DURATION);
        });
    },
    
    getDefaultLogo() {
        return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="#8b5cf6" width="150" height="150" rx="30"/><text x="75" y="85" text-anchor="middle" fill="white" font-size="40" font-weight="bold">GS</text></svg>');
    },
    
    hideIntro() {
        const introScreen = document.getElementById('intro-screen');
        const mainApp = document.getElementById('main-app');
        
        introScreen.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => {
            introScreen.classList.add('hidden');
            mainApp.classList.remove('hidden');
            mainApp.style.animation = 'fadeIn 0.5s ease forwards';
        }, 500);
    },
    
    async loadAppData() {
        try {
            const [settings, categories, banners, payments] = await Promise.all([
                Database.getSettings(),
                Database.getCategories(),
                Database.getHomeBanners(),
                Database.getPaymentMethods()
            ]);
            
            this.state.settings = settings;
            this.state.customEmojis = settings?.customEmojis || [];
            this.state.categories = categories;
            this.state.banners = banners;
            this.state.payments = payments;
            
            if (this.state.user) {
                const [orders, topups] = await Promise.all([
                    Database.getOrdersByUser(this.state.user.telegramId),
                    Database.getTopupsByUser(this.state.user.telegramId)
                ]);
                this.state.orders = orders;
                this.state.topups = topups;
            }
        } catch (error) {
            console.error('Load app data error:', error);
        }
    },
    
    setupUI() {
        this.updateHeader();
        this.updateUserInfo();
        this.loadBanners();
        this.loadAnnouncement();
        this.loadCategories();
        this.setupEventListeners();
        
        if (TelegramApp.isAdmin()) {
            document.getElementById('admin-access').classList.remove('hidden');
        }
    },
    
    updateHeader() {
        const appLogo = document.getElementById('app-logo');
        const appName = document.getElementById('app-name');
        const userBalance = document.getElementById('user-balance');
        
        if (this.state.settings) {
            if (this.state.settings.websiteLogo) appLogo.src = this.state.settings.websiteLogo;
            if (this.state.settings.websiteName) appName.textContent = this.state.settings.websiteName;
        }
        
        if (this.state.user) {
            userBalance.textContent = this.formatNumber(this.state.user.balance || 0);
        }
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    updateUserInfo() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (this.state.user) {
            userName.textContent = (this.state.user.firstName + ' ' + (this.state.user.lastName || '')).trim() || 'User';
            userAvatar.src = this.state.user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.state.user.firstName || 'U')}&background=8b5cf6&color=fff`;
        }
    },
    
    loadBanners() {
        const bannerTrack = document.getElementById('banner-track');
        const bannerDots = document.getElementById('banner-dots');
        
        if (!this.state.banners || this.state.banners.length === 0) {
            bannerTrack.innerHTML = `<div class="banner-slide"><div style="width:100%;height:100%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;border-radius:20px;"><h2 style="color:white;">Welcome to Game Shop!</h2></div></div>`;
            return;
        }
        
        bannerTrack.innerHTML = this.state.banners.map((banner, i) => `<div class="banner-slide"><img src="${banner.image}" alt="Banner ${i + 1}"></div>`).join('');
        bannerDots.innerHTML = this.state.banners.map((_, i) => `<div class="banner-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('');
        
        if (this.state.banners.length > 1) this.setupBannerSlider();
    },
    
    setupBannerSlider() {
        let currentIndex = 0;
        const bannerTrack = document.getElementById('banner-track');
        const dots = document.querySelectorAll('.banner-dot');
        const total = this.state.banners.length;
        
        const update = (i) => {
            bannerTrack.style.transform = `translateX(-${i * 100}%)`;
            dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
        };
        
        setInterval(() => { currentIndex = (currentIndex + 1) % total; update(currentIndex); }, CONFIG.BANNER_INTERVAL);
        dots.forEach(d => d.addEventListener('click', () => { currentIndex = parseInt(d.dataset.index); update(currentIndex); }));
    },
    
    loadAnnouncement() {
        const el = document.getElementById('announcement-text');
        if (this.state.settings?.announcement) {
            el.innerHTML = renderCustomEmojis(this.state.settings.announcement);
        } else {
            el.textContent = 'Welcome to Game Top-Up Shop! Best prices guaranteed!';
        }
    },
    
    loadCategories() {
        const grid = document.getElementById('categories-grid');
        
        if (!this.state.categories || this.state.categories.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:2rem;"><i class="fas fa-gamepad" style="font-size:3rem;color:var(--text-secondary);margin-bottom:1rem;"></i><p style="color:var(--text-secondary);">No categories available yet</p></div>`;
            return;
        }
        
        grid.innerHTML = this.state.categories.map((cat, i) => `
            <div class="category-card stagger-item" onclick="App.openCategory('${cat.id}')" style="animation-delay:${i * 0.05}s">
                ${cat.flag ? `<span class="category-flag">${cat.flag}</span>` : ''}
                ${cat.hasDiscount ? `<span class="category-discount"><i class="fas fa-percent"></i> Sale</span>` : ''}
                <img src="${cat.icon}" alt="${cat.name}" class="category-icon">
                <div class="category-name">${renderCustomEmojis(cat.name)}</div>
                <div class="category-sold"><i class="fas fa-fire"></i> ${cat.totalSold || 0} sold</div>
            </div>
        `).join('');
    },
    
    // UPDATED: Auto-generate Game ID input for G2Bulk products
    async openCategory(categoryId) {
        TelegramApp.hapticFeedback('impact', 'light');
        Utils.showLoading('Loading products...');
        
        try {
            const [category, products, inputTables, categoryBanners] = await Promise.all([
                Database.getCategoryById(categoryId),
                Database.getProductsByCategory(categoryId),
                Database.getInputTablesByCategory(categoryId),
                Database.getCategoryBanners(categoryId)
            ]);
            
            this.state.currentCategory = category;
            this.state.products = products;
            this.state.categoryBanners = categoryBanners;
            this.state.selectedProduct = null;
            this.state.inputValues = {};
            this.state.checkerResults = {};
            
            // FIXED: Auto-generate Game ID input for G2Bulk products if none configured
            const hasG2BulkProducts = products && products.some(p => p.serviceId);
            if (inputTables && inputTables.length > 0) {
                this.state.inputTables = inputTables;
            } else if (hasG2BulkProducts) {
                this.state.inputTables = [{
                    id: 'auto-gameid',
                    name: 'Game ID',
                    placeholder: 'Enter your Game ID / Player ID',
                    checkerEnabled: false,
                    autoGenerated: true
                }];
                console.log('📋 Auto-generated Game ID input for G2Bulk products');
            } else {
                this.state.inputTables = [];
            }
            
            this.renderCategoryPage();
            this.showPage('category');
            TelegramApp.showBackButton();
        } catch (error) {
            console.error('Open category error:', error);
            Utils.showToast('Failed to load category', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    renderCategoryPage() {
        const categoryTitle = document.getElementById('category-title');
        const inputSection = document.getElementById('input-section');
        const productsGrid = document.getElementById('products-grid');
        const categoryInfoSection = document.getElementById('category-info-section');
        
        categoryTitle.textContent = this.state.currentCategory.name;
        
        // Input tables with enhanced checker support
        if (this.state.inputTables?.length > 0) {
            inputSection.innerHTML = this.state.inputTables.map(table => `
                <div class="input-group" data-table-id="${table.id}">
                    <label>${table.name}</label>
                    <div class="input-with-checker">
                        <input type="text" 
                               id="input-${table.id}" 
                               placeholder="${table.placeholder}"
                               oninput="App.onInputChange('${table.id}', '${table.name}', this.value)"
                               autocomplete="off">
                        ${table.checkerEnabled ? `
                            <button class="checker-btn" onclick="App.checkGameId('${table.id}')" title="Verify ID">
                                <i class="fas fa-search"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div id="checker-result-${table.id}" class="checker-result hidden"></div>
                </div>
            `).join('');
            inputSection.classList.remove('hidden');
        } else {
            inputSection.innerHTML = '';
            inputSection.classList.add('hidden');
        }
        
        // Products
        if (this.state.products?.length > 0) {
            productsGrid.innerHTML = this.state.products.map(product => `
                <div class="product-card ${this.state.selectedProduct?.id === product.id ? 'selected' : ''}" 
                     onclick="App.selectProduct('${product.id}')" data-product-id="${product.id}">
                    ${product.discount > 0 ? `<span class="product-discount-badge">-${product.discount}%</span>` : ''}
                    <img src="${product.icon}" alt="${product.name}" class="product-icon">
                    <div class="product-name">${renderCustomEmojis(product.name)}</div>
                    <div class="product-price">
                        ${product.discount > 0 ? `<span class="original">${Utils.formatCurrency(product.price, product.currency)}</span>` : ''}
                        <span class="current">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</span>
                    </div>
                    <div class="product-delivery">
                        <i class="fas fa-bolt"></i>
                        ${product.serviceId ? 'Auto Delivery' : (product.deliveryTime === 'instant' ? 'Instant' : product.deliveryTime)}
                    </div>
                </div>
            `).join('');
        } else {
            productsGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:2rem;"><i class="fas fa-box-open" style="font-size:3rem;color:var(--text-secondary);margin-bottom:1rem;"></i><p style="color:var(--text-secondary);">No products available</p></div>`;
        }
        
        // Category info
        if (this.state.categoryBanners?.length > 0) {
            const banner = this.state.categoryBanners[0];
            categoryInfoSection.innerHTML = `
                <img src="${banner.image}" alt="Banner" class="category-banner">
                ${banner.description ? `<div class="category-description"><h3><i class="fas fa-info-circle"></i> Information</h3><p>${banner.description}</p></div>` : ''}
            `;
            categoryInfoSection.classList.remove('hidden');
        } else {
            categoryInfoSection.classList.add('hidden');
        }
        
        this.updateBuyButton();
    },
    
    onInputChange(tableId, tableName, value) {
        this.state.inputValues[tableName] = value;
        
        const checkerTable = this.state.inputTables.find(t => t.checkerEnabled && t.checkerConfig);
        if (!checkerTable) return;
        
        let config = checkerTable.checkerConfig;
        if (typeof config === 'string') {
            try { config = JSON.parse(config); } catch(e) { return; }
        }
        
        const checkerInputEl = document.getElementById(`input-${checkerTable.id}`);
        const checkerInputValue = checkerInputEl?.value?.trim();
        if (!checkerInputValue) {
            const resultDiv = document.getElementById(`checker-result-${checkerTable.id}`);
            if (resultDiv) {
                resultDiv.classList.add('hidden');
                resultDiv.innerHTML = '';
            }
            return;
        }
        
        const requiredInputs = GameIdChecker.getRequiredInputs(config);
        for (const reqInput of requiredInputs) {
            if (!this.state.inputValues[reqInput]?.trim()) return;
        }
        
        GameIdChecker.autoCheck(checkerTable.id, () => {
            this.checkGameId(checkerTable.id);
        }, 800);
    },
    
    async checkGameId(tableId) {
        const table = this.state.inputTables.find(t => t.id === tableId);
        if (!table || !table.checkerEnabled || !table.checkerConfig) return;
        
        const input = document.getElementById(`input-${tableId}`);
        const resultDiv = document.getElementById(`checker-result-${tableId}`);
        const value = input?.value?.trim();
        
        if (!value) {
            Utils.showToast(`Please enter ${table.name}`, 'warning');
            return;
        }
        
        resultDiv.innerHTML = `
            <div class="checker-card loading">
                <div class="checker-loading-content">
                    <div class="checker-spinner"></div>
                    <span>Verifying Game ID...</span>
                </div>
            </div>
        `;
        resultDiv.classList.remove('hidden');
        resultDiv.className = 'checker-result show';
        
        try {
            const result = await GameIdChecker.check(
                table.checkerConfig, 
                value, 
                this.state.inputValues
            );
            
            if (result && result.valid) {
                this.state.checkerResults[tableId] = result;
                
                let infoRows = '';
                
                if (result.nickname) {
                    infoRows += `
                        <div class="checker-info-row">
                            <div class="checker-info-icon"><i class="fas fa-gamepad"></i></div>
                            <div class="checker-info-data">
                                <span class="checker-info-label">Nickname</span>
                                <strong class="checker-info-value nickname">${result.nickname}</strong>
                            </div>
                        </div>
                    `;
                }
                
                if (result.country) {
                    infoRows += `
                        <div class="checker-info-row">
                            <div class="checker-info-icon"><i class="fas fa-globe-asia"></i></div>
                            <div class="checker-info-data">
                                <span class="checker-info-label">Country</span>
                                <strong class="checker-info-value">${CountryHelper.getDisplay(result.country)}</strong>
                            </div>
                        </div>
                    `;
                }
                
                if (!result.nickname && !result.country) {
                    infoRows = `
                        <div class="checker-info-row">
                            <div class="checker-info-icon"><i class="fas fa-check"></i></div>
                            <div class="checker-info-data">
                                <strong class="checker-info-value">Valid Game ID</strong>
                            </div>
                        </div>
                    `;
                }
                
                resultDiv.innerHTML = `
                    <div class="checker-card valid">
                        <div class="checker-status-bar valid">
                            <i class="fas fa-check-circle"></i>
                            <span>Account Verified</span>
                        </div>
                        <div class="checker-info-body">
                            ${infoRows}
                        </div>
                    </div>
                `;
                resultDiv.className = 'checker-result show valid';
                TelegramApp.hapticFeedback('notification', 'success');
                
            } else {
                this.state.checkerResults[tableId] = null;
                
                let errorMsg = 'Invalid Game ID. Please check and try again.';
                let config = table.checkerConfig;
                if (typeof config === 'string') {
                    try { config = JSON.parse(config); } catch(e) {}
                }
                if (config && config.errorMessage) {
                    errorMsg = config.errorMessage;
                }
                
                resultDiv.innerHTML = `
                    <div class="checker-card invalid">
                        <div class="checker-status-bar invalid">
                            <i class="fas fa-times-circle"></i>
                            <span>Account Not Found</span>
                        </div>
                        <div class="checker-error-body">
                            <p>${errorMsg}</p>
                        </div>
                    </div>
                `;
                resultDiv.className = 'checker-result show invalid';
                TelegramApp.hapticFeedback('notification', 'error');
            }
        } catch (error) {
            this.state.checkerResults[tableId] = null;
            resultDiv.innerHTML = `
                <div class="checker-card error">
                    <div class="checker-status-bar error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Verification Failed</span>
                    </div>
                    <div class="checker-error-body">
                        <p>Unable to verify at this time. Please try again later.</p>
                    </div>
                </div>
            `;
            resultDiv.className = 'checker-result show error';
        }
    },
    
    updateInputValue(tableId, tableName, value) {
        this.state.inputValues[tableName] = value;
    },
    
    selectProduct(productId) {
        TelegramApp.hapticFeedback('selection');
        this.state.selectedProduct = this.state.products.find(p => p.id === productId);
        
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.productId === productId);
        });
        
        this.updateBuyButton();
    },
    
    updateBuyButton() {
        let container = document.querySelector('.buy-button-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'buy-button-container';
            document.getElementById('category-page').appendChild(container);
        }
        
        if (this.state.selectedProduct) {
            const price = this.state.selectedProduct.discountedPrice || this.state.selectedProduct.price;
            container.innerHTML = `
                <button class="buy-now-btn" onclick="App.openBuyModal()">
                    <i class="fas fa-shopping-cart"></i>
                    Buy Now - ${Utils.formatCurrency(price, this.state.selectedProduct.currency)}
                </button>
            `;
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    },
    
    openBuyModal() {
        if (this.state.inputTables?.length > 0) {
            for (const table of this.state.inputTables) {
                if (!this.state.inputValues[table.name]?.trim()) {
                    Utils.showToast(`Please enter ${table.name}`, 'warning');
                    TelegramApp.hapticFeedback('notification', 'warning');
                    return;
                }
            }
        }
        
        if (!this.state.selectedProduct) {
            Utils.showToast('Please select a product', 'warning');
            return;
        }
        
        TelegramApp.hapticFeedback('impact', 'medium');
        
        const product = this.state.selectedProduct;
        const price = product.discountedPrice || product.price;
        const balance = this.state.user.balance || 0;
        const remaining = balance - price;
        
        let checkerInfoHTML = '';
        const checkerTable = this.state.inputTables.find(t => t.checkerEnabled);
        if (checkerTable && this.state.checkerResults[checkerTable.id]) {
            const cr = this.state.checkerResults[checkerTable.id];
            checkerInfoHTML = `<div class="modal-checker-info">`;
            if (cr.nickname) checkerInfoHTML += `<span class="modal-checker-tag"><i class="fas fa-gamepad"></i> ${cr.nickname}</span>`;
            if (cr.country) checkerInfoHTML += `<span class="modal-checker-tag"><i class="fas fa-globe"></i> ${CountryHelper.getDisplay(cr.country)}</span>`;
            checkerInfoHTML += `</div>`;
        }
        
        document.getElementById('product-summary').innerHTML = `
            <div class="product-summary-card">
                <img src="${product.icon}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <p>${this.state.currentCategory.name}</p>
                    ${product.serviceId ? '<span class="auto-badge"><i class="fas fa-bolt"></i> Auto Delivery</span>' : ''}
                </div>
            </div>
            ${checkerInfoHTML}
        `;
        
        const inputSummary = document.getElementById('input-summary');
        if (Object.keys(this.state.inputValues).length > 0) {
            inputSummary.innerHTML = Object.entries(this.state.inputValues).map(([k, v]) => `
                <div class="input-summary-item"><span>${k}:</span><strong>${v}</strong></div>
            `).join('');
        } else {
            inputSummary.innerHTML = '';
        }
        
        document.getElementById('modal-price').textContent = Utils.formatCurrency(price, product.currency);
        document.getElementById('modal-balance').textContent = Utils.formatCurrency(balance, 'MMK');
        document.getElementById('modal-remaining').textContent = Utils.formatCurrency(remaining, 'MMK');
        document.getElementById('modal-remaining').style.color = remaining >= 0 ? 'var(--success)' : 'var(--danger)';
        
        const verificationSection = document.getElementById('verification-section');
        if (verificationSection) {
            verificationSection.classList.add('hidden');
        }
        
        document.getElementById('buy-modal').classList.remove('hidden');
    },
    
    closeBuyModal() {
        document.getElementById('buy-modal').classList.add('hidden');
        document.getElementById('verification-code').value = '';
    },
    
    // ===== FIXED: confirmPurchase - No double refund, retry-safe =====
    async confirmPurchase() {
        // Prevent double-click / concurrent purchases
        if (this.state.isProcessingPurchase) {
            Utils.showToast('Purchase already in progress...', 'warning');
            return;
        }
        
        const product = this.state.selectedProduct;
        const price = product.discountedPrice || product.price;
        
        if ((this.state.user.balance || 0) < price) {
            TelegramApp.hapticFeedback('notification', 'error');
            
            const attempts = await Database.incrementFailedAttempts(this.state.user.telegramId);
            if (attempts >= CONFIG.MAX_FAILED_PURCHASE_ATTEMPTS) {
                await Database.banUser({
                    telegramId: this.state.user.telegramId,
                    username: this.state.user.username,
                    firstName: this.state.user.firstName
                }, 'Exceeded maximum failed purchase attempts');
                try { await TelegramBot.notifyBan(this.state.user.telegramId, 'Exceeded maximum failed purchase attempts'); } catch(e) {}
                this.showBannedScreen();
                return;
            }
            
            Utils.showToast(`Insufficient balance! (${CONFIG.MAX_FAILED_PURCHASE_ATTEMPTS - attempts} attempts remaining)`, 'error');
            return;
        }
        
        // Lock purchase
        this.state.isProcessingPurchase = true;
        Utils.showLoading('Processing order...');
        TelegramApp.hapticFeedback('impact', 'heavy');
        
        // Track balance state to prevent double refund
        let balanceDeducted = false;
        let balanceRefunded = false;
        
        try {
            // Step 1: Deduct balance
            await Database.updateUserBalance(this.state.user.telegramId, price, 'subtract');
            balanceDeducted = true;
            this.state.user.balance -= price;
            
            // Step 2: Build link from inputs
            const link = this.buildGameLink(this.state.inputValues);
            
            // Step 3: Create order record
            const order = await Database.createOrder({
                userId: this.state.user.id,
                telegramId: this.state.user.telegramId,
                productId: product.id,
                productName: product.name,
                categoryId: this.state.currentCategory.id,
                categoryName: this.state.currentCategory.name,
                amount: price,
                currency: product.currency,
                inputValues: this.state.inputValues,
                serviceId: product.serviceId,
                link: link
            });
            
            // Step 4: Process via G2Bulk API if serviceId exists
            if (product.serviceId) {
                try {
                    const apiResult = await G2BulkAPI.placeOrder(product.serviceId, link, 1);
                    
                    if (apiResult && apiResult.order) {
                        // SUCCESS: API order placed
                        await Database.updateOrderApiStatus(order.id, {
                            apiOrderId: apiResult.order,
                            apiStatus: 'Processing',
                            status: 'processing'
                        });
                        
                        this.closeBuyModal();
                        Utils.showToast('✅ Order placed! Auto-processing...', 'success');
                        try { await TelegramBot.notifyNewAutoOrder(order, this.state.user, apiResult.order); } catch(e) { console.warn('Notify error:', e); }
                        
                    } else if (apiResult && apiResult.error) {
                        if (G2BulkAPI.isBalanceError(apiResult.error)) {
                            // QUEUED: API balance insufficient
                            await Database.updateOrderApiStatus(order.id, {
                                apiStatus: 'Queued',
                                status: 'queued',
                                apiError: 'API balance insufficient - queued for retry'
                            });
                            
                            this.closeBuyModal();
                            Utils.showToast('⏳ Order queued. Will be processed when API balance is available.', 'info');
                            try { await TelegramBot.notifyOrderQueued(order, this.state.user); } catch(e) { console.warn('Notify error:', e); }
                            
                        } else {
                            // FAILED: Non-balance API error - Refund ONCE
                            if (balanceDeducted && !balanceRefunded) {
                                await Database.updateUserBalance(this.state.user.telegramId, price, 'add');
                                balanceRefunded = true;
                            }
                            
                            await Database.updateOrderApiStatus(order.id, {
                                apiStatus: 'Failed',
                                status: 'failed',
                                apiError: apiResult.error
                            });
                            
                            this.closeBuyModal();
                            Utils.showToast('❌ Order failed: ' + apiResult.error + '. Balance refunded.', 'error');
                            try { await TelegramBot.notifyOrderFailed(order, apiResult.error); } catch(e) { console.warn('Notify error:', e); }
                        }
                    }
                } catch (apiError) {
                    // NETWORK ERROR - Refund ONLY if not already refunded
                    console.error('G2Bulk API call failed:', apiError);
                    
                    if (balanceDeducted && !balanceRefunded) {
                        await Database.updateUserBalance(this.state.user.telegramId, price, 'add');
                        balanceRefunded = true;
                    }
                    
                    await Database.updateOrderApiStatus(order.id, {
                        apiStatus: 'Failed',
                        status: 'failed',
                        apiError: 'API connection error: ' + apiError.message
                    });
                    
                    this.closeBuyModal();
                    Utils.showToast('❌ Connection error. Balance refunded.', 'error');
                }
            } else {
                // Manual order (no serviceId)
                this.closeBuyModal();
                Utils.showToast('📦 Order placed! Awaiting processing.', 'success');
                try { await TelegramBot.notifyNewOrder(order, this.state.user); } catch(e) { console.warn('Notify error:', e); }
            }
            
            // Step 5: Always sync balance from DB
            await this.refreshUserData();
            this.state.orders.unshift(order);
            
            // Step 6: Reset selections
            this.state.selectedProduct = null;
            this.state.inputValues = {};
            this.state.checkerResults = {};
            this.renderCategoryPage();
            
        } catch (error) {
            console.error('Purchase error:', error);
            
            // Emergency refund if balance was deducted but not yet refunded
            if (balanceDeducted && !balanceRefunded) {
                try {
                    await Database.updateUserBalance(this.state.user.telegramId, price, 'add');
                    balanceRefunded = true;
                    console.log('🔄 Emergency refund completed');
                } catch(refundError) {
                    console.error('❌ Emergency refund failed:', refundError);
                }
            }
            
            await this.refreshUserData();
            Utils.showToast('Failed to process order: ' + error.message, 'error');
        } finally {
            // Always unlock
            this.state.isProcessingPurchase = false;
            Utils.hideLoading();
        }
    },
    
    buildGameLink(inputValues) {
        const values = Object.values(inputValues).filter(v => v && v.trim());
        if (values.length === 0) return '';
        if (values.length === 1) return values[0].trim();
        return values.map(v => v.trim()).join('|');
    },
    
    async sendOTP() {
        Utils.showLoading('Sending OTP...');
        try {
            const otp = TelegramBot.generateOTP();
            await TelegramBot.sendOTP(this.state.user.telegramId, otp);
            this.state.currentOTP = otp;
            this.state.otpExpiry = Date.now() + 5 * 60 * 1000;
            Utils.showToast('OTP sent to your Telegram!', 'success');
        } catch (error) {
            Utils.showToast('Failed to send OTP', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== PAGE NAVIGATION =====
    
    showPage(page) {
        this.state.currentPage = page;
        document.querySelectorAll('.page, .main-app').forEach(p => p.classList.add('hidden'));
        
        if (page === 'home') {
            document.getElementById('main-app').classList.remove('hidden');
            TelegramApp.hideBackButton();
            this.loadCategories();
        } else {
            const el = document.getElementById(`${page}-page`);
            if (el) el.classList.remove('hidden');
            TelegramApp.showBackButton();
        }
        
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        
        switch (page) {
            case 'orders': this.renderOrdersPage(); break;
            case 'history': this.renderHistoryPage(); break;
            case 'profile': this.renderProfilePage(); break;
        }
    },
    
    goBack() {
        this.showPage('home');
    },
    
    // ===== ORDERS PAGE =====
    
    async renderOrdersPage() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;
        
        Utils.showLoading('Loading orders...');
        
        try {
            this.state.orders = await Database.getOrdersByUser(this.state.user.telegramId);
            
            if (this.state.orders.length === 0) {
                ordersList.innerHTML = `<div class="empty-state"><i class="fas fa-shopping-bag"></i><p>No orders yet</p><small>Your orders will appear here</small></div>`;
            } else {
                ordersList.innerHTML = this.state.orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-id">#${order.orderId}</span>
                            <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                        </div>
                        <div class="order-product">
                            <div class="order-product-info">
                                <h4>${order.productName}</h4>
                                <p>${order.categoryName || ''}</p>
                            </div>
                        </div>
                        ${order.apiOrderId ? `
                            <div class="order-api-info">
                                <span class="api-badge"><i class="fas fa-bolt"></i> API Order: #${order.apiOrderId}</span>
                                ${order.apiStatus ? `<span class="api-status ${order.apiStatus.toLowerCase().replace(/\s/g,'-')}">${order.apiStatus}</span>` : ''}
                            </div>
                        ` : ''}
                        ${order.inputValues && Object.keys(order.inputValues).length > 0 ? `
                            <div class="order-inputs">
                                ${Object.entries(order.inputValues).map(([k, v]) => `<span class="input-tag">${k}: ${v}</span>`).join('')}
                            </div>
                        ` : ''}
                        ${order.refundedAt ? `
                            <div class="order-refund">
                                <i class="fas fa-undo"></i> Refunded: ${Utils.formatCurrency(order.refundAmount || order.amount, order.currency)}
                            </div>
                        ` : ''}
                        <div class="order-footer">
                            <span class="order-date"><i class="fas fa-clock"></i> ${Utils.formatDate(order.createdAt)}</span>
                            <span class="order-price">${Utils.formatCurrency(order.amount, order.currency)}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            ordersList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load orders</p></div>`;
        } finally {
            Utils.hideLoading();
        }
    },
    
    getStatusText(status) {
        const map = {
            'pending': '⏳ Pending',
            'processing': '🔄 Processing',
            'completed': '✅ Completed',
            'failed': '❌ Failed',
            'queued': '📋 Queued',
            'partial': '⚠️ Partial',
            'canceled': '🚫 Canceled',
            'approved': '✅ Completed',
            'rejected': '❌ Rejected'
        };
        return map[status] || status;
    },
    
    // ===== HISTORY PAGE =====
    
    async renderHistoryPage(filter = 'all') {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        Utils.showLoading('Loading history...');
        
        try {
            const [orders, topups] = await Promise.all([
                Database.getOrdersByUser(this.state.user.telegramId),
                Database.getTopupsByUser(this.state.user.telegramId)
            ]);
            
            this.state.orders = orders;
            this.state.topups = topups;
            
            let items = [];
            
            if (filter === 'all' || filter === 'topup') {
                this.state.topups.filter(t => t.status === 'approved').forEach(topup => {
                    items.push({
                        type: 'topup', amount: topup.amount,
                        description: `Top-up via ${topup.paymentMethod}`,
                        date: topup.processedAt || topup.createdAt, status: 'approved'
                    });
                });
            }
            
            if (filter === 'all' || filter === 'purchase') {
                this.state.orders.filter(o => o.status !== 'pending' && o.status !== 'processing' && o.status !== 'queued').forEach(order => {
                    items.push({
                        type: 'purchase', amount: order.amount,
                        description: order.productName,
                        date: order.completedAt || order.processedAt || order.createdAt,
                        status: order.status,
                        refunded: order.status === 'failed' || order.status === 'rejected' || order.status === 'canceled'
                    });
                });
            }
            
            items.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (items.length === 0) {
                historyList.innerHTML = `<div class="empty-state"><i class="fas fa-history"></i><p>No transaction history</p></div>`;
            } else {
                historyList.innerHTML = items.map(item => `
                    <div class="history-item">
                        <div class="history-icon ${item.type}">
                            <i class="fas fa-${item.type === 'topup' ? 'plus' : (item.refunded ? 'undo' : 'shopping-cart')}"></i>
                        </div>
                        <div class="history-info">
                            <h4>${item.description}</h4>
                            <p>${item.type === 'topup' ? 'Balance Top-up' : (item.refunded ? 'Refunded' : 'Purchase')}</p>
                        </div>
                        <div class="history-amount">
                            <span class="amount ${item.type === 'topup' || item.refunded ? 'positive' : 'negative'}">
                                ${item.type === 'topup' || item.refunded ? '+' : '-'}${Utils.formatCurrency(item.amount, 'MMK')}
                            </span>
                            <span class="time">${Utils.timeAgo(item.date)}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            historyList.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load history</p></div>`;
        } finally {
            Utils.hideLoading();
        }
    },
    
    showHistoryTab(filter) {
        document.querySelectorAll('.history-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderHistoryPage(filter);
    },
    
    // ===== PROFILE PAGE =====
    
    async renderProfilePage() {
        try {
            const freshUser = await Database.getUserByTelegramId(this.state.user.telegramId);
            if (freshUser) this.state.user = freshUser;
        } catch (e) {}
        
        const user = this.state.user;
        
        const pa = document.getElementById('profile-avatar');
        if (pa) pa.src = user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}&background=8b5cf6&color=fff&size=150`;
        
        const pn = document.getElementById('profile-name');
        if (pn) pn.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        
        const pi = document.getElementById('profile-id');
        if (pi) pi.textContent = user.username ? `@${user.username}` : `ID: ${user.telegramId}`;
        
        const pb = document.getElementById('premium-badge');
        if (pb) pb.classList.toggle('hidden', !user.isPremium);
        
        const to = document.getElementById('total-orders');
        if (to) to.textContent = user.totalOrders || 0;
        
        const ao = document.getElementById('approved-orders');
        if (ao) ao.textContent = user.approvedOrders || 0;
        
        const ts = document.getElementById('total-spent');
        if (ts) ts.textContent = this.formatNumber(user.totalSpent || 0);
        
        const tt = document.getElementById('theme-toggle');
        if (tt) tt.classList.toggle('active', document.documentElement.getAttribute('data-theme') === 'dark');
    },
    
    showNotificationSettings() {
        TelegramApp.showAlert('Notifications are enabled by default. You will receive updates about your orders via Telegram.');
    },
    
    showSupport() {
        TelegramApp.openTelegramLink(`https://t.me/${CONFIG.ADMIN_USERNAME || 'OPPER101'}`);
    },
    
    setupEventListeners() {
        window.onBackButtonClick = () => this.goBack();
        const savedTheme = Utils.storage.get('theme', CONFIG.DEFAULT_THEME);
        document.documentElement.setAttribute('data-theme', savedTheme);
    },
    
    async refreshUserData() {
        try {
            this.state.user = await Database.getUserByTelegramId(TelegramApp.getUserId());
            this.updateHeader();
            this.updateUserInfo();
        } catch (error) {
            console.error('Refresh user data error:', error);
        }
    }
};

// ===== Global Functions =====

function showPage(page) { App.showPage(page); }
function goBack() { App.goBack(); }
function openTopupModal() { openTopupModalHandler(); }
function closeTopupModal() { document.getElementById('topup-modal').classList.add('hidden'); }

function setAmount(amount) {
    document.getElementById('topup-amount').value = amount;
    document.querySelectorAll('.quick-amounts button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

async function openTopupModalHandler() {
    const modal = document.getElementById('topup-modal');
    const paymentMethods = document.getElementById('payment-methods');
    
    const payments = await Database.getPaymentMethods();
    App.state.payments = payments;
    
    if (payments.length === 0) {
        paymentMethods.innerHTML = `<p style="text-align:center;color:var(--text-secondary);">No payment methods available</p>`;
    } else {
        paymentMethods.innerHTML = `<h4>Select Payment Method</h4>${payments.map(p => `
            <div class="payment-method-item" onclick="selectPayment('${p.id}')">
                <img src="${p.icon}" alt="${p.name}" class="payment-icon">
                <span class="payment-name">${p.name}</span>
                <i class="fas fa-chevron-right"></i>
            </div>
        `).join('')}`;
    }
    
    modal.classList.remove('hidden');
}

function selectPayment(paymentId) {
    const payment = App.state.payments.find(p => p.id === paymentId);
    App.state.selectedPayment = payment;
    closeTopupModal();
    openPaymentDetails(payment);
}

function openPaymentDetails(payment) {
    const amount = document.getElementById('topup-amount').value;
    if (!amount || parseInt(amount) < 1000) {
        Utils.showToast('Please enter a valid amount (min 1000 MMK)', 'warning');
        document.getElementById('topup-modal').classList.remove('hidden');
        return;
    }
    
    App.state.topupAmount = parseInt(amount);
    const modal = document.getElementById('payment-details-modal');
    const paymentInfo = document.getElementById('payment-info');
    
    paymentInfo.innerHTML = `
        <div class="payment-detail-card"><img src="${payment.icon}" alt="${payment.name}" style="width:60px;height:60px;border-radius:12px;"><h4>${payment.name}</h4></div>
        <div class="payment-detail-item"><span>Amount to Pay:</span><strong>${Utils.formatCurrency(App.state.topupAmount, 'MMK')}</strong></div>
        <div class="payment-detail-item"><span>Account Number:</span><strong>${payment.address}</strong>
            <button onclick="Utils.copyToClipboard('${payment.address}')" style="margin-left:8px;background:var(--gradient-glow);border:none;padding:5px 10px;border-radius:8px;cursor:pointer;"><i class="fas fa-copy"></i></button>
        </div>
        <div class="payment-detail-item"><span>Account Name:</span><strong>${payment.accountName}</strong></div>
        ${payment.note ? `<div class="payment-note"><i class="fas fa-info-circle"></i><span>${payment.note}</span></div>` : ''}
    `;
    
    modal.classList.remove('hidden');
}

function closePaymentDetails() {
    document.getElementById('payment-details-modal').classList.add('hidden');
    document.getElementById('proof-preview').classList.add('hidden');
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('submit-topup-btn').disabled = true;
    App.state.proofImage = null;
}

function triggerUpload() { document.getElementById('payment-proof').click(); }

async function handleProofUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        Utils.showToast('Please select an image file', 'warning');
        return;
    }
    
    Utils.showLoading('Uploading image...');
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: formData });
        const result = await response.json();
        
        if (result.success) {
            App.state.proofImage = result.data.url;
            document.getElementById('proof-image').src = result.data.url;
            document.getElementById('proof-preview').classList.remove('hidden');
            document.getElementById('upload-area').classList.add('hidden');
            document.getElementById('submit-topup-btn').disabled = false;
        } else {
            throw new Error(result.error?.message || 'Upload failed');
        }
    } catch (error) {
        Utils.showToast('Failed to upload image', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function removeProof() {
    App.state.proofImage = null;
    document.getElementById('proof-preview').classList.add('hidden');
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('submit-topup-btn').disabled = true;
    document.getElementById('payment-proof').value = '';
}

async function submitTopup() {
    if (!App.state.proofImage || !App.state.selectedPayment || !App.state.topupAmount) {
        Utils.showToast('Please complete all fields', 'warning');
        return;
    }
    
    Utils.showLoading('Submitting request...');
    TelegramApp.hapticFeedback('impact', 'medium');
    
    try {
        const topup = await Database.createTopup({
            userId: App.state.user.id,
            telegramId: App.state.user.telegramId,
            amount: App.state.topupAmount,
            paymentMethod: App.state.selectedPayment.name,
            proofImage: App.state.proofImage
        });
        
        await TelegramBot.notifyNewTopup(topup, App.state.user);
        App.state.topups.unshift(topup);
        closePaymentDetails();
        Utils.showToast('Top-up request submitted!', 'success');
        App.state.proofImage = null;
        App.state.selectedPayment = null;
        App.state.topupAmount = 0;
    } catch (error) {
        Utils.showToast('Failed to submit request', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function closeBuyModal() { App.closeBuyModal(); }
function confirmPurchase() { App.confirmPurchase(); }
function sendOTP() { App.sendOTP(); }

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('theme-toggle')?.classList.toggle('active');
    Utils.storage.set('theme', newTheme);
    TelegramApp.hapticFeedback('impact', 'light');
}

function openAdminPanel() { window.location.href = 'admin.html'; }

function shareCategory() {
    if (App.state.currentCategory) {
        TelegramApp.shareUrl(`https://t.me/${CONFIG.BOT_USERNAME}`, `Check out ${App.state.currentCategory.name} on our Game Shop!`);
    }
}

function showHistoryTab(filter) { App.showHistoryTab(filter); }
function showNotificationSettings() { App.showNotificationSettings(); }
function showSupport() { App.showSupport(); }

// ===== Custom Emoji Renderer =====
function renderCustomEmojis(text) {
    if (!text || !App.state.customEmojis?.length) return text;
    let result = text;
    App.state.customEmojis.forEach(emoji => {
        const escaped = emoji.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escaped, 'g'), `<img class="custom-emoji" src="${emoji.imageUrl}" alt="${emoji.name || 'emoji'}">`);
    });
    return result;
}
window.renderCustomEmojis = renderCustomEmojis;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
