// Telegram WebApp Verification API Endpoint

const crypto = require('crypto');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { initData } = req.body;
        
        if (!initData) {
            return res.status(400).json({ error: 'Missing initData' });
        }
        
        // Parse initData
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');
        
        // Sort parameters
        const sortedParams = [...params.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        
        // Bot token
        const BOT_TOKEN = process.env.BOT_TOKEN || '8235749023:AAG95jVQaXjtPqRXU5KZyJyWXEk5sUrIybg';
        
        // Create secret key
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(BOT_TOKEN)
            .digest();
        
        // Calculate hash
        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(sortedParams)
            .digest('hex');
        
        // Verify hash
        if (calculatedHash !== hash) {
            return res.status(401).json({ 
                valid: false, 
                error: 'Invalid hash' 
            });
        }
        
        // Parse user data
        const userDataString = params.get('user');
        const user = userDataString ? JSON.parse(userDataString) : null;
        
        // Check auth date (valid for 24 hours)
        const authDate = parseInt(params.get('auth_date'));
        const now = Math.floor(Date.now() / 1000);
        
        if (now - authDate > 86400) {
            return res.status(401).json({ 
                valid: false, 
                error: 'Auth data expired' 
            });
        }
        
        return res.status(200).json({
            valid: true,
            user: user,
            authDate: authDate
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};
