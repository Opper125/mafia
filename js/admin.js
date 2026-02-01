// ===== Admin Panel Application =====

const AdminApp = {
    // Admin state
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
        settings: {},
        stats: {},
        editingItem: null,
        currentBannerType: 'type1',
        ordersFilter: 'all',
        topupsFilter: 'all'
    },
    
    // Initialize admin panel
    async init() {
        console.log('🚀 Initializing Admin Panel...');
        
        try {
            // Check if running in Telegram
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied('This panel can only be accessed through Telegram');
                return;
            }
            
            // Initialize Telegram WebApp
            await TelegramApp.init();
            console.log('✅ Telegram WebApp initialized');
            
            // Check if user is admin
            if (!TelegramApp.isAdmin()) {
                this.showAccessDenied('You don\'t have permission to access this panel');
                return;
            }
            
            console.log('✅ Admin verified');
            
            // Show loading
            Utils.showLoading('Loading admin panel...');
            
            // Load admin data
            await this.loadAdminData();
            console.log('✅ Admin data loaded');
            
            // Show dashboard
            this.showDashboard();
            
            // Signal ready
            TelegramApp.ready();
            
            Utils.hideLoading();
            console.log('✅ Admin Panel ready!');
            
        } catch (error) {
            console.error('❌ Admin init error:', error);
            Utils.hideLoading();
            Utils.showToast('Failed to initialize: ' + error.message, 'error');
        }
    },
    
    // Show access denied
    showAccessDenied(message) {
        document.getElementById('admin-dashboard').classList.add('hidden');
        const denied = document.getElementById('access-denied');
        denied.querySelector('p').textContent = message;
        denied.classList.remove('hidden');
    },
    
    // Show dashboard
    showDashboard() {
        document.getElementById('access-denied').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        // Set initial page
        this.showAdminPage('dashboard');
        
        // Start realtime updates
        this.startRealtimeUpdates();
        
        // Update time
        this.updateTime();
    },
    
    // Load admin data
    async loadAdminData() {
        try {
            console.log('📥 Loading data from database...');
            
            // Load all data in parallel
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
            
            // Process results
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
            this.state.stats = results[10].status === 'fulfilled' ? results[10].value : {};
            
            // Update sidebar counts
            this.updateSidebarCounts();
            
            console.log('📊 Data loaded:', {
                users: this.state.users.length,
                orders: this.state.orders.length,
                categories: this.state.categories.length,
                products: this.state.products.length
            });
            
        } catch (error) {
            console.error('❌ Load admin data error:', error);
            throw error;
        }
    },
    
    // Update sidebar counts
    updateSidebarCounts() {
        const usersCount = document.getElementById('users-count');
        const pendingOrders = document.getElementById('pending-orders');
        const pendingTopups = document.getElementById('pending-topups');
        
        if (usersCount) usersCount.textContent = this.state.users.length;
        if (pendingOrders) pendingOrders.textContent = this.state.orders.filter(o => o.status === 'pending').length;
        if (pendingTopups) pendingTopups.textContent = this.state.topups.filter(t => t.status === 'pending').length;
    },
    
    // Update time display
    updateTime() {
        const updateTimeDisplay = () => {
            const timeEl = document.getElementById('admin-time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        };
        
        updateTimeDisplay();
        setInterval(updateTimeDisplay, 1000);
    },
    
    // Start realtime updates
    startRealtimeUpdates() {
        // Update every 30 seconds
        setInterval(async () => {
            try {
                await this.loadAdminData();
                this.renderCurrentPage();
            } catch (error) {
                console.error('Realtime update error:', error);
            }
        }, 30000);
    },
    
    // Show admin page
    showAdminPage(page) {
        this.state.currentPage = page;
        
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.nav-link[onclick="showAdminPage('${page}')"]`);
        if (activeLink) activeLink.classList.add('active');
        
        // Hide all pages
        document.querySelectorAll('.admin-page').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show target page
        const targetPage = document.getElementById(`admin-page-${page}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.renderCurrentPage();
        }
    },
    
    // Render current page
    renderCurrentPage() {
        switch (this.state.currentPage) {
            case 'dashboard': this.renderDashboard(); break;
            case 'users': this.renderUsers(); break;
            case 'orders': this.renderOrders(); break;
            case 'topups': this.renderTopups(); break;
            case 'categories': this.renderCategories(); break;
            case 'products': this.renderProducts(); break;
            case 'banners': this.renderBanners(); break;
            case 'input-tables': this.renderInputTables(); break;
            case 'payments': this.renderPayments(); break;
            case 'announcements': this.renderAnnouncements(); break;
            case 'banned': this.renderBannedUsers(); break;
            case 'settings': this.renderSettings(); break;
            case 'database': this.renderDatabaseIds(); break;
        }
    },
    
    // ========== DASHBOARD ==========
    renderDashboard() {
        // Stats
        document.getElementById('stat-users').textContent = this.state.stats.totalUsers || this.state.users.length || 0;
        document.getElementById('stat-orders').textContent = this.state.stats.totalOrders || this.state.orders.length || 0;
        document.getElementById('stat-revenue').textContent = this.state.stats.totalRevenue || 0;
        document.getElementById('stat-pending').textContent = this.state.stats.pendingOrders || this.state.orders.filter(o => o.status === 'pending').length || 0;
        
        // Recent orders
        this.renderRecentOrders();
        
        // Recent topups
        this.renderRecentTopups();
    },
    
    renderRecentOrders() {
        const container = document.getElementById('recent-orders');
        if (!container) return;
        
        const recentOrders = [...this.state.orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<p class="empty-text">No orders yet</p>';
            return;
        }
        
        container.innerHTML = recentOrders.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `
                <div class="recent-item">
                    <img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User">
                    <div class="recent-item-info">
                        <h4>${user?.firstName || 'User'}</h4>
                        <p>${order.productName}</p>
                    </div>
                    <span class="recent-item-amount">${Utils.formatCurrency(order.amount, order.currency)}</span>
                </div>
            `;
        }).join('');
    },
    
    renderRecentTopups() {
        const container = document.getElementById('recent-topups');
        if (!container) return;
        
        const recentTopups = [...this.state.topups]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (recentTopups.length === 0) {
            container.innerHTML = '<p class="empty-text">No top-ups yet</p>';
            return;
        }
        
        container.innerHTML = recentTopups.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `
                <div class="recent-item">
                    <img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User">
                    <div class="recent-item-info">
                        <h4>${user?.firstName || 'User'}</h4>
                        <p>${topup.paymentMethod}</p>
                    </div>
                    <span class="recent-item-amount positive">+${Utils.formatCurrency(topup.amount, 'MMK')}</span>
                </div>
            `;
        }).join('');
    },
    
    getAvatar(id) {
        return `https://ui-avatars.com/api/?name=${id}&background=8b5cf6&color=fff&size=100`;
    },
    
    // ========== USERS ==========
    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        
        if (this.state.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No users yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.state.users.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}">
                        <div class="user-cell-info">
                            <h4>${user.firstName} ${user.lastName || ''}</h4>
                            <p>@${user.username || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td><code>${user.telegramId}</code></td>
                <td><strong>${Utils.formatCurrency(user.balance, 'MMK')}</strong></td>
                <td>${user.totalOrders || 0} orders</td>
                <td>${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Premium</span>' : '<span class="badge standard">Standard</span>'}</td>
                <td>${Utils.timeAgo(user.joinedAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="AdminApp.viewUserDetails('${user.telegramId}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="AdminApp.editUserBalance('${user.telegramId}')" title="Edit Balance">
                            <i class="fas fa-wallet"></i>
                        </button>
                        <button class="action-btn delete" onclick="AdminApp.banUserPrompt('${user.telegramId}')" title="Ban">
                            <i class="fas fa-ban"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },
    
    async viewUserDetails(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        
        const userOrders = this.state.orders.filter(o => o.telegramId === telegramId);
        
        const modal = document.getElementById('user-details-modal');
        const content = document.getElementById('user-details-content');
        
        content.innerHTML = `
            <div class="user-details-header">
                <img src="${user.photoUrl || this.getAvatar(user.firstName)}" alt="${user.firstName}">
                <div class="user-details-info">
                    <h3>${user.firstName} ${user.lastName || ''}</h3>
                    <p>@${user.username || 'N/A'} • ID: ${user.telegramId}</p>
                    ${user.isPremium ? '<span class="badge premium"><i class="fas fa-star"></i> Telegram Premium</span>' : ''}
                </div>
            </div>
            
            <div class="user-stats-row">
                <div class="user-stat-box">
                    <span class="stat-value">${Utils.formatCurrency(user.balance, '')}</span>
                    <span class="stat-label">Balance</span>
                </div>
                <div class="user-stat-box">
                    <span class="stat-value">${user.totalOrders || 0}</span>
                    <span class="stat-label">Orders</span>
                </div>
                <div class="user-stat-box">
                    <span class="stat-value">${Utils.formatCurrency(user.totalSpent || 0, '')}</span>
                    <span class="stat-label">Spent</span>
                </div>
            </div>
            
            <div class="user-info-grid">
                <div class="info-item"><span>Joined:</span> <strong>${Utils.formatDate(user.joinedAt, 'long')}</strong></div>
                <div class="info-item"><span>Last Active:</span> <strong>${Utils.formatDate(user.lastActive, 'long')}</strong></div>
                <div class="info-item"><span>Approved Orders:</span> <strong>${user.approvedOrders || 0}</strong></div>
                <div class="info-item"><span>Rejected Orders:</span> <strong>${user.rejectedOrders || 0}</strong></div>
            </div>
            
            <div class="user-actions-row">
                <button class="btn btn-primary" onclick="AdminApp.editUserBalance('${user.telegramId}')">
                    <i class="fas fa-wallet"></i> Edit Balance
                </button>
                <button class="btn btn-danger" onclick="AdminApp.banUserPrompt('${user.telegramId}')">
                    <i class="fas fa-ban"></i> Ban User
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
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
            } catch (error) {
                console.error('Update balance error:', error);
                Utils.showToast('Failed to update balance', 'error');
            } finally {
                Utils.hideLoading();
            }
        }
    },
    
    async banUserPrompt(telegramId) {
        if (confirm('Are you sure you want to ban this user?')) {
            const reason = prompt('Enter ban reason:') || 'Violated terms of service';
            await this.banUser(telegramId, reason);
        }
    },
    
    async banUser(telegramId, reason) {
        Utils.showLoading('Banning user...');
        try {
            const user = this.state.users.find(u => u.telegramId === telegramId);
            await Database.banUser(user, reason);
            await TelegramBot.notifyBan(telegramId, reason);
            await this.loadAdminData();
            this.renderUsers();
            this.closeUserDetails();
            Utils.showToast('User banned', 'success');
        } catch (error) {
            console.error('Ban user error:', error);
            Utils.showToast('Failed to ban user', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    closeUserDetails() {
        document.getElementById('user-details-modal').classList.add('hidden');
    },
    
    // ========== ORDERS ==========
    renderOrders() {
        const container = document.getElementById('admin-orders-list');
        if (!container) return;
        
        let filteredOrders = [...this.state.orders];
        if (this.state.ordersFilter !== 'all') {
            filteredOrders = filteredOrders.filter(o => o.status === this.state.ordersFilter);
        }
        
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (filteredOrders.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders found</p></div>';
            return;
        }
        
        container.innerHTML = filteredOrders.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-user">
                            <img src="${user?.photoUrl || this.getAvatar(order.telegramId)}" alt="User">
                            <div>
                                <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                                <p>@${user?.username || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    
                    <div class="order-body">
                        <div class="order-info-row">
                            <span>Order ID:</span>
                            <strong>${order.orderId}</strong>
                        </div>
                        <div class="order-info-row">
                            <span>Product:</span>
                            <strong>${order.productName}</strong>
                        </div>
                        <div class="order-info-row">
                            <span>Amount:</span>
                            <strong class="amount">${Utils.formatCurrency(order.amount, order.currency)}</strong>
                        </div>
                        <div class="order-info-row">
                            <span>Category:</span>
                            <strong>${order.categoryName || 'N/A'}</strong>
                        </div>
                        ${order.inputValues ? `
                            <div class="order-inputs">
                                <span>Input Values:</span>
                                <ul>
                                    ${Object.entries(order.inputValues).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        <div class="order-date">
                            <i class="fas fa-clock"></i> ${Utils.formatDate(order.createdAt, 'long')}
                        </div>
                    </div>
                    
                    ${order.status === 'pending' ? `
                        <div class="order-actions">
                            <button class="btn btn-success" onclick="AdminApp.approveOrder('${order.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger" onclick="AdminApp.rejectOrder('${order.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    filterOrders(filter) {
        this.state.ordersFilter = filter;
        
        document.querySelectorAll('#admin-page-orders .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
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
        } catch (error) {
            console.error('Approve order error:', error);
            Utils.showToast('Failed to approve', 'error');
        } finally {
            Utils.hideLoading();
        }
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
        } catch (error) {
            console.error('Reject order error:', error);
            Utils.showToast('Failed to reject', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== TOPUPS ==========
    renderTopups() {
        const container = document.getElementById('admin-topups-list');
        if (!container) return;
        
        let filteredTopups = [...this.state.topups];
        if (this.state.topupsFilter !== 'all') {
            filteredTopups = filteredTopups.filter(t => t.status === this.state.topupsFilter);
        }
        
        filteredTopups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (filteredTopups.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-wallet"></i><p>No top-up requests found</p></div>';
            return;
        }
        
        container.innerHTML = filteredTopups.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `
                <div class="topup-card">
                    <div class="topup-header">
                        <div class="topup-user">
                            <img src="${user?.photoUrl || this.getAvatar(topup.telegramId)}" alt="User">
                            <div>
                                <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                                <p>@${user?.username || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="status-badge ${topup.status}">${topup.status}</span>
                    </div>
                    
                    <div class="topup-body">
                        <div class="topup-amount">
                            <span>Amount</span>
                            <strong>${Utils.formatCurrency(topup.amount, 'MMK')}</strong>
                        </div>
                        <div class="topup-method">
                            <span>Payment Method</span>
                            <strong>${topup.paymentMethod}</strong>
                        </div>
                        <div class="topup-date">
                            <i class="fas fa-clock"></i> ${Utils.formatDate(topup.createdAt, 'long')}
                        </div>
                        ${topup.proofImage ? `
                            <div class="topup-proof">
                                <img src="${topup.proofImage}" alt="Payment Proof" onclick="window.open('${topup.proofImage}', '_blank')">
                            </div>
                        ` : ''}
                    </div>
                    
                    ${topup.status === 'pending' ? `
                        <div class="topup-actions">
                            <button class="btn btn-success" onclick="AdminApp.approveTopup('${topup.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn btn-danger" onclick="AdminApp.rejectTopup('${topup.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    filterTopups(filter) {
        this.state.topupsFilter = filter;
        
        document.querySelectorAll('#admin-page-topups .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderTopups();
    },
    
    async approveTopup(topupId) {
        if (!confirm('Approve this top-up?')) return;
        
        Utils.showLoading('Approving...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'approved', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'approved');
            await this.loadAdminData();
            this.renderTopups();
            Utils.showToast('Top-up approved!', 'success');
        } catch (error) {
            console.error('Approve topup error:', error);
            Utils.showToast('Failed to approve', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async rejectTopup(topupId) {
        if (!confirm('Reject this top-up?')) return;
        
        Utils.showLoading('Rejecting...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'rejected');
            await this.loadAdminData();
            this.renderTopups();
            Utils.showToast('Top-up rejected', 'success');
        } catch (error) {
            console.error('Reject topup error:', error);
            Utils.showToast('Failed to reject', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== CATEGORIES ==========
    renderCategories() {
        const container = document.getElementById('admin-categories-list');
        if (!container) return;
        
        if (this.state.categories.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-th-large"></i><p>No categories yet</p></div>';
            return;
        }
        
        container.innerHTML = this.state.categories.map(category => `
            <div class="category-card">
                <div class="category-icon">
                    <img src="${category.icon}" alt="${category.name}">
                    ${category.flag ? `<span class="category-flag">${category.flag}</span>` : ''}
                </div>
                <div class="category-info">
                    <h4>${category.name}</h4>
                    <p>${category.totalSold || 0} sold</p>
                    ${category.hasDiscount ? '<span class="discount-badge">Has Discount</span>' : ''}
                </div>
                <div class="category-actions">
                    <button class="action-btn edit" onclick="AdminApp.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="AdminApp.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
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
        const category = this.state.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        this.state.editingItem = category;
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-flag').value = category.flag || '';
        document.getElementById('has-discount').checked = category.hasDiscount;
        
        if (category.icon) {
            document.getElementById('category-icon-preview').innerHTML = `<img src="${category.icon}" alt="Icon">`;
            document.getElementById('category-icon-preview').classList.remove('hidden');
        }
        
        document.getElementById('add-category-modal').classList.remove('hidden');
    },
    
    closeAddCategory() {
        document.getElementById('add-category-modal').classList.add('hidden');
        this.state.editingItem = null;
    },
    
    async saveCategory() {
        const name = document.getElementById('category-name').value.trim();
        const flag = document.getElementById('category-flag').value;
        const hasDiscount = document.getElementById('has-discount').checked;
        const iconInput = document.getElementById('category-icon');
        
        if (!name) {
            Utils.showToast('Please enter category name', 'warning');
            return;
        }
        
        Utils.showLoading('Saving...');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const data = { name, flag, hasDiscount, icon };
            
            if (this.state.editingItem) {
                await Database.updateCategory(this.state.editingItem.id, data);
                Utils.showToast('Category updated!', 'success');
            } else {
                await Database.createCategory(data);
                Utils.showToast('Category created!', 'success');
            }
            
            await this.loadAdminData();
            this.renderCategories();
            this.closeAddCategory();
            
        } catch (error) {
            console.error('Save category error:', error);
            Utils.showToast('Failed to save', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async deleteCategory(categoryId) {
        if (!confirm('Delete this category? All products will also be deleted.')) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteCategory(categoryId);
            await this.loadAdminData();
            this.renderCategories();
            Utils.showToast('Category deleted!', 'success');
        } catch (error) {
            console.error('Delete category error:', error);
            Utils.showToast('Failed to delete', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== PRODUCTS ==========
    renderProducts() {
        const container = document.getElementById('admin-products-list');
        const filterSelect = document.getElementById('filter-category');
        
        if (!container) return;
        
        // Update category filter
        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="all">All Categories</option>' +
                this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            filterSelect.value = currentValue || 'all';
        }
        
        let filteredProducts = [...this.state.products];
        if (filterSelect && filterSelect.value !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.categoryId === filterSelect.value);
        }
        
        if (filteredProducts.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-box"></i><p>No products yet</p></div>';
            return;
        }
        
        container.innerHTML = filteredProducts.map(product => {
            const category = this.state.categories.find(c => c.id === product.categoryId);
            return `
                <div class="product-card">
                    <div class="product-icon">
                        <img src="${product.icon}" alt="${product.name}">
                        ${product.discount > 0 ? `<span class="discount-tag">-${product.discount}%</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p>${category?.name || 'Unknown'}</p>
                        <div class="product-price">
                            ${product.discount > 0 ? `<span class="original">${Utils.formatCurrency(product.price, product.currency)}</span>` : ''}
                            <span class="current">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</span>
                        </div>
                        <p class="product-delivery"><i class="fas fa-bolt"></i> ${product.deliveryTime === 'instant' ? 'Instant' : product.deliveryTime}</p>
                    </div>
                    <div class="product-actions">
                        <button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    showAddProduct() {
        this.state.editingItem = null;
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-currency').value = 'MMK';
        document.getElementById('product-discount').value = '';
        document.getElementById('product-delivery').value = 'instant';
        document.getElementById('product-icon').value = '';
        document.getElementById('product-icon-preview').innerHTML = '';
        document.getElementById('product-icon-preview').classList.add('hidden');
        document.getElementById('add-product-modal').classList.remove('hidden');
    },
    
    editProduct(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;
        
        this.state.editingItem = product;
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}" ${c.id === product.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-currency').value = product.currency;
        document.getElementById('product-discount').value = product.discount || '';
        document.getElementById('product-delivery').value = product.deliveryTime;
        
        if (product.icon) {
            document.getElementById('product-icon-preview').innerHTML = `<img src="${product.icon}" alt="Icon">`;
            document.getElementById('product-icon-preview').classList.remove('hidden');
        }
        
        document.getElementById('add-product-modal').classList.remove('hidden');
    },
    
    closeAddProduct() {
        document.getElementById('add-product-modal').classList.add('hidden');
        this.state.editingItem = null;
    },
    
    async saveProduct() {
        const categoryId = document.getElementById('product-category').value;
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const currency = document.getElementById('product-currency').value;
        const discount = parseInt(document.getElementById('product-discount').value) || 0;
        const deliveryTime = document.getElementById('product-delivery').value;
        const iconInput = document.getElementById('product-icon');
        
        if (!categoryId || !name || isNaN(price)) {
            Utils.showToast('Please fill all required fields', 'warning');
            return;
        }
        
        Utils.showLoading('Saving...');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const data = { categoryId, name, price, currency, discount, deliveryTime, icon };
            
            if (this.state.editingItem) {
                await Database.updateProduct(this.state.editingItem.id, data);
                Utils.showToast('Product updated!', 'success');
            } else {
                await Database.createProduct(data);
                Utils.showToast('Product created!', 'success');
            }
            
            await this.loadAdminData();
            this.renderProducts();
            this.closeAddProduct();
            
        } catch (error) {
            console.error('Save product error:', error);
            Utils.showToast('Failed to save', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async deleteProduct(productId) {
        if (!confirm('Delete this product?')) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteProduct(productId);
            await this.loadAdminData();
            this.renderProducts();
            Utils.showToast('Product deleted!', 'success');
        } catch (error) {
            console.error('Delete product error:', error);
            Utils.showToast('Failed to delete', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== BANNERS ==========
    renderBanners() {
        this.renderBannerType(this.state.currentBannerType);
    },
    
    renderBannerType(type) {
        this.state.currentBannerType = type;
        
        // Update tabs
        document.querySelectorAll('.banner-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeTab = document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`);
        if (activeTab) activeTab.classList.add('active');
        
        // Show/hide sections
        document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1');
        document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2');
        
        const banners = type === 'type1' ? (this.state.banners.type1 || []) : (this.state.banners.type2 || []);
        const container = document.getElementById(`banners-${type}-list`);
        
        if (!container) return;
        
        if (banners.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-image"></i><p>No banners yet</p></div>';
            return;
        }
        
        container.innerHTML = banners.map(banner => {
            const category = type === 'type2' ? this.state.categories.find(c => c.id === banner.categoryId) : null;
            return `
                <div class="banner-card">
                    <img src="${banner.image}" alt="Banner">
                    <div class="banner-info">
                        ${category ? `<p><strong>Category:</strong> ${category.name}</p>` : ''}
                        ${banner.description ? `<p class="description">${banner.description.substring(0, 100)}...</p>` : ''}
                        <p class="date">${Utils.formatDate(banner.createdAt)}</p>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="AdminApp.deleteBanner('${banner.id}', '${type}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
        }).join('');
    },
    
    showAddBanner(type) {
        this.state.currentBannerType = type;
        
        document.getElementById('banner-category-group').style.display = type === 'type2' ? 'block' : 'none';
        document.getElementById('banner-text-group').style.display = type === 'type2' ? 'block' : 'none';
        
        if (type === 'type2') {
            document.getElementById('banner-category').innerHTML = '<option value="">Select Category</option>' +
                this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        
        document.getElementById('banner-image').value = '';
        document.getElementById('banner-text').value = '';
        document.getElementById('banner-image-preview').innerHTML = '';
        document.getElementById('banner-image-preview').classList.add('hidden');
        document.getElementById('add-banner-modal').classList.remove('hidden');
    },
    
    closeAddBanner() {
        document.getElementById('add-banner-modal').classList.add('hidden');
    },
    
    // Save banner - compress more aggressively
async saveBanner() {
    const type = this.state.currentBannerType;
    const imageInput = document.getElementById('banner-image');
    const categoryId = document.getElementById('banner-category')?.value;
    const description = document.getElementById('banner-text')?.value;
    
    if (!imageInput.files[0]) {
        Utils.showToast('Please upload an image', 'warning');
        return;
    }
    
    if (type === 'type2' && !categoryId) {
        Utils.showToast('Please select a category', 'warning');
        return;
    }
    
    Utils.showLoading('Uploading banner...');
    TelegramApp.hapticFeedback('impact', 'medium');
    
    try {
        // Compress image more aggressively for JSONBin limits
        const image = await Utils.compressImage(imageInput.files[0], 800, 0.5);
        
        console.log('Image size:', Math.round(image.length / 1024), 'KB');
        
        const data = { image };
        if (type === 'type2') {
            data.categoryId = categoryId;
            data.description = description;
        }
        
        await Database.createBanner(data, type);
        await this.loadAdminData();
        this.renderBanners();
        this.closeAddBanner();
        Utils.showToast('Banner created!', 'success');
        
    } catch (error) {
        console.error('Save banner error:', error);
        Utils.showToast('Failed to save banner. Try a smaller image.', 'error');
    } finally {
        Utils.hideLoading();
    }
},
    
    async deleteBanner(bannerId, type) {
        if (!confirm('Delete this banner?')) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteBanner(bannerId, type);
            await this.loadAdminData();
            this.renderBanners();
            Utils.showToast('Banner deleted!', 'success');
        } catch (error) {
            console.error('Delete banner error:', error);
            Utils.showToast('Failed to delete', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== INPUT TABLES ==========
    renderInputTables() {
        const container = document.getElementById('admin-input-tables-list');
        if (!container) return;
        
        if (this.state.inputTables.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-keyboard"></i><p>No input tables yet</p></div>';
            return;
        }
        
        container.innerHTML = this.state.inputTables.map(table => {
            const category = this.state.categories.find(c => c.id === table.categoryId);
            return `
                <div class="input-table-card">
                    <div class="input-table-icon">
                        <i class="fas fa-keyboard"></i>
                    </div>
                    <div class="input-table-info">
                        <h4>${table.name}</h4>
                        <p>${category?.name || 'Unknown'}</p>
                        <p class="placeholder">"${table.placeholder}"</p>
                    </div>
                    <div class="input-table-actions">
                        <button class="action-btn edit" onclick="AdminApp.editInputTable('${table.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="AdminApp.deleteInputTable('${table.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    showAddInputTable() {
        this.state.editingItem = null;
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    editInputTable(tableId) {
        const table = this.state.inputTables.find(t => t.id === tableId);
        if (!table) return;
        
        this.state.editingItem = table;
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}" ${c.id === table.categoryId ? 'selected' : ''}>${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = table.name;
        document.getElementById('input-table-placeholder').value = table.placeholder;
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    closeAddInputTable() {
        document.getElementById('add-input-table-modal').classList.add('hidden');
        this.state.editingItem = null;
    },
    
    async saveInputTable() {
        const categoryId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const placeholder = document.getElementById('input-table-placeholder').value.trim();
        
        if (!categoryId || !name || !placeholder) {
            Utils.showToast('Please fill all fields', 'warning');
            return;
        }
        
        Utils.showLoading('Saving...');
        
        try {
            const data = { categoryId, name, placeholder };
            
            if (this.state.editingItem) {
                await Database.updateInputTable(this.state.editingItem.id, data);
                Utils.showToast('Updated!', 'success');
            } else {
                await Database.createInputTable(data);
                Utils.showToast('Created!', 'success');
            }
            
            await this.loadAdminData();
            this.renderInputTables();
            this.closeAddInputTable();
            
        } catch (error) {
            console.error('Save input table error:', error);
            Utils.showToast('Failed to save', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async deleteInputTable(tableId) {
        if (!confirm('Delete this input table?')) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteInputTable(tableId);
            await this.loadAdminData();
            this.renderInputTables();
            Utils.showToast('Deleted!', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== PAYMENTS ==========
    renderPayments() {
        const container = document.getElementById('admin-payments-list');
        if (!container) return;
        
        if (this.state.payments.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-credit-card"></i><p>No payment methods yet</p></div>';
            return;
        }
        
        container.innerHTML = this.state.payments.map(payment => `
            <div class="payment-card">
                <div class="payment-icon">
                    <img src="${payment.icon}" alt="${payment.name}">
                </div>
                <div class="payment-info">
                    <h4>${payment.name}</h4>
                    <p class="address">${payment.address}</p>
                    <p class="account">${payment.accountName}</p>
                    ${payment.note ? `<p class="note">${payment.note}</p>` : ''}
                </div>
                <div class="payment-actions">
                    <button class="action-btn edit" onclick="AdminApp.editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="AdminApp.deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    showAddPayment() {
        this.state.editingItem = null;
        document.getElementById('payment-name').value = '';
        document.getElementById('payment-address').value = '';
        document.getElementById('payment-account-name').value = '';
        document.getElementById('payment-note').value = '';
        document.getElementById('payment-icon').value = '';
        document.getElementById('payment-icon-preview').innerHTML = '';
        document.getElementById('payment-icon-preview').classList.add('hidden');
        document.getElementById('add-payment-modal').classList.remove('hidden');
    },
    
    editPayment(paymentId) {
        const payment = this.state.payments.find(p => p.id === paymentId);
        if (!payment) return;
        
        this.state.editingItem = payment;
        document.getElementById('payment-name').value = payment.name;
        document.getElementById('payment-address').value = payment.address;
        document.getElementById('payment-account-name').value = payment.accountName;
        document.getElementById('payment-note').value = payment.note || '';
        
        if (payment.icon) {
            document.getElementById('payment-icon-preview').innerHTML = `<img src="${payment.icon}" alt="Icon">`;
            document.getElementById('payment-icon-preview').classList.remove('hidden');
        }
        
        document.getElementById('add-payment-modal').classList.remove('hidden');
    },
    
    closeAddPayment() {
        document.getElementById('add-payment-modal').classList.add('hidden');
        this.state.editingItem = null;
    },
    
    async savePayment() {
        const name = document.getElementById('payment-name').value.trim();
        const address = document.getElementById('payment-address').value.trim();
        const accountName = document.getElementById('payment-account-name').value.trim();
        const note = document.getElementById('payment-note').value.trim();
        const iconInput = document.getElementById('payment-icon');
        
        if (!name || !address || !accountName) {
            Utils.showToast('Please fill required fields', 'warning');
            return;
        }
        
        Utils.showLoading('Saving...');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const data = { name, address, accountName, note, icon };
            
            if (this.state.editingItem) {
                await Database.updatePaymentMethod(this.state.editingItem.id, data);
                Utils.showToast('Updated!', 'success');
            } else {
                await Database.createPaymentMethod(data);
                Utils.showToast('Created!', 'success');
            }
            
            await this.loadAdminData();
            this.renderPayments();
            this.closeAddPayment();
            
        } catch (error) {
            console.error('Save payment error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    async deletePayment(paymentId) {
        if (!confirm('Delete this payment method?')) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deletePaymentMethod(paymentId);
            await this.loadAdminData();
            this.renderPayments();
            Utils.showToast('Deleted!', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== ANNOUNCEMENTS ==========
    renderAnnouncements() {
        const textArea = document.getElementById('announcement-text');
        const currentText = document.getElementById('current-announcement-text');
        
        if (textArea) textArea.value = '';
        if (currentText) currentText.textContent = this.state.settings.announcement || 'No announcement set';
    },
    
    async saveAnnouncement() {
        const text = document.getElementById('announcement-text').value.trim();
        
        if (!text) {
            Utils.showToast('Please enter text', 'warning');
            return;
        }
        
        Utils.showLoading('Saving...');
        
        try {
            await Database.updateSettings({
                ...this.state.settings,
                announcement: text
            });
            
            this.state.settings.announcement = text;
            document.getElementById('current-announcement-text').textContent = text;
            document.getElementById('announcement-text').value = '';
            Utils.showToast('Announcement saved!', 'success');
            
        } catch (error) {
            console.error('Save announcement error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== BROADCAST ==========
    async sendBroadcast() {
        const message = document.getElementById('broadcast-message').value.trim();
        const imageInput = document.getElementById('broadcast-image');
        
        if (!message) {
            Utils.showToast('Please enter message', 'warning');
            return;
        }
        
        if (!confirm(`Send to all ${this.state.users.length} users?`)) return;
        
        Utils.showLoading('Broadcasting...');
        
        try {
            let photo = null;
            if (imageInput.files[0]) {
                photo = await Utils.compressImage(imageInput.files[0], 800, 0.8);
            }
            
            const userIds = this.state.users.map(u => u.telegramId);
            const results = await TelegramBot.broadcast(userIds, message, photo);
            
            Utils.showToast(`Sent: ${results.success} success, ${results.failed} failed`, 'success');
            document.getElementById('broadcast-message').value = '';
            
        } catch (error) {
            console.error('Broadcast error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== BANNED USERS ==========
    renderBannedUsers() {
        const container = document.getElementById('admin-banned-list');
        if (!container) return;
        
        if (this.state.bannedUsers.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-ban"></i><p>No banned users</p></div>';
            return;
        }
        
        container.innerHTML = this.state.bannedUsers.map(user => `
            <div class="banned-card">
                <div class="banned-icon">
                    <i class="fas fa-user-slash"></i>
                </div>
                <div class="banned-info">
                    <h4>${user.firstName || 'User'}</h4>
                    <p>@${user.username || 'N/A'} • ${user.telegramId}</p>
                    <p class="reason"><strong>Reason:</strong> ${user.reason}</p>
                    <p class="date">Banned: ${Utils.formatDate(user.bannedAt, 'long')}</p>
                </div>
                <button class="btn btn-success btn-sm" onclick="AdminApp.unbanUser('${user.telegramId}')">
                    <i class="fas fa-check"></i> Unban
                </button>
            </div>
        `).join('');
    },
    
    async unbanUser(telegramId) {
        if (!confirm('Unban this user?')) return;
        
        Utils.showLoading('Unbanning...');
        try {
            await Database.unbanUser(telegramId);
            await TelegramBot.notifyUnban(telegramId);
            await this.loadAdminData();
            this.renderBannedUsers();
            Utils.showToast('User unbanned!', 'success');
        } catch (error) {
            console.error('Unban error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== SETTINGS ==========
    renderSettings() {
        const nameInput = document.getElementById('website-name');
        const logoPreview = document.getElementById('logo-preview');
        const currentLogo = document.getElementById('current-logo');
        
        if (nameInput) nameInput.value = this.state.settings.websiteName || '';
        
        if (this.state.settings.websiteLogo && currentLogo) {
            currentLogo.src = this.state.settings.websiteLogo;
            logoPreview?.classList.remove('hidden');
        }
    },
    
    async saveSettings() {
        const websiteName = document.getElementById('website-name').value.trim();
        const logoInput = document.getElementById('website-logo');
        
        Utils.showLoading('Saving...');
        
        try {
            const updates = { ...this.state.settings };
            
            if (websiteName) updates.websiteName = websiteName;
            
            if (logoInput.files[0]) {
                updates.websiteLogo = await Utils.compressImage(logoInput.files[0], 200, 0.9);
            }
            
            await Database.updateSettings(updates);
            this.state.settings = updates;
            Utils.showToast('Settings saved!', 'success');
            
        } catch (error) {
            console.error('Save settings error:', error);
            Utils.showToast('Failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ========== DATABASE IDS ==========
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

function showAdminPage(page) {
    AdminApp.showAdminPage(page);
}

function filterOrders(filter) {
    AdminApp.filterOrders(filter);
}

function filterTopups(filter) {
    AdminApp.filterTopups(filter);
}

function filterProductsByCategory() {
    AdminApp.renderProducts();
}

function showBannerType(type) {
    AdminApp.renderBannerType(type);
}

// Modal functions
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

function closeUserDetails() { AdminApp.closeUserDetails(); }

function copyId(elementId) {
    const text = document.getElementById(elementId).textContent;
    Utils.copyToClipboard(text);
}

// Upload triggers
function triggerCategoryIconUpload() { document.getElementById('category-icon').click(); }
function triggerProductIconUpload() { document.getElementById('product-icon').click(); }
function triggerBannerUpload() { document.getElementById('banner-image').click(); }
function triggerPaymentIconUpload() { document.getElementById('payment-icon').click(); }
function triggerLogoUpload() { document.getElementById('website-logo').click(); }
function triggerBroadcastImageUpload() { document.getElementById('broadcast-image').click(); }

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Image preview handlers
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
    
    // Logo preview
    document.getElementById('website-logo')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const img = await Utils.compressImage(e.target.files[0], 200, 0.9);
            document.getElementById('current-logo').src = img;
            document.getElementById('logo-preview').classList.remove('hidden');
        }
    });
    
    // Initialize Admin App
    AdminApp.init();
});
