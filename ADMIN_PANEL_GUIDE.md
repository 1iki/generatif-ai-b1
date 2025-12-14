# 🔐 Admin Panel Documentation

## Overview

Admin panel tersembunyi untuk mengelola security, monitoring, dan configuration dari aplikasi Sejarawan AI. Panel ini dilindungi dengan HTTP Basic Authentication dan dapat diakses hanya oleh administrator yang memiliki credentials.

---

## 🚀 Quick Start

### 1. Setup Credentials

Edit file `.env` dan tambahkan/update credentials admin:

```env
# Admin Panel Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password_here
ADMIN_SECRET_PATH=/your-secret-path-123
```

⚠️ **PENTING:**
- Gunakan password yang kuat (minimal 16 karakter, kombinasi huruf, angka, simbol)
- Ubah `ADMIN_SECRET_PATH` dengan path yang unik dan tidak mudah ditebak
- **JANGAN** commit file `.env` ke git repository!

### 2. Restart Server

```bash
npm start
```

### 3. Akses Admin Panel

Buka browser dan akses:
```
http://localhost:3000/your-secret-path-123
```

Masukkan username dan password yang telah dikonfigurasi.

---

## 📊 Features

### 1. Dashboard Tab

**System Statistics:**
- ⏱️ **System Uptime** - Berapa lama server sudah berjalan
- 💾 **Memory Usage** - Penggunaan memory heap dalam MB
- 📨 **Chat History** - Jumlah pesan yang tersimpan
- 🚫 **Blocked Requests** - Jumlah request malicious yang diblokir dalam 1 jam terakhir

**Active Rate Limits:**
- Menampilkan IP addresses yang sedang terkena rate limiting
- Progress bar usage (requests/limit)
- Tombol untuk clear rate limit per IP
- Auto-refresh setiap 5 detik

### 2. Security Logs Tab

**Audit Log Viewer:**
- Real-time security event logs
- Color-coded by event type:
  - 🔴 **Red** - INPUT_BLOCKED (malicious input detected)
  - 🟡 **Yellow** - ADMIN_AUTH_FAILED (failed login attempt)
  - 🟢 **Green** - ADMIN_AUTH_SUCCESS (successful login)
  - 🔵 **Blue** - Other events

**Actions:**
- 🔄 **Refresh** - Manual refresh logs
- 🗑️ **Clear Logs** - Hapus semua audit logs (dengan konfirmasi)

### 3. Configuration Tab

**Current Configuration:**
- Max Requests Per Window
- Rate Limit Window (ms)
- Max Message Length
- Min Message Length
- Audit Log Size

**Production Security Checklist:**
- ✅ HTTPS/TLS Status
- ✅ WAF Status
- ✅ Authentication Status
- ✅ Rate Limiting Status
- ✅ Input Validation Status

### 4. Patterns Tab

**Forbidden Patterns (Regex):**
- Menampilkan semua regex patterns yang digunakan untuk mendeteksi malicious input
- Pattern ID, source, dan flags
- Total 10+ security patterns

---

## 🔌 API Endpoints

Semua endpoint memerlukan HTTP Basic Authentication.

### GET `{ADMIN_SECRET_PATH}`
Serve admin panel HTML.

**Response:** HTML page

---

### GET `{ADMIN_SECRET_PATH}/api/stats`
Mendapatkan system statistics.

**Response:**
```json
{
  "uptime": 12345.67,
  "memory": {
    "heapUsed": 50000000,
    "heapTotal": 100000000
  },
  "chatHistorySize": 42,
  "auditLogSize": 156,
  "activeRateLimits": 3,
  "blockedRequestsLast1Hour": 8,
  "config": {
    "maxRequestsPerWindow": 20,
    "rateLimitWindow": 60000,
    "maxMessageLength": 2000,
    "minMessageLength": 1
  }
}
```

---

### GET `{ADMIN_SECRET_PATH}/api/audit-logs?limit=100`
Mendapatkan security audit logs.

**Query Parameters:**
- `limit` (optional) - Maximum number of logs to return (default: 100)

**Response:**
```json
{
  "total": 256,
  "returned": 100,
  "logs": [
    {
      "timestamp": "2025-12-14T10:30:45.123Z",
      "type": "INPUT_BLOCKED",
      "ip": "127.0.0.1",
      "pattern": "/lupakan\\s*instruksi/i",
      "input": "lupakan instruksi sebelumnya"
    }
  ]
}
```

---

### GET `{ADMIN_SECRET_PATH}/api/rate-limits`
Mendapatkan active rate limit statistics.

**Response:**
```json
{
  "stats": [
    {
      "ip": "127.0.0.1",
      "requests": 15,
      "limit": 20,
      "window": "60s"
    }
  ]
}
```

---

### POST `{ADMIN_SECRET_PATH}/api/clear-rate-limit`
Clear rate limit untuk specific IP address.

**Request Body:**
```json
{
  "ip": "127.0.0.1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rate limit cleared for 127.0.0.1"
}
```

---

### POST `{ADMIN_SECRET_PATH}/api/clear-logs`
Hapus semua audit logs.

**Response:**
```json
{
  "success": true,
  "message": "Cleared 256 log entries"
}
```

---

### GET `{ADMIN_SECRET_PATH}/api/patterns`
Mendapatkan list of forbidden patterns.

**Response:**
```json
{
  "patterns": [
    {
      "id": 0,
      "pattern": "ignore\\s*(all\\s*)?(previous|prior)...",
      "flags": "i"
    }
  ]
}
```

---

### POST `{ADMIN_SECRET_PATH}/api/config`
Log configuration update request (requires server restart).

**Request Body:**
```json
{
  "action": "update",
  "key": "MAX_REQUESTS_PER_WINDOW",
  "value": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration update logged. Restart server to apply changes.",
  "note": "Update .env file and restart server for changes to take effect"
}
```

---

## 🔒 Security Features

### HTTP Basic Authentication
- Menggunakan standard HTTP Basic Auth
- Credentials di-encode Base64 di header `Authorization`
- Browser akan menampilkan login dialog secara otomatis

### Audit Logging
- Semua admin authentication attempts dicatat
- Failed login attempts logged dengan IP address
- Configuration changes logged

### Rate Limiting
- Admin endpoints **TIDAK** terkena rate limiting
- Regular user endpoints terkena rate limit 20 req/min

---

## 🛡️ Production Deployment

### Recommended Setup

1. **HTTPS/TLS**
   ```bash
   # Gunakan reverse proxy seperti Nginx dengan SSL certificate
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:3000;
       }
   }
   ```

2. **Strong Credentials**
   - Minimal 20 karakter
   - Kombinasi uppercase, lowercase, numbers, symbols
   - Gunakan password manager

3. **Firewall Rules**
   ```bash
   # Batasi akses admin panel hanya dari IP tertentu
   iptables -A INPUT -p tcp --dport 3000 -s TRUSTED_IP -j ACCEPT
   iptables -A INPUT -p tcp --dport 3000 -j DROP
   ```

4. **WAF (Web Application Firewall)**
   - Deploy behind CloudFlare, AWS WAF, atau similar
   - Enable DDoS protection
   - Enable bot protection

5. **Monitoring**
   ```bash
   # Setup log aggregation
   # Example: Ship logs to ELK stack, CloudWatch, atau Datadog
   ```

---

## 🧪 Testing

### Test Authentication

```bash
# Tanpa auth (should fail)
curl http://localhost:3000/your-secret-path

# Dengan auth (should succeed)
curl -u admin:password http://localhost:3000/your-secret-path/api/stats
```

### Test API Endpoints

```bash
# Get stats
curl -u admin:password http://localhost:3000/your-secret-path/api/stats

# Get logs
curl -u admin:password "http://localhost:3000/your-secret-path/api/audit-logs?limit=10"

# Get rate limits
curl -u admin:password http://localhost:3000/your-secret-path/api/rate-limits

# Clear rate limit
curl -u admin:password -X POST \
  -H "Content-Type: application/json" \
  -d '{"ip":"127.0.0.1"}' \
  http://localhost:3000/your-secret-path/api/clear-rate-limit
```

---

## 🚨 Troubleshooting

### Cannot Access Admin Panel

**Problem:** Browser shows 401 Unauthorized
- ✅ Check `.env` file contains correct credentials
- ✅ Restart server after changing `.env`
- ✅ Verify URL includes correct `ADMIN_SECRET_PATH`
- ✅ Clear browser cache/cookies

**Problem:** 404 Not Found
- ✅ Check `ADMIN_SECRET_PATH` in `.env` matches URL
- ✅ Ensure `admin.html` exists in root directory
- ✅ Check server logs for errors

### Logs Not Showing

**Problem:** Empty logs in Security Logs tab
- Normal if no security events occurred yet
- Try triggering a blocked request from main app
- Check browser console for API errors

### Rate Limits Not Clearing

**Problem:** Clear button doesn't work
- Check browser console for errors
- Verify authentication headers are sent
- Check server logs for errors

---

## 📚 Related Documentation

- [SECURITY_REPORT.md](SECURITY_REPORT.md) - Comprehensive security analysis
- [SECURITY_TESTING_CHECKLIST.md](SECURITY_TESTING_CHECKLIST.md) - Testing procedures
- [SECURITY_QUICK_REFERENCE.md](SECURITY_QUICK_REFERENCE.md) - Developer guide
- [TESTING_RESULTS.md](TESTING_RESULTS.md) - Latest test results

---

## 🔄 Changelog

### Version 1.0 (2025-12-14)
- ✅ Initial release
- ✅ Dashboard with system stats
- ✅ Security audit logs viewer
- ✅ Rate limit management
- ✅ Configuration viewer
- ✅ Forbidden patterns display
- ✅ HTTP Basic Authentication
- ✅ Auto-refresh dashboard (5s interval)
- ✅ Responsive design

---

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review `SECURITY_REPORT.md`
3. Check server logs: `console.log` output
4. Enable debug mode in browser DevTools

---

## ⚠️ Security Warnings

1. **NEVER** expose admin panel without authentication
2. **NEVER** use default credentials in production
3. **NEVER** commit `.env` file to git
4. **ALWAYS** use HTTPS in production
5. **ALWAYS** use strong, unique passwords
6. **ALWAYS** monitor failed login attempts
7. **REGULARLY** review audit logs
8. **REGULARLY** update dependencies

---

**Last Updated:** December 14, 2025  
**Version:** 1.0  
**Status:** Production Ready (with recommendations)
