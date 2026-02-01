// ===== Database Operations with JSONBin.io =====

const Database = {
    // Base configuration
    baseUrl: CONFIG.JSONBIN_BASE_URL,
    apiKey: CONFIG.JSONBIN_API_KEY,
    
    // Headers for API requests
    getHeaders(update = false) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Master-Key': this.apiKey
        };
        if (update) {
            headers['X-Bin-Versioning'] = 'false';
        }
        return headers;
    },
    
    // ===== Generic CRUD Operations =====
    
    // Read data from a bin
    async read(binId) {
        try {
            const response = await fetch(`${this.baseUrl}/${binId}/latest`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data.record;
        } catch (error) {
            console.error('Database read error:', error);
            throw error;
        }
    },
    
    // Update data in a bin
    async update(binId, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${binId}`, {
                method: 'PUT',
                headers: this.getHeaders(true),
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            return result.record;
        } catch (error) {
            console.error('Database update error:', error);
            throw error;
        }
    },
    
    // ===== Settings Operations =====
    
    async getSettings() {
        try {
            return await this.read(CONFIG.BINS.MAIN);
        } catch (error) {
            console.error('Get settings error:', error);
            return SCHEMAS.MAIN;
        }
    },
    
    async updateSettings(settings) {
        try {
            settings.updatedAt = new Date().toISOString();
            return await this.update(CONFIG.BINS.MAIN, settings);
        } catch (error) {
            console.error('Update settings error:', error);
            throw error;
        }
    },
    
    // ===== User Operations =====
    
    async getUsers() {
        try {
            const data = await this.read(CONFIG.BINS.USERS);
            return data.users || [];
        } catch (error) {
            console.error('Get users error:', error);
            return [];
        }
    },
    
    async getUserByTelegramId(telegramId) {
        try {
            const users = await this.getUsers();
            return users.find(u => u.telegramId === String(telegramId)) || null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },
    
    async createUser(userData) {
        try {
            const data = await this.read(CONFIG.BINS.USERS);
            const users = data.users || [];
            
            // Check if user already exists
            const existingIndex = users.findIndex(u => u.telegramId === String(userData.telegramId));
            
            if (existingIndex !== -1) {
                // Update existing user
                users[existingIndex] = {
                    ...users[existingIndex],
                    ...userData,
                    lastActive: new Date().toISOString()
                };
            } else {
                // Create new user
                const newUser = {
                    id: Utils.generateId(),
                    telegramId: String(userData.telegramId),
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
                };
                users.push(newUser);
            }
            
            await this.update(CONFIG.BINS.USERS, { users });
            return users.find(u => u.telegramId === String(userData.telegramId));
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    },
    
    async updateUser(telegramId, updates) {
        try {
            const data = await this.read(CONFIG.BINS.USERS);
            const users = data.users || [];
            
            const index = users.findIndex(u => u.telegramId === String(telegramId));
            if (index === -1) {
                throw new Error('User not found');
            }
            
            users[index] = {
                ...users[index],
                ...updates,
                lastActive: new Date().toISOString()
            };
            
            await this.update(CONFIG.BINS.USERS, { users });
            return users[index];
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    },
    
    async updateUserBalance(telegramId, amount, operation = 'add') {
        try {
            const data = await this.read(CONFIG.BINS.USERS);
            const users = data.users || [];
            
            const index = users.findIndex(u => u.telegramId === String(telegramId));
            if (index === -1) {
                throw new Error('User not found');
            }
            
            if (operation === 'add') {
                users[index].balance += amount;
            } else if (operation === 'subtract') {
                users[index].balance -= amount;
            } else if (operation === 'set') {
                users[index].balance = amount;
            }
            
            users[index].lastActive = new Date().toISOString();
            
            await this.update(CONFIG.BINS.USERS, { users });
            return users[index];
        } catch (error) {
            console.error('Update balance error:', error);
            throw error;
        }
    },
    
    async incrementFailedAttempts(telegramId) {
        try {
            const data = await this.read(CONFIG.BINS.USERS);
            const users = data.users || [];
            
            const index = users.findIndex(u => u.telegramId === String(telegramId));
            if (index === -1) return null;
            
            const today = Utils.getTodayString();
            const lastAttemptDate = users[index].lastFailedAttempt ? 
                users[index].lastFailedAttempt.split('T')[0] : null;
            
            if (lastAttemptDate !== today) {
                users[index].failedPurchaseAttempts = 1;
            } else {
                users[index].failedPurchaseAttempts += 1;
            }
            
            users[index].lastFailedAttempt = new Date().toISOString();
            
            await this.update(CONFIG.BINS.USERS, { users });
            
            return users[index].failedPurchaseAttempts;
        } catch (error) {
            console.error('Increment failed attempts error:', error);
            return null;
        }
    },
    
    // ===== Category Operations =====
    
    async getCategories() {
        try {
            const data = await this.read(CONFIG.BINS.CATEGORIES);
            return data.categories || [];
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
            const data = await this.read(CONFIG.BINS.CATEGORIES);
            const categories = data.categories || [];
            
            const newCategory = {
                id: Utils.generateId(),
                name: categoryData.name,
                icon: categoryData.icon,
                flag: categoryData.flag || '',
                hasDiscount: categoryData.hasDiscount || false,
                totalSold: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            categories.push(newCategory);
            await this.update(CONFIG.BINS.CATEGORIES, { categories });
            
            return newCategory;
        } catch (error) {
            console.error('Create category error:', error);
            throw error;
        }
    },
    
    async updateCategory(categoryId, updates) {
        try {
            const data = await this.read(CONFIG.BINS.CATEGORIES);
            const categories = data.categories || [];
            
            const index = categories.findIndex(c => c.id === categoryId);
            if (index === -1) {
                throw new Error('Category not found');
            }
            
            categories[index] = {
                ...categories[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await this.update(CONFIG.BINS.CATEGORIES, { categories });
            return categories[index];
        } catch (error) {
            console.error('Update category error:', error);
            throw error;
        }
    },
    
    async deleteCategory(categoryId) {
        try {
            const data = await this.read(CONFIG.BINS.CATEGORIES);
            const categories = data.categories || [];
            
            const filtered = categories.filter(c => c.id !== categoryId);
            await this.update(CONFIG.BINS.CATEGORIES, { categories: filtered });
            
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
            const data = await this.read(CONFIG.BINS.CATEGORIES);
            const categories = data.categories || [];
            
            const index = categories.findIndex(c => c.id === categoryId);
            if (index !== -1) {
                categories[index].totalSold += 1;
                await this.update(CONFIG.BINS.CATEGORIES, { categories });
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
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            return data.products || [];
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
    
    async createProduct(productData) {
        try {
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            const products = data.products || [];
            
            const discountedPrice = productData.discount > 0 
                ? Utils.calculateDiscount(productData.price, productData.discount)
                : productData.price;
            
            const newProduct = {
                id: Utils.generateId(),
                categoryId: productData.categoryId,
                name: productData.name,
                price: productData.price,
                currency: productData.currency || 'MMK',
                discount: productData.discount || 0,
                discountedPrice: discountedPrice,
                icon: productData.icon,
                deliveryTime: productData.deliveryTime || 'instant',
                sold: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            products.push(newProduct);
            await this.update(CONFIG.BINS.PRODUCTS, { products });
            
            // Update category hasDiscount if product has discount
            if (productData.discount > 0) {
                await this.updateCategory(productData.categoryId, { hasDiscount: true });
            }
            
            return newProduct;
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    },
    
    async updateProduct(productId, updates) {
        try {
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            const products = data.products || [];
            
            const index = products.findIndex(p => p.id === productId);
            if (index === -1) {
                throw new Error('Product not found');
            }
            
            if (updates.price !== undefined || updates.discount !== undefined) {
                const price = updates.price || products[index].price;
                const discount = updates.discount !== undefined ? updates.discount : products[index].discount;
                updates.discountedPrice = discount > 0 
                    ? Utils.calculateDiscount(price, discount)
                    : price;
            }
            
            products[index] = {
                ...products[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            await this.update(CONFIG.BINS.PRODUCTS, { products });
            return products[index];
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    },
    
    async deleteProduct(productId) {
        try {
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            const products = data.products || [];
            
            const filtered = products.filter(p => p.id !== productId);
            await this.update(CONFIG.BINS.PRODUCTS, { products: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    },
    
    async deleteProductsByCategory(categoryId) {
        try {
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            const products = data.products || [];
            
            const filtered = products.filter(p => p.categoryId !== categoryId);
            await this.update(CONFIG.BINS.PRODUCTS, { products: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete products by category error:', error);
            throw error;
        }
    },
    
    async incrementProductSold(productId) {
        try {
            const data = await this.read(CONFIG.BINS.PRODUCTS);
            const products = data.products || [];
            
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index].sold += 1;
                await this.update(CONFIG.BINS.PRODUCTS, { products });
                
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
            const data = await this.read(CONFIG.BINS.ORDERS);
            return data.orders || [];
        } catch (error) {
            console.error('Get orders error:', error);
            return [];
        }
    },
    
    async getOrdersByUser(telegramId) {
        try {
            const orders = await this.getOrders();
            return orders.filter(o => o.telegramId === String(telegramId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get user orders error:', error);
            return [];
        }
    },
    
    async getOrdersByStatus(status) {
        try {
            const orders = await this.getOrders();
            return orders.filter(o => o.status === status)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get orders by status error:', error);
            return [];
        }
    },
    
    async createOrder(orderData) {
        try {
            const data = await this.read(CONFIG.BINS.ORDERS);
            const orders = data.orders || [];
            
            const newOrder = {
                id: Utils.generateId(),
                orderId: Utils.generateOrderId(),
                userId: orderData.userId,
                telegramId: String(orderData.telegramId),
                productId: orderData.productId,
                productName: orderData.productName,
                categoryId: orderData.categoryId,
                categoryName: orderData.categoryName,
                amount: orderData.amount,
                currency: orderData.currency || 'MMK',
                inputValues: orderData.inputValues || {},
                status: 'pending',
                createdAt: new Date().toISOString(),
                processedAt: null,
                processedBy: null
            };
            
            orders.push(newOrder);
            await this.update(CONFIG.BINS.ORDERS, { orders });
            
            // Update user stats
            await this.updateUser(orderData.telegramId, {
                totalOrders: (await this.getUserByTelegramId(orderData.telegramId)).totalOrders + 1
            });
            
            return newOrder;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    },
    
    async updateOrderStatus(orderId, status, processedBy) {
        try {
            const data = await this.read(CONFIG.BINS.ORDERS);
            const orders = data.orders || [];
            
            const index = orders.findIndex(o => o.id === orderId);
            if (index === -1) {
                throw new Error('Order not found');
            }
            
            const order = orders[index];
            order.status = status;
            order.processedAt = new Date().toISOString();
            order.processedBy = processedBy;
            
            await this.update(CONFIG.BINS.ORDERS, { orders });
            
            // Update user stats and handle refund if rejected
            const user = await this.getUserByTelegramId(order.telegramId);
            if (user) {
                if (status === 'approved') {
                    await this.updateUser(order.telegramId, {
                        approvedOrders: user.approvedOrders + 1,
                        totalSpent: user.totalSpent + order.amount
                    });
                    // Increment product and category sold
                    await this.incrementProductSold(order.productId);
                } else if (status === 'rejected') {
                    await this.updateUser(order.telegramId, {
                        rejectedOrders: user.rejectedOrders + 1
                    });
                    // Refund the amount
                    await this.updateUserBalance(order.telegramId, order.amount, 'add');
                }
            }
            
            return order;
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    },
    
    // ===== Top-up Operations =====
    
    async getTopups() {
        try {
            const data = await this.read(CONFIG.BINS.TOPUPS);
            return data.topups || [];
        } catch (error) {
            console.error('Get topups error:', error);
            return [];
        }
    },
    
    async getTopupsByUser(telegramId) {
        try {
            const topups = await this.getTopups();
            return topups.filter(t => t.telegramId === String(telegramId))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get user topups error:', error);
            return [];
        }
    },
    
    async getTopupsByStatus(status) {
        try {
            const topups = await this.getTopups();
            return topups.filter(t => t.status === status)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Get topups by status error:', error);
            return [];
        }
    },
    
    async createTopup(topupData) {
        try {
            const data = await this.read(CONFIG.BINS.TOPUPS);
            const topups = data.topups || [];
            
            const newTopup = {
                id: Utils.generateId(),
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
            await this.update(CONFIG.BINS.TOPUPS, { topups });
            
            return newTopup;
        } catch (error) {
            console.error('Create topup error:', error);
            throw error;
        }
    },
    
    async updateTopupStatus(topupId, status, processedBy) {
        try {
            const data = await this.read(CONFIG.BINS.TOPUPS);
            const topups = data.topups || [];
            
            const index = topups.findIndex(t => t.id === topupId);
            if (index === -1) {
                throw new Error('Topup not found');
            }
            
            const topup = topups[index];
            topup.status = status;
            topup.processedAt = new Date().toISOString();
            topup.processedBy = processedBy;
            
            await this.update(CONFIG.BINS.TOPUPS, { topups });
            
            // Update user balance if approved
            if (status === 'approved') {
                await this.updateUserBalance(topup.telegramId, topup.amount, 'add');
                
                // Update user topup count
                const user = await this.getUserByTelegramId(topup.telegramId);
                if (user) {
                    await this.updateUser(topup.telegramId, {
                        totalTopups: user.totalTopups + 1
                    });
                }
            }
            
            return topup;
        } catch (error) {
            console.error('Update topup status error:', error);
            throw error;
        }
    },
    
    // ===== Banner Operations =====
    
    async getBanners() {
        try {
            const data = await this.read(CONFIG.BINS.BANNERS);
            return data;
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
            const data = await this.read(CONFIG.BINS.BANNERS);
            
            const newBanner = {
                id: Utils.generateId(),
                image: bannerData.image,
                createdAt: new Date().toISOString()
            };
            
            if (type === 'type2') {
                newBanner.categoryId = bannerData.categoryId;
                newBanner.description = bannerData.description || '';
            }
            
            if (!data[type]) {
                data[type] = [];
            }
            
            data[type].push(newBanner);
            await this.update(CONFIG.BINS.BANNERS, data);
            
            return newBanner;
        } catch (error) {
            console.error('Create banner error:', error);
            throw error;
        }
    },
    
    async deleteBanner(bannerId, type = 'type1') {
        try {
            const data = await this.read(CONFIG.BINS.BANNERS);
            
            if (data[type]) {
                data[type] = data[type].filter(b => b.id !== bannerId);
                await this.update(CONFIG.BINS.BANNERS, data);
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
            const data = await this.read(CONFIG.BINS.PAYMENTS);
            return data.payments || [];
        } catch (error) {
            console.error('Get payment methods error:', error);
            return [];
        }
    },
    
    async createPaymentMethod(paymentData) {
        try {
            const data = await this.read(CONFIG.BINS.PAYMENTS);
            const payments = data.payments || [];
            
            const newPayment = {
                id: Utils.generateId(),
                name: paymentData.name,
                address: paymentData.address,
                accountName: paymentData.accountName,
                note: paymentData.note || '',
                icon: paymentData.icon,
                createdAt: new Date().toISOString()
            };
            
            payments.push(newPayment);
            await this.update(CONFIG.BINS.PAYMENTS, { payments });
            
            return newPayment;
        } catch (error) {
            console.error('Create payment method error:', error);
            throw error;
        }
    },
    
    async updatePaymentMethod(paymentId, updates) {
        try {
            const data = await this.read(CONFIG.BINS.PAYMENTS);
            const payments = data.payments || [];
            
            const index = payments.findIndex(p => p.id === paymentId);
            if (index === -1) {
                throw new Error('Payment method not found');
            }
            
            payments[index] = {
                ...payments[index],
                ...updates
            };
            
            await this.update(CONFIG.BINS.PAYMENTS, { payments });
            return payments[index];
        } catch (error) {
            console.error('Update payment method error:', error);
            throw error;
        }
    },
    
    async deletePaymentMethod(paymentId) {
        try {
            const data = await this.read(CONFIG.BINS.PAYMENTS);
            const payments = data.payments || [];
            
            const filtered = payments.filter(p => p.id !== paymentId);
            await this.update(CONFIG.BINS.PAYMENTS, { payments: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete payment method error:', error);
            throw error;
        }
    },
    
    // ===== Input Table Operations =====
    
    async getInputTables() {
        try {
            const data = await this.read(CONFIG.BINS.INPUT_TABLES);
            return data.inputTables || [];
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
            const data = await this.read(CONFIG.BINS.INPUT_TABLES);
            const inputTables = data.inputTables || [];
            
            const newInputTable = {
                id: Utils.generateId(),
                categoryId: inputTableData.categoryId,
                name: inputTableData.name,
                placeholder: inputTableData.placeholder,
                createdAt: new Date().toISOString()
            };
            
            inputTables.push(newInputTable);
            await this.update(CONFIG.BINS.INPUT_TABLES, { inputTables });
            
            return newInputTable;
        } catch (error) {
            console.error('Create input table error:', error);
            throw error;
        }
    },
    
    async updateInputTable(inputTableId, updates) {
        try {
            const data = await this.read(CONFIG.BINS.INPUT_TABLES);
            const inputTables = data.inputTables || [];
            
            const index = inputTables.findIndex(t => t.id === inputTableId);
            if (index === -1) {
                throw new Error('Input table not found');
            }
            
            inputTables[index] = {
                ...inputTables[index],
                ...updates
            };
            
            await this.update(CONFIG.BINS.INPUT_TABLES, { inputTables });
            return inputTables[index];
        } catch (error) {
            console.error('Update input table error:', error);
            throw error;
        }
    },
    
    async deleteInputTable(inputTableId) {
        try {
            const data = await this.read(CONFIG.BINS.INPUT_TABLES);
            const inputTables = data.inputTables || [];
            
            const filtered = inputTables.filter(t => t.id !== inputTableId);
            await this.update(CONFIG.BINS.INPUT_TABLES, { inputTables: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete input table error:', error);
            throw error;
        }
    },
    
    async deleteInputTablesByCategory(categoryId) {
        try {
            const data = await this.read(CONFIG.BINS.INPUT_TABLES);
            const inputTables = data.inputTables || [];
            
            const filtered = inputTables.filter(t => t.categoryId !== categoryId);
            await this.update(CONFIG.BINS.INPUT_TABLES, { inputTables: filtered });
            
            return true;
        } catch (error) {
            console.error('Delete input tables by category error:', error);
            throw error;
        }
    },
    
    // ===== Banned Users Operations =====
    
    async getBannedUsers() {
        try {
            const data = await this.read(CONFIG.BINS.BANNED);
            return data.bannedUsers || [];
        } catch (error) {
            console.error('Get banned users error:', error);
            return [];
        }
    },
    
    async isUserBanned(telegramId) {
        try {
            const bannedUsers = await this.getBannedUsers();
            return bannedUsers.some(u => u.telegramId === String(telegramId));
        } catch (error) {
            console.error('Check banned user error:', error);
            return false;
        }
    },
    
    async banUser(userData, reason = 'Violated terms of service') {
        try {
            const data = await this.read(CONFIG.BINS.BANNED);
            const bannedUsers = data.bannedUsers || [];
            
            // Check if already banned
            if (bannedUsers.some(u => u.telegramId === String(userData.telegramId))) {
                return true;
            }
            
            const bannedUser = {
                id: Utils.generateId(),
                telegramId: String(userData.telegramId),
                username: userData.username || '',
                firstName: userData.firstName || '',
                reason: reason,
                bannedAt: new Date().toISOString(),
                bannedBy: CONFIG.ADMIN_TELEGRAM_ID
            };
            
            bannedUsers.push(bannedUser);
            await this.update(CONFIG.BINS.BANNED, { bannedUsers });
            
            return true;
        } catch (error) {
            console.error('Ban user error:', error);
            throw error;
        }
    },
    
    async unbanUser(telegramId) {
        try {
            const data = await this.read(CONFIG.BINS.BANNED);
            const bannedUsers = data.bannedUsers || [];
            
            const filtered = bannedUsers.filter(u => u.telegramId !== String(telegramId));
            await this.update(CONFIG.BINS.BANNED, { bannedUsers: filtered });
            
            // Reset failed attempts
            await this.updateUser(telegramId, {
                failedPurchaseAttempts: 0,
                lastFailedAttempt: null
            });
            
            return true;
        } catch (error) {
            console.error('Unban user error:', error);
            throw error;
        }
    },
    
    // ===== Statistics =====
    
    async getStats() {
        try {
            const [users, orders, topups, products, categories] = await Promise.all([
                this.getUsers(),
                this.getOrders(),
                this.getTopups(),
                this.getProducts(),
                this.getCategories()
            ]);
            
            const approvedOrders = orders.filter(o => o.status === 'approved');
            const pendingOrders = orders.filter(o => o.status === 'pending');
            const pendingTopups = topups.filter(t => t.status === 'pending');
            
            const totalRevenue = approvedOrders.reduce((sum, o) => sum + o.amount, 0);
            
            return {
                totalUsers: users.length,
                totalOrders: orders.length,
                pendingOrders: pendingOrders.length,
                approvedOrders: approvedOrders.length,
                totalRevenue: totalRevenue,
                pendingTopups: pendingTopups.length,
                totalProducts: products.length,
                totalCategories: categories.length
            };
        } catch (error) {
            console.error('Get stats error:', error);
            return {
                totalUsers: 0,
                totalOrders: 0,
                pendingOrders: 0,
                approvedOrders: 0,
                totalRevenue: 0,
                pendingTopups: 0,
                totalProducts: 0,
                totalCategories: 0
            };
        }
    }
};

// Make Database globally available
window.Database = Database;
