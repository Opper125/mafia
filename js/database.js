// ===== Database Operations with JSONBin.io =====
// Enhanced for Realtime Polling + G2Bulk Integration
// ★ Data-safe: Never overwrites with empty data

const Database = {
    // Configuration
    baseUrl: 'https://api.jsonbin.io/v3/b',
    apiKey: null,
    bins: null,
    
    // Cache for reducing API calls
    // ★ TTL reduced to 5s for better polling responsiveness
    cache: {
        data: {},
        timestamps: {},
        ttl: 5000 // ★ 5 seconds (was 30s) — faster polling updates
    },

    // ★ Track ongoing requests to prevent duplicate simultaneous fetches
    _pendingReads: {},
    
    // Initialize database
    init() {
        this.apiKey = CONFIG.JSONBIN_API_KEY;
        this.bins = CONFIG.BINS;
        console.log('📦 Database initialized with bins:', Object.keys(this.bins));
    },
    
    // Get headers for API requests
    getHeaders(isUpdate = false) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
        };
        if (isUpdate) {
            headers['X-Bin-Versioning'] = 'false';
        }
        return headers;
    },
    
    // Check if cache is valid
    isCacheValid(key) {
        const timestamp = this.cache.timestamps[key];
        if (!timestamp) return false;
        return (Date.now() - timestamp) < this.cache.ttl;
    },
    
    // Set cache
    setCache(key, data) {
        this.cache.data[key] = JSON.parse(JSON.stringify(data)); // Deep clone
        this.cache.timestamps[key] = Date.now();
    },
    
    // Get from cache
    getCache(key) {
        if (this.isCacheValid(key)) {
            return JSON.parse(JSON.stringify(this.cache.data[key])); // Deep clone
        }
        return null;
    },
    
    // Clear cache for a key
    clearCache(key) {
        delete this.cache.data[key];
        delete this.cache.timestamps[key];
    },
    
    // Clear all cache
    clearAllCache() {
        this.cache.data = {};
        this.cache.timestamps = {};
    },
    
    // ===== Core CRUD Operations =====
    
    // Read data from a bin
    async read(binId, useCache = true) {
        // Check cache first
        if (useCache) {
            const cached = this.getCache(binId);
            if (cached) {
                return cached;
            }
        }

        // ★ Prevent duplicate simultaneous reads for the same bin
        if (this._pendingReads[binId]) {
            try {
                return await this._pendingReads[binId];
            } catch (e) {
                // If pending request failed, continue to make a new one
            }
        }
        
        const readPromise = (async () => {
            try {
                const response = await fetch(`${this.baseUrl}/${binId}/latest`, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ Read error: ${response.status}`, errorText);
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }
                
                const result = await response.json();
                const data = result.record;
                
                // Cache the result
                this.setCache(binId, data);
                
                return data;
                
            } catch (error) {
                console.error(`❌ Read failed for ${binId}:`, error);
                
                // Return cached data if available (even if expired)
                if (this.cache.data[binId]) {
                    console.log(`⚠️ Returning stale cache for ${binId}`);
                    return JSON.parse(JSON.stringify(this.cache.data[binId]));
                }
                
                throw error;
            } finally {
                delete this._pendingReads[binId];
            }
        })();

        this._pendingReads[binId] = readPromise;
        return readPromise;
    },

    // ★ NEW: Force-fresh read (always bypasses cache)
    // Used by polling system and critical balance checks
    async readFresh(binId) {
        this.clearCache(binId);
        return await this.read(binId, false);
    },
    
    // Update data in a bin
    // ★ Enhanced with data-loss protection
    async update(binId, data) {
        try {
            // ★ DATA SAFETY: Validate data before writing
            if (data === null || data === undefined) {
                console.error(`❌ Refusing to write null/undefined to ${binId}`);
                throw new Error('Cannot write null/undefined data');
            }

            // ★ DATA SAFETY: Check for accidental empty array overwrites on user bins
            if (binId === this.bins?.USERS && data?.users && Array.isArray(data.users)) {
                const cachedData = this.cache.data[binId];
                if (cachedData?.users?.length > 0 && data.users.length === 0) {
                    console.error(`❌ SAFETY: Refusing to overwrite ${cachedData.users.length} users with empty array!`);
                    throw new Error('Data safety: Cannot overwrite users with empty array');
                }
            }
            
            const response = await fetch(`${this.baseUrl}/${binId}`, {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Update error: ${response.status}`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            
            // Update cache
            this.setCache(binId, data);
            
            return result.record;
            
        } catch (error) {
            console.error(`❌ Update failed for ${binId}:`, error);
            throw error;
        }
    },
    
    // ===== Settings Operations =====
    
    async getSettings() {
        try {
            const data = await this.read(this.bins.MAIN);
            return data || {
                websiteName: 'Game Top-Up Shop',
                websiteLogo: '',
                announcement: 'Welcome to our Game Top-Up Shop!',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Get settings error:', error);
            return {
                websiteName: 'Game Top-Up Shop',
                websiteLogo: '',
                announcement: 'Welcome to our Game Top-Up Shop!',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    },
    
    async updateSettings(settings) {
        try {
            settings.updatedAt = new Date().toISOString();
            return await this.update(this.bins.MAIN, settings);
        } catch (error) {
            console.error('Update settings error:', error);
            throw error;
        }
    },
    
    // ===== User Operations =====
    
    async getUsers() {
        try {
            const data = await this.read(this.bins.USERS);
            return data?.users || [];
        } catch (error) {
            console.error('Get users error:', error);
            return [];
        }
    },

    // ★ NEW: Fresh users read (for polling)
    async getUsersFresh() {
        try {
            const data = await this.readFresh(this.bins.USERS);
            return data?.users || [];
        } catch (error) {
            console.error('Get users fresh error:', error);
            return [];
        }
    },
    
    async getUserByTelegramId(telegramId) {
        try {
            const users = await this.getUsers();
            return users.find(u => String(u.telegramId) === String(telegramId)) || null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    // ★ NEW: Fresh user read (bypasses cache — for polling & purchase validation)
    async getUserByTelegramIdFresh(telegramId) {
        try {
            const users = await this.getUsersFresh();
            return users.find(u => String(u.telegramId) === String(telegramId)) || null;
        } catch (error) {
            console.error('Get user fresh error:', error);
            return null;
        }
    },
    
    async createUser(userData) {
        try {
            console.log('👤 Creating/updating user:', userData.telegramId);
            
            // Read current data — ALWAYS fresh, never cached
            let data;
            try {
                data = await this.readFresh(this.bins.USERS);
            } catch (e) {
                data = { users: [] };
            }
            
            if (!data || !data.users) {
                data = { users: [] };
            }
            
            const users = data.users;
            const telegramId = String(userData.telegramId);
            
            // Check if user already exists
            const existingIndex = users.findIndex(u => String(u.telegramId) === telegramId);
            
            if (existingIndex !== -1) {
                // ★ Update existing user — PRESERVE balance and all stats
                console.log('👤 Updating existing user (preserving balance & stats)');
                users[existingIndex] = {
                    ...users[existingIndex],
                    username: userData.username || users[existingIndex].username,
                    firstName: userData.firstName || users[existingIndex].firstName,
                    lastName: userData.lastName || users[existingIndex].lastName,
                    photoUrl: userData.photoUrl || users[existingIndex].photoUrl,
                    isPremium: userData.isPremium || users[existingIndex].isPremium,
                    lastActive: new Date().toISOString()
                    // ★ balance, totalOrders, etc. are NOT touched here
                };
            } else {
                // Create new user
                console.log('👤 Creating new user');
                const newUser = {
                    id: this.generateId(),
                    telegramId: telegramId,
                    username: userData.username || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    photoUrl: userData.photoUrl || '',
                    isPremium: userData.isPremium || false,
                    balance: 0,
                    totalOrders: 0,
                    approvedOrders: 0,
                    rejectedOrders: 0,
                    totalSpent: 0,
                    totalTopups: 0,
                    failedPurchaseAttempts: 0,
                    lastFailedAttempt: null,
                    status: 'active',
                    joinedAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                };
                users.push(newUser);
            }
            
            // Save to database
            await this.update(this.bins.USERS, { users });
            
            // Return the user
            return users.find(u => String(u.telegramId) === telegramId);
            
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },
    
    async updateUser(telegramId, updates) {
        try {
            console.log('👤 Updating user:', telegramId, updates);
            
            const data = await this.readFresh(this.bins.USERS);
            const users = data?.users || [];
            
            const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
            if (index === -1) {
                throw new Error('User not found');
            }
            
            users[index] = {
                ...users[index],
                ...updates,
                lastActive: new Date().toISOString()
            };
            
            await this.update(this.bins.USERS, { users });
            return users[index];
            
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },
    
    async updateUserBalance(telegramId, amount, operation = 'add') {
        try {
            console.log(`💰 Updating balance: ${telegramId}, ${operation} ${amount}`);
            
            // ★ ALWAYS fresh read for balance operations
            const data = await this.readFresh(this.bins.USERS);
            const users = data?.users || [];
            
            const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
            if (index === -1) {
                throw new Error('User not found');
            }
            
            const currentBalance = users[index].balance || 0;
            
            if (operation === 'add') {
                users[index].balance = currentBalance + amount;
            } else if (operation === 'subtract') {
                // ★ SAFETY: Prevent negative balance
                if (currentBalance < amount) {
                    console.error(`❌ Balance insufficient: ${currentBalance} < ${amount}`);
                    throw new Error('Insufficient balance');
                }
                users[index].balance = currentBalance - amount;
            } else if (operation === 'set') {
                users[index].balance = amount;
            }
            
            users[index].lastActive = new Date().toISOString();
            
            await this.update(this.bins.USERS, { users });
            
            console.log(`💰 Balance updated: ${currentBalance} -> ${users[index].balance}`);
            return users[index];
            
        } catch (error) {
            console.error('Update balance error:', error);
            throw error;
        }
    },
    
    async incrementFailedAttempts(telegramId) {
        try {
            const data = await this.readFresh(this.bins.USERS);
            const users = data?.users || [];
            
            const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
            if (index === -1) return 0;
            
            const today = new Date().toISOString().split('T')[0];
            const lastAttemptDate = users[index].lastFailedAttempt ?
                users[index].lastFailedAttempt.split('T')[0] : null;
            
            if (lastAttemptDate !== today) {
                users[index].failedPurchaseAttempts = 1;
            } else {
                users[index].failedPurchaseAttempts = (users[index].failedPurchaseAttempts || 0) + 1;
            }
            
            users[index].lastFailedAttempt = new Date().toISOString();
            
            await this.update(this.bins.USERS, { users });
            
            return users[index].failedPurchaseAttempts;
            
        } catch (error) {
            console.error('Increment failed attempts error:', error);
            return 0;
        }
    },
    
    // ===== Category Operations =====
    
    async getCategories() {
        try {
            const data = await this.read(this.bins.CATEGORIES);
            return data?.categories || [];
        } catch (error) {
            console.error('Get categories error:', error);
            return [];
        }
    },
    
    async getCategoryById(categoryId) {
        try {
            const categories = await this.getCategories();
            return categories.find(c => c.id === categoryId) || null;
        } catch (error) {
            console.error('Get category error:', error);
            return null;
        }
    },
    
    async createCategory(categoryData) {
        try {
            console.log('📁 Creating category:', categoryData.name);
            
            let data;
            try {
                data = await this.readFresh(this.bins.CATEGORIES);
            } catch (e) {
                data = { categories: [] };
            }
            
            const categories = data?.categories || [];
            
            const newCategory = {
                id: this.generateId(),
                name: categoryData.name,
                icon: categoryData.icon,
                flag: categoryData.flag || '',
                hasDiscount: categoryData.hasDiscount || false,
                isActive: true,
                order: categories.length,
                totalSold: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            categories.push(newCategory);
            await this.update(this.bins.CATEGORIES, { categories });
            
            console.log('✅ Category created:', newCategory.id);
            return newCategory;
            
        } catch (error) {
            console.error('Create category error:', error);
            throw error;
        }
    },
    
    async updateCategory(categoryId, updates) {
        try {
            const data = await this.readFresh(this.bins.CATEGORIES);
            const categories = data?.categories || [];
            
            const index = categories.findIndex(c => c.id === categoryId);
            if (index === -1) {
                throw new Error('Category not found');
            }
            
            categories[index] = {
                ...categories[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await this.update(this.bins.CATEGORIES, { categories });
            return categories[index];
            
        } catch (error) {
            console.error('Update category error:', error);
            throw error;
        }
    },
    
    async deleteCategory(categoryId) {
        try {
            const data = await this.readFresh(this.bins.CATEGORIES);
            const categories = data?.categories || [];
            
            const filtered = categories.filter(c => c.id !== categoryId);
            await this.update(this.bins.CATEGORIES, { categories: filtered });
            
            // Also delete related products and input tables
            await this.deleteProductsByCategory(categoryId);
            await this.deleteInputTablesByCategory(categoryId);
            
            return true;
            
        } catch (error) {
            console.error('Delete category error:', error);
            throw error;
        }
    },
    
    async incrementCategorySold(categoryId) {
        try {
            const data = await this.readFresh(this.bins.CATEGORIES);
            const categories = data?.categories || [];
            
            const index = categories.findIndex(c => c.id === categoryId);
            if (index !== -1) {
                categories[index].totalSold = (categories[index].totalSold || 0) + 1;
                await this.update(this.bins.CATEGORIES, { categories });
            }
            
            return true;
        } catch (error) {
            console.error('Increment category sold error:', error);
            return false;
        }
    },
    
    // ===== Product Operations =====
    
    async getProducts() {
        try {
            const data = await this.read(this.bins.PRODUCTS);
            return data?.products || [];
        } catch (error) {
            console.error('Get products error:', error);
            return [];
        }
    },
    
    async getProductsByCategory(categoryId) {
        try {
            const products = await this.getProducts();
            return products.filter(p => p.categoryId === categoryId);
        } catch (error) {
            console.error('Get products by category error:', error);
            return [];
        }
    },
    
    async getProductById(productId) {
        try {
            const products = await this.getProducts();
            return products.find(p => p.id === productId) || null;
        } catch (error) {
            console.error('Get product error:', error);
            return null;
        }
    },

    // ★ NEW: Fresh product read (for purchase validation)
    async getProductByIdFresh(productId) {
        try {
            const data = await this.readFresh(this.bins.PRODUCTS);
            const products = data?.products || [];
            return products.find(p => p.id === productId) || null;
        } catch (error) {
            console.error('Get product fresh error:', error);
            return null;
        }
    },
    
    async createProduct(productData) {
        try {
            console.log('📦 Creating product:', productData.name);
            
            let data;
            try {
                data = await this.readFresh(this.bins.PRODUCTS);
            } catch (e) {
                data = { products: [] };
            }
            
            const products = data?.products || [];
            
            const discountedPrice = productData.discount > 0
                ? Math.round(productData.price - (productData.price * productData.discount / 100))
                : productData.price;
            
            const newProduct = {
                id: this.generateId(),
                categoryId: productData.categoryId,
                name: productData.name,
                price: productData.price,
                currency: productData.currency || 'MMK',
                discount: productData.discount || 0,
                discountedPrice: discountedPrice,
                icon: productData.icon,
                deliveryTime: productData.deliveryTime || 'instant',
                serviceId: productData.serviceId || null,  // ★ G2Bulk service ID
                isActive: true,
                order: products.filter(p => p.categoryId === productData.categoryId).length,
                sold: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            products.push(newProduct);
            await this.update(this.bins.PRODUCTS, { products });
            
            // Update category hasDiscount if needed
            if (productData.discount > 0) {
                try {
                    await this.updateCategory(productData.categoryId, { hasDiscount: true });
                } catch (e) {
                    console.warn('Could not update category discount flag');
                }
            }
            
            console.log('✅ Product created:', newProduct.id);
            return newProduct;
            
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    },
    
    async updateProduct(productId, updates) {
        try {
            const data = await this.readFresh(this.bins.PRODUCTS);
            const products = data?.products || [];
            
            const index = products.findIndex(p => p.id === productId);
            if (index === -1) {
                throw new Error('Product not found');
            }
            
            // Recalculate discounted price if price or discount changed
            if (updates.price !== undefined || updates.discount !== undefined) {
                const price = updates.price ?? products[index].price;
                const discount = updates.discount ?? products[index].discount;
                updates.discountedPrice = discount > 0
                    ? Math.round(price - (price * discount / 100))
                    : price;
            }
            
            products[index] = {
                ...products[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await this.update(this.bins.PRODUCTS, { products });
            return products[index];
            
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    },
    
    async deleteProduct(productId) {
        try {
            const data = await this.readFresh(this.bins.PRODUCTS);
            const products = data?.products || [];
            
            const filtered = products.filter(p => p.id !== productId);
            await this.update(this.bins.PRODUCTS, { products: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    },
    
    async deleteProductsByCategory(categoryId) {
        try {
            const data = await this.readFresh(this.bins.PRODUCTS);
            const products = data?.products || [];
            
            const filtered = products.filter(p => p.categoryId !== categoryId);
            await this.update(this.bins.PRODUCTS, { products: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete products by category error:', error);
            return false;
        }
    },
    
    async incrementProductSold(productId) {
        try {
            const data = await this.readFresh(this.bins.PRODUCTS);
            const products = data?.products || [];
            
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index].sold = (products[index].sold || 0) + 1;
                await this.update(this.bins.PRODUCTS, { products });
                
                // Also increment category sold
                await this.incrementCategorySold(products[index].categoryId);
            }
            
            return true;
        } catch (error) {
            console.error('Increment product sold error:', error);
            return false;
        }
    },
    
    // ===== Order Operations =====
    
    async getOrders() {
        try {
            const data = await this.read(this.bins.ORDERS);
            return data?.orders || [];
        } catch (error) {
            console.error('Get orders error:', error);
            return [];
        }
    },
    
    async getOrdersByUser(telegramId) {
        try {
            const orders = await this.getOrders();
            return orders
                .filter(o => String(o.telegramId) === String(telegramId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get user orders error:', error);
            return [];
        }
    },
    
    async getOrdersByStatus(status) {
        try {
            const orders = await this.getOrders();
            return orders
                .filter(o => o.status === status)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get orders by status error:', error);
            return [];
        }
    },

    // ★ NEW: Get queued orders (for G2Bulk retry system)
    async getQueuedOrders() {
        try {
            const orders = await this.getOrders();
            return orders
                .filter(o => o.status === 'queued')
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // oldest first
        } catch (error) {
            console.error('Get queued orders error:', error);
            return [];
        }
    },
    
    async createOrder(orderData) {
        try {
            console.log('🛒 Creating order for:', orderData.telegramId);
            
            let data;
            try {
                data = await this.readFresh(this.bins.ORDERS);
            } catch (e) {
                data = { orders: [] };
            }
            
            const orders = data?.orders || [];
            
            const newOrder = {
                id: this.generateId(),
                orderId: this.generateOrderId(),
                userId: orderData.userId,
                telegramId: String(orderData.telegramId),
                productId: orderData.productId,
                productName: orderData.productName,
                categoryId: orderData.categoryId,
                categoryName: orderData.categoryName,
                amount: orderData.amount,
                currency: orderData.currency || 'MMK',
                inputValues: orderData.inputValues || {},
                // ★ G2Bulk fields
                serviceId: orderData.serviceId || null,
                link: orderData.link || '',
                apiOrderId: null,
                apiStatus: null,
                apiCharge: null,
                apiError: null,
                retriedCount: 0,
                // Status
                status: 'pending',
                createdAt: new Date().toISOString(),
                processedAt: null,
                completedAt: null,
                processedBy: null,
                refundedAt: null,
                refundAmount: null
            };
            
            orders.push(newOrder);
            await this.update(this.bins.ORDERS, { orders });
            
            // Update user stats
            try {
                const userData = await this.readFresh(this.bins.USERS);
                const users = userData?.users || [];
                const userIdx = users.findIndex(u => String(u.telegramId) === String(orderData.telegramId));
                if (userIdx !== -1) {
                    users[userIdx].totalOrders = (users[userIdx].totalOrders || 0) + 1;
                    users[userIdx].lastActive = new Date().toISOString();
                    await this.update(this.bins.USERS, { users });
                }
            } catch (e) {
                console.warn('Could not update user order count:', e);
            }
            
            console.log('✅ Order created:', newOrder.orderId);
            return newOrder;
            
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    },
    
    async updateOrderStatus(orderId, status, processedBy) {
        try {
            console.log('📋 Updating order status:', orderId, status);
            
            const data = await this.readFresh(this.bins.ORDERS);
            const orders = data?.orders || [];
            
            const index = orders.findIndex(o => o.id === orderId);
            if (index === -1) {
                throw new Error('Order not found');
            }
            
            const order = orders[index];
            order.status = status;
            order.processedAt = new Date().toISOString();
            order.processedBy = processedBy;

            if (status === 'completed' || status === 'approved') {
                order.completedAt = new Date().toISOString();
            }
            
            await this.update(this.bins.ORDERS, { orders });
            
            // Update user stats
            try {
                const userData = await this.readFresh(this.bins.USERS);
                const users = userData?.users || [];
                const userIdx = users.findIndex(u => String(u.telegramId) === String(order.telegramId));
                
                if (userIdx !== -1) {
                    if (status === 'approved' || status === 'completed') {
                        users[userIdx].approvedOrders = (users[userIdx].approvedOrders || 0) + 1;
                        users[userIdx].totalSpent = (users[userIdx].totalSpent || 0) + order.amount;
                        await this.update(this.bins.USERS, { users });
                        await this.incrementProductSold(order.productId);
                    } else if (status === 'rejected' || status === 'canceled') {
                        users[userIdx].rejectedOrders = (users[userIdx].rejectedOrders || 0) + 1;
                        // Refund
                        users[userIdx].balance = (users[userIdx].balance || 0) + order.amount;
                        await this.update(this.bins.USERS, { users });
                        
                        // Mark refund on order
                        orders[index].refundedAt = new Date().toISOString();
                        orders[index].refundAmount = order.amount;
                        await this.update(this.bins.ORDERS, { orders });
                    }
                }
            } catch (e) {
                console.warn('Could not update user stats:', e);
            }
            
            console.log('✅ Order status updated:', status);
            return order;
            
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    },

    // ★ NEW: Update order API status (for G2Bulk integration)
    async updateOrderApiStatus(orderId, updates) {
        try {
            console.log('📡 Updating order API status:', orderId, updates);
            
            const data = await this.readFresh(this.bins.ORDERS);
            const orders = data?.orders || [];
            
            const index = orders.findIndex(o => o.id === orderId);
            if (index === -1) {
                throw new Error('Order not found');
            }
            
            // Merge API updates
            if (updates.apiOrderId !== undefined) orders[index].apiOrderId = updates.apiOrderId;
            if (updates.apiStatus !== undefined) orders[index].apiStatus = updates.apiStatus;
            if (updates.apiCharge !== undefined) orders[index].apiCharge = updates.apiCharge;
            if (updates.apiError !== undefined) orders[index].apiError = updates.apiError;
            if (updates.status !== undefined) orders[index].status = updates.status;
            
            // Set completion time if completed
            if (updates.status === 'completed' || updates.status === 'approved') {
                orders[index].completedAt = new Date().toISOString();
            }

            // If failed, mark refund
            if (updates.status === 'failed') {
                orders[index].refundedAt = new Date().toISOString();
                orders[index].refundAmount = orders[index].amount;
            }
            
            orders[index].processedAt = new Date().toISOString();
            
            await this.update(this.bins.ORDERS, { orders });
            
            console.log('✅ Order API status updated');
            return orders[index];
            
        } catch (error) {
            console.error('Update order API status error:', error);
            throw error;
        }
    },

    // ★ NEW: Increment order retry count (for G2Bulk queue system)
    async incrementOrderRetry(orderId) {
        try {
            const data = await this.readFresh(this.bins.ORDERS);
            const orders = data?.orders || [];
            
            const index = orders.findIndex(o => o.id === orderId);
            if (index === -1) return 0;
            
            orders[index].retriedCount = (orders[index].retriedCount || 0) + 1;
            orders[index].lastRetryAt = new Date().toISOString();
            
            await this.update(this.bins.ORDERS, { orders });
            
            return orders[index].retriedCount;
        } catch (error) {
            console.error('Increment order retry error:', error);
            return 0;
        }
    },
    
    // ===== Top-up Operations =====
    
    async getTopups() {
        try {
            const data = await this.read(this.bins.TOPUPS);
            return data?.topups || [];
        } catch (error) {
            console.error('Get topups error:', error);
            return [];
        }
    },
    
    async getTopupsByUser(telegramId) {
        try {
            const topups = await this.getTopups();
            return topups
                .filter(t => String(t.telegramId) === String(telegramId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get user topups error:', error);
            return [];
        }
    },
    
    async getTopupsByStatus(status) {
        try {
            const topups = await this.getTopups();
            return topups
                .filter(t => t.status === status)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get topups by status error:', error);
            return [];
        }
    },
    
    async createTopup(topupData) {
        try {
            console.log('💳 Creating topup for:', topupData.telegramId);
            
            let data;
            try {
                data = await this.readFresh(this.bins.TOPUPS);
            } catch (e) {
                data = { topups: [] };
            }
            
            const topups = data?.topups || [];
            
            const newTopup = {
                id: this.generateId(),
                userId: topupData.userId,
                telegramId: String(topupData.telegramId),
                amount: topupData.amount,
                paymentMethod: topupData.paymentMethod,
                proofImage: topupData.proofImage,
                status: 'pending',
                createdAt: new Date().toISOString(),
                processedAt: null,
                processedBy: null
            };
            
            topups.push(newTopup);
            await this.update(this.bins.TOPUPS, { topups });
            
            console.log('✅ Topup created:', newTopup.id);
            return newTopup;
            
        } catch (error) {
            console.error('Create topup error:', error);
            throw error;
        }
    },
    
    async updateTopupStatus(topupId, status, processedBy) {
        try {
            console.log('💳 Updating topup status:', topupId, status);
            
            const data = await this.readFresh(this.bins.TOPUPS);
            const topups = data?.topups || [];
            
            const index = topups.findIndex(t => t.id === topupId);
            if (index === -1) {
                throw new Error('Topup not found');
            }
            
            const topup = topups[index];
            topup.status = status;
            topup.processedAt = new Date().toISOString();
            topup.processedBy = processedBy;
            
            await this.update(this.bins.TOPUPS, { topups });
            
            // Update user balance if approved
            if (status === 'approved') {
                await this.updateUserBalance(topup.telegramId, topup.amount, 'add');
                
                // Update topup count
                try {
                    const userData = await this.readFresh(this.bins.USERS);
                    const users = userData?.users || [];
                    const userIdx = users.findIndex(u => String(u.telegramId) === String(topup.telegramId));
                    if (userIdx !== -1) {
                        users[userIdx].totalTopups = (users[userIdx].totalTopups || 0) + 1;
                        await this.update(this.bins.USERS, { users });
                    }
                } catch (e) {
                    console.warn('Could not update user topup count');
                }
            }
            
            console.log('✅ Topup status updated:', status);
            return topup;
            
        } catch (error) {
            console.error('Update topup status error:', error);
            throw error;
        }
    },
    
    // ===== Banner Operations =====
    
    async getBanners() {
        try {
            const data = await this.read(this.bins.BANNERS);
            return data || { type1: [], type2: [] };
        } catch (error) {
            console.error('Get banners error:', error);
            return { type1: [], type2: [] };
        }
    },
    
    async getHomeBanners() {
        try {
            const data = await this.getBanners();
            return data.type1 || [];
        } catch (error) {
            console.error('Get home banners error:', error);
            return [];
        }
    },
    
    async getCategoryBanners(categoryId) {
        try {
            const data = await this.getBanners();
            return (data.type2 || []).filter(b => b.categoryId === categoryId);
        } catch (error) {
            console.error('Get category banners error:', error);
            return [];
        }
    },
    
    async createBanner(bannerData, type = 'type1') {
        try {
            console.log('🖼️ Creating banner:', type);
            
            let data;
            try {
                data = await this.readFresh(this.bins.BANNERS);
            } catch (e) {
                data = { type1: [], type2: [] };
            }
            
            if (!data) data = { type1: [], type2: [] };
            if (!data.type1) data.type1 = [];
            if (!data.type2) data.type2 = [];
            
            const newBanner = {
                id: this.generateId(),
                image: bannerData.image,
                isActive: true,
                order: data[type].length,
                createdAt: new Date().toISOString()
            };
            
            if (type === 'type2') {
                newBanner.categoryId = bannerData.categoryId;
                newBanner.description = bannerData.description || '';
            }
            
            data[type].push(newBanner);
            
            await this.update(this.bins.BANNERS, data);
            
            console.log('✅ Banner created:', newBanner.id);
            return newBanner;
            
        } catch (error) {
            console.error('Create banner error:', error);
            throw error;
        }
    },
    
    async deleteBanner(bannerId, type = 'type1') {
        try {
            const data = await this.readFresh(this.bins.BANNERS);
            
            if (data[type]) {
                data[type] = data[type].filter(b => b.id !== bannerId);
                await this.update(this.bins.BANNERS, data);
            }
            
            return true;
        } catch (error) {
            console.error('Delete banner error:', error);
            throw error;
        }
    },
    
    // ===== Payment Method Operations =====
    
    async getPaymentMethods() {
        try {
            const data = await this.read(this.bins.PAYMENTS);
            return data?.payments || [];
        } catch (error) {
            console.error('Get payment methods error:', error);
            return [];
        }
    },
    
    async createPaymentMethod(paymentData) {
        try {
            console.log('💳 Creating payment method:', paymentData.name);
            
            let data;
            try {
                data = await this.readFresh(this.bins.PAYMENTS);
            } catch (e) {
                data = { payments: [] };
            }
            
            const payments = data?.payments || [];
            
            const newPayment = {
                id: this.generateId(),
                name: paymentData.name,
                address: paymentData.address,
                accountName: paymentData.accountName,
                note: paymentData.note || '',
                icon: paymentData.icon,
                isActive: true,
                order: payments.length,
                createdAt: new Date().toISOString()
            };
            
            payments.push(newPayment);
            await this.update(this.bins.PAYMENTS, { payments });
            
            console.log('✅ Payment method created:', newPayment.id);
            return newPayment;
            
        } catch (error) {
            console.error('Create payment method error:', error);
            throw error;
        }
    },
    
    async updatePaymentMethod(paymentId, updates) {
        try {
            const data = await this.readFresh(this.bins.PAYMENTS);
            const payments = data?.payments || [];
            
            const index = payments.findIndex(p => p.id === paymentId);
            if (index === -1) {
                throw new Error('Payment method not found');
            }
            
            payments[index] = { ...payments[index], ...updates };
            await this.update(this.bins.PAYMENTS, { payments });
            
            return payments[index];
        } catch (error) {
            console.error('Update payment method error:', error);
            throw error;
        }
    },
    
    async deletePaymentMethod(paymentId) {
        try {
            const data = await this.readFresh(this.bins.PAYMENTS);
            const payments = data?.payments || [];
            
            const filtered = payments.filter(p => p.id !== paymentId);
            await this.update(this.bins.PAYMENTS, { payments: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete payment method error:', error);
            throw error;
        }
    },
    
    // ===== Input Table Operations =====
    
    async getInputTables() {
        try {
            const data = await this.read(this.bins.INPUT_TABLES);
            return data?.inputTables || [];
        } catch (error) {
            console.error('Get input tables error:', error);
            return [];
        }
    },
    
    async getInputTablesByCategory(categoryId) {
        try {
            const inputTables = await this.getInputTables();
            return inputTables.filter(t => t.categoryId === categoryId);
        } catch (error) {
            console.error('Get input tables by category error:', error);
            return [];
        }
    },
    
    async createInputTable(inputTableData) {
        try {
            console.log('⌨️ Creating input table:', inputTableData.name);
            
            let data;
            try {
                data = await this.readFresh(this.bins.INPUT_TABLES);
            } catch (e) {
                data = { inputTables: [] };
            }
            
            const inputTables = data?.inputTables || [];
            
            const newInputTable = {
                id: this.generateId(),
                categoryId: inputTableData.categoryId,
                name: inputTableData.name,
                placeholder: inputTableData.placeholder,
                checkerEnabled: inputTableData.checkerEnabled || false,
                checkerConfig: inputTableData.checkerConfig || null,
                createdAt: new Date().toISOString()
            };
            
            inputTables.push(newInputTable);
            await this.update(this.bins.INPUT_TABLES, { inputTables });
            
            console.log('✅ Input table created:', newInputTable.id);
            return newInputTable;
            
        } catch (error) {
            console.error('Create input table error:', error);
            throw error;
        }
    },
    
    async updateInputTable(inputTableId, updates) {
        try {
            const data = await this.readFresh(this.bins.INPUT_TABLES);
            const inputTables = data?.inputTables || [];
            
            const index = inputTables.findIndex(t => t.id === inputTableId);
            if (index === -1) {
                throw new Error('Input table not found');
            }
            
            inputTables[index] = { ...inputTables[index], ...updates };
            await this.update(this.bins.INPUT_TABLES, { inputTables });
            
            return inputTables[index];
        } catch (error) {
            console.error('Update input table error:', error);
            throw error;
        }
    },
    
    async deleteInputTable(inputTableId) {
        try {
            const data = await this.readFresh(this.bins.INPUT_TABLES);
            const inputTables = data?.inputTables || [];
            
            const filtered = inputTables.filter(t => t.id !== inputTableId);
            await this.update(this.bins.INPUT_TABLES, { inputTables: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete input table error:', error);
            throw error;
        }
    },
    
    async deleteInputTablesByCategory(categoryId) {
        try {
            const data = await this.readFresh(this.bins.INPUT_TABLES);
            const inputTables = data?.inputTables || [];
            
            const filtered = inputTables.filter(t => t.categoryId !== categoryId);
            await this.update(this.bins.INPUT_TABLES, { inputTables: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete input tables by category error:', error);
            return false;
        }
    },

    // ===== Custom Emoji Operations =====

    async getCustomEmojis() {
        try {
            const data = await this.read(this.bins.MAIN);
            return data?.customEmojis || [];
        } catch (error) {
            console.error('Get custom emojis error:', error);
            return [];
        }
    },

    async createCustomEmoji(emojiData) {
        try {
            console.log('🎨 Creating custom emoji...');
            
            const data = await this.readFresh(this.bins.MAIN);
            
            if (!data.customEmojis) {
                data.customEmojis = [];
            }
            
            const newEmoji = {
                id: this.generateId(),
                trigger: emojiData.trigger,
                imageUrl: emojiData.imageUrl,
                name: emojiData.name || '',
                type: emojiData.type || 'image',
                createdAt: new Date().toISOString()
            };
            
            data.customEmojis.push(newEmoji);
            await this.update(this.bins.MAIN, data);
            
            console.log('✅ Custom emoji created:', newEmoji.id);
            return newEmoji;
            
        } catch (error) {
            console.error('Create custom emoji error:', error);
            throw error;
        }
    },

    async deleteCustomEmoji(emojiId) {
        try {
            console.log('🗑️ Deleting custom emoji:', emojiId);
            
            const data = await this.readFresh(this.bins.MAIN);
            
            if (data.customEmojis) {
                data.customEmojis = data.customEmojis.filter(e => e.id !== emojiId);
                await this.update(this.bins.MAIN, data);
            }
            
            console.log('✅ Custom emoji deleted');
            return true;
            
        } catch (error) {
            console.error('Delete custom emoji error:', error);
            throw error;
        }
    },
    
    // ===== Banned Users Operations =====
    
    async getBannedUsers() {
        try {
            const data = await this.read(this.bins.BANNED);
            return data?.bannedUsers || [];
        } catch (error) {
            console.error('Get banned users error:', error);
            return [];
        }
    },
    
    async isUserBanned(telegramId) {
        try {
            const bannedUsers = await this.getBannedUsers();
            return bannedUsers.some(u => String(u.telegramId) === String(telegramId));
        } catch (error) {
            console.error('Check banned user error:', error);
            return false;
        }
    },
    
    async banUser(userData, reason = 'Violated terms of service') {
        try {
            console.log('🚫 Banning user:', userData.telegramId);
            
            let data;
            try {
                data = await this.readFresh(this.bins.BANNED);
            } catch (e) {
                data = { bannedUsers: [] };
            }
            
            const bannedUsers = data?.bannedUsers || [];
            
            // Check if already banned
            if (bannedUsers.some(u => String(u.telegramId) === String(userData.telegramId))) {
                console.log('User already banned');
                return true;
            }
            
            const bannedUser = {
                id: this.generateId(),
                telegramId: String(userData.telegramId),
                username: userData.username || '',
                firstName: userData.firstName || '',
                reason: reason,
                bannedAt: new Date().toISOString(),
                bannedBy: CONFIG.ADMIN_TELEGRAM_ID
            };
            
            bannedUsers.push(bannedUser);
            await this.update(this.bins.BANNED, { bannedUsers });

            // ★ Also mark user as banned in users collection
            try {
                await this.updateUser(userData.telegramId, { status: 'banned' });
            } catch (e) {
                console.warn('Could not update user status to banned:', e);
            }
            
            console.log('✅ User banned');
            return true;
            
        } catch (error) {
            console.error('Ban user error:', error);
            throw error;
        }
    },
    
    async unbanUser(telegramId) {
        try {
            console.log('✅ Unbanning user:', telegramId);
            
            const data = await this.readFresh(this.bins.BANNED);
            const bannedUsers = data?.bannedUsers || [];
            
            const filtered = bannedUsers.filter(u => String(u.telegramId) !== String(telegramId));
            await this.update(this.bins.BANNED, { bannedUsers: filtered });
            
            // Reset failed attempts and status
            try {
                await this.updateUser(telegramId, {
                    failedPurchaseAttempts: 0,
                    lastFailedAttempt: null,
                    status: 'active'
                });
            } catch (e) {
                console.warn('Could not reset failed attempts');
            }
            
            return true;
        } catch (error) {
            console.error('Unban user error:', error);
            throw error;
        }
    },
    
    // ===== Statistics =====
    
    async getStats() {
        try {
            const [users, orders, topups] = await Promise.all([
                this.getUsers(),
                this.getOrders(),
                this.getTopups()
            ]);
            
            const approvedOrders = orders.filter(o => 
                o.status === 'approved' || o.status === 'completed'
            );
            const pendingOrders = orders.filter(o => o.status === 'pending');
            const processingOrders = orders.filter(o => o.status === 'processing');
            const queuedOrders = orders.filter(o => o.status === 'queued');
            const pendingTopups = topups.filter(t => t.status === 'pending');
            
            const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
            
            return {
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders: pendingOrders.length,
                processingOrders: processingOrders.length,
                queuedOrders: queuedOrders.length,
                approvedOrders: approvedOrders.length,
                totalRevenue: totalRevenue,
                pendingTopups: pendingTopups.length
            };
        } catch (error) {
            console.error('Get stats error:', error);
            return {
                totalUsers: 0,
                totalOrders: 0,
                pendingOrders: 0,
                processingOrders: 0,
                queuedOrders: 0,
                approvedOrders: 0,
                totalRevenue: 0,
                pendingTopups: 0
            };
        }
    },
    
    // ===== Utility Functions =====
    
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    generateOrderId() {
        return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
};

// Initialize database when loaded
Database.init();

// Make Database globally available
window.Database = Database;
