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
        isLoading: false
    },
    
    // Initialize app
    async init() {
        try {
            // Check if running in Telegram
            if (!TelegramApp.isInTelegram()) {
                this.showAccessDenied();
                return;
            }
            
            // Initialize Telegram WebApp
            const telegramUser = await TelegramApp.init();
            
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
            
            // Load app data
            await this.loadAppData();
            
            // Setup UI
            this.setupUI();
            
            // Hide intro and show main app
            this.hideIntro();
            
            // Signal ready
            TelegramApp.ready();
            
        } catch (error) {
            console.error('App initialization error:', error);
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
                if (settings.websiteLogo) {
                    introLogo.src = settings.websiteLogo;
                } else {
                    introLogo.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="#8b5cf6" width="150" height="150" rx="30"/><text x="75" y="85" text-anchor="middle" fill="white" font-size="40" font-weight="bold">GS</text></svg>');
                }
            } catch (e) {
                introLogo.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150"><rect fill="#8b5cf6" width="150" height="150" rx="30"/><text x="75" y="85" text-anchor="middle" fill="white" font-size="40" font-weight="bold">GS</text></svg>');
            }
            
            // Create particles
            Utils.createParticles(particles, 30);
            
            // Wait for intro duration
            setTimeout(resolve, CONFIG.INTRO_DURATION);
        });
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
            const [settings, categories, banners, payments] = await Promise.all([
                Database.getSettings(),
                Database.getCategories(),
                Database.getHomeBanners(),
                Database.getPaymentMethods()
            ]);
            
            this.state.settings = settings;
            this.state.categories = categories;
            this.state.banners = banners;
            this.state.payments = payments;
            
        } catch (error) {
            console.error('Load app data error:', error);
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
            userBalance.textContent = Utils.formatCurrency(this.state.user.balance, '').replace(' ', '');
        }
    },
    
    // Update user info
    updateUserInfo() {
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (this.state.user) {
            userName.textContent = this.state.user.firstName + ' ' + (this.state.user.lastName || '');
            
            if (this.state.user.photoUrl) {
                userAvatar.src = this.state.user.photoUrl;
            } else {
                userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.state.user.firstName)}&background=8b5cf6&color=fff`;
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
            announcementText.textContent = this.state.settings.announcement;
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
                <div class="category-name">${category.name}</div>
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
                           onchange="App.updateInputValue('${table.id}', this.value)">
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
                     onclick="App.selectProduct('${product.id}')">
                    ${product.discount > 0 ? `<span class="product-discount-badge">-${product.discount}%</span>` : ''}
                    <img src="${product.icon}" alt="${product.name}" class="product-icon">
                    <div class="product-name">${product.name}</div>
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
    updateInputValue(tableId, value) {
        const table = this.state.inputTables.find(t => t.id === tableId);
        if (table) {
            this.state.inputValues[table.name] = value;
        }
    },
    
    // Select product
    selectProduct(productId) {
        TelegramApp.hapticFeedback('selection');
        
        const product = this.state.products.find(p => p.id === productId);
        this.state.selectedProduct = product;
        
        // Update UI
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
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
        const balance = this.state.user.balance;
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
        
        inputSummary.innerHTML = Object.entries(this.state.inputValues).map(([key, value]) => `
            <div class="input-summary-item">
                <span>${key}:</span>
                <strong>${value}</strong>
            </div>
        `).join('');
        
        modalPrice.textContent = Utils.formatCurrency(price, product.currency);
        modalBalance.textContent = Utils.formatCurrency(balance, 'MMK');
        modalRemaining.textContent = Utils.formatCurrency(remaining, 'MMK');
        modalRemaining.style.color = remaining >= 0 ? 'var(--success)' : 'var(--danger)';
        
        modal.classList.remove('hidden');
    },
    
    // Close buy modal
    closeBuyModal() {
        document.getElementById('buy-modal').classList.add('hidden');
    },
    
    // Confirm purchase
    async confirmPurchase() {
        const verificationCode = document.getElementById('verification-code').value;
        
        if (!verificationCode) {
            Utils.showToast('Please enter verification code', 'warning');
            return;
        }
        
        const product = this.state.selectedProduct;
        const price = product.discountedPrice || product.price;
        
        // Check balance
        if (this.state.user.balance < price) {
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
            
            // Store OTP temporarily (in production, store server-side)
            this.state.currentOTP = otp;
            this.state.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
            
            Utils.showToast('OTP sent to your Telegram!', 'success');
        } catch (error) {
            console.error('Send OTP error:', error);
            Utils.showToast('Failed to send OTP', 'error');
        } finally {
            Utils.hideLoading();
        }
    },
    
    // Show page
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
        } else {
            document.getElementById(`${page}-page`).classList.remove('hidden');
            TelegramApp.showBackButton();
        }
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNav = document.querySelector(`.nav-item[onclick="showPage('${page}')"]`);
        if (activeNav) {
            activeNav.classList.add('active');
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
    
    // Setup event listeners
    setupEventListeners() {
        // Back button
        window.onBackButtonClick = () => {
            this.goBack();
        };
        
        // Theme toggle
        const savedTheme = Utils.storage.get('theme', CONFIG.DEFAULT_THEME);
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        if (savedTheme === 'dark') {
            document.getElementById('theme-toggle')?.classList.add('active');
        }
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
    
    App.state.payments = payments;
    modal.classList.remove('hidden');
}

function selectPayment(paymentId) {
    const payment = App.state.payments.find(p => p.id === paymentId);
    App.state.selectedPayment = payment;
    
    // Show payment details modal
    closeTopupModal();
    openPaymentDetails(payment);
}

function openPaymentDetails(payment) {
    const amount = document.getElementById('topup-amount').value;
    
    if (!amount || amount < 1000) {
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
    document.getElementById('submit-topup-btn').disabled = true;
    App.state.proofImage = null;
}

function triggerUpload() {
    document.getElementById('payment-proof').click();
}

async function handleProofUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    Utils.showLoading('Processing image...');
    
    try {
        // Check for NSFW content
        const base64 = await Utils.compressImage(file, 1200, 0.8);
        const isNSFW = await Utils.checkNSFW(base64);
        
        if (isNSFW) {
            // Ban user immediately
            await Database.banUser({
                telegramId: App.state.user.telegramId,
                username: App.state.user.username,
                firstName: App.state.user.firstName
            }, 'Uploaded inappropriate content');
            
            await TelegramBot.notifyBan(App.state.user.telegramId, 'Uploaded inappropriate content');
            
            App.showBannedScreen();
            return;
        }
        
        App.state.proofImage = base64;
        
        // Show preview
        document.getElementById('proof-image').src = base64;
        document.getElementById('proof-preview').classList.remove('hidden');
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('submit-topup-btn').disabled = false;
        
    } catch (error) {
        console.error('Image upload error:', error);
        Utils.showToast('Failed to process image', 'error');
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
    toggle.classList.toggle('active');
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

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
