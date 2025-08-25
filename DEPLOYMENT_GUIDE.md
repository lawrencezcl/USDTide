# USDTide Frontend Deployment Guide

## 🚀 Deploy to Public Linux Server - Complete Guide

This guide provides detailed steps to deploy the USDTide frontend to a public Linux server and access it via public IP.

## 📋 Prerequisites

### Server Requirements
- **Linux Distribution**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available space
- **Network**: Public IP address with ports 80 and 443 open
- **Domain**: Optional but recommended for HTTPS

### Local Requirements
- SSH access to the server
- Node.js 16+ and npm installed locally
- Git installed locally
- Your USDTide project ready for deployment

## 🔧 Step 1: Server Setup

### 1.1 Connect to Your Server
```bash
# Replace with your server details
ssh root@YOUR_SERVER_IP
# or
ssh username@YOUR_SERVER_IP
```

### 1.2 Update System Packages
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# or
sudo dnf update -y
```

### 1.3 Install Node.js and npm
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.4 Install Nginx (Web Server)
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
# or
sudo dnf install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install Git
```bash
# Ubuntu/Debian
sudo apt install git -y

# CentOS/RHEL
sudo yum install git -y
```

## 📁 Step 2: Project Setup on Server

### 2.1 Clone Your Repository
```bash
# Navigate to web directory
cd /var/www

# Clone your USDTide project
sudo git clone https://github.com/your-username/USDTide.git
sudo chown -R $USER:$USER USDTide
```

### 2.2 Install Dependencies
```bash
# Navigate to frontend directory
cd /var/www/USDTide/frontend

# Install dependencies
npm install

# Install PM2 for process management
sudo npm install -g pm2
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Create Production Environment File
```bash
# Copy environment template
cd /var/www/USDTide/frontend
cp .env.example .env.production

# Edit production environment variables
nano .env.production
```

### 3.2 Production Environment Variables
```bash
# Add these to .env.production
VITE_RPC_URL=https://public-en-cypress.klaytn.net
VITE_CHAIN_ID=8217

# Replace with your actual contract addresses
VITE_USDT_TOKEN_ADDRESS=0xYourUSDTContractAddress
VITE_STAKING_CONTRACT_ADDRESS=0xYourStakingContractAddress
VITE_LENDING_CONTRACT_ADDRESS=0xYourLendingContractAddress

# LINE Integration (production LIFF ID)
VITE_LIFF_ID=your_production_liff_id
VITE_LINE_CHANNEL_ID=your_production_channel_id

# Backend URL (if using backend)
VITE_BACKEND_URL=https://your-backend-domain.com
```

## 🔨 Step 4: Build the Application

### 4.1 Build for Production
```bash
# Navigate to frontend directory
cd /var/www/USDTide/frontend

# Build the application
npm run build

# The build files will be in dist/ directory
ls -la dist/
```

## 🌐 Step 5: Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/usdtide
```

### 5.2 Nginx Configuration File
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;  # or your-domain.com
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Root directory
    root /var/www/USDTide/frontend/dist;
    index index.html index.htm;
    
    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security: Hide nginx version
    server_tokens off;
}
```

### 5.3 Enable Site Configuration
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/usdtide /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.4 Remove Default Site (Optional)
```bash
# Remove default Nginx site
sudo rm /etc/nginx/sites-enabled/default

# Reload Nginx
sudo systemctl reload nginx
```

## 🔒 Step 6: HTTPS Setup (Let's Encrypt)

### 6.1 Install Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

### 6.2 Obtain SSL Certificate
```bash
# For IP address (if no domain)
sudo certbot --nginx -d YOUR_SERVER_IP

# For domain (recommended)
sudo certbot --nginx -d your-domain.com

# Follow the prompts to complete SSL setup
```

### 6.3 Auto-renewal Setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚀 Step 7: PM2 Process Management

### 7.1 Create PM2 Ecosystem File
```bash
# Create PM2 ecosystem file for build monitoring
cd /var/www/USDTide/frontend
nano ecosystem.config.js
```

### 7.2 PM2 Configuration
```javascript
module.exports = {
  apps: [
    {
      name: 'usdtide-frontend',
      script: 'serve',
      args: 'dist -s -l 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 7.3 Install Serve Package
```bash
# Install serve package for serving static files
npm install -g serve
```

## 🔧 Step 8: Production Build Process

### 8.1 Build Script Setup
```bash
# Create build script
nano /var/www/USDTide/build.sh
```

### 8.2 Build Script Content
```bash
#!/bin/bash
cd /var/www/USDTide/frontend

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build

# Copy build to nginx directory
sudo cp -r dist/* /var/www/html/

# Reload nginx
sudo systemctl reload nginx

echo "Build completed successfully!"
```

### 8.3 Make Build Script Executable
```bash
chmod +x /var/www/USDTide/build.sh
```

## 🔍 Step 9: Testing and Verification

### 9.1 Test HTTP Access
```bash
# Test from your local machine
curl http://YOUR_SERVER_IP

# Or open in browser
http://YOUR_SERVER_IP
```

### 9.2 Test HTTPS Access
```bash
# Test HTTPS (if SSL configured)
curl https://YOUR_SERVER_IP

# Or open in browser
https://YOUR_SERVER_IP
```

### 9.3 Test All Features
- [ ] LINE MiniDapp integration
- [ ] Wallet connection
- [ ] Contract interactions
- [ ] Responsive design on mobile
- [ ] Static asset loading

## 🛠️ Step 10: Troubleshooting

### 10.1 Common Issues and Solutions

#### Nginx 403 Forbidden
```bash
# Check file permissions
sudo chown -R www-data:www-data /var/www/USDTide/frontend/dist
sudo chmod -R 755 /var/www/USDTide/frontend/dist
```

#### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill process if needed
sudo kill -9 PID
```

### 10.2 Log Locations
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs usdtide-frontend
```

## 🔄 Step 11: Continuous Deployment

### 11.1 GitHub Actions Setup (Optional)
Create `.github/workflows/deploy.yml` in your repository:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy to server
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        source: "dist/"
        target: "/var/www/USDTide/frontend/"
```

## 🚀 Quick Start Script

For automated deployment, use the provided scripts:

### 1. Server Setup Script (run once on new server)
```bash
# Download and run server setup
curl -O https://raw.githubusercontent.com/your-username/usdtide/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. Deployment Script (run for each deployment)
```bash
# Use the provided deployment script
cd /var/www/USDTide
./deploy-production.sh
```

## 📋 Quick Reference Commands

### Server Management
```bash
# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check PM2 processes
pm2 status

# Restart PM2 process
pm2 restart usdtide-frontend

# View PM2 logs
pm2 logs usdtide-frontend
```

### File Permissions
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/USDTide/frontend/dist

# Set correct permissions
sudo chmod -R 755 /var/www/USDTide/frontend/dist
```

## 🎯 Final Verification Checklist

- [ ] Server accessible via public IP
- [ ] HTTPS working (SSL certificate active)
- [ ] All static assets loading correctly
- [ ] LINE MiniDapp integration working
- [ ] Contract interactions functional
- [ ] Mobile responsive design verified
- [ ] Security headers configured
- [ ] Performance optimized (Gzip, caching)
- [ ] Logs monitoring setup
- [ ] Backup strategy in place

## 🚀 Access Your USDTide Frontend

Once deployment is complete, access your USDTide frontend at:
- **HTTP**: `http://YOUR_SERVER_IP`
- **HTTPS**: `https://YOUR_SERVER_IP` (if SSL configured)
- **Domain**: `https://your-domain.com` (if using domain)

Your USDTide LINE MiniDapp is now live and ready for users! 🎉