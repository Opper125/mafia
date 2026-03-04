// ===== Database Operations with JSONBin.io =====
// Updated for G2Bulk API integration

const Database = {
    baseUrl: 'https://api.jsonbin.io/v3/b',
    apiKey: null,
    bins: null,
    
    cache: {
        data: {},
        timestamps: {},
        ttl: 30000
    },
    
    init() {
        this.apiKey = CONFIG.JSONBIN_API_KEY;
        this.bins = CONFIG.BINS;
        console.log('📦 Database initialized with bins:', Object.keys(this.bins));
    },
    
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
    
    isCacheValid(key) {
        const timestamp = this.cache.timestamps[key];
        if (!timestamp) return false;
        return (Date.now() - timestamp) < this.cache.ttl;
    },
    
    setCache(key, data) {
        this.cache.data[key] = JSON.parse(JSON.stringify(data));
        this.cache.timestamps[key] = Date.now();
    },
    
    getCache(key) {
        if (this.isCacheValid(key)) {
            return JSON.parse(JSON.stringify(this.cache.data[key]));
        }
        return null;
    },
    
    clearCache(key) {
        delete this.cache.data[key];
        delete this.cache.timestamps[key];
    },
    
    clearAllCache() {
        this.cache.data = {};
        this.cache.timestamps = {};
    },
    
    // ===== Core CRUD =====
    
    async read(binId, useCache = true) {
        if (useCache) {
            const cached = this.getCache(binId);
            if (cached) return cached;
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/${binId}/latest`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            const data = result.record;
            this.setCache(binId, data);
            return data;
            
        } catch (error) {
            console.error(`❌ Read failed for ${binId}:`, error);
            if (this.cache.data[binId]) {
                return JSON.parse(JSON.stringify(this.cache.data[binId]));
            }
            throw error;
        }
    },
    
    async update(binId, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${binId}`, {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            this.setCache(binId, data);
            return result.record;
            
        } catch (error) {
            console.error(`❌ Update failed for ${binId}:`, error);
            throw error;
        }
    },
    
    // ===== Settings =====
    
    async getSettings() {
        try {
            const data = await this.read(this.bins.MAIN);
            return data || SCHEMAS.MAIN;
        } catch (error) {
            return SCHEMAS.MAIN;
        }
    },
    
    async updateSettings(settings) {
        settings.updatedAt = new Date().toISOString();
        return await this.update(this.bins.MAIN, settings);
    },
    
    // ===== Users =====
    
    async getUsers() {
        try {
            const data = await this.read(this.bins.USERS);
            return data?.users || [];
        } catch (error) {
            return [];
        }
    },
    
    async getUserByTelegramId(telegramId) {
        const users = await this.getUsers();
        return users.find(u => String(u.telegramId) === String(telegramId)) || null;
    },
    
    async createUser(userData) {
        try {
            let data;
            try {
                data = await this.read(this.bins.USERS, false);
            } catch (e) {
                data = { users: [] };
            }
            if (!data || !data.users) data = { users: [] };
            
            const users = data.users;
            const telegramId = String(userData.telegramId);
            const existingIndex = users.findIndex(u => String(u.telegramId) === telegramId);
            
            if (existingIndex !== -1) {
                users[existingIndex] = {
                    ...users[existingIndex],
                    username: userData.username || users[existingIndex].username,
                    firstName: userData.firstName || users[existingIndex].firstName,
                    lastName: userData.lastName || users[existingIndex].lastName,
                    photoUrl: userData.photoUrl || users[existingIndex].photoUrl,
                    isPremium: userData.isPremium || users[existingIndex].isPremium,
                    lastActive: new Date().toISOString()
                };
            } else {
                users.push({
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
                    joinedAt: new Date().toISOString(),
                    lastActive: new Date().toISOString()
                });
            }
            
            await this.update(this.bins.USERS, { users });
            return users.find(u => String(u.telegramId) === telegramId);
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },
    
    async updateUser(telegramId, updates) {
        const data = await this.read(this.bins.USERS, false);
        const users = data?.users || [];
        const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
        if (index === -1) throw new Error('User not found');
        
        users[index] = { ...users[index], ...updates, lastActive: new Date().toISOString() };
        await this.update(this.bins.USERS, { users });
        return users[index];
    },
    
    async updateUserBalance(telegramId, amount, operation = 'add') {
        const data = await this.read(this.bins.USERS, false);
        const users = data?.users || [];
        const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
        if (index === -1) throw new Error('User not found');
        
        const currentBalance = users[index].balance || 0;
        
        if (operation === 'add') users[index].balance = currentBalance + amount;
        else if (operation === 'subtract') users[index].balance = currentBalance - amount;
        else if (operation === 'set') users[index].balance = amount;
        
        users[index].lastActive = new Date().toISOString();
        await this.update(this.bins.USERS, { users });
        return users[index];
    },
    
    async incrementFailedAttempts(telegramId) {
        const data = await this.read(this.bins.USERS, false);
        const users = data?.users || [];
        const index = users.findIndex(u => String(u.telegramId) === String(telegramId));
        if (index === -1) return 0;
        
        const today = new Date().toISOString().split('T')[0];
        const lastDate = users[index].lastFailedAttempt?.split('T')[0];
        
        users[index].failedPurchaseAttempts = (lastDate !== today) ? 1 : (users[index].failedPurchaseAttempts || 0) + 1;
        users[index].lastFailedAttempt = new Date().toISOString();
        
        await this.update(this.bins.USERS, { users });
        return users[index].failedPurchaseAttempts;
    },
    
    // ===== Categories =====
    
    async getCategories() {
        try {
            const data = await this.read(this.bins.CATEGORIES);
            return data?.categories || [];
        } catch (error) {
            return [];
        }
    },
    
    async getCategoryById(categoryId) {
        const categories = await this.getCategories();
        return categories.find(c => c.id === categoryId) || null;
    },
    
    async createCategory(categoryData) {
        let data;
        try { data = await this.read(this.bins.CATEGORIES, false); } catch (e) { data = { categories: [] }; }
        const categories = data?.categories || [];
        
        const newCategory = {
            id: this.generateId(),
            name: categoryData.name,
            icon: categoryData.icon,
            flag: categoryData.flag || '',
            hasDiscount: categoryData.hasDiscount || false,
            totalSold: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        categories.push(newCategory);
        await this.update(this.bins.CATEGORIES, { categories });
        return newCategory;
    },
    
    async updateCategory(categoryId, updates) {
        const data = await this.read(this.bins.CATEGORIES, false);
        const categories = data?.categories || [];
        const index = categories.findIndex(c => c.id === categoryId);
        if (index === -1) throw new Error('Category not found');
        
        categories[index] = { ...categories[index], ...updates, updatedAt: new Date().toISOString() };
        await this.update(this.bins.CATEGORIES, { categories });
        return categories[index];
    },
    
    async deleteCategory(categoryId) {
        const data = await this.read(this.bins.CATEGORIES, false);
        const categories = data?.categories || [];
        await this.update(this.bins.CATEGORIES, { categories: categories.filter(c => c.id !== categoryId) });
        await this.deleteProductsByCategory(categoryId);
        await this.deleteInputTablesByCategory(categoryId);
        return true;
    },
    
    async incrementCategorySold(categoryId) {
        try {
            const data = await this.read(this.bins.CATEGORIES, false);
            const categories = data?.categories || [];
            const index = categories.findIndex(c => c.id === categoryId);
            if (index !== -1) {
                categories[index].totalSold = (categories[index].totalSold || 0) + 1;
                await this.update(this.bins.CATEGORIES, { categories });
            }
        } catch (error) { console.error('Increment sold error:', error); }
    },
    
    // ===== Products =====
    
    async getProducts() {
        try {
            const data = await this.read(this.bins.PRODUCTS);
            return data?.products || [];
        } catch (error) {
            return [];
        }
    },
    
    async getProductsByCategory(categoryId) {
        const products = await this.getProducts();
        return products.filter(p => p.categoryId === categoryId);
    },
    
    async getProductById(productId) {
        const products = await this.getProducts();
        return products.find(p => p.id === productId) || null;
    },
    
    async createProduct(productData) {
        let data;
        try { data = await this.read(this.bins.PRODUCTS, false); } catch (e) { data = { products: [] }; }
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
            // G2Bulk fields - NEW
            serviceId: productData.serviceId || null,
            g2bulkRate: productData.g2bulkRate || null,
            g2bulkMin: productData.g2bulkMin || null,
            g2bulkMax: productData.g2bulkMax || null,
            g2bulkServiceName: productData.g2bulkServiceName || '',
            sold: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        await this.update(this.bins.PRODUCTS, { products });
        
        if (productData.discount > 0) {
            try { await this.updateCategory(productData.categoryId, { hasDiscount: true }); } catch (e) {}
        }
        
        return newProduct;
    },
    
    async updateProduct(productId, updates) {
        const data = await this.read(this.bins.PRODUCTS, false);
        const products = data?.products || [];
        const index = products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error('Product not found');
        
        if (updates.price !== undefined || updates.discount !== undefined) {
            const price = updates.price ?? products[index].price;
            const discount = updates.discount ?? products[index].discount;
            updates.discountedPrice = discount > 0 ? Math.round(price - (price * discount / 100)) : price;
        }
        
        products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
        await this.update(this.bins.PRODUCTS, { products });
        return products[index];
    },
    
    async deleteProduct(productId) {
        const data = await this.read(this.bins.PRODUCTS, false);
        const products = data?.products || [];
        await this.update(this.bins.PRODUCTS, { products: products.filter(p => p.id !== productId) });
        return true;
    },
    
    async deleteProductsByCategory(categoryId) {
        const data = await this.read(this.bins.PRODUCTS, false);
        const products = data?.products || [];
        await this.update(this.bins.PRODUCTS, { products: products.filter(p => p.categoryId !== categoryId) });
    },
    
    async incrementProductSold(productId) {
        try {
            const data = await this.read(this.bins.PRODUCTS, false);
            const products = data?.products || [];
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index].sold = (products[index].sold || 0) + 1;
                await this.update(this.bins.PRODUCTS, { products });
                await this.incrementCategorySold(products[index].categoryId);
            }
        } catch (error) { console.error('Increment sold error:', error); }
    },
    
    // ===== Orders (UPDATED for G2Bulk) =====
    
    async getOrders() {
        try {
            const data = await this.read(this.bins.ORDERS);
            return data?.orders || [];
        } catch (error) {
            return [];
        }
    },
    
    async getOrdersByUser(telegramId) {
        const orders = await this.getOrders();
        return orders
            .filter(o => String(o.telegramId) === String(telegramId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    async getOrdersByStatus(status) {
        const orders = await this.getOrders();
        return orders.filter(o => o.status === status).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    // NEW: Get orders that need API processing
    async getActiveApiOrders() {
        const orders = await this.getOrders();
        return orders.filter(o => 
            o.status === 'processing' || 
            o.status === 'queued' || 
            o.apiStatus === 'Pending' || 
            o.apiStatus === 'Processing' || 
            o.apiStatus === 'In progress'
        );
    },
    
    // NEW: Get queued orders
    async getQueuedOrders() {
        const orders = await this.getOrders();
        return orders.filter(o => o.status === 'queued');
    },
    
    async createOrder(orderData) {
        let data;
        try { data = await this.read(this.bins.ORDERS, false); } catch (e) { data = { orders: [] }; }
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
            // G2Bulk fields - NEW
            serviceId: orderData.serviceId || null,
            link: orderData.link || '',
            apiOrderId: null,
            apiStatus: null,
            apiCharge: null,
            apiError: null,
            autoProcessed: !!orderData.serviceId,
            retriedCount: 0,
            queuedAt: null,
            completedAt: null,
            refundedAt: null,
            refundAmount: null,
            // Status
            status: orderData.serviceId ? 'processing' : 'pending',
            createdAt: new Date().toISOString(),
            processedAt: null,
            processedBy: null
        };
        
        orders.push(newOrder);
        await this.update(this.bins.ORDERS, { orders });
        
        // Update user stats
        try {
            const user = await this.getUserByTelegramId(orderData.telegramId);
            if (user) {
                await this.updateUser(orderData.telegramId, {
                    totalOrders: (user.totalOrders || 0) + 1
                });
            }
        } catch (e) {}
        
        return newOrder;
    },
    
    // UPDATED: For both manual and API status updates
    async updateOrderStatus(orderId, status, processedBy) {
        const data = await this.read(this.bins.ORDERS, false);
        const orders = data?.orders || [];
        const index = orders.findIndex(o => o.id === orderId);
        if (index === -1) throw new Error('Order not found');
        
        const order = orders[index];
        order.status = status;
        order.processedAt = new Date().toISOString();
        order.processedBy = processedBy;
        
        await this.update(this.bins.ORDERS, { orders });
        
        try {
            const user = await this.getUserByTelegramId(order.telegramId);
            if (user) {
                if (status === 'completed' || status === 'approved') {
                    await this.updateUser(order.telegramId, {
                        approvedOrders: (user.approvedOrders || 0) + 1,
                        totalSpent: (user.totalSpent || 0) + order.amount
                    });
                    await this.incrementProductSold(order.productId);
                } else if (status === 'failed' || status === 'rejected') {
                    await this.updateUser(order.telegramId, {
                        rejectedOrders: (user.rejectedOrders || 0) + 1
                    });
                    // Refund
                    await this.updateUserBalance(order.telegramId, order.amount, 'add');
                    order.refundedAt = new Date().toISOString();
                    order.refundAmount = order.amount;
                    await this.update(this.bins.ORDERS, { orders });
                }
            }
        } catch (e) { console.warn('Could not update user stats:', e); }
        
        return order;
    },
    
    // NEW: Update order with G2Bulk API data
    async updateOrderApiStatus(orderId, apiData) {
        try {
            const data = await this.read(this.bins.ORDERS, false);
            const orders = data?.orders || [];
            const index = orders.findIndex(o => o.id === orderId);
            if (index === -1) throw new Error('Order not found');
            
            orders[index] = {
                ...orders[index],
                ...apiData,
                updatedAt: new Date().toISOString()
            };
            
            // If completed, set completedAt
            if (apiData.status === 'completed') {
                orders[index].completedAt = new Date().toISOString();
                orders[index].processedAt = new Date().toISOString();
                
                // Update user stats
                try {
                    const user = await this.getUserByTelegramId(orders[index].telegramId);
                    if (user) {
                        await this.updateUser(orders[index].telegramId, {
                            approvedOrders: (user.approvedOrders || 0) + 1,
                            totalSpent: (user.totalSpent || 0) + orders[index].amount
                        });
                        await this.incrementProductSold(orders[index].productId);
                    }
                } catch (e) {}
            }
            
            // If failed/canceled, refund user
            if (apiData.status === 'failed' || apiData.status === 'canceled') {
                if (!orders[index].refundedAt) {
                    await this.updateUserBalance(orders[index].telegramId, orders[index].amount, 'add');
                    orders[index].refundedAt = new Date().toISOString();
                    orders[index].refundAmount = orders[index].amount;
                }
            }
            
            // If queued
            if (apiData.status === 'queued') {
                orders[index].queuedAt = orders[index].queuedAt || new Date().toISOString();
            }
            
            await this.update(this.bins.ORDERS, { orders });
            return orders[index];
            
        } catch (error) {
            console.error('Update order API status error:', error);
            throw error;
        }
    },
    
    // NEW: Increment retry count
    async incrementOrderRetry(orderId) {
        const data = await this.read(this.bins.ORDERS, false);
        const orders = data?.orders || [];
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].retriedCount = (orders[index].retriedCount || 0) + 1;
            await this.update(this.bins.ORDERS, { orders });
            return orders[index].retriedCount;
        }
        return 0;
    },
    
    // ===== Topups =====
    
    async getTopups() {
        try {
            const data = await this.read(this.bins.TOPUPS);
            return data?.topups || [];
        } catch (error) {
            return [];
        }
    },
    
    async getTopupsByUser(telegramId) {
        const topups = await this.getTopups();
        return topups
            .filter(t => String(t.telegramId) === String(telegramId))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    async getTopupsByStatus(status) {
        const topups = await this.getTopups();
        return topups.filter(t => t.status === status).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    async createTopup(topupData) {
        let data;
        try { data = await this.read(this.bins.TOPUPS, false); } catch (e) { data = { topups: [] }; }
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
        return newTopup;
    },
    
    async updateTopupStatus(topupId, status, processedBy) {
        const data = await this.read(this.bins.TOPUPS, false);
        const topups = data?.topups || [];
        const index = topups.findIndex(t => t.id === topupId);
        if (index === -1) throw new Error('Topup not found');
        
        const topup = topups[index];
        topup.status = status;
        topup.processedAt = new Date().toISOString();
        topup.processedBy = processedBy;
        
        await this.update(this.bins.TOPUPS, { topups });
        
        if (status === 'approved') {
            await this.updateUserBalance(topup.telegramId, topup.amount, 'add');
            try {
                const user = await this.getUserByTelegramId(topup.telegramId);
                if (user) {
                    await this.updateUser(topup.telegramId, { totalTopups: (user.totalTopups || 0) + 1 });
                }
            } catch (e) {}
        }
        
        return topup;
    },
    
    // ===== Banners =====
    
    async getBanners() {
        try {
            const data = await this.read(this.bins.BANNERS);
            return data || { type1: [], type2: [] };
        } catch (error) {
            return { type1: [], type2: [] };
        }
    },
    
    async getHomeBanners() {
        const data = await this.getBanners();
        return data.type1 || [];
    },
    
    async getCategoryBanners(categoryId) {
        const data = await this.getBanners();
        return (data.type2 || []).filter(b => b.categoryId === categoryId);
    },
    
    async createBanner(bannerData, type = 'type1') {
        let data;
        try { data = await this.read(this.bins.BANNERS, false); } catch (e) { data = { type1: [], type2: [] }; }
        if (!data) data = { type1: [], type2: [] };
        if (!data.type1) data.type1 = [];
        if (!data.type2) data.type2 = [];
        
        const newBanner = {
            id: this.generateId(),
            image: bannerData.image,
            createdAt: new Date().toISOString()
        };
        
        if (type === 'type2') {
            newBanner.categoryId = bannerData.categoryId;
            newBanner.description = bannerData.description || '';
        }
        
        data[type].push(newBanner);
        await this.update(this.bins.BANNERS, data);
        return newBanner;
    },
    
    async deleteBanner(bannerId, type = 'type1') {
        const data = await this.read(this.bins.BANNERS, false);
        if (data[type]) {
            data[type] = data[type].filter(b => b.id !== bannerId);
            await this.update(this.bins.BANNERS, data);
        }
        return true;
    },
    
    // ===== Payments =====
    
    async getPaymentMethods() {
        try {
            const data = await this.read(this.bins.PAYMENTS);
            return data?.payments || [];
        } catch (error) {
            return [];
        }
    },
    
    async createPaymentMethod(paymentData) {
        let data;
        try { data = await this.read(this.bins.PAYMENTS, false); } catch (e) { data = { payments: [] }; }
        const payments = data?.payments || [];
        
        const newPayment = {
            id: this.generateId(),
            name: paymentData.name,
            address: paymentData.address,
            accountName: paymentData.accountName,
            note: paymentData.note || '',
            icon: paymentData.icon,
            createdAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        await this.update(this.bins.PAYMENTS, { payments });
        return newPayment;
    },
    
    async updatePaymentMethod(paymentId, updates) {
        const data = await this.read(this.bins.PAYMENTS, false);
        const payments = data?.payments || [];
        const index = payments.findIndex(p => p.id === paymentId);
        if (index === -1) throw new Error('Payment method not found');
        payments[index] = { ...payments[index], ...updates };
        await this.update(this.bins.PAYMENTS, { payments });
        return payments[index];
    },
    
    async deletePaymentMethod(paymentId) {
        const data = await this.read(this.bins.PAYMENTS, false);
        const payments = data?.payments || [];
        await this.update(this.bins.PAYMENTS, { payments: payments.filter(p => p.id !== paymentId) });
        return true;
    },
    
    // ===== Input Tables (UPDATED with checker) =====
    
    async getInputTables() {
        try {
            const data = await this.read(this.bins.INPUT_TABLES);
            return data?.inputTables || [];
        } catch (error) {
            return [];
        }
    },
    
    async getInputTablesByCategory(categoryId) {
        const inputTables = await this.getInputTables();
        return inputTables.filter(t => t.categoryId === categoryId);
    },
    
    async createInputTable(inputTableData) {
        let data;
        try { data = await this.read(this.bins.INPUT_TABLES, false); } catch (e) { data = { inputTables: [] }; }
        const inputTables = data?.inputTables || [];
        
        const newInputTable = {
            id: this.generateId(),
            categoryId: inputTableData.categoryId,
            name: inputTableData.name,
            placeholder: inputTableData.placeholder,
            // NEW: Game ID Checker config
            checkerEnabled: inputTableData.checkerEnabled || false,
            checkerConfig: inputTableData.checkerConfig || null,
            createdAt: new Date().toISOString()
        };
        
        inputTables.push(newInputTable);
        await this.update(this.bins.INPUT_TABLES, { inputTables });
        return newInputTable;
    },
    
    async updateInputTable(inputTableId, updates) {
        const data = await this.read(this.bins.INPUT_TABLES, false);
        const inputTables = data?.inputTables || [];
        const index = inputTables.findIndex(t => t.id === inputTableId);
        if (index === -1) throw new Error('Input table not found');
        inputTables[index] = { ...inputTables[index], ...updates };
        await this.update(this.bins.INPUT_TABLES, { inputTables });
        return inputTables[index];
    },
    
    async deleteInputTable(inputTableId) {
        const data = await this.read(this.bins.INPUT_TABLES, false);
        const inputTables = data?.inputTables || [];
        await this.update(this.bins.INPUT_TABLES, { inputTables: inputTables.filter(t => t.id !== inputTableId) });
        return true;
    },
    
    async deleteInputTablesByCategory(categoryId) {
        const data = await this.read(this.bins.INPUT_TABLES, false);
        const inputTables = data?.inputTables || [];
        await this.update(this.bins.INPUT_TABLES, { inputTables: inputTables.filter(t => t.categoryId !== categoryId) });
    },
    
    // ===== Custom Emojis =====
    
    async getCustomEmojis() {
        const data = await this.read(this.bins.MAIN);
        return data?.customEmojis || [];
    },
    
    async createCustomEmoji(emojiData) {
        const data = await this.read(this.bins.MAIN, false);
        if (!data.customEmojis) data.customEmojis = [];
        
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
        return newEmoji;
    },
    
    async deleteCustomEmoji(emojiId) {
        const data = await this.read(this.bins.MAIN, false);
        if (data.customEmojis) {
            data.customEmojis = data.customEmojis.filter(e => e.id !== emojiId);
            await this.update(this.bins.MAIN, data);
        }
        return true;
    },
    
    // ===== Banned Users =====
    
    async getBannedUsers() {
        try {
            const data = await this.read(this.bins.BANNED);
            return data?.bannedUsers || [];
        } catch (error) {
            return [];
        }
    },
    
    async isUserBanned(telegramId) {
        const bannedUsers = await this.getBannedUsers();
        return bannedUsers.some(u => String(u.telegramId) === String(telegramId));
    },
    
    async banUser(userData, reason = 'Violated terms of service') {
        let data;
        try { data = await this.read(this.bins.BANNED, false); } catch (e) { data = { bannedUsers: [] }; }
        const bannedUsers = data?.bannedUsers || [];
        
        if (bannedUsers.some(u => String(u.telegramId) === String(userData.telegramId))) return true;
        
        bannedUsers.push({
            id: this.generateId(),
            telegramId: String(userData.telegramId),
            username: userData.username || '',
            firstName: userData.firstName || '',
            reason: reason,
            bannedAt: new Date().toISOString(),
            bannedBy: CONFIG.ADMIN_TELEGRAM_ID
        });
        
        await this.update(this.bins.BANNED, { bannedUsers });
        return true;
    },
    
    async unbanUser(telegramId) {
        const data = await this.read(this.bins.BANNED, false);
        const bannedUsers = data?.bannedUsers || [];
        await this.update(this.bins.BANNED, { bannedUsers: bannedUsers.filter(u => String(u.telegramId) !== String(telegramId)) });
        try {
            await this.updateUser(telegramId, { failedPurchaseAttempts: 0, lastFailedAttempt: null });
        } catch (e) {}
        return true;
    },
    
    // ===== Statistics =====
    
    async getStats() {
        try {
            const [users, orders, topups] = await Promise.all([this.getUsers(), this.getOrders(), this.getTopups()]);
            
            const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'approved');
            const pendingOrders = orders.filter(o => o.status === 'pending');
            const processingOrders = orders.filter(o => o.status === 'processing');
            const queuedOrders = orders.filter(o => o.status === 'queued');
            const pendingTopups = topups.filter(t => t.status === 'pending');
            const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
            
            return {
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders: pendingOrders.length,
                processingOrders: processingOrders.length,
                queuedOrders: queuedOrders.length,
                completedOrders: completedOrders.length,
                totalRevenue: totalRevenue,
                pendingTopups: pendingTopups.length
            };
        } catch (error) {
            return { totalUsers: 0, totalOrders: 0, pendingOrders: 0, processingOrders: 0, queuedOrders: 0, completedOrders: 0, totalRevenue: 0, pendingTopups: 0 };
        }
    },
    
    // ===== Utilities =====
    
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    generateOrderId() {
        return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
};

Database.init();
window.Database = Database;
