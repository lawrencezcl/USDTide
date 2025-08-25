# LINE MiniDapp Setup Guide

## 🎯 Quick Fix for Production

Your USDTide frontend is deployed but showing "Failed to initialize LINE login" because the LINE LIFF ID is not configured. Here's how to fix it:

### Immediate Solution (Mock Mode)
The app is currently running in **mock mode** so you can test the functionality without LINE LIFF. This allows you to:
- ✅ Test all DeFi features (Staking, Lending)
- ✅ Navigate the app interface
- ✅ Connect wallets and interact with contracts
- ✅ Test responsive design

### Production LINE MiniDapp Setup

#### Step 1: Create LINE LIFF App
1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Create a new provider or use existing one
3. Create a new channel:
   - Channel Type: **LINE Login**
   - Channel Name: **USDTide MiniDapp**
   - Category: **Finance**
   - Description: **DeFi platform for USDT staking and lending**

#### Step 2: Configure LIFF Settings
1. In your channel, go to **LIFF** tab
2. Click **Add LIFF App**
3. Configure the LIFF app:
   - **LIFF App Name**: USDTide
   - **Size**: **Full**
   - **Endpoint URL**: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app`
   - **Scope**: `profile openid`
   - **Bot link feature**: **Off**

#### Step 3: Get Your LIFF ID
1. After creating the LIFF app, you'll see a **LIFF ID**
2. Copy the LIFF ID (format: `1234567890-AbCdEfGh`)

#### Step 4: Update Production Environment
1. Go to your Vercel dashboard: [vercel.com](https://vercel.com)
2. Find your **usdtidelive** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# Required for LINE MiniDapp
VITE_LIFF_ID=your_actual_liff_id_here

# Optional: Contract addresses (update after deployment)
VITE_USDT_TOKEN_ADDRESS=0x...
VITE_KAIA_TOKEN_ADDRESS=0x...
VITE_STAKING_CONTRACT_ADDRESS=0x...
VITE_LENDING_CONTRACT_ADDRESS=0x...
```

#### Step 5: Redeploy
After setting environment variables:
```bash
cd frontend
vercel --prod
```

## 🔧 Testing Without LINE

### Browser Testing
You can test the app in any browser by visiting:
**https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app**

### Mobile Testing
- **iPhone Safari**: Test responsive design
- **Android Chrome**: Test touch interactions
- **LINE Browser**: When LIFF is configured

## 📱 LINE MiniDapp Features

### ✅ Working Features (Mock Mode)
- **USDT Staking**: Stake and earn rewards
- **USDT Lending**: Borrow against collateral
- **Dashboard**: View balances and positions
- **Wallet Connection**: Connect any Web3 wallet
- **Responsive Design**: Optimized for mobile

### ✅ LINE-Specific Features (After LIFF Setup)
- **LINE Login**: Seamless authentication
- **Profile Integration**: Use LINE profile info
- **Social Sharing**: Share achievements
- **LINE Wallet**: Access LINE's wallet
- **Context Menu**: LINE-specific navigation

## 🚨 Troubleshooting

### Common Issues

**"LIFF ID invalid"**
- Check if LIFF ID is correctly copied
- Ensure endpoint URL matches your deployment
- Verify channel is active

**"Initialization Error"**
- Check browser console for detailed errors
- Ensure HTTPS is enabled (required for LIFF)
- Verify LIFF app is published

**"Network Error"**
- Check internet connection
- Verify CORS settings in LIFF configuration
- Ensure API endpoints are accessible

### Debug Mode
To enable detailed logging:
1. Open browser console (F12)
2. Look for LIFF-related logs
3. Check for any error messages

## 🎨 Customization

### Branding
- Update logo in `src/assets/logo.svg`
- Modify colors in `src/styles/variables.scss`
- Update app name in `index.html`

### Features
- Enable/disable features via environment variables
- Modify staking/lending parameters in contracts
- Add new DeFi protocols

## 📊 Next Steps

1. **Complete LINE Setup**: Follow steps 1-5 above
2. **Test in LINE**: Open the app within LINE
3. **User Testing**: Get feedback from LINE users
4. **Monitor Performance**: Use Vercel analytics
5. **Deploy Updates**: Push new features via `vercel --prod`

## 🆘 Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test in different browsers
4. Review LINE Developer documentation
5. Contact support if needed

---

**Your USDTide MiniDapp is ready for LINE integration! 🚀**