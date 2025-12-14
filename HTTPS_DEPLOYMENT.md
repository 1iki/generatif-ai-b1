# 🔒 HTTPS/TLS Deployment Guide

## Overview

Panduan lengkap untuk deploy aplikasi Sejarawan AI dengan HTTPS/TLS encryption untuk production environment.

---

## 🚀 Quick Start - Development HTTPS

### Generate Self-Signed Certificate

```bash
# Generate SSL certificates for development
node generate-ssl-cert.js
```

### Enable HTTPS

Edit `.env`:
```env
ENABLE_HTTPS=true
SSL_KEY_PATH=./ssl/server.key
SSL_CERT_PATH=./ssl/server.cert
```

### Start Server

```bash
npm start
```

Access: `https://localhost:3000`

⚠️ **Browser will show security warning** - ini normal untuk self-signed certificates.

---

## 🏭 Production HTTPS Setup

### Option 1: Let's Encrypt (FREE - Recommended)

#### Using Certbot

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com
```

Certificates akan disimpan di:
- Private Key: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
- Certificate: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`

Update `.env`:
```env
ENABLE_HTTPS=true
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

#### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
sudo crontab -e

# Add this line (renew twice daily)
0 0,12 * * * certbot renew --quiet
```

---

### Option 2: Nginx Reverse Proxy (Recommended)

**Advantages:**
- Handle SSL termination
- Better performance
- Easy to configure
- Can serve multiple apps

#### Install Nginx

```bash
sudo apt-get update
sudo apt-get install nginx
```

#### Configure Nginx

Create `/etc/nginx/sites-available/sejarawan-ai`:

```nginx
# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req zone=api burst=5 nodelay;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Admin panel - Extra security
    location /admin-dashboard-7f3e9b2a1c8d4f6e {
        # IP whitelist (uncomment and add your IP)
        # allow YOUR_IP_ADDRESS;
        # deny all;
        
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Logs
    access_log /var/log/nginx/sejarawan-ai-access.log;
    error_log /var/log/nginx/sejarawan-ai-error.log;
}
```

#### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/sejarawan-ai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Update Node.js App

Keep `.env` with HTTP mode:
```env
ENABLE_HTTPS=false  # Nginx handles HTTPS
PORT=3000
```

---

### Option 3: Apache Reverse Proxy

#### Install Apache + Modules

```bash
sudo apt-get install apache2
sudo a2enmod ssl proxy proxy_http headers rewrite
```

#### Configure Apache

Create `/etc/apache2/sites-available/sejarawan-ai.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Proxy Configuration
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/sejarawan-ai-error.log
    CustomLog ${APACHE_LOG_DIR}/sejarawan-ai-access.log combined
</VirtualHost>
```

#### Enable Site

```bash
sudo a2ensite sejarawan-ai
sudo systemctl reload apache2
```

---

## 🛡️ WAF (Web Application Firewall) Deployment

### Option 1: CloudFlare (Easiest - Recommended)

**Free tier includes:**
- DDoS protection
- WAF rules
- SSL/TLS encryption
- CDN
- Rate limiting

#### Setup Steps:

1. **Sign up at CloudFlare**: https://dash.cloudflare.com/sign-up

2. **Add your domain**:
   - Click "Add a Site"
   - Enter your domain name
   - Choose Free plan

3. **Update DNS**:
   - CloudFlare will scan your DNS records
   - Update nameservers at your domain registrar
   - Point A record to your server IP

4. **Configure SSL/TLS**:
   - Go to SSL/TLS → Overview
   - Set to "Full (strict)" mode
   - Enable "Always Use HTTPS"

5. **Enable WAF**:
   - Go to Security → WAF
   - Enable OWASP ModSecurity Core Rule Set
   - Add custom rules:
     ```
     (http.request.uri.path contains "/admin-dashboard") and 
     (ip.src ne YOUR_IP_ADDRESS)
     → Block
     ```

6. **Configure Firewall Rules**:
   - Block countries (if needed)
   - Challenge suspicious IPs
   - Rate limiting rules

7. **Enable Bot Protection**:
   - Go to Security → Bots
   - Enable Bot Fight Mode (Free)
   - Or Super Bot Fight Mode (Paid)

8. **Update Your App**:
   ```env
   # Trust CloudFlare proxy headers
   TRUST_PROXY=true
   ```

---

### Option 2: AWS WAF

#### Setup with Application Load Balancer

```bash
# Install AWS CLI
sudo apt-get install awscli

# Configure
aws configure
```

#### Create WAF Web ACL

```bash
# Create Web ACL
aws wafv2 create-web-acl \
  --name sejarawan-ai-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json

# Associate with ALB
aws wafv2 associate-web-acl \
  --web-acl-arn <WAF_ACL_ARN> \
  --resource-arn <ALB_ARN>
```

**waf-rules.json**:
```json
[
  {
    "Name": "RateLimitRule",
    "Priority": 1,
    "Statement": {
      "RateBasedStatement": {
        "Limit": 2000,
        "AggregateKeyType": "IP"
      }
    },
    "Action": {
      "Block": {}
    },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "RateLimitRule"
    }
  },
  {
    "Name": "SQLiProtection",
    "Priority": 2,
    "Statement": {
      "ManagedRuleGroupStatement": {
        "VendorName": "AWS",
        "Name": "AWSManagedRulesSQLiRuleSet"
      }
    },
    "OverrideAction": {
      "None": {}
    },
    "VisibilityConfig": {
      "SampledRequestsEnabled": true,
      "CloudWatchMetricsEnabled": true,
      "MetricName": "SQLiProtection"
    }
  }
]
```

---

### Option 3: ModSecurity with Nginx

#### Install ModSecurity

```bash
sudo apt-get install libmodsecurity3 libnginx-mod-http-modsecurity
```

#### Configure ModSecurity

Create `/etc/nginx/modsec/main.conf`:
```nginx
SecRuleEngine On
SecRequestBodyAccess On
SecResponseBodyAccess Off
SecAuditLog /var/log/nginx/modsec_audit.log

# OWASP Core Rule Set
Include /usr/share/modsecurity-crs/crs-setup.conf
Include /usr/share/modsecurity-crs/rules/*.conf

# Custom rules for admin panel
SecRule REQUEST_URI "@contains /admin-dashboard" \
    "id:1001,\
     phase:1,\
     deny,\
     status:403,\
     msg:'Admin panel access blocked',\
     chain"
SecRule REMOTE_ADDR "!@ipMatch YOUR_IP_ADDRESS"
```

#### Update Nginx Config

Add to your server block:
```nginx
modsecurity on;
modsecurity_rules_file /etc/nginx/modsec/main.conf;
```

---

## 🔍 Testing HTTPS Setup

### Test SSL Configuration

```bash
# Using curl
curl -I https://yourdomain.com

# Check certificate details
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test with SSL Labs (online)
# Visit: https://www.ssllabs.com/ssltest/
```

### Test Security Headers

```bash
curl -I https://yourdomain.com | grep -E "Strict-Transport|X-Frame|X-Content"
```

### Test Rate Limiting

```bash
# Send multiple requests
for i in {1..30}; do 
  curl -s https://yourdomain.com/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"test"}' &
done
wait
```

---

## 📊 Monitoring

### Check SSL Certificate Expiry

```bash
# Check local certificate
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -noout -dates

# Check remote certificate
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Monitor Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/sejarawan-ai-access.log

# Error logs
sudo tail -f /var/log/nginx/sejarawan-ai-error.log

# Filter for admin panel access
sudo grep "admin-dashboard" /var/log/nginx/sejarawan-ai-access.log
```

### Setup Alerts

Create `/usr/local/bin/ssl-expiry-check.sh`:
```bash
#!/bin/bash
DOMAIN="yourdomain.com"
DAYS_UNTIL_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2 | xargs -I {} date -d "{}" +%s)
NOW=$(date +%s)
DAYS_LEFT=$(( ($DAYS_UNTIL_EXPIRY - $NOW) / 86400 ))

if [ $DAYS_LEFT -lt 30 ]; then
    echo "WARNING: SSL certificate expires in $DAYS_LEFT days!"
    # Send alert (email, Slack, etc.)
fi
```

Add to cron:
```bash
sudo crontab -e
# Check daily at 2 AM
0 2 * * * /usr/local/bin/ssl-expiry-check.sh
```

---

## 🚨 Troubleshooting

### SSL Certificate Errors

**Problem:** "Certificate has expired"
```bash
# Renew certificate
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Problem:** "NET::ERR_CERT_AUTHORITY_INVALID"
- Self-signed certificate detected
- Use proper CA-signed certificate for production

### HTTPS Not Working

```bash
# Check if port 443 is open
sudo netstat -tulpn | grep :443

# Check firewall
sudo ufw status
sudo ufw allow 443/tcp

# Check Nginx status
sudo systemctl status nginx
```

### Mixed Content Warnings

Update frontend to use HTTPS for all resources:
```javascript
// Change
src="http://example.com/script.js"
// To
src="https://example.com/script.js"
```

---

## 📋 Production Checklist

- [ ] SSL certificate from trusted CA installed
- [ ] HTTPS enabled and working
- [ ] HTTP → HTTPS redirect configured
- [ ] Security headers configured
- [ ] HSTS enabled
- [ ] Auto-renewal setup for SSL
- [ ] WAF enabled (CloudFlare/AWS/ModSecurity)
- [ ] Rate limiting configured
- [ ] Admin panel IP whitelisting
- [ ] Monitoring and alerts setup
- [ ] SSL Labs A+ rating achieved
- [ ] Regular security audits scheduled

---

## 📚 Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [CloudFlare Setup Guide](https://support.cloudflare.com/hc/en-us/articles/201720164)
- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)
- [ModSecurity Core Rule Set](https://coreruleset.org/)

---

**Last Updated:** December 14, 2025  
**Version:** 1.0  
**Status:** Production Ready 🚀
