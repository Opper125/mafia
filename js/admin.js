// ===== Admin Panel Application - G2Bulk Integrated =====

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
        // NEW: G2Bulk state
        g2bulkServices: [],
        g2bulkServicesRaw: [],
        g2bulkBalance: null,
        g2bulkCategories: []
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
            
            // Load G2Bulk balance on start
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
    
    // ===== DASHBOARD (UPDATED) =====
    renderDashboard() {
        document.getElementById('stat-users').textContent = this.state.stats.totalUsers || this.state.users.length || 0;
        document.getElementById('stat-orders').textContent = this.state.stats.totalOrders || this.state.orders.length || 0;
        document.getElementById('stat-revenue').textContent = this.state.stats.totalRevenue || 0;
        document.getElementById('stat-pending').textContent = this.state.stats.pendingOrders || this.state.orders.filter(o => o.status === 'pending').length || 0;
        
        // NEW stats
        const processingEl = document.getElementById('stat-processing');
        const queuedEl = document.getElementById('stat-queued');
        if (processingEl) processingEl.textContent = this.state.stats.processingOrders || this.state.orders.filter(o => o.status === 'processing').length || 0;
        if (queuedEl) queuedEl.textContent = this.state.stats.queuedOrders || this.state.orders.filter(o => o.status === 'queued').length || 0;
        
        this.renderRecentOrders();
        this.renderRecentTopups();
    },
    
    // NEW: Refresh G2Bulk API Balance
    async refreshApiBalance() {
        try {
            const result = await G2BulkAPI.getBalance();
            if (result && result.balance) {
                this.state.g2bulkBalance = result;
                const displayEl = document.getElementById('api-balance-value');
                const g2bulkDisplayEl = document.getElementById('g2bulk-balance-display');
                const balanceText = `$${parseFloat(result.balance).toFixed(4)} ${result.currency || 'USD'}`;
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
            return `<div class="recent-item">
                <img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User">
                <div class="recent-item-info"><h4>${user?.firstName || 'User'}</h4><p>${order.productName}</p></div>
                <div class="recent-item-right">
                    <span class="recent-item-amount">${Utils.formatCurrency(order.amount, order.currency)}</span>
                    <span class="status-badge-sm ${order.status}">${order.status}</span>
                </div>
            </div>`;
        }).join('');
    },
    
    renderRecentTopups() {
        const container = document.getElementById('recent-topups');
        if (!container) return;
        const recent = [...this.state.topups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent.length === 0) { container.innerHTML = '<p class="empty-text">No top-ups yet</p>'; return; }
        container.innerHTML = recent.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `<div class="recent-item">
                <img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User">
                <div class="recent-item-info"><h4>${user?.firstName || 'User'}</h4><p>${topup.paymentMethod}</p></div>
                <span class="recent-item-amount positive">+${Utils.formatCurrency(topup.amount, 'MMK')}</span>
            </div>`;
        }).join('');
    },
    
    getAvatar(id) {
        return `https://ui-avatars.com/api/?name=${id}&background=8b5cf6&color=fff&size=100`;
    },
    
    // ===== USERS (unchanged) =====
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
                await this.loadAdminData();
                this.renderUsers();
                this.closeUserDetails();
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
                await this.loadAdminData();
                this.renderUsers();
                this.closeUserDetails();
                Utils.showToast('User banned', 'success');
            } catch (error) { Utils.showToast('Failed to ban user', 'error'); }
            finally { Utils.hideLoading(); }
        }
    },
    
    closeUserDetails() { document.getElementById('user-details-modal').classList.add('hidden'); },
    
    // ===== ORDERS (COMPLETELY UPDATED for G2Bulk) =====
    renderOrders() {
        const container = document.getElementById('admin-orders-list');
        if (!container) return;
        
        let filtered = [...this.state.orders];
        if (this.state.ordersFilter !== 'all') {
            filtered = filtered.filter(o => o.status === this.state.ordersFilter);
        }
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders found</p></div>';
            return;
        }
        
        container.innerHTML = filtered.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `<div class="order-card">
                <div class="order-header">
                    <div class="order-user">
                        <img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User">
                        <div><h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4><p>@${user?.username || 'N/A'}</p></div>
                    </div>
                    <span class="status-badge ${order.status}">${order.status}</span>
                </div>
                <div class="order-body">
                    <div class="order-info-row"><span>Order ID:</span><strong>${order.orderId}</strong></div>
                    <div class="order-info-row"><span>Product:</span><strong>${order.productName}</strong></div>
                    <div class="order-info-row"><span>Amount:</span><strong class="amount">${Utils.formatCurrency(order.amount, order.currency)}</strong></div>
                    <div class="order-info-row"><span>Category:</span><strong>${order.categoryName || 'N/A'}</strong></div>
                    ${order.serviceId ? `<div class="order-info-row"><span>Service ID:</span><strong>#${order.serviceId}</strong></div>` : ''}
                    ${order.apiOrderId ? `<div class="order-info-row api-row"><span>API Order:</span><strong>#${order.apiOrderId}</strong></div>` : ''}
                    ${order.apiStatus ? `<div class="order-info-row"><span>API Status:</span><strong class="api-status-${order.apiStatus?.toLowerCase().replace(/\s/g,'-')}">${order.apiStatus}</strong></div>` : ''}
                    ${order.link ? `<div class="order-info-row"><span>Game Link:</span><strong>${order.link}</strong></div>` : ''}
                    ${order.apiError ? `<div class="order-info-row error-row"><span>Error:</span><strong>${order.apiError}</strong></div>` : ''}
                    ${order.refundedAt ? `<div class="order-info-row refund-row"><span>Refunded:</span><strong>${Utils.formatCurrency(order.refundAmount || order.amount, order.currency)} at ${Utils.formatDate(order.refundedAt)}</strong></div>` : ''}
                    ${order.inputValues ? `<div class="order-inputs"><span>Input Values:</span><ul>${Object.entries(order.inputValues).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}</ul></div>` : ''}
                    <div class="order-date"><i class="fas fa-clock"></i> ${Utils.formatDate(order.createdAt, 'long')}</div>
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="AdminApp.approveOrder('${order.id}')"><i class="fas fa-check"></i> Approve</button>
                        <button class="btn btn-danger" onclick="AdminApp.rejectOrder('${order.id}')"><i class="fas fa-times"></i> Reject</button>
                    ` : ''}
                    ${order.status === 'processing' && order.apiOrderId ? `
                        <button class="btn btn-info" onclick="AdminApp.checkOrderApiStatus('${order.id}')"><i class="fas fa-sync-alt"></i> Check Status</button>
                    ` : ''}
                    ${order.status === 'queued' ? `
                        <button class="btn btn-warning" onclick="AdminApp.retryQueuedOrder('${order.id}')"><i class="fas fa-redo"></i> Retry Now</button>
                        <button class="btn btn-danger" onclick="AdminApp.cancelQueuedOrder('${order.id}')"><i class="fas fa-times"></i> Cancel & Refund</button>
                    ` : ''}
                </div>
            </div>`;
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
            await this.loadAdminData();
            this.renderOrders();
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
            await this.loadAdminData();
            this.renderOrders();
            Utils.showToast('Order rejected & refunded', 'success');
        } catch (error) { Utils.showToast('Failed to reject', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // NEW: Check single order API status from admin
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
                
                await Database.updateOrderApiStatus(order.id, {
                    apiStatus: apiStatus,
                    status: newStatus,
                    apiCharge: result.charge || null
                });
                
                await this.loadAdminData();
                this.renderOrders();
                Utils.showToast(`API Status: ${apiStatus}`, 'success');
            } else {
                Utils.showToast('API Error: ' + (result?.error || 'Unknown'), 'error');
            }
        } catch (error) { Utils.showToast('Failed to check status', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // NEW: Retry a queued order
    async retryQueuedOrder(orderId) {
        const order = this.state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        Utils.showLoading('Retrying order...');
        try {
            const apiResult = await G2BulkAPI.placeOrder(order.serviceId, order.link, 1);
            
            if (apiResult && apiResult.order) {
                await Database.updateOrderApiStatus(order.id, {
                    apiOrderId: apiResult.order,
                    apiStatus: 'Processing',
                    status: 'processing',
                    apiError: null
                });
                Utils.showToast('✅ Order is now processing!', 'success');
            } else {
                Utils.showToast('❌ Retry failed: ' + (apiResult?.error || 'Unknown'), 'error');
            }
            
            await this.loadAdminData();
            this.renderOrders();
        } catch (error) { Utils.showToast('Failed to retry', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // NEW: Cancel queued order and refund
    async cancelQueuedOrder(orderId) {
        if (!confirm('Cancel this order and refund the user?')) return;
        
        Utils.showLoading('Canceling...');
        try {
            await Database.updateOrderApiStatus(orderId, {
                apiStatus: 'Canceled',
                status: 'failed',
                apiError: 'Canceled by admin'
            });
            await this.loadAdminData();
            this.renderOrders();
            Utils.showToast('Order canceled & refunded', 'success');
        } catch (error) { Utils.showToast('Failed to cancel', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== TOPUPS (unchanged) =====
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
            ${topup.proofImage ? `<div class="topup-proof"><img src="${topup.proofImage}" alt="Payment Proof" onclick="window.open('${topup.proofImage}', '_blank')"></div>` : ''}</div>
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
            await this.loadAdminData(); this.renderTopups();
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
            await this.loadAdminData(); this.renderTopups();
            Utils.showToast('Top-up rejected', 'success');
        } catch (error) { Utils.showToast('Failed to reject', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== CATEGORIES (unchanged) =====
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
            if (iconInput.files[0]) icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            if (!icon && !this.state.editingItem) { Utils.showToast('Please upload icon', 'warning'); Utils.hideLoading(); return; }
            const data = { name, flag, hasDiscount, icon };
            if (this.state.editingItem) { await Database.updateCategory(this.state.editingItem.id, data); Utils.showToast('Category updated!', 'success'); }
            else { await Database.createCategory(data); Utils.showToast('Category created!', 'success'); }
            await this.loadAdminData(); this.renderCategories(); this.closeAddCategory();
        } catch (error) { Utils.showToast('Failed to save', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteCategory(categoryId) {
        if (!confirm('Delete this category? All products will also be deleted.')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deleteCategory(categoryId); await this.loadAdminData(); this.renderCategories(); Utils.showToast('Category deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed to delete', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== PRODUCTS (UPDATED with G2Bulk) =====
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
        
        if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><p>No products yet</p></div>'; return; }
        
        container.innerHTML = filtered.map(product => {
            const cat = this.state.categories.find(c => c.id === product.categoryId);
            return `<div class="product-card">
                <div class="product-icon"><img src="${product.icon}" alt="${product.name}">${product.discount > 0 ? `<span class="discount-tag">-${product.discount}%</span>` : ''}</div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${cat?.name || 'Unknown'}</p>
                    <div class="product-price">${product.discount > 0 ? `<span class="original">${Utils.formatCurrency(product.price, product.currency)}</span>` : ''}<span class="current">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</span></div>
                    ${product.serviceId ? `<p class="product-api-info"><i class="fas fa-bolt"></i> Service #${product.serviceId} ${product.g2bulkRate ? `• $${product.g2bulkRate}/unit` : ''}</p>` : '<p class="product-manual"><i class="fas fa-hand-paper"></i> Manual</p>'}
                    <p class="product-delivery"><i class="fas fa-bolt"></i> ${product.serviceId ? 'Auto Delivery' : (product.deliveryTime === 'instant' ? 'Instant' : product.deliveryTime)}</p>
                </div>
                <div class="product-actions">
                    <button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    },
    
    showAddProduct() {
        this.state.editingItem = null;
        document.getElementById('product-modal-title').textContent = 'Add Product';
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-currency').value = 'MMK';
        document.getElementById('product-discount').value = '';
        document.getElementById('product-delivery').value = 'instant';
        document.getElementById('product-service-id').value = '';
        document.getElementById('product-g2bulk-rate').value = '';
        document.getElementById('product-g2bulk-min').value = '';
        document.getElementById('product-g2bulk-max').value = '';
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
    
    // NEW: Lookup G2Bulk service by ID
    async lookupServiceId() {
        const serviceId = document.getElementById('product-service-id').value;
        if (!serviceId) { Utils.showToast('Enter a Service ID first', 'warning'); return; }
        
        const resultDiv = document.getElementById('service-lookup-result');
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Looking up...';
        resultDiv.classList.remove('hidden');
        
        try {
            // Fetch all services and find the one
            if (this.state.g2bulkServicesRaw.length === 0) {
                const servicesResult = await G2BulkAPI.getServices();
                this.state.g2bulkServicesRaw = servicesResult || [];
            }
            
            const service = this.state.g2bulkServicesRaw.find(s => String(s.service) === String(serviceId));
            
            if (service) {
                resultDiv.innerHTML = `<div class="service-found">
                    <i class="fas fa-check-circle"></i>
                    <div><strong>${service.name}</strong><br>
                    Rate: $${service.rate} | Min: ${service.min} | Max: ${service.max}<br>
                    Category: ${service.category}</div>
                </div>`;
                resultDiv.className = 'service-lookup-result valid';
                
                // Auto-fill fields
                document.getElementById('product-g2bulk-rate').value = service.rate;
                document.getElementById('product-g2bulk-min').value = service.min;
                document.getElementById('product-g2bulk-max').value = service.max;
                
                // Auto-fill product name if empty
                if (!document.getElementById('product-name').value) {
                    document.getElementById('product-name').value = service.name;
                }
            } else {
                resultDiv.innerHTML = '<i class="fas fa-times-circle"></i> Service not found';
                resultDiv.className = 'service-lookup-result invalid';
            }
        } catch (error) {
            resultDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Lookup failed: ' + error.message;
            resultDiv.className = 'service-lookup-result error';
        }
    },
    
    // NEW: Open G2Bulk service browser
    async openG2BulkServiceBrowser() {
        document.getElementById('g2bulk-browser-modal').classList.remove('hidden');
        
        if (this.state.g2bulkServicesRaw.length === 0) {
            document.getElementById('g2bulk-browser-list').innerHTML = '<p>Loading services...</p>';
            try {
                const result = await G2BulkAPI.getServices();
                this.state.g2bulkServicesRaw = result || [];
            } catch (e) {
                document.getElementById('g2bulk-browser-list').innerHTML = '<p>Failed to load services</p>';
                return;
            }
        }
        
        this.renderBrowserServices(this.state.g2bulkServicesRaw.slice(0, 50));
    },
    
    closeG2BulkBrowser() { document.getElementById('g2bulk-browser-modal').classList.add('hidden'); },
    
    renderBrowserServices(services) {
        const container = document.getElementById('g2bulk-browser-list');
        if (services.length === 0) { container.innerHTML = '<p>No services found</p>'; return; }
        container.innerHTML = services.slice(0, 100).map(s => `
            <div class="g2bulk-browser-item" onclick="AdminApp.selectBrowserService(${s.service})">
                <div class="service-id">#${s.service}</div>
                <div class="service-info"><strong>${s.name}</strong><br><small>$${s.rate} | Min: ${s.min} | Max: ${s.max}</small></div>
                <button class="btn btn-sm btn-primary"><i class="fas fa-check"></i></button>
            </div>
        `).join('');
    },
    
    filterBrowserServices() {
        const query = document.getElementById('g2bulk-browser-search').value.toLowerCase();
        const filtered = this.state.g2bulkServicesRaw.filter(s => 
            s.name.toLowerCase().includes(query) || 
            String(s.service).includes(query) ||
            (s.category && s.category.toLowerCase().includes(query))
        );
        this.renderBrowserServices(filtered);
    },
    
    selectBrowserService(serviceId) {
        const service = this.state.g2bulkServicesRaw.find(s => s.service === serviceId);
        if (!service) return;
        
        document.getElementById('product-service-id').value = service.service;
        document.getElementById('product-g2bulk-rate').value = service.rate;
        document.getElementById('product-g2bulk-min').value = service.min;
        document.getElementById('product-g2bulk-max').value = service.max;
        if (!document.getElementById('product-name').value) {
            document.getElementById('product-name').value = service.name;
        }
        
        this.closeG2BulkBrowser();
        Utils.showToast(`Selected: #${service.service} - ${service.name}`, 'success');
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
        
        if (!categoryId || !name || isNaN(price)) { Utils.showToast('Please fill all required fields', 'warning'); return; }
        
        Utils.showLoading('Saving...');
        try {
            let icon = this.state.editingItem?.icon || '';
            if (iconInput.files[0]) {
                const formData = new FormData();
                formData.append('image', iconInput.files[0]);
                const response = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: formData });
                const result = await response.json();
                if (!result.success) throw new Error(result.error?.message || 'Icon upload failed');
                icon = result.data.url;
            }
            if (!icon && !this.state.editingItem) { Utils.showToast('Please upload icon', 'warning'); Utils.hideLoading(); return; }
            
            // Find service name from lookup
            let g2bulkServiceName = '';
            if (serviceId && this.state.g2bulkServicesRaw.length > 0) {
                const svc = this.state.g2bulkServicesRaw.find(s => String(s.service) === String(serviceId));
                if (svc) g2bulkServiceName = svc.name;
            }
            
            const data = {
                categoryId, name, price, currency, discount, deliveryTime, icon,
                serviceId: serviceId ? parseInt(serviceId) : null,
                g2bulkRate: g2bulkRate || null,
                g2bulkMin: g2bulkMin ? parseInt(g2bulkMin) : null,
                g2bulkMax: g2bulkMax ? parseInt(g2bulkMax) : null,
                g2bulkServiceName: g2bulkServiceName
            };
            
            if (this.state.editingItem) { await Database.updateProduct(this.state.editingItem.id, data); Utils.showToast('Product updated!', 'success'); }
            else { await Database.createProduct(data); Utils.showToast('Product created!', 'success'); }
            
            await this.loadAdminData(); this.renderProducts(); this.closeAddProduct();
        } catch (error) { Utils.showToast('Failed to save: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteProduct(productId) {
        if (!confirm('Delete this product?')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deleteProduct(productId); await this.loadAdminData(); this.renderProducts(); Utils.showToast('Product deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed to delete', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== G2BULK SERVICES PAGE (NEW) =====
    
    renderG2BulkPage() {
        this.refreshApiBalance();
        if (this.state.g2bulkServicesRaw.length > 0) {
            this.renderG2BulkServicesList(this.state.g2bulkServicesRaw);
        }
    },
    
    async refreshG2BulkServices() {
        Utils.showLoading('Loading G2Bulk services...');
        try {
            const result = await G2BulkAPI.getServices();
            this.state.g2bulkServicesRaw = result || [];
            
            // Extract unique categories
            const cats = [...new Set(this.state.g2bulkServicesRaw.map(s => s.category).filter(Boolean))];
            this.state.g2bulkCategories = cats.sort();
            
            // Populate category filter
            const catFilter = document.getElementById('g2bulk-category-filter');
            if (catFilter) {
                catFilter.innerHTML = '<option value="all">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
            }
            
            this.renderG2BulkServicesList(this.state.g2bulkServicesRaw);
            Utils.showToast(`Loaded ${this.state.g2bulkServicesRaw.length} services`, 'success');
        } catch (error) {
            Utils.showToast('Failed to load services: ' + error.message, 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    filterG2BulkServices() {
        const query = (document.getElementById('g2bulk-search')?.value || '').toLowerCase();
        const catFilter = document.getElementById('g2bulk-category-filter')?.value || 'all';
        
        let filtered = [...this.state.g2bulkServicesRaw];
        
        if (catFilter !== 'all') {
            filtered = filtered.filter(s => s.category === catFilter);
        }
        
        if (query) {
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(query) || 
                String(s.service).includes(query) ||
                (s.category && s.category.toLowerCase().includes(query))
            );
        }
        
        this.renderG2BulkServicesList(filtered);
    },
    
    renderG2BulkServicesList(services) {
        const container = document.getElementById('g2bulk-services-list');
        const countEl = document.getElementById('g2bulk-services-count');
        
        if (countEl) countEl.textContent = `${services.length} services found`;
        
        if (services.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No services found</p></div>';
            return;
        }
        
        // Show max 200 for performance
        const display = services.slice(0, 200);
        
        container.innerHTML = display.map(service => `
            <div class="g2bulk-service-card">
                <div class="service-header">
                    <span class="service-id-badge">#${service.service}</span>
                    <span class="service-category-badge">${service.category || 'N/A'}</span>
                </div>
                <div class="service-name">${service.name}</div>
                <div class="service-details">
                    <div class="service-detail"><span>Rate:</span><strong>$${service.rate}</strong></div>
                    <div class="service-detail"><span>Min:</span><strong>${service.min}</strong></div>
                    <div class="service-detail"><span>Max:</span><strong>${service.max}</strong></div>
                </div>
                <button class="btn btn-primary btn-sm btn-full" onclick="AdminApp.quickAddProduct(${service.service})">
                    <i class="fas fa-plus"></i> Add as Product
                </button>
            </div>
        `).join('');
        
        if (services.length > 200) {
            container.innerHTML += `<p class="load-more-text">Showing 200 of ${services.length} services. Use search to find more.</p>`;
        }
    },
    
    // NEW: Quick add product from G2Bulk service
    quickAddProduct(serviceId) {
        const service = this.state.g2bulkServicesRaw.find(s => s.service === serviceId);
        if (!service) return;
        
        this.showAddProduct();
        document.getElementById('product-service-id').value = service.service;
        document.getElementById('product-name').value = service.name;
        document.getElementById('product-g2bulk-rate').value = service.rate;
        document.getElementById('product-g2bulk-min').value = service.min;
        document.getElementById('product-g2bulk-max').value = service.max;
    },
    
    // ===== BANNERS (unchanged) =====
    renderBanners() { this.renderBannerType(this.state.currentBannerType); },
    
    renderBannerType(type) {
        this.state.currentBannerType = type;
        document.querySelectorAll('.banner-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        const activeTab = document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`);
        if (activeTab) activeTab.classList.add('active');
        document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1');
        document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2');
        
        const banners = type === 'type1' ? (this.state.banners.type1 || []) : (this.state.banners.type2 || []);
        const container = document.getElementById(`banners-${type}-list`);
        if (!container) return;
        if (banners.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No banners yet</p></div>'; return; }
        container.innerHTML = banners.map(banner => {
            const cat = type === 'type2' ? this.state.categories.find(c => c.id === banner.categoryId) : null;
            return `<div class="banner-card"><img src="${banner.image}" alt="Banner"><div class="banner-info">${cat ? `<p><strong>Category:</strong> ${cat.name}</p>` : ''}${banner.description ? `<p class="description">${banner.description.substring(0, 100)}...</p>` : ''}<p class="date">${Utils.formatDate(banner.createdAt)}</p></div><button class="btn btn-danger btn-sm" onclick="AdminApp.deleteBanner('${banner.id}', '${type}')"><i class="fas fa-trash"></i> Delete</button></div>`;
        }).join('');
    },
    
    showAddBanner(type) {
        this.state.currentBannerType = type;
        document.getElementById('banner-category-group').style.display = type === 'type2' ? 'block' : 'none';
        document.getElementById('banner-text-group').style.display = type === 'type2' ? 'block' : 'none';
        if (type === 'type2') document.getElementById('banner-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('banner-image').value = '';
        document.getElementById('banner-text').value = '';
        document.getElementById('banner-image-preview').innerHTML = '';
        document.getElementById('banner-image-preview').classList.add('hidden');
        document.getElementById('add-banner-modal').classList.remove('hidden');
    },
    
    closeAddBanner() { document.getElementById('add-banner-modal').classList.add('hidden'); },
    
    async saveBanner() {
        const type = this.state.currentBannerType;
        const imageInput = document.getElementById('banner-image');
        const categoryId = document.getElementById('banner-category')?.value;
        const description = document.getElementById('banner-text')?.value;
        if (!imageInput.files[0]) { Utils.showToast('Please upload an image', 'warning'); return; }
        if (type === 'type2' && !categoryId) { Utils.showToast('Please select a category', 'warning'); return; }
        Utils.showLoading('Uploading banner...');
        try {
            const formData = new FormData();
            formData.append('image', imageInput.files[0]);
            const response = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!result.success) throw new Error(result.error?.message || 'Upload failed');
            const data = { image: result.data.url };
            if (type === 'type2') { data.categoryId = categoryId; data.description = description; }
            await Database.createBanner(data, type);
            await this.loadAdminData(); this.renderBanners(); this.closeAddBanner();
            Utils.showToast('Banner created!', 'success');
        } catch (error) { Utils.showToast('Failed to save banner: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteBanner(bannerId, type) {
        if (!confirm('Delete this banner?')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deleteBanner(bannerId, type); await this.loadAdminData(); this.renderBanners(); Utils.showToast('Banner deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed to delete', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== INPUT TABLES (UPDATED with Checker) =====
    renderInputTables() {
        const container = document.getElementById('admin-input-tables-list');
        if (!container) return;
        if (this.state.inputTables.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-keyboard"></i><p>No input tables yet</p></div>'; return; }
        container.innerHTML = this.state.inputTables.map(table => {
            const cat = this.state.categories.find(c => c.id === table.categoryId);
            return `<div class="input-table-card">
                <div class="input-table-icon"><i class="fas fa-keyboard"></i></div>
                <div class="input-table-info">
                    <h4>${table.name}</h4>
                    <p>${cat?.name || 'Unknown'}</p>
                    <p class="placeholder">"${table.placeholder}"</p>
                    ${table.checkerEnabled ? '<span class="checker-badge"><i class="fas fa-search"></i> ID Checker Enabled</span>' : ''}
                </div>
                <div class="input-table-actions">
                    <button class="action-btn edit" onclick="AdminApp.editInputTable('${table.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="AdminApp.deleteInputTable('${table.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        }).join('');
    },
    
    showAddInputTable() {
        this.state.editingItem = null;
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('checker-enabled').checked = false;
        document.getElementById('checker-config-section').classList.add('hidden');
        document.getElementById('checker-api-url').value = '';
        document.getElementById('checker-method').value = 'GET';
        document.getElementById('checker-headers').value = '';
        document.getElementById('checker-body-template').value = '';
        document.getElementById('checker-name-path').value = '';
        document.getElementById('checker-valid-path').value = '';
        document.getElementById('checker-error-msg').value = 'Invalid Game ID. Please check and try again.';
        document.getElementById('checker-test-result').classList.add('hidden');
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    editInputTable(tableId) {
        const table = this.state.inputTables.find(t => t.id === tableId);
        if (!table) return;
        this.state.editingItem = table;
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' + this.state.categories.map(c => `<option value="${c.id}" ${c.id === table.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = table.name;
        document.getElementById('input-table-placeholder').value = table.placeholder;
        
        // Load checker config
        document.getElementById('checker-enabled').checked = table.checkerEnabled || false;
        document.getElementById('checker-config-section').classList.toggle('hidden', !table.checkerEnabled);
        
        if (table.checkerConfig) {
            document.getElementById('checker-api-url').value = table.checkerConfig.apiUrl || '';
            document.getElementById('checker-method').value = table.checkerConfig.method || 'GET';
            document.getElementById('checker-headers').value = table.checkerConfig.headers ? JSON.stringify(table.checkerConfig.headers, null, 2) : '';
            document.getElementById('checker-body-template').value = table.checkerConfig.bodyTemplate || '';
            document.getElementById('checker-name-path').value = table.checkerConfig.responseNamePath || '';
            document.getElementById('checker-valid-path').value = table.checkerConfig.responseValidPath || '';
            document.getElementById('checker-error-msg').value = table.checkerConfig.errorMessage || 'Invalid Game ID';
        }
        
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    closeAddInputTable() { document.getElementById('add-input-table-modal').classList.add('hidden'); this.state.editingItem = null; },
    
    async saveInputTable() {
        const categoryId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const placeholder = document.getElementById('input-table-placeholder').value.trim();
        const checkerEnabled = document.getElementById('checker-enabled').checked;
        
        if (!categoryId || !name || !placeholder) { Utils.showToast('Please fill all fields', 'warning'); return; }
        
        let checkerConfig = null;
        if (checkerEnabled) {
            const apiUrl = document.getElementById('checker-api-url').value.trim();
            if (!apiUrl) { Utils.showToast('Please enter API URL for checker', 'warning'); return; }
            
            let headers = {};
            try {
                const headersStr = document.getElementById('checker-headers').value.trim();
                if (headersStr) headers = JSON.parse(headersStr);
            } catch (e) { Utils.showToast('Invalid headers JSON', 'error'); return; }
            
            checkerConfig = {
                apiUrl: apiUrl,
                method: document.getElementById('checker-method').value,
                headers: headers,
                bodyTemplate: document.getElementById('checker-body-template').value.trim(),
                responseNamePath: document.getElementById('checker-name-path').value.trim(),
                responseValidPath: document.getElementById('checker-valid-path').value.trim(),
                errorMessage: document.getElementById('checker-error-msg').value.trim() || 'Invalid Game ID'
            };
        }
        
        Utils.showLoading('Saving...');
        try {
            const data = { categoryId, name, placeholder, checkerEnabled, checkerConfig };
            if (this.state.editingItem) { await Database.updateInputTable(this.state.editingItem.id, data); Utils.showToast('Updated!', 'success'); }
            else { await Database.createInputTable(data); Utils.showToast('Created!', 'success'); }
            await this.loadAdminData(); this.renderInputTables(); this.closeAddInputTable();
        } catch (error) { Utils.showToast('Failed to save', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteInputTable(tableId) {
        if (!confirm('Delete this input table?')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deleteInputTable(tableId); await this.loadAdminData(); this.renderInputTables(); Utils.showToast('Deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // NEW: Test checker
    async testChecker() {
        const testValue = document.getElementById('checker-test-value').value.trim();
        if (!testValue) { Utils.showToast('Enter a test value', 'warning'); return; }
        
        const resultDiv = document.getElementById('checker-test-result');
        resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
        resultDiv.classList.remove('hidden');
        resultDiv.className = 'checker-test-result checking';
        
        try {
            let headers = {};
            try {
                const h = document.getElementById('checker-headers').value.trim();
                if (h) headers = JSON.parse(h);
            } catch (e) {}
            
            const config = {
                apiUrl: document.getElementById('checker-api-url').value.trim(),
                method: document.getElementById('checker-method').value,
                headers: headers,
                bodyTemplate: document.getElementById('checker-body-template').value.trim(),
                responseNamePath: document.getElementById('checker-name-path').value.trim(),
                responseValidPath: document.getElementById('checker-valid-path').value.trim(),
                errorMessage: document.getElementById('checker-error-msg').value.trim()
            };
            
            const result = await GameIdChecker.check(config, testValue);
            
            if (result && result.valid) {
                resultDiv.innerHTML = `<i class="fas fa-check-circle"></i> Valid! Name: ${result.playerName || 'N/A'}<br><small>Raw: ${JSON.stringify(result.raw).substring(0, 200)}</small>`;
                resultDiv.className = 'checker-test-result valid';
            } else {
                resultDiv.innerHTML = `<i class="fas fa-times-circle"></i> Invalid or failed<br><small>${result?.error || JSON.stringify(result?.raw || {}).substring(0, 200)}</small>`;
                resultDiv.className = 'checker-test-result invalid';
            }
        } catch (error) {
            resultDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${error.message}`;
            resultDiv.className = 'checker-test-result error';
        }
    },
    
    // ===== PAYMENTS (unchanged) =====
    renderPayments() {
        const container = document.getElementById('admin-payments-list');
        if (!container) return;
        if (this.state.payments.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payment methods yet</p></div>'; return; }
        container.innerHTML = this.state.payments.map(p => `<div class="payment-card"><div class="payment-icon"><img src="${p.icon}" alt="${p.name}"></div><div class="payment-info"><h4>${p.name}</h4><p class="address">${p.address}</p><p class="account">${p.accountName}</p>${p.note ? `<p class="note">${p.note}</p>` : ''}</div><div class="payment-actions"><button class="action-btn edit" onclick="AdminApp.editPayment('${p.id}')"><i class="fas fa-edit"></i></button><button class="action-btn delete" onclick="AdminApp.deletePayment('${p.id}')"><i class="fas fa-trash"></i></button></div></div>`).join('');
    },
    
    showAddPayment() {
        this.state.editingItem = null;
        ['payment-name', 'payment-address', 'payment-account-name', 'payment-note'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('payment-icon').value = '';
        document.getElementById('payment-icon-preview').innerHTML = '';
        document.getElementById('payment-icon-preview').classList.add('hidden');
        document.getElementById('add-payment-modal').classList.remove('hidden');
    },
    
    editPayment(paymentId) {
        const p = this.state.payments.find(pm => pm.id === paymentId);
        if (!p) return;
        this.state.editingItem = p;
        document.getElementById('payment-name').value = p.name;
        document.getElementById('payment-address').value = p.address;
        document.getElementById('payment-account-name').value = p.accountName;
        document.getElementById('payment-note').value = p.note || '';
        if (p.icon) { document.getElementById('payment-icon-preview').innerHTML = `<img src="${p.icon}" alt="Icon">`; document.getElementById('payment-icon-preview').classList.remove('hidden'); }
        document.getElementById('add-payment-modal').classList.remove('hidden');
    },
    
    closeAddPayment() { document.getElementById('add-payment-modal').classList.add('hidden'); this.state.editingItem = null; },
    
    async savePayment() {
        const name = document.getElementById('payment-name').value.trim();
        const address = document.getElementById('payment-address').value.trim();
        const accountName = document.getElementById('payment-account-name').value.trim();
        const note = document.getElementById('payment-note').value.trim();
        const iconInput = document.getElementById('payment-icon');
        if (!name || !address || !accountName) { Utils.showToast('Please fill required fields', 'warning'); return; }
        Utils.showLoading('Saving...');
        try {
            let icon = this.state.editingItem?.icon || '';
            if (iconInput.files[0]) icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            if (!icon && !this.state.editingItem) { Utils.showToast('Please upload icon', 'warning'); Utils.hideLoading(); return; }
            const data = { name, address, accountName, note, icon };
            if (this.state.editingItem) { await Database.updatePaymentMethod(this.state.editingItem.id, data); Utils.showToast('Updated!', 'success'); }
            else { await Database.createPaymentMethod(data); Utils.showToast('Created!', 'success'); }
            await this.loadAdminData(); this.renderPayments(); this.closeAddPayment();
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deletePayment(paymentId) {
        if (!confirm('Delete this payment method?')) return;
        Utils.showLoading('Deleting...');
        try { await Database.deletePaymentMethod(paymentId); await this.loadAdminData(); this.renderPayments(); Utils.showToast('Deleted!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== ANNOUNCEMENTS (unchanged) =====
    renderAnnouncements() {
        const textArea = document.getElementById('announcement-text');
        const currentText = document.getElementById('current-announcement-text');
        if (textArea) textArea.value = '';
        if (currentText) currentText.textContent = this.state.settings.announcement || 'No announcement set';
    },
    
    async saveAnnouncement() {
        const text = document.getElementById('announcement-text').value.trim();
        if (!text) { Utils.showToast('Please enter text', 'warning'); return; }
        Utils.showLoading('Saving...');
        try {
            await Database.updateSettings({ ...this.state.settings, announcement: text });
            this.state.settings.announcement = text;
            document.getElementById('current-announcement-text').textContent = text;
            document.getElementById('announcement-text').value = '';
            Utils.showToast('Announcement saved!', 'success');
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== BROADCAST (unchanged) =====
    async sendBroadcast() {
        const message = document.getElementById('broadcast-message').value.trim();
        if (!message) { Utils.showToast('Please enter message', 'warning'); return; }
        if (!confirm(`Send to all ${this.state.users.length} users?`)) return;
        Utils.showLoading('Broadcasting...');
        try {
            let photo = null;
            const imageInput = document.getElementById('broadcast-image');
            if (imageInput.files[0]) photo = await Utils.compressImage(imageInput.files[0], 800, 0.8);
            const userIds = this.state.users.map(u => u.telegramId);
            const results = await TelegramBot.broadcast(userIds, message, photo);
            Utils.showToast(`Sent: ${results.success} success, ${results.failed} failed`, 'success');
            document.getElementById('broadcast-message').value = '';
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== BANNED USERS (unchanged) =====
    renderBannedUsers() {
        const container = document.getElementById('admin-banned-list');
        if (!container) return;
        if (this.state.bannedUsers.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><p>No banned users</p></div>'; return; }
        container.innerHTML = this.state.bannedUsers.map(user => `<div class="banned-card"><div class="banned-icon"><i class="fas fa-user-slash"></i></div><div class="banned-info"><h4>${user.firstName || 'User'}</h4><p>@${user.username || 'N/A'} • ${user.telegramId}</p><p class="reason"><strong>Reason:</strong> ${user.reason}</p><p class="date">Banned: ${Utils.formatDate(user.bannedAt, 'long')}</p></div><button class="btn btn-success btn-sm" onclick="AdminApp.unbanUser('${user.telegramId}')"><i class="fas fa-check"></i> Unban</button></div>`).join('');
    },
    
    async unbanUser(telegramId) {
        if (!confirm('Unban this user?')) return;
        Utils.showLoading('Unbanning...');
        try { await Database.unbanUser(telegramId); await TelegramBot.notifyUnban(telegramId); await this.loadAdminData(); this.renderBannedUsers(); Utils.showToast('User unbanned!', 'success'); }
        catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== CUSTOM EMOJIS (unchanged) =====
    renderCustomEmojis() {
        const container = document.getElementById('admin-emojis-list');
        if (!container) return;
        const emojis = this.state.settings?.customEmojis || [];
        this.state.customEmojis = emojis;
        if (emojis.length === 0) { container.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-smile-wink"></i><p>No custom emojis yet</p></div>'; return; }
        container.innerHTML = emojis.map(e => `<div class="emoji-card"><button class="delete-btn" onclick="AdminApp.deleteCustomEmoji('${e.id}')"><i class="fas fa-trash"></i></button><div class="trigger-emoji">${e.trigger}</div><div class="emoji-arrow"><i class="fas fa-arrow-down"></i></div><img class="emoji-preview" src="${e.imageUrl}" alt="${e.name}"><div class="emoji-name">${e.name || 'Unnamed'}</div></div>`).join('');
    },
    
    showAddEmoji() {
        document.getElementById('emoji-name').value = '';
        document.getElementById('emoji-trigger').value = '';
        document.getElementById('emoji-file').value = '';
        document.getElementById('emoji-file-preview').innerHTML = '';
        document.getElementById('emoji-file-preview').classList.add('hidden');
        document.getElementById('add-emoji-modal').classList.remove('hidden');
        this.loadEmojiPicker();
    },
    closeAddEmoji() { document.getElementById('add-emoji-modal').classList.add('hidden'); },
    
    loadEmojiPicker() {
        const emojis = ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','😐','😑','😶','😏','😒','🙄','😬','😮','🤯','😳','🥵','🥶','😱','😨','😰','😥','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👻','👽','👾','🤖','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','💕','💞','💓','💗','💖','💘','⭐','🌟','✨','💫','🔥','💥','💢','💦','💨','💣','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','🎮','🕹️','🎰','🎲','🧩','🎯','🎱','🔮','🧿','🎪','💎','💰','💵','💴','💶','💷','💸','💳','🏆','🥇','🎁','🎀','🎈','🎉','🎊','🎄','🎃','⚡','☀️','🌙'];
        document.getElementById('emoji-picker-grid').innerHTML = emojis.map(e => `<div class="emoji-item" onclick="AdminApp.selectTriggerEmoji('${e}')">${e}</div>`).join('');
    },
    selectTriggerEmoji(emoji) { document.getElementById('emoji-trigger').value = emoji; this.closeEmojiPicker(); },
    showEmojiPicker() { this.loadEmojiPicker(); document.getElementById('emoji-picker-modal').classList.remove('hidden'); },
    closeEmojiPicker() { document.getElementById('emoji-picker-modal').classList.add('hidden'); },
    
    async saveCustomEmoji() {
        const name = document.getElementById('emoji-name').value.trim();
        const trigger = document.getElementById('emoji-trigger').value;
        const fileInput = document.getElementById('emoji-file');
        if (!trigger) { Utils.showToast('Select a trigger emoji', 'warning'); return; }
        if (!fileInput.files[0]) { Utils.showToast('Upload an image', 'warning'); return; }
        const existing = (this.state.settings?.customEmojis || []).find(e => e.trigger === trigger);
        if (existing) { Utils.showToast('Trigger already used', 'warning'); return; }
        Utils.showLoading('Uploading...');
        try {
            const formData = new FormData();
            formData.append('image', fileInput.files[0]);
            const response = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!result.success) throw new Error(result.error?.message || 'Upload failed');
            const settings = this.state.settings || {};
            if (!settings.customEmojis) settings.customEmojis = [];
            settings.customEmojis.push({ id: 'emoji_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9), trigger, imageUrl: result.data.url, name, type: 'image', createdAt: new Date().toISOString() });
            await Database.updateSettings(settings);
            this.state.settings = settings;
            this.closeAddEmoji(); this.renderCustomEmojis();
            Utils.showToast('Custom emoji created!', 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    async deleteCustomEmoji(emojiId) {
        if (!confirm('Delete this custom emoji?')) return;
        Utils.showLoading('Deleting...');
        try {
            const settings = this.state.settings;
            settings.customEmojis = (settings.customEmojis || []).filter(e => e.id !== emojiId);
            await Database.updateSettings(settings);
            this.state.settings = settings;
            this.renderCustomEmojis();
            Utils.showToast('Emoji deleted!', 'success');
        } catch (error) { Utils.showToast('Failed', 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== SETTINGS (unchanged) =====
    renderSettings() {
        const nameInput = document.getElementById('website-name');
        const currentLogo = document.getElementById('current-logo');
        if (nameInput) nameInput.value = this.state.settings.websiteName || '';
        if (this.state.settings.websiteLogo && currentLogo) { currentLogo.src = this.state.settings.websiteLogo; document.getElementById('logo-preview')?.classList.remove('hidden'); }
    },
    
    async saveSettings() {
        const websiteName = document.getElementById('website-name').value.trim();
        const logoInput = document.getElementById('website-logo');
        Utils.showLoading('Saving...');
        try {
            const updates = { ...this.state.settings };
            if (websiteName) updates.websiteName = websiteName;
            if (logoInput.files[0]) {
                const formData = new FormData();
                formData.append('image', logoInput.files[0]);
                const response = await fetch(`https://api.imgbb.com/1/upload?key=d3b0e9fd43ff0eb762987129a2f21e9c`, { method: 'POST', body: formData });
                const result = await response.json();
                if (!result.success) throw new Error('Logo upload failed');
                updates.websiteLogo = result.data.url;
            }
            await Database.updateSettings(updates);
            this.state.settings = updates;
            Utils.showToast('Settings saved!', 'success');
        } catch (error) { Utils.showToast('Failed: ' + error.message, 'error'); }
        finally { Utils.hideLoading(); }
    },
    
    // ===== DATABASE IDS (unchanged) =====
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

function previewEmojiFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { Utils.showToast('Only PNG, JPG, WEBP, GIF allowed', 'warning'); event.target.value = ''; return; }
    const preview = document.getElementById('emoji-file-preview');
    const reader = new FileReader();
    reader.onload = (e) => { preview.innerHTML = `<img src="${e.target.result}" alt="Preview"><button class="remove-file" onclick="removeEmojiFile()">Remove</button>`; preview.classList.remove('hidden'); };
    reader.readAsDataURL(file);
}

function removeEmojiFile() { document.getElementById('emoji-file').value = ''; document.getElementById('emoji-file-preview').innerHTML = ''; document.getElementById('emoji-file-preview').classList.add('hidden'); }
function closeUserDetails() { AdminApp.closeUserDetails(); }
function copyId(elementId) { Utils.copyToClipboard(document.getElementById(elementId).textContent); }

// NEW: Toggle checker config visibility
function toggleCheckerConfig() {
    const enabled = document.getElementById('checker-enabled').checked;
    document.getElementById('checker-config-section').classList.toggle('hidden', !enabled);
}

// Upload triggers
function triggerCategoryIconUpload() { document.getElementById('category-icon').click(); }
function triggerProductIconUpload() { document.getElementById('product-icon').click(); }
function triggerBannerUpload() { document.getElementById('banner-image').click(); }
function triggerPaymentIconUpload() { document.getElementById('payment-icon').click(); }
function triggerLogoUpload() { document.getElementById('website-logo').click(); }
function triggerBroadcastImageUpload() { document.getElementById('broadcast-image').click(); }

// G2Bulk API reference (shared between admin and app)
const G2BulkAPI = window.G2BulkAPI || {
    get URL() { return CONFIG.G2BULK.API_URL; },
    get KEY() { return CONFIG.G2BULK.API_KEY; },
    async request(action, params = {}) {
        const response = await fetch(this.URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: this.KEY, action, ...params }) });
        return await response.json();
    },
    async getServices() { return await this.request('services'); },
    async getBalance() { return await this.request('balance'); },
    async placeOrder(serviceId, link, quantity = 1) { return await this.request('add', { service: serviceId, link, quantity }); },
    async checkStatus(orderId) { return await this.request('status', { order: orderId }); },
    isBalanceError(error) {
        if (!error) return false;
        const s = String(error).toLowerCase();
        return ['insufficient', 'balance', 'not enough', 'funds', 'low balance'].some(k => s.includes(k));
    }
};
window.G2BulkAPI = G2BulkAPI;

// GameIdChecker for admin panel
const GameIdChecker = window.GameIdChecker || {
    async check(config, value) {
        if (!config || !config.apiUrl) return null;
        try {
            let url = config.apiUrl;
            let options = { method: config.method || 'POST', headers: config.headers || { 'Content-Type': 'application/json' } };
            if (options.method === 'POST' && config.bodyTemplate) options.body = config.bodyTemplate.replace(/\{\{value\}\}/g, value);
            else if (options.method === 'GET') url = url.replace(/\{\{value\}\}/g, encodeURIComponent(value));
            const response = await fetch(url, options);
            const data = await response.json();
            const playerName = this.getNestedValue(data, config.responseNamePath);
            const isValid = config.responseValidPath ? this.getNestedValue(data, config.responseValidPath) : !!playerName;
            return { valid: isValid, playerName: playerName || null, raw: data };
        } catch (error) { return { valid: false, playerName: null, error: error.message }; }
    },
    getNestedValue(obj, path) { if (!path) return null; return path.split('.').reduce((c, k) => c?.[k], obj); }
};
window.GameIdChecker = GameIdChecker;

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
            if (e.target.files[0]) {
                const previewEl = document.getElementById(preview);
                const img = await Utils.compressImage(e.target.files[0], 400, 0.8);
                previewEl.innerHTML = `<img src="${img}" alt="Preview">`;
                previewEl.classList.remove('hidden');
            }
        });
    });
    document.getElementById('website-logo')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const img = await Utils.compressImage(e.target.files[0], 200, 0.9);
            document.getElementById('current-logo').src = img;
            document.getElementById('logo-preview').classList.remove('hidden');
        }
    });
    AdminApp.init();
});
