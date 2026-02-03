// ===== Main Application =====

const App = {
    // App state
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
        isLoading: false
        customEmojis: []
    },
    
    // Initialize app
    async init() {
        try {
            console.log('🚀 Initializing App...');
            
            // Check if running in Telegram
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied();
                return;
            }
            
            // Initialize Telegram WebApp
            const telegramUser = await TelegramApp.init();
            console.log('✅ Telegram user:', telegramUser);
            
            // Show intro screen
            await this.showIntro();
            
            // Check if user is banned
            const isBanned = await Database.isUserBanned(telegramUser.id);
            if (isBanned) {
                this.showBannedScreen();
                return;
            }
            
            // Create or update user in database
            this.state.user = await Database.createUser({
                telegramId: telegramUser.id,
                username: telegramUser.username,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                photoUrl: telegramUser.photo_url,
                isPremium: telegramUser.is_premium
            });
            
            console.log('✅ User loaded:', this.state.user);
            
            // Load app data
            await this.loadAppData();
            
            // Setup UI
            this.setupUI();
            
            // Hide intro and show main app
            this.hideIntro();
            
            // Signal ready
            TelegramApp.ready();
            
            console.log('✅ App initialized successfully!');
            
        } catch (error) {
            console.error('❌ App initialization error:', error);
            this.showAccessDenied();
        }
    },
    
    // Show access denied screen
    showAccessDenied() {
        document.getElementById('intro-screen').classList.add('hidden');
        document.getElementById('access-denied').classList.remove('hidden');
    },
    
    // Show banned screen
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
    
    // Show intro animation
    showIntro() {
        return new Promise(async (resolve) => {
            const introScreen = document.getElementById('intro-screen');
            const introLogo = document.getElementById('intro-logo');
            const particles = document.getElementById('particles');
            
            // Load settings for logo
            try {
                const settings = await Database.getSettings();
                this.state.settings = settings;
                if (settings.websiteLogo) {
                    introLogo.src = settings.websiteLogo;
                } else {
                    introLogo.src = this.getDefaultLogo();
                }
            } catch (e) {
                introLogo.src = this.getDefaultLogo();
            }
            
            // Create particles
            Utils.createParticles(particles, 30);
            
            // Wait for intro duration
            setTimeout(resolve, CONFIG.INTRO_DURATION);
        });
    },
    
    getDefaultLogo() {
        return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="#8b5cf6" width="150" height="150" rx="30"/><text x="75" y="85" text-anchor="middle" fill="white" font-size="40" font-weight="bold">GS</text></svg>');
    },
    
    // Hide intro
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
    
    // Load app data
    async loadAppData() {
        try {
            console.log('📥 Loading app data...');
            
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
            
            // Load user orders and topups
            if (this.state.user) {
                const [orders, topups] = await Promise.all([
                    Database.getOrdersByUser(this.state.user.telegramId),
                    Database.getTopupsByUser(this.state.user.telegramId)
                ]);
                this.state.orders = orders;
                this.state.topups = topups;
            }
            
            console.log('✅ App data loaded');
            
        } catch (error) {
            console.error('❌ Load app data error:', error);
        }
    },
    
    // Setup UI
    setupUI() {
        this.updateHeader();
        this.updateUserInfo();
        this.loadBanners();
        this.loadAnnouncement();
        this.loadCategories();
        this.setupEventListeners();
        
        // Show admin access if admin
        if (TelegramApp.isAdmin()) {
            document.getElementById('admin-access').classList.remove('hidden');
        }
    },
    
    // Update header
    updateHeader() {
        const appLogo = document.getElementById('app-logo');
        const appName = document.getElementById('app-name');
        const userBalance = document.getElementById('user-balance');
        
        if (this.state.settings) {
            if (this.state.settings.websiteLogo) {
                appLogo.src = this.state.settings.websiteLogo;
            }
            if (this.state.settings.websiteName) {
                appName.textContent = this.state.settings.websiteName;
            }
        }
        
        if (this.state.user) {
            userBalance.textContent = this.formatNumber(this.state.user.balance || 0);
        }
    },
    
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },
    
    // Update user info
    updateUserInfo() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (this.state.user) {
            const name = this.state.user.firstName + ' ' + (this.state.user.lastName || '');
            userName.textContent = name.trim() || 'User';
            
            if (this.state.user.photoUrl) {
                userAvatar.src = this.state.user.photoUrl;
            } else {
                userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.state.user.firstName || 'U')}&background=8b5cf6&color=fff`;
            }
        }
    },
    
    // Load banners
    loadBanners() {
        const bannerTrack = document.getElementById('banner-track');
        const bannerDots = document.getElementById('banner-dots');
        
        if (!this.state.banners || this.state.banners.length === 0) {
            bannerTrack.innerHTML = `
                <div class="banner-slide">
                    <div style="width:100%;height:100%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;border-radius:20px;">
                        <h2 style="color:white;">Welcome to Game Shop!</h2>
                    </div>
                </div>
            `;
            return;
        }
        
        // Create banner slides
        bannerTrack.innerHTML = this.state.banners.map((banner, index) => `
            <div class="banner-slide">
                <img src="${banner.image}" alt="Banner ${index + 1}">
            </div>
        `).join('');
        
        // Create dots
        bannerDots.innerHTML = this.state.banners.map((_, index) => `
            <div class="banner-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('');
        
        // Setup banner slider
        if (this.state.banners.length > 1) {
            this.setupBannerSlider();
        }
    },
    
    // Setup banner slider
    setupBannerSlider() {
        let currentIndex = 0;
        const bannerTrack = document.getElementById('banner-track');
        const dots = document.querySelectorAll('.banner-dot');
        const totalBanners = this.state.banners.length;
        
        const updateSlider = (index) => {
            bannerTrack.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };
        
        // Auto slide
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalBanners;
            updateSlider(currentIndex);
        }, CONFIG.BANNER_INTERVAL);
        
        // Dot click
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                updateSlider(currentIndex);
            });
        });
    },
    
    // Load announcement
    loadAnnouncement() {
    const announcementText = document.getElementById('announcement-text');
    
    if (this.state.settings && this.state.settings.announcement) {
        announcementText.innerHTML = renderCustomEmojis(this.state.settings.announcement);
    } else {
        announcementText.textContent = 'Welcome to Game Top-Up Shop! Best prices guaranteed!';
    }
},
    
    // Load categories
    loadCategories() {
        const categoriesGrid = document.getElementById('categories-grid');
        
        if (!this.state.categories || this.state.categories.length === 0) {
            categoriesGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-gamepad" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No categories available yet</p>
                </div>
            `;
            return;
        }
        
        categoriesGrid.innerHTML = this.state.categories.map((category, index) => `
            <div class="category-card stagger-item" onclick="App.openCategory('${category.id}')" style="animation-delay: ${index * 0.05}s">
                ${category.flag ? `<span class="category-flag">${category.flag}</span>` : ''}
                ${category.hasDiscount ? `<span class="category-discount"><i class="fas fa-percent"></i> Sale</span>` : ''}
                <img src="${category.icon}" alt="${category.name}" class="category-icon">
                <div class="category-name">${renderCustomEmojis(category.name)}</div>
                <div class="category-sold">
                    <i class="fas fa-fire"></i>
                    ${category.totalSold || 0} sold
                </div>
            </div>
        `).join('');
    },
    
    // Open category
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
            this.state.inputTables = inputTables;
            this.state.categoryBanners = categoryBanners;
            this.state.selectedProduct = null;
            this.state.inputValues = {};
            
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
    
    // Render category page
    renderCategoryPage() {
        const categoryTitle = document.getElementById('category-title');
        const inputSection = document.getElementById('input-section');
        const productsGrid = document.getElementById('products-grid');
        const categoryInfoSection = document.getElementById('category-info-section');
        
        categoryTitle.textContent = this.state.currentCategory.name;
        
        // Render input tables
        if (this.state.inputTables && this.state.inputTables.length > 0) {
            inputSection.innerHTML = this.state.inputTables.map(table => `
                <div class="input-group">
                    <label>${table.name}</label>
                    <input type="text" 
                           id="input-${table.id}" 
                           placeholder="${table.placeholder}"
                           onchange="App.updateInputValue('${table.id}', '${table.name}', this.value)">
                </div>
            `).join('');
            inputSection.classList.remove('hidden');
        } else {
            inputSection.innerHTML = '';
            inputSection.classList.add('hidden');
        }
        
        // Render products
        if (this.state.products && this.state.products.length > 0) {
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
                        ${product.deliveryTime === 'instant' ? 'Instant' : product.deliveryTime}
                    </div>
                </div>
            `).join('');
        } else {
            productsGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="color: var(--text-secondary);">No products available</p>
                </div>
            `;
        }
        
        // Render category info
        if (this.state.categoryBanners && this.state.categoryBanners.length > 0) {
            const banner = this.state.categoryBanners[0];
            categoryInfoSection.innerHTML = `
                <img src="${banner.image}" alt="Banner" class="category-banner">
                ${banner.description ? `
                    <div class="category-description">
                        <h3><i class="fas fa-info-circle"></i> Information</h3>
                        <p>${banner.description}</p>
                    </div>
                ` : ''}
            `;
            categoryInfoSection.classList.remove('hidden');
        } else {
            categoryInfoSection.classList.add('hidden');
        }
        
        // Add buy button container
        this.updateBuyButton();
    },
    
    // Update input value
    updateInputValue(tableId, tableName, value) {
        this.state.inputValues[tableName] = value;
    },
    
    // Select product
    selectProduct(productId) {
        TelegramApp.hapticFeedback('selection');
        
        const product = this.state.products.find(p => p.id === productId);
        this.state.selectedProduct = product;
        
        // Update UI
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.productId === productId) {
                card.classList.add('selected');
            }
        });
        
        this.updateBuyButton();
    },
    
    // Update buy button
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
    
    // Open buy modal
    openBuyModal() {
        // Validate input values
        if (this.state.inputTables && this.state.inputTables.length > 0) {
            for (const table of this.state.inputTables) {
                if (!this.state.inputValues[table.name] || this.state.inputValues[table.name].trim() === '') {
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
        
        const modal = document.getElementById('buy-modal');
        const productSummary = document.getElementById('product-summary');
        const inputSummary = document.getElementById('input-summary');
        const modalPrice = document.getElementById('modal-price');
        const modalBalance = document.getElementById('modal-balance');
        const modalRemaining = document.getElementById('modal-remaining');
        
        const product = this.state.selectedProduct;
        const price = product.discountedPrice || product.price;
        const balance = this.state.user.balance || 0;
        const remaining = balance - price;
        
        productSummary.innerHTML = `
            <div class="product-summary-card">
                <img src="${product.icon}" alt="${product.name}">
                <div>
                    <h4>${product.name}</h4>
                    <p>${this.state.currentCategory.name}</p>
                </div>
            </div>
        `;
        
        if (Object.keys(this.state.inputValues).length > 0) {
            inputSummary.innerHTML = Object.entries(this.state.inputValues).map(([key, value]) => `
                <div class="input-summary-item">
                    <span>${key}:</span>
                    <strong>${value}</strong>
                </div>
            `).join('');
        } else {
            inputSummary.innerHTML = '';
        }
        
        modalPrice.textContent = Utils.formatCurrency(price, product.currency);
        modalBalance.textContent = Utils.formatCurrency(balance, 'MMK');
        modalRemaining.textContent = Utils.formatCurrency(remaining, 'MMK');
        modalRemaining.style.color = remaining >= 0 ? 'var(--success)' : 'var(--danger)';
        
        modal.classList.remove('hidden');
    },
    
    // Close buy modal
    closeBuyModal() {
        document.getElementById('buy-modal').classList.add('hidden');
        document.getElementById('verification-code').value = '';
    },
    
    // Confirm purchase
    async confirmPurchase() {
        const product = this.state.selectedProduct;
        const price = product.discountedPrice || product.price;
        
        // Check balance
        if ((this.state.user.balance || 0) < price) {
            TelegramApp.hapticFeedback('notification', 'error');
            
            // Increment failed attempts
            const attempts = await Database.incrementFailedAttempts(this.state.user.telegramId);
            
            if (attempts >= CONFIG.MAX_FAILED_PURCHASE_ATTEMPTS) {
                // Ban user
                await Database.banUser({
                    telegramId: this.state.user.telegramId,
                    username: this.state.user.username,
                    firstName: this.state.user.firstName
                }, 'Exceeded maximum failed purchase attempts');
                
                await TelegramBot.notifyBan(this.state.user.telegramId, 'Exceeded maximum failed purchase attempts');
                
                this.showBannedScreen();
                return;
            }
            
            Utils.showToast(`Insufficient balance! (${CONFIG.MAX_FAILED_PURCHASE_ATTEMPTS - attempts} attempts remaining)`, 'error');
            return;
        }
        
        Utils.showLoading('Processing order...');
        TelegramApp.hapticFeedback('impact', 'heavy');
        
        try {
            // Deduct balance
            await Database.updateUserBalance(this.state.user.telegramId, price, 'subtract');
            
            // Create order
            const order = await Database.createOrder({
                userId: this.state.user.id,
                telegramId: this.state.user.telegramId,
                productId: product.id,
                productName: product.name,
                categoryId: this.state.currentCategory.id,
                categoryName: this.state.currentCategory.name,
                amount: price,
                currency: product.currency,
                inputValues: this.state.inputValues
            });
            
            // Notify admin
            await TelegramBot.notifyNewOrder(order, this.state.user);
            
            // Update local user state
            this.state.user.balance -= price;
            this.state.orders.unshift(order);
            
            this.updateHeader();
            
            // Close modal and show success
            this.closeBuyModal();
            Utils.showToast('Order placed successfully!', 'success');
            
            // Reset selection
            this.state.selectedProduct = null;
            this.state.inputValues = {};
            this.renderCategoryPage();
            
        } catch (error) {
            console.error('Purchase error:', error);
            Utils.showToast('Failed to process order', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Send OTP
    async sendOTP() {
        Utils.showLoading('Sending OTP...');
        
        try {
            const otp = TelegramBot.generateOTP();
            await TelegramBot.sendOTP(this.state.user.telegramId, otp);
            
            // Store OTP temporarily
            this.state.currentOTP = otp;
            this.state.otpExpiry = Date.now() + 5 * 60 * 1000;
            
            Utils.showToast('OTP sent to your Telegram!', 'success');
        } catch (error) {
            console.error('Send OTP error:', error);
            Utils.showToast('Failed to send OTP', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // ===== PAGE NAVIGATION =====
    
    showPage(page) {
        this.state.currentPage = page;
        
        // Hide all pages
        document.querySelectorAll('.page, .main-app').forEach(p => {
            p.classList.add('hidden');
        });
        
        // Show target page
        if (page === 'home') {
            document.getElementById('main-app').classList.remove('hidden');
            TelegramApp.hideBackButton();
            this.loadCategories(); // Refresh categories
        } else {
            const pageElement = document.getElementById(`${page}-page`);
            if (pageElement) {
                pageElement.classList.remove('hidden');
            }
            TelegramApp.showBackButton();
        }
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Render page content
        switch (page) {
            case 'orders':
                this.renderOrdersPage();
                break;
            case 'history':
                this.renderHistoryPage();
                break;
            case 'profile':
                this.renderProfilePage();
                break;
        }
    },
    
    // Go back
    goBack() {
        if (this.state.currentPage === 'category') {
            this.showPage('home');
        } else {
            this.showPage('home');
        }
    },
    
    // ===== ORDERS PAGE =====
    
    async renderOrdersPage() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;
        
        Utils.showLoading('Loading orders...');
        
        try {
            // Refresh orders from database
            this.state.orders = await Database.getOrdersByUser(this.state.user.telegramId);
            
            if (this.state.orders.length === 0) {
                ordersList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shopping-bag"></i>
                        <p>No orders yet</p>
                        <small>Your orders will appear here</small>
                    </div>
                `;
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
                        ${order.inputValues && Object.keys(order.inputValues).length > 0 ? `
                            <div class="order-inputs">
                                ${Object.entries(order.inputValues).map(([k, v]) => `
                                    <span class="input-tag">${k}: ${v}</span>
                                `).join('')}
                            </div>
                        ` : ''}
                        <div class="order-footer">
                            <span class="order-date">
                                <i class="fas fa-clock"></i>
                                ${Utils.formatDate(order.createdAt)}
                            </span>
                            <span class="order-price">${Utils.formatCurrency(order.amount, order.currency)}</span>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Render orders error:', error);
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load orders</p>
                </div>
            `;
        } finally {
            Utils.hideLoading();
        }
    },
    
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Pending';
            case 'approved': return 'Completed';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    },
    
    // ===== HISTORY PAGE =====
    
    async renderHistoryPage(filter = 'all') {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        
        Utils.showLoading('Loading history...');
        
        try {
            // Refresh data
            const [orders, topups] = await Promise.all([
                Database.getOrdersByUser(this.state.user.telegramId),
                Database.getTopupsByUser(this.state.user.telegramId)
            ]);
            
            this.state.orders = orders;
            this.state.topups = topups;
            
            // Build history items
            let historyItems = [];
            
            // Add approved topups
            if (filter === 'all' || filter === 'topup') {
                const approvedTopups = this.state.topups.filter(t => t.status === 'approved');
                approvedTopups.forEach(topup => {
                    historyItems.push({
                        type: 'topup',
                        amount: topup.amount,
                        description: `Top-up via ${topup.paymentMethod}`,
                        date: topup.processedAt || topup.createdAt,
                        status: 'approved'
                    });
                });
            }
            
            // Add approved/rejected orders
            if (filter === 'all' || filter === 'purchase') {
                const processedOrders = this.state.orders.filter(o => o.status !== 'pending');
                processedOrders.forEach(order => {
                    historyItems.push({
                        type: 'purchase',
                        amount: order.amount,
                        description: order.productName,
                        date: order.processedAt || order.createdAt,
                        status: order.status,
                        refunded: order.status === 'rejected'
                    });
                });
            }
            
            // Sort by date
            historyItems.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (historyItems.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No transaction history</p>
                        <small>Your transactions will appear here</small>
                    </div>
                `;
            } else {
                historyList.innerHTML = historyItems.map(item => `
                    <div class="history-item">
                        <div class="history-icon ${item.type}">
                            <i class="fas fa-${item.type === 'topup' ? 'plus' : (item.refunded ? 'undo' : 'shopping-cart')}"></i>
                        </div>
                        <div class="history-info">
                            <h4>${item.description}</h4>
                            <p>${item.type === 'topup' ? 'Balance Top-up' : (item.refunded ? 'Order Refunded' : 'Purchase')}</p>
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
            console.error('Render history error:', error);
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load history</p>
                </div>
            `;
        } finally {
            Utils.hideLoading();
        }
    },
    
    showHistoryTab(filter) {
        // Update tab buttons
        document.querySelectorAll('.history-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderHistoryPage(filter);
    },
    
    // ===== PROFILE PAGE =====
    
    async renderProfilePage() {
        // Refresh user data
        try {
            const freshUser = await Database.getUserByTelegramId(this.state.user.telegramId);
            if (freshUser) {
                this.state.user = freshUser;
            }
        } catch (e) {
            console.warn('Could not refresh user data');
        }
        
        const user = this.state.user;
        
        // Update profile elements
        const profileAvatar = document.getElementById('profile-avatar');
        const profileName = document.getElementById('profile-name');
        const profileId = document.getElementById('profile-id');
        const premiumBadge = document.getElementById('premium-badge');
        const totalOrders = document.getElementById('total-orders');
        const approvedOrders = document.getElementById('approved-orders');
        const totalSpent = document.getElementById('total-spent');
        
        // Avatar
        if (profileAvatar) {
            if (user.photoUrl) {
                profileAvatar.src = user.photoUrl;
            } else {
                profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || 'U')}&background=8b5cf6&color=fff&size=150`;
            }
        }
        
        // Name
        if (profileName) {
            profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        }
        
        // Username/ID
        if (profileId) {
            profileId.textContent = user.username ? `@${user.username}` : `ID: ${user.telegramId}`;
        }
        
        // Premium badge
        if (premiumBadge) {
            if (user.isPremium) {
                premiumBadge.classList.remove('hidden');
            } else {
                premiumBadge.classList.add('hidden');
            }
        }
        
        // Stats
        if (totalOrders) {
            totalOrders.textContent = user.totalOrders || 0;
        }
        if (approvedOrders) {
            approvedOrders.textContent = user.approvedOrders || 0;
        }
        if (totalSpent) {
            totalSpent.textContent = this.formatNumber(user.totalSpent || 0);
        }
        
        // Update theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            themeToggle.classList.toggle('active', currentTheme === 'dark');
        }
    },
    
    // ===== NOTIFICATIONS =====
    
    showNotificationSettings() {
        TelegramApp.showAlert('Notifications are enabled by default. You will receive updates about your orders via Telegram.');
    },
    
    // ===== SUPPORT =====
    
    showSupport() {
        const supportUsername = CONFIG.ADMIN_USERNAME || 'OPPER101';
        TelegramApp.openTelegramLink(`https://t.me/${supportUsername}`);
    },
    
    // ===== SETUP EVENT LISTENERS =====
    
    setupEventListeners() {
        // Back button
        window.onBackButtonClick = () => {
            this.goBack();
        };
        
        // Theme toggle
        const savedTheme = Utils.storage.get('theme', CONFIG.DEFAULT_THEME);
        document.documentElement.setAttribute('data-theme', savedTheme);
    },
    
    // Refresh user data
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

function showPage(page) {
    App.showPage(page);
}

function goBack() {
    App.goBack();
}

function openTopupModal() {
    openTopupModalHandler();
}

function closeTopupModal() {
    document.getElementById('topup-modal').classList.add('hidden');
}

function setAmount(amount) {
    document.getElementById('topup-amount').value = amount;
    document.querySelectorAll('.quick-amounts button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

async function openTopupModalHandler() {
    const modal = document.getElementById('topup-modal');
    const paymentMethods = document.getElementById('payment-methods');
    
    // Load payment methods
    const payments = await Database.getPaymentMethods();
    App.state.payments = payments;
    
    if (payments.length === 0) {
        paymentMethods.innerHTML = `
            <p style="text-align:center; color: var(--text-secondary);">No payment methods available</p>
        `;
    } else {
        paymentMethods.innerHTML = `
            <h4>Select Payment Method</h4>
            ${payments.map(payment => `
                <div class="payment-method-item" onclick="selectPayment('${payment.id}')">
                    <img src="${payment.icon}" alt="${payment.name}" class="payment-icon">
                    <span class="payment-name">${payment.name}</span>
                    <i class="fas fa-chevron-right"></i>
                </div>
            `).join('')}
        `;
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
        <div class="payment-detail-card">
            <img src="${payment.icon}" alt="${payment.name}" style="width:60px;height:60px;border-radius:12px;">
            <h4>${payment.name}</h4>
        </div>
        <div class="payment-detail-item">
            <span>Amount to Pay:</span>
            <strong>${Utils.formatCurrency(App.state.topupAmount, 'MMK')}</strong>
        </div>
        <div class="payment-detail-item">
            <span>Account Number:</span>
            <strong>${payment.address}</strong>
            <button onclick="Utils.copyToClipboard('${payment.address}')" style="margin-left:8px;background:var(--gradient-glow);border:none;padding:5px 10px;border-radius:8px;cursor:pointer;">
                <i class="fas fa-copy"></i>
            </button>
        </div>
        <div class="payment-detail-item">
            <span>Account Name:</span>
            <strong>${payment.accountName}</strong>
        </div>
        ${payment.note ? `
            <div class="payment-note">
                <i class="fas fa-info-circle"></i>
                <span>${payment.note}</span>
            </div>
        ` : ''}
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

function triggerUpload() {
    document.getElementById('payment-proof').click();
}

async function handleProofUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        Utils.showToast('Please select an image file', 'warning');
        return;
    }
    
    Utils.showLoading('Uploading image...');
    
    try {
        // Upload to ImgBB (free image hosting - no size limit)
        const formData = new FormData();
        formData.append('image', file);
        
        const IMGBB_API_KEY = 'd3b0e9fd43ff0eb762987129a2f21e9c';
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Save image URL (not base64)
            App.state.proofImage = result.data.url;
            
            // Show preview
            document.getElementById('proof-image').src = result.data.url;
            document.getElementById('proof-preview').classList.remove('hidden');
            document.getElementById('upload-area').classList.add('hidden');
            document.getElementById('submit-topup-btn').disabled = false;
            
            console.log('✅ Image uploaded successfully:', result.data.url);
        } else {
            throw new Error(result.error?.message || 'Upload failed');
        }
        
    } catch (error) {
        console.error('Image upload error:', error);
        Utils.showToast('Failed to upload image. Please try again.', 'error');
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
        
        // Notify admin
        await TelegramBot.notifyNewTopup(topup, App.state.user);
        
        // Add to local state
        App.state.topups.unshift(topup);
        
        closePaymentDetails();
        Utils.showToast('Top-up request submitted!', 'success');
        
        // Reset
        App.state.proofImage = null;
        App.state.selectedPayment = null;
        App.state.topupAmount = 0;
        
    } catch (error) {
        console.error('Submit topup error:', error);
        Utils.showToast('Failed to submit request', 'error');
    } finally {
        Utils.hideLoading();
    }
}

function closeBuyModal() {
    App.closeBuyModal();
}

function confirmPurchase() {
    App.confirmPurchase();
}

function sendOTP() {
    App.sendOTP();
}

function toggleTheme() {
    const toggle = document.getElementById('theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    if (toggle) {
        toggle.classList.toggle('active');
    }
    Utils.storage.set('theme', newTheme);
    
    TelegramApp.hapticFeedback('impact', 'light');
}

function openAdminPanel() {
    window.location.href = 'admin.html';
}

function shareCategory() {
    if (App.state.currentCategory) {
        const shareText = `Check out ${App.state.currentCategory.name} on our Game Shop!`;
        TelegramApp.shareUrl(`https://t.me/${CONFIG.BOT_USERNAME}`, shareText);
    }
}

function showHistoryTab(filter) {
    App.showHistoryTab(filter);
}

function showNotificationSettings() {
    App.showNotificationSettings();
}

function showSupport() {
    App.showSupport();
}

// ===== Custom Emoji Renderer =====

function renderCustomEmojis(text) {
    if (!text || !App.state.customEmojis || App.state.customEmojis.length === 0) {
        return text;
    }
    
    let result = text;
    
    App.state.customEmojis.forEach(emoji => {
        // Escape special regex characters in trigger
        const escapedTrigger = emoji.trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTrigger, 'g');
        const replacement = `<img class="custom-emoji" src="${emoji.imageUrl}" alt="${emoji.name || 'emoji'}">`;
        result = result.replace(regex, replacement);
    });
    
    return result;
}

window.renderCustomEmojis = renderCustomEmojis;

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
