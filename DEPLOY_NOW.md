# 🚀 Vercel Deployment - Quick Start

## Deploy Now (3 Steps)

### 1. Push to GitHub

```bash
cd /workspaces/generatif-ai-b1
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

Visit: https://vercel.com/new

1. **Import Git Repository**
2. **Configure Project:**
   - Framework: Other
   - Root: `./`
   - Leave build settings empty

3. **Add Environment Variables:**
   ```
   OPENROUTER_API_KEY = sk-or-v1-your-key-here
   ADMIN_USERNAME = admin
   ADMIN_PASSWORD = Nekokawai69-
   ADMIN_SECRET_PATH = /admin-dashboard-7f3e9b2a1c8d4f6e
   ```

4. Click **Deploy**

### 3. Access Your App

```
Main App: https://your-app.vercel.app
Admin: Triple-click header title "Sejarawan AI 🏛️"
```

---

## Hidden Admin Access Methods

### Method 1: Triple-Click Header ⭐ (Recommended)
1. Open chatbot
2. Triple-click judul "Sejarawan AI 🏛️" (klik 3x cepat)
3. Notification badge muncul di kanan bawah
4. Click badge → Login admin panel

### Method 2: Hidden Button
1. Hover mouse di pojok kanan atas header
2. Area kecil akan muncul (invisible button)
3. Click → Notification badge muncul
4. Click badge → Login admin panel

### Method 3: Direct URL
```
https://your-app.vercel.app/admin-dashboard-7f3e9b2a1c8d4f6e
```

**Credentials:**
- Username: `admin`
- Password: `Nekokawai69-`

---

## Files Ready for Deployment

✅ `vercel.json` - Vercel configuration
✅ `.vercelignore` - Files to ignore
✅ `index.html` - Hidden admin button added
✅ `server.js` - HTTPS support, admin panel
✅ `admin.html` - Admin panel UI
✅ Environment variables documented

---

## Vercel CLI (Alternative)

```bash
# Install
npm install -g vercel

# Login
vercel login

# Deploy
cd /workspaces/generatif-ai-b1
vercel --prod
```

---

## Support

Full documentation: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

**Need help?**
- Vercel Docs: https://vercel.com/docs
- Dashboard: https://vercel.com/dashboard
