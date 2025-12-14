#!/usr/bin/env node

/**
 * SSL Certificate Generator for Development
 * Generates self-signed SSL certificates for HTTPS development
 * 
 * Usage: node generate-ssl-cert.js
 * 
 * WARNING: Self-signed certificates should ONLY be used for development.
 * For production, use proper certificates from Let's Encrypt or commercial CA.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SSL_DIR = path.join(__dirname, 'ssl');
const KEY_FILE = path.join(SSL_DIR, 'server.key');
const CERT_FILE = path.join(SSL_DIR, 'server.cert');

console.log('🔐 Generating self-signed SSL certificates...\n');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(SSL_DIR)) {
    fs.mkdirSync(SSL_DIR, { recursive: true });
    console.log('✅ Created ssl/ directory');
}

// Check if OpenSSL is available
try {
    execSync('openssl version', { stdio: 'pipe' });
} catch (error) {
    console.error('❌ OpenSSL not found. Please install OpenSSL first.');
    console.error('   Ubuntu/Debian: sudo apt-get install openssl');
    console.error('   macOS: brew install openssl');
    console.error('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
    process.exit(1);
}

// Generate private key and certificate
try {
    console.log('📝 Generating private key and certificate...');
    
    const command = `openssl req -x509 -newkey rsa:4096 -nodes \
        -keyout "${KEY_FILE}" \
        -out "${CERT_FILE}" \
        -days 365 \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Sejarawan AI/CN=localhost"`;
    
    execSync(command, { stdio: 'pipe' });
    
    console.log('✅ SSL certificates generated successfully!\n');
    console.log('📁 Files created:');
    console.log(`   - Private Key: ${KEY_FILE}`);
    console.log(`   - Certificate: ${CERT_FILE}`);
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - These are self-signed certificates for DEVELOPMENT ONLY');
    console.log('   - Browsers will show security warnings');
    console.log('   - For production, use Let\'s Encrypt or commercial CA');
    console.log('\n🚀 To enable HTTPS:');
    console.log('   1. Set ENABLE_HTTPS=true in .env');
    console.log('   2. Restart server: npm start');
    console.log('   3. Access: https://localhost:3000');
    console.log('\n📚 For production SSL setup, see: HTTPS_DEPLOYMENT.md');
    
} catch (error) {
    console.error('❌ Error generating certificates:', error.message);
    process.exit(1);
}
