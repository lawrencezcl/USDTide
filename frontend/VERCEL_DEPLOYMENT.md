# 🚀 USDTide Frontend Vercel Deployment Guide

## ✅ Vercel Compatibility Status: **FULLY COMPATIBLE**

USDTide frontend is **100% compatible** with Vercel deployment using Vite build system.

## 📋 Quick Deployment Steps

### Option 1: One-Click Deploy (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lawrencezcl/USDTide&root-directory=frontend)

### Option 2: Manual Deployment

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Deploy from Frontend Directory
```bash
cd frontend
vercel --prod
```

#### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:
- `VITE_LIFF_ID=your_liff_id`
- `VITE_CHAIN_ID=1001`
- `VITE_RPC_URL=https://public-node-testnet.kaia.io`
- `VITE_NETWORK_NAME=Kaia Testnet`
- `VITE_ENABLE_MOCK_MODE=true`

## 🔧 Build Configuration

### Vercel Settings (Auto-detected)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables Template
Create `.env.production` in frontend directory:
```bash
# Copy from .env.example and update values
cp .env.example .env.production
```

## 📊 Vercel Features Enabled

### ✅ Automatic Features
- **HTTPS/SSL**: Auto-provisioned SSL certificates
- **CDN**: Global edge network distribution
- **Compression**: Automatic gzip/brotli compression
- **Caching**: Intelligent asset caching
- **Preview Deployments**: Every push creates preview URL

### ✅ SPA Routing
- **Client-side routing**: Works with Vue Router
- **Fallback**: All routes serve index.html
- **History mode**: Compatible with browser history API

## 🚀 Deployment Commands

### Deploy to Vercel
```bash
# From project root
cd frontend

# Login to Vercel (first time only)
vercel login

# Deploy
vercel --prod

# Or use npm script
npm run deploy
```

### Environment Setup
```bash
# Install Vercel CLI globally
npm install -g vercel

# Link project to Vercel
vercel link

# Set environment variables
vercel env add VITE_LIFF_ID production
vercel env add VITE_CHAIN_ID production
vercel env add VITE_RPC_URL production
```

## 🎯 Production Configuration

### 1. Environment Variables in Vercel Dashboard
Navigate to your project settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_LIFF_ID` | `your_liff_id` | LINE LIFF app ID |
| `VITE_CHAIN_ID` | `1001` | Kaia testnet chain ID |
| `VITE_RPC_URL` | `https://public-node-testnet.kaia.io` | RPC endpoint |
| `VITE_NETWORK_NAME` | `Kaia Testnet` | Network display name |
| `VITE_ENABLE_MOCK_MODE` | `false` | Disable mock mode for production |

### 2. Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add your-domain.com
```

### 3. Performance Optimization
- **Build optimization**: Already configured in vite.config.js
- **Code splitting**: Automatic chunk splitting enabled
- **Asset optimization**: Images and fonts optimized
- **Compression**: Brotli compression enabled

## 🔍 Verification Steps

### After Deployment
1. **Check build**: Verify build completes successfully
2. **Test routing**: Navigate between pages
3. **Verify API calls**: Check blockchain connectivity
4. **Test mobile**: Ensure responsive design works
5. **Check LIFF**: Verify LINE MiniDapp integration

### Health Check URLs
- **Main deployment**: `https://your-project.vercel.app`
- **Preview deployments**: Available in PR comments

## 🚨 Troubleshooting

### Common Issues

**Build fails**
```bash
# Clear cache and rebuild
vercel --prod --force
```

**Environment variables not loading**
- Check Vercel dashboard → Environment Variables
- Ensure variables are set for production environment

**Routing issues**
- Vercel automatically handles SPA routing
- Check vercel.json configuration

**Large bundle size**
- Check vite.config.js optimization settings
- Use Vercel's bundle analyzer

### Debug Commands
```bash
# Check build logs
vercel logs

# Check deployment status
vercel ls

# Redeploy
vercel --prod
```

## 📊 Deployment Metrics

### Build Performance
- **Build time**: ~30-60 seconds
- **Bundle size**: ~500KB-1MB (optimized)
- **First load**: <2 seconds globally

### Features Available
- ✅ Vue.js SPA
- ✅ Vite build system
- ✅ TypeScript support
- ✅ SCSS preprocessing
- ✅ Auto-imports
- ✅ Component library (Vant)
- ✅ Blockchain integration
- ✅ LINE MiniDapp support

## 🎯 Next Steps After Deployment

1. **Update LIFF settings** with new domain
2. **Configure blockchain RPC** for production
3. **Test all features** on deployed URL
4. **Set up monitoring** (optional)
5. **Share deployment URL** with team

---

**🎉 Ready to Deploy!**

Your USDTide frontend is **Vercel-ready** with optimized configuration for production deployment.