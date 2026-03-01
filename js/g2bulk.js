// ===== G2Bulk API Integration =====
// Handles automatic in-game topup delivery via g2bulk.com API

const G2Bulk = {
    // Configuration
    config: null,
    
    // Initialize G2Bulk module
    async init() {
        try {
            console.log('🎮 Initializing G2Bulk module...');
            
            // Load G2Bulk config from database
            this.config = await Database.getG2BulkConfig();
            
            if (!this.config.apiKey || this.config.apiKey === 'YOUR_G2BULK_API_KEY') {
                console.warn('⚠️ G2Bulk API key not configured');
                return false;
            }
            
            // Verify API connection
            const balance = await this.getBalance();
            if (balance !== null) {
                console.log('✅ G2Bulk connected. Balance:', balance);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ G2Bulk init error:', error);
            return false;
        }
    },
    
    // Get API balance
    async getBalance() {
        try {
            const response = await fetch(`${CONFIG.G2BULK.API_BASE_URL}/account/balance`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const balance = data.balance || 0;
                
                // Update balance in database
                await this.updateBalance(balance);
                
                return balance;
            }
            
            console.error('❌ Balance check failed:', response.status);
            return null;
        } catch (error) {
            console.error('❌ Balance fetch error:', error);
            return null;
        }
    },
    
    // Update balance in config
    async updateBalance(balance) {
        try {
            this.config.apiBalance = balance;
            this.config.apiBalanceUpdatedAt = new Date().toISOString();
            await Database.updateG2BulkConfig(this.config);
        } catch (error) {
            console.error('❌ Update balance error:', error);
        }
    },
    
    // Get available games
    async getGames() {
        try {
            const response = await fetch(`${CONFIG.G2BULK.API_BASE_URL}/games`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            console.error('❌ Get games failed:', response.status);
            return [];
        } catch (error) {
            console.error('❌ Get games error:', error);
            return [];
        }
    },
    
    // Get services for a game
    async getServices(gameId) {
        try {
            const response = await fetch(`${CONFIG.G2BULK.API_BASE_URL}/games/${gameId}/services`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            console.error('❌ Get services failed:', response.status);
            return [];
        } catch (error) {
            console.error('❌ Get services error:', error);
            return [];
        }
    },
    
    // Create topup order
    async createTopup(gameId, serviceId, playerId, playerName, amount) {
        try {
            console.log('🔄 Creating G2Bulk topup:', { gameId, serviceId, playerId, amount });
            
            const payload = {
                game_id: gameId,
                service_id: serviceId,
                player_id: playerId,
                player_name: playerName,
                amount: amount,
                note: `Topup for ${playerName} - ${new Date().toISOString()}`
            };
            
            const response = await fetch(`${CONFIG.G2BULK.API_BASE_URL}/topups`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Topup created:', data.order_id);
                
                // Log the sync
                await this.logSync('CREATE_TOPUP', 'success', `Order ${data.order_id} created`, {
                    gameId, serviceId, playerId, amount
                });
                
                return {
                    success: true,
                    orderId: data.order_id,
                    status: data.status || 'pending',
                    response: data
                };
            } else {
                console.error('❌ Topup creation failed:', data);
                
                await this.logSync('CREATE_TOPUP', 'failed', data.message || 'Unknown error', data);
                
                return {
                    success: false,
                    error: data.message || 'Failed to create topup',
                    response: data
                };
            }
        } catch (error) {
            console.error('❌ Create topup error:', error);
            
            await this.logSync('CREATE_TOPUP', 'error', error.message, {});
            
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Get topup status
    async getTopupStatus(orderId) {
        try {
            const response = await fetch(`${CONFIG.G2BULK.API_BASE_URL}/topups/${orderId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    success: true,
                    status: data.status,
                    response: data
                };
            }
            
            console.error('❌ Get status failed:', response.status);
            return {
                success: false,
                error: `HTTP ${response.status}`
            };
        } catch (error) {
            console.error('❌ Get status error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Process product order - main entry point for topups
    async processOrder(orderId, productData, playerId, playerName) {
        try {
            console.log('🎯 Processing G2Bulk order:', orderId);
            
            // Get order from database
            const order = await Database.getOrderById(orderId);
            if (!order) {
                throw new Error(`Order ${orderId} not found`);
            }
            
            // Create game topup record
            const gameTopup = {
                id: Utils.generateId(),
                orderId: orderId,
                userId: order.userId,
                telegramId: order.telegramId,
                productId: order.productId,
                productName: order.productName,
                playerId: playerId,
                playerName: playerName,
                gameId: productData.gameId,
                serviceId: productData.serviceId,
                amount: order.amount,
                apiCost: productData.apiCost || 0,
                apiProfit: order.amount - (productData.apiCost || 0),
                currency: order.currency,
                status: 'processing',
                retryCount: 0,
                createdAt: new Date().toISOString()
            };
            
            // Save initial record
            await Database.saveGameTopup(gameTopup);
            
            // Create topup on G2Bulk
            const result = await this.createTopup(
                productData.gameId,
                productData.serviceId,
                playerId,
                playerName,
                order.amount
            );
            
            if (result.success) {
                // Update game topup with G2Bulk order ID
                gameTopup.g2bulkOrderId = result.orderId;
                gameTopup.status = result.status;
                gameTopup.apiResponse = result.response;
                
                // Update database
                await Database.updateGameTopup(gameTopup);
                
                // Update original order status
                order.status = 'approved';
                order.processedAt = new Date().toISOString();
                await Database.updateOrder(order);
                
                // Deduct from user balance immediately (virtual wallet)
                const user = await Database.getUserById(order.userId);
                user.balance -= order.amount;
                user.totalSpent = (user.totalSpent || 0) + order.amount;
                await Database.updateUser(user);
                
                console.log('✅ Order processed successfully');
                return {
                    success: true,
                    gameTopupId: gameTopup.id,
                    g2bulkOrderId: result.orderId
                };
            } else {
                // Mark as failed
                gameTopup.status = 'failed';
                gameTopup.errorMessage = result.error;
                gameTopup.apiResponse = result.response;
                await Database.updateGameTopup(gameTopup);
                
                // Mark order as pending (for admin retry)
                order.status = 'pending';
                await Database.updateOrder(order);
                
                console.error('❌ Order processing failed');
                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            console.error('❌ Process order error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Retry failed topup
    async retryTopup(gameTopupId) {
        try {
            console.log('🔄 Retrying topup:', gameTopupId);
            
            const gameTopup = await Database.getGameTopup(gameTopupId);
            if (!gameTopup) {
                throw new Error('Game topup not found');
            }
            
            // Check retry attempts
            if (gameTopup.retryCount >= CONFIG.G2BULK.RETRY_ATTEMPTS) {
                throw new Error('Max retry attempts reached');
            }
            
            gameTopup.retryCount++;
            gameTopup.lastRetryAt = new Date().toISOString();
            
            // Try creating again
            const result = await this.createTopup(
                gameTopup.gameId,
                gameTopup.serviceId,
                gameTopup.playerId,
                gameTopup.playerName,
                gameTopup.amount
            );
            
            if (result.success) {
                gameTopup.g2bulkOrderId = result.orderId;
                gameTopup.status = result.status;
                gameTopup.apiResponse = result.response;
                gameTopup.errorMessage = null;
            } else {
                gameTopup.errorMessage = result.error;
                gameTopup.apiResponse = result.response;
            }
            
            // Save retry attempt
            await Database.updateGameTopup(gameTopup);
            
            return result;
        } catch (error) {
            console.error('❌ Retry error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // Check and sync topup status
    async syncTopupStatus(g2bulkOrderId, gameTopupId) {
        try {
            const result = await this.getTopupStatus(g2bulkOrderId);
            
            if (result.success) {
                const gameTopup = await Database.getGameTopup(gameTopupId);
                gameTopup.status = result.status;
                gameTopup.apiResponse = result.response;
                gameTopup.updatedAt = new Date().toISOString();
                
                // If completed, mark order as completed
                if (result.status === 'completed') {
                    gameTopup.completedAt = new Date().toISOString();
                    
                    const order = await Database.getOrderById(gameTopup.orderId);
                    order.status = 'completed';
                    order.processedAt = gameTopup.completedAt;
                    await Database.updateOrder(order);
                }
                
                await Database.updateGameTopup(gameTopup);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Sync status error:', error);
            return false;
        }
    },
    
    // Log sync actions
    async logSync(action, status, message, details) {
        try {
            const log = {
                timestamp: new Date().toISOString(),
                action,
                status,
                message,
                details
            };
            
            this.config.syncLogs = this.config.syncLogs || [];
            this.config.syncLogs.unshift(log);
            
            // Keep only last 100 logs
            if (this.config.syncLogs.length > 100) {
                this.config.syncLogs = this.config.syncLogs.slice(0, 100);
            }
            
            await Database.updateG2BulkConfig(this.config);
        } catch (error) {
            console.error('❌ Log sync error:', error);
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = G2Bulk;
}
