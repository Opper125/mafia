#!/usr/bin/env node

/**
 * G2Bulk JSONBin Setup Script
 * 
 * This script helps you create the necessary BINs on JSONBin.io for G2Bulk integration.
 * 
 * Usage:
 *   node scripts/setup-g2bulk-bins.js YOUR_JSONBIN_API_KEY
 * 
 * To get your JSONBin API key:
 *   1. Go to https://jsonbin.io
 *   2. Sign up or login
 *   3. Go to your profile/account settings
 *   4. Copy your API key
 */

const https = require('https');

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ JSONBin API key is required!');
    console.error('Usage: node scripts/setup-g2bulk-bins.js YOUR_JSONBIN_API_KEY');
    process.exit(1);
}

const JSONBIN_API_KEY = args[0];
const BASE_URL = 'https://api.jsonbin.io/v3/b';

// BIN templates
const BINS = {
    G2BULK_CONFIG: {
        name: 'G2BULK_CONFIG',
        data: {
            apiKey: '49d362166965e9d793931148a7aba193e0200fbd42c6b7fb1aff4047b4cc0cc2',
            webhookSecret: 'YOUR_WEBHOOK_SECRET',
            autoVerify: true,
            retryAttempts: 3,
            retryDelay: 5000,
            lastSyncedAt: new Date().toISOString(),
            apiBalance: 0,
            apiBalanceUpdatedAt: new Date().toISOString(),
            syncLogs: []
        }
    },
    G2BULK_PRODUCTS: {
        name: 'G2BULK_PRODUCTS',
        data: {
            products: [],
            lastUpdated: new Date().toISOString()
        }
    },
    GAME_TOPUPS: {
        name: 'GAME_TOPUPS',
        data: {
            topups: []
        }
    }
};

// Create a BIN on JSONBin
async function createBin(binName, binData) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(binData);
        
        const options = {
            hostname: 'api.jsonbin.io',
            path: '/v3/b',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Name': binName,
                'X-Bin-Private': 'true'
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.metadata && result.metadata.id) {
                        resolve({
                            success: true,
                            binId: result.metadata.id,
                            name: binName
                        });
                    } else {
                        reject(new Error('No BIN ID in response'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Main function
async function main() {
    console.log('🚀 Starting G2Bulk JSONBin Setup...\n');
    
    const results = {};
    
    for (const [key, bin] of Object.entries(BINS)) {
        try {
            console.log(`📦 Creating ${bin.name} BIN...`);
            const result = await createBin(bin.name, bin.data);
            results[key] = result.binId;
            console.log(`✅ ${bin.name} created successfully!`);
            console.log(`   BIN ID: ${result.binId}\n`);
        } catch (error) {
            console.error(`❌ Failed to create ${bin.name}:`, error.message, '\n');
        }
    }
    
    // Display summary
    console.log('\n📋 =================================================');
    console.log('   BIN CREATION SUMMARY');
    console.log('=================================================\n');
    
    let allSuccess = true;
    for (const [key, binId] of Object.entries(results)) {
        console.log(`✅ ${key}:`);
        console.log(`   ${binId}\n`);
    }
    
    if (Object.keys(results).length < 3) {
        allSuccess = false;
        console.log('❌ Some BINs failed to create!\n');
    }
    
    // Instructions
    console.log('📝 =================================================');
    console.log('   NEXT STEPS');
    console.log('=================================================\n');
    console.log('1. Copy the BIN IDs above');
    console.log('2. Open /js/config.js');
    console.log('3. Find the BINS section');
    console.log('4. Update with your BIN IDs:');
    console.log('');
    console.log('   BINS: {');
    console.log('       // ... existing bins ...');
    console.log(`       G2BULK_CONFIG: '${results.G2BULK_CONFIG || '69a49974d0ea881f40e562bf'}',`);
    console.log(`       G2BULK_PRODUCTS: '${results.G2BULK_PRODUCTS || '69a49994d0ea881f40e562ed'}',`);
    console.log(`       GAME_TOPUPS: '${results.GAME_TOPUPS || '69a499abae596e708f55c6e2'}'`);
    console.log('   }');
    console.log('');
    console.log('5. Save the file and reload your admin panel');
    console.log('6. Go to Admin → G2Bulk Integration');
    console.log('7. Enter your G2Bulk API key and click Save\n');
    
    if (allSuccess) {
        console.log('✅ Setup complete! Follow the steps above to configure G2Bulk.\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some BINs failed to create. Please try again.\n');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
