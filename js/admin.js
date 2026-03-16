// ===== Admin Panel Application - Instant Local State (No Polling/Refresh) =====

const IMGBB_API_KEY = 'd3b0e9fd43ff0eb762987129a2f21e9c';

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
        bulkImportSelectedServices: new Set(),
        bulkImportFilteredServices: [],
        bulkImportIconBase64: null,
        bulkPriceSelectedProducts: new Set(),
        selectedProductIds: new Set(),
        dataLoaded: false
    },

    // ===== IMGBB UPLOAD =====
    async uploadToImgbb(file) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const result = await response.json();
        if (!result.success) throw new Error(result.error?.message || 'Image upload failed');
        return result.data.url;
    },

    // ===== INIT =====
    async init() {
        console.log('🚀 Initializing Admin Panel...');
        try {
            if (!TelegramApp.isInTelegram()) { this.showAccessDenied('This panel can only be accessed through Telegram'); return; }
            await TelegramApp.init();
            if (!TelegramApp.isAdmin()) { this.showAccessDenied('You don\'t have permission to access this panel'); return; }
            Utils.showLoading('Loading admin panel...');
            await this.loadAllData();
            this.state.dataLoaded = true;
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
        this.updateTime();
    },

    // Load ALL data once on init - no polling, no refresh
    async loadAllData() {
        try {
            const [settings, users, orders, topups, categories, products, banners, payments, inputTables, bannedUsers] = await Promise.all([
                Database.getSettings().catch(() => ({})),
                Database.getUsers().catch(() => []),
                Database.getOrders().catch(() => []),
                Database.getTopups().catch(() => []),
                Database.getCategories().catch(() => []),
                Database.getProducts().catch(() => []),
                Database.getBanners().catch(() => ({ type1: [], type2: [] })),
                Database.getPaymentMethods().catch(() => []),
                Database.getInputTables().catch(() => []),
                Database.getBannedUsers().catch(() => [])
            ]);
            this.state.settings = settings || {};
            this.state.users = users || [];
            this.state.orders = orders || [];
            this.state.topups = topups || [];
            this.state.categories = categories || [];
            this.state.products = products || [];
            this.state.banners = banners || { type1: [], type2: [] };
            this.state.payments = payments || [];
            this.state.inputTables = inputTables || [];
            this.state.bannedUsers = bannedUsers || [];
            this.state.customEmojis = this.state.settings?.customEmojis || [];
            this.computeStats();
            this.updateSidebarCounts();
        } catch (error) {
            console.error('Load all data error:', error);
            throw error;
        }
    },

    // Compute stats from local state
    computeStats() {
        const orders = this.state.orders;
        const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'completed');
        this.state.stats = {
            totalUsers: this.state.users.length,
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            processingOrders: orders.filter(o => o.status === 'processing').length,
            queuedOrders: orders.filter(o => o.status === 'queued').length,
            approvedOrders: approvedOrders.length,
            totalRevenue: approvedOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
            pendingTopups: this.state.topups.filter(t => t.status === 'pending').length
        };
    },

    updateSidebarCounts() {
        const usersCount = document.getElementById('users-count');
        const pendingOrders = document.getElementById('pending-orders');
        const pendingTopups = document.getElementById('pending-topups');
        if (usersCount) usersCount.textContent = this.state.users.length;
        if (pendingOrders) {
            const count = this.state.orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'queued').length;
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
        this.computeStats();
        document.getElementById('stat-users').textContent = this.state.stats.totalUsers;
        document.getElementById('stat-orders').textContent = this.state.stats.totalOrders;
        document.getElementById('stat-revenue').textContent = this.state.stats.totalRevenue;
        document.getElementById('stat-pending').textContent = this.state.stats.pendingOrders;
        const processingEl = document.getElementById('stat-processing');
        const queuedEl = document.getElementById('stat-queued');
        if (processingEl) processingEl.textContent = this.state.stats.processingOrders;
        if (queuedEl) queuedEl.textContent = this.state.stats.queuedOrders;
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

    getAvatar(id) { return `https://ui-avatars.com/api/?name=${id}&background=8b5cf6&color=fff&size=100`; },

    // ===== USERS =====
    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        if (this.state.users.length === 0) { tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No users yet</td></tr>'; return; }
        tbody.innerHTML = this.state.users.map(user => `<tr>
            <td><div class="user-cell"><img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}"><div class="user-cell-info"><h4>${user.firstName} ${user.lastName || ''}</h4><p>@${user.username || 'N/A'}</p></div></div></td>
            <td><code>${user.telegramId}</code></td><td><strong>${Utils.formatCurrency(user.balance, 'MMK')}</strong></td><td>${user.totalOrders || 0} orders</td>
            <td>${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Premium</span>' : '<span class="badge standard">Standard</span>'}</td>
            <td>${Utils.timeAgo(user.joinedAt)}</td>
            <td><div class="action-buttons"><button class="action-btn view" onclick="AdminApp.viewUserDetails('${user.telegramId}')"><i class="fas fa-eye"></i></button><button class="action-btn edit" onclick="AdminApp.editUserBalance('${user.telegramId}')"><i class="fas fa-wallet"></i></button><button class="action-btn delete" onclick="AdminApp.banUserPrompt('${user.telegramId}')"><i class="fas fa-ban"></i></button></div></td>
        </tr>`).join('');
    },

    async viewUserDetails(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        document.getElementById('user-details-content').innerHTML = `<div class="user-details-header"><img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}"><div class="user-details-info"><h3>${user.firstName} ${user.lastName || ''}</h3><p>@${user.username || 'N/A'} • ID: ${user.telegramId}</p>${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Telegram Premium</span>' : ''}</div></div>
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
                user.balance = parseFloat(newBalance);
                this.renderUsers(); this.closeUserDetails();
                Utils.showToast('Balance updated!', 'success');
            } catch (error) { Utils.showToast('Failed to update balance', 'error'); }
            finally { Utils.hideLoading(); }
        }
    },

    async banUserPrompt(telegramId) {
        if (!confirm('Are you sure you want to ban this user?')) return;
        const reason = prompt('Enter ban reason:') || 'Violated terms of service';
        Utils.showLoading('Banning user...');
        try {
            const user = this.state.users.find(u => u.telegramId === telegramId);
            await Database.banUser(user, reason);
            await TelegramBot.notifyBan(telegramId, reason);
            this.state.users = this.state.users.filter(u => u.telegramId !== telegramId);
            this.state.bannedUsers.push({ ...user, reason, bannedAt: new Date().toISOString() });
            this.updateSidebarCounts(); this.renderUsers(); this.closeUserDetails();
            Utils.showToast('User banned', 'success');
        } catch (error) { Utils.showToast('Failed to ban user', 'error'); }
        finally { Utils.hideLoading(); }
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
                ${order.serviceId ? `<div class="order-info-row"><span>Service ID:</span><strong>#${order.serviceId}</strong></div>` : ''}${order.apiOrderId ? `<div class="order-info-row api-row"><span>API Order:</span><strong>#${order.apiOrderId}</strong></div>` : ''}${order.apiStatus ? `<div class="order-info-row"><span>API Status:</span><strong>${order.apiStatus}</strong></div>` : ''}${order.link ? `<div class="order-info-row"><span>Game Link:</span><strong>${order.link}</strong></div>` : ''}${order.apiError ? `<div class="order-info-row error-row"><span>Error:</span><strong>${order.apiError}</strong></div>` : ''}${order.refundedAt ? `<div class="order-info-row refund-row"><span>Refunded:</span><strong>${Utils.formatCurrency(order.refundAmount || order.amount, order.currency)}</strong></div>` : ''}
                ${order.inputValues ? `<div class="order-inputs"><span>Input Values:</span><ul>${Object.entries(order.inputValues).map(([k,v])=>`<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul></div>` : ''}
                <div class="order-date"><i class="fas fa-clock"></i> ${Utils.formatDate(order.createdAt, 'long')}</div></div>
                <div class="order-actions">${order.status === 'pending' ? `<button class="btn btn-success" onclick="AdminApp.approveOrder('${order.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectOrder('${order.id}')"><i class="fas fa-times"></i> Reject</button>` : ''}${order.status === 'processing' && order.apiOrderId ? `<button class="btn btn-info" onclick="AdminApp.checkOrderApiStatus('${order.id}')"><i class="fas fa-sync-alt"></i> Check Status</button>` : ''}${order.status === 'queued' ? `<button class="btn btn-warning" onclick="AdminApp.retryQueuedOrder('${order.id}')"><i class="fas fa-redo"></i> Retry</button><button class="btn btn-danger" onclick="AdminApp.cancelQueuedOrder('${order.id}')"><i class="fas fa-times"></i> Cancel & Refund</button>` : ''}</div></div>`;
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
        try {
            const order = await Database.updateOrderStatus(orderId, 'approved', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyOrderStatus(order, 'approved');
            const idx = this.state.orders.findIndex(o => o.id === orderId);
            if (idx !== -1) this.state.orders[idx].status = 'approved';
            this.computeStats(); this.updateSidebarCounts(); this.renderOrders();
            Utils.showToast('Order approved!', 'success');
        } catch (error) { Utils.showToast('Failed to approve', 'error'); }
        finally { Utils.hideLoading(); }
    },

    async rejectOrder(orderId) {
        if (!confirm('Reject this order? Amount will be refunded.')) return;
        Utils.showLoading('Rejecting...');
        try {
            const order = await Database.updateOrderStatus(orderId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyOrderStatus(order, 'rejected');
            const idx = this.state.orders.findIndex(o => o.id === orderId);
            if (idx !== -1) { this.state.orders[idx].status = 'rejected'; this.state.orders[idx].refundedAt = new Date().toISOString(); }
            this.computeStats(); this.updateSidebarCounts(); this.renderOrders();
            Utils.showToast('Order rejected & refunded', 'success');
        } catch (error) { Utils.showToast('Failed to reject', 'error'); }
        finally { Utils.hideLoading(); }
    },

    async checkOrderApiStatus(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order || !order.apiOrderId) return;
        Utils.showLoading('Checking API status...');
        try {
            const result = await G2BulkAPI.checkStatus(order.apiOrderId);
            if (result && !result.error) {
                const apiStatus = result.status;
                let newStatus = order.status;
                if (apiStatus === 'Completed') newStatus = 'completed';
                else if (apiStatus === 'Canceled' || apiStatus === 'Refunded') newStatus = 'failed';
                else if (apiStatus === 'Partial') newStatus = 'partial';
                await Database.updateOrderApiStatus(order.id, { apiStatus, status: newStatus, apiCharge: result.charge || null });
                const idx = this.state.orders.findIndex(o => o.id === orderId);
                if (idx !== -1) Object.assign(this.state.orders[idx], { apiStatus, status: newStatus });
                this.computeStats(); this.updateSidebarCounts(); this.renderOrders();
                Utils.showToast(`API Status: ${apiStatus}`, 'success');
            } else { Utils.showToast('API Error: ' + (result?.error || 'Unknown'), 'error'); }
        } catch (error) { Utils.showToast('Failed to check status', 'error'); }
        finally { Utils.hideLoading(); }
    },

    async retryQueuedOrder(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) return;
        Utils.showLoading('Retrying order...');
        try {
            const apiResult = await G2BulkAPI.placeOrder(order.serviceId, order.link, 1);
            if (apiResult && apiResult.order) {
                await Database.updateOrderApiStatus(order.id, { apiOrderId: apiResult.order, apiStatus: 'Processing', status: 'processing', apiError: null });
                const idx = this.state.orders.findIndex(o => o.id === orderId);
                if (idx !== -1) Object.assign(this.state.orders[idx], { apiOrderId: apiResult.order, apiStatus: 'Processing', status: 'processing', apiError: null });
                Utils.showToast('✅ Order is now processing!', 'success');
            } else { Utils.showToast('❌ Retry failed: ' + (apiResult?.error || 'Unknown'), 'error'); }
            this.computeStats(); this.updateSidebarCounts(); this.renderOrders();
        } catch (error) { Utils.showToast('Failed to retry', 'error'); }
        finally { Utils.hideLoading(); }
    },

    async cancelQueuedOrder(orderId) {
        if (!confirm('Cancel this order and refund the user?')) return;
        Utils.showLoading('Canceling...');
        try {
            await Database.updateOrderApiStatus(orderId, { apiStatus: 'Canceled', status: 'failed', apiError: 'Canceled by admin' });
            const idx = this.state.orders.findIndex(o => o.id === orderId);
            if (idx !== -1) Object.assign(this.state.orders[idx], { apiStatus: 'Canceled', status: 'failed', apiError: 'Canceled by admin' });
            this.computeStats(); this.updateSidebarCounts(); this.renderOrders();
            Utils.showToast('Order canceled & refunded', 'success');
        } catch (error) { Utils.showToast('Failed to cancel', 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== TOPUPS =====
    renderTopups() {
        const container = document.getElementById('admin-topups-list');
        if (!container) return;
        let filtered = [...this.state.topups];
        if (this.state.topupsFilter !== 'all') filtered = filtered.filter(t => t.status === this.state.topupsFilter);
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><p>No top-up requests found</p></div>'; return; }
        container.innerHTML = filtered.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `<div class="topup-card"><div class="topup-header"><div class="topup-user"><img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User"><div><h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4><p>@${user?.username || 'N/A'}</p></div></div><span class="status-badge ${topup.status}">${topup.status}</span></div>
            <div class="topup-body"><div class="topup-amount"><span>Amount</span><strong>${Utils.formatCurrency(topup.amount, 'MMK')}</strong></div><div class="topup-method"><span>Payment Method</span><strong>${topup.paymentMethod}</strong></div><div class="topup-date"><i class="fas fa-clock"></i> ${Utils.formatDate(topup.createdAt, 'long')}</div>
            ${topup.proofImage ? `<div class="topup-proof"><img src="${topup.proofImage}" alt="Proof" onclick="window.open('${topup.proofImage}','_blank')"></div>` : ''}</div>
            ${topup.status === 'pending' ? `<div class="topup-actions"><button class="btn btn-success" onclick="AdminApp.approveTopup('${topup.id}')"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" onclick="AdminApp.rejectTopup('${topup.id}')"><i class="fas fa-times"></i> Reject</button></div>` : ''}</div>`;
        }).join('');
    },

    filterTopups(filter) {
        this.state.topupsFilter = filter;
        document.querySelectorAll('#admin-page-topups .filter-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');
        this.renderTopups();
    },

    async approveTopup(topupId) {
        if (!confirm('Approve this top-up?')) return;
        Utils.showLoading('Approving...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'approved', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'approved');
            const idx = this.state.topups.findIndex(t => t.id === topupId);
            if (idx !== -1) this.state.topups[idx].status = 'approved';
            this.computeStats(); this.updateSidebarCounts(); this.renderTopups();
            Utils.showToast('Top-up approved!', 'success');
        } catch (error) { Utils.showToast('Failed to approve', 'error'); }
        finally { Utils.hideLoading(); }
    },

    async rejectTopup(topupId) {
        if (!confirm('Reject this top-up?')) return;
        Utils.showLoading('Rejecting...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'rejected');
            const idx = this.state.topups.findIndex(t => t.id === topupId);
            if (idx !== -1) this.state.topups[idx].status = 'rejected';
            this.computeStats(); this.updateSidebarCounts(); this.renderTopups();
            Utils.showToast('Top-up rejected', 'success');
        } catch (error) { Utils.showToast('Failed to reject', 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== CATEGORIES =====
    renderCategories() {
        const container = document.getElementById('admin-categories-list');
        if (!container) return;
        if (this.state.categories.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-th-large"></i><p>No categories yet</p></div>'; return; }
        container.innerHTML = this.state.categories.map(cat => `<div class="category-card"><div class="category-icon"><img src="${cat.icon}" alt="${cat.name}">${cat.flag ? `<span class="category-flag">${cat.flag}</span>` : ''}</div><div class="category-info"><h4>${cat.name}</h4><p>${cat.totalSold || 0} sold</p>${cat.hasDiscount ? '<span class="discount-badge">Has Discount</span>' : ''}</div><div class="category-actions"><button class="action-btn edit" onclick="AdminApp.editCategory('${cat.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteCategory('${cat.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
    },

    showAddCategory() {
        this.state.editingItem = null;
        document.getElementById('category-name').value = '';
        document.getElementById('category-flag').value = '';
        document.getElementById('has-discount').checked = false;
        document.getElementById('category-icon').value = '';
        document.getElementById('category-icon-preview').innerHTML = '';
        document.getElementById('category-icon-preview').classList.add('hidden');
        document.getElementById('add-category-modal').classList.remove('hidden');
    },

    editCategory(categoryId) {
        const cat = this.state.categories.find(c => c.id === categoryId);
        if (!cat) return;
        this.state.editingItem = cat;
        document.getElementById('category-name').value = cat.name;
        document.getElementById('category-flag').value = cat.flag || '';
        document.getElementById('has-discount').checked = cat.hasDiscount;
        if (cat.icon) { document.getElementById('category-icon-preview').innerHTML = `<img src="${cat.icon}" alt="Icon">`; document.getElementById('category-icon-preview').classList.remove('hidden'); }
        document.getElementById('add-category-modal').classList.remove('hidden');
    },

    closeAddCategory() { document.getElementById('add-category-modal').classList.add('hidden'); this.state.editingItem = null; },

    async saveCategory() {
        const name = document.getElementById('category-name').value.trim();
        const flag = document.getElementById('category-flag').value;
        const hasDiscount = document.getElementById('has-discount').checked;
        const iconInput = document.getElementById('category-icon');
        if (!name) { Utils.showToast('Please enter category name', 'warning'); return; }
        Utils.showLoading('Saving...');
        try {
            let icon = this.state.editingItem?.icon || '';
            if (iconInput.files[0]) icon = await this.uploadToImgbb(iconInput.files[0]);
            if (!icon && !this.state.editingItem) { Utils.showToast('Please upload icon', 'warning'); Utils.hideLoading(); return; }
            const data = { name, flag, hasDiscount, icon };
            if (this.state.editingItem) {
                await Database.updateCategory(this.state.editingItem.id, data);
                const idx = this.state.categories.findIndex(c => c.id === this.state.editingItem.id);
                if (idx !== -1) Object.assign(this.state.categories[idx], data);
                Utils.showToast('Category updated!', 'success');
            } else {
                const newCat = await Database.createCategory(data);
                if (newCat) this.state.categories.push(newCat);
                Utils.showToast('Category created!', 'success');
            }
            this.renderCategories(); this.closeAddCategory();
        } catch (error) { Utils.showToast('Failed to save: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },

    async deleteCategory(categoryId) {
        if (!confirm('Delete this category? All products will also be deleted.')) return;
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteCategory(categoryId);
            this.state.categories = this.state.categories.filter(c => c.id !== categoryId);
            this.state.products = this.state.products.filter(p => p.categoryId !== categoryId);
            this.renderCategories();
            Utils.showToast('Category deleted!', 'success');
        } catch (error) { Utils.showToast('Failed to delete', 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== PRODUCTS =====
    renderProducts() {
        const container = document.getElementById('admin-products-list');
        const filterSelect = document.getElementById('filter-category');
        if (!container) return;
        if (filterSelect) {
            const val = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">All Categories</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            filterSelect.value = val || 'all';
        }
        let filtered = [...this.state.products];
        if (filterSelect && filterSelect.value !== 'all') filtered = filtered.filter(p => p.categoryId === filterSelect.value);
        const bulkBar = document.getElementById('bulk-actions-bar');
        if (bulkBar) bulkBar.classList.toggle('hidden', filtered.length === 0);
        const selectAllCb = document.getElementById('select-all-products');
        if (selectAllCb) selectAllCb.checked = filtered.length > 0 && filtered.every(p => this.state.selectedProductIds.has(p.id));
        this.updateSelectedProductsCount();
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><p>No products yet</p></div>'; return; }
        container.innerHTML = filtered.map(product => {
            const cat = this.state.categories.find(c => c.id === product.categoryId);
            const isSelected = this.state.selectedProductIds.has(product.id);
            return `<div class="product-card ${isSelected ? 'selected' : ''}"><div class="product-select-checkbox"><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="AdminApp.toggleProductSelect('${product.id}')"></div><div class="product-icon"><img src="${product.icon}" alt="${product.name}">${product.discount > 0 ? `<span class="discount-tag">-${product.discount}%</span>` : ''}</div><div class="product-info"><h4>${product.name}</h4><p>${cat?.name || 'Unknown'}</p><div class="product-price">${product.discount > 0 ? `<span class="original">${Utils.formatCurrency(product.price, product.currency)}</span>` : ''}<span class="current">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</span></div>${product.serviceId ? `<p class="product-api-info"><i class="fas fa-bolt"></i> Service #${product.serviceId} ${product.g2bulkRate ? `• $${product.g2bulkRate}` : ''}</p>` : '<p class="product-manual"><i class="fas fa-hand-paper"></i> Manual</p>'}<p class="product-delivery"><i class="fas fa-bolt"></i> ${product.serviceId ? 'Auto' : product.deliveryTime}</p></div><div class="product-actions"><button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button></div></div>`;
        }).join('');
    },

    toggleProductSelect(productId) {
        if (this.state.selectedProductIds.has(productId)) this.state.selectedProductIds.delete(productId);
        else this.state.selectedProductIds.add(productId);
        this.renderProducts();
    },

    toggleSelectAllProducts() {
        const filterSelect = document.getElementById('filter-category');
        let filtered = [...this.state.products];
        if (filterSelect && filterSelect.value !== 'all') filtered = filtered.filter(p => p.categoryId === filterSelect.value);
        const cb = document.getElementById('select-all-products');
        if (cb && cb.checked) filtered.forEach(p => this.state.selectedProductIds.add(p.id));
        else filtered.forEach(p => this.state.selectedProductIds.delete(p.id));
        this.renderProducts();
    },

    updateSelectedProductsCount() {
        const el = document.getElementById('selected-products-count');
        if (el) el.textContent = `${this.state.selectedProductIds.size} selected`;
    },

    async bulkDeleteProducts() {
        const count = this.state.selectedProductIds.size;
        if (count === 0) { Utils.showToast('No products selected', 'warning'); return; }
        if (!confirm(`Delete ${count} selected product(s)?`)) return;
        Utils.showLoading(`Deleting ${count} products...`);
        try {
            const ids = [...this.state.selectedProductIds];
            for (const id of ids) await Database.deleteProduct(id);
            this.state.products = this.state.products.filter(p => !ids.includes(p.id));
            this.state.selectedProductIds.clear();
            this.renderProducts();
            Utils.showToast(`${count} products deleted!`, 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },

    showAddProduct() {
        this.state.editingItem = null;
        document.getElementById('product-modal-title').textContent = 'Add Product';
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        ['product-name','product-price','product-discount','product-service-id','product-g2bulk-rate','product-g2bulk-min','product-g2bulk-max'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('product-currency').value = 'MMK';
        document.getElementById('product-delivery').value = 'instant';
        document.getElementById('product-icon').value = '';
        document.getElementById('product-icon-preview').innerHTML = '';
        document.getElementById('product-icon-preview').classList.add('hidden');
        document.getElementById('service-lookup-result').classList.add('hidden');
        document.getElementById('add-product-modal').classList.remove('hidden');
    },

    editProduct(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;
        this.state.editingItem = product;
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-currency').value = product.currency;
        document.getElementById('product-discount').value = product.discount || '';
        document.getElementById('product-delivery').value = product.deliveryTime;
        document.getElementById('product-service-id').value = product.serviceId || '';
        document.getElementById('product-g2bulk-rate').value = product.g2bulkRate || '';
        document.getElementById('product-g2bulk-min').value = product.g2bulkMin || '';
        document.getElementById('product-g2bulk-max').value = product.g2bulkMax || '';
        if (product.icon) { document.getElementById('product-icon-preview').innerHTML = `<img src="${product.icon}" alt="Icon">`; document.getElementById('product-icon-preview').classList.remove('hidden'); }
        document.getElementById('add-product-modal').classList.remove('hidden');
    },

    closeAddProduct() { document.getElementById('add-product-modal').classList.add('hidden'); this.state.editingItem = null; },

    async lookupServiceId() {
        const serviceId = document.getElementById('product-service-id').value;
        if (!serviceId) { Utils.showToast('Enter a Service ID first', 'warning'); return; }
        const resultDiv = document.getElementById('service-lookup-result');
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...';
        resultDiv.classList.remove('hidden');
        try {
            if (this.state.g2bulkServicesRaw.length === 0) { this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || []; }
            const service = this.state.g2bulkServicesRaw.find(s => String(s.service) === String(serviceId));
            if (service) {
                resultDiv.innerHTML = `<div class="service-found"><i class="fas fa-check-circle"></i><div><strong>${service.name}</strong><br>Rate: $${service.rate} | Min: ${service.min} | Max: ${service.max}</div></div>`;
                resultDiv.className = 'service-lookup-result valid';
                document.getElementById('product-g2bulk-rate').value = service.rate;
                document.getElementById('product-g2bulk-min').value = service.min;
                document.getElementById('product-g2bulk-max').value = service.max;
                if (!document.getElementById('product-name').value) document.getElementById('product-name').value = service.name;
            } else { resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Not found'; resultDiv.className = 'service-lookup-result invalid'; }
        } catch (error) { resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed: ' + error.message; resultDiv.className = 'service-lookup-result error'; }
    },

    async openG2BulkServiceBrowser() {
        document.getElementById('g2bulk-browser-modal').classList.remove('hidden');
        if (this.state.g2bulkServicesRaw.length === 0) {
            document.getElementById('g2bulk-browser-list').innerHTML = '<p>Loading...</p>';
            try { this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || []; } catch (e) { document.getElementById('g2bulk-browser-list').innerHTML = '<p>Failed</p>'; return; }
        }
        this.renderBrowserServices(this.state.g2bulkServicesRaw.slice(0, 50));
    },
    closeG2BulkBrowser() { document.getElementById('g2bulk-browser-modal').classList.add('hidden'); },
    renderBrowserServices(services) {
        const c = document.getElementById('g2bulk-browser-list');
        if (!services.length) { c.innerHTML = '<p>No services</p>'; return; }
        c.innerHTML = services.slice(0, 100).map(s => `<div class="g2bulk-browser-item" onclick="AdminApp.selectBrowserService(${s.service})"><div class="service-id">#${s.service}</div><div class="service-info"><strong>${s.name}</strong><br><small>$${s.rate} | Min: ${s.min} | Max: ${s.max}</small></div><button class="btn btn-sm btn-primary"><i class="fas fa-check"></i></button></div>`).join('');
    },
    filterBrowserServices() {
        const q = document.getElementById('g2bulk-browser-search').value.toLowerCase();
        this.renderBrowserServices(this.state.g2bulkServicesRaw.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q)));
    },
    selectBrowserService(serviceId) {
        const s = this.state.g2bulkServicesRaw.find(sv => sv.service === serviceId);
        if (!s) return;
        document.getElementById('product-service-id').value = s.service;
        document.getElementById('product-g2bulk-rate').value = s.rate;
        document.getElementById('product-g2bulk-min').value = s.min;
        document.getElementById('product-g2bulk-max').value = s.max;
        if (!document.getElementById('product-name').value) document.getElementById('product-name').value = s.name;
        this.closeG2BulkBrowser();
        Utils.showToast(`Selected: #${s.service}`, 'success');
    },

    async saveProduct() {
        const categoryId = document.getElementById('product-category').value;
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const currency = document.getElementById('product-currency').value;
        const discount = parseInt(document.getElementById('product-discount').value) || 0;
        const deliveryTime = document.getElementById('product-delivery').value;
        const serviceId = document.getElementById('product-service-id').value;
        const g2bulkRate = document.getElementById('product-g2bulk-rate').value;
        const g2bulkMin = document.getElementById('product-g2bulk-min').value;
        const g2bulkMax = document.getElementById('product-g2bulk-max').value;
        const iconInput = document.getElementById('product-icon');
        if (!categoryId || !name || isNaN(price)) { Utils.showToast('Please fill required fields', 'warning'); return; }
        Utils.showLoading('Saving...');
        try {
            let icon = this.state.editingItem?.icon || '';
            if (iconInput.files[0]) icon = await this.uploadToImgbb(iconInput.files[0]);
            if (!icon && !this.state.editingItem) { Utils.showToast('Please upload icon', 'warning'); Utils.hideLoading(); return; }
            let g2bulkServiceName = '';
            if (serviceId && this.state.g2bulkServicesRaw.length > 0) { const svc = this.state.g2bulkServicesRaw.find(s => String(s.service) === String(serviceId)); if (svc) g2bulkServiceName = svc.name; }
            const data = { categoryId, name, price, currency, discount, deliveryTime, icon, serviceId: serviceId ? parseInt(serviceId) : null, g2bulkRate: g2bulkRate || null, g2bulkMin: g2bulkMin ? parseInt(g2bulkMin) : null, g2bulkMax: g2bulkMax ? parseInt(g2bulkMax) : null, g2bulkServiceName };
            if (this.state.editingItem) {
                await Database.updateProduct(this.state.editingItem.id, data);
                const idx = this.state.products.findIndex(p => p.id === this.state.editingItem.id);
                if (idx !== -1) Object.assign(this.state.products[idx], data, { discountedPrice: discount > 0 ? Math.round(price - price * discount / 100) : price });
                Utils.showToast('Product updated!', 'success');
            } else {
                const np = await Database.createProduct(data);
                if (np) this.state.products.push(np);
                Utils.showToast('Product created!', 'success');
            }
            this.renderProducts(); this.closeAddProduct();
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },

    async deleteProduct(productId) {
        if (!confirm('Delete this product?')) return;
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteProduct(productId);
            this.state.products = this.state.products.filter(p => p.id !== productId);
            this.state.selectedProductIds.delete(productId);
            this.renderProducts();
            Utils.showToast('Product deleted!', 'success');
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== BULK IMPORT =====
    showBulkImportModal() {
        this.state.bulkImportSelectedServices = new Set();
        this.state.bulkImportFilteredServices = [];
        document.getElementById('bulk-import-category').innerHTML = '<option value="">-- Select Category --</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        const g2cat = document.getElementById('bulk-import-g2bulk-category');
        if (this.state.g2bulkCategories.length > 0) g2cat.innerHTML = '<option value="all">All G2Bulk Categories</option>' + this.state.g2bulkCategories.map(c => `<option value="${c}">${c}</option>`).join('');
        document.getElementById('bulk-import-search').value = '';
        document.getElementById('bulk-import-select-all').checked = false;
        document.getElementById('bulk-import-selected-count').textContent = '0 selected';
        document.getElementById('bulk-import-rate').value = '4150';
        document.getElementById('bulk-import-icon').value = '';
        document.getElementById('bulk-import-icon-preview').innerHTML = '';
        document.getElementById('bulk-import-icon-preview').classList.add('hidden');
        document.getElementById('bulk-import-services-list').innerHTML = '<div class="empty-state"><i class="fas fa-cloud-download-alt"></i><p>Click "Load Services"</p></div>';
        document.getElementById('bulk-import-preview').innerHTML = '<div class="empty-state small"><p>Select products to preview</p></div>';
        document.getElementById('bulk-import-save-btn').disabled = true;
        document.getElementById('bulk-import-save-count').textContent = '0';
        document.getElementById('bulk-import-modal').classList.remove('hidden');
    },
    closeBulkImportModal() { document.getElementById('bulk-import-modal').classList.add('hidden'); },
    onBulkImportCategoryChange() {},
    async loadBulkImportServices() {
        if (this.state.g2bulkServicesRaw.length === 0) {
            Utils.showLoading('Loading G2Bulk services...');
            try {
                this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || [];
                const cats = [...new Set(this.state.g2bulkServicesRaw.map(s => s.category).filter(Boolean))].sort();
                this.state.g2bulkCategories = cats;
                document.getElementById('bulk-import-g2bulk-category').innerHTML = '<option value="all">All</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
            } catch (e) { Utils.showToast('Failed', 'error'); Utils.hideLoading(); return; }
            Utils.hideLoading();
        }
        this.filterBulkImportServices();
    },
    filterBulkImportServices() {
        const q = (document.getElementById('bulk-import-search')?.value || '').toLowerCase();
        const cat = document.getElementById('bulk-import-g2bulk-category')?.value || 'all';
        let f = [...this.state.g2bulkServicesRaw];
        if (cat !== 'all') f = f.filter(s => s.category === cat);
        if (q) f = f.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q));
        this.state.bulkImportFilteredServices = f;
        this.renderBulkImportServicesList(f);
    },
    renderBulkImportServicesList(services) {
        const c = document.getElementById('bulk-import-services-list');
        if (!services.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No services</p></div>'; return; }
        const rate = parseFloat(document.getElementById('bulk-import-rate').value) || 4150;
        c.innerHTML = services.slice(0, 200).map(s => {
            const sel = this.state.bulkImportSelectedServices.has(s.service);
            return `<div class="bulk-import-service-item ${sel ? 'selected' : ''}" onclick="AdminApp.toggleBulkImportService(${s.service})"><div class="bulk-service-checkbox"><input type="checkbox" ${sel ? 'checked' : ''} onclick="event.stopPropagation();AdminApp.toggleBulkImportService(${s.service})"></div><div class="bulk-service-info"><div class="bulk-service-name">${s.name}</div><div class="bulk-service-details"><span class="service-id-badge">#${s.service}</span><span class="service-category-badge">${s.category||'N/A'}</span></div></div><div class="bulk-service-price"><div class="price-usd">$${s.rate}</div><div class="price-mmk">${Math.ceil(parseFloat(s.rate)*rate).toLocaleString()} MMK</div></div></div>`;
        }).join('');
        if (services.length > 200) c.innerHTML += `<p class="load-more-text">Showing 200 of ${services.length}</p>`;
    },
    toggleBulkImportService(id) { if (this.state.bulkImportSelectedServices.has(id)) this.state.bulkImportSelectedServices.delete(id); else this.state.bulkImportSelectedServices.add(id); this.updateBulkImportUI(); },
    toggleBulkImportSelectAll() {
        const cb = document.getElementById('bulk-import-select-all');
        if (cb.checked) this.state.bulkImportFilteredServices.slice(0,200).forEach(s => this.state.bulkImportSelectedServices.add(s.service));
        else this.state.bulkImportFilteredServices.slice(0,200).forEach(s => this.state.bulkImportSelectedServices.delete(s.service));
        this.updateBulkImportUI();
    },
    updateBulkImportUI() {
        const count = this.state.bulkImportSelectedServices.size;
        document.getElementById('bulk-import-selected-count').textContent = `${count} selected`;
        document.getElementById('bulk-import-save-count').textContent = count;
        document.getElementById('bulk-import-save-btn').disabled = count === 0;
        if (this.state.bulkImportFilteredServices.length > 0) this.renderBulkImportServicesList(this.state.bulkImportFilteredServices);
        this.renderBulkImportPreview();
    },
    recalculateBulkImportPrices() { if (this.state.bulkImportFilteredServices.length > 0) this.renderBulkImportServicesList(this.state.bulkImportFilteredServices); this.renderBulkImportPreview(); },
    renderBulkImportPreview() {
        const pc = document.getElementById('bulk-import-preview');
        const ids = [...this.state.bulkImportSelectedServices];
        if (!ids.length) { pc.innerHTML = '<div class="empty-state small"><p>Select products to preview</p></div>'; return; }
        const rate = parseFloat(document.getElementById('bulk-import-rate').value) || 4150;
        const svcs = ids.map(id => this.state.g2bulkServicesRaw.find(s => s.service === id)).filter(Boolean);
        pc.innerHTML = `<div class="preview-table"><div class="preview-table-header"><span class="col-name">Name</span><span class="col-usd">USD</span><span class="col-mmk">MMK</span><span class="col-service">ID</span></div>${svcs.map(s => `<div class="preview-table-row"><span class="col-name">${s.name}</span><span class="col-usd">$${s.rate}</span><span class="col-mmk">${Math.ceil(parseFloat(s.rate)*rate).toLocaleString()}</span><span class="col-service">#${s.service}</span></div>`).join('')}</div><div class="preview-summary"><span>Total: ${svcs.length}</span><span>1 USD = ${rate.toLocaleString()} MMK</span></div>`;
    },
    previewBulkImportIcon(event) {
        const file = event.target.files[0]; if (!file) return;
        const p = document.getElementById('bulk-import-icon-preview');
        const r = new FileReader(); r.onload = e => { p.innerHTML = `<img src="${e.target.result}" alt="Preview">`; p.classList.remove('hidden'); }; r.readAsDataURL(file);
    },
    async saveBulkImport() {
        const categoryId = document.getElementById('bulk-import-category').value;
        if (!categoryId) { Utils.showToast('Select a category', 'warning'); return; }
        const ids = [...this.state.bulkImportSelectedServices];
        if (!ids.length) { Utils.showToast('No products selected', 'warning'); return; }
        const iconInput = document.getElementById('bulk-import-icon');
        if (!iconInput.files[0]) { Utils.showToast('Upload an icon', 'warning'); return; }
        const rate = parseFloat(document.getElementById('bulk-import-rate').value);
        if (!rate || rate <= 0) { Utils.showToast('Enter valid rate', 'warning'); return; }
        if (!confirm(`Import ${ids.length} products?`)) return;
        Utils.showLoading(`Importing ${ids.length} products...`);
        try {
            const iconUrl = await this.uploadToImgbb(iconInput.files[0]);
            const svcs = ids.map(id => this.state.g2bulkServicesRaw.find(s => s.service === id)).filter(Boolean);
            let ok = 0, fail = 0;
            for (const s of svcs) {
                try {
                    const mmk = Math.ceil(parseFloat(s.rate) * rate);
                    const np = await Database.createProduct({ categoryId, name: s.name, price: mmk, currency: 'MMK', discount: 0, deliveryTime: 'instant', icon: iconUrl, serviceId: parseInt(s.service), g2bulkRate: s.rate, g2bulkMin: parseInt(s.min)||1, g2bulkMax: parseInt(s.max)||1, g2bulkServiceName: s.name, exchangeRate: rate });
                    if (np) this.state.products.push(np);
                    ok++;
                } catch (e) { fail++; }
            }
            this.renderProducts(); this.closeBulkImportModal();
            Utils.showToast(fail > 0 ? `Imported ${ok}. ${fail} failed.` : `Imported ${ok} products!`, fail > 0 ? 'warning' : 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== BULK PRICE UPDATE =====
    showBulkPriceUpdateModal() {
        this.state.bulkPriceSelectedProducts = new Set();
        document.getElementById('bulk-price-category').innerHTML = '<option value="">-- Select Category --</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('bulk-price-select-all').checked = false;
        document.getElementById('bulk-price-selected-count').textContent = '0 selected';
        document.getElementById('bulk-price-rate').value = '';
        document.getElementById('bulk-price-products-list').innerHTML = '<div class="empty-state small"><p>Select a category</p></div>';
        document.getElementById('bulk-price-preview').innerHTML = '<div class="empty-state small"><p>Enter rate to preview</p></div>';
        document.getElementById('bulk-price-save-btn').disabled = true;
        document.getElementById('bulk-price-save-count').textContent = '0';
        document.getElementById('bulk-price-update-modal').classList.remove('hidden');
    },
    closeBulkPriceUpdateModal() { document.getElementById('bulk-price-update-modal').classList.add('hidden'); },
    onBulkPriceCategoryChange() {
        const catId = document.getElementById('bulk-price-category').value;
        this.state.bulkPriceSelectedProducts = new Set();
        if (!catId) { document.getElementById('bulk-price-products-list').innerHTML = '<div class="empty-state small"><p>Select a category</p></div>'; return; }
        this.renderBulkPriceProductsList(this.state.products.filter(p => p.categoryId === catId));
    },
    renderBulkPriceProductsList(products) {
        const c = document.getElementById('bulk-price-products-list');
        if (!products.length) { c.innerHTML = '<div class="empty-state small"><p>No products</p></div>'; return; }
        c.innerHTML = products.map(p => {
            const sel = this.state.bulkPriceSelectedProducts.has(p.id);
            return `<div class="bulk-price-product-item ${sel?'selected':''}" onclick="AdminApp.toggleBulkPriceProduct('${p.id}')"><div class="bulk-service-checkbox"><input type="checkbox" ${sel?'checked':''} onclick="event.stopPropagation();AdminApp.toggleBulkPriceProduct('${p.id}')"></div><div class="bulk-price-product-info"><div class="bulk-service-name">${p.name}</div><div class="bulk-service-details">${p.serviceId?`<span class="service-id-badge">#${p.serviceId}</span>`:'<span class="service-id-badge manual">Manual</span>'}${p.g2bulkRate?`<span class="rate-badge">$${p.g2bulkRate}</span>`:''}</div></div><div class="bulk-service-price"><div class="price-mmk">${p.price?.toLocaleString()} ${p.currency||'MMK'}</div></div></div>`;
        }).join('');
    },
    toggleBulkPriceProduct(id) { if (this.state.bulkPriceSelectedProducts.has(id)) this.state.bulkPriceSelectedProducts.delete(id); else this.state.bulkPriceSelectedProducts.add(id); this.updateBulkPriceUI(); },
    toggleBulkPriceSelectAll() {
        const catId = document.getElementById('bulk-price-category').value;
        const prods = this.state.products.filter(p => p.categoryId === catId);
        const cb = document.getElementById('bulk-price-select-all');
        if (cb.checked) prods.forEach(p => this.state.bulkPriceSelectedProducts.add(p.id));
        else prods.forEach(p => this.state.bulkPriceSelectedProducts.delete(p.id));
        this.updateBulkPriceUI();
    },
    updateBulkPriceUI() {
        const count = this.state.bulkPriceSelectedProducts.size;
        document.getElementById('bulk-price-selected-count').textContent = `${count} selected`;
        document.getElementById('bulk-price-save-count').textContent = count;
        const rate = parseFloat(document.getElementById('bulk-price-rate').value);
        document.getElementById('bulk-price-save-btn').disabled = count === 0 || !rate || rate <= 0;
        const catId = document.getElementById('bulk-price-category').value;
        if (catId) this.renderBulkPriceProductsList(this.state.products.filter(p => p.categoryId === catId));
        this.recalculateBulkPrices();
    },
    recalculateBulkPrices() {
        const pc = document.getElementById('bulk-price-preview');
        const ids = [...this.state.bulkPriceSelectedProducts];
        const rate = parseFloat(document.getElementById('bulk-price-rate').value);
        if (!ids.length) { pc.innerHTML = '<div class="empty-state small"><p>Select products</p></div>'; return; }
        if (!rate || rate <= 0) { pc.innerHTML = '<div class="empty-state small"><p>Enter rate</p></div>'; return; }
        const prods = ids.map(id => this.state.products.find(p => p.id === id)).filter(Boolean);
        pc.innerHTML = `<div class="preview-table"><div class="preview-table-header"><span class="col-name">Name</span><span class="col-usd">USD</span><span class="col-old">Old</span><span class="col-new">New</span><span class="col-diff">Diff</span></div>${prods.map(p => {
            const usd = parseFloat(p.g2bulkRate)||0; const old = p.price||0; const nw = usd>0?Math.ceil(usd*rate):old; const diff = nw-old;
            return `<div class="preview-table-row"><span class="col-name">${p.name}</span><span class="col-usd">${usd>0?'$'+usd:'N/A'}</span><span class="col-old">${old.toLocaleString()}</span><span class="col-new">${nw.toLocaleString()}</span><span class="col-diff ${diff>0?'price-up':diff<0?'price-down':'price-same'}">${diff>=0?'+':''}${diff.toLocaleString()}</span></div>`;
        }).join('')}</div><div class="preview-summary"><span>Total: ${prods.length}</span><span>1 USD = ${rate.toLocaleString()} MMK</span></div>`;
    },
    async saveBulkPriceUpdate() {
        const ids = [...this.state.bulkPriceSelectedProducts];
        if (!ids.length) { Utils.showToast('No products selected', 'warning'); return; }
        const rate = parseFloat(document.getElementById('bulk-price-rate').value);
        if (!rate || rate <= 0) { Utils.showToast('Enter valid rate', 'warning'); return; }
        if (!confirm(`Update ${ids.length} products?`)) return;
        Utils.showLoading(`Updating ${ids.length} prices...`);
        try {
            let ok = 0, fail = 0, skip = 0;
            for (const id of ids) {
                const p = this.state.products.find(pr => pr.id === id);
                if (!p) { fail++; continue; }
                const usd = parseFloat(p.g2bulkRate);
                if (!usd || usd <= 0) { skip++; continue; }
                try {
                    const nw = Math.ceil(usd * rate);
                    await Database.updateProduct(id, { ...p, price: nw, currency: 'MMK', exchangeRate: rate });
                    const idx = this.state.products.findIndex(pr => pr.id === id);
                    if (idx !== -1) { this.state.products[idx].price = nw; this.state.products[idx].exchangeRate = rate; this.state.products[idx].discountedPrice = p.discount > 0 ? Math.round(nw - nw * p.discount / 100) : nw; }
                    ok++;
                } catch (e) { fail++; }
            }
            this.renderProducts(); this.closeBulkPriceUpdateModal();
            let msg = `Updated ${ok}.`; if (skip) msg += ` ${skip} skipped.`; if (fail) msg += ` ${fail} failed.`;
            Utils.showToast(msg, fail > 0 ? 'warning' : 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== G2BULK PAGE =====
    renderG2BulkPage() { this.refreshApiBalance(); if (this.state.g2bulkServicesRaw.length > 0) this.renderG2BulkServicesList(this.state.g2bulkServicesRaw); },
    async refreshG2BulkServices() {
        Utils.showLoading('Loading...');
        try {
            this.state.g2bulkServicesRaw = await G2BulkAPI.getServices() || [];
            const cats = [...new Set(this.state.g2bulkServicesRaw.map(s => s.category).filter(Boolean))].sort();
            this.state.g2bulkCategories = cats;
            const cf = document.getElementById('g2bulk-category-filter');
            if (cf) cf.innerHTML = '<option value="all">All</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
            this.renderG2BulkServicesList(this.state.g2bulkServicesRaw);
            Utils.showToast(`Loaded ${this.state.g2bulkServicesRaw.length} services`, 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    filterG2BulkServices() {
        const q = (document.getElementById('g2bulk-search')?.value || '').toLowerCase();
        const cat = document.getElementById('g2bulk-category-filter')?.value || 'all';
        let f = [...this.state.g2bulkServicesRaw];
        if (cat !== 'all') f = f.filter(s => s.category === cat);
        if (q) f = f.filter(s => s.name.toLowerCase().includes(q) || String(s.service).includes(q));
        this.renderG2BulkServicesList(f);
    },
    renderG2BulkServicesList(services) {
        const c = document.getElementById('g2bulk-services-list');
        const ce = document.getElementById('g2bulk-services-count');
        if (ce) ce.textContent = `${services.length} services`;
        if (!services.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No services</p></div>'; return; }
        c.innerHTML = services.slice(0,200).map(s => `<div class="g2bulk-service-card"><div class="service-header"><span class="service-id-badge">#${s.service}</span><span class="service-category-badge">${s.category||'N/A'}</span></div><div class="service-name">${s.name}</div><div class="service-details"><div class="service-detail"><span>Rate:</span><strong>$${s.rate}</strong></div><div class="service-detail"><span>Min:</span><strong>${s.min}</strong></div><div class="service-detail"><span>Max:</span><strong>${s.max}</strong></div></div><button class="btn btn-primary btn-sm btn-full" onclick="AdminApp.quickAddProduct(${s.service})"><i class="fas fa-plus"></i> Add</button></div>`).join('');
        if (services.length > 200) c.innerHTML += `<p class="load-more-text">Showing 200 of ${services.length}</p>`;
    },
    quickAddProduct(serviceId) {
        const s = this.state.g2bulkServicesRaw.find(sv => sv.service === serviceId); if (!s) return;
        this.showAddProduct();
        document.getElementById('product-service-id').value = s.service;
        document.getElementById('product-name').value = s.name;
        document.getElementById('product-g2bulk-rate').value = s.rate;
        document.getElementById('product-g2bulk-min').value = s.min;
        document.getElementById('product-g2bulk-max').value = s.max;
    },

    // ===== BANNERS =====
    renderBanners() { this.renderBannerType(this.state.currentBannerType); },
    renderBannerType(type) {
        this.state.currentBannerType = type;
        document.querySelectorAll('.banner-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`)?.classList.add('active');
        document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1');
        document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2');
        const banners = type === 'type1' ? (this.state.banners.type1||[]) : (this.state.banners.type2||[]);
        const c = document.getElementById(`banners-${type}-list`);
        if (!c) return;
        if (!banners.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No banners</p></div>'; return; }
        c.innerHTML = banners.map(b => { const cat = type==='type2'?this.state.categories.find(c=>c.id===b.categoryId):null; return `<div class="banner-card"><img src="${b.image}" alt="Banner"><div class="banner-info">${cat?`<p><strong>${cat.name}</strong></p>`:''}${b.description?`<p>${b.description.substring(0,100)}...</p>`:''}<p class="date">${Utils.formatDate(b.createdAt)}</p></div><button class="btn btn-danger btn-sm" onclick="AdminApp.deleteBanner('${b.id}','${type}')"><i class="fas fa-trash"></i> Delete</button></div>`; }).join('');
    },
    showAddBanner(type) {
        this.state.currentBannerType = type;
        document.getElementById('banner-category-group').style.display = type==='type2'?'block':'none';
        document.getElementById('banner-text-group').style.display = type==='type2'?'block':'none';
        if (type==='type2') document.getElementById('banner-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('banner-image').value = '';
        document.getElementById('banner-text').value = '';
        document.getElementById('banner-image-preview').innerHTML = '';
        document.getElementById('banner-image-preview').classList.add('hidden');
        document.getElementById('add-banner-modal').classList.remove('hidden');
    },
    closeAddBanner() { document.getElementById('add-banner-modal').classList.add('hidden'); },
    async saveBanner() {
        const type = this.state.currentBannerType;
        const imgInput = document.getElementById('banner-image');
        const catId = document.getElementById('banner-category')?.value;
        const desc = document.getElementById('banner-text')?.value;
        if (!imgInput.files[0]) { Utils.showToast('Upload an image', 'warning'); return; }
        if (type==='type2' && !catId) { Utils.showToast('Select a category', 'warning'); return; }
        Utils.showLoading('Uploading...');
        try {
            const url = await this.uploadToImgbb(imgInput.files[0]);
            const data = { image: url }; if (type==='type2') { data.categoryId = catId; data.description = desc; }
            const nb = await Database.createBanner(data, type);
            if (type==='type1') { if (!this.state.banners.type1) this.state.banners.type1=[]; if (nb) this.state.banners.type1.push(nb); }
            else { if (!this.state.banners.type2) this.state.banners.type2=[]; if (nb) this.state.banners.type2.push(nb); }
            this.renderBanners(); this.closeAddBanner();
            Utils.showToast('Banner created!', 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    async deleteBanner(id, type) {
        if (!confirm('Delete?')) return;
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteBanner(id, type);
            if (type==='type1') this.state.banners.type1 = (this.state.banners.type1||[]).filter(b=>b.id!==id);
            else this.state.banners.type2 = (this.state.banners.type2||[]).filter(b=>b.id!==id);
            this.renderBanners(); Utils.showToast('Deleted!', 'success');
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },

    // ===== INPUT TABLES =====
    renderInputTables() {
        const c = document.getElementById('admin-input-tables-list');
        if (!c) return;
        if (!this.state.inputTables.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-keyboard"></i><p>No input tables</p></div>'; return; }
        c.innerHTML = this.state.inputTables.map(t => {
            const cat = this.state.categories.find(c=>c.id===t.categoryId);
            let ci = '';
            if (t.checkerEnabled && t.checkerConfig) { let cfg = t.checkerConfig; if (typeof cfg==='string') try{cfg=JSON.parse(cfg);}catch(e){} if (cfg&&typeof cfg==='object') { const url=cfg.url||cfg.apiUrl||''; const m=cfg.method||'POST'; ci=`<div class="checker-config-preview"><span class="checker-badge"><i class="fas fa-search"></i> Checker</span><span class="checker-method-badge ${m.toLowerCase()}">${m}</span></div>`; } }
            return `<div class="input-table-card"><div class="input-table-icon"><i class="fas fa-keyboard"></i></div><div class="input-table-info"><h4>${t.name}</h4><p>${cat?.name||'Unknown'}</p><p class="placeholder">"${t.placeholder}"</p>${ci}</div><div class="input-table-actions"><button class="action-btn edit" onclick="AdminApp.editInputTable('${t.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deleteInputTable('${t.id}')"><i class="fas fa-trash"></i></button></div></div>`;
        }).join('');
    },
    showAddInputTable() {
        this.state.editingItem = null;
        document.getElementById('input-table-modal-title').textContent = 'Add Input Table';
        document.getElementById('input-table-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('checker-enabled').checked = false;
        document.getElementById('checker-json-section').classList.add('hidden');
        document.getElementById('checker-json-config').value = '';
        document.getElementById('checker-json-preview').classList.add('hidden');
        document.getElementById('checker-test-section').classList.add('hidden');
        document.getElementById('checker-test-value').value = '';
        document.getElementById('checker-test-result').classList.add('hidden');
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    editInputTable(tableId) {
        const t = this.state.inputTables.find(x=>x.id===tableId); if (!t) return;
        this.state.editingItem = t;
        document.getElementById('input-table-modal-title').textContent = 'Edit Input Table';
        document.getElementById('input-table-category').innerHTML = '<option value="">Select</option>' + this.state.categories.map(c=>`<option value="${c.id}" ${c.id===t.categoryId?'selected':''}>${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = t.name;
        document.getElementById('input-table-placeholder').value = t.placeholder;
        document.getElementById('checker-enabled').checked = t.checkerEnabled||false;
        document.getElementById('checker-json-section').classList.toggle('hidden', !t.checkerEnabled);
        if (t.checkerConfig) { document.getElementById('checker-json-config').value = typeof t.checkerConfig==='string'?t.checkerConfig:JSON.stringify(t.checkerConfig,null,2); this.previewCheckerConfig(); }
        else document.getElementById('checker-json-config').value = '';
        document.getElementById('checker-test-section').classList.toggle('hidden', !t.checkerEnabled);
        document.getElementById('checker-test-value').value = '';
        document.getElementById('checker-test-result').classList.add('hidden');
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    closeAddInputTable() { document.getElementById('add-input-table-modal').classList.add('hidden'); this.state.editingItem = null; },
    previewCheckerConfig() {
        const j = document.getElementById('checker-json-config').value.trim();
        const p = document.getElementById('checker-json-preview');
        if (!j) { p.classList.add('hidden'); return; }
        try {
            const c = JSON.parse(j); const url=c.url||c.apiUrl||'N/A'; const m=(c.method||'POST').toUpperCase(); const rp=c.responsePath||c.response||{};
            p.innerHTML = `<div class="json-preview-card"><h4><i class="fas fa-check-circle" style="color:var(--success)"></i> Valid</h4><div class="preview-grid"><div class="preview-item"><span class="preview-label">URL</span><span class="preview-value url">${url}</span></div><div class="preview-item"><span class="preview-label">Method</span><span class="preview-value"><span class="method-badge ${m.toLowerCase()}">${m}</span></span></div></div></div>`;
            p.classList.remove('hidden');
            document.getElementById('checker-test-section').classList.remove('hidden');
        } catch (e) {
            p.innerHTML = `<div class="json-preview-card error"><h4><i class="fas fa-exclamation-triangle" style="color:var(--danger)"></i> Invalid JSON</h4><p>${e.message}</p></div>`;
            p.classList.remove('hidden');
            document.getElementById('checker-test-section').classList.add('hidden');
        }
    },
    loadSampleConfig(type) {
        const samples = { 'rapidapi-mlbb':`{\n  "url":"https://check-id-game1.p.rapidapi.com/check-id-game",\n  "method":"POST",\n  "headers":{"x-rapidapi-key":"YOUR_KEY","x-rapidapi-host":"check-id-game1.p.rapidapi.com","Content-Type":"application/json"},\n  "body":{"game":"mobile-legends","userid":"{{value}}","zoneid":"{{Zone ID}}"},\n  "responsePath":{"valid":"success","nickname":"data.username","country":"data.country"},\n  "errorMessage":"Not found!"\n}`,'rapidapi-ff':`{\n  "url":"https://check-id-game1.p.rapidapi.com/check-id-game",\n  "method":"POST",\n  "headers":{"x-rapidapi-key":"YOUR_KEY","x-rapidapi-host":"check-id-game1.p.rapidapi.com","Content-Type":"application/json"},\n  "body":{"game":"free-fire","userid":"{{value}}"},\n  "responsePath":{"valid":"success","nickname":"data.username","country":"data.country"},\n  "errorMessage":"Not found!"\n}`,'rapidapi-genshin':`{\n  "url":"https://check-id-game1.p.rapidapi.com/check-id-game",\n  "method":"POST",\n  "headers":{"x-rapidapi-key":"YOUR_KEY","x-rapidapi-host":"check-id-game1.p.rapidapi.com","Content-Type":"application/json"},\n  "body":{"game":"genshin-impact","userid":"{{value}}"},\n  "responsePath":{"valid":"success","nickname":"data.username","country":"data.country"},\n  "errorMessage":"Not found!"\n}`,'rapidapi-pubg':`{\n  "url":"https://check-id-game1.p.rapidapi.com/check-id-game",\n  "method":"POST",\n  "headers":{"x-rapidapi-key":"YOUR_KEY","x-rapidapi-host":"check-id-game1.p.rapidapi.com","Content-Type":"application/json"},\n  "body":{"game":"pubg-mobile","userid":"{{value}}"},\n  "responsePath":{"valid":"success","nickname":"data.username","country":"data.country"},\n  "errorMessage":"Not found!"\n}`,'rapidapi-honkai':`{\n  "url":"https://check-id-game1.p.rapidapi.com/check-id-game",\n  "method":"POST",\n  "headers":{"x-rapidapi-key":"YOUR_KEY","x-rapidapi-host":"check-id-game1.p.rapidapi.com","Content-Type":"application/json"},\n  "body":{"game":"honkai-star-rail","userid":"{{value}}"},\n  "responsePath":{"valid":"success","nickname":"data.username","country":"data.country"},\n  "errorMessage":"Not found!"\n}`,'custom-get':`{\n  "url":"https://api.com/check?id={{value}}",\n  "method":"GET",\n  "headers":{"Authorization":"Bearer TOKEN"},\n  "responsePath":{"valid":"status","nickname":"data.name"},\n  "errorMessage":"Not found!"\n}`,'custom-post':`{\n  "url":"https://api.com/verify",\n  "method":"POST",\n  "headers":{"Content-Type":"application/json"},\n  "body":{"user_id":"{{value}}","server_id":"{{Server ID}}"},\n  "responsePath":{"valid":"success","nickname":"result.name"},\n  "errorMessage":"Not found!"\n}` };
        if (samples[type]) { document.getElementById('checker-json-config').value = samples[type]; this.previewCheckerConfig(); Utils.showToast('Config loaded!', 'info'); }
    },
    async saveInputTable() {
        const catId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const ph = document.getElementById('input-table-placeholder').value.trim();
        const ce = document.getElementById('checker-enabled').checked;
        if (!catId || !name || !ph) { Utils.showToast('Fill all fields', 'warning'); return; }
        let cc = null;
        if (ce) { const j = document.getElementById('checker-json-config').value.trim(); if (!j) { Utils.showToast('Enter config', 'warning'); return; } try { cc = JSON.parse(j); if (!cc.url && !cc.apiUrl) { Utils.showToast('Need url', 'warning'); return; } } catch (e) { Utils.showToast('Invalid JSON', 'error'); return; } }
        Utils.showLoading('Saving...');
        try {
            const data = { categoryId: catId, name, placeholder: ph, checkerEnabled: ce, checkerConfig: cc };
            if (this.state.editingItem) {
                await Database.updateInputTable(this.state.editingItem.id, data);
                const idx = this.state.inputTables.findIndex(t=>t.id===this.state.editingItem.id);
                if (idx !== -1) Object.assign(this.state.inputTables[idx], data);
                Utils.showToast('Updated!', 'success');
            } else {
                const nt = await Database.createInputTable(data);
                if (nt) this.state.inputTables.push(nt);
                Utils.showToast('Created!', 'success');
            }
            this.renderInputTables(); this.closeAddInputTable();
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    async deleteInputTable(id) {
        if (!confirm('Delete?')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deleteInputTable(id); this.state.inputTables = this.state.inputTables.filter(t=>t.id!==id); this.renderInputTables(); Utils.showToast('Deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    async testChecker() {
        const tv = document.getElementById('checker-test-value').value.trim();
        if (!tv) { Utils.showToast('Enter test value', 'warning'); return; }
        const j = document.getElementById('checker-json-config').value.trim();
        if (!j) { Utils.showToast('Enter config', 'warning'); return; }
        const rd = document.getElementById('checker-test-result');
        rd.innerHTML = '<div class="test-result-card loading"><div class="checker-loading-content"><div class="checker-spinner"></div><span>Testing...</span></div></div>';
        rd.classList.remove('hidden');
        try {
            let cfg; try { cfg = JSON.parse(j); } catch(e) { rd.innerHTML = `<div class="test-result-card error">Invalid JSON: ${e.message}</div>`; return; }
            const tiv = {}; GameIdChecker.getRequiredInputs(cfg).forEach(n => { const el = document.getElementById(`checker-test-${n.replace(/\s/g,'-').toLowerCase()}`); if (el) tiv[n] = el.value || ''; });
            const r = await GameIdChecker.check(cfg, tv, tiv);
            if (r && r.valid) { let info = ''; if (r.nickname) info += `<div class="test-info-row"><span>Nickname:</span><strong>${r.nickname}</strong></div>`; rd.innerHTML = `<div class="test-result-card valid"><div class="test-result-header valid"><i class="fas fa-check-circle"></i> Found!</div><div class="test-result-body">${info}<details class="raw-response"><summary>Raw</summary><pre>${JSON.stringify(r.raw,null,2)}</pre></details></div></div>`; }
            else { rd.innerHTML = `<div class="test-result-card invalid"><div class="test-result-header invalid"><i class="fas fa-times-circle"></i> Not Found</div><div class="test-result-body">${r?.error?`<p>${r.error}</p>`:''}</div></div>`; }
        } catch (error) { rd.innerHTML = `<div class="test-result-card error"><p>${error.message}</p></div>`; }
    },
    updateTestInputs() {
        const j = document.getElementById('checker-json-config').value.trim();
        const tc = document.getElementById('checker-test-extra-inputs');
        if (!j || !tc) return;
        try { const cfg = JSON.parse(j); const ri = GameIdChecker.getRequiredInputs(cfg); if (ri.length > 0) { tc.innerHTML = ri.map(n=>`<div class="test-extra-input"><label>${n}</label><input type="text" id="checker-test-${n.replace(/\s/g,'-').toLowerCase()}" placeholder="${n}"></div>`).join(''); tc.classList.remove('hidden'); } else { tc.innerHTML=''; tc.classList.add('hidden'); } } catch(e) { tc.innerHTML=''; tc.classList.add('hidden'); }
    },

    // ===== PAYMENTS =====
    renderPayments() {
        const c = document.getElementById('admin-payments-list'); if (!c) return;
        if (!this.state.payments.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payment methods</p></div>'; return; }
        c.innerHTML = this.state.payments.map(p=>`<div class="payment-card"><div class="payment-icon"><img src="${p.icon}" alt="${p.name}"></div><div class="payment-info"><h4>${p.name}</h4><p class="address">${p.address}</p><p class="account">${p.accountName}</p>${p.note?`<p class="note">${p.note}</p>`:''}</div><div class="payment-actions"><button class="action-btn edit" onclick="AdminApp.editPayment('${p.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deletePayment('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
    },
    showAddPayment() { this.state.editingItem = null; ['payment-name','payment-address','payment-account-name','payment-note'].forEach(id=>document.getElementById(id).value=''); document.getElementById('payment-icon').value=''; document.getElementById('payment-icon-preview').innerHTML=''; document.getElementById('payment-icon-preview').classList.add('hidden'); document.getElementById('add-payment-modal').classList.remove('hidden'); },
    editPayment(id) { const p=this.state.payments.find(x=>x.id===id); if(!p) return; this.state.editingItem=p; document.getElementById('payment-name').value=p.name; document.getElementById('payment-address').value=p.address; document.getElementById('payment-account-name').value=p.accountName; document.getElementById('payment-note').value=p.note||''; if(p.icon){document.getElementById('payment-icon-preview').innerHTML=`<img src="${p.icon}">`;document.getElementById('payment-icon-preview').classList.remove('hidden');} document.getElementById('add-payment-modal').classList.remove('hidden'); },
    closeAddPayment() { document.getElementById('add-payment-modal').classList.add('hidden'); this.state.editingItem=null; },
    async savePayment() {
        const name=document.getElementById('payment-name').value.trim(); const addr=document.getElementById('payment-address').value.trim(); const acc=document.getElementById('payment-account-name').value.trim(); const note=document.getElementById('payment-note').value.trim(); const iconInput=document.getElementById('payment-icon');
        if(!name||!addr||!acc){Utils.showToast('Fill fields','warning');return;}
        Utils.showLoading('Saving...');
        try { let icon=this.state.editingItem?.icon||''; if(iconInput.files[0]) icon=await this.uploadToImgbb(iconInput.files[0]); if(!icon&&!this.state.editingItem){Utils.showToast('Upload icon','warning');Utils.hideLoading();return;}
            const data={name,address:addr,accountName:acc,note,icon};
            if(this.state.editingItem){await Database.updatePaymentMethod(this.state.editingItem.id,data);const idx=this.state.payments.findIndex(p=>p.id===this.state.editingItem.id);if(idx!==-1)Object.assign(this.state.payments[idx],data);Utils.showToast('Updated!','success');}
            else{const np=await Database.createPaymentMethod(data);if(np)this.state.payments.push(np);Utils.showToast('Created!','success');}
            this.renderPayments();this.closeAddPayment();
        }catch(error){Utils.showToast('Failed','error');}finally{Utils.hideLoading();}
    },
    async deletePayment(id){if(!confirm('Delete?'))return;Utils.showLoading('Deleting...');try{await Database.deletePaymentMethod(id);this.state.payments=this.state.payments.filter(p=>p.id!==id);this.renderPayments();Utils.showToast('Deleted!','success');}catch(e){Utils.showToast('Failed','error');}finally{Utils.hideLoading();}},

    // ===== ANNOUNCEMENTS =====
    renderAnnouncements() { const ta=document.getElementById('announcement-text'); const ct=document.getElementById('current-announcement-text'); if(ta)ta.value=''; if(ct)ct.textContent=this.state.settings.announcement||'No announcement'; },
    async saveAnnouncement() { const t=document.getElementById('announcement-text').value.trim(); if(!t){Utils.showToast('Enter text','warning');return;} Utils.showLoading('Saving...'); try{await Database.updateSettings({...this.state.settings,announcement:t});this.state.settings.announcement=t;document.getElementById('current-announcement-text').textContent=t;document.getElementById('announcement-text').value='';Utils.showToast('Saved!','success');}catch(e){Utils.showToast('Failed','error');}finally{Utils.hideLoading();} },

    // ===== BROADCAST =====
    async sendBroadcast() { const msg=document.getElementById('broadcast-message').value.trim(); if(!msg){Utils.showToast('Enter message','warning');return;} if(!confirm(`Send to ${this.state.users.length} users?`))return; Utils.showLoading('Broadcasting...'); try{let photo=null;const ii=document.getElementById('broadcast-image');if(ii.files[0])photo=await this.uploadToImgbb(ii.files[0]);const ids=this.state.users.map(u=>u.telegramId);const r=await TelegramBot.broadcast(ids,msg,photo);Utils.showToast(`Sent: ${r.success} ok, ${r.failed} failed`,'success');document.getElementById('broadcast-message').value='';}catch(e){Utils.showToast('Failed','error');}finally{Utils.hideLoading();} },

    // ===== BANNED =====
    renderBannedUsers() { const c=document.getElementById('admin-banned-list');if(!c)return;if(!this.state.bannedUsers.length){c.innerHTML='<div class="empty-state"><i class="fas fa-ban"></i><p>No banned users</p></div>';return;} c.innerHTML=this.state.bannedUsers.map(u=>`<div class="banned-card"><div class="banned-icon"><i class="fas fa-user-slash"></i></div><div class="banned-info"><h4>${u.firstName||'User'}</h4><p>@${u.username||'N/A'} • ${u.telegramId}</p><p class="reason"><strong>Reason:</strong> ${u.reason}</p><p class="date">Banned: ${Utils.formatDate(u.bannedAt,'long')}</p></div><button class="btn btn-success btn-sm" onclick="AdminApp.unbanUser('${u.telegramId}')"><i class="fas fa-check"></i> Unban</button></div>`).join(''); },
    async unbanUser(tid){if(!confirm('Unban?'))return;Utils.showLoading('Unbanning...');try{await Database.unbanUser(tid);await TelegramBot.notifyUnban(tid);this.state.bannedUsers=this.state.bannedUsers.filter(u=>u.telegramId!==tid);this.renderBannedUsers();Utils.showToast('Unbanned!','success');}catch(e){Utils.showToast('Failed','error');}finally{Utils.hideLoading();}},

    // ===== EMOJIS =====
    renderCustomEmojis() { const c=document.getElementById('admin-emojis-list');if(!c)return;const emojis=this.state.settings?.customEmojis||[];if(!emojis.length){c.innerHTML='<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-smile-wink"></i><p>No emojis</p></div>';return;} c.innerHTML=emojis.map(e=>`<div class="emoji-card"><button class="delete-btn" onclick="AdminApp.deleteCustomEmoji('${e.id}')"><i class="fas fa-trash"></i></button><div class="trigger-emoji">${e.trigger}</div><div class="emoji-arrow"><i class="fas fa-arrow-down"></i></div><img class="emoji-preview" src="${e.imageUrl}" alt="${e.name}"><div class="emoji-name">${e.name||'Unnamed'}</div></div>`).join(''); },
    showAddEmoji() { document.getElementById('emoji-name').value='';document.getElementById('emoji-trigger').value='';document.getElementById('emoji-file').value='';document.getElementById('emoji-file-preview').innerHTML='';document.getElementById('emoji-file-preview').classList.add('hidden');document.getElementById('add-emoji-modal').classList.remove('hidden');this.loadEmojiPicker(); },
    closeAddEmoji() { document.getElementById('add-emoji-modal').classList.add('hidden'); },
    loadEmojiPicker() { const emojis=['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','🤐','😳','🥵','🥶','😱','😨','😰','😥','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👻','👽','👾','🤖','❤️','🧡','💛','💚','💙','💜','🖤','💔','💕','💞','💓','💗','💖','💘','💝','⭐','🌟','✨','💫','🎵','💎','🔥','🎮','🕹️','🎲','🧩','🎯','🏆','🥇','✅','❌','⚡','🔮','💡','🔑','🛡️','⚔️','💰','💵','💸','💳','🎁','🎀','🎈','🎉','🎊','⚽','☀️','🔱']; document.getElementById('emoji-picker-grid').innerHTML=emojis.map(e=>`<div class="emoji-item" onclick="AdminApp.selectTriggerEmoji('${e}')">${e}</div>`).join(''); },
    selectTriggerEmoji(e) { document.getElementById('emoji-trigger').value=e;this.closeEmojiPicker(); },
    showEmojiPicker() { this.loadEmojiPicker();document.getElementById('emoji-picker-modal').classList.remove('hidden'); },
    closeEmojiPicker() { document.getElementById('emoji-picker-modal').classList.add('hidden'); },
    async saveCustomEmoji() {
        const name=document.getElementById('emoji-name').value.trim();const trigger=document.getElementById('emoji-trigger').value;const fi=document.getElementById('emoji-file');
        if(!trigger){Utils.showToast('Select trigger','warning');return;}if(!fi.files[0]){Utils.showToast('Upload image','warning');return;}
        if((this.state.settings?.customEmojis||[]).find(e=>e.trigger===trigger)){Utils.showToast('Trigger used','warning');return;}
        Utils.showLoading('Uploading...');
        try{const url=await this.uploadToImgbb(fi.files[0]);const s=this.state.settings||{};if(!s.customEmojis)s.customEmojis=[];const ne={id:'emoji_'+Date.now().toString(36)+Math.random().toString(36).substr(2,9),trigger,imageUrl:url,name,type:'image',createdAt:new Date().toISOString()};s.customEmojis.push(ne);await Database.updateSettings(s);this.state.settings=s;this.closeAddEmoji();this.renderCustomEmojis();Utils.showToast('Created!','success');}catch(e){Utils.showToast('Failed: '+e.message,'error');}finally{Utils.hideLoading();}
    },
    async deleteCustomEmoji(id){if(!confirm('Delete?'))return;Utils.showLoading('Deleting...');try{const s=this.state.settings;s.customEmojis=(s.customEmojis||[]).filter(e=>e.id!==id);await Database.updateSettings(s);this.state.settings=s;this.renderCustomEmojis();Utils.showToast('Deleted!','success');}catch(e){Utils.showToast('Failed','error');}finally{Utils.hideLoading();}},

    // ===== SETTINGS =====
    renderSettings() { const ni=document.getElementById('website-name');const cl=document.getElementById('current-logo');if(ni)ni.value=this.state.settings.websiteName||'';if(this.state.settings.websiteLogo&&cl){cl.src=this.state.settings.websiteLogo;document.getElementById('logo-preview')?.classList.remove('hidden');} },
    async saveSettings() { const wn=document.getElementById('website-name').value.trim();const li=document.getElementById('website-logo'); Utils.showLoading('Saving...'); try{const u={...this.state.settings};if(wn)u.websiteName=wn;if(li.files[0])u.websiteLogo=await this.uploadToImgbb(li.files[0]);await Database.updateSettings(u);this.state.settings=u;Utils.showToast('Saved!','success');}catch(e){Utils.showToast('Failed: '+e.message,'error');}finally{Utils.hideLoading();} },

    // ===== DATABASE IDS =====
    renderDatabaseIds() { document.getElementById('main-bin-id').textContent=CONFIG.BINS.MAIN||'Not set';document.getElementById('users-bin-id').textContent=CONFIG.BINS.USERS||'Not set';document.getElementById('products-bin-id').textContent=CONFIG.BINS.PRODUCTS||'Not set';document.getElementById('categories-bin-id').textContent=CONFIG.BINS.CATEGORIES||'Not set';document.getElementById('orders-bin-id').textContent=CONFIG.BINS.ORDERS||'Not set';document.getElementById('settings-bin-id').textContent=CONFIG.BINS.MAIN||'Not set';document.getElementById('images-bin-id').textContent=CONFIG.BINS.IMAGES||'Not set'; }
};

// ===== GLOBAL FUNCTIONS =====
function showAdminPage(p){AdminApp.showAdminPage(p);}
function filterOrders(f){AdminApp.filterOrders(f);}
function filterTopups(f){AdminApp.filterTopups(f);}
function filterProductsByCategory(){AdminApp.renderProducts();}
function showBannerType(t){AdminApp.renderBannerType(t);}
function showAddCategory(){AdminApp.showAddCategory();}
function closeAddCategory(){AdminApp.closeAddCategory();}
function saveCategory(){AdminApp.saveCategory();}
function showAddProduct(){AdminApp.showAddProduct();}
function closeAddProduct(){AdminApp.closeAddProduct();}
function saveProduct(){AdminApp.saveProduct();}
function showAddBanner(t){AdminApp.showAddBanner(t);}
function closeAddBanner(){AdminApp.closeAddBanner();}
function saveBanner(){AdminApp.saveBanner();}
function showAddInputTable(){AdminApp.showAddInputTable();}
function closeAddInputTable(){AdminApp.closeAddInputTable();}
function saveInputTable(){AdminApp.saveInputTable();}
function showAddPayment(){AdminApp.showAddPayment();}
function closeAddPayment(){AdminApp.closeAddPayment();}
function savePayment(){AdminApp.savePayment();}
function saveAnnouncement(){AdminApp.saveAnnouncement();}
function sendBroadcast(){AdminApp.sendBroadcast();}
function saveSettings(){AdminApp.saveSettings();}
function showAddEmoji(){AdminApp.showAddEmoji();}
function closeAddEmoji(){AdminApp.closeAddEmoji();}
function showEmojiPicker(){AdminApp.showEmojiPicker();}
function closeEmojiPicker(){AdminApp.closeEmojiPicker();}
function saveCustomEmoji(){AdminApp.saveCustomEmoji();}
function triggerEmojiUpload(){document.getElementById('emoji-file').click();}
function showBulkImportModal(){AdminApp.showBulkImportModal();}
function closeBulkImportModal(){AdminApp.closeBulkImportModal();}
function showBulkPriceUpdateModal(){AdminApp.showBulkPriceUpdateModal();}
function closeBulkPriceUpdateModal(){AdminApp.closeBulkPriceUpdateModal();}
function previewEmojiFile(event){const f=event.target.files[0];if(!f)return;const at=['image/png','image/jpeg','image/jpg','image/gif','image/webp'];if(!at.includes(f.type)){Utils.showToast('Invalid type','warning');event.target.value='';return;}const p=document.getElementById('emoji-file-preview');const r=new FileReader();r.onload=e=>{p.innerHTML=`<img src="${e.target.result}"><button class="remove-file" onclick="removeEmojiFile()">Remove</button>`;p.classList.remove('hidden');};r.readAsDataURL(f);}
function removeEmojiFile(){document.getElementById('emoji-file').value='';document.getElementById('emoji-file-preview').innerHTML='';document.getElementById('emoji-file-preview').classList.add('hidden');}
function closeUserDetails(){AdminApp.closeUserDetails();}
function copyId(id){Utils.copyToClipboard(document.getElementById(id).textContent);}
function toggleCheckerConfig(){const e=document.getElementById('checker-enabled').checked;document.getElementById('checker-json-section').classList.toggle('hidden',!e);document.getElementById('checker-test-section').classList.toggle('hidden',!e);if(!e){document.getElementById('checker-json-preview').classList.add('hidden');document.getElementById('checker-test-result').classList.add('hidden');}}
function onCheckerJsonInput(){AdminApp.previewCheckerConfig();AdminApp.updateTestInputs();}
function loadSampleConfig(t){AdminApp.loadSampleConfig(t);}
function testChecker(){AdminApp.testChecker();}
function triggerCategoryIconUpload(){document.getElementById('category-icon').click();}
function triggerProductIconUpload(){document.getElementById('product-icon').click();}
function triggerBannerUpload(){document.getElementById('banner-image').click();}
function triggerPaymentIconUpload(){document.getElementById('payment-icon').click();}
function triggerLogoUpload(){document.getElementById('website-logo').click();}
function triggerBroadcastImageUpload(){document.getElementById('broadcast-image').click();}

// G2Bulk API
const G2BulkAPI=window.G2BulkAPI||{get URL(){return CONFIG.G2BULK.API_URL;},get KEY(){return CONFIG.G2BULK.API_KEY;},async request(a,p={}){const r=await fetch(this.URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:this.KEY,action:a,...p})});return await r.json();},async getServices(){return await this.request('services');},async getBalance(){return await this.request('balance');},async placeOrder(s,l,q=1){return await this.request('add',{service:s,link:l,quantity:q});},async checkStatus(o){return await this.request('status',{order:o});}};
window.G2BulkAPI=G2BulkAPI;

// GameIdChecker
const GameIdChecker=window.GameIdChecker||{async check(config,value,allInputValues={}){if(!config)return null;if(typeof config==='string'){try{config=JSON.parse(config);}catch(e){return null;}}const url=config.url||config.apiUrl;if(!url)return null;const method=(config.method||'POST').toUpperCase();const headers=config.headers||{'Content-Type':'application/json'};try{let fetchUrl=url;let options={method,headers:{...headers}};const safe=v=>String(v||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n');if(method==='POST'){if(config.body){let b=JSON.stringify(config.body);b=b.replace(/\{\{value\}\}/gi,safe(value));Object.entries(allInputValues).forEach(([n,v])=>{b=b.replace(new RegExp(`\\{\\{${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\}\\}`,'g'),safe(v));});options.body=b;}}else{fetchUrl=fetchUrl.replace(/\{\{value\}\}/gi,encodeURIComponent(value));Object.entries(allInputValues).forEach(([n,v])=>{fetchUrl=fetchUrl.replace(new RegExp(`\\{\\{${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\}\\}`,'g'),encodeURIComponent(v||''));});}const r=await fetch(fetchUrl,options);const d=await r.json();let valid=false,nickname=null,country=null;const rp=config.responsePath||config.response;if(rp){const vv=rp.valid?this.getNestedValue(d,rp.valid):null;nickname=rp.nickname?this.getNestedValue(d,rp.nickname):null;country=rp.country?this.getNestedValue(d,rp.country):null;valid=vv!==null&&vv!==undefined?!!vv:!!nickname;}return{valid,nickname,playerName:nickname,country,raw:d};}catch(e){return{valid:false,nickname:null,error:e.message};}},getNestedValue(o,p){if(!p)return null;return p.split('.').reduce((c,k)=>c?.[k],o);},getRequiredInputs(c){if(!c)return[];if(typeof c==='string'){try{c=JSON.parse(c);}catch(e){return[];}}if(!c.body)return[];const s=JSON.stringify(c.body);const m=s.match(/\{\{([^}]+)\}\}/g)||[];return m.map(x=>x.replace(/\{\{|\}\}/g,'')).filter(n=>n.toLowerCase()!=='value');}};
window.GameIdChecker=GameIdChecker;

// CountryHelper
const CountryHelper=window.CountryHelper||{countries:{'MM':'🇲🇲 Myanmar','US':'🇺🇸 USA','CN':'🇨🇳 China','JP':'🇯🇵 Japan','KR':'🇰🇷 Korea','TH':'🇹🇭 Thailand','VN':'🇻🇳 Vietnam','ID':'🇮🇩 Indonesia','PH':'🇵🇭 Philippines','MY':'🇲🇾 Malaysia','SG':'🇸🇬 Singapore','IN':'🇮🇳 India','BR':'🇧🇷 Brazil','RU':'🇷🇺 Russia','DE':'🇩🇪 Germany','GB':'🇬🇧 UK','FR':'🇫🇷 France','AU':'🇦🇺 Australia','CA':'🇨🇦 Canada','TR':'🇹🇷 Turkey','SA':'🇸🇦 Saudi','AE':'🇦🇪 UAE','EG':'🇪🇬 Egypt','PK':'🇵🇰 Pakistan','BD':'🇧🇩 Bangladesh','MX':'🇲🇽 Mexico','TW':'🇹🇼 Taiwan','HK':'🇭🇰 Hong Kong'},getDisplay(c){if(!c)return'';c=String(c).toUpperCase().trim();return this.countries[c]||`🌐 ${c}`;}};
window.CountryHelper=CountryHelper;

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded',()=>{
    const ph=[{input:'category-icon',preview:'category-icon-preview'},{input:'product-icon',preview:'product-icon-preview'},{input:'banner-image',preview:'banner-image-preview'},{input:'payment-icon',preview:'payment-icon-preview'},{input:'broadcast-image',preview:'broadcast-image-preview'}];
    ph.forEach(({input,preview})=>{document.getElementById(input)?.addEventListener('change',e=>{if(e.target.files[0]){const p=document.getElementById(preview);const r=new FileReader();r.onload=ev=>{p.innerHTML=`<img src="${ev.target.result}">`;p.classList.remove('hidden');};r.readAsDataURL(e.target.files[0]);}});});
    document.getElementById('website-logo')?.addEventListener('change',e=>{if(e.target.files[0]){const r=new FileReader();r.onload=ev=>{document.getElementById('current-logo').src=ev.target.result;document.getElementById('logo-preview').classList.remove('hidden');};r.readAsDataURL(e.target.files[0]);}});
    AdminApp.init();
});
