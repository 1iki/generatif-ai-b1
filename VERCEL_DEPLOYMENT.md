# 🚀 Deploying Sejarawan AI to Vercel

## Overview

Panduan lengkap untuk deploy aplikasi Sejarawan AI ke Vercel (Free Tier).

---

## 📋 Prerequisites

1. **Akun Vercel** - Sign up di https://vercel.com (gratis)
2. **GitHub Repository** - Project sudah di push ke GitHub
3. **Environment Variables** - Siapkan API keys

---

## 🚀 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Import Project

1. Login ke https://vercel.com
2. Click **"Add New Project"**
3. Import dari GitHub: pilih repository `generatif-ai-b1`
4. Click **"Import"**

### Step 2: Configure Project

**Framework Preset:** Other  
**Root Directory:** `./`  
**Build Command:** (leave empty)  
**Output Directory:** (leave empty)

### Step 3: Environment Variables

Tambahkan environment variables berikut:

```env
OPENROUTER_API_KEY=your_api_key_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Nekokawai69-
ADMIN_SECRET_PATH=/admin-dashboard-7f3e9b2a1c8d4f6e
```

**Cara add environment variables:**
1. Scroll ke **"Environment Variables"** section
2. Add each variable satu per satu:
   - Name: `OPENROUTER_API_KEY`
   - Value: `your_actual_api_key`
   - Environment: Production, Preview, Development (pilih semua)
3. Click **"Add"**
4. Repeat untuk semua variables

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait ~1-2 minutes
3. Done! 🎉

Your app will be available at: `https://your-project-name.vercel.app`

---

## 🚀 Method 2: Deploy via Vercel CLI

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# From project directory
cd /workspaces/generatif-ai-b1

# Deploy
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? generatif-ai-b1
# - Directory? ./
# - Override settings? No
```

### Add Environment Variables

```bash
# Via CLI
vercel env add OPENROUTER_API_KEY
# Enter value when prompted

vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_SECRET_PATH
```

### Deploy to Production

```bash
vercel --prod
```

---

## 🔧 Configuration Files

### vercel.json

File ini sudah dibuat dengan konfigurasi:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

**Penjelasan:**
- `builds`: Vercel akan build `server.js` sebagai serverless function
- `routes`: Semua requests di-route ke `server.js`

---

## 🔐 Accessing Admin Panel

### Hidden Admin Access

Admin panel bisa diakses dengan **2 cara tersembunyi**:

#### Method 1: Triple-Click Header
1. Buka chatbot: `https://your-app.vercel.app`
2. **Triple-click** pada judul "Sejarawan AI 🏛️" (klik 3x cepat)
3. Muncul notification badge di kanan bawah
4. Click badge untuk masuk admin panel
5. Enter credentials:
   - Username: `admin`
   - Password: `Nekokawai69-`

#### Method 2: Hidden Button
1. Hover mouse di pojok kanan atas header (invisible button)
2. Click area tersebut
3. Muncul notification badge
4. Click badge untuk masuk admin panel

#### Method 3: Direct URL
```
https://your-app.vercel.app/admin-dashboard-7f3e9b2a1c8d4f6e
```

**Security:**
- Semua akses memerlukan HTTP Basic Authentication
- Path admin panel di-randomize (tidak mudah ditebak)
- Failed login attempts di-log

---

## 🌐 Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Update DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~24 hours)

### HTTPS

- ✅ Automatically enabled by Vercel
- ✅ Free SSL certificate
- ✅ Auto-renewal

### WAF Protection

Vercel includes built-in DDoS protection. For advanced WAF:
1. Add CloudFlare in front of Vercel
2. Or use Vercel Pro plan with enhanced DDoS protection

---

## 📊 Monitoring & Logs

### View Logs

**Via Dashboard:**
1. Go to your project
2. Click **"Deployments"**
3. Select deployment
4. Click **"View Function Logs"**

**Via CLI:**
```bash
vercel logs
vercel logs --follow  # Real-time logs
```

### Analytics

Vercel provides basic analytics (Pro plan required for advanced):
- Page views
- Top pages
- Visitor locations

---

## 🐛 Troubleshooting

### Deployment Failed

**Check build logs:**
```bash
vercel logs
```

**Common issues:**
1. Missing dependencies in `package.json`
2. Environment variables not set
3. Port binding (Vercel assigns port automatically)

### Environment Variables Not Working

```bash
# List all env vars
vercel env ls

# Pull env vars locally
vercel env pull
```

### Function Timeout

Vercel Free tier limits:
- Execution time: 10 seconds
- Memory: 1024 MB

If timeout occurs:
1. Optimize API calls
2. Add caching
3. Upgrade to Pro plan

### HTTPS Redirect Issues

Vercel automatically handles HTTPS. No manual configuration needed.

---

## 💡 Vercel Free Tier Limits

| Feature | Limit |
|---------|-------|
| Bandwidth | 100 GB/month |
| Invocations | 100 GB-Hours/month |
| Execution Time | 10 seconds |
| Concurrent Builds | 1 |
| Team Members | 1 |
| Deployments | Unlimited |
| Preview Deployments | Unlimited |

**Note:** Cukup untuk hobby projects dan testing.

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds project
# 3. Deploys to production
# 4. Sends notification
```

**Preview Deployments:**
- Every pull request gets unique URL
- Test before merging to main
- Automatic cleanup after merge

---

## 📈 Performance Optimization

### Edge Caching

Add headers to cache static assets:

```javascript
// In server.js
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

### Serverless Function Optimization

```javascript
// Keep warm (prevent cold starts)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});
```

### Database Connection Pooling

If using database, use connection pooling to avoid timeouts.

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO:**
- Use Vercel environment variables
- Different values for production/preview
- Rotate secrets regularly

❌ **DON'T:**
- Commit `.env` to git
- Share production credentials
- Use weak passwords

### Rate Limiting

Already implemented in `server.js`:
- 20 requests per minute per IP
- Automatic cleanup
- Admin endpoints excluded

### Admin Panel Security

- ✅ HTTP Basic Authentication
- ✅ Random secret path
- ✅ Failed login logging
- ✅ Hidden access methods

---

## 📱 Testing Deployment

### Test Endpoints

```bash
# Health check
curl https://your-app.vercel.app/health

# Main chatbot
curl https://your-app.vercel.app/

# Admin panel (will prompt for auth)
curl -u admin:Nekokawai69- \
  https://your-app.vercel.app/admin-dashboard-7f3e9b2a1c8d4f6e/api/stats
```

### Browser Testing

1. Open `https://your-app.vercel.app`
2. Test chat functionality
3. Triple-click header for admin access
4. Login to admin panel
5. Check all tabs (Dashboard, Logs, Config, Patterns)

---

## 🚀 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy to preview
cd /workspaces/generatif-ai-b1
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow

# List deployments
vercel ls

# Remove old deployment
vercel rm <deployment-url>
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## ✅ Deployment Checklist

Pre-Deployment:
- [ ] Push code to GitHub
- [ ] Prepare environment variables
- [ ] Test locally
- [ ] Update `.gitignore` (exclude `.env`)

Deployment:
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Configure environment variables
- [ ] Deploy project
- [ ] Verify deployment URL

Post-Deployment:
- [ ] Test main chatbot
- [ ] Test admin panel access (triple-click)
- [ ] Verify authentication works
- [ ] Check security logs
- [ ] Test rate limiting
- [ ] (Optional) Add custom domain
- [ ] (Optional) Setup CloudFlare WAF

---

## 🎉 Success!

Your Sejarawan AI is now live at:
```
https://your-project-name.vercel.app
```

**Admin Panel:**
```
https://your-project-name.vercel.app/admin-dashboard-7f3e9b2a1c8d4f6e
```

**Hidden Access:** Triple-click "Sejarawan AI 🏛️" title

---

**Generated:** December 14, 2025  
**Version:** 1.0  
**Status:** ✅ Ready to Deploy
