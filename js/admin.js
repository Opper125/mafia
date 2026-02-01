// ===== Admin Panel Application =====

const AdminApp = {
    // Admin state
    state: {
        currentPage: 'dashboard',
        isVerified: false,
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
        currentBannerType: 'type1'
    },
    
    // Initialize admin panel
    async init() {
        try {
            // Check if running in Telegram
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied('This panel can only be accessed through Telegram');
                return;
            }
            
            // Initialize Telegram WebApp
            await TelegramApp.init();
            
            // Check if user is admin
            if (!TelegramApp.isAdmin()) {
                this.showAccessDenied('You don\'t have permission to access this panel');
                return;
            }
            
            // Show verification screen
            this.showVerificationScreen();
            
        } catch (error) {
            console.error('Admin init error:', error);
            this.showAccessDenied('Failed to initialize admin panel');
        }
    },
    
    // Show access denied
    showAccessDenied(message) {
        document.getElementById('verification-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        
        const denied = document.getElementById('access-denied');
        denied.querySelector('p').textContent = message;
        denied.classList.remove('hidden');
    },
    
    // Show verification screen
    showVerificationScreen() {
        document.getElementById('access-denied').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
        document.getElementById('verification-screen').classList.remove('hidden');
        
        // Focus on password input
        setTimeout(() => {
            document.getElementById('admin-password').focus();
        }, 100);
    },
    
    // Verify admin - ပြင်ဆင်ထားသော Function
    async verifyAdmin() {
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('verification-error');
        
        // Hide previous error
        errorDiv.classList.add('hidden');
        
        if (!password) {
            errorDiv.textContent = 'Please enter your password';
            errorDiv.classList.remove('hidden');
            this.shakeInput();
            return;
        }
        
        Utils.showLoading('Verifying...');
        
        try {
            // Simulate small delay for security
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // ✅ Check password against CONFIG.ADMIN_PASSWORD
            if (password === CONFIG.ADMIN_PASSWORD) {
                this.state.isVerified = true;
                
                // Load admin data
                await this.loadAdminData();
                
                // Show dashboard
                this.showDashboard();
                
                TelegramApp.ready();
                TelegramApp.hapticFeedback('notification', 'success');
                
            } else {
                // Wrong password
                errorDiv.textContent = 'Incorrect password. Please try again.';
                errorDiv.classList.remove('hidden');
                document.getElementById('admin-password').value = '';
                this.shakeInput();
                TelegramApp.hapticFeedback('notification', 'error');
            }
            
        } catch (error) {
            console.error('Verification error:', error);
            errorDiv.textContent = 'Verification failed. Please try again.';
            errorDiv.classList.remove('hidden');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Shake input animation for wrong password
    shakeInput() {
        const input = document.getElementById('admin-password');
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    },
    
    // Show dashboard
    showDashboard() {
        document.getElementById('verification-screen').classList.add('hidden');
        document.getElementById('access-denied').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        this.renderDashboard();
        this.startRealtimeUpdates();
    },
    
    // Load admin data
    async loadAdminData() {
        try {
            const [
                settings,
                users,
                orders,
                topups,
                categories,
                products,
                banners,
                payments,
                inputTables,
                bannedUsers,
                stats
            ] = await Promise.all([
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
            
            this.state.settings = settings;
            this.state.users = users;
            this.state.orders = orders;
            this.state.topups = topups;
            this.state.categories = categories;
            this.state.products = products;
            this.state.banners = banners;
            this.state.payments = payments;
            this.state.inputTables = inputTables;
            this.state.bannedUsers = bannedUsers;
            this.state.stats = stats;
            
            // Update UI counts
            this.updateCounts();
            
        } catch (error) {
            console.error('Load admin data error:', error);
            Utils.showToast('Failed to load data', 'error');
        }
    },
    
    // Update counts in sidebar
    updateCounts() {
        document.getElementById('users-count').textContent = this.state.users.length;
        document.getElementById('pending-orders').textContent = this.state.orders.filter(o => o.status === 'pending').length;
        document.getElementById('pending-topups').textContent = this.state.topups.filter(t => t.status === 'pending').length;
    },
    
    // Start realtime updates
    startRealtimeUpdates() {
        // Update every 30 seconds
        setInterval(async () => {
            await this.loadAdminData();
            this.renderCurrentPage();
        }, 30000);
        
        // Update time
        setInterval(() => {
            const timeEl = document.getElementById('admin-time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
    },
    
    // Show admin page
    showAdminPage(page) {
        this.state.currentPage = page;
        
        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event?.currentTarget?.classList.add('active');
        
        // Hide all pages
        document.querySelectorAll('.admin-page').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show target page
        document.getElementById(`admin-page-${page}`).classList.remove('hidden');
        
        // Render page content
        this.renderCurrentPage();
    },
    
    // Render current page
    renderCurrentPage() {
        switch (this.state.currentPage) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'users':
                this.renderUsers();
                break;
            case 'orders':
                this.renderOrders();
                break;
            case 'topups':
                this.renderTopups();
                break;
            case 'categories':
                this.renderCategories();
                break;
            case 'products':
                this.renderProducts();
                break;
            case 'banners':
                this.renderBanners();
                break;
            case 'input-tables':
                this.renderInputTables();
                break;
            case 'payments':
                this.renderPayments();
                break;
            case 'announcements':
                this.renderAnnouncements();
                break;
            case 'banned':
                this.renderBannedUsers();
                break;
            case 'settings':
                this.renderSettings();
                break;
            case 'database':
                this.renderDatabaseIds();
                break;
        }
    },
    
    // ===== Dashboard =====
    renderDashboard() {
        // Update stats
        document.getElementById('stat-users').textContent = this.state.stats.totalUsers || 0;
        document.getElementById('stat-orders').textContent = this.state.stats.totalOrders || 0;
        document.getElementById('stat-revenue').textContent = Utils.formatCurrency(this.state.stats.totalRevenue || 0, '').replace(' ', '');
        document.getElementById('stat-pending').textContent = this.state.stats.pendingOrders || 0;
        
        // Recent orders
        const recentOrders = document.getElementById('recent-orders');
        const latestOrders = this.state.orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (latestOrders.length === 0) {
            recentOrders.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:1rem;">No orders yet</p>';
        } else {
            recentOrders.innerHTML = latestOrders.map(order => {
                const user = this.state.users.find(u => u.telegramId === order.telegramId);
                return `
                    <div class="recent-item">
                        <img src="${user?.photoUrl || `https://ui-avatars.com/api/?name=${order.telegramId}&background=8b5cf6&color=fff`}" alt="User">
                        <div class="recent-item-info">
                            <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                            <p>${order.productName}</p>
                        </div>
                        <span class="recent-item-amount">${Utils.formatCurrency(order.amount, order.currency)}</span>
                    </div>
                `;
            }).join('');
        }
        
        // Recent topups
        const recentTopups = document.getElementById('recent-topups');
        const latestTopups = this.state.topups
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
        
        if (latestTopups.length === 0) {
            recentTopups.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:1rem;">No top-ups yet</p>';
        } else {
            recentTopups.innerHTML = latestTopups.map(topup => {
                const user = this.state.users.find(u => u.telegramId === topup.telegramId);
                return `
                    <div class="recent-item">
                        <img src="${user?.photoUrl || `https://ui-avatars.com/api/?name=${topup.telegramId}&background=10b981&color=fff`}" alt="User">
                        <div class="recent-item-info">
                            <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                            <p>${topup.paymentMethod}</p>
                        </div>
                        <span class="recent-item-amount" style="color:var(--success);">+${Utils.formatCurrency(topup.amount, 'MMK')}</span>
                    </div>
                `;
            }).join('');
        }
    },
    
    // ===== Users =====
    renderUsers() {
        const tbody = document.getElementById('users-table-body');
        
        if (this.state.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No users yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.state.users.map(user => `
            <tr>
                <td>
                    <div class="user-cell">
                        <img src="${user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=8b5cf6&color=fff`}" alt="${user.firstName}">
                        <div class="user-cell-info">
                            <h4>${user.firstName} ${user.lastName || ''}</h4>
                            <p>@${user.username || 'N/A'}</p>
                        </div>
                    </div>
                </td>
                <td>${user.telegramId}</td>
                <td>${Utils.formatCurrency(user.balance, 'MMK')}</td>
                <td>${user.totalOrders} (${user.approvedOrders} approved)</td>
                <td>${user.isPremium ? '<i class="fas fa-star premium-indicator"></i> Premium' : 'Standard'}</td>
                <td>${Utils.timeAgo(user.joinedAt)}</td>
                <td>
                    <button class="action-btn view" onclick="AdminApp.viewUserDetails('${user.telegramId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="AdminApp.editUserBalance('${user.telegramId}')">
                        <i class="fas fa-wallet"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },
    
    // View user details
    async viewUserDetails(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        
        const userOrders = this.state.orders.filter(o => o.telegramId === telegramId);
        const userTopups = this.state.topups.filter(t => t.telegramId === telegramId);
        
        const modal = document.getElementById('user-details-modal');
        const content = document.getElementById('user-details-content');
        
        content.innerHTML = `
            <div class="user-details-header">
                <img src="${user.photoUrl || `https://ui-avatars.com/api/?name=${user.firstName}&background=8b5cf6&color=fff&size=100`}" alt="${user.firstName}" style="width:80px;height:80px;border-radius:50%;">
                <div>
                    <h3>${user.firstName} ${user.lastName || ''}</h3>
                    <p>@${user.username || 'N/A'} • ${user.telegramId}</p>
                    ${user.isPremium ? '<span style="color:#fbbf24;"><i class="fas fa-star"></i> Telegram Premium</span>' : ''}
                </div>
            </div>
            
            <div class="user-stats-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.5rem 0;">
                <div class="stat-box" style="background:var(--gradient-glow);padding:1rem;border-radius:12px;text-align:center;">
                    <strong style="font-size:1.5rem;display:block;">${Utils.formatCurrency(user.balance, '')}</strong>
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Balance</span>
                </div>
                <div class="stat-box" style="background:var(--gradient-glow);padding:1rem;border-radius:12px;text-align:center;">
                    <strong style="font-size:1.5rem;display:block;">${user.totalOrders}</strong>
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Total Orders</span>
                </div>
                <div class="stat-box" style="background:var(--gradient-glow);padding:1rem;border-radius:12px;text-align:center;">
                    <strong style="font-size:1.5rem;display:block;">${Utils.formatCurrency(user.totalSpent, '')}</strong>
                    <span style="color:var(--text-secondary);font-size:0.85rem;">Total Spent</span>
                </div>
            </div>
            
            <div class="user-info-section" style="margin-bottom:1.5rem;">
                <h4 style="margin-bottom:0.75rem;">Account Info</h4>
                <div style="background:var(--bg-card);border-radius:12px;padding:1rem;">
                    <p><strong>Joined:</strong> ${Utils.formatDate(user.joinedAt, 'long')}</p>
                    <p><strong>Last Active:</strong> ${Utils.formatDate(user.lastActive, 'long')}</p>
                    <p><strong>Approved Orders:</strong> ${user.approvedOrders}</p>
                    <p><strong>Rejected Orders:</strong> ${user.rejectedOrders}</p>
                    <p><strong>Total Top-ups:</strong> ${user.totalTopups}</p>
                    <p><strong>Failed Attempts:</strong> ${user.failedPurchaseAttempts}</p>
                </div>
            </div>
            
            <div class="user-orders-section" style="margin-bottom:1.5rem;">
                <h4 style="margin-bottom:0.75rem;">Recent Orders (${userOrders.length})</h4>
                <div style="max-height:200px;overflow-y:auto;">
                    ${userOrders.length === 0 ? '<p style="color:var(--text-secondary);">No orders</p>' : 
                    userOrders.slice(0, 10).map(order => `
                        <div style="display:flex;justify-content:space-between;padding:0.75rem;background:var(--bg-card);border-radius:8px;margin-bottom:0.5rem;">
                            <div>
                                <strong>${order.productName}</strong>
                                <p style="font-size:0.8rem;color:var(--text-secondary);">${Utils.formatDate(order.createdAt)}</p>
                            </div>
                            <div style="text-align:right;">
                                <span>${Utils.formatCurrency(order.amount, order.currency)}</span>
                                <span class="order-status ${order.status}" style="display:block;font-size:0.75rem;">${order.status}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="user-actions" style="display:flex;gap:0.5rem;">
                <button class="action-btn edit" onclick="AdminApp.editUserBalance('${user.telegramId}')" style="flex:1;padding:0.75rem;">
                    <i class="fas fa-wallet"></i> Edit Balance
                </button>
                <button class="action-btn delete" onclick="AdminApp.banUserPrompt('${user.telegramId}')" style="flex:1;padding:0.75rem;">
                    <i class="fas fa-ban"></i> Ban User
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
    },
    
    // Close user details
    closeUserDetails() {
        document.getElementById('user-details-modal').classList.add('hidden');
    },
    
    // Edit user balance
    async editUserBalance(telegramId) {
        const user = this.state.users.find(u => u.telegramId === telegramId);
        if (!user) return;
        
        const newBalance = prompt(`Current balance: ${Utils.formatCurrency(user.balance, 'MMK')}\n\nEnter new balance amount:`);
        
        if (newBalance !== null && !isNaN(newBalance) && newBalance !== '') {
            Utils.showLoading('Updating balance...');
            try {
                await Database.updateUserBalance(telegramId, parseFloat(newBalance), 'set');
                await this.loadAdminData();
                this.renderUsers();
                this.closeUserDetails();
                Utils.showToast('Balance updated successfully', 'success');
            } catch (error) {
                console.error('Update balance error:', error);
                Utils.showToast('Failed to update balance', 'error');
            } finally {
                Utils.hideLoading();
            }
        }
    },
    
    // Ban user prompt
    async banUserPrompt(telegramId) {
        const confirmed = confirm('Are you sure you want to ban this user?');
        if (confirmed) {
            const reason = prompt('Enter ban reason:') || 'Violated terms of service';
            await this.banUser(telegramId, reason);
        }
    },
    
    // Ban user
    async banUser(telegramId, reason) {
        Utils.showLoading('Banning user...');
        try {
            const user = this.state.users.find(u => u.telegramId === telegramId);
            await Database.banUser(user, reason);
            await TelegramBot.notifyBan(telegramId, reason);
            await this.loadAdminData();
            this.renderUsers();
            this.closeUserDetails();
            Utils.showToast('User banned successfully', 'success');
        } catch (error) {
            console.error('Ban user error:', error);
            Utils.showToast('Failed to ban user', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Orders =====
    renderOrders(filter = 'all') {
        const ordersList = document.getElementById('admin-orders-list');
        
        let filteredOrders = this.state.orders;
        if (filter !== 'all') {
            filteredOrders = filteredOrders.filter(o => o.status === filter);
        }
        
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (filteredOrders.length === 0) {
            ordersList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No orders found</p>';
            return;
        }
        
        ordersList.innerHTML = filteredOrders.map(order => {
            const user = this.state.users.find(u => u.telegramId === order.telegramId);
            return `
                <div class="admin-card">
                    <div class="admin-card-header">
                        <img src="${user?.photoUrl || `https://ui-avatars.com/api/?name=${order.telegramId}&background=8b5cf6&color=fff`}" alt="User" class="admin-card-icon" style="border-radius:50%;">
                        <div class="admin-card-info">
                            <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                            <p>@${user?.username || 'N/A'} • ${order.orderId}</p>
                        </div>
                        <span class="order-status ${order.status}">${order.status}</span>
                    </div>
                    <div style="padding:0.5rem 0;">
                        <p><strong>Product:</strong> ${order.productName}</p>
                        <p><strong>Amount:</strong> ${Utils.formatCurrency(order.amount, order.currency)}</p>
                        <p><strong>Category:</strong> ${order.categoryName}</p>
                        <p><strong>Input Values:</strong></p>
                        <ul style="margin-left:1rem;font-size:0.9rem;color:var(--text-secondary);">
                            ${Object.entries(order.inputValues || {}).map(([k, v]) => `<li>${k}: ${v}</li>`).join('')}
                        </ul>
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.5rem;">
                            ${Utils.formatDate(order.createdAt, 'long')}
                        </p>
                    </div>
                    ${order.status === 'pending' ? `
                        <div class="admin-card-actions">
                            <button class="action-btn approve" onclick="AdminApp.approveOrder('${order.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="action-btn reject" onclick="AdminApp.rejectOrder('${order.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    // Approve order
    async approveOrder(orderId) {
        const confirmed = confirm('Approve this order?');
        if (!confirmed) return;
        
        Utils.showLoading('Approving order...');
        try {
            const order = await Database.updateOrderStatus(orderId, 'approved', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyOrderStatus(order, 'approved');
            await this.loadAdminData();
            this.renderOrders();
            Utils.showToast('Order approved', 'success');
            TelegramApp.hapticFeedback('notification', 'success');
        } catch (error) {
            console.error('Approve order error:', error);
            Utils.showToast('Failed to approve order', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Reject order
    async rejectOrder(orderId) {
        const confirmed = confirm('Reject this order? Amount will be refunded.');
        if (!confirmed) return;
        
        Utils.showLoading('Rejecting order...');
        try {
            const order = await Database.updateOrderStatus(orderId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyOrderStatus(order, 'rejected');
            await this.loadAdminData();
            this.renderOrders();
            Utils.showToast('Order rejected & refunded', 'success');
        } catch (error) {
            console.error('Reject order error:', error);
            Utils.showToast('Failed to reject order', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Topups =====
    renderTopups(filter = 'all') {
        const topupsList = document.getElementById('admin-topups-list');
        
        let filteredTopups = this.state.topups;
        if (filter !== 'all') {
            filteredTopups = filteredTopups.filter(t => t.status === filter);
        }
        
        filteredTopups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (filteredTopups.length === 0) {
            topupsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No top-up requests found</p>';
            return;
        }
        
        topupsList.innerHTML = filteredTopups.map(topup => {
            const user = this.state.users.find(u => u.telegramId === topup.telegramId);
            return `
                <div class="admin-card">
                    <div class="admin-card-header">
                        <img src="${user?.photoUrl || `https://ui-avatars.com/api/?name=${topup.telegramId}&background=10b981&color=fff`}" alt="User" class="admin-card-icon" style="border-radius:50%;">
                        <div class="admin-card-info">
                            <h4>${user?.firstName || 'User'} ${user?.lastName || ''}</h4>
                            <p>@${user?.username || 'N/A'}</p>
                        </div>
                        <span class="order-status ${topup.status}">${topup.status}</span>
                    </div>
                    <div style="padding:0.5rem 0;">
                        <p><strong>Amount:</strong> ${Utils.formatCurrency(topup.amount, 'MMK')}</p>
                        <p><strong>Payment:</strong> ${topup.paymentMethod}</p>
                        <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:0.5rem;">
                            ${Utils.formatDate(topup.createdAt, 'long')}
                        </p>
                        ${topup.proofImage ? `
                            <div style="margin-top:0.75rem;">
                                <img src="${topup.proofImage}" alt="Proof" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;cursor:pointer;" onclick="window.open('${topup.proofImage}', '_blank')">
                            </div>
                        ` : ''}
                    </div>
                    ${topup.status === 'pending' ? `
                        <div class="admin-card-actions">
                            <button class="action-btn approve" onclick="AdminApp.approveTopup('${topup.id}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="action-btn reject" onclick="AdminApp.rejectTopup('${topup.id}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    },
    
    // Approve topup
    async approveTopup(topupId) {
        const confirmed = confirm('Approve this top-up request?');
        if (!confirmed) return;
        
        Utils.showLoading('Approving top-up...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'approved', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'approved');
            await this.loadAdminData();
            this.renderTopups();
            Utils.showToast('Top-up approved', 'success');
            TelegramApp.hapticFeedback('notification', 'success');
        } catch (error) {
            console.error('Approve topup error:', error);
            Utils.showToast('Failed to approve top-up', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Reject topup
    async rejectTopup(topupId) {
        const confirmed = confirm('Reject this top-up request?');
        if (!confirmed) return;
        
        Utils.showLoading('Rejecting top-up...');
        try {
            const topup = await Database.updateTopupStatus(topupId, 'rejected', CONFIG.ADMIN_TELEGRAM_ID);
            await TelegramBot.notifyTopupStatus(topup, 'rejected');
            await this.loadAdminData();
            this.renderTopups();
            Utils.showToast('Top-up rejected', 'success');
        } catch (error) {
            console.error('Reject topup error:', error);
            Utils.showToast('Failed to reject top-up', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Categories =====
    renderCategories() {
        const categoriesList = document.getElementById('admin-categories-list');
        
        if (this.state.categories.length === 0) {
            categoriesList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No categories yet. Click "Add Category" to create one.</p>';
            return;
        }
        
        categoriesList.innerHTML = this.state.categories.map(category => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <img src="${category.icon}" alt="${category.name}" class="admin-card-icon">
                    <div class="admin-card-info">
                        <h4>${category.flag || ''} ${category.name}</h4>
                        <p>${category.totalSold || 0} sold ${category.hasDiscount ? '• <span style="color:var(--danger);">Has Discount</span>' : ''}</p>
                    </div>
                </div>
                <div class="admin-card-actions">
                    <button class="action-btn edit" onclick="AdminApp.editCategory('${category.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="AdminApp.deleteCategory('${category.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Show add category modal
    showAddCategory() {
        this.state.editingItem = null;
        document.getElementById('category-name').value = '';
        document.getElementById('category-flag').value = '';
        document.getElementById('has-discount').checked = false;
        document.getElementById('category-icon-preview').classList.add('hidden');
        document.getElementById('add-category-modal').classList.remove('hidden');
    },
    
    // Close add category
    closeAddCategory() {
        document.getElementById('add-category-modal').classList.add('hidden');
    },
    
    // Edit category
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
    
    // Save category
    async saveCategory() {
        const name = document.getElementById('category-name').value.trim();
        const flag = document.getElementById('category-flag').value;
        const hasDiscount = document.getElementById('has-discount').checked;
        const iconInput = document.getElementById('category-icon');
        
        if (!name) {
            Utils.showToast('Please enter category name', 'warning');
            return;
        }
        
        Utils.showLoading('Saving category...');
        TelegramApp.hapticFeedback('impact', 'medium');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload category icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const categoryData = { name, flag, hasDiscount, icon };
            
            if (this.state.editingItem) {
                await Database.updateCategory(this.state.editingItem.id, categoryData);
                Utils.showToast('Category updated', 'success');
            } else {
                await Database.createCategory(categoryData);
                Utils.showToast('Category created', 'success');
            }
            
            await this.loadAdminData();
            this.renderCategories();
            this.closeAddCategory();
            
        } catch (error) {
            console.error('Save category error:', error);
            Utils.showToast('Failed to save category', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Delete category
    async deleteCategory(categoryId) {
        const confirmed = confirm('Delete this category? All products in this category will also be deleted.');
        if (!confirmed) return;
        
        Utils.showLoading('Deleting category...');
        try {
            await Database.deleteCategory(categoryId);
            await this.loadAdminData();
            this.renderCategories();
            Utils.showToast('Category deleted', 'success');
        } catch (error) {
            console.error('Delete category error:', error);
            Utils.showToast('Failed to delete category', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Products =====
    renderProducts() {
        const productsList = document.getElementById('admin-products-list');
        const filterSelect = document.getElementById('filter-category');
        
        // Update category filter dropdown
        filterSelect.innerHTML = '<option value="all">All Categories</option>' +
            this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        
        let filteredProducts = this.state.products;
        const selectedCategory = filterSelect.value;
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.categoryId === selectedCategory);
        }
        
        if (filteredProducts.length === 0) {
            productsList.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No products yet. Click "Add Product" to create one.</p>';
            return;
        }
        
        productsList.innerHTML = filteredProducts.map(product => {
            const category = this.state.categories.find(c => c.id === product.categoryId);
            return `
                <div class="admin-card">
                    <div class="admin-card-header">
                        <img src="${product.icon}" alt="${product.name}" class="admin-card-icon">
                        <div class="admin-card-info">
                            <h4>${product.name}</h4>
                            <p>${category?.name || 'Unknown'} • ${product.sold || 0} sold</p>
                        </div>
                    </div>
                    <div style="padding:0.5rem 0;">
                        <p>
                            ${product.discount > 0 ? `<span style="text-decoration:line-through;color:var(--text-secondary);">${Utils.formatCurrency(product.price, product.currency)}</span> ` : ''}
                            <strong style="color:var(--accent-primary);">${Utils.formatCurrency(product.discountedPrice || product.price, product.currency)}</strong>
                            ${product.discount > 0 ? `<span style="color:var(--danger);margin-left:0.5rem;">-${product.discount}%</span>` : ''}
                        </p>
                        <p style="font-size:0.85rem;color:var(--text-secondary);">
                            <i class="fas fa-bolt"></i> ${product.deliveryTime === 'instant' ? 'Instant' : product.deliveryTime}
                        </p>
                    </div>
                    <div class="admin-card-actions">
                        <button class="action-btn edit" onclick="AdminApp.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="AdminApp.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Show add product modal
    showAddProduct() {
        this.state.editingItem = null;
        document.getElementById('product-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-currency').value = 'MMK';
        document.getElementById('product-discount').value = '';
        document.getElementById('product-delivery').value = 'instant';
        document.getElementById('product-icon-preview').classList.add('hidden');
        document.getElementById('add-product-modal').classList.remove('hidden');
    },
    
    // Close add product
    closeAddProduct() {
        document.getElementById('add-product-modal').classList.add('hidden');
    },
    
    // Edit product
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
    
    // Save product
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
        
        Utils.showLoading('Saving product...');
        TelegramApp.hapticFeedback('impact', 'medium');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload product icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const productData = { categoryId, name, price, currency, discount, deliveryTime, icon };
            
            if (this.state.editingItem) {
                await Database.updateProduct(this.state.editingItem.id, productData);
                Utils.showToast('Product updated', 'success');
            } else {
                await Database.createProduct(productData);
                Utils.showToast('Product created', 'success');
            }
            
            await this.loadAdminData();
            this.renderProducts();
            this.closeAddProduct();
            
        } catch (error) {
            console.error('Save product error:', error);
            Utils.showToast('Failed to save product', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Delete product
    async deleteProduct(productId) {
        const confirmed = confirm('Delete this product?');
        if (!confirmed) return;
        
        Utils.showLoading('Deleting product...');
        try {
            await Database.deleteProduct(productId);
            await this.loadAdminData();
            this.renderProducts();
            Utils.showToast('Product deleted', 'success');
        } catch (error) {
            console.error('Delete product error:', error);
            Utils.showToast('Failed to delete product', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Banners =====
    renderBanners() {
        this.renderBannerType(this.state.currentBannerType);
    },
    
    renderBannerType(type) {
        this.state.currentBannerType = type;
        
        document.querySelectorAll('.banner-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.banner-tabs .tab-btn[onclick="showBannerType('${type}')"]`)?.classList.add('active');
        
        document.getElementById('banner-type1').classList.toggle('hidden', type !== 'type1');
        document.getElementById('banner-type2').classList.toggle('hidden', type !== 'type2');
        
        const banners = type === 'type1' ? (this.state.banners.type1 || []) : (this.state.banners.type2 || []);
        const listId = `banners-${type}-list`;
        const list = document.getElementById(listId);
        
        if (!banners || banners.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No banners yet</p>';
            return;
        }
        
        list.innerHTML = banners.map(banner => {
            const category = type === 'type2' ? this.state.categories.find(c => c.id === banner.categoryId) : null;
            return `
                <div class="banner-card">
                    <img src="${banner.image}" alt="Banner">
                    <div class="banner-card-info">
                        ${category ? `<p><strong>Category:</strong> ${category.name}</p>` : ''}
                        ${banner.description ? `<p style="font-size:0.85rem;color:var(--text-secondary);">${banner.description.substring(0, 100)}...</p>` : ''}
                        <p style="font-size:0.8rem;color:var(--text-secondary);">${Utils.formatDate(banner.createdAt)}</p>
                        <button class="action-btn delete" onclick="AdminApp.deleteBanner('${banner.id}', '${type}')" style="margin-top:0.5rem;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Show add banner modal
    showAddBanner(type) {
        this.state.currentBannerType = type;
        document.getElementById('banner-category-group').style.display = type === 'type2' ? 'block' : 'none';
        document.getElementById('banner-text-group').style.display = type === 'type2' ? 'block' : 'none';
        
        if (type === 'type2') {
            document.getElementById('banner-category').innerHTML = '<option value="">Select Category</option>' +
                this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
        
        document.getElementById('banner-image-preview').classList.add('hidden');
        document.getElementById('banner-text').value = '';
        document.getElementById('add-banner-modal').classList.remove('hidden');
    },
    
    // Close add banner
    closeAddBanner() {
        document.getElementById('add-banner-modal').classList.add('hidden');
    },
    
    // Save banner
    async saveBanner() {
        const type = this.state.currentBannerType;
        const imageInput = document.getElementById('banner-image');
        const categoryId = document.getElementById('banner-category').value;
        const description = document.getElementById('banner-text').value;
        
        if (!imageInput.files[0]) {
            Utils.showToast('Please upload banner image', 'warning');
            return;
        }
        
        if (type === 'type2' && !categoryId) {
            Utils.showToast('Please select a category', 'warning');
            return;
        }
        
        Utils.showLoading('Uploading banner...');
        TelegramApp.hapticFeedback('impact', 'medium');
        
        try {
            const image = await Utils.compressImage(imageInput.files[0], 1920, 0.85);
            
            const bannerData = { image };
            if (type === 'type2') {
                bannerData.categoryId = categoryId;
                bannerData.description = description;
            }
            
            await Database.createBanner(bannerData, type);
            
            await this.loadAdminData();
            this.renderBanners();
            this.closeAddBanner();
            Utils.showToast('Banner created', 'success');
            
        } catch (error) {
            console.error('Save banner error:', error);
            Utils.showToast('Failed to save banner', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Delete banner
    async deleteBanner(bannerId, type) {
        const confirmed = confirm('Delete this banner?');
        if (!confirmed) return;
        
        Utils.showLoading('Deleting banner...');
        try {
            await Database.deleteBanner(bannerId, type);
            await this.loadAdminData();
            this.renderBanners();
            Utils.showToast('Banner deleted', 'success');
        } catch (error) {
            console.error('Delete banner error:', error);
            Utils.showToast('Failed to delete banner', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Input Tables =====
    renderInputTables() {
        const list = document.getElementById('admin-input-tables-list');
        
        if (this.state.inputTables.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No input tables yet</p>';
            return;
        }
        
        list.innerHTML = this.state.inputTables.map(table => {
            const category = this.state.categories.find(c => c.id === table.categoryId);
            return `
                <div class="admin-card">
                    <div class="admin-card-header">
                        <div class="admin-card-icon" style="background:var(--gradient-glow);display:flex;align-items:center;justify-content:center;border-radius:12px;">
                            <i class="fas fa-keyboard" style="color:var(--accent-primary);font-size:1.5rem;"></i>
                        </div>
                        <div class="admin-card-info">
                            <h4>${table.name}</h4>
                            <p>${category?.name || 'Unknown Category'}</p>
                        </div>
                    </div>
                    <p style="color:var(--text-secondary);font-size:0.9rem;padding:0.5rem 0;">Placeholder: "${table.placeholder}"</p>
                    <div class="admin-card-actions">
                        <button class="action-btn edit" onclick="AdminApp.editInputTable('${table.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="AdminApp.deleteInputTable('${table.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Show add input table modal
    showAddInputTable() {
        this.state.editingItem = null;
        document.getElementById('input-table-category').innerHTML = '<option value="">Select Category</option>' +
            this.state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        document.getElementById('input-table-name').value = '';
        document.getElementById('input-table-placeholder').value = '';
        document.getElementById('add-input-table-modal').classList.remove('hidden');
    },
    
    // Close add input table
    closeAddInputTable() {
        document.getElementById('add-input-table-modal').classList.add('hidden');
    },
    
    // Edit input table
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
    
    // Save input table
    async saveInputTable() {
        const categoryId = document.getElementById('input-table-category').value;
        const name = document.getElementById('input-table-name').value.trim();
        const placeholder = document.getElementById('input-table-placeholder').value.trim();
        
        if (!categoryId || !name || !placeholder) {
            Utils.showToast('Please fill all fields', 'warning');
            return;
        }
        
        Utils.showLoading('Saving input table...');
        
        try {
            const data = { categoryId, name, placeholder };
            
            if (this.state.editingItem) {
                await Database.updateInputTable(this.state.editingItem.id, data);
                Utils.showToast('Input table updated', 'success');
            } else {
                await Database.createInputTable(data);
                Utils.showToast('Input table created', 'success');
            }
            
            await this.loadAdminData();
            this.renderInputTables();
            this.closeAddInputTable();
            
        } catch (error) {
            console.error('Save input table error:', error);
            Utils.showToast('Failed to save input table', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Delete input table
    async deleteInputTable(tableId) {
        const confirmed = confirm('Delete this input table?');
        if (!confirmed) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deleteInputTable(tableId);
            await this.loadAdminData();
            this.renderInputTables();
            Utils.showToast('Input table deleted', 'success');
        } catch (error) {
            console.error('Delete input table error:', error);
            Utils.showToast('Failed to delete', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Payment Methods =====
    renderPayments() {
        const list = document.getElementById('admin-payments-list');
        
        if (this.state.payments.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No payment methods yet</p>';
            return;
        }
        
        list.innerHTML = this.state.payments.map(payment => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <img src="${payment.icon}" alt="${payment.name}" class="admin-card-icon">
                    <div class="admin-card-info">
                        <h4>${payment.name}</h4>
                        <p>${payment.address}</p>
                    </div>
                </div>
                <div style="padding:0.5rem 0;">
                    <p><strong>Account:</strong> ${payment.accountName}</p>
                    ${payment.note ? `<p style="font-size:0.85rem;color:var(--text-secondary);">${payment.note}</p>` : ''}
                </div>
                <div class="admin-card-actions">
                    <button class="action-btn edit" onclick="AdminApp.editPayment('${payment.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="AdminApp.deletePayment('${payment.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Show add payment modal
    showAddPayment() {
        this.state.editingItem = null;
        document.getElementById('payment-name').value = '';
        document.getElementById('payment-address').value = '';
        document.getElementById('payment-account-name').value = '';
        document.getElementById('payment-note').value = '';
        document.getElementById('payment-icon-preview').classList.add('hidden');
        document.getElementById('add-payment-modal').classList.remove('hidden');
    },
    
    // Close add payment
    closeAddPayment() {
        document.getElementById('add-payment-modal').classList.add('hidden');
    },
    
    // Edit payment
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
    
    // Save payment
    async savePayment() {
        const name = document.getElementById('payment-name').value.trim();
        const address = document.getElementById('payment-address').value.trim();
        const accountName = document.getElementById('payment-account-name').value.trim();
        const note = document.getElementById('payment-note').value.trim();
        const iconInput = document.getElementById('payment-icon');
        
        if (!name || !address || !accountName) {
            Utils.showToast('Please fill all required fields', 'warning');
            return;
        }
        
        Utils.showLoading('Saving payment method...');
        
        try {
            let icon = this.state.editingItem?.icon || '';
            
            if (iconInput.files[0]) {
                icon = await Utils.compressImage(iconInput.files[0], 200, 0.8);
            }
            
            if (!icon && !this.state.editingItem) {
                Utils.showToast('Please upload payment icon', 'warning');
                Utils.hideLoading();
                return;
            }
            
            const data = { name, address, accountName, note, icon };
            
            if (this.state.editingItem) {
                await Database.updatePaymentMethod(this.state.editingItem.id, data);
                Utils.showToast('Payment method updated', 'success');
            } else {
                await Database.createPaymentMethod(data);
                Utils.showToast('Payment method created', 'success');
            }
            
            await this.loadAdminData();
            this.renderPayments();
            this.closeAddPayment();
            
        } catch (error) {
            console.error('Save payment error:', error);
            Utils.showToast('Failed to save payment method', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Delete payment
    async deletePayment(paymentId) {
        const confirmed = confirm('Delete this payment method?');
        if (!confirmed) return;
        
        Utils.showLoading('Deleting...');
        try {
            await Database.deletePaymentMethod(paymentId);
            await this.loadAdminData();
            this.renderPayments();
            Utils.showToast('Payment method deleted', 'success');
        } catch (error) {
            console.error('Delete payment error:', error);
            Utils.showToast('Failed to delete', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Announcements =====
    renderAnnouncements() {
        document.getElementById('announcement-text').value = '';
        document.getElementById('current-announcement-text').textContent = this.state.settings.announcement || 'No announcement set';
    },
    
    // Save announcement
    async saveAnnouncement() {
        const text = document.getElementById('announcement-text').value.trim();
        
        if (!text) {
            Utils.showToast('Please enter announcement text', 'warning');
            return;
        }
        
        Utils.showLoading('Saving announcement...');
        
        try {
            await Database.updateSettings({
                ...this.state.settings,
                announcement: text
            });
            
            this.state.settings.announcement = text;
            document.getElementById('current-announcement-text').textContent = text;
            document.getElementById('announcement-text').value = '';
            
            Utils.showToast('Announcement updated', 'success');
        } catch (error) {
            console.error('Save announcement error:', error);
            Utils.showToast('Failed to save announcement', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Broadcast =====
    async sendBroadcast() {
        const message = document.getElementById('broadcast-message').value.trim();
        const imageInput = document.getElementById('broadcast-image');
        
        if (!message) {
            Utils.showToast('Please enter broadcast message', 'warning');
            return;
        }
        
        const confirmed = confirm(`Send this message to all ${this.state.users.length} users?`);
        if (!confirmed) return;
        
        Utils.showLoading('Broadcasting...');
        
        try {
            let photo = null;
            if (imageInput.files[0]) {
                photo = await Utils.compressImage(imageInput.files[0], 800, 0.8);
            }
            
            const userIds = this.state.users.map(u => u.telegramId);
            const results = await TelegramBot.broadcast(userIds, message, photo);
            
            Utils.showToast(`Broadcast sent: ${results.success} success, ${results.failed} failed`, 'success');
            
            document.getElementById('broadcast-message').value = '';
            document.getElementById('broadcast-image-preview').classList.add('hidden');
            
        } catch (error) {
            console.error('Broadcast error:', error);
            Utils.showToast('Broadcast failed', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Banned Users =====
    renderBannedUsers() {
        const list = document.getElementById('admin-banned-list');
        
        if (this.state.bannedUsers.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;grid-column:1/-1;">No banned users</p>';
            return;
        }
        
        list.innerHTML = this.state.bannedUsers.map(user => `
            <div class="admin-card">
                <div class="admin-card-header">
                    <div class="admin-card-icon" style="background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;border-radius:50%;">
                        <i class="fas fa-user-slash" style="color:var(--danger);font-size:1.25rem;"></i>
                    </div>
                    <div class="admin-card-info">
                        <h4>${user.firstName || 'User'}</h4>
                        <p>@${user.username || 'N/A'} • ${user.telegramId}</p>
                    </div>
                </div>
                <div style="padding:0.5rem 0;">
                    <p><strong>Reason:</strong> ${user.reason}</p>
                    <p style="font-size:0.8rem;color:var(--text-secondary);">Banned: ${Utils.formatDate(user.bannedAt, 'long')}</p>
                </div>
                <div class="admin-card-actions">
                    <button class="action-btn approve" onclick="AdminApp.unbanUser('${user.telegramId}')">
                        <i class="fas fa-check"></i> Unban
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Unban user
    async unbanUser(telegramId) {
        const confirmed = confirm('Unban this user?');
        if (!confirmed) return;
        
        Utils.showLoading('Unbanning user...');
        try {
            await Database.unbanUser(telegramId);
            await TelegramBot.notifyUnban(telegramId);
            await this.loadAdminData();
            this.renderBannedUsers();
            Utils.showToast('User unbanned', 'success');
        } catch (error) {
            console.error('Unban user error:', error);
            Utils.showToast('Failed to unban user', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Settings =====
    renderSettings() {
        document.getElementById('website-name').value = this.state.settings.websiteName || '';
        
        if (this.state.settings.websiteLogo) {
            document.getElementById('current-logo').src = this.state.settings.websiteLogo;
            document.getElementById('logo-preview').classList.remove('hidden');
        }
    },
    
    // Save settings
    async saveSettings() {
        const websiteName = document.getElementById('website-name').value.trim();
        const logoInput = document.getElementById('website-logo');
        
        Utils.showLoading('Saving settings...');
        
        try {
            const updates = { ...this.state.settings };
            
            if (websiteName) {
                updates.websiteName = websiteName;
            }
            
            if (logoInput.files[0]) {
                updates.websiteLogo = await Utils.compressImage(logoInput.files[0], 200, 0.9);
            }
            
            await Database.updateSettings(updates);
            this.state.settings = updates;
            
            Utils.showToast('Settings saved', 'success');
        } catch (error) {
            console.error('Save settings error:', error);
            Utils.showToast('Failed to save settings', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== Database IDs =====
    renderDatabaseIds() {
        document.getElementById('main-bin-id').textContent = CONFIG.BINS.MAIN || 'Not configured';
        document.getElementById('users-bin-id').textContent = CONFIG.BINS.USERS || 'Not configured';
        document.getElementById('products-bin-id').textContent = CONFIG.BINS.PRODUCTS || 'Not configured';
        document.getElementById('categories-bin-id').textContent = CONFIG.BINS.CATEGORIES || 'Not configured';
        document.getElementById('orders-bin-id').textContent = CONFIG.BINS.ORDERS || 'Not configured';
        document.getElementById('settings-bin-id').textContent = CONFIG.BINS.MAIN || 'Not configured';
        document.getElementById('images-bin-id').textContent = CONFIG.BINS.IMAGES || 'Not configured';
    }
};

// ===== Global Functions =====

function showAdminPage(page) {
    AdminApp.showAdminPage(page);
}

function verifyAdmin() {
    AdminApp.verifyAdmin();
}

function filterOrders(filter) {
    document.querySelectorAll('#admin-page-orders .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    AdminApp.renderOrders(filter);
}

function filterTopups(filter) {
    document.querySelectorAll('#admin-page-topups .filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    AdminApp.renderTopups(filter);
}

function filterProductsByCategory() {
    AdminApp.renderProducts();
}

function showBannerType(type) {
    AdminApp.renderBannerType(type);
}

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

// File upload triggers
function triggerCategoryIconUpload() {
    document.getElementById('category-icon').click();
}

function triggerProductIconUpload() {
    document.getElementById('product-icon').click();
}

function triggerBannerUpload() {
    document.getElementById('banner-image').click();
}

function triggerPaymentIconUpload() {
    document.getElementById('payment-icon').click();
}

function triggerLogoUpload() {
    document.getElementById('website-logo').click();
}

function triggerBroadcastImageUpload() {
    document.getElementById('broadcast-image').click();
}

// File input change handlers
document.addEventListener('DOMContentLoaded', () => {
    // Category icon preview
    document.getElementById('category-icon')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const preview = document.getElementById('category-icon-preview');
            const img = await Utils.compressImage(e.target.files[0], 200, 0.8);
            preview.innerHTML = `<img src="${img}" alt="Preview">`;
            preview.classList.remove('hidden');
        }
    });
    
    // Product icon preview
    document.getElementById('product-icon')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const preview = document.getElementById('product-icon-preview');
            const img = await Utils.compressImage(e.target.files[0], 200, 0.8);
            preview.innerHTML = `<img src="${img}" alt="Preview">`;
            preview.classList.remove('hidden');
        }
    });
    
    // Banner image preview
    document.getElementById('banner-image')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const preview = document.getElementById('banner-image-preview');
            const img = await Utils.compressImage(e.target.files[0], 800, 0.8);
            preview.innerHTML = `<img src="${img}" alt="Preview" style="max-width:100%;border-radius:12px;">`;
            preview.classList.remove('hidden');
        }
    });
    
    // Payment icon preview
    document.getElementById('payment-icon')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const preview = document.getElementById('payment-icon-preview');
            const img = await Utils.compressImage(e.target.files[0], 200, 0.8);
            preview.innerHTML = `<img src="${img}" alt="Preview">`;
            preview.classList.remove('hidden');
        }
    });
    
    // Logo preview
    document.getElementById('website-logo')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const img = await Utils.compressImage(e.target.files[0], 200, 0.9);
            document.getElementById('current-logo').src = img;
            document.getElementById('logo-preview').classList.remove('hidden');
        }
    });
    
    // Broadcast image preview
    document.getElementById('broadcast-image')?.addEventListener('change', async (e) => {
        if (e.target.files[0]) {
            const preview = document.getElementById('broadcast-image-preview');
            const img = await Utils.compressImage(e.target.files[0], 800, 0.8);
            preview.innerHTML = `<img src="${img}" alt="Preview" style="max-width:100%;border-radius:12px;">`;
            preview.classList.remove('hidden');
        }
    });
    
    // Enter key for password
    document.getElementById('admin-password')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyAdmin();
        }
    });
    
    // Initialize admin app
    AdminApp.init();
});
