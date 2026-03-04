// ===== Admin Panel - G2Bulk + Auto Game ID Checker System =====

// ===== BUILT-IN GAME CHECKER PRESETS =====
const GameCheckerPresets = {
    // RapidAPI endpoint (single API for all games)
    API_URL: 'https://check-id-game1.p.rapidapi.com/check-id-game',
    API_HOST: 'check-id-game1.p.rapidapi.com',
    
    // All supported games
    games: [
        {
            id: 'mobile-legends',
            name: 'Mobile Legends: Bang Bang',
            icon: '📱',
            shortName: 'MLBB',
            gameCode: 'mobile-legends',
            fields: [
                { name: 'User ID', placeholder: 'Enter your User ID', bodyKey: 'userid', isMain: true },
                { name: 'Zone ID', placeholder: 'Enter Zone/Server ID', bodyKey: 'zoneid', isMain: false }
            ]
        },
        {
            id: 'free-fire',
            name: 'Free Fire',
            icon: '🔥',
            shortName: 'FF',
            gameCode: 'free-fire',
            fields: [
                { name: 'User ID', placeholder: 'Enter your Free Fire ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'genshin-impact',
            name: 'Genshin Impact',
            icon: '⭐',
            shortName: 'Genshin',
            gameCode: 'genshin-impact',
            fields: [
                { name: 'UID', placeholder: 'Enter your Genshin UID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'honkai-star-rail',
            name: 'Honkai: Star Rail',
            icon: '🌟',
            shortName: 'HSR',
            gameCode: 'honkai-star-rail',
            fields: [
                { name: 'UID', placeholder: 'Enter your HSR UID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'pubg-mobile',
            name: 'PUBG Mobile',
            icon: '🎮',
            shortName: 'PUBG',
            gameCode: 'pubg-mobile',
            fields: [
                { name: 'Player ID', placeholder: 'Enter your PUBG Player ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'call-of-duty-mobile',
            name: 'Call of Duty: Mobile',
            icon: '🔫',
            shortName: 'CODM',
            gameCode: 'call-of-duty-mobile',
            fields: [
                { name: 'Player ID', placeholder: 'Enter your CODM Player ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'arena-of-valor',
            name: 'Arena of Valor',
            icon: '⚔️',
            shortName: 'AOV',
            gameCode: 'arena-of-valor',
            fields: [
                { name: 'Player ID', placeholder: 'Enter your AOV Player ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'league-of-legends',
            name: 'League of Legends: Wild Rift',
            icon: '🏆',
            shortName: 'LOL WR',
            gameCode: 'league-of-legends',
            fields: [
                { name: 'Player ID', placeholder: 'Enter your LOL Player ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'valorant',
            name: 'Valorant',
            icon: '🎯',
            shortName: 'Valorant',
            gameCode: 'valorant',
            fields: [
                { name: 'Riot ID', placeholder: 'Enter your Riot ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'honor-of-kings',
            name: 'Honor of Kings',
            icon: '👑',
            shortName: 'HOK',
            gameCode: 'honor-of-kings',
            fields: [
                { name: 'Player ID', placeholder: 'Enter your HOK Player ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'clash-of-clans',
            name: 'Clash of Clans',
            icon: '🏰',
            shortName: 'COC',
            gameCode: 'clash-of-clans',
            fields: [
                { name: 'Player Tag', placeholder: 'Enter Player Tag (e.g., #ABC123)', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'clash-royale',
            name: 'Clash Royale',
            icon: '👸',
            shortName: 'CR',
            gameCode: 'clash-royale',
            fields: [
                { name: 'Player Tag', placeholder: 'Enter Player Tag', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'stumble-guys',
            name: 'Stumble Guys',
            icon: '🏃',
            shortName: 'Stumble',
            gameCode: 'stumble-guys',
            fields: [
                { name: 'Username', placeholder: 'Enter username', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'ragnarok-m',
            name: 'Ragnarok M',
            icon: '⚡',
            shortName: 'ROM',
            gameCode: 'ragnarok-m',
            fields: [
                { name: 'User ID', placeholder: 'Enter your User ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'tower-of-fantasy',
            name: 'Tower of Fantasy',
            icon: '🗼',
            shortName: 'TOF',
            gameCode: 'tower-of-fantasy',
            fields: [
                { name: 'User ID', placeholder: 'Enter your TOF User ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'super-sus',
            name: 'Super Sus',
            icon: '🔍',
            shortName: 'Super Sus',
            gameCode: 'super-sus',
            fields: [
                { name: 'User ID', placeholder: 'Enter your Super Sus ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'point-blank',
            name: 'Point Blank',
            icon: '🎯',
            shortName: 'PB',
            gameCode: 'point-blank',
            fields: [
                { name: 'User ID', placeholder: 'Enter your PB ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'metal-slug-awakening',
            name: 'Metal Slug: Awakening',
            icon: '🔧',
            shortName: 'MSA',
            gameCode: 'metal-slug-awakening',
            fields: [
                { name: 'User ID', placeholder: 'Enter your User ID', bodyKey: 'userid', isMain: true }
            ]
        },
        {
            id: 'one-punch-man',
            name: 'One Punch Man',
            icon: '👊',
            shortName: 'OPM',
            gameCode: 'one-punch-man',
            fields: [
                { name: 'User ID', placeholder: 'Enter your User ID', bodyKey: 'userid', isMain: true }
            ]
        }
    ],
    
    // Get game by ID
    getGame(gameId) {
        return this.games.find(g => g.id === gameId);
    },
    
    // Generate full checker config for a game
    generateConfig(gameId, apiKey) {
        const game = this.getGame(gameId);
        if (!game || !apiKey) return null;
        
        // Build body template
        const body = { game: game.gameCode };
        game.fields.forEach(field => {
            if (field.isMain) {
                body[field.bodyKey] = '{{value}}';
            } else {
                body[field.bodyKey] = `{{${field.name}}}`;
            }
        });
        
        return {
            url: this.API_URL,
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': this.API_HOST,
                'Content-Type': 'application/json'
            },
            body: body,
            responsePath: {
                valid: 'success',
                nickname: 'data.username',
                country: 'data.country'
            },
            errorMessage: `${game.name} ID not found! Please check and try again.`,
            // Store preset info for reference
            _preset: {
                gameId: game.id,
                gameName: game.name,
                gameIcon: game.icon
            }
        };
    },
    
    // Auto-detect game from category name
    autoDetectGame(categoryName) {
        if (!categoryName) return null;
        const name = categoryName.toLowerCase();
        
        const keywords = {
            'mobile-legends': ['mobile legends', 'mlbb', 'ml ', 'mobile legend'],
            'free-fire': ['free fire', 'freefire', 'ff ', 'garena free'],
            'genshin-impact': ['genshin', 'genshin impact'],
            'honkai-star-rail': ['honkai', 'star rail', 'hsr'],
            'pubg-mobile': ['pubg', 'battlegrounds'],
            'call-of-duty-mobile': ['call of duty', 'cod mobile', 'codm'],
            'arena-of-valor': ['arena of valor', 'aov', 'lien quan'],
            'league-of-legends': ['league of legends', 'lol', 'wild rift'],
            'valorant': ['valorant'],
            'honor-of-kings': ['honor of kings', 'hok', 'wang zhe'],
            'clash-of-clans': ['clash of clans', 'coc'],
            'clash-royale': ['clash royale'],
            'stumble-guys': ['stumble guys', 'stumble'],
            'tower-of-fantasy': ['tower of fantasy', 'tof'],
        };
        
        for (const [gameId, kws] of Object.entries(keywords)) {
            if (kws.some(kw => name.includes(kw))) {
                return gameId;
            }
        }
        return null;
    },
    
    // Get required additional input tables for a game
    getAdditionalFields(gameId) {
        const game = this.getGame(gameId);
        if (!game) return [];
        return game.fields.filter(f => !f.isMain);
    }
};
window.GameCheckerPresets = GameCheckerPresets;

// ===== Admin App =====
const AdminApp = {
    state: {
        currentPage: 'dashboard',
        users: [],
        orders: [],
        topups: [],
        categories: [],
        products: [],
        banners: { type1: [], type2: [] },
        payments: [],
        inputTables: [],
        bannedUsers: [],
        customEmojis: [],
        settings: {},
        stats: {},
        editingItem: null,
        currentBannerType: 'type1',
        ordersFilter: 'all',
        topupsFilter: 'all',
        g2bulkServices: [],
        g2bulkServicesRaw: [],
        g2bulkBalance: null,
        g2bulkCategories: [],
        // Game checker state
        selectedGamePreset: null,
        checkerMode: 'preset' // 'preset' or 'custom'
    },
    
    async init() {
        console.log('🚀 Initializing Admin Panel...');
        
        try {
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied('This panel can only be accessed through Telegram');
                return;
            }
            
            await TelegramApp.init();
            
            if (!TelegramApp.isAdmin()) {
                this.showAccessDenied('You don\'t have permission to access this panel');
                return;
            }
            
            Utils.showLoading('Loading admin panel...');
            await this.loadAdminData();
            this.showDashboard();
            TelegramApp.ready();
            Utils.hideLoading();
            
            this.refreshApiBalance();
            
        } catch (error) {
            console.error('❌ Admin init error:', error);
            Utils.hideLoading();
            Utils.showToast('Failed to initialize: ' + error.message, 'error');
        }
    },
    
    showAccessDenied(message) {
        document.getElementById('admin-dashboard').classList.add('hidden');
        const denied = document.getElementById('access-denied');
        denied.querySelector('p').textContent = message;
        denied.classList.remove('hidden');
    },
    
    showDashboard() {
        document.getElementById('access-denied').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        this.showAdminPage('dashboard');
        this.startRealtimeUpdates();
        this.updateTime();
    },
    
    async loadAdminData() {
        try {
            const results = await Promise.allSettled([
                Database.getSettings(),
                Database.getUsers(),
                Database.getOrders(),
                Database.getTopups(),
                Database.getCategories(),
                Database.getProducts(),
                Database.getBanners(),
                Database.getPaymentMethods(),
                Database.getInputTables(),
                Database.getBannedUsers(),
                Database.getStats()
            ]);
            
            this.state.settings = results[0].status === 'fulfilled' ? results[0].value : {};
            this.state.users = results[1].status === 'fulfilled' ? results[1].value : [];
            this.state.orders = results[2].status === 'fulfilled' ? results[2].value : [];
            this.state.topups = results[3].status === 'fulfilled' ? results[3].value : [];
            this.state.categories = results[4].status === 'fulfilled' ? results[4].value : [];
            this.state.products = results[5].status === 'fulfilled' ? results[5].value : [];
            this.state.banners = results[6].status === 'fulfilled' ? results[6].value : { type1: [], type2: [] };
            this.state.payments = results[7].status === 'fulfilled' ? results[7].value : [];
            this.state.inputTables = results[8].status === 'fulfilled' ? results[8].value : [];
            this.state.bannedUsers = results[9].status === 'fulfilled' ? results[9].value : [];
            this.state.customEmojis = this.state.settings?.customEmojis || [];
            this.state.stats = results[10].status === 'fulfilled' ? results[10].value : {};
            
            this.updateSidebarCounts();
        } catch (error) {
            console.error('Load admin data error:', error);
            throw error;
        }
    },
    
    // Get stored RapidAPI key
    getRapidApiKey() {
        return this.state.settings?.rapidApiKey || '';
    },
    
    updateSidebarCounts() {
        const usersCount = document.getElementById('users-count');
        const pendingOrders = document.getElementById('pending-orders');
        const pendingTopups = document.getElementById('pending-topups');
        
        if (usersCount) usersCount.textContent = this.state.users.length;
        if (pendingOrders) {
            const count = this.state.orders.filter(o => 
                o.status === 'pending' || o.status === 'processing' || o.status === 'queued'
            ).length;
            pendingOrders.textContent = count;
        }
        if (pendingTopups) pendingTopups.textContent = this.state.topups.filter(t => t.status === 'pending').length;
    },
    
    updateTime() {
        const update = () => {
            const el = document.getElementById('admin-time');
            if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        update();
        setInterval(update, 1000);
    },
    
    startRealtimeUpdates() {
        setInterval(async () => {
            try {
                await this.loadAdminData();
                this.renderCurrentPage();
            } catch (error) {}
        }, 30000);
    },
    
    showAdminPage(page) {
        this.state.currentPage = page;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[onclick="showAdminPage('${page}')"]`);
        if (active) active.classList.add('active');
        document.querySelectorAll('.admin-page').forEach(p => p.classList.add('hidden'));
        const target = document.getElementById(`admin-page-${page}`);
        if (target) {
            target.classList.remove('hidden');
            this.renderCurrentPage();
        }
    },
    
    renderCurrentPage() {
        switch (this.state.currentPage) {
            case 'dashboard': this.renderDashboard(); break;
            case 'users': this.renderUsers(); break;
            case 'orders': this.renderOrders(); break;
            case 'topups': this.renderTopups(); break;
            case 'categories': this.renderCategories(); break;
            case 'products': this.renderProducts(); break;
            case 'g2bulk': this.renderG2BulkPage(); break;
            case 'banners': this.renderBanners(); break;
            case 'input-tables': this.renderInputTables(); break;
            case 'payments': this.renderPayments(); break;
            case 'announcements': this.renderAnnouncements(); break;
            case 'banned': this.renderBannedUsers(); break;
            case 'emojis': this.renderCustomEmojis(); break;
            case 'settings': this.renderSettings(); break;
            case 'database': this.renderDatabaseIds(); break;
        }
    },
    
    // ===== DASHBOARD =====
    renderDashboard() {
        document.getElementById('stat-users').textContent = this.state.stats.totalUsers || this.state.users.length || 0;
        document.getElementById('stat-orders').textContent = this.state.stats.totalOrders || this.state.orders.length || 0;
        document.getElementById('stat-revenue').textContent = this.state.stats.totalRevenue || 0;
        document.getElementById('stat-pending').textContent = this.state.stats.pendingOrders || this.state.orders.filter(o => o.status === 'pending').length || 0;
        
        const processingEl = document.getElementById('stat-processing');
        const queuedEl = document.getElementById('stat-queued');
        if (processingEl) processingEl.textContent = this.state.orders.filter(o => o.status === 'processing').length || 0;
        if (queuedEl) queuedEl.textContent = this.state.orders.filter(o => o.status === 'queued').length || 0;
        
        this.renderRecentOrders();
        this.renderRecentTopups();
    },
    
    async refreshApiBalance() {
        try {
            const result = await G2BulkAPI.getBalance();
            if (result && result.balance) {
                this.state.g2bulkBalance = result;
                const balanceText = `$${parseFloat(result.balance).toFixed(4)} ${result.currency || 'USD'}`;
                const displayEl = document.getElementById('api-balance-value');
                const g2bulkDisplayEl = document.getElementById('g2bulk-balance-display');
                if (displayEl) displayEl.textContent = balanceText;
                if (g2bulkDisplayEl) g2bulkDisplayEl.textContent = balanceText;
            }
        } catch (error) {
            console.error('API balance error:', error);
            const displayEl = document.getElementById('api-balance-value');
            if (displayEl) displayEl.textContent = 'Error loading';
        }
    },
    
    renderRecentOrders() {
        const container = document.getElementById('recent-orders');
        if (!container) return;
        const recent = [...this.state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent.length === 0) { container.innerHTML = '<p class="empty-text">No orders yet</p>'; return; }
        container.innerHTML = recent.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `<div class="recent-item"><img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User"><div class="recent-item-info"><h4>${user?.firstName || 'User'}</h4><p>${order.productName}</p></div><div class="recent-item-right"><span class="recent-item-amount">${Utils.formatCurrency(order.amount, order.currency)}</span><span class="status-badge-sm ${order.status}">${order.status}</span></div></div>`;
        }).join('');
    },
    
    renderRecentTopups() {
        const container = document.getElementById('recent-topups');
        if (!container) return;
        const recent = [...this.state.topups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent.length === 0) { container.innerHTML = '<p class="empty-text">No top-ups yet</p>'; return; }
        container.innerHTML = recent.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `<div class="recent-item"><img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User"><div class="recent-item-info"><h4>${user?.firstName || 'User'}</h4><p>${topup.paymentMethod}</p></div><span class="recent-item-amount positive">+${Utils.formatCurrency(topup.amount, 'MMK')}</span></div>`;
        }).join('');
    },
    
    getAvatar(id) {
        return `https://ui-avatars.com/api/?name=${id}&background=8b5cf6&color=fff&size=100`;
    },
    
    // ===== USERS =====
    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        if (this.state.users.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No users yet</td></tr>'; return; }
        tbody.innerHTML = this.state.users.map(user => `<tr>
            <td><div class="user-cell"><img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}"><div class="user-cell-info"><h4>${user.firstName} ${user.lastName || ''}</h4><p>@${user.username || 'N/A'}</p></div></div></td>
            <td><code>${user.telegramId}</code></td>
            <td><strong>${Utils.formatCurrency(user.balance, 'MMK')}</strong></td>
            <td>${user.totalOrders || 0} orders</td>
            <td>${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Premium</span>' : '<span class="badge standard">Standard</span>'}</td>
            <td>${Utils.timeAgo(user.joinedAt)}</td>
            <td><div class="action-buttons">
                <button class="action-btn view" onclick="AdminApp.viewUserDetails('${user.telegramId}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="AdminApp.editUserBalance('${user.telegramId}')" title="Edit Balance"><i class="fas fa-wallet"></i></button>
                <button class="action-btn delete" onclick="AdminApp.banUserPrompt('${user.telegramId}')" title="Ban"><i class="fas fa-ban"></i></button>
            </div></td>
        </tr>`).join('');
    },
    
    async viewUserDetails(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        const content = document.getElementById('user-details-content');
        content.innerHTML = `<div class="user-details-header"><img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}"><div class="user-details-info"><h3>${user.firstName} ${user.lastName || ''}</h3><p>@${user.username || 'N/A'} • ID: ${user.telegramId}</p>${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Telegram Premium</span>' : ''}</div></div>
        <div class="user-stats-row"><div class="user-stat-box"><span class="stat-value">${Utils.formatCurrency(user.balance, '')}</span><span class="stat-label">Balance</span></div><div class="user-stat-box"><span class="stat-value">${user.totalOrders || 0}</span><span class="stat-label">Orders</span></div><div class="user-stat-box"><span class="stat-value">${Utils.formatCurrency(user.totalSpent || 0, '')}</span><span class="stat-label">Spent</span></div></div>
        <div class="user-info-grid"><div class="info-item"><span>Joined:</span> <strong>${Utils.formatDate(user.joinedAt, 'long')}</strong></div><div class="info-item"><span>Last Active:</span> <strong>${Utils.formatDate(user.lastActive, 'long')}</strong></div></div>
        <div class="user-actions-row"><button class="btn btn-primary" onclick="AdminApp.editUserBalance('${user.telegramId}')"><i class="fas fa-wallet"></i> Edit Balance</button><button class="btn btn-danger" onclick="AdminApp.banUserPrompt('${user.telegramId}')"><i class="fas fa-ban"></i> Ban User</button></div>`;
        document.getElementById('user-details-modal').classList.remove('hidden');
    },
    
    async editUserBalance(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        const newBalance = prompt(`Current balance: ${Utils.formatCurrency(user.balance, 'MMK')}\n\nEnter new balance:`);
        if (newBalance !== null && newBalance !== '' && !isNaN(newBalance)) {
            Utils.showLoading('Updating balance...');
            try {
                await Database.updateUserBalance(telegramId, parseFloat(newBalance), 'set');
                await this.loadAdminData(); this.renderUsers(); this.closeUserDetails();
                Utils.showToast('Balance updated!', 'success');
            } catch (error) { Utils.showToast('Failed to update balance', 'error'); }
            finally { Utils.hideLoading(); }
        }
    },
    
    async banUserPrompt(telegramId) {
        if (confirm('Are you sure you want to ban this user?')) {
            const reason = prompt('Enter ban reason:') || 'Violated terms of service';
            Utils.showLoading('Banning user...');
            try {
                const user = this.state.users.find(u => u.telegramId === telegramId);
                await Database.banUser(user, reason);
                await TelegramBot.notifyBan(telegramId, reason);
                await this.loadAdminData(); this.renderUsers(); this.closeUserDetails();
                Utils.showToast('User banned', 'success');
            } catch (error) { Utils.showToast('Failed to ban user', 'error'); }
            finally { Utils.hideLoading(); }
        }
    },
    
    closeUserDetails() { document.getElementById('user-details-modal').classList.add('hidden'); },
    
    // ===== ORDERS =====
    renderOrders() {
        const container = document.getElementById('admin-orders-list');
        if (!container) return;
        let filtered = [...this.state.orders];
        if (this.state.ordersFilter !== 'all') filtered = filtered.filter(o => o.status === this.state.ordersFilter);
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders found</p></div>'; return; }
        container.innerHTML = filtered.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `<div class="order-card"><div class="order-header"><div class="order-user"><img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User"><div><h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4><p>@${user?.username || 'N/A'}</p></div></div><span class="status-badge ${order.status}">${order.status}</span></div>
            <div class="order-body"><div class="order-info-row"><span>Order ID:</span><strong>${order.orderId}</strong></div><div class="order-info-row"><span>Product:</span><strong>${order.productName}</strong></div><div class="order-info-row"><span>Amount:</span><strong class="amount">${Utils.formatCurrency(order.amount, order.currency)}</strong></div><div class="order-info-row"><span>Category:</span><strong>${order.categoryName || 'N/A'}</strong></div>
            ${order.serviceId ? `<div class="order-info-row"><span>Service ID:</span><strong>#${order.serviceId}</strong></div>` : ''}
            ${order.apiOrderId ? `<div class="order-info-row api-row"><span>API Order:</span><strong>#${order.apiOrderId}</strong></div>` : ''}
            ${order.apiStatus ? `<div class="order-info-row"><span>API Status:</span><strong>${order.apiStatus}</strong></div>` : ''}
            ${order.link ? `<div class="order-info-row"><span>Game Link:</span><strong>${order.link}</strong></div>` : ''}
            ${order.apiError ? `<div class="order-info-row error-row"><span>Error:</span><strong>${order.apiError}</strong></div>` : ''}
            ${order.inputValues ? `<div class="order-inputs"><span>Input Values:</span><ul>${Object.entries(order.inputValues).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul></div>` : ''}
            <div class="order-date"><i class="fas fa-clock"></i> ${Utils.formatDate(order.createdAt, 'long')}</div></div>
            <div class="order-actions">
                ${order.status === 'pending' ? `<button class="btn btn-success" onclick="AdminApp.approveOrder('${order.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectOrder('${order.id}')"><i class="fas fa-times"></i> Reject</button>` : ''}
                ${order.status === 'processing' && order.apiOrderId ? `<button class="btn btn-info" onclick="AdminApp.checkOrderApiStatus('${order.id}')"><i class="fas fa-sync-alt"></i> Check Status</button>` : ''}
                ${order.status === 'queued' ? `<button class="btn btn-warning" onclick="AdminApp.retryQueuedOrder('${order.id}')"><i class="fas fa-redo"></i> Retry</button><button class="btn btn-danger" onclick="AdminApp.cancelQueuedOrder('${order.id}')"><i class="fas fa-times"></i> Cancel & Refund</button>` : ''}
            </div></div>`;
        }).join('');
    },
    
    filterOrders(filter) {
        this.state.ordersFilter = filter;
        document.querySelectorAll('#admin-page-orders .filter-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderOrders();
    },
    
    async approveOrder(orderId) {
        if (!confirm('Approve this order?')) return;
        Utils.showLoading('Approving...');
        try { const order = await Database.updateOrderStatus(orderId, 'approved', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyOrderStatus(order, 'approved'); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Order approved!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async rejectOrder(orderId) {
        if (!confirm('Reject this order? Amount will be refunded.')) return;
        Utils.showLoading('Rejecting...');
        try { const order = await Database.updateOrderStatus(orderId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyOrderStatus(order, 'rejected'); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Order rejected & refunded', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async checkOrderApiStatus(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order || !order.apiOrderId) return;
        Utils.showLoading('Checking...');
        try {
            const result = await G2BulkAPI.checkStatus(order.apiOrderId);
            if (result && !result.error) {
                let newStatus = order.status;
                if (result.status === 'Completed') newStatus = 'completed';
                else if (result.status === 'Canceled' || result.status === 'Refunded') newStatus = 'failed';
                else if (result.status === 'Partial') newStatus = 'partial';
                await Database.updateOrderApiStatus(order.id, { apiStatus: result.status, status: newStatus, apiCharge: result.charge || null });
                await this.loadAdminData(); this.renderOrders(); Utils.showToast(`API Status: ${result.status}`, 'success');
            } else { Utils.showToast('API Error: ' + (result?.error || 'Unknown'), 'error'); }
        } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async retryQueuedOrder(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) return;
        Utils.showLoading('Retrying...');
        try {
            const apiResult = await G2BulkAPI.placeOrder(order.serviceId, order.link, 1);
            if (apiResult && apiResult.order) { await Database.updateOrderApiStatus(order.id, { apiOrderId: apiResult.order, apiStatus: 'Processing', status: 'processing', apiError: null }); Utils.showToast('✅ Order is now processing!', 'success'); }
            else { Utils.showToast('❌ Retry failed: ' + (apiResult?.error || 'Unknown'), 'error'); }
            await this.loadAdminData(); this.renderOrders();
        } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async cancelQueuedOrder(orderId) {
        if (!confirm('Cancel and refund?')) return;
        Utils.showLoading('Canceling...');
        try { await Database.updateOrderApiStatus(orderId, { apiStatus: 'Canceled', status: 'failed', apiError: 'Canceled by admin' }); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Order canceled & refunded', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    
    // ===== TOPUPS =====
    renderTopups() {
        const container = document.getElementById('admin-topups-list');
        if (!container) return;
        let filtered = [...this.state.topups];
        if (this.state.topupsFilter !== 'all') filtered = filtered.filter(t => t.status === this.state.topupsFilter);
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><p>No top-ups found</p></div>'; return; }
        container.innerHTML = filtered.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `<div class="topup-card"><div class="topup-header"><div class="topup-user"><img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User"><div><h4>${user?.firstName || 'User'}</h4><p>@${user?.username || 'N/A'}</p></div></div><span class="status-badge ${topup.status}">${topup.status}</span></div>
            <div class="topup-body"><div class="topup-amount"><span>Amount</span><strong>${Utils.formatCurrency(topup.amount, 'MMK')}</strong></div><div class="topup-method"><span>Payment</span><strong>${topup.paymentMethod}</strong></div><div class="topup-date"><i class="fas fa-clock"></i> ${Utils.formatDate(topup.createdAt, 'long')}</div>
            ${topup.proofImage ? `<div class="topup-proof"><img src="${topup.proofImage}" alt="Proof" onclick="window.open('${topup.proofImage}', '_blank')"></div>` : ''}</div>
            ${topup.status === 'pending' ? `<div class="topup-actions"><button class="btn btn-success" onclick="AdminApp.approveTopup('${topup.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectTopup('${topup.id}')"><i class="fas fa-times"></i> Reject</button></div>` : ''}</div>`;
        }).join('');
    },
    filterTopups(filter) { this.state.topupsFilter = filter; document.querySelectorAll('#admin-page-topups .filter-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); this.renderTopups(); },
    async approveTopup(topupId) {
        if (!confirm('Approve?')) return; Utils.showLoading('Approving...');
        try { const topup = await Database.updateTopupStatus(topupId, 'approved', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyTopupStatus(topup, 'approved'); await this.loadAdminData(); this.renderTopups(); Utils.showToast('Approved!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async rejectTopup(topupId) {
        if (!confirm('Reject?')) return; Utils.showLoading('Rejecting...');
        try { const topup = await Database.updateTopupStatus(topupId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyTopupStatus(topup, 'rejected'); await this.loadAdminData(); this.renderTopups(); Utils.showToast('Rejected', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    
    // ===== CATEGORIES =====
    renderCategories() {
        const container = document.getElementById('admin-categories-list');
        if (!container) return;
        if (this.state.categories.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-th-large"></i><p>No categories yet</p></div>'; return; }
        container.innerHTML = this.state.categories.map(cat => `<div class="category-card"><div class="category-icon"><img src="${cat.icon}" alt="${cat.name}">${cat.flag ? `<span class="category-flag">${cat.flag}</span>` : ''}</div><div class="category-info"><h4>${cat.name}</h4><p>${cat.totalSold || 0} sold</p>${cat.hasDiscount ? '<span class="discount-badge">Has Discount</span>' : ''}</div><div class="category-actions"><button class="action-btn edit" onclick="AdminApp.editCategory('${cat.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
    },
    showAddCategory() { this.state.editingItem = null; document.getElementById('category-name').value = ''; document.getElementById('category-flag').value = ''; document.getElementById('has-discount').checked = false; document.getElementById('category-icon').value = ''; document.getElementById('category-icon-preview').innerHTML = ''; document.getElementById('category-icon-preview').classList.add('hidden'); document.getElementById('add-category-modal').classList.remove('hidden'); },
    editCategory(categoryId) { const cat = this.state.categories.find(c => c.id === categoryId); if (!cat) return; this.state.editingItem = cat; document.getElementById('category-name').value = cat.name; document.getElementById('category-flag').value = cat.flag || ''; document.getElementById('has-discount').checked = cat.hasDiscount; if (cat.icon) { document.getElementById('category-icon-preview').innerHTML = `<img src="${cat.icon}" alt="Icon">`; document.getElementById('category-icon-preview').classList.remove('hidden'); } document.getElementById('add-category-modal').classList.remove('hidden'); },
    closeAddCategory() { document.getElementById('add-category-modal').classList.add('hidden'); this.state.editingItem = null; },
    async saveCategory() {
        const name = document.getElementById('category-name').value.trim(); const flag = document.getElementById('category-flag').value; const hasDiscount = document.getElementById('has-discount').checked; const iconInput = document.getElementById('category-icon');
        if (!name) { Utils.showToast('Enter category name', 'warning'); return; }
        Utils.showLoading('Saving...');
        try { let icon = this.state.editingItem?.icon || ''; if (iconInput.files[0]) icon = await Utils.compressImage(iconInput.files[0], 200, 0.8); if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; } const data = { name, flag, hasDiscount, icon }; if (this.state.editingItem) { await Database.updateCategory(this.state.editingItem.id, data); } else { await Database.createCategory(data); } await this.loadAdminData(); this.renderCategories(); this.closeAddCategory(); Utils.showToast('Saved!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    async deleteCategory(categoryId) { if (!confirm('Delete this category and all products?')) return; Utils.showLoading('Deleting...'); try { await Database.deleteCategory(categoryId); await this.loadAdminData(); this.renderCategories(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== PRODUCTS =====
    renderProducts() {
        const container = document.getElementById('admin-products-list'); const filterSelect = document.getElementById('filter-category'); if (!container) return;
        if (filterSelect) { const val = filterSelect.value; filterSelect.innerHTML = '<option value="all">All Categories</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); filterSelect.value = val || 'all'; }
        let filtered = [...this.state.products]; if (filterSelect && filterSelect.value !== 'all') filtered = filtered.filter(p => p.categoryId === filterSelect.value);
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><p>No products yet</p></div>'; return; }
        container.innerHTML = filtered.map(product => { const cat = this.state.categories.find(c => c.id === product.categoryId); return `<div class="product-card"><div class="product-icon"><img src="${product.icon}" alt="${product.name}">${product.discount > 0 ? `<span class="discount-tag">-${product.discount}%</span>` : ''}</div><div class="product-info"><h4>${product.name}</h4><p>${cat?.name || 'Unknown'}</p><div class="product-price">${product.discount > 0 ? `<span class="original">${Utils.formatCurrency(product.price, product.currency)}</span>` : ''}<span class="current">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</span></div>${product.serviceId ? `<p class="product-api-info"><i class="fas fa-bolt"></i> Service #${product.serviceId}</p>` : '<p class="product-manual"><i class="fas fa-hand-paper"></i> Manual</p>'}</div><div class="product-actions"><button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button></div></div>`; }).join('');
    },
    showAddProduct() { this.state.editingItem = null; document.getElementById('product-modal-title').textContent = 'Add Product'; document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); ['product-name','product-price','product-discount','product-service-id','product-g2bulk-rate','product-g2bulk-min','product-g2bulk-max'].forEach(id => document.getElementById(id).value = ''); document.getElementById('product-currency').value = 'MMK'; document.getElementById('product-delivery').value = 'instant'; document.getElementById('product-icon').value = ''; document.getElementById('product-icon-preview').innerHTML = ''; document.getElementById('product-icon-preview').classList.add('hidden'); document.getElementById('service-lookup-result').classList.add('hidden'); document.getElementById('add-product-modal').classList.remove('hidden'); },
    editProduct(productId) { const product = this.state.products.find(p => p.id === productId); if (!product) return; this.state.editingItem = product; document.getElementById('product-modal-title').textContent = 'Edit Product'; document.getElementById('product-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${c.name}</option>`).join(''); document.getElementById('product-name').value = product.name; document.getElementById('product-price').value = product.price; document.getElementById('product-currency').value = product.currency; document.getElementById('product-discount').value = product.discount || ''; document.getElementById('product-delivery').value = product.deliveryTime; document.getElementById('product-service-id').value = product.serviceId || ''; document.getElementById('product-g2bulk-rate').value = product.g2bulkRate || ''; document.getElementById('product-g2bulk-min').value = product.g2bulkMin || ''; document.getElementById('product-g2bulk-max').value = product.g2bulkMax || ''; if (product.icon) { document.getElementById('product-icon-preview').innerHTML = `<img src="${product.icon}" alt="Icon">`; document.getElementById('product-icon-preview').classList.remove('hidden'); } document.getElementById('add-product-modal').classList.remove('hidden'); },
    closeAddProduct() { document.getElementById('add-product-modal').classList.add('hidden'); this.state.editingItem = null; },
    async lookupServiceId() {
        const serviceId = document.getElementById('product-service-id').value; if (!serviceId) { Utils.showToast('Enter Service ID', 'warning'); return; }
        const resultDiv = document.getElementById('service-lookup-result'); resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...'; resultDiv.classList.remove('hidden');
        try { if (this.state.g2bulkServicesRaw.length === 0) { const r = await G2BulkAPI.getServices(); this.state.g2bulkServicesRaw = r || []; } const service = this.state.g2bulkServicesRaw.find(s => String(s.service) === String(serviceId));
            if (service) { resultDiv.innerHTML = `<div class="service-found"><i class="fas fa-check-circle"></i><div><strong>${service.name}</strong><br>Rate: $${service.rate} | Min: ${service.min} | Max: ${service.max}</div></div>`; resultDiv.className = 'service-lookup-result valid'; document.getElementById('product-g2bulk-rate').value = service.rate; document.getElementById('product-g2bulk-min').value = service.min; document.getElementById('product-g2bulk-max').value = service.max; if (!document.getElementById('product-name').value) document.getElementById('product-name').value = service.name; }
            else { resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Not found'; resultDiv.className = 'service-lookup-result invalid'; }
        } catch (error) { resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed'; resultDiv.className = 'service-lookup-result error'; }
    },
    async openG2BulkServiceBrowser() { document.getElementById('g2bulk-browser-modal').classList.remove('hidden'); if (this.state.g2bulkServicesRaw.length === 0) { document.getElementById('g2bulk-browser-list').innerHTML = '<p>Loading...</p>'; try { const r = await G2BulkAPI.getServices(); this.state.g2bulkServicesRaw = r || []; } catch (e) { document.getElementById('g2bulk-browser-list').innerHTML = '<p>Failed</p>'; return; } } this.renderBrowserServices(this.state.g2bulkServicesRaw.slice(0, 50)); },
    closeG2BulkBrowser() { document.getElementById('g2bulk-browser-modal').classList.add('hidden'); },
    renderBrowserServices(services) { const c = document.getElementById('g2bulk-browser-list'); if (services.length === 0) { c.innerHTML = '<p>No services found</p>'; return; } c.innerHTML = services.slice(0, 100).map(s => `<div class="g2bulk-browser-item" onclick="AdminApp.selectBrowserService(${s.service})"><div class="service-id">#${s.service}</div><div class="service-info"><strong>${s.name}</strong><br><small>$${s.rate} | Min: ${s.min} | Max: ${s.max}</small></div><button class="btn btn-sm btn-primary"><i class="fas fa-check"></i></button></div>`).join(''); },
    filterBrowserServices() { const q = document.getElementById('g2bulk-browser-search').value.toLowerCase(); const f = this.state.g2bulkServicesRaw.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q)); this.renderBrowserServices(f); },
    selectBrowserService(serviceId) { const s = this.state.g2bulkServicesRaw.find(sv => sv.service === serviceId); if (!s) return; document.getElementById('product-service-id').value = s.service; document.getElementById('product-g2bulk-rate').value = s.rate; document.getElementById('product-g2bulk-min').value = s.min; document.getElementById('product-g2bulk-max').value = s.max; if (!document.getElementById('product-name').value) document.getElementById('product-name').value = s.name; this.closeG2BulkBrowser(); Utils.showToast(`Selected: #${s.service}`, 'success'); },
    async saveProduct() {
        const categoryId = document.getElementById('product-category').value; const name = document.getElementById('product-name').value.trim(); const price = parseFloat(document.getElementById('product-price').value); const currency = document.getElementById('product-currency').value; const discount = parseInt(document.getElementById('product-discount').value) || 0; const deliveryTime = document.getElementById('product-delivery').value; const serviceId = document.getElementById('product-service-id').value; const g2bulkRate = document.getElementById('product-g2bulk-rate').value; const g2bulkMin = document.getElementById('product-g2bulk-min').value; const g2bulkMax = document.getElementById('product-g2bulk-max').value; const iconInput = document.getElementById('product-icon');
        if (!categoryId || !name || isNaN(price)) { Utils.showToast('Fill required fields', 'warning'); return; }
        Utils.showLoading('Saving...');
        try { let icon = this.state.editingItem?.icon || ''; if (iconInput.files[0]) { const fd = new FormData(); fd.append('image', iconInput.files[0]); const r = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Upload failed'); icon = res.data.url; } if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; }
            const data = { categoryId, name, price, currency, discount, deliveryTime, icon, serviceId: serviceId ? parseInt(serviceId) : null, g2bulkRate: g2bulkRate || null, g2bulkMin: g2bulkMin ? parseInt(g2bulkMin) : null, g2bulkMax: g2bulkMax ? parseInt(g2bulkMax) : null };
            if (this.state.editingItem) { await Database.updateProduct(this.state.editingItem.id, data); } else { await Database.createProduct(data); }
            await this.loadAdminData(); this.renderProducts(); this.closeAddProduct(); Utils.showToast('Saved!', 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); } finally { Utils.hideLoading(); }
    },
    async deleteProduct(productId) { if (!confirm('Delete?')) return; Utils.showLoading('Deleting...'); try { await Database.deleteProduct(productId); await this.loadAdminData(); this.renderProducts(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== G2BULK SERVICES PAGE =====
    renderG2BulkPage() { this.refreshApiBalance(); if (this.state.g2bulkServicesRaw.length > 0) this.renderG2BulkServicesList(this.state.g2bulkServicesRaw); },
    async refreshG2BulkServices() {
        Utils.showLoading('Loading services...');
        try { const r = await G2BulkAPI.getServices(); this.state.g2bulkServicesRaw = r || []; const cats = [...new Set(this.state.g2bulkServicesRaw.map(s => s.category).filter(Boolean))].sort(); this.state.g2bulkCategories = cats; const cf = document.getElementById('g2bulk-category-filter'); if (cf) cf.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join(''); this.renderG2BulkServicesList(this.state.g2bulkServicesRaw); Utils.showToast(`Loaded ${this.state.g2bulkServicesRaw.length} services`, 'success'); }
        catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); } finally { Utils.hideLoading(); }
    },
    filterG2BulkServices() { const q = (document.getElementById('g2bulk-search')?.value || '').toLowerCase(); const cf = document.getElementById('g2bulk-category-filter')?.value || 'all'; let f = [...this.state.g2bulkServicesRaw]; if (cf !== 'all') f = f.filter(s => s.category === cf); if (q) f = f.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q)); this.renderG2BulkServicesList(f); },
    renderG2BulkServicesList(services) {
        const c = document.getElementById('g2bulk-services-list'); const ce = document.getElementById('g2bulk-services-count');
        if (ce) ce.textContent = `${services.length} services found`;
        if (services.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No services found</p></div>'; return; }
        c.innerHTML = services.slice(0, 200).map(s => `<div class="g2bulk-service-card"><div class="service-header"><span class="service-id-badge">#${s.service}</span><span class="service-category-badge">${s.category || 'N/A'}</span></div><div class="service-name">${s.name}</div><div class="service-details"><div class="service-detail"><span>Rate:</span><strong>$${s.rate}</strong></div><div class="service-detail"><span>Min:</span><strong>${s.min}</strong></div><div class="service-detail"><span>Max:</span><strong>${s.max}</strong></div></div><button class="btn btn-primary btn-sm btn-full" onclick="AdminApp.quickAddProduct(${s.service})"><i class="fas fa-plus"></i> Add as Product</button></div>`).join('');
    },
    quickAddProduct(serviceId) { const s = this.state.g2bulkServicesRaw.find(sv => sv.service === serviceId); if (!s) return; this.showAddProduct(); document.getElementById('product-service-id').value = s.service; document.getElementById('product-name').value = s.name; document.getElementById('product-g2bulk-rate').value = s.rate; document.getElementById('product-g2bulk-min').value = s.min; document.getElementById('product-g2bulk-max').value = s.max; },
    
    // ===== BANNERS =====
    renderBanners() { this.renderBannerType(this.state.currentBannerType); },
    renderBannerType(type) { this.state.currentBannerType = type; document.querySelectorAll('.banner-tabs .tab-btn').forEach(b => b.classList.remove('active')); const at = document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`); if (at) at.classList.add('active'); document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1'); document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2'); const banners = type === 'type1' ? (this.state.banners.type1 || []) : (this.state.banners.type2 || []); const c = document.getElementById(`banners-${type}-list`); if (!c) return; if (banners.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No banners</p></div>'; return; } c.innerHTML = banners.map(b => { const cat = type === 'type2' ? this.state.categories.find(ca => ca.id === b.categoryId) : null; return `<div class="banner-card"><img src="${b.image}" alt="Banner"><div class="banner-info">${cat ? `<p><strong>Category:</strong> ${cat.name}</p>` : ''}${b.description ? `<p>${b.description.substring(0, 100)}...</p>` : ''}<p class="date">${Utils.formatDate(b.createdAt)}</p></div><button class="btn btn-danger btn-sm" onclick="AdminApp.deleteBanner('${b.id}', '${type}')"><i class="fas fa-trash"></i></button></div>`; }).join(''); },
    showAddBanner(type) { this.state.currentBannerType = type; document.getElementById('banner-category-group').style.display = type === 'type2' ? 'block' : 'none'; document.getElementById('banner-text-group').style.display = type === 'type2' ? 'block' : 'none'; if (type === 'type2') document.getElementById('banner-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); document.getElementById('banner-image').value = ''; document.getElementById('banner-text').value = ''; document.getElementById('banner-image-preview').innerHTML = ''; document.getElementById('banner-image-preview').classList.add('hidden'); document.getElementById('add-banner-modal').classList.remove('hidden'); },
    closeAddBanner() { document.getElementById('add-banner-modal').classList.add('hidden'); },
    async saveBanner() { const type = this.state.currentBannerType; const imageInput = document.getElementById('banner-image'); const categoryId = document.getElementById('banner-category')?.value; const description = document.getElementById('banner-text')?.value; if (!imageInput.files[0]) { Utils.showToast('Upload image', 'warning'); return; } if (type === 'type2' && !categoryId) { Utils.showToast('Select category', 'warning'); return; } Utils.showLoading('Uploading...'); try { const fd = new FormData(); fd.append('image', imageInput.files[0]); const r = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Upload failed'); const data = { image: res.data.url }; if (type === 'type2') { data.categoryId = categoryId; data.description = description; } await Database.createBanner(data, type); await this.loadAdminData(); this.renderBanners(); this.closeAddBanner(); Utils.showToast('Created!', 'success'); } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); } finally { Utils.hideLoading(); } },
    async deleteBanner(bannerId, type) { if (!confirm('Delete?')) return; Utils.showLoading('Deleting...'); try { await Database.deleteBanner(bannerId, type); await this.loadAdminData(); this.renderBanners(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== INPUT TABLES (COMPLETELY REWRITTEN - Auto Game ID Checker) =====
    
    renderInputTables() {
        const container = document.getElementById('admin-input-tables-list');
        if (!container) return;
        if (this.state.inputTables.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-keyboard"></i><p>No input tables yet</p></div>'; return; }
        
        container.innerHTML = this.state.inputTables.map(table => {
            const cat = this.state.categories.find(c => c.id === table.categoryId);
            
            // Detect game preset
            let gameInfo = '';
            if (table.checkerEnabled && table.checkerConfig) {
                let config = table.checkerConfig;
                if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) {} }
                
                if (config?._preset) {
                    gameInfo = `
                        <div class="checker-game-badge">
                            <span class="game-icon">${config._preset.gameIcon}</span>
                            <span class="game-name">${config._preset.gameName}</span>
                            <span class="checker-active-badge"><i class="fas fa-check-circle"></i> Auto Checker</span>
                        </div>
                    `;
                } else if (config) {
                    gameInfo = `
                        <div class="checker-game-badge custom">
                            <span class="game-icon">🔧</span>
                            <span class="game-name">Custom API Checker</span>
                            <span class="checker-active-badge"><i class="fas fa-check-circle"></i> Active</span>
                        </div>
                    `;
                }
            }
            
            return `<div class="input-table-card">
                <div class="input-table-icon"><i class="fas fa-keyboard"></i></div>
                <div class="input-table-info">
                    <h4>${table.name}</h4>
                    <p>${cat?.name || 'Unknown'}</p>
                    <p class="placeholder">"${table.placeholder}"</p>
                    ${gameInfo}
                </div>
                <div class="input-table-actions">
                    <button class="action-btn edit" onclick="AdminApp.editInputTable('${table.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="AdminApp.deleteInputTable('${table.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    },
    
    // COMPLETELY REWRITTEN: Auto Game Checker Input Table
    showAddInputTable() {
        this.state.editingItem = null;
        this.state.selectedGamePreset = null;
        this.state.checkerMode = 'preset';
        
        document.getElementById('input-table-modal-title').textContent = 'Add Input Table';
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('checker-enabled').checked = false;
        
        // Build checker section dynamically
        this.buildCheckerSection();
        
        // Hide checker sections
        document.getElementById('checker-json-section').classList.add('hidden');
        document.getElementById('checker-test-section').classList.add('hidden');
        document.getElementById('checker-json-preview').classList.add('hidden');
        document.getElementById('checker-test-result').classList.add('hidden');
        
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    editInputTable(tableId) {
        const table = this.state.inputTables.find(t => t.id === tableId);
        if (!table) return;
        this.state.editingItem = table;
        
        document.getElementById('input-table-modal-title').textContent = 'Edit Input Table';
        document.getElementById('input-table-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}" ${c.id === table.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = table.name;
        document.getElementById('input-table-placeholder').value = table.placeholder;
        document.getElementById('checker-enabled').checked = table.checkerEnabled || false;
        
        this.buildCheckerSection();
        
        if (table.checkerEnabled && table.checkerConfig) {
            document.getElementById('checker-json-section').classList.remove('hidden');
            document.getElementById('checker-test-section').classList.remove('hidden');
            
            let config = table.checkerConfig;
            if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) {} }
            
            // Check if it's a preset
            if (config?._preset?.gameId) {
                this.state.selectedGamePreset = config._preset.gameId;
                this.state.checkerMode = 'preset';
                const gameSelect = document.getElementById('checker-game-select');
                if (gameSelect) gameSelect.value = config._preset.gameId;
                this.onGamePresetChange(config._preset.gameId);
            } else {
                this.state.checkerMode = 'custom';
                const modeToggle = document.getElementById('checker-mode-toggle');
                if (modeToggle) modeToggle.checked = true;
                this.toggleCheckerMode(true);
            }
            
            document.getElementById('checker-json-config').value = JSON.stringify(config, null, 2);
            this.previewCheckerConfig();
        } else {
            document.getElementById('checker-json-section').classList.add('hidden');
            document.getElementById('checker-test-section').classList.add('hidden');
        }
        
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    // Build the checker config section dynamically
    buildCheckerSection() {
        const section = document.getElementById('checker-json-section');
        if (!section) return;
        
        const apiKey = this.getRapidApiKey();
        const hasApiKey = !!apiKey;
        
        section.innerHTML = `
            <!-- API Key Status -->
            <div class="api-key-status ${hasApiKey ? 'connected' : 'missing'}">
                <div class="api-key-status-icon">
                    <i class="fas fa-${hasApiKey ? 'check-circle' : 'exclamation-triangle'}"></i>
                </div>
                <div class="api-key-status-info">
                    <strong>${hasApiKey ? 'RapidAPI Connected' : 'RapidAPI Key Required'}</strong>
                    <small>${hasApiKey ? 'Your API key is configured. Select a game below.' : 'Go to Settings to add your RapidAPI key first.'}</small>
                </div>
                ${!hasApiKey ? `<button class="btn btn-sm btn-primary" onclick="showAdminPage('settings');closeAddInputTable();">
                    <i class="fas fa-cog"></i> Go to Settings
                </button>` : ''}
            </div>

            ${hasApiKey ? `
            <!-- Mode Toggle -->
            <div class="checker-mode-toggle-group">
                <label class="mode-label ${this.state.checkerMode === 'preset' ? 'active' : ''}" onclick="AdminApp.toggleCheckerMode(false)">
                    <i class="fas fa-gamepad"></i> Auto (Select Game)
                </label>
                <label class="mode-label ${this.state.checkerMode === 'custom' ? 'active' : ''}" onclick="AdminApp.toggleCheckerMode(true)">
                    <i class="fas fa-code"></i> Custom JSON
                </label>
                <input type="checkbox" id="checker-mode-toggle" hidden ${this.state.checkerMode === 'custom' ? 'checked' : ''}>
            </div>

            <!-- AUTO MODE: Game Selector -->
            <div id="checker-auto-mode" class="${this.state.checkerMode === 'custom' ? 'hidden' : ''}">
                <div class="form-group">
                    <label><i class="fas fa-gamepad"></i> Select Game</label>
                    <select id="checker-game-select" onchange="AdminApp.onGamePresetChange(this.value)" class="game-select">
                        <option value="">-- Select a Game --</option>
                        ${GameCheckerPresets.games.map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('')}
                    </select>
                </div>
                
                <div id="game-preset-info" class="game-preset-info hidden"></div>
            </div>

            <!-- CUSTOM MODE: JSON Textarea -->
            <div id="checker-custom-mode" class="${this.state.checkerMode === 'preset' ? 'hidden' : ''}">
                <div class="form-group">
                    <label><i class="fas fa-code"></i> Custom JSON Config</label>
                    <textarea id="checker-json-config" class="code-textarea" rows="14" placeholder='Paste your custom checker JSON config here...' oninput="onCheckerJsonInput()"></textarea>
                    <div class="json-help-tags">
                        <span class="help-tag"><code>{{value}}</code> = This field's value</span>
                        <span class="help-tag"><code>{{Field Name}}</code> = Another input's value</span>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Preview (shared by both modes) -->
            <div id="checker-json-preview" class="checker-json-preview hidden"></div>
        `;
        
        // Add test section content
        const testSection = document.getElementById('checker-test-section');
        if (testSection) {
            testSection.innerHTML = `
                <div class="form-section-divider small">
                    <div class="divider-line"></div>
                    <span class="divider-text"><i class="fas fa-flask"></i> Test Checker</span>
                    <div class="divider-line"></div>
                </div>
                <div class="form-group">
                    <div class="test-checker-inputs">
                        <input type="text" id="checker-test-value" placeholder="Enter test Game ID">
                        <div id="checker-test-extra-inputs" class="test-extra-inputs hidden"></div>
                    </div>
                    <button class="btn btn-primary btn-sm test-run-btn" onclick="testChecker()">
                        <i class="fas fa-play"></i> Run Test
                    </button>
                </div>
                <div id="checker-test-result" class="checker-test-result hidden"></div>
            `;
        }
    },
    
    // Toggle between preset and custom mode
    toggleCheckerMode(isCustom) {
        this.state.checkerMode = isCustom ? 'custom' : 'preset';
        
        const autoMode = document.getElementById('checker-auto-mode');
        const customMode = document.getElementById('checker-custom-mode');
        const modeLabels = document.querySelectorAll('.mode-label');
        
        if (autoMode) autoMode.classList.toggle('hidden', isCustom);
        if (customMode) customMode.classList.toggle('hidden', !isCustom);
        
        modeLabels.forEach((label, i) => {
            label.classList.toggle('active', i === (isCustom ? 1 : 0));
        });
        
        // If switching to custom, populate with current preset config
        if (isCustom && this.state.selectedGamePreset) {
            const config = GameCheckerPresets.generateConfig(this.state.selectedGamePreset, this.getRapidApiKey());
            if (config) {
                const textarea = document.getElementById('checker-json-config');
                if (textarea) textarea.value = JSON.stringify(config, null, 2);
            }
        }
    },
    
    // Handle game preset selection
    onGamePresetChange(gameId) {
        this.state.selectedGamePreset = gameId;
        const infoDiv = document.getElementById('game-preset-info');
        const testExtraInputs = document.getElementById('checker-test-extra-inputs');
        
        if (!gameId || !infoDiv) {
            if (infoDiv) infoDiv.classList.add('hidden');
            if (testExtraInputs) { testExtraInputs.classList.add('hidden'); testExtraInputs.innerHTML = ''; }
            return;
        }
        
        const game = GameCheckerPresets.getGame(gameId);
        if (!game) return;
        
        // Auto-fill input name and placeholder from main field
        const mainField = game.fields.find(f => f.isMain);
        if (mainField) {
            const nameInput = document.getElementById('input-table-name');
            const phInput = document.getElementById('input-table-placeholder');
            if (nameInput && !nameInput.value) nameInput.value = mainField.name;
            if (phInput && !phInput.value) phInput.value = mainField.placeholder;
        }
        
        // Show game info
        const additionalFields = game.fields.filter(f => !f.isMain);
        infoDiv.innerHTML = `
            <div class="game-info-card">
                <div class="game-info-header">
                    <span class="game-big-icon">${game.icon}</span>
                    <div>
                        <h4>${game.name}</h4>
                        <span class="auto-configured-badge"><i class="fas fa-magic"></i> Auto Configured</span>
                    </div>
                </div>
                <div class="game-info-details">
                    <div class="game-info-item">
                        <i class="fas fa-check-circle"></i>
                        <span>Main Field: <strong>${mainField?.name || 'User ID'}</strong></span>
                    </div>
                    ${additionalFields.length > 0 ? `
                        <div class="game-info-item">
                            <i class="fas fa-plus-circle"></i>
                            <span>Also requires: <strong>${additionalFields.map(f => f.name).join(', ')}</strong></span>
                        </div>
                        <div class="game-info-note">
                            <i class="fas fa-info-circle"></i>
                            <span>Create separate input tables for additional fields (e.g., "${additionalFields[0].name}")</span>
                        </div>
                    ` : ''}
                    <div class="game-info-item">
                        <i class="fas fa-bolt"></i>
                        <span>Verifies: <strong>Nickname + Country</strong> automatically</span>
                    </div>
                </div>
            </div>
        `;
        infoDiv.classList.remove('hidden');
        
        // Generate and preview config
        const config = GameCheckerPresets.generateConfig(gameId, this.getRapidApiKey());
        if (config) {
            const previewDiv = document.getElementById('checker-json-preview');
            if (previewDiv) {
                previewDiv.innerHTML = `
                    <div class="json-preview-card">
                        <h4><i class="fas fa-check-circle" style="color:var(--success);"></i> Config Ready</h4>
                        <div class="preview-grid">
                            <div class="preview-item"><span class="preview-label">API</span><span class="preview-value">RapidAPI - Check ID Game</span></div>
                            <div class="preview-item"><span class="preview-label">Game</span><span class="preview-value">${game.icon} ${game.name}</span></div>
                            <div class="preview-item"><span class="preview-label">Method</span><span class="preview-value"><span class="method-badge post">POST</span></span></div>
                            <div class="preview-item"><span class="preview-label">Checks</span><span class="preview-value">✅ Nickname ✅ Country ✅ Valid/Invalid</span></div>
                        </div>
                    </div>
                `;
                previewDiv.classList.remove('hidden');
            }
        }
        
        // Update test extra inputs
        if (testExtraInputs) {
            if (additionalFields.length > 0) {
                testExtraInputs.innerHTML = additionalFields.map(f => `
                    <div class="test-extra-input">
                        <label>${f.name}</label>
                        <input type="text" id="checker-test-${f.bodyKey}" placeholder="Test ${f.name}">
                    </div>
                `).join('');
                testExtraInputs.classList.remove('hidden');
            } else {
                testExtraInputs.innerHTML = '';
                testExtraInputs.classList.add('hidden');
            }
        }
        
        // Show test section
        document.getElementById('checker-test-section')?.classList.remove('hidden');
    },
    
    // Preview custom JSON config
    previewCheckerConfig() {
        const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
        const previewDiv = document.getElementById('checker-json-preview');
        if (!jsonStr || !previewDiv) { if (previewDiv) previewDiv.classList.add('hidden'); return; }
        try {
            const config = JSON.parse(jsonStr);
            const url = config.url || config.apiUrl || 'N/A';
            const method = (config.method || 'POST').toUpperCase();
            const rp = config.responsePath || config.response || {};
            previewDiv.innerHTML = `<div class="json-preview-card"><h4><i class="fas fa-check-circle" style="color:var(--success);"></i> Valid JSON Config</h4><div class="preview-grid"><div class="preview-item"><span class="preview-label">URL</span><span class="preview-value url">${url}</span></div><div class="preview-item"><span class="preview-label">Method</span><span class="preview-value"><span class="method-badge ${method.toLowerCase()}">${method}</span></span></div><div class="preview-item"><span class="preview-label">Response</span><span class="preview-value">${rp.valid ? `Valid: <code>${rp.valid}</code>` : ''} ${rp.nickname ? `Nickname: <code>${rp.nickname}</code>` : ''} ${rp.country ? `Country: <code>${rp.country}</code>` : ''}</span></div></div></div>`;
            previewDiv.classList.remove('hidden');
            document.getElementById('checker-test-section')?.classList.remove('hidden');
        } catch (e) {
            previewDiv.innerHTML = `<div class="json-preview-card error"><h4><i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i> Invalid JSON</h4><p>${e.message}</p></div>`;
            previewDiv.classList.remove('hidden');
        }
    },
    
    closeAddInputTable() { document.getElementById('add-input-table-modal').classList.add('hidden'); this.state.editingItem = null; this.state.selectedGamePreset = null; },
    
    // SAVE INPUT TABLE - Auto generates config
    async saveInputTable() {
        const categoryId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const placeholder = document.getElementById('input-table-placeholder').value.trim();
        const checkerEnabled = document.getElementById('checker-enabled').checked;
        
        if (!categoryId || !name || !placeholder) { Utils.showToast('Fill all required fields', 'warning'); return; }
        
        let checkerConfig = null;
        
        if (checkerEnabled) {
            if (this.state.checkerMode === 'preset' && this.state.selectedGamePreset) {
                // AUTO MODE: Generate config from preset
                const apiKey = this.getRapidApiKey();
                if (!apiKey) { Utils.showToast('Please add RapidAPI key in Settings first!', 'warning'); return; }
                
                checkerConfig = GameCheckerPresets.generateConfig(this.state.selectedGamePreset, apiKey);
                if (!checkerConfig) { Utils.showToast('Failed to generate config', 'error'); return; }
                
            } else {
                // CUSTOM MODE: Parse JSON
                const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
                if (!jsonStr) { Utils.showToast('Enter checker JSON config', 'warning'); return; }
                try {
                    checkerConfig = JSON.parse(jsonStr);
                    if (!checkerConfig.url && !checkerConfig.apiUrl) { Utils.showToast('Config must have "url"', 'warning'); return; }
                } catch (e) { Utils.showToast('Invalid JSON: ' + e.message, 'error'); return; }
            }
        }
        
        Utils.showLoading('Saving...');
        try {
            const data = { categoryId, name, placeholder, checkerEnabled, checkerConfig };
            if (this.state.editingItem) { await Database.updateInputTable(this.state.editingItem.id, data); }
            else { await Database.createInputTable(data); }
            await this.loadAdminData(); this.renderInputTables(); this.closeAddInputTable();
            Utils.showToast('Saved!', 'success');
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteInputTable(tableId) { if (!confirm('Delete?')) return; Utils.showLoading('Deleting...'); try { await Database.deleteInputTable(tableId); await this.loadAdminData(); this.renderInputTables(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // TEST CHECKER - Works with both preset and custom
    async testChecker() {
        const testValue = document.getElementById('checker-test-value')?.value?.trim();
        if (!testValue) { Utils.showToast('Enter test ID', 'warning'); return; }
        
        const resultDiv = document.getElementById('checker-test-result');
        resultDiv.innerHTML = `<div class="test-result-card loading"><div class="checker-loading-content"><div class="checker-spinner"></div><span>Verifying Game ID...</span></div></div>`;
        resultDiv.classList.remove('hidden');
        
        try {
            let config;
            
            if (this.state.checkerMode === 'preset' && this.state.selectedGamePreset) {
                config = GameCheckerPresets.generateConfig(this.state.selectedGamePreset, this.getRapidApiKey());
            } else {
                const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
                if (!jsonStr) { resultDiv.innerHTML = '<div class="test-result-card error">No config</div>'; return; }
                try { config = JSON.parse(jsonStr); } catch(e) { resultDiv.innerHTML = `<div class="test-result-card error">Invalid JSON: ${e.message}</div>`; return; }
            }
            
            if (!config) { resultDiv.innerHTML = '<div class="test-result-card error">No config generated</div>'; return; }
            
            // Build test input values for additional fields
            const testInputValues = {};
            if (this.state.selectedGamePreset) {
                const game = GameCheckerPresets.getGame(this.state.selectedGamePreset);
                if (game) {
                    game.fields.filter(f => !f.isMain).forEach(f => {
                        const el = document.getElementById(`checker-test-${f.bodyKey}`);
                        if (el) testInputValues[f.name] = el.value || '';
                    });
                }
            }
            
            const result = await GameIdChecker.check(config, testValue, testInputValues);
            
            if (result && result.valid) {
                let infoRows = '';
                if (result.nickname) infoRows += `<div class="test-info-row"><span>Nickname:</span><strong>${result.nickname}</strong></div>`;
                if (result.country) infoRows += `<div class="test-info-row"><span>Country:</span><strong>${CountryHelper.getDisplay(result.country)}</strong></div>`;
                
                resultDiv.innerHTML = `<div class="test-result-card valid">
                    <div class="test-result-header valid"><i class="fas fa-check-circle"></i> ✅ Account Found!</div>
                    <div class="test-result-body">${infoRows}
                        <details class="raw-response"><summary>Raw Response</summary><pre>${JSON.stringify(result.raw, null, 2)}</pre></details>
                    </div></div>`;
            } else {
                resultDiv.innerHTML = `<div class="test-result-card invalid">
                    <div class="test-result-header invalid"><i class="fas fa-times-circle"></i> ❌ Account Not Found</div>
                    <div class="test-result-body">${result?.error ? `<p>Error: ${result.error}</p>` : ''}
                        <details class="raw-response"><summary>Raw Response</summary><pre>${JSON.stringify(result?.raw || {}, null, 2)}</pre></details>
                    </div></div>`;
            }
        } catch (error) {
            resultDiv.innerHTML = `<div class="test-result-card error"><div class="test-result-header error"><i class="fas fa-exclamation-triangle"></i> Error</div><p>${error.message}</p></div>`;
        }
    },
    
    // ===== PAYMENTS =====
    renderPayments() { const c = document.getElementById('admin-payments-list'); if (!c) return; if (this.state.payments.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payment methods</p></div>'; return; } c.innerHTML = this.state.payments.map(p => `<div class="payment-card"><div class="payment-icon"><img src="${p.icon}" alt="${p.name}"></div><div class="payment-info"><h4>${p.name}</h4><p class="address">${p.address}</p><p class="account">${p.accountName}</p>${p.note ? `<p class="note">${p.note}</p>` : ''}</div><div class="payment-actions"><button class="action-btn edit" onclick="AdminApp.editPayment('${p.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deletePayment('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`).join(''); },
    showAddPayment() { this.state.editingItem = null; ['payment-name','payment-address','payment-account-name','payment-note'].forEach(id => document.getElementById(id).value = ''); document.getElementById('payment-icon').value = ''; document.getElementById('payment-icon-preview').innerHTML = ''; document.getElementById('payment-icon-preview').classList.add('hidden'); document.getElementById('add-payment-modal').classList.remove('hidden'); },
    editPayment(paymentId) { const p = this.state.payments.find(pm => pm.id === paymentId); if (!p) return; this.state.editingItem = p; document.getElementById('payment-name').value = p.name; document.getElementById('payment-address').value = p.address; document.getElementById('payment-account-name').value = p.accountName; document.getElementById('payment-note').value = p.note || ''; if (p.icon) { document.getElementById('payment-icon-preview').innerHTML = `<img src="${p.icon}" alt="Icon">`; document.getElementById('payment-icon-preview').classList.remove('hidden'); } document.getElementById('add-payment-modal').classList.remove('hidden'); },
    closeAddPayment() { document.getElementById('add-payment-modal').classList.add('hidden'); this.state.editingItem = null; },
    async savePayment() { const name = document.getElementById('payment-name').value.trim(); const address = document.getElementById('payment-address').value.trim(); const accountName = document.getElementById('payment-account-name').value.trim(); const note = document.getElementById('payment-note').value.trim(); const iconInput = document.getElementById('payment-icon'); if (!name || !address || !accountName) { Utils.showToast('Fill fields', 'warning'); return; } Utils.showLoading('Saving...'); try { let icon = this.state.editingItem?.icon || ''; if (iconInput.files[0]) icon = await Utils.compressImage(iconInput.files[0], 200, 0.8); if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; } const data = { name, address, accountName, note, icon }; if (this.state.editingItem) { await Database.updatePaymentMethod(this.state.editingItem.id, data); } else { await Database.createPaymentMethod(data); } await this.loadAdminData(); this.renderPayments(); this.closeAddPayment(); Utils.showToast('Saved!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async deletePayment(paymentId) { if (!confirm('Delete?')) return; Utils.showLoading('Deleting...'); try { await Database.deletePaymentMethod(paymentId); await this.loadAdminData(); this.renderPayments(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== ANNOUNCEMENTS =====
    renderAnnouncements() { const ta = document.getElementById('announcement-text'); const ct = document.getElementById('current-announcement-text'); if (ta) ta.value = ''; if (ct) ct.textContent = this.state.settings.announcement || 'No announcement set'; },
    async saveAnnouncement() { const text = document.getElementById('announcement-text').value.trim(); if (!text) { Utils.showToast('Enter text', 'warning'); return; } Utils.showLoading('Saving...'); try { await Database.updateSettings({ ...this.state.settings, announcement: text }); this.state.settings.announcement = text; document.getElementById('current-announcement-text').textContent = text; document.getElementById('announcement-text').value = ''; Utils.showToast('Saved!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== BROADCAST =====
    async sendBroadcast() { const message = document.getElementById('broadcast-message').value.trim(); if (!message) { Utils.showToast('Enter message', 'warning'); return; } if (!confirm(`Send to all ${this.state.users.length} users?`)) return; Utils.showLoading('Broadcasting...'); try { let photo = null; const imageInput = document.getElementById('broadcast-image'); if (imageInput.files[0]) photo = await Utils.compressImage(imageInput.files[0], 800, 0.8); const userIds = this.state.users.map(u => u.telegramId); const results = await TelegramBot.broadcast(userIds, message, photo); Utils.showToast(`Sent: ${results.success} success, ${results.failed} failed`, 'success'); document.getElementById('broadcast-message').value = ''; } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== BANNED USERS =====
    renderBannedUsers() { const c = document.getElementById('admin-banned-list'); if (!c) return; if (this.state.bannedUsers.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><p>No banned users</p></div>'; return; } c.innerHTML = this.state.bannedUsers.map(user => `<div class="banned-card"><div class="banned-icon"><i class="fas fa-user-slash"></i></div><div class="banned-info"><h4>${user.firstName || 'User'}</h4><p>@${user.username || 'N/A'} • ${user.telegramId}</p><p class="reason"><strong>Reason:</strong> ${user.reason}</p><p class="date">Banned: ${Utils.formatDate(user.bannedAt, 'long')}</p></div><button class="btn btn-success btn-sm" onclick="AdminApp.unbanUser('${user.telegramId}')"><i class="fas fa-check"></i> Unban</button></div>`).join(''); },
    async unbanUser(telegramId) { if (!confirm('Unban?')) return; Utils.showLoading('Unbanning...'); try { await Database.unbanUser(telegramId); await TelegramBot.notifyUnban(telegramId); await this.loadAdminData(); this.renderBannedUsers(); Utils.showToast('Unbanned!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== CUSTOM EMOJIS =====
    renderCustomEmojis() { const c = document.getElementById('admin-emojis-list'); if (!c) return; const emojis = this.state.settings?.customEmojis || []; if (emojis.length === 0) { c.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-smile-wink"></i><p>No custom emojis</p></div>'; return; } c.innerHTML = emojis.map(e => `<div class="emoji-card"><button class="delete-btn" onclick="AdminApp.deleteCustomEmoji('${e.id}')"><i class="fas fa-trash"></i></button><div class="trigger-emoji">${e.trigger}</div><div class="emoji-arrow"><i class="fas fa-arrow-down"></i></div><img class="emoji-preview" src="${e.imageUrl}" alt="${e.name}"><div class="emoji-name">${e.name || 'Unnamed'}</div></div>`).join(''); },
    showAddEmoji() { document.getElementById('emoji-name').value = ''; document.getElementById('emoji-trigger').value = ''; document.getElementById('emoji-file').value = ''; document.getElementById('emoji-file-preview').innerHTML = ''; document.getElementById('emoji-file-preview').classList.add('hidden'); document.getElementById('add-emoji-modal').classList.remove('hidden'); this.loadEmojiPicker(); },
    closeAddEmoji() { document.getElementById('add-emoji-modal').classList.add('hidden'); },
    loadEmojiPicker() { const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','😮','🤯','😳','🥵','🥶','😱','😨','😰','😥','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👻','👽','👾','🤖','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💞','💓','💗','💖','💘','⭐','🌟','✨','💫','🔥','💥','💢','💦','💨','💣','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','🎮','🕹️','🎰','🎲','🧩','🎯','🎱','🔮','🧿','🎪','💎','💰','💵','💴','💶','💷','💸','💳','🏆','🥇','🎁','🎀','🎈','🎉','🎊','🎄','🎃','⚡','☀️','🌙']; document.getElementById('emoji-picker-grid').innerHTML = emojis.map(e => `<div class="emoji-item" onclick="AdminApp.selectTriggerEmoji('${e}')">${e}</div>`).join(''); },
    selectTriggerEmoji(emoji) { document.getElementById('emoji-trigger').value = emoji; this.closeEmojiPicker(); },
    showEmojiPicker() { this.loadEmojiPicker(); document.getElementById('emoji-picker-modal').classList.remove('hidden'); },
    closeEmojiPicker() { document.getElementById('emoji-picker-modal').classList.add('hidden'); },
    async saveCustomEmoji() { const name = document.getElementById('emoji-name').value.trim(); const trigger = document.getElementById('emoji-trigger').value; const fileInput = document.getElementById('emoji-file'); if (!trigger) { Utils.showToast('Select trigger', 'warning'); return; } if (!fileInput.files[0]) { Utils.showToast('Upload image', 'warning'); return; } const existing = (this.state.settings?.customEmojis || []).find(e => e.trigger === trigger); if (existing) { Utils.showToast('Trigger already used', 'warning'); return; } Utils.showLoading('Uploading...'); try { const fd = new FormData(); fd.append('image', fileInput.files[0]); const r = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Upload failed'); const settings = this.state.settings || {}; if (!settings.customEmojis) settings.customEmojis = []; settings.customEmojis.push({ id: 'emoji_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9), trigger, imageUrl: res.data.url, name, type: 'image', createdAt: new Date().toISOString() }); await Database.updateSettings(settings); this.state.settings = settings; this.closeAddEmoji(); this.renderCustomEmojis(); Utils.showToast('Created!', 'success'); } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); } finally { Utils.hideLoading(); } },
    async deleteCustomEmoji(emojiId) { if (!confirm('Delete?')) return; Utils.showLoading('Deleting...'); try { const settings = this.state.settings; settings.customEmojis = (settings.customEmojis || []).filter(e => e.id !== emojiId); await Database.updateSettings(settings); this.state.settings = settings; this.renderCustomEmojis(); Utils.showToast('Deleted!', 'success'); } catch (error) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== SETTINGS (UPDATED - includes RapidAPI Key) =====
    renderSettings() {
        const nameInput = document.getElementById('website-name');
        const currentLogo = document.getElementById('current-logo');
        if (nameInput) nameInput.value = this.state.settings.websiteName || '';
        if (this.state.settings.websiteLogo && currentLogo) { currentLogo.src = this.state.settings.websiteLogo; document.getElementById('logo-preview')?.classList.remove('hidden'); }
        
        // Inject RapidAPI Key field if not exists
        const settingsForm = document.querySelector('#admin-page-settings .settings-form');
        if (settingsForm && !document.getElementById('rapidapi-key-input')) {
            const apiKeySection = document.createElement('div');
            apiKeySection.className = 'form-section-header';
            apiKeySection.innerHTML = `
                <h4><i class="fas fa-key"></i> Game ID Checker API</h4>
                <small>Required for auto Game ID verification</small>
            `;
            
            const apiKeyGroup = document.createElement('div');
            apiKeyGroup.className = 'form-group';
            apiKeyGroup.innerHTML = `
                <label>RapidAPI Key</label>
                <div class="api-key-input-group">
                    <input type="password" id="rapidapi-key-input" placeholder="Enter your RapidAPI key" value="${this.state.settings.rapidApiKey || ''}">
                    <button type="button" class="btn btn-sm" onclick="toggleApiKeyVisibility()"><i class="fas fa-eye"></i></button>
                </div>
                <small>
                    Get your free key from 
                    <a href="https://rapidapi.com/okebagus426/api/check-id-game1" target="_blank" style="color:var(--primary);font-weight:600;">
                        RapidAPI - Check ID Game
                    </a>
                    (Free tier: 100 requests/month)
                </small>
                ${this.state.settings.rapidApiKey ? '<p style="color:var(--success);margin-top:8px;"><i class="fas fa-check-circle"></i> API Key is configured</p>' : '<p style="color:var(--warning);margin-top:8px;"><i class="fas fa-exclamation-triangle"></i> No API key set - Game ID checker will not work</p>'}
            `;
            
            // Insert before save button
            const saveBtn = settingsForm.querySelector('.save-btn');
            settingsForm.insertBefore(apiKeySection, saveBtn);
            settingsForm.insertBefore(apiKeyGroup, saveBtn);
        } else if (document.getElementById('rapidapi-key-input')) {
            document.getElementById('rapidapi-key-input').value = this.state.settings.rapidApiKey || '';
        }
    },
    
    async saveSettings() {
        const websiteName = document.getElementById('website-name').value.trim();
        const logoInput = document.getElementById('website-logo');
        const rapidApiKey = document.getElementById('rapidapi-key-input')?.value?.trim() || '';
        
        Utils.showLoading('Saving...');
        try {
            const updates = { ...this.state.settings };
            if (websiteName) updates.websiteName = websiteName;
            updates.rapidApiKey = rapidApiKey;
            
            if (logoInput.files[0]) {
                const fd = new FormData(); fd.append('image', logoInput.files[0]);
                const r = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: fd });
                const res = await r.json();
                if (!res.success) throw new Error('Logo upload failed');
                updates.websiteLogo = res.data.url;
            }
            await Database.updateSettings(updates);
            this.state.settings = updates;
            Utils.showToast('Settings saved!', 'success');
            this.renderSettings(); // Re-render to update API key status
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== DATABASE IDS =====
    renderDatabaseIds() {
        document.getElementById('main-bin-id').textContent = CONFIG.BINS.MAIN || 'Not set';
        document.getElementById('users-bin-id').textContent = CONFIG.BINS.USERS || 'Not set';
        document.getElementById('products-bin-id').textContent = CONFIG.BINS.PRODUCTS || 'Not set';
        document.getElementById('categories-bin-id').textContent = CONFIG.BINS.CATEGORIES || 'Not set';
        document.getElementById('orders-bin-id').textContent = CONFIG.BINS.ORDERS || 'Not set';
        document.getElementById('settings-bin-id').textContent = CONFIG.BINS.MAIN || 'Not set';
        document.getElementById('images-bin-id').textContent = CONFIG.BINS.IMAGES || 'Not set';
    }
};

// ===== GLOBAL FUNCTIONS =====
function showAdminPage(page) { AdminApp.showAdminPage(page); }
function filterOrders(filter) { AdminApp.filterOrders(filter); }
function filterTopups(filter) { AdminApp.filterTopups(filter); }
function filterProductsByCategory() { AdminApp.renderProducts(); }
function showBannerType(type) { AdminApp.renderBannerType(type); }
function showAddCategory() { AdminApp.showAddCategory(); }
function closeAddCategory() { AdminApp.closeAddCategory(); }
function saveCategory() { AdminApp.saveCategory(); }
function showAddProduct() { AdminApp.showAddProduct(); }
function closeAddProduct() { AdminApp.closeAddProduct(); }
function saveProduct() { AdminApp.saveProduct(); }
function showAddBanner(type) { AdminApp.showAddBanner(type); }
function closeAddBanner() { AdminApp.closeAddBanner(); }
function saveBanner() { AdminApp.saveBanner(); }
function showAddInputTable() { AdminApp.showAddInputTable(); }
function closeAddInputTable() { AdminApp.closeAddInputTable(); }
function saveInputTable() { AdminApp.saveInputTable(); }
function showAddPayment() { AdminApp.showAddPayment(); }
function closeAddPayment() { AdminApp.closeAddPayment(); }
function savePayment() { AdminApp.savePayment(); }
function saveAnnouncement() { AdminApp.saveAnnouncement(); }
function sendBroadcast() { AdminApp.sendBroadcast(); }
function saveSettings() { AdminApp.saveSettings(); }
function showAddEmoji() { AdminApp.showAddEmoji(); }
function closeAddEmoji() { AdminApp.closeAddEmoji(); }
function showEmojiPicker() { AdminApp.showEmojiPicker(); }
function closeEmojiPicker() { AdminApp.closeEmojiPicker(); }
function saveCustomEmoji() { AdminApp.saveCustomEmoji(); }
function triggerEmojiUpload() { document.getElementById('emoji-file').click(); }
function testChecker() { AdminApp.testChecker(); }
function onCheckerJsonInput() { AdminApp.previewCheckerConfig(); }

function toggleCheckerConfig() {
    const enabled = document.getElementById('checker-enabled').checked;
    document.getElementById('checker-json-section').classList.toggle('hidden', !enabled);
    document.getElementById('checker-test-section').classList.toggle('hidden', !enabled);
    if (enabled) AdminApp.buildCheckerSection();
    if (!enabled) { document.getElementById('checker-json-preview')?.classList.add('hidden'); document.getElementById('checker-test-result')?.classList.add('hidden'); }
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('rapidapi-key-input');
    if (input) { input.type = input.type === 'password' ? 'text' : 'password'; }
}

function previewEmojiFile(event) { const file = event.target.files[0]; if (!file) return; const allowedTypes = ['image/png','image/jpeg','image/jpg','image/gif','image/webp']; if (!allowedTypes.includes(file.type)) { Utils.showToast('Only PNG, JPG, WEBP, GIF allowed', 'warning'); event.target.value = ''; return; } const preview = document.getElementById('emoji-file-preview'); const reader = new FileReader(); reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" alt="Preview"><button class="remove-file" onclick="removeEmojiFile()">Remove</button>`; preview.classList.remove('hidden'); }; reader.readAsDataURL(file); }
function removeEmojiFile() { document.getElementById('emoji-file').value = ''; document.getElementById('emoji-file-preview').innerHTML = ''; document.getElementById('emoji-file-preview').classList.add('hidden'); }
function closeUserDetails() { AdminApp.closeUserDetails(); }
function copyId(elementId) { Utils.copyToClipboard(document.getElementById(elementId).textContent); }

// Upload triggers
function triggerCategoryIconUpload() { document.getElementById('category-icon').click(); }
function triggerProductIconUpload() { document.getElementById('product-icon').click(); }
function triggerBannerUpload() { document.getElementById('banner-image').click(); }
function triggerPaymentIconUpload() { document.getElementById('payment-icon').click(); }
function triggerLogoUpload() { document.getElementById('website-logo').click(); }
function triggerBroadcastImageUpload() { document.getElementById('broadcast-image').click(); }

// ===== Shared APIs =====
const G2BulkAPI = window.G2BulkAPI || { get URL() { return CONFIG.G2BULK.API_URL; }, get KEY() { return CONFIG.G2BULK.API_KEY; }, async request(action, params = {}) { const r = await fetch(this.URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: this.KEY, action, ...params }) }); return await r.json(); }, async getServices() { return await this.request('services'); }, async getBalance() { return await this.request('balance'); }, async placeOrder(serviceId, link, quantity = 1) { return await this.request('add', { service: serviceId, link, quantity }); }, async checkStatus(orderId) { return await this.request('status', { order: orderId }); }, isBalanceError(error) { if (!error) return false; const s = String(error).toLowerCase(); return ['insufficient','balance','not enough','funds','low balance'].some(k => s.includes(k)); } };
window.G2BulkAPI = G2BulkAPI;

const GameIdChecker = window.GameIdChecker || { async check(config, value, allInputValues = {}) { if (!config) return null; if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) { return null; } } const url = config.url || config.apiUrl; if (!url) return null; const method = (config.method || 'POST').toUpperCase(); const headers = config.headers || { 'Content-Type': 'application/json' }; try { let fetchUrl = url; let options = { method, headers: { ...headers } }; const safeEscape = (val) => String(val || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n'); if (method === 'POST') { if (config.body) { let bodyStr = JSON.stringify(config.body); bodyStr = bodyStr.replace(/\{\{value\}\}/gi, safeEscape(value)); Object.entries(allInputValues).forEach(([name, val]) => { const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); bodyStr = bodyStr.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), safeEscape(val)); }); options.body = bodyStr; } else if (config.bodyTemplate) { options.body = config.bodyTemplate.replace(/\{\{value\}\}/gi, safeEscape(value)); } } else if (method === 'GET') { fetchUrl = fetchUrl.replace(/\{\{value\}\}/gi, encodeURIComponent(value)); Object.entries(allInputValues).forEach(([name, val]) => { const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); fetchUrl = fetchUrl.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), encodeURIComponent(val || '')); }); } const response = await fetch(fetchUrl, options); const data = await response.json(); let isValid = false, nickname = null, country = null; if (config.responsePath || config.response) { const rp = config.responsePath || config.response; const validValue = rp.valid ? this.getNestedValue(data, rp.valid) : null; nickname = rp.nickname ? this.getNestedValue(data, rp.nickname) : null; country = rp.country ? this.getNestedValue(data, rp.country) : null; isValid = validValue !== null && validValue !== undefined ? !!validValue : !!nickname; } else { nickname = config.responseNamePath ? this.getNestedValue(data, config.responseNamePath) : null; const validValue = config.responseValidPath ? this.getNestedValue(data, config.responseValidPath) : null; isValid = validValue !== null && validValue !== undefined ? !!validValue : !!nickname; } return { valid: isValid, nickname, playerName: nickname, country, raw: data }; } catch (error) { return { valid: false, nickname: null, playerName: null, country: null, error: error.message }; } }, getNestedValue(obj, path) { if (!path) return null; return path.split('.').reduce((c, k) => c?.[k], obj); }, getRequiredInputs(config) { if (!config) return []; if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) { return []; } } if (!config.body) return []; const bodyStr = JSON.stringify(config.body); const matches = bodyStr.match(/\{\{([^}]+)\}\}/g) || []; return matches.map(m => m.replace(/\{\{|\}\}/g, '')).filter(name => name.toLowerCase() !== 'value'); } };
window.GameIdChecker = GameIdChecker;

const CountryHelper = window.CountryHelper || { countries: { 'AF':'🇦🇫 Afghanistan','AL':'🇦🇱 Albania','DZ':'🇩🇿 Algeria','AR':'🇦🇷 Argentina','AU':'🇦🇺 Australia','AT':'🇦🇹 Austria','BD':'🇧🇩 Bangladesh','BE':'🇧🇪 Belgium','BR':'🇧🇷 Brazil','KH':'🇰🇭 Cambodia','CA':'🇨🇦 Canada','CL':'🇨🇱 Chile','CN':'🇨🇳 China','CO':'🇨🇴 Colombia','CZ':'🇨🇿 Czech Republic','DK':'🇩🇰 Denmark','EG':'🇪🇬 Egypt','FI':'🇫🇮 Finland','FR':'🇫🇷 France','DE':'🇩🇪 Germany','GH':'🇬🇭 Ghana','GR':'🇬🇷 Greece','HK':'🇭🇰 Hong Kong','HU':'🇭🇺 Hungary','IN':'🇮🇳 India','ID':'🇮🇩 Indonesia','IR':'🇮🇷 Iran','IQ':'🇮🇶 Iraq','IE':'🇮🇪 Ireland','IL':'🇮🇱 Israel','IT':'🇮🇹 Italy','JP':'🇯🇵 Japan','JO':'🇯🇴 Jordan','KZ':'🇰🇿 Kazakhstan','KE':'🇰🇪 Kenya','KR':'🇰🇷 South Korea','KW':'🇰🇼 Kuwait','LA':'🇱🇦 Laos','LB':'🇱🇧 Lebanon','MY':'🇲🇾 Malaysia','MX':'🇲🇽 Mexico','MM':'🇲🇲 Myanmar','NP':'🇳🇵 Nepal','NL':'🇳🇱 Netherlands','NZ':'🇳🇿 New Zealand','NG':'🇳🇬 Nigeria','NO':'🇳🇴 Norway','PK':'🇵🇰 Pakistan','PH':'🇵🇭 Philippines','PL':'🇵🇱 Poland','PT':'🇵🇹 Portugal','QA':'🇶🇦 Qatar','RO':'🇷🇴 Romania','RU':'🇷🇺 Russia','SA':'🇸🇦 Saudi Arabia','SG':'🇸🇬 Singapore','ZA':'🇿🇦 South Africa','ES':'🇪🇸 Spain','LK':'🇱🇰 Sri Lanka','SE':'🇸🇪 Sweden','CH':'🇨🇭 Switzerland','TW':'🇹🇼 Taiwan','TH':'🇹🇭 Thailand','TR':'🇹🇷 Turkey','UA':'🇺🇦 Ukraine','AE':'🇦🇪 UAE','GB':'🇬🇧 United Kingdom','US':'🇺🇸 United States','UZ':'🇺🇿 Uzbekistan','VN':'🇻🇳 Vietnam','YE':'🇾🇪 Yemen' }, getDisplay(code) { if (!code) return ''; code = String(code).toUpperCase().trim(); return this.countries[code] || `🌍 ${code}`; } };
window.CountryHelper = CountryHelper;

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    const previewHandlers = [
        { input: 'category-icon', preview: 'category-icon-preview' },
        { input: 'product-icon', preview: 'product-icon-preview' },
        { input: 'banner-image', preview: 'banner-image-preview' },
        { input: 'payment-icon', preview: 'payment-icon-preview' },
        { input: 'broadcast-image', preview: 'broadcast-image-preview' }
    ];
    previewHandlers.forEach(({ input, preview }) => {
        document.getElementById(input)?.addEventListener('change', async (e) => {
            if (e.target.files[0]) { const previewEl = document.getElementById(preview); const img = await Utils.compressImage(e.target.files[0], 400, 0.8); previewEl.innerHTML = `<img src="${img}" alt="Preview">`; previewEl.classList.remove('hidden'); }
        });
    });
    document.getElementById('website-logo')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) { const img = await Utils.compressImage(e.target.files[0], 200, 0.9); document.getElementById('current-logo').src = img; document.getElementById('logo-preview').classList.remove('hidden'); }
    });
    AdminApp.init();
});
