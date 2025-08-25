# 🎯 Get Your LINE LIFF ID - Complete Walkthrough

## Step 1: LINE Developer Account Setup

### 1.1 Create LINE Developer Account
1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Click **Log in** (use your LINE account)
3. Accept the terms and conditions

### 1.2 Create a Provider
1. Click **Create a new provider**
2. Enter **Provider name**: `USDTide DeFi`
3. Click **Create**

## Step 2: Create LINE Login Channel

### 2.1 Create New Channel
1. Click **Create a new channel**
2. Select **LINE Login**
3. Fill in the details:
   - **Channel Name**: `USDTide MiniDapp`
   - **Channel Description**: `DeFi platform for USDT staking and lending on LINE`
   - **Category**: `Finance`
   - **Sub-category**: `Investment`
   - **Email**: Your email address
   - **Privacy Policy URL**: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app/privacy`
   - **Terms of Use**: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app/terms`

### 2.2 Configure Channel
1. **Basic settings** tab:
   - **Channel icon**: Upload USDTide logo (optional)
   - **Callback URL**: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app`

## Step 3: Create LIFF App

### 3.1 Access LIFF Settings
1. Go to **LIFF** tab in your channel
2. Click **Add LIFF App**

### 3.2 Configure LIFF App
Fill in the following:
- **LIFF App Name**: `USDTide`
- **Size**: **Full**
- **Endpoint URL**: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app`
- **Scope**: `profile openid`
- **Bot link feature**: **Off**
- **Features**:
  - ✅ BLE: Off
  - ✅ QR Code: On
  - ✅ External browser: On

### 3.3 Save and Get LIFF ID
1. Click **Add**
2. Copy the **LIFF ID** (format: `1234567890-AbCdEfGh`)
3. Save this ID - you'll need it for deployment

## Step 4: Test LIFF App

### 4.1 Quick Test
1. Open LINE app on your phone
2. Add the LIFF app as a friend or use the QR code
3. Test the app loads correctly

### 4.2 Desktop Test
1. Use the LIFF URL: `https://liff.line.me/[YOUR_LIFF_ID]`
2. Verify the app loads in browser

## Step 5: Production Integration

### 5.1 Update Environment Variables
Once you have your LIFF ID, we'll update:
1. **Vercel Environment Variables**
2. **Disable Mock Mode**
3. **Redeploy the app**

### 5.2 Your LIFF ID Format
Your LIFF ID will look like: `1234567890-AbCdEfGh`

## 🚨 Common Issues & Solutions

### Issue: "Invalid URL"
- Ensure your Vercel URL is exactly: `https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app`
- Check HTTPS is enabled

### Issue: "Channel not found"
- Verify you're logged into the correct LINE account
- Check the channel is published (not in development)

### Issue: "LIFF ID invalid"
- Double-check the LIFF ID format
- Ensure no extra spaces or characters

## 📋 Next Steps Checklist

- [ ] Create LINE Developer account
- [ ] Create provider: `USDTide DeFi`
- [ ] Create LINE Login channel
- [ ] Create LIFF app with correct settings
- [ ] Copy your LIFF ID
- [ ] Test LIFF app in LINE
- [ ] Share your LIFF ID with me for integration

## 🔗 Important Links

- [LINE Developers Console](https://developers.line.biz/console/)
- [LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Your Live App](https://usdtidelive-5b3d1utm1-lawrencezcls-projects.vercel.app)

## 💡 Pro Tips

1. **Save your credentials**: Keep your LIFF ID and channel credentials safe
2. **Test thoroughly**: Use both mobile and desktop LINE
3. **Check permissions**: Ensure LINE has camera/location permissions if needed
4. **Monitor usage**: Check LINE Developer dashboard for analytics

---

**Ready to get your LIFF ID? Start with Step 1 above!**

Once you have your LIFF ID, let me know and I'll immediately integrate it into your production deployment.