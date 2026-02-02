/* ========================================
   Cookie Consent Manager
   GDPR & Privacy Compliance
   ======================================== */

const CookieConsent = {
    // Config
    cookieName: 'mafiad9_cookie_consent',
    cookieExpiry: 365, // days
    
    // Consent status
    hasConsented: false,
    consentData: null,

    // Initialize
    init() {
        this.checkExistingConsent();
        
        if (!this.hasConsented) {
            this.showBanner();
        }
        
        // Add styles
        this.injectStyles();
    },

    // Check if user already consented
    checkExistingConsent() {
        const consent = localStorage.getItem(this.cookieName);
        
        if (consent) {
            try {
                this.consentData = JSON.parse(consent);
                this.hasConsented = true;
                console.log('[CookieConsent] Existing consent found:', this.consentData);
            } catch (e) {
                this.hasConsented = false;
            }
        }
    },

    // Show consent banner
    showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-overlay"></div>
            <div class="cookie-consent-container">
                <div class="cookie-consent-content">
                    <div class="cookie-icon">🍪</div>
                    <div class="cookie-text">
                        <h3>Cookie & Privacy Consent</h3>
                        <p>We use cookies and collect personal data to provide you with the best experience on our Telegram Mini App. This includes:</p>
                        <ul>
                            <li>🔐 <strong>Essential:</strong> Authentication & security</li>
                            <li>📊 <strong>Analytics:</strong> Usage statistics (optional)</li>
                            <li>💾 <strong>Preferences:</strong> Your settings (optional)</li>
                        </ul>
                        <p class="cookie-policy-link">
                            By clicking "Accept All", you consent to our 
                            <a href="https://mafiad9.vercel.app/privacy-policy.html" target="_blank">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-btn cookie-btn-settings" onclick="CookieConsent.showSettings()">
                        ⚙️ Customize
                    </button>
                    <button class="cookie-btn cookie-btn-reject" onclick="CookieConsent.rejectAll()">
                        ✗ Reject All
                    </button>
                    <button class="cookie-btn cookie-btn-accept" onclick="CookieConsent.acceptAll()">
                        ✓ Accept All
                    </button>
                </div>
            </div>

            <!-- Settings Modal -->
            <div class="cookie-settings-modal" id="cookie-settings-modal">
                <div class="cookie-settings-container">
                    <div class="cookie-settings-header">
                        <h3>🍪 Cookie Settings</h3>
                        <button class="cookie-close-btn" onclick="CookieConsent.hideSettings()">✕</button>
                    </div>
                    <div class="cookie-settings-body">
                        <div class="cookie-option">
                            <div class="cookie-option-info">
                                <h4>🔐 Essential Cookies</h4>
                                <p>Required for basic functionality, authentication, and security. Cannot be disabled.</p>
                            </div>
                            <label class="cookie-toggle disabled">
                                <input type="checkbox" checked disabled>
                                <span class="cookie-slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option-info">
                                <h4>📊 Analytics Cookies</h4>
                                <p>Help us understand how you use our service to improve user experience.</p>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="analytics-consent">
                                <span class="cookie-slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option-info">
                                <h4>💾 Preference Cookies</h4>
                                <p>Remember your settings and preferences for future visits.</p>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="preferences-consent">
                                <span class="cookie-slider"></span>
                            </label>
                        </div>
                        <div class="cookie-option">
                            <div class="cookie-option-info">
                                <h4>📱 Telegram Data</h4>
                                <p>Process your Telegram user data for account management and orders.</p>
                            </div>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="telegram-consent" checked>
                                <span class="cookie-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="cookie-settings-footer">
                        <button class="cookie-btn cookie-btn-reject" onclick="CookieConsent.rejectAll()">
                            Reject All
                        </button>
                        <button class="cookie-btn cookie-btn-accept" onclick="CookieConsent.saveSettings()">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
        
        // Animate in
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);
    },

    // Inject CSS styles
    injectStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Cookie Consent Banner */
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                top: 0;
                z-index: 99999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            #cookie-consent-banner.show {
                opacity: 1;
                visibility: visible;
            }

            .cookie-consent-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
            }

            .cookie-consent-container {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
                border-top: 1px solid #334155;
                padding: 25px;
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
                transform: translateY(100%);
                transition: transform 0.4s ease;
            }

            #cookie-consent-banner.show .cookie-consent-container {
                transform: translateY(0);
            }

            .cookie-consent-content {
                display: flex;
                gap: 20px;
                max-width: 900px;
                margin: 0 auto;
            }

            .cookie-icon {
                font-size: 50px;
                flex-shrink: 0;
            }

            .cookie-text h3 {
                color: #F8FAFC;
                font-size: 1.3rem;
                margin-bottom: 10px;
                font-weight: 600;
            }

            .cookie-text p {
                color: #94A3B8;
                font-size: 0.9rem;
                margin-bottom: 10px;
                line-height: 1.5;
            }

            .cookie-text ul {
                list-style: none;
                padding: 0;
                margin: 10px 0;
            }

            .cookie-text li {
                color: #94A3B8;
                font-size: 0.85rem;
                margin-bottom: 5px;
            }

            .cookie-policy-link a {
                color: #6366F1;
                text-decoration: none;
            }

            .cookie-policy-link a:hover {
                text-decoration: underline;
            }

            .cookie-consent-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-top: 20px;
                flex-wrap: wrap;
            }

            .cookie-btn {
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                border: none;
                transition: all 0.3s ease;
            }

            .cookie-btn-accept {
                background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                color: white;
            }

            .cookie-btn-accept:hover {
                transform: scale(1.05);
                box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
            }

            .cookie-btn-reject {
                background: transparent;
                color: #94A3B8;
                border: 1px solid #334155;
            }

            .cookie-btn-reject:hover {
                background: rgba(239, 68, 68, 0.1);
                border-color: #EF4444;
                color: #EF4444;
            }

            .cookie-btn-settings {
                background: transparent;
                color: #6366F1;
                border: 1px solid #6366F1;
            }

            .cookie-btn-settings:hover {
                background: rgba(99, 102, 241, 0.1);
            }

            /* Settings Modal */
            .cookie-settings-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 100000;
            }

            .cookie-settings-modal.show {
                opacity: 1;
                visibility: visible;
            }

            .cookie-settings-container {
                background: #1E293B;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                border: 1px solid #334155;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }

            .cookie-settings-modal.show .cookie-settings-container {
                transform: scale(1);
            }

            .cookie-settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #334155;
            }

            .cookie-settings-header h3 {
                color: #F8FAFC;
                font-size: 1.2rem;
                margin: 0;
            }

            .cookie-close-btn {
                background: transparent;
                border: none;
                color: #94A3B8;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                line-height: 1;
            }

            .cookie-close-btn:hover {
                color: #EF4444;
            }

            .cookie-settings-body {
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
            }

            .cookie-option {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #0F172A;
                border-radius: 12px;
                margin-bottom: 10px;
            }

            .cookie-option-info h4 {
                color: #F8FAFC;
                font-size: 0.95rem;
                margin-bottom: 5px;
            }

            .cookie-option-info p {
                color: #64748B;
                font-size: 0.8rem;
                margin: 0;
            }

            /* Toggle Switch */
            .cookie-toggle {
                position: relative;
                width: 50px;
                height: 26px;
                flex-shrink: 0;
            }

            .cookie-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .cookie-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: #334155;
                border-radius: 26px;
                transition: 0.3s;
            }

            .cookie-slider::before {
                position: absolute;
                content: "";
                height: 20px;
                width: 20px;
                left: 3px;
                bottom: 3px;
                background: white;
                border-radius: 50%;
                transition: 0.3s;
            }

            .cookie-toggle input:checked + .cookie-slider {
                background: #10B981;
            }

            .cookie-toggle input:checked + .cookie-slider::before {
                transform: translateX(24px);
            }

            .cookie-toggle.disabled .cookie-slider {
                background: #10B981;
                opacity: 0.7;
                cursor: not-allowed;
            }

            .cookie-settings-footer {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                padding: 20px;
                border-top: 1px solid #334155;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .cookie-consent-content {
                    flex-direction: column;
                    text-align: center;
                }

                .cookie-icon {
                    font-size: 40px;
                }

                .cookie-consent-buttons {
                    flex-direction: column;
                }

                .cookie-btn {
                    width: 100%;
                }

                .cookie-option {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },

    // Show settings modal
    showSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.add('show');
        }
    },

    // Hide settings modal
    hideSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // Accept all cookies
    acceptAll() {
        const consent = {
            essential: true,
            analytics: true,
            preferences: true,
            telegram: true,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        this.saveConsent(consent);
        this.hideBanner();
        this.showToast('✅ All cookies accepted');
    },

    // Reject all (except essential)
    rejectAll() {
        const consent = {
            essential: true,
            analytics: false,
            preferences: false,
            telegram: false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        this.saveConsent(consent);
        this.hideBanner();
        this.showToast('Cookie preferences saved');
    },

    // Save custom settings
    saveSettings() {
        const consent = {
            essential: true,
            analytics: document.getElementById('analytics-consent')?.checked || false,
            preferences: document.getElementById('preferences-consent')?.checked || false,
            telegram: document.getElementById('telegram-consent')?.checked || false,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        this.saveConsent(consent);
        this.hideSettings();
        this.hideBanner();
        this.showToast('✅ Cookie preferences saved');
    },

    // Save consent to localStorage
    saveConsent(consent) {
        localStorage.setItem(this.cookieName, JSON.stringify(consent));
        this.consentData = consent;
        this.hasConsented = true;
        
        console.log('[CookieConsent] Consent saved:', consent);
        
        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consent }));
    },

    // Hide banner
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 400);
        }
    },

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cookie-toast';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #10B981;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 100001;
            animation: toastIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Check specific consent
    hasConsentFor(type) {
        if (!this.consentData) return false;
        return this.consentData[type] === true;
    },

    // Reset consent (for testing)
    resetConsent() {
        localStorage.removeItem(this.cookieName);
        this.hasConsented = false;
        this.consentData = null;
        location.reload();
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CookieConsent.init());
} else {
    CookieConsent.init();
}

// Make global
window.CookieConsent = CookieConsent;
