// ===== Admin Panel - G2Bulk + FREE Game ID Checker (No API Key Required) =====

// ===== FREE GAME ID CHECKER PRESETS (No API Key / No Subscription) =====
const GameCheckerPresets = {
    // FREE API - No key required, GET requests
    // Uses community-maintained free endpoints
    BASE_URL: 'https://api.isan.eu.org/nickname',
    
    games: [
        {
            id: 'mobile-legends',
            name: 'Mobile Legends: Bang Bang',
            icon: '📱',
            shortName: 'MLBB',
            endpoint: '/ml',
            fields: [
                { name: 'User ID', paramKey: 'id', placeholder: 'Enter your User ID (e.g., 123456789)', isMain: true },
                { name: 'Zone ID', paramKey: 'zone', placeholder: 'Enter Zone/Server ID (e.g., 1234)', isMain: false }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'free-fire',
            name: 'Free Fire',
            icon: '🔥',
            shortName: 'FF',
            endpoint: '/ff',
            fields: [
                { name: 'User ID', paramKey: 'id', placeholder: 'Enter your Free Fire ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'genshin-impact',
            name: 'Genshin Impact',
            icon: '⭐',
            shortName: 'Genshin',
            endpoint: '/gi',
            fields: [
                { name: 'UID', paramKey: 'uid', placeholder: 'Enter your Genshin UID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'honkai-star-rail',
            name: 'Honkai: Star Rail',
            icon: '🌟',
            shortName: 'HSR',
            endpoint: '/hsr',
            fields: [
                { name: 'UID', paramKey: 'uid', placeholder: 'Enter your HSR UID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'pubg-mobile',
            name: 'PUBG Mobile',
            icon: '🎮',
            shortName: 'PUBG',
            endpoint: '/pubg',
            fields: [
                { name: 'Player ID', paramKey: 'id', placeholder: 'Enter your PUBG Player ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'valorant',
            name: 'Valorant',
            icon: '🎯',
            shortName: 'Valorant',
            endpoint: '/valorant',
            fields: [
                { name: 'Riot ID', paramKey: 'id', placeholder: 'Enter Riot ID (Name#Tag)', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'arena-of-valor',
            name: 'Arena of Valor',
            icon: '⚔️',
            shortName: 'AOV',
            endpoint: '/aov',
            fields: [
                { name: 'Player ID', paramKey: 'id', placeholder: 'Enter AOV Player ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'call-of-duty-mobile',
            name: 'Call of Duty: Mobile',
            icon: '🔫',
            shortName: 'CODM',
            endpoint: '/codm',
            fields: [
                { name: 'Player ID', paramKey: 'id', placeholder: 'Enter CODM Player ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'honor-of-kings',
            name: 'Honor of Kings',
            icon: '👑',
            shortName: 'HOK',
            endpoint: '/hok',
            fields: [
                { name: 'Player ID', paramKey: 'id', placeholder: 'Enter HOK Player ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'league-of-legends',
            name: 'League of Legends: Wild Rift',
            icon: '🏆',
            shortName: 'LOL WR',
            endpoint: '/lolwr',
            fields: [
                { name: 'Player ID', paramKey: 'id', placeholder: 'Enter LOL Player ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'clash-of-clans',
            name: 'Clash of Clans',
            icon: '🏰',
            shortName: 'COC',
            endpoint: '/coc',
            fields: [
                { name: 'Player Tag', paramKey: 'id', placeholder: 'Enter Player Tag (#ABC123)', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'stumble-guys',
            name: 'Stumble Guys',
            icon: '🏃',
            shortName: 'Stumble',
            endpoint: '/stumble',
            fields: [
                { name: 'Username', paramKey: 'id', placeholder: 'Enter username', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'tower-of-fantasy',
            name: 'Tower of Fantasy',
            icon: '🗼',
            shortName: 'TOF',
            endpoint: '/tof',
            fields: [
                { name: 'User ID', paramKey: 'id', placeholder: 'Enter TOF User ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'point-blank',
            name: 'Point Blank',
            icon: '🎯',
            shortName: 'PB',
            endpoint: '/pb',
            fields: [
                { name: 'User ID', paramKey: 'id', placeholder: 'Enter PB User ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        },
        {
            id: 'super-sus',
            name: 'Super Sus',
            icon: '🔍',
            shortName: 'SuperSus',
            endpoint: '/supersus',
            fields: [
                { name: 'User ID', paramKey: 'id', placeholder: 'Enter Super Sus ID', isMain: true }
            ],
            responsePath: { valid: 'status', nickname: 'nickname' }
        }
    ],
    
    getGame(gameId) {
        return this.games.find(g => g.id === gameId);
    },
    
    // Generate checker config - NO API KEY NEEDED
    generateConfig(gameId) {
        const game = this.getGame(gameId);
        if (!game) return null;
        
        // Build GET URL with query params using templates
        let url = this.BASE_URL + game.endpoint + '?';
        const paramParts = [];
        game.fields.forEach(field => {
            const val = field.isMain ? '{{value}}' : `{{${field.name}}}`;
            paramParts.push(`${field.paramKey}=${val}`);
        });
        url += paramParts.join('&');
        
        return {
            url: url,
            method: 'GET',
            headers: {},
            responsePath: { ...game.responsePath },
            errorMessage: `${game.name} ID not found! Please check and try again.`,
            _preset: {
                gameId: game.id,
                gameName: game.name,
                gameIcon: game.icon,
                apiProvider: 'Free API (No Key Required)'
            }
        };
    },
    
    // Auto detect game from category name
    autoDetectGame(categoryName) {
        if (!categoryName) return null;
        const name = categoryName.toLowerCase();
        const keywords = {
            'mobile-legends': ['mobile legends', 'mlbb', 'ml ', 'mobile legend'],
            'free-fire': ['free fire', 'freefire', 'ff ', 'garena free'],
            'genshin-impact': ['genshin'],
            'honkai-star-rail': ['honkai', 'star rail', 'hsr'],
            'pubg-mobile': ['pubg', 'battlegrounds'],
            'call-of-duty-mobile': ['call of duty', 'cod mobile', 'codm'],
            'arena-of-valor': ['arena of valor', 'aov'],
            'league-of-legends': ['league of legends', 'lol', 'wild rift'],
            'valorant': ['valorant'],
            'honor-of-kings': ['honor of kings', 'hok'],
            'clash-of-clans': ['clash of clans', 'coc'],
            'stumble-guys': ['stumble guys'],
            'tower-of-fantasy': ['tower of fantasy', 'tof'],
        };
        for (const [gameId, kws] of Object.entries(keywords)) {
            if (kws.some(kw => name.includes(kw))) return gameId;
        }
        return null;
    },
    
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
        selectedGamePreset: null,
        checkerMode: 'preset'
    },
    
    async init() {
        console.log('🚀 Initializing Admin Panel...');
        try {
            if (!TelegramApp.isInTelegram()) { this.showAccessDenied('This panel can only be accessed through Telegram'); return; }
            await TelegramApp.init();
            if (!TelegramApp.isAdmin()) { this.showAccessDenied('You don\'t have permission to access this panel'); return; }
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
    
    showAccessDenied(message) { document.getElementById('admin-dashboard').classList.add('hidden'); const denied = document.getElementById('access-denied'); denied.querySelector('p').textContent = message; denied.classList.remove('hidden'); },
    showDashboard() { document.getElementById('access-denied').classList.add('hidden'); document.getElementById('admin-dashboard').classList.remove('hidden'); this.showAdminPage('dashboard'); this.startRealtimeUpdates(); this.updateTime(); },
    
    async loadAdminData() {
        try {
            const results = await Promise.allSettled([Database.getSettings(), Database.getUsers(), Database.getOrders(), Database.getTopups(), Database.getCategories(), Database.getProducts(), Database.getBanners(), Database.getPaymentMethods(), Database.getInputTables(), Database.getBannedUsers(), Database.getStats()]);
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
        } catch (error) { console.error('Load admin data error:', error); throw error; }
    },
    
    updateSidebarCounts() {
        const uc = document.getElementById('users-count'); const po = document.getElementById('pending-orders'); const pt = document.getElementById('pending-topups');
        if (uc) uc.textContent = this.state.users.length;
        if (po) po.textContent = this.state.orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'queued').length;
        if (pt) pt.textContent = this.state.topups.filter(t => t.status === 'pending').length;
    },
    
    updateTime() { const update = () => { const el = document.getElementById('admin-time'); if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); }; update(); setInterval(update, 1000); },
    startRealtimeUpdates() { setInterval(async () => { try { await this.loadAdminData(); this.renderCurrentPage(); } catch (e) {} }, 30000); },
    
    showAdminPage(page) {
        this.state.currentPage = page;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[onclick="showAdminPage('${page}')"]`);
        if (active) active.classList.add('active');
        document.querySelectorAll('.admin-page').forEach(p => p.classList.add('hidden'));
        const target = document.getElementById(`admin-page-${page}`);
        if (target) { target.classList.remove('hidden'); this.renderCurrentPage(); }
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
        document.getElementById('stat-pending').textContent = this.state.orders.filter(o => o.status === 'pending').length || 0;
        const pe = document.getElementById('stat-processing'); const qe = document.getElementById('stat-queued');
        if (pe) pe.textContent = this.state.orders.filter(o => o.status === 'processing').length || 0;
        if (qe) qe.textContent = this.state.orders.filter(o => o.status === 'queued').length || 0;
        this.renderRecentOrders(); this.renderRecentTopups();
    },
    async refreshApiBalance() { try { const r = await G2BulkAPI.getBalance(); if (r && r.balance) { this.state.g2bulkBalance = r; const bt = `$${parseFloat(r.balance).toFixed(4)} ${r.currency || 'USD'}`; const d1 = document.getElementById('api-balance-value'); const d2 = document.getElementById('g2bulk-balance-display'); if (d1) d1.textContent = bt; if (d2) d2.textContent = bt; } } catch (e) { const d = document.getElementById('api-balance-value'); if (d) d.textContent = 'Error'; } },
    renderRecentOrders() { const c = document.getElementById('recent-orders'); if (!c) return; const recent = [...this.state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5); if (recent.length === 0) { c.innerHTML = '<p class="empty-text">No orders yet</p>'; return; } c.innerHTML = recent.map(o => { const u = this.state.users.find(us => us.telegramId === o.telegramId); return `<div class="recent-item"><img src="${u?.photoUrl || this.getAvatar(o.telegramId)}" alt="U"><div class="recent-item-info"><h4>${u?.firstName || 'User'}</h4><p>${o.productName}</p></div><div class="recent-item-right"><span class="recent-item-amount">${Utils.formatCurrency(o.amount, o.currency)}</span><span class="status-badge-sm ${o.status}">${o.status}</span></div></div>`; }).join(''); },
    renderRecentTopups() { const c = document.getElementById('recent-topups'); if (!c) return; const recent = [...this.state.topups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5); if (recent.length === 0) { c.innerHTML = '<p class="empty-text">No top-ups yet</p>'; return; } c.innerHTML = recent.map(t => { const u = this.state.users.find(us => us.telegramId === t.telegramId); return `<div class="recent-item"><img src="${u?.photoUrl || this.getAvatar(t.telegramId)}" alt="U"><div class="recent-item-info"><h4>${u?.firstName || 'User'}</h4><p>${t.paymentMethod}</p></div><span class="recent-item-amount positive">+${Utils.formatCurrency(t.amount, 'MMK')}</span></div>`; }).join(''); },
    getAvatar(id) { return `https://ui-avatars.com/api/?name=${id}&background=8b5cf6&color=fff&size=100`; },
    
    // ===== USERS =====
    renderUsers() { const tb = document.getElementById('users-table-body'); if (!tb) return; if (this.state.users.length === 0) { tb.innerHTML = '<tr><td colspan="7" class="empty-cell">No users</td></tr>'; return; } tb.innerHTML = this.state.users.map(u => `<tr><td><div class="user-cell"><img src="${u.photoUrl || this.getAvatar(u.firstName)}" alt=""><div class="user-cell-info"><h4>${u.firstName} ${u.lastName || ''}</h4><p>@${u.username || 'N/A'}</p></div></div></td><td><code>${u.telegramId}</code></td><td><strong>${Utils.formatCurrency(u.balance, 'MMK')}</strong></td><td>${u.totalOrders || 0}</td><td>${u.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Premium</span>' : '<span class="badge standard">Standard</span>'}</td><td>${Utils.timeAgo(u.joinedAt)}</td><td><div class="action-buttons"><button class="action-btn view" onclick="AdminApp.viewUserDetails('${u.telegramId}')"><i class="fas fa-eye"></i></button><button class="action-btn edit" onclick="AdminApp.editUserBalance('${u.telegramId}')"><i class="fas fa-wallet"></i></button><button class="action-btn delete" onclick="AdminApp.banUserPrompt('${u.telegramId}')"><i class="fas fa-ban"></i></button></div></td></tr>`).join(''); },
    async viewUserDetails(telegramId) { const u = this.state.users.find(us => us.telegramId === telegramId); if (!u) return; document.getElementById('user-details-content').innerHTML = `<div class="user-details-header"><img src="${u.photoUrl || this.getAvatar(u.firstName)}" alt=""><div class="user-details-info"><h3>${u.firstName} ${u.lastName || ''}</h3><p>@${u.username || 'N/A'} • ID: ${u.telegramId}</p></div></div><div class="user-stats-row"><div class="user-stat-box"><span class="stat-value">${Utils.formatCurrency(u.balance, '')}</span><span class="stat-label">Balance</span></div><div class="user-stat-box"><span class="stat-value">${u.totalOrders || 0}</span><span class="stat-label">Orders</span></div><div class="user-stat-box"><span class="stat-value">${Utils.formatCurrency(u.totalSpent || 0, '')}</span><span class="stat-label">Spent</span></div></div><div class="user-actions-row"><button class="btn btn-primary" onclick="AdminApp.editUserBalance('${u.telegramId}')"><i class="fas fa-wallet"></i> Edit Balance</button><button class="btn btn-danger" onclick="AdminApp.banUserPrompt('${u.telegramId}')"><i class="fas fa-ban"></i> Ban</button></div>`; document.getElementById('user-details-modal').classList.remove('hidden'); },
    async editUserBalance(tid) { const u = this.state.users.find(us => us.telegramId === tid); if (!u) return; const nb = prompt(`Current: ${Utils.formatCurrency(u.balance, 'MMK')}\nNew balance:`); if (nb !== null && nb !== '' && !isNaN(nb)) { Utils.showLoading('Updating...'); try { await Database.updateUserBalance(tid, parseFloat(nb), 'set'); await this.loadAdminData(); this.renderUsers(); this.closeUserDetails(); Utils.showToast('Updated!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } } },
    async banUserPrompt(tid) { if (!confirm('Ban this user?')) return; const reason = prompt('Reason:') || 'Violated terms'; Utils.showLoading('Banning...'); try { const u = this.state.users.find(us => us.telegramId === tid); await Database.banUser(u, reason); await TelegramBot.notifyBan(tid, reason); await this.loadAdminData(); this.renderUsers(); this.closeUserDetails(); Utils.showToast('Banned', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    closeUserDetails() { document.getElementById('user-details-modal').classList.add('hidden'); },
    
    // ===== ORDERS =====
    renderOrders() { const c = document.getElementById('admin-orders-list'); if (!c) return; let f = [...this.state.orders]; if (this.state.ordersFilter !== 'all') f = f.filter(o => o.status === this.state.ordersFilter); f.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); if (f.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders</p></div>'; return; } c.innerHTML = f.map(o => { const u = this.state.users.find(us => us.telegramId === o.telegramId); return `<div class="order-card"><div class="order-header"><div class="order-user"><img src="${u?.photoUrl || this.getAvatar(o.telegramId)}" alt=""><div><h4>${u?.firstName || 'User'}</h4><p>@${u?.username || 'N/A'}</p></div></div><span class="status-badge ${o.status}">${o.status}</span></div><div class="order-body"><div class="order-info-row"><span>Order ID:</span><strong>${o.orderId}</strong></div><div class="order-info-row"><span>Product:</span><strong>${o.productName}</strong></div><div class="order-info-row"><span>Amount:</span><strong>${Utils.formatCurrency(o.amount, o.currency)}</strong></div>${o.serviceId ? `<div class="order-info-row"><span>Service:</span><strong>#${o.serviceId}</strong></div>` : ''}${o.apiOrderId ? `<div class="order-info-row"><span>API Order:</span><strong>#${o.apiOrderId}</strong></div>` : ''}${o.apiStatus ? `<div class="order-info-row"><span>API Status:</span><strong>${o.apiStatus}</strong></div>` : ''}${o.apiError ? `<div class="order-info-row error-row"><span>Error:</span><strong>${o.apiError}</strong></div>` : ''}${o.inputValues ? `<div class="order-inputs"><span>Inputs:</span><ul>${Object.entries(o.inputValues).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul></div>` : ''}<div class="order-date"><i class="fas fa-clock"></i> ${Utils.formatDate(o.createdAt, 'long')}</div></div><div class="order-actions">${o.status === 'pending' ? `<button class="btn btn-success" onclick="AdminApp.approveOrder('${o.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectOrder('${o.id}')"><i class="fas fa-times"></i> Reject</button>` : ''}${o.status === 'processing' && o.apiOrderId ? `<button class="btn btn-info" onclick="AdminApp.checkOrderApiStatus('${o.id}')"><i class="fas fa-sync-alt"></i> Check</button>` : ''}${o.status === 'queued' ? `<button class="btn btn-warning" onclick="AdminApp.retryQueuedOrder('${o.id}')"><i class="fas fa-redo"></i> Retry</button><button class="btn btn-danger" onclick="AdminApp.cancelQueuedOrder('${o.id}')"><i class="fas fa-times"></i> Cancel</button>` : ''}</div></div>`; }).join(''); },
    filterOrders(filter) { this.state.ordersFilter = filter; document.querySelectorAll('#admin-page-orders .filter-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); this.renderOrders(); },
    async approveOrder(id) { if (!confirm('Approve?')) return; Utils.showLoading('...'); try { const o = await Database.updateOrderStatus(id, 'approved', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyOrderStatus(o, 'approved'); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Approved!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async rejectOrder(id) { if (!confirm('Reject & refund?')) return; Utils.showLoading('...'); try { const o = await Database.updateOrderStatus(id, 'rejected', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyOrderStatus(o, 'rejected'); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Rejected', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async checkOrderApiStatus(id) { const o = this.state.orders.find(or => or.id === id); if (!o?.apiOrderId) return; Utils.showLoading('...'); try { const r = await G2BulkAPI.checkStatus(o.apiOrderId); if (r && !r.error) { let ns = o.status; if (r.status === 'Completed') ns = 'completed'; else if (r.status === 'Canceled' || r.status === 'Refunded') ns = 'failed'; else if (r.status === 'Partial') ns = 'partial'; await Database.updateOrderApiStatus(o.id, { apiStatus: r.status, status: ns, apiCharge: r.charge || null }); await this.loadAdminData(); this.renderOrders(); Utils.showToast(`Status: ${r.status}`, 'success'); } else { Utils.showToast('Error: ' + (r?.error || ''), 'error'); } } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async retryQueuedOrder(id) { const o = this.state.orders.find(or => or.id === id); if (!o) return; Utils.showLoading('...'); try { const r = await G2BulkAPI.placeOrder(o.serviceId, o.link, 1); if (r?.order) { await Database.updateOrderApiStatus(o.id, { apiOrderId: r.order, apiStatus: 'Processing', status: 'processing', apiError: null }); Utils.showToast('Processing!', 'success'); } else { Utils.showToast('Failed: ' + (r?.error || ''), 'error'); } await this.loadAdminData(); this.renderOrders(); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async cancelQueuedOrder(id) { if (!confirm('Cancel & refund?')) return; Utils.showLoading('...'); try { await Database.updateOrderApiStatus(id, { apiStatus: 'Canceled', status: 'failed', apiError: 'Canceled by admin' }); await this.loadAdminData(); this.renderOrders(); Utils.showToast('Canceled', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== TOPUPS =====
    renderTopups() { const c = document.getElementById('admin-topups-list'); if (!c) return; let f = [...this.state.topups]; if (this.state.topupsFilter !== 'all') f = f.filter(t => t.status === this.state.topupsFilter); f.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); if (f.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><p>No top-ups</p></div>'; return; } c.innerHTML = f.map(t => { const u = this.state.users.find(us => us.telegramId === t.telegramId); return `<div class="topup-card"><div class="topup-header"><div class="topup-user"><img src="${u?.photoUrl || this.getAvatar(t.telegramId)}" alt=""><div><h4>${u?.firstName || 'User'}</h4><p>@${u?.username || 'N/A'}</p></div></div><span class="status-badge ${t.status}">${t.status}</span></div><div class="topup-body"><div class="topup-amount"><span>Amount</span><strong>${Utils.formatCurrency(t.amount, 'MMK')}</strong></div><div class="topup-method"><span>Payment</span><strong>${t.paymentMethod}</strong></div>${t.proofImage ? `<div class="topup-proof"><img src="${t.proofImage}" alt="Proof" onclick="window.open('${t.proofImage}','_blank')"></div>` : ''}</div>${t.status === 'pending' ? `<div class="topup-actions"><button class="btn btn-success" onclick="AdminApp.approveTopup('${t.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectTopup('${t.id}')"><i class="fas fa-times"></i> Reject</button></div>` : ''}</div>`; }).join(''); },
    filterTopups(f) { this.state.topupsFilter = f; document.querySelectorAll('#admin-page-topups .filter-btn').forEach(b => b.classList.remove('active')); event.target.classList.add('active'); this.renderTopups(); },
    async approveTopup(id) { if (!confirm('Approve?')) return; Utils.showLoading('...'); try { const t = await Database.updateTopupStatus(id, 'approved', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyTopupStatus(t, 'approved'); await this.loadAdminData(); this.renderTopups(); Utils.showToast('Approved!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async rejectTopup(id) { if (!confirm('Reject?')) return; Utils.showLoading('...'); try { const t = await Database.updateTopupStatus(id, 'rejected', CONFIG.ADMIN_TELEGRAM_ID); await TelegramBot.notifyTopupStatus(t, 'rejected'); await this.loadAdminData(); this.renderTopups(); Utils.showToast('Rejected', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== CATEGORIES =====
    renderCategories() { const c = document.getElementById('admin-categories-list'); if (!c) return; if (this.state.categories.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-th-large"></i><p>No categories</p></div>'; return; } c.innerHTML = this.state.categories.map(cat => `<div class="category-card"><div class="category-icon"><img src="${cat.icon}" alt="">${cat.flag ? `<span class="category-flag">${cat.flag}</span>` : ''}</div><div class="category-info"><h4>${cat.name}</h4><p>${cat.totalSold || 0} sold</p>${cat.hasDiscount ? '<span class="discount-badge">Discount</span>' : ''}</div><div class="category-actions"><button class="action-btn edit" onclick="AdminApp.editCategory('${cat.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button></div></div>`).join(''); },
    showAddCategory() { this.state.editingItem = null; document.getElementById('category-name').value = ''; document.getElementById('category-flag').value = ''; document.getElementById('has-discount').checked = false; document.getElementById('category-icon').value = ''; document.getElementById('category-icon-preview').innerHTML = ''; document.getElementById('category-icon-preview').classList.add('hidden'); document.getElementById('add-category-modal').classList.remove('hidden'); },
    editCategory(id) { const c = this.state.categories.find(ca => ca.id === id); if (!c) return; this.state.editingItem = c; document.getElementById('category-name').value = c.name; document.getElementById('category-flag').value = c.flag || ''; document.getElementById('has-discount').checked = c.hasDiscount; if (c.icon) { document.getElementById('category-icon-preview').innerHTML = `<img src="${c.icon}">`; document.getElementById('category-icon-preview').classList.remove('hidden'); } document.getElementById('add-category-modal').classList.remove('hidden'); },
    closeAddCategory() { document.getElementById('add-category-modal').classList.add('hidden'); this.state.editingItem = null; },
    async saveCategory() { const name = document.getElementById('category-name').value.trim(); const flag = document.getElementById('category-flag').value; const hasDiscount = document.getElementById('has-discount').checked; const iconInput = document.getElementById('category-icon'); if (!name) { Utils.showToast('Enter name', 'warning'); return; } Utils.showLoading('Saving...'); try { let icon = this.state.editingItem?.icon || ''; if (iconInput.files[0]) icon = await Utils.compressImage(iconInput.files[0], 200, 0.8); if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; } const data = { name, flag, hasDiscount, icon }; if (this.state.editingItem) await Database.updateCategory(this.state.editingItem.id, data); else await Database.createCategory(data); await this.loadAdminData(); this.renderCategories(); this.closeAddCategory(); Utils.showToast('Saved!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async deleteCategory(id) { if (!confirm('Delete category and products?')) return; Utils.showLoading('...'); try { await Database.deleteCategory(id); await this.loadAdminData(); this.renderCategories(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== PRODUCTS =====
    renderProducts() { const c = document.getElementById('admin-products-list'); const fs = document.getElementById('filter-category'); if (!c) return; if (fs) { const v = fs.value; fs.innerHTML = '<option value="all">All</option>' + this.state.categories.map(ca => `<option value="${ca.id}">${ca.name}</option>`).join(''); fs.value = v || 'all'; } let f = [...this.state.products]; if (fs && fs.value !== 'all') f = f.filter(p => p.categoryId === fs.value); if (f.length === 0) { c.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><p>No products</p></div>'; return; } c.innerHTML = f.map(p => { const cat = this.state.categories.find(ca => ca.id === p.categoryId); return `<div class="product-card"><div class="product-icon"><img src="${p.icon}" alt="">${p.discount > 0 ? `<span class="discount-tag">-${p.discount}%</span>` : ''}</div><div class="product-info"><h4>${p.name}</h4><p>${cat?.name || '?'}</p><div class="product-price">${p.discount > 0 ? `<span class="original">${Utils.formatCurrency(p.price, p.currency)}</span>` : ''}<span class="current">${Utils.formatCurrency(p.discountedPrice || p.price, p.currency)}</span></div>${p.serviceId ? `<p class="product-api-info"><i class="fas fa-bolt"></i> #${p.serviceId}</p>` : ''}</div><div class="product-actions"><button class="action-btn edit" onclick="AdminApp.editProduct('${p.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`; }).join(''); },
    showAddProduct() { this.state.editingItem = null; document.getElementById('product-modal-title').textContent = 'Add Product'; document.getElementById('product-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); ['product-name','product-price','product-discount','product-service-id','product-g2bulk-rate','product-g2bulk-min','product-g2bulk-max'].forEach(id => document.getElementById(id).value = ''); document.getElementById('product-currency').value = 'MMK'; document.getElementById('product-delivery').value = 'instant'; document.getElementById('product-icon').value = ''; document.getElementById('product-icon-preview').innerHTML = ''; document.getElementById('product-icon-preview').classList.add('hidden'); document.getElementById('service-lookup-result').classList.add('hidden'); document.getElementById('add-product-modal').classList.remove('hidden'); },
    editProduct(id) { const p = this.state.products.find(pr => pr.id === id); if (!p) return; this.state.editingItem = p; document.getElementById('product-modal-title').textContent = 'Edit Product'; document.getElementById('product-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}" ${c.id === p.categoryId ? 'selected' : ''}>${c.name}</option>`).join(''); document.getElementById('product-name').value = p.name; document.getElementById('product-price').value = p.price; document.getElementById('product-currency').value = p.currency; document.getElementById('product-discount').value = p.discount || ''; document.getElementById('product-delivery').value = p.deliveryTime; document.getElementById('product-service-id').value = p.serviceId || ''; document.getElementById('product-g2bulk-rate').value = p.g2bulkRate || ''; document.getElementById('product-g2bulk-min').value = p.g2bulkMin || ''; document.getElementById('product-g2bulk-max').value = p.g2bulkMax || ''; if (p.icon) { document.getElementById('product-icon-preview').innerHTML = `<img src="${p.icon}">`; document.getElementById('product-icon-preview').classList.remove('hidden'); } document.getElementById('add-product-modal').classList.remove('hidden'); },
    closeAddProduct() { document.getElementById('add-product-modal').classList.add('hidden'); this.state.editingItem = null; },
    async lookupServiceId() { const sid = document.getElementById('product-service-id').value; if (!sid) { Utils.showToast('Enter ID', 'warning'); return; } const rd = document.getElementById('service-lookup-result'); rd.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...'; rd.classList.remove('hidden'); try { if (!this.state.g2bulkServicesRaw.length) { const r = await G2BulkAPI.getServices(); this.state.g2bulkServicesRaw = r || []; } const s = this.state.g2bulkServicesRaw.find(sv => String(sv.service) === String(sid)); if (s) { rd.innerHTML = `<div class="service-found"><i class="fas fa-check-circle"></i><div><strong>${s.name}</strong><br>$${s.rate} | Min:${s.min} | Max:${s.max}</div></div>`; rd.className = 'service-lookup-result valid'; document.getElementById('product-g2bulk-rate').value = s.rate; document.getElementById('product-g2bulk-min').value = s.min; document.getElementById('product-g2bulk-max').value = s.max; if (!document.getElementById('product-name').value) document.getElementById('product-name').value = s.name; } else { rd.innerHTML = '<i class="fas fa-times-circle"></i> Not found'; rd.className = 'service-lookup-result invalid'; } } catch (e) { rd.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed'; } },
    async openG2BulkServiceBrowser() { document.getElementById('g2bulk-browser-modal').classList.remove('hidden'); if (!this.state.g2bulkServicesRaw.length) { document.getElementById('g2bulk-browser-list').innerHTML = '<p>Loading...</p>'; try { this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || []; } catch (e) { document.getElementById('g2bulk-browser-list').innerHTML = '<p>Failed</p>'; return; } } this.renderBrowserServices(this.state.g2bulkServicesRaw.slice(0, 50)); },
    closeG2BulkBrowser() { document.getElementById('g2bulk-browser-modal').classList.add('hidden'); },
    renderBrowserServices(ss) { const c = document.getElementById('g2bulk-browser-list'); if (!ss.length) { c.innerHTML = '<p>None</p>'; return; } c.innerHTML = ss.slice(0, 100).map(s => `<div class="g2bulk-browser-item" onclick="AdminApp.selectBrowserService(${s.service})"><div class="service-id">#${s.service}</div><div class="service-info"><strong>${s.name}</strong><br><small>$${s.rate}</small></div><button class="btn btn-sm btn-primary"><i class="fas fa-check"></i></button></div>`).join(''); },
    filterBrowserServices() { const q = document.getElementById('g2bulk-browser-search').value.toLowerCase(); this.renderBrowserServices(this.state.g2bulkServicesRaw.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q))); },
    selectBrowserService(sid) { const s = this.state.g2bulkServicesRaw.find(sv => sv.service === sid); if (!s) return; document.getElementById('product-service-id').value = s.service; document.getElementById('product-g2bulk-rate').value = s.rate; document.getElementById('product-g2bulk-min').value = s.min; document.getElementById('product-g2bulk-max').value = s.max; if (!document.getElementById('product-name').value) document.getElementById('product-name').value = s.name; this.closeG2BulkBrowser(); Utils.showToast(`Selected #${s.service}`, 'success'); },
    async saveProduct() { const categoryId = document.getElementById('product-category').value; const name = document.getElementById('product-name').value.trim(); const price = parseFloat(document.getElementById('product-price').value); const currency = document.getElementById('product-currency').value; const discount = parseInt(document.getElementById('product-discount').value) || 0; const deliveryTime = document.getElementById('product-delivery').value; const serviceId = document.getElementById('product-service-id').value; const g2bulkRate = document.getElementById('product-g2bulk-rate').value; const g2bulkMin = document.getElementById('product-g2bulk-min').value; const g2bulkMax = document.getElementById('product-g2bulk-max').value; const iconInput = document.getElementById('product-icon'); if (!categoryId || !name || isNaN(price)) { Utils.showToast('Fill fields', 'warning'); return; } Utils.showLoading('Saving...'); try { let icon = this.state.editingItem?.icon || ''; if (iconInput.files[0]) { const fd = new FormData(); fd.append('image', iconInput.files[0]); const r = await fetch('https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c', { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Upload failed'); icon = res.data.url; } if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; } const data = { categoryId, name, price, currency, discount, deliveryTime, icon, serviceId: serviceId ? parseInt(serviceId) : null, g2bulkRate: g2bulkRate || null, g2bulkMin: g2bulkMin ? parseInt(g2bulkMin) : null, g2bulkMax: g2bulkMax ? parseInt(g2bulkMax) : null }; if (this.state.editingItem) await Database.updateProduct(this.state.editingItem.id, data); else await Database.createProduct(data); await this.loadAdminData(); this.renderProducts(); this.closeAddProduct(); Utils.showToast('Saved!', 'success'); } catch (e) { Utils.showToast('Failed: ' + e.message, 'error'); } finally { Utils.hideLoading(); } },
    async deleteProduct(id) { if (!confirm('Delete?')) return; Utils.showLoading('...'); try { await Database.deleteProduct(id); await this.loadAdminData(); this.renderProducts(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== G2BULK PAGE =====
    renderG2BulkPage() { this.refreshApiBalance(); if (this.state.g2bulkServicesRaw.length) this.renderG2BulkServicesList(this.state.g2bulkServicesRaw); },
    async refreshG2BulkServices() { Utils.showLoading('Loading...'); try { this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || []; const cats = [...new Set(this.state.g2bulkServicesRaw.map(s => s.category).filter(Boolean))].sort(); const cf = document.getElementById('g2bulk-category-filter'); if (cf) cf.innerHTML = '<option value="all">All</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join(''); this.renderG2BulkServicesList(this.state.g2bulkServicesRaw); Utils.showToast(`${this.state.g2bulkServicesRaw.length} services loaded`, 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    filterG2BulkServices() { const q = (document.getElementById('g2bulk-search')?.value || '').toLowerCase(); const cf = document.getElementById('g2bulk-category-filter')?.value || 'all'; let f = [...this.state.g2bulkServicesRaw]; if (cf !== 'all') f = f.filter(s => s.category === cf); if (q) f = f.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q)); this.renderG2BulkServicesList(f); },
    renderG2BulkServicesList(ss) { const c = document.getElementById('g2bulk-services-list'); const ce = document.getElementById('g2bulk-services-count'); if (ce) ce.textContent = `${ss.length} services`; if (!ss.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No services</p></div>'; return; } c.innerHTML = ss.slice(0, 200).map(s => `<div class="g2bulk-service-card"><div class="service-header"><span class="service-id-badge">#${s.service}</span><span class="service-category-badge">${s.category || 'N/A'}</span></div><div class="service-name">${s.name}</div><div class="service-details"><div class="service-detail"><span>Rate:</span><strong>$${s.rate}</strong></div><div class="service-detail"><span>Min:</span><strong>${s.min}</strong></div><div class="service-detail"><span>Max:</span><strong>${s.max}</strong></div></div><button class="btn btn-primary btn-sm btn-full" onclick="AdminApp.quickAddProduct(${s.service})"><i class="fas fa-plus"></i> Add</button></div>`).join(''); },
    quickAddProduct(sid) { const s = this.state.g2bulkServicesRaw.find(sv => sv.service === sid); if (!s) return; this.showAddProduct(); document.getElementById('product-service-id').value = s.service; document.getElementById('product-name').value = s.name; document.getElementById('product-g2bulk-rate').value = s.rate; document.getElementById('product-g2bulk-min').value = s.min; document.getElementById('product-g2bulk-max').value = s.max; },
    
    // ===== BANNERS =====
    renderBanners() { this.renderBannerType(this.state.currentBannerType); },
    renderBannerType(type) { this.state.currentBannerType = type; document.querySelectorAll('.banner-tabs .tab-btn').forEach(b => b.classList.remove('active')); const at = document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`); if (at) at.classList.add('active'); document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1'); document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2'); const banners = type === 'type1' ? (this.state.banners.type1 || []) : (this.state.banners.type2 || []); const c = document.getElementById(`banners-${type}-list`); if (!c) return; if (!banners.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No banners</p></div>'; return; } c.innerHTML = banners.map(b => { const cat = type === 'type2' ? this.state.categories.find(ca => ca.id === b.categoryId) : null; return `<div class="banner-card"><img src="${b.image}" alt=""><div class="banner-info">${cat ? `<p>${cat.name}</p>` : ''}${b.description ? `<p>${b.description.substring(0, 100)}</p>` : ''}</div><button class="btn btn-danger btn-sm" onclick="AdminApp.deleteBanner('${b.id}','${type}')"><i class="fas fa-trash"></i></button></div>`; }).join(''); },
    showAddBanner(type) { this.state.currentBannerType = type; document.getElementById('banner-category-group').style.display = type === 'type2' ? 'block' : 'none'; document.getElementById('banner-text-group').style.display = type === 'type2' ? 'block' : 'none'; if (type === 'type2') document.getElementById('banner-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); document.getElementById('banner-image').value = ''; document.getElementById('banner-text').value = ''; document.getElementById('banner-image-preview').innerHTML = ''; document.getElementById('banner-image-preview').classList.add('hidden'); document.getElementById('add-banner-modal').classList.remove('hidden'); },
    closeAddBanner() { document.getElementById('add-banner-modal').classList.add('hidden'); },
    async saveBanner() { const type = this.state.currentBannerType; const ii = document.getElementById('banner-image'); const ci = document.getElementById('banner-category')?.value; const desc = document.getElementById('banner-text')?.value; if (!ii.files[0]) { Utils.showToast('Upload image', 'warning'); return; } if (type === 'type2' && !ci) { Utils.showToast('Select category', 'warning'); return; } Utils.showLoading('...'); try { const fd = new FormData(); fd.append('image', ii.files[0]); const r = await fetch('https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c', { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Failed'); const data = { image: res.data.url }; if (type === 'type2') { data.categoryId = ci; data.description = desc; } await Database.createBanner(data, type); await this.loadAdminData(); this.renderBanners(); this.closeAddBanner(); Utils.showToast('Created!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async deleteBanner(id, type) { if (!confirm('Delete?')) return; Utils.showLoading('...'); try { await Database.deleteBanner(id, type); await this.loadAdminData(); this.renderBanners(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== INPUT TABLES (FREE Game ID Checker - No API Key) =====
    
    renderInputTables() {
        const c = document.getElementById('admin-input-tables-list');
        if (!c) return;
        if (!this.state.inputTables.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-keyboard"></i><p>No input tables yet</p></div>'; return; }
        
        c.innerHTML = this.state.inputTables.map(table => {
            const cat = this.state.categories.find(ca => ca.id === table.categoryId);
            let gameInfo = '';
            if (table.checkerEnabled && table.checkerConfig) {
                let config = table.checkerConfig;
                if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) {} }
                if (config?._preset) {
                    gameInfo = `<div class="checker-game-badge"><span class="game-icon">${config._preset.gameIcon}</span><span class="game-name">${config._preset.gameName}</span><span class="checker-active-badge"><i class="fas fa-check-circle"></i> Free API</span></div>`;
                } else if (config) {
                    gameInfo = `<div class="checker-game-badge custom"><span class="game-icon">🔧</span><span class="game-name">Custom Checker</span><span class="checker-active-badge"><i class="fas fa-check-circle"></i> Active</span></div>`;
                }
            }
            return `<div class="input-table-card"><div class="input-table-icon"><i class="fas fa-keyboard"></i></div><div class="input-table-info"><h4>${table.name}</h4><p>${cat?.name || '?'}</p><p class="placeholder">"${table.placeholder}"</p>${gameInfo}</div><div class="input-table-actions"><button class="action-btn edit" onclick="AdminApp.editInputTable('${table.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteInputTable('${table.id}')"><i class="fas fa-trash"></i></button></div></div>`;
        }).join('');
    },
    
    showAddInputTable() {
        this.state.editingItem = null;
        this.state.selectedGamePreset = null;
        this.state.checkerMode = 'preset';
        document.getElementById('input-table-modal-title').textContent = 'Add Input Table';
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('checker-enabled').checked = false;
        this.buildCheckerSection();
        document.getElementById('checker-json-section').classList.add('hidden');
        document.getElementById('checker-test-section').classList.add('hidden');
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    editInputTable(id) {
        const table = this.state.inputTables.find(t => t.id === id);
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
            if (config?._preset?.gameId) {
                this.state.selectedGamePreset = config._preset.gameId;
                this.state.checkerMode = 'preset';
                const gs = document.getElementById('checker-game-select');
                if (gs) gs.value = config._preset.gameId;
                this.onGamePresetChange(config._preset.gameId);
            } else {
                this.state.checkerMode = 'custom';
                this.toggleCheckerMode(true);
                const ta = document.getElementById('checker-json-config');
                if (ta) ta.value = JSON.stringify(config, null, 2);
                this.previewCheckerConfig();
            }
        } else {
            document.getElementById('checker-json-section').classList.add('hidden');
            document.getElementById('checker-test-section').classList.add('hidden');
        }
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    buildCheckerSection() {
        const section = document.getElementById('checker-json-section');
        if (!section) return;
        
        section.innerHTML = `
            <div class="api-key-status connected">
                <div class="api-key-status-icon"><i class="fas fa-check-circle"></i></div>
                <div class="api-key-status-info">
                    <strong>🆓 Free Game ID Checker</strong>
                    <small>No API key required! Select a game and it works automatically.</small>
                </div>
            </div>
            
            <div class="checker-mode-toggle-group">
                <label class="mode-label ${this.state.checkerMode === 'preset' ? 'active' : ''}" onclick="AdminApp.toggleCheckerMode(false)">
                    <i class="fas fa-gamepad"></i> Select Game
                </label>
                <label class="mode-label ${this.state.checkerMode === 'custom' ? 'active' : ''}" onclick="AdminApp.toggleCheckerMode(true)">
                    <i class="fas fa-code"></i> Custom JSON
                </label>
            </div>
            
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
            
            <div id="checker-custom-mode" class="${this.state.checkerMode === 'preset' ? 'hidden' : ''}">
                <div class="form-group">
                    <label><i class="fas fa-code"></i> Custom JSON Config</label>
                    <textarea id="checker-json-config" class="code-textarea" rows="14" placeholder='Paste your custom checker JSON config here...' oninput="onCheckerJsonInput()"></textarea>
                    <div class="json-help-tags">
                        <span class="help-tag"><code>{{value}}</code> = This field</span>
                        <span class="help-tag"><code>{{Field Name}}</code> = Another field</span>
                    </div>
                </div>
            </div>
            
            <div id="checker-json-preview" class="checker-json-preview hidden"></div>
        `;
        
        const testSection = document.getElementById('checker-test-section');
        if (testSection) {
            testSection.innerHTML = `
                <div class="form-section-divider small"><div class="divider-line"></div><span class="divider-text"><i class="fas fa-flask"></i> Test Checker</span><div class="divider-line"></div></div>
                <div class="form-group">
                    <div class="test-checker-inputs">
                        <input type="text" id="checker-test-value" placeholder="Enter test Game ID">
                        <div id="checker-test-extra-inputs" class="test-extra-inputs hidden"></div>
                    </div>
                    <button class="btn btn-primary btn-sm test-run-btn" onclick="testChecker()"><i class="fas fa-play"></i> Run Test</button>
                </div>
                <div id="checker-test-result" class="checker-test-result hidden"></div>
            `;
        }
    },
    
    toggleCheckerMode(isCustom) {
        this.state.checkerMode = isCustom ? 'custom' : 'preset';
        const am = document.getElementById('checker-auto-mode');
        const cm = document.getElementById('checker-custom-mode');
        if (am) am.classList.toggle('hidden', isCustom);
        if (cm) cm.classList.toggle('hidden', !isCustom);
        document.querySelectorAll('.mode-label').forEach((l, i) => l.classList.toggle('active', i === (isCustom ? 1 : 0)));
        if (isCustom && this.state.selectedGamePreset) {
            const config = GameCheckerPresets.generateConfig(this.state.selectedGamePreset);
            if (config) { const ta = document.getElementById('checker-json-config'); if (ta) ta.value = JSON.stringify(config, null, 2); }
        }
    },
    
    onGamePresetChange(gameId) {
        this.state.selectedGamePreset = gameId;
        const infoDiv = document.getElementById('game-preset-info');
        const testExtra = document.getElementById('checker-test-extra-inputs');
        
        if (!gameId || !infoDiv) { if (infoDiv) infoDiv.classList.add('hidden'); if (testExtra) { testExtra.classList.add('hidden'); testExtra.innerHTML = ''; } return; }
        
        const game = GameCheckerPresets.getGame(gameId);
        if (!game) return;
        
        // Auto-fill name and placeholder
        const mainField = game.fields.find(f => f.isMain);
        if (mainField) {
            const ni = document.getElementById('input-table-name');
            const pi = document.getElementById('input-table-placeholder');
            if (ni && !ni.value) ni.value = mainField.name;
            if (pi && !pi.value) pi.value = mainField.placeholder;
        }
        
        const additionalFields = game.fields.filter(f => !f.isMain);
        infoDiv.innerHTML = `
            <div class="game-info-card">
                <div class="game-info-header"><span class="game-big-icon">${game.icon}</span><div><h4>${game.name}</h4><span class="auto-configured-badge"><i class="fas fa-magic"></i> Auto Configured • 🆓 Free</span></div></div>
                <div class="game-info-details">
                    <div class="game-info-item"><i class="fas fa-check-circle"></i><span>Main: <strong>${mainField?.name || 'User ID'}</strong></span></div>
                    ${additionalFields.length ? `<div class="game-info-item"><i class="fas fa-plus-circle"></i><span>Also needs: <strong>${additionalFields.map(f => f.name).join(', ')}</strong></span></div><div class="game-info-note"><i class="fas fa-info-circle"></i><span>Create separate input tables for "${additionalFields[0].name}"</span></div>` : ''}
                    <div class="game-info-item"><i class="fas fa-bolt"></i><span>Auto verifies: <strong>Nickname</strong> instantly</span></div>
                </div>
            </div>
        `;
        infoDiv.classList.remove('hidden');
        
        // Preview
        const config = GameCheckerPresets.generateConfig(gameId);
        const pd = document.getElementById('checker-json-preview');
        if (config && pd) {
            pd.innerHTML = `<div class="json-preview-card"><h4><i class="fas fa-check-circle" style="color:var(--success);"></i> Ready</h4><div class="preview-grid"><div class="preview-item"><span class="preview-label">Game</span><span class="preview-value">${game.icon} ${game.name}</span></div><div class="preview-item"><span class="preview-label">API</span><span class="preview-value">🆓 Free (No key)</span></div><div class="preview-item"><span class="preview-label">Method</span><span class="preview-value"><span class="method-badge get">GET</span></span></div><div class="preview-item"><span class="preview-label">Checks</span><span class="preview-value">✅ Nickname ✅ Valid/Invalid</span></div></div></div>`;
            pd.classList.remove('hidden');
        }
        
        // Test extra inputs
        if (testExtra) {
            if (additionalFields.length) {
                testExtra.innerHTML = additionalFields.map(f => `<div class="test-extra-input"><label>${f.name}</label><input type="text" id="checker-test-${f.paramKey}" placeholder="Test ${f.name}"></div>`).join('');
                testExtra.classList.remove('hidden');
            } else { testExtra.innerHTML = ''; testExtra.classList.add('hidden'); }
        }
        document.getElementById('checker-test-section')?.classList.remove('hidden');
    },
    
    previewCheckerConfig() {
        const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
        const pd = document.getElementById('checker-json-preview');
        if (!jsonStr || !pd) { if (pd) pd.classList.add('hidden'); return; }
        try {
            const config = JSON.parse(jsonStr);
            const url = config.url || config.apiUrl || 'N/A';
            const method = (config.method || 'GET').toUpperCase();
            const rp = config.responsePath || config.response || {};
            pd.innerHTML = `<div class="json-preview-card"><h4><i class="fas fa-check-circle" style="color:var(--success);"></i> Valid JSON</h4><div class="preview-grid"><div class="preview-item"><span class="preview-label">URL</span><span class="preview-value url">${url}</span></div><div class="preview-item"><span class="preview-label">Method</span><span class="preview-value"><span class="method-badge ${method.toLowerCase()}">${method}</span></span></div></div></div>`;
            pd.classList.remove('hidden');
            document.getElementById('checker-test-section')?.classList.remove('hidden');
        } catch (e) {
            pd.innerHTML = `<div class="json-preview-card error"><h4><i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i> Invalid JSON</h4><p>${e.message}</p></div>`;
            pd.classList.remove('hidden');
        }
    },
    
    closeAddInputTable() { document.getElementById('add-input-table-modal').classList.add('hidden'); this.state.editingItem = null; this.state.selectedGamePreset = null; },
    
    // SAVE - generates config from preset (NO API KEY)
    async saveInputTable() {
        const categoryId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const placeholder = document.getElementById('input-table-placeholder').value.trim();
        const checkerEnabled = document.getElementById('checker-enabled').checked;
        if (!categoryId || !name || !placeholder) { Utils.showToast('Fill all fields', 'warning'); return; }
        
        let checkerConfig = null;
        if (checkerEnabled) {
            if (this.state.checkerMode === 'preset' && this.state.selectedGamePreset) {
                checkerConfig = GameCheckerPresets.generateConfig(this.state.selectedGamePreset);
                if (!checkerConfig) { Utils.showToast('Failed to generate config', 'error'); return; }
            } else {
                const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
                if (!jsonStr) { Utils.showToast('Enter JSON config', 'warning'); return; }
                try { checkerConfig = JSON.parse(jsonStr); if (!checkerConfig.url && !checkerConfig.apiUrl) { Utils.showToast('Config needs "url"', 'warning'); return; } }
                catch (e) { Utils.showToast('Invalid JSON: ' + e.message, 'error'); return; }
            }
        }
        
        Utils.showLoading('Saving...');
        try {
            const data = { categoryId, name, placeholder, checkerEnabled, checkerConfig };
            if (this.state.editingItem) await Database.updateInputTable(this.state.editingItem.id, data);
            else await Database.createInputTable(data);
            await this.loadAdminData(); this.renderInputTables(); this.closeAddInputTable(); Utils.showToast('Saved!', 'success');
        } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    
    async deleteInputTable(id) { if (!confirm('Delete?')) return; Utils.showLoading('...'); try { await Database.deleteInputTable(id); await this.loadAdminData(); this.renderInputTables(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // TEST CHECKER
    async testChecker() {
        const testValue = document.getElementById('checker-test-value')?.value?.trim();
        if (!testValue) { Utils.showToast('Enter test ID', 'warning'); return; }
        const rd = document.getElementById('checker-test-result');
        rd.innerHTML = '<div class="test-result-card loading"><div class="checker-loading-content"><div class="checker-spinner"></div><span>Verifying...</span></div></div>';
        rd.classList.remove('hidden');
        
        try {
            let config;
            if (this.state.checkerMode === 'preset' && this.state.selectedGamePreset) {
                config = GameCheckerPresets.generateConfig(this.state.selectedGamePreset);
            } else {
                const jsonStr = document.getElementById('checker-json-config')?.value?.trim();
                if (!jsonStr) { rd.innerHTML = '<div class="test-result-card error">No config</div>'; return; }
                try { config = JSON.parse(jsonStr); } catch(e) { rd.innerHTML = `<div class="test-result-card error">Invalid JSON</div>`; return; }
            }
            if (!config) { rd.innerHTML = '<div class="test-result-card error">No config</div>'; return; }
            
            // Build test input values
            const testInputValues = {};
            if (this.state.selectedGamePreset) {
                const game = GameCheckerPresets.getGame(this.state.selectedGamePreset);
                if (game) game.fields.filter(f => !f.isMain).forEach(f => {
                    const el = document.getElementById(`checker-test-${f.paramKey}`);
                    if (el) testInputValues[f.name] = el.value || '';
                });
            }
            
            const result = await GameIdChecker.check(config, testValue, testInputValues);
            
            if (result && result.valid) {
                let info = '';
                if (result.nickname) info += `<div class="test-info-row"><span>Nickname:</span><strong>${result.nickname}</strong></div>`;
                if (result.country) info += `<div class="test-info-row"><span>Country:</span><strong>${CountryHelper.getDisplay(result.country)}</strong></div>`;
                rd.innerHTML = `<div class="test-result-card valid"><div class="test-result-header valid"><i class="fas fa-check-circle"></i> ✅ Account Found!</div><div class="test-result-body">${info}<details class="raw-response"><summary>Raw Response</summary><pre>${JSON.stringify(result.raw, null, 2)}</pre></details></div></div>`;
            } else {
                rd.innerHTML = `<div class="test-result-card invalid"><div class="test-result-header invalid"><i class="fas fa-times-circle"></i> ❌ Not Found</div><div class="test-result-body">${result?.error ? `<p>${result.error}</p>` : ''}<details class="raw-response"><summary>Raw Response</summary><pre>${JSON.stringify(result?.raw || {}, null, 2)}</pre></details></div></div>`;
            }
        } catch (e) { rd.innerHTML = `<div class="test-result-card error"><p>${e.message}</p></div>`; }
    },
    
    // ===== PAYMENTS =====
    renderPayments() { const c = document.getElementById('admin-payments-list'); if (!c) return; if (!this.state.payments.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payments</p></div>'; return; } c.innerHTML = this.state.payments.map(p => `<div class="payment-card"><div class="payment-icon"><img src="${p.icon}" alt=""></div><div class="payment-info"><h4>${p.name}</h4><p>${p.address}</p><p>${p.accountName}</p></div><div class="payment-actions"><button class="action-btn edit" onclick="AdminApp.editPayment('${p.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deletePayment('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`).join(''); },
    showAddPayment() { this.state.editingItem = null; ['payment-name','payment-address','payment-account-name','payment-note'].forEach(id => document.getElementById(id).value = ''); document.getElementById('payment-icon').value = ''; document.getElementById('payment-icon-preview').innerHTML = ''; document.getElementById('payment-icon-preview').classList.add('hidden'); document.getElementById('add-payment-modal').classList.remove('hidden'); },
    editPayment(id) { const p = this.state.payments.find(pm => pm.id === id); if (!p) return; this.state.editingItem = p; document.getElementById('payment-name').value = p.name; document.getElementById('payment-address').value = p.address; document.getElementById('payment-account-name').value = p.accountName; document.getElementById('payment-note').value = p.note || ''; if (p.icon) { document.getElementById('payment-icon-preview').innerHTML = `<img src="${p.icon}">`; document.getElementById('payment-icon-preview').classList.remove('hidden'); } document.getElementById('add-payment-modal').classList.remove('hidden'); },
    closeAddPayment() { document.getElementById('add-payment-modal').classList.add('hidden'); this.state.editingItem = null; },
    async savePayment() { const name = document.getElementById('payment-name').value.trim(); const address = document.getElementById('payment-address').value.trim(); const accountName = document.getElementById('payment-account-name').value.trim(); const note = document.getElementById('payment-note').value.trim(); const ii = document.getElementById('payment-icon'); if (!name || !address || !accountName) { Utils.showToast('Fill fields', 'warning'); return; } Utils.showLoading('...'); try { let icon = this.state.editingItem?.icon || ''; if (ii.files[0]) icon = await Utils.compressImage(ii.files[0], 200, 0.8); if (!icon && !this.state.editingItem) { Utils.showToast('Upload icon', 'warning'); Utils.hideLoading(); return; } const data = { name, address, accountName, note, icon }; if (this.state.editingItem) await Database.updatePaymentMethod(this.state.editingItem.id, data); else await Database.createPaymentMethod(data); await this.loadAdminData(); this.renderPayments(); this.closeAddPayment(); Utils.showToast('Saved!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async deletePayment(id) { if (!confirm('Delete?')) return; Utils.showLoading('...'); try { await Database.deletePaymentMethod(id); await this.loadAdminData(); this.renderPayments(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== ANNOUNCEMENTS =====
    renderAnnouncements() { const ta = document.getElementById('announcement-text'); const ct = document.getElementById('current-announcement-text'); if (ta) ta.value = ''; if (ct) ct.textContent = this.state.settings.announcement || 'None'; },
    async saveAnnouncement() { const t = document.getElementById('announcement-text').value.trim(); if (!t) { Utils.showToast('Enter text', 'warning'); return; } Utils.showLoading('...'); try { await Database.updateSettings({ ...this.state.settings, announcement: t }); this.state.settings.announcement = t; document.getElementById('current-announcement-text').textContent = t; document.getElementById('announcement-text').value = ''; Utils.showToast('Saved!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== BROADCAST =====
    async sendBroadcast() { const msg = document.getElementById('broadcast-message').value.trim(); if (!msg) { Utils.showToast('Enter message', 'warning'); return; } if (!confirm(`Send to ${this.state.users.length} users?`)) return; Utils.showLoading('...'); try { let photo = null; const ii = document.getElementById('broadcast-image'); if (ii.files[0]) photo = await Utils.compressImage(ii.files[0], 800, 0.8); const r = await TelegramBot.broadcast(this.state.users.map(u => u.telegramId), msg, photo); Utils.showToast(`${r.success} sent, ${r.failed} failed`, 'success'); document.getElementById('broadcast-message').value = ''; } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== BANNED =====
    renderBannedUsers() { const c = document.getElementById('admin-banned-list'); if (!c) return; if (!this.state.bannedUsers.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><p>None</p></div>'; return; } c.innerHTML = this.state.bannedUsers.map(u => `<div class="banned-card"><div class="banned-icon"><i class="fas fa-user-slash"></i></div><div class="banned-info"><h4>${u.firstName || 'User'}</h4><p>${u.telegramId}</p><p class="reason">${u.reason}</p></div><button class="btn btn-success btn-sm" onclick="AdminApp.unbanUser('${u.telegramId}')"><i class="fas fa-check"></i> Unban</button></div>`).join(''); },
    async unbanUser(tid) { if (!confirm('Unban?')) return; Utils.showLoading('...'); try { await Database.unbanUser(tid); await TelegramBot.notifyUnban(tid); await this.loadAdminData(); this.renderBannedUsers(); Utils.showToast('Unbanned!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== EMOJIS =====
    renderCustomEmojis() { const c = document.getElementById('admin-emojis-list'); if (!c) return; const emojis = this.state.settings?.customEmojis || []; if (!emojis.length) { c.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-smile-wink"></i><p>None</p></div>'; return; } c.innerHTML = emojis.map(e => `<div class="emoji-card"><button class="delete-btn" onclick="AdminApp.deleteCustomEmoji('${e.id}')"><i class="fas fa-trash"></i></button><div class="trigger-emoji">${e.trigger}</div><div class="emoji-arrow"><i class="fas fa-arrow-down"></i></div><img class="emoji-preview" src="${e.imageUrl}" alt=""><div class="emoji-name">${e.name || ''}</div></div>`).join(''); },
    showAddEmoji() { document.getElementById('emoji-name').value = ''; document.getElementById('emoji-trigger').value = ''; document.getElementById('emoji-file').value = ''; document.getElementById('emoji-file-preview').innerHTML = ''; document.getElementById('emoji-file-preview').classList.add('hidden'); document.getElementById('add-emoji-modal').classList.remove('hidden'); this.loadEmojiPicker(); },
    closeAddEmoji() { document.getElementById('add-emoji-modal').classList.add('hidden'); },
    loadEmojiPicker() { const es = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😝','🤑','🤗','😏','😒','🙄','😬','🤯','😳','😱','😨','😢','😭','😤','😠','😡','😈','💀','💩','🤡','👻','👽','👾','🤖','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','⭐','🌟','✨','💫','🔥','💥','💦','💣','👍','👎','✊','👊','👏','🙌','🤝','🙏','🎮','🕹️','🎰','🎲','🧩','🎯','💎','💰','💵','💸','💳','🏆','🥇','🎁','🎉','🎊','⚡','☀️','🌙']; document.getElementById('emoji-picker-grid').innerHTML = es.map(e => `<div class="emoji-item" onclick="AdminApp.selectTriggerEmoji('${e}')">${e}</div>`).join(''); },
    selectTriggerEmoji(e) { document.getElementById('emoji-trigger').value = e; this.closeEmojiPicker(); },
    showEmojiPicker() { this.loadEmojiPicker(); document.getElementById('emoji-picker-modal').classList.remove('hidden'); },
    closeEmojiPicker() { document.getElementById('emoji-picker-modal').classList.add('hidden'); },
    async saveCustomEmoji() { const name = document.getElementById('emoji-name').value.trim(); const trigger = document.getElementById('emoji-trigger').value; const fi = document.getElementById('emoji-file'); if (!trigger) { Utils.showToast('Select trigger', 'warning'); return; } if (!fi.files[0]) { Utils.showToast('Upload image', 'warning'); return; } if ((this.state.settings?.customEmojis || []).find(e => e.trigger === trigger)) { Utils.showToast('Already used', 'warning'); return; } Utils.showLoading('...'); try { const fd = new FormData(); fd.append('image', fi.files[0]); const r = await fetch('https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c', { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Failed'); const s = this.state.settings || {}; if (!s.customEmojis) s.customEmojis = []; s.customEmojis.push({ id: 'e_' + Date.now().toString(36), trigger, imageUrl: res.data.url, name, type: 'image', createdAt: new Date().toISOString() }); await Database.updateSettings(s); this.state.settings = s; this.closeAddEmoji(); this.renderCustomEmojis(); Utils.showToast('Created!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    async deleteCustomEmoji(id) { if (!confirm('Delete?')) return; Utils.showLoading('...'); try { const s = this.state.settings; s.customEmojis = (s.customEmojis || []).filter(e => e.id !== id); await Database.updateSettings(s); this.renderCustomEmojis(); Utils.showToast('Deleted!', 'success'); } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); } },
    
    // ===== SETTINGS =====
    renderSettings() {
        const ni = document.getElementById('website-name');
        const cl = document.getElementById('current-logo');
        if (ni) ni.value = this.state.settings.websiteName || '';
        if (this.state.settings.websiteLogo && cl) { cl.src = this.state.settings.websiteLogo; document.getElementById('logo-preview')?.classList.remove('hidden'); }
    },
    async saveSettings() {
        const websiteName = document.getElementById('website-name').value.trim();
        const logoInput = document.getElementById('website-logo');
        Utils.showLoading('Saving...');
        try {
            const updates = { ...this.state.settings };
            if (websiteName) updates.websiteName = websiteName;
            if (logoInput.files[0]) { const fd = new FormData(); fd.append('image', logoInput.files[0]); const r = await fetch('https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c', { method: 'POST', body: fd }); const res = await r.json(); if (!res.success) throw new Error('Failed'); updates.websiteLogo = res.data.url; }
            await Database.updateSettings(updates); this.state.settings = updates; Utils.showToast('Saved!', 'success');
        } catch (e) { Utils.showToast('Failed', 'error'); } finally { Utils.hideLoading(); }
    },
    
    // ===== DATABASE IDS =====
    renderDatabaseIds() { document.getElementById('main-bin-id').textContent = CONFIG.BINS.MAIN || 'Not set'; document.getElementById('users-bin-id').textContent = CONFIG.BINS.USERS || 'Not set'; document.getElementById('products-bin-id').textContent = CONFIG.BINS.PRODUCTS || 'Not set'; document.getElementById('categories-bin-id').textContent = CONFIG.BINS.CATEGORIES || 'Not set'; document.getElementById('orders-bin-id').textContent = CONFIG.BINS.ORDERS || 'Not set'; document.getElementById('settings-bin-id').textContent = CONFIG.BINS.MAIN || 'Not set'; document.getElementById('images-bin-id').textContent = CONFIG.BINS.IMAGES || 'Not set'; }
};

// ===== GLOBAL FUNCTIONS =====
function showAdminPage(p) { AdminApp.showAdminPage(p); }
function filterOrders(f) { AdminApp.filterOrders(f); }
function filterTopups(f) { AdminApp.filterTopups(f); }
function filterProductsByCategory() { AdminApp.renderProducts(); }
function showBannerType(t) { AdminApp.renderBannerType(t); }
function showAddCategory() { AdminApp.showAddCategory(); }
function closeAddCategory() { AdminApp.closeAddCategory(); }
function saveCategory() { AdminApp.saveCategory(); }
function showAddProduct() { AdminApp.showAddProduct(); }
function closeAddProduct() { AdminApp.closeAddProduct(); }
function saveProduct() { AdminApp.saveProduct(); }
function showAddBanner(t) { AdminApp.showAddBanner(t); }
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
function toggleCheckerConfig() { const en = document.getElementById('checker-enabled').checked; document.getElementById('checker-json-section').classList.toggle('hidden', !en); document.getElementById('checker-test-section').classList.toggle('hidden', !en); if (en) AdminApp.buildCheckerSection(); }
function previewEmojiFile(e) { const f = e.target.files[0]; if (!f) return; if (!['image/png','image/jpeg','image/gif','image/webp'].includes(f.type)) { Utils.showToast('Invalid type', 'warning'); return; } const p = document.getElementById('emoji-file-preview'); const r = new FileReader(); r.onload = (ev) => { p.innerHTML = `<img src="${ev.target.result}"><button class="remove-file" onclick="removeEmojiFile()">Remove</button>`; p.classList.remove('hidden'); }; r.readAsDataURL(f); }
function removeEmojiFile() { document.getElementById('emoji-file').value = ''; const p = document.getElementById('emoji-file-preview'); p.innerHTML = ''; p.classList.add('hidden'); }
function closeUserDetails() { AdminApp.closeUserDetails(); }
function copyId(id) { Utils.copyToClipboard(document.getElementById(id).textContent); }
function triggerCategoryIconUpload() { document.getElementById('category-icon').click(); }
function triggerProductIconUpload() { document.getElementById('product-icon').click(); }
function triggerBannerUpload() { document.getElementById('banner-image').click(); }
function triggerPaymentIconUpload() { document.getElementById('payment-icon').click(); }
function triggerLogoUpload() { document.getElementById('website-logo').click(); }
function triggerBroadcastImageUpload() { document.getElementById('broadcast-image').click(); }

// ===== SHARED APIs =====
const G2BulkAPI = window.G2BulkAPI || { get URL() { return CONFIG.G2BULK.API_URL; }, get KEY() { return CONFIG.G2BULK.API_KEY; }, async request(a, p = {}) { const r = await fetch(this.URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: this.KEY, action: a, ...p }) }); return await r.json(); }, async getServices() { return await this.request('services'); }, async getBalance() { return await this.request('balance'); }, async placeOrder(s, l, q = 1) { return await this.request('add', { service: s, link: l, quantity: q }); }, async checkStatus(o) { return await this.request('status', { order: o }); }, isBalanceError(e) { if (!e) return false; const s = String(e).toLowerCase(); return ['insufficient','balance','not enough','funds','low balance'].some(k => s.includes(k)); } };
window.G2BulkAPI = G2BulkAPI;

const GameIdChecker = window.GameIdChecker || { async check(config, value, allInputValues = {}) { if (!config) return null; if (typeof config === 'string') { try { config = JSON.parse(config); } catch(e) { return null; } } const url = config.url || config.apiUrl; if (!url) return null; const method = (config.method || 'GET').toUpperCase(); const headers = config.headers || {}; try { let fetchUrl = url; let options = { method, headers: { ...headers } }; const se = (v) => String(v || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"'); if (method === 'POST') { if (config.body) { let bs = JSON.stringify(config.body); bs = bs.replace(/\{\{value\}\}/gi, se(value)); Object.entries(allInputValues).forEach(([n, v]) => { bs = bs.replace(new RegExp(`\\{\\{${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g'), se(v)); }); options.body = bs; } else if (config.bodyTemplate) { options.body = config.bodyTemplate.replace(/\{\{value\}\}/gi, se(value)); } } else { fetchUrl = fetchUrl.replace(/\{\{value\}\}/gi, encodeURIComponent(value)); Object.entries(allInputValues).forEach(([n, v]) => { fetchUrl = fetchUrl.replace(new RegExp(`\\{\\{${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g'), encodeURIComponent(v || '')); }); } const response = await fetch(fetchUrl, options); const data = await response.json(); let isValid = false, nickname = null, country = null; if (config.responsePath || config.response) { const rp = config.responsePath || config.response; const vv = rp.valid ? this.getNestedValue(data, rp.valid) : null; nickname = rp.nickname ? this.getNestedValue(data, rp.nickname) : null; country = rp.country ? this.getNestedValue(data, rp.country) : null; isValid = vv !== null && vv !== undefined ? !!vv : !!nickname; } else { nickname = config.responseNamePath ? this.getNestedValue(data, config.responseNamePath) : null; const vv = config.responseValidPath ? this.getNestedValue(data, config.responseValidPath) : null; isValid = vv !== null && vv !== undefined ? !!vv : !!nickname; } return { valid: isValid, nickname, playerName: nickname, country, raw: data }; } catch (e) { return { valid: false, nickname: null, playerName: null, country: null, error: e.message }; } }, getNestedValue(o, p) { if (!p) return null; return p.split('.').reduce((c, k) => c?.[k], o); }, getRequiredInputs(c) { if (!c) return []; if (typeof c === 'string') { try { c = JSON.parse(c); } catch(e) { return []; } } if (!c.body) return []; const s = JSON.stringify(c.body); const m = s.match(/\{\{([^}]+)\}\}/g) || []; return m.map(x => x.replace(/\{\{|\}\}/g, '')).filter(n => n.toLowerCase() !== 'value'); } };
window.GameIdChecker = GameIdChecker;

const CountryHelper = window.CountryHelper || { countries: { 'BD':'🇧🇩 Bangladesh','BR':'🇧🇷 Brazil','KH':'🇰🇭 Cambodia','CN':'🇨🇳 China','EG':'🇪🇬 Egypt','FR':'🇫🇷 France','DE':'🇩🇪 Germany','HK':'🇭🇰 Hong Kong','IN':'🇮🇳 India','ID':'🇮🇩 Indonesia','IR':'🇮🇷 Iran','IQ':'🇮🇶 Iraq','JP':'🇯🇵 Japan','KR':'🇰🇷 South Korea','MY':'🇲🇾 Malaysia','MM':'🇲🇲 Myanmar','NP':'🇳🇵 Nepal','NG':'🇳🇬 Nigeria','PK':'🇵🇰 Pakistan','PH':'🇵🇭 Philippines','RU':'🇷🇺 Russia','SA':'🇸🇦 Saudi Arabia','SG':'🇸🇬 Singapore','TH':'🇹🇭 Thailand','TR':'🇹🇷 Turkey','AE':'🇦🇪 UAE','GB':'🇬🇧 UK','US':'🇺🇸 USA','VN':'🇻🇳 Vietnam' }, getDisplay(c) { if (!c) return ''; c = String(c).toUpperCase().trim(); return this.countries[c] || `🌍 ${c}`; } };
window.CountryHelper = CountryHelper;

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    [{ input: 'category-icon', preview: 'category-icon-preview' }, { input: 'product-icon', preview: 'product-icon-preview' }, { input: 'banner-image', preview: 'banner-image-preview' }, { input: 'payment-icon', preview: 'payment-icon-preview' }, { input: 'broadcast-image', preview: 'broadcast-image-preview' }].forEach(({ input, preview }) => { document.getElementById(input)?.addEventListener('change', async (e) => { if (e.target.files[0]) { const p = document.getElementById(preview); const img = await Utils.compressImage(e.target.files[0], 400, 0.8); p.innerHTML = `<img src="${img}">`; p.classList.remove('hidden'); } }); });
    document.getElementById('website-logo')?.addEventListener('change', async (e) => { if (e.target.files[0]) { const img = await Utils.compressImage(e.target.files[0], 200, 0.9); document.getElementById('current-logo').src = img; document.getElementById('logo-preview').classList.remove('hidden'); } });
    AdminApp.init();
});
