// ===== Telegram WebApp Integration =====

const TelegramApp = {
    // Telegram WebApp instance
    webapp: null,
    user: null,
    isReady: false,
    
    // Initialize Telegram WebApp
    init() {
        return new Promise((resolve, reject) => {
            try {
                // Check if running in Telegram
                if (typeof Telegram === 'undefined' || !Telegram.WebApp) {
                    reject(new Error('Not running in Telegram'));
                    return;
                }
                
                this.webapp = Telegram.WebApp;
                
                // Expand the webapp
                this.webapp.expand();
                
                // Set theme
                this.applyTheme();
                
                // Get user data
                if (this.webapp.initDataUnsafe && this.webapp.initDataUnsafe.user) {
                    this.user = this.webapp.initDataUnsafe.user;
                    this.isReady = true;
                    resolve(this.user);
                } else {
                    reject(new Error('No user data available'));
                }
                
                // Setup event listeners
                this.setupEventListeners();
                
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Check if running in Telegram
    isInTelegram() {
        return typeof Telegram !== 'undefined' && 
               Telegram.WebApp && 
               Telegram.WebApp.initDataUnsafe && 
               Telegram.WebApp.initDataUnsafe.user;
    },
    
    // Get current user
    getUser() {
        return this.user;
    },
    
    // Get user ID
    getUserId() {
        return this.user ? String(this.user.id) : null;
    },
    
    // Check if user is admin
    isAdmin() {
        return this.getUserId() === CONFIG.ADMIN_TELEGRAM_ID;
    },
    
    // Check if user is premium
    isPremium() {
        return this.user ? this.user.is_premium === true : false;
    },
    
    // Apply Telegram theme
    applyTheme() {
        if (!this.webapp) return;
        
        const colorScheme = this.webapp.colorScheme || 'dark';
        document.documentElement.setAttribute('data-theme', colorScheme);
        
        // Apply Telegram theme colors if available
        if (this.webapp.themeParams) {
            const root = document.documentElement;
            const params = this.webapp.themeParams;
            
            if (params.bg_color) {
                root.style.setProperty('--tg-bg-color', params.bg_color);
            }
            if (params.text_color) {
                root.style.setProperty('--tg-text-color', params.text_color);
            }
            if (params.hint_color) {
                root.style.setProperty('--tg-hint-color', params.hint_color);
            }
            if (params.button_color) {
                root.style.setProperty('--tg-button-color', params.button_color);
            }
            if (params.button_text_color) {
                root.style.setProperty('--tg-button-text-color', params.button_text_color);
            }
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        if (!this.webapp) return;
        
        // Theme changed event
        this.webapp.onEvent('themeChanged', () => {
            this.applyTheme();
        });
        
        // Viewport changed event
        this.webapp.onEvent('viewportChanged', (event) => {
            if (event.isStateStable) {
                // Viewport is stable, can perform actions
            }
        });
        
        // Main button clicked
        this.webapp.onEvent('mainButtonClicked', () => {
            // Handle main button click
            if (typeof window.onMainButtonClick === 'function') {
                window.onMainButtonClick();
            }
        });
        
        // Back button clicked
        this.webapp.onEvent('backButtonClicked', () => {
            // Handle back button click
            if (typeof window.onBackButtonClick === 'function') {
                window.onBackButtonClick();
            } else {
                window.history.back();
            }
        });
    },
    
    // Show main button
    showMainButton(text, onClick) {
        if (!this.webapp) return;
        
        this.webapp.MainButton.setText(text);
        this.webapp.MainButton.show();
        
        if (onClick) {
            window.onMainButtonClick = onClick;
        }
    },
    
    // Hide main button
    hideMainButton() {
        if (!this.webapp) return;
        this.webapp.MainButton.hide();
    },
    
    // Show back button
    showBackButton() {
        if (!this.webapp) return;
        this.webapp.BackButton.show();
    },
    
    // Hide back button
    hideBackButton() {
        if (!this.webapp) return;
        this.webapp.BackButton.hide();
    },
    
    // Show alert
    showAlert(message) {
        if (this.webapp) {
            this.webapp.showAlert(message);
        } else {
            alert(message);
        }
    },
    
    // Show confirm
    showConfirm(message) {
        return new Promise((resolve) => {
            if (this.webapp) {
                this.webapp.showConfirm(message, (confirmed) => {
                    resolve(confirmed);
                });
            } else {
                resolve(confirm(message));
            }
        });
    },
    
    // Show popup
    showPopup(params) {
        return new Promise((resolve) => {
            if (this.webapp && this.webapp.showPopup) {
                this.webapp.showPopup(params, (buttonId) => {
                    resolve(buttonId);
                });
            } else {
                // Fallback
                const result = confirm(params.message);
                resolve(result ? 'ok' : 'cancel');
            }
        });
    },
    
    // Close webapp
    close() {
        if (this.webapp) {
            this.webapp.close();
        }
    },
    
    // Ready signal
    ready() {
        if (this.webapp) {
            this.webapp.ready();
        }
    },
    
    // Enable closing confirmation
    enableClosingConfirmation() {
        if (this.webapp) {
            this.webapp.enableClosingConfirmation();
        }
    },
    
    // Disable closing confirmation
    disableClosingConfirmation() {
        if (this.webapp) {
            this.webapp.disableClosingConfirmation();
        }
    },
    
    // Haptic feedback
    hapticFeedback(type = 'impact', style = 'medium') {
        if (!this.webapp || !this.webapp.HapticFeedback) return;
        
        switch (type) {
            case 'impact':
                this.webapp.HapticFeedback.impactOccurred(style);
                break;
            case 'notification':
                this.webapp.HapticFeedback.notificationOccurred(style);
                break;
            case 'selection':
                this.webapp.HapticFeedback.selectionChanged();
                break;
        }
    },
    
    // Open link
    openLink(url, options = {}) {
        if (this.webapp) {
            this.webapp.openLink(url, options);
        } else {
            window.open(url, '_blank');
        }
    },
    
    // Open Telegram link
    openTelegramLink(url) {
        if (this.webapp) {
            this.webapp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    },
    
    // Share URL
    shareUrl(url, text = '') {
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        this.openTelegramLink(shareUrl);
    },
    
    // Share to story (if available)
    shareToStory(mediaUrl, params = {}) {
        if (this.webapp && this.webapp.shareToStory) {
            this.webapp.shareToStory(mediaUrl, params);
        }
    },
    
    // Request contact
    requestContact() {
        return new Promise((resolve, reject) => {
            if (this.webapp && this.webapp.requestContact) {
                this.webapp.requestContact((sent) => {
                    if (sent) {
                        resolve(true);
                    } else {
                        reject(new Error('Contact request cancelled'));
                    }
                });
            } else {
                reject(new Error('Contact request not supported'));
            }
        });
    },
    
    // Cloud Storage operations
    cloudStorage: {
        async setItem(key, value) {
            return new Promise((resolve, reject) => {
                if (TelegramApp.webapp && TelegramApp.webapp.CloudStorage) {
                    TelegramApp.webapp.CloudStorage.setItem(key, value, (error, success) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(success);
                        }
                    });
                } else {
                    // Fallback to localStorage
                    Utils.storage.set(key, value);
                    resolve(true);
                }
            });
        },
        
        async getItem(key) {
            return new Promise((resolve, reject) => {
                if (TelegramApp.webapp && TelegramApp.webapp.CloudStorage) {
                    TelegramApp.webapp.CloudStorage.getItem(key, (error, value) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(value);
                        }
                    });
                } else {
                    // Fallback to localStorage
                    resolve(Utils.storage.get(key));
                }
            });
        },
        
        async getItems(keys) {
            return new Promise((resolve, reject) => {
                if (TelegramApp.webapp && TelegramApp.webapp.CloudStorage) {
                    TelegramApp.webapp.CloudStorage.getItems(keys, (error, values) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(values);
                        }
                    });
                } else {
                    // Fallback to localStorage
                    const values = {};
                    keys.forEach(key => {
                        values[key] = Utils.storage.get(key);
                    });
                    resolve(values);
                }
            });
        },
        
        async removeItem(key) {
            return new Promise((resolve, reject) => {
                if (TelegramApp.webapp && TelegramApp.webapp.CloudStorage) {
                    TelegramApp.webapp.CloudStorage.removeItem(key, (error, success) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(success);
                        }
                    });
                } else {
                    Utils.storage.remove(key);
                    resolve(true);
                }
            });
        },
        
        async getKeys() {
            return new Promise((resolve, reject) => {
                if (TelegramApp.webapp && TelegramApp.webapp.CloudStorage) {
                    TelegramApp.webapp.CloudStorage.getKeys((error, keys) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(keys);
                        }
                    });
                } else {
                    resolve(Object.keys(localStorage));
                }
            });
        }
    },
    
    // Send data to bot
    sendData(data) {
        if (this.webapp) {
            this.webapp.sendData(JSON.stringify(data));
        }
    },
    
    // Get init data for verification
    getInitData() {
        return this.webapp ? this.webapp.initData : '';
    },
    
    // Get init data unsafe (parsed)
    getInitDataUnsafe() {
        return this.webapp ? this.webapp.initDataUnsafe : {};
    }
};

// ===== Telegram Bot API Functions =====

const TelegramBot = {
    botToken: CONFIG.BOT_TOKEN,
    apiUrl: 'https://api.telegram.org/bot',
    
    // Send message to user
    async sendMessage(chatId, text, options = {}) {
        try {
            const params = {
                chat_id: chatId,
                text: text,
                parse_mode: options.parseMode || 'HTML',
                ...options
            };
            
            const response = await fetch(`${this.apiUrl}${this.botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    },
    
    // Send photo to user
    async sendPhoto(chatId, photo, caption = '', options = {}) {
        try {
            const params = {
                chat_id: chatId,
                photo: photo,
                caption: caption,
                parse_mode: options.parseMode || 'HTML',
                ...options
            };
            
            const response = await fetch(`${this.apiUrl}${this.botToken}/sendPhoto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(params)
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Send photo error:', error);
            throw error;
        }
    },
    
    // Send notification to admin
    async notifyAdmin(message) {
        return this.sendMessage(CONFIG.ADMIN_TELEGRAM_ID, message);
    },
    
    // Send order notification to admin
    async notifyNewOrder(order, user) {
        const message = `
🛒 <b>New Order Received!</b>

📦 <b>Product:</b> ${order.productName}
💰 <b>Amount:</b> ${Utils.formatCurrency(order.amount, order.currency)}
🆔 <b>Order ID:</b> ${order.orderId}

👤 <b>Customer:</b> ${user.firstName} ${user.lastName || ''}
📱 <b>Username:</b> @${user.username || 'N/A'}
🔢 <b>Telegram ID:</b> ${user.telegramId}

📝 <b>Input Values:</b>
${Object.entries(order.inputValues).map(([k, v]) => `• ${k}: ${v}`).join('\n')}

⏰ <b>Time:</b> ${Utils.formatDate(order.createdAt, 'long')}
        `;
        
        return this.notifyAdmin(message);
    },
    
    // Send topup notification to admin
    async notifyNewTopup(topup, user) {
        const message = `
💳 <b>New Top-Up Request!</b>

💰 <b>Amount:</b> ${Utils.formatCurrency(topup.amount, 'MMK')}
💳 <b>Payment Method:</b> ${topup.paymentMethod}

👤 <b>Customer:</b> ${user.firstName} ${user.lastName || ''}
📱 <b>Username:</b> @${user.username || 'N/A'}
🔢 <b>Telegram ID:</b> ${user.telegramId}

⏰ <b>Time:</b> ${Utils.formatDate(topup.createdAt, 'long')}

📸 Payment proof has been uploaded.
        `;
        
        return this.notifyAdmin(message);
    },
    
    // Send order status update to user
    async notifyOrderStatus(order, status) {
        let emoji, statusText, additionalText = '';
        
        if (status === 'approved') {
            emoji = '✅';
            statusText = 'Approved';
            additionalText = '\n\n🎮 Your order has been processed successfully. Please check your game account!';
        } else if (status === 'rejected') {
            emoji = '❌';
            statusText = 'Rejected';
            additionalText = '\n\n💰 Your payment has been refunded to your wallet balance.';
        }
        
        const message = `
${emoji} <b>Order ${statusText}!</b>

📦 <b>Product:</b> ${order.productName}
💰 <b>Amount:</b> ${Utils.formatCurrency(order.amount, order.currency)}
🆔 <b>Order ID:</b> ${order.orderId}
${additionalText}
        `;
        
        return this.sendMessage(order.telegramId, message);
    },
    
    // Send topup status update to user
    async notifyTopupStatus(topup, status) {
        let emoji, statusText, additionalText = '';
        
        if (status === 'approved') {
            emoji = '✅';
            statusText = 'Approved';
            additionalText = `\n\n💰 ${Utils.formatCurrency(topup.amount, 'MMK')} has been added to your wallet!`;
        } else if (status === 'rejected') {
            emoji = '❌';
            statusText = 'Rejected';
            additionalText = '\n\n⚠️ Your top-up request was rejected. Please contact support if you have any questions.';
        }
        
        const message = `
${emoji} <b>Top-Up ${statusText}!</b>

💰 <b>Amount:</b> ${Utils.formatCurrency(topup.amount, 'MMK')}
💳 <b>Method:</b> ${topup.paymentMethod}
${additionalText}
        `;
        
        return this.sendMessage(topup.telegramId, message);
    },
    
    // Send ban notification to user
    async notifyBan(telegramId, reason) {
        const message = `
⛔ <b>Account Banned</b>

Your account has been banned from using this service.

<b>Reason:</b> ${reason}

If you believe this is a mistake, please contact support.
        `;
        
        return this.sendMessage(telegramId, message);
    },
    
    // Send unban notification to user
    async notifyUnban(telegramId) {
        const message = `
✅ <b>Account Unbanned</b>

Your account has been unbanned. You can now use the service again.

Thank you for your patience!
        `;
        
        return this.sendMessage(telegramId, message);
    },
    
    // Broadcast message to all users
    async broadcast(userIds, message, photo = null) {
        const results = {
            success: 0,
            failed: 0
        };
        
        for (const userId of userIds) {
            try {
                if (photo) {
                    await this.sendPhoto(userId, photo, message);
                } else {
                    await this.sendMessage(userId, message);
                }
                results.success++;
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`Broadcast to ${userId} failed:`, error);
                results.failed++;
            }
        }
        
        return results;
    },
    
    // Generate OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    // Send OTP to user
    async sendOTP(telegramId, otp) {
        const message = `
🔐 <b>Verification Code</b>

Your OTP code is: <code>${otp}</code>

⚠️ Do not share this code with anyone.
⏰ This code will expire in 5 minutes.
        `;
        
        return this.sendMessage(telegramId, message);
    }
};

// Make globally available
window.TelegramApp = TelegramApp;
window.TelegramBot = TelegramBot;
