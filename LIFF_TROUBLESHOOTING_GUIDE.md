# LINE LIFF Initialization Error - Troubleshooting Guide

## Current Issue: "Failed to initialize LINE login"

## 🔍 Quick Diagnosis

**Current Configuration:**
- LIFF ID: `2007983577-jpZL6DBP`
- Production URL: `https://usdtidelive-l1dx79jpl-lawrencezcls-projects.vercel.app`
- Error: "Failed to initialize LINE login"

## 🚨 Common Causes & Solutions

### 1. LIFF ID Configuration Issue
**Problem**: Using incorrect LIFF ID or mismatched environment
**Check**: Verify LIFF ID matches your LINE Developers Console

**Action Steps:**
1. Go to [LINE Developers Console](https://developers.line.biz/console/)
2. Navigate to your channel → LIFF tab
3. Verify the LIFF ID matches: `2007983577-jpZL6DBP`
4. Ensure the LIFF app status is "Published"

### 2. Endpoint URL Mismatch
**Problem**: Production URL doesn't match LIFF endpoint configuration
**Current**: `https://usdtidelive-l1dx79jpl-lawrencezcls-projects.vercel.app`

**Action Steps:**
1. **Update LIFF Endpoint URL**:
   - Go to LINE Developers Console → Your Channel → LIFF
   - Edit your LIFF app
   - Set Endpoint URL to: `https://usdtidelive-l1dx79jpl-lawrencezcls-projects.vercel.app`
   - Save changes

2. **Alternative**: Use stable domain
   - Set up custom domain: `usdtidelive.vercel.app`
   - Update LIFF endpoint to match

### 3. Missing Environment Variables
**Check**: Verify `.env.production` has correct LIFF ID

```bash
# Should contain:
VITE_LIFF_ID=2007983577-jpZL6DBP
```

### 4. LIFF App Settings Verification

**Required Settings Checklist:**
- [ ] **Channel Type**: LINE Login
- [ ] **Status**: Published (not draft)
- [ ] **Endpoint URL**: Matches production URL exactly
- [ ] **Size**: Full (recommended for dashboard apps)
- [ ] **Scopes**: 
  - [ ] `profile`
  - [ ] `openid`
  - [ ] `chat_message.write` (if using messaging features)

## 🔧 Immediate Fix Steps

### Step 1: Verify Current Configuration
```bash
# Check current deployment
npx vercel ls --prod
```

### Step 2: Update LIFF Settings
1. **LINE Developers Console**:
   - Navigate to your channel
   - Go to "LIFF" tab
   - Click "Edit" on your LIFF app
   - Update Endpoint URL to current production URL
   - Ensure LIFF ID matches: `2007983577-jpZL6DBP`

### Step 3: Redeploy with Updated Settings
```bash
# Rebuild and redeploy
cd frontend
npm run build
npx vercel --prod
```

### Step 4: Test the Fix
1. Open LINE app
2. Navigate to your LIFF URL: `https://liff.line.me/2007983577-jpZL6DBP`
3. Check if initialization succeeds

## 🐛 Debug Mode

### Enable Debug Logging
Add to `LiffInitializer.vue`:
```javascript
// Add before liff.init()
console.log('LIFF ID:', props.liffId);
console.log('Current URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);
```

### Check Console Errors
1. Open LINE app
2. Open LIFF app
3. Check browser console for specific error codes:
   - `INVALID_ARGUMENT`: LIFF ID issue
   - `FORBIDDEN`: Permission/scope issue
   - `NETWORK_ERROR`: Connection issue

## 🔄 Alternative Solutions

### Option A: Create New LIFF App
If current LIFF app has persistent issues:

1. **Create New LIFF App**:
   - LINE Developers Console → Add LIFF app
   - Set name: "USDTide Production"
   - Set endpoint: `https://usdtidelive-l1dx79jpl-lawrencezcls-projects.vercel.app`
   - Copy new LIFF ID

2. **Update Environment**:
   ```bash
   # Update .env.production
   VITE_LIFF_ID=your-new-liff-id
   ```

3. **Redeploy**:
   ```bash
   npm run build
   npx vercel --prod
   ```

### Option B: Custom Domain Setup
For stable endpoint:

1. **Set Custom Domain**:
   - Vercel Dashboard → Domains
   - Add: `usdtidelive.vercel.app`
   - Update LIFF endpoint to match

## 📋 Verification Checklist

After implementing fixes:

- [ ] LIFF app initializes without error
- [ ] User profile loads successfully
- [ ] Wallet connection works
- [ ] All LIFF features accessible

## 🆘 Still Having Issues?

### Advanced Debugging
1. **Check LIFF URL directly**:
   ```
   https://liff.line.me/2007983577-jpZL6DBP?liff.debug=true
   ```

2. **Verify environment**:
   ```javascript
   // Check in browser console
   console.log('LIFF Environment:', liff.getOS());
   console.log('LIFF Version:', liff.getVersion());
   console.log('Is in LINE:', liff.isInClient());
   ```

3. **Test endpoint accessibility**:
   ```bash
   curl -I https://usdtidelive-l1dx79jpl-lawrencezcls-projects.vercel.app
   ```

## 📞 Support Resources

- [LINE Developers Documentation](https://developers.line.biz/en/docs/liff/)
- [LIFF API Reference](https://developers.line.biz/en/reference/liff/)
- [LIFF Troubleshooting Guide](https://developers.line.biz/en/docs/liff/troubleshooting/)

## 🎯 Next Steps

1. **Immediate**: Update LIFF endpoint URL in LINE Developers Console
2. **Short-term**: Verify all LIFF settings match production deployment
3. **Long-term**: Consider custom domain for stable endpoint

**Priority Order**:
1. Fix endpoint URL mismatch (highest priority)
2. Verify LIFF ID and settings
3. Test with debug mode enabled
4. Consider creating new LIFF app if issues persist