// ===== Utility Functions =====

const Utils = {
    // Generate unique ID
    generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    // Generate order ID
    generateOrderId() {
        return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
    },
    
    // Format currency
    formatCurrency(amount, currency = 'MMK') {
        return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
    },
    
    // Format date
    formatDate(dateString, format = 'short') {
        const date = new Date(dateString);
        const options = format === 'short' 
            ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    },
    
    // Time ago
    timeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };
        
        for (const [unit, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
            }
        }
        return 'Just now';
    },
    
    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast') || document.getElementById('admin-toast');
        if (!toast) return;
        
        const iconMap = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        
        toast.className = `toast ${type}`;
        toast.querySelector('.toast-icon').innerHTML = iconMap[type] || iconMap.info;
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    },
    
    // Show loading overlay
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loading-overlay') || document.getElementById('admin-loading');
        if (overlay) {
            overlay.querySelector('span').textContent = message;
            overlay.classList.remove('hidden');
        }
    },
    
    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay') || document.getElementById('admin-loading');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },
    
    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    },
    
    // Compress image
    async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            
            img.src = URL.createObjectURL(file);
        });
    },
    
    // Check if image is NSFW (basic check - in production use proper API)
    async checkNSFW(imageBase64) {
        // Basic implementation - in production, integrate with actual NSFW detection API
        // This is a placeholder that always returns false (safe)
        // You should integrate with services like Google Vision API, AWS Rekognition, etc.
        return false;
    },
    
    // Validate input
    validateInput(value, type = 'text') {
        if (!value || value.trim() === '') return false;
        
        switch (type) {
            case 'number':
                return !isNaN(value) && Number(value) > 0;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'phone':
                return /^[0-9]{9,15}$/.test(value.replace(/\D/g, ''));
            default:
                return value.trim().length > 0;
        }
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Calculate discounted price
    calculateDiscount(price, discountPercent) {
        const discount = (price * discountPercent) / 100;
        return Math.round(price - discount);
    },
    
    // Create particles for intro animation
    createParticles(container, count = 50) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(particle);
        }
    },
    
    // Scroll to element
    scrollTo(element, offset = 0) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        }
    },
    
    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Storage remove error:', e);
                return false;
            }
        },
        
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (e) {
                console.error('Storage clear error:', e);
                return false;
            }
        }
    },
    
    // Session storage helpers
    session: {
        set(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Session set error:', e);
                return false;
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = sessionStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Session get error:', e);
                return defaultValue;
            }
        },
        
        remove(key) {
            sessionStorage.removeItem(key);
        }
    },
    
    // Check if today
    isToday(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },
    
    // Get today's date string
    getTodayString() {
        return new Date().toISOString().split('T')[0];
    },
    
    // Random color generator
    randomColor() {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    },
    
    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Parse HTML safely
    parseHtml(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content;
    }
};

// Make Utils globally available
window.Utils = Utils;
