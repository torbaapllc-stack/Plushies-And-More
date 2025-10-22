# 🚀 Plushies and More - CI/CD Deployment Guide

## 📋 Project Details
- **GitHub Repository:** https://github.com/torbaapllc-stack/Plushies-And-More.git
- **Vercel Account:** torbaapllc-9742
- **Email:** orbaapllc@gmail.com
- **Project Name:** Plushies and More

## 🔧 Setup Instructions

### 1. Vercel Dashboard Setup
1. Go to https://vercel.com/dashboard
2. Sign in with `torbaapllc-9742` account
3. Click "New Project"
4. Import from GitHub: `torbaapllc-stack/Plushies-And-More`
5. Configure project settings

### 2. Environment Variables
Add these in Vercel Project Settings → Environment Variables:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=6j07vt-14.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=c844dcee6f4ad2c3661029927c407257
```

### 3. Build Settings
- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`

## 🔄 CI/CD Workflow

### Automatic Deployment
1. **Push to GitHub:** `git push origin main`
2. **Vercel detects changes**
3. **Auto-builds and deploys**
4. **Live site updates**

### Manual Deployment
```bash
# Push changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel will automatically deploy
```

## 🌐 Live URLs
- **Production:** https://plushies-and-more.vercel.app
- **Preview:** https://plushies-and-more-git-main-torbaapllc-9742.vercel.app

## 🛠️ Development
```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Features
- ✅ Shopify Integration
- ✅ Product Display
- ✅ Responsive Design
- ✅ Auto-deployment
- ✅ Environment Variables
- ✅ Custom Domain Support

## 🔐 Security
- Environment variables are encrypted
- GitHub integration secure
- Vercel handles SSL certificates
- Automatic HTTPS

---
**Last Updated:** October 22, 2025
**Status:** Ready for CI/CD Setup
