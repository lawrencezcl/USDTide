# 🚀 USDTide Production Deployment - Complete Guide

## 📋 Quick Deployment Summary

### Option 1: Automated Deployment (Recommended)
```bash
# 1. On your Linux server, run:
curl -O https://raw.githubusercontent.com/your-username/usdtide/main/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh

# 2. Clone your repository
cd /var/www && git clone YOUR_REPO_URL USDTide

# 3. Deploy
./deploy-production.sh
```

### Option 2: Manual Step-by-Step

## 🎯 5-Minute Quick Start

### Step 1: Server Preparation
```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Run automated setup
wget https://raw.githubusercontent.com/your-username/usdtide/main/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### Step 2: Repository Setup
```bash
cd /var/www
git clone https://github.com/your-username/usdtide.git
cd usdtide
```

### Step 3: Deploy
```bash
./deploy-production.sh
```

### Step 4: Access Your App
- **Public IP**: http://YOUR_SERVER_IP
- **Domain**: http://your-domain.com
- **HTTPS**: https://your-domain.com (after SSL setup)

## 🔧 Detailed Manual Steps

### 1. Server Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum
- **Network**: Public IP or domain

### 2. Install Dependencies
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx ufw nodejs npm certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget git nginx firewalld nodejs npm certbot python3-certbot-nginx
```

### 3. Configure Nginx
```bash
# Copy configuration
sudo cp nginx-config-template.conf /etc/nginx/sites-available/usdtide
sudo ln -sf /etc/nginx/sites-available/usdtide /etc/nginx/sites-enabled/

# Edit for your domain/IP
sudo nano /etc/nginx/sites-available/usdtide

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Deploy Application
```bash
# Clone repository
cd /var/www
git clone YOUR_REPO_URL USDTide
cd USDTide/frontend

# Install dependencies
npm install
npm run build

# Copy to web directory
sudo cp -r dist/* /var/www/USDTide/frontend/dist/
sudo chown -R www-data:www-data /var/www/USDTide/frontend/dist/
```

### 5. SSL Certificate (Let's Encrypt)
```bash
# For domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# For IP (self-signed, not recommended for production)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/usdtide.key \
  -out /etc/ssl/certs/usdtide.crt
```

## 📊 Verification Checklist

### ✅ Pre-Deployment
- [ ] Server OS updated
- [ ] Node.js 18+ installed
- [ ] Nginx running on port 80
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Git repository accessible

### ✅ Deployment
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm install`)
- [ ] Build completed (`npm run build`)
- [ ] Files copied to web directory
- [ ] Nginx configuration tested
- [ ] Application accessible via IP

### ✅ Post-Deployment
- [ ] SSL certificate installed
- [ ] Domain pointing to server
- [ ] HTTPS working correctly
- [ ] Performance optimized (gzip, caching)
- [ ] Security headers configured
- [ ] Logs monitoring setup

## 🚨 Troubleshooting

### Common Issues

**Port 80 already in use**
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # or other web server
sudo systemctl restart nginx
```

**Build fails**
```bash
# Check Node version
node --version  # Should be 18+

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Nginx configuration error**
```bash
sudo nginx -t
sudo journalctl -u nginx -f
```

**Permission denied**
```bash
sudo chown -R www-data:www-data /var/www/USDTide/
sudo chmod -R 755 /var/www/USDTide/
```

## 🔍 Health Check Commands

```bash
# Check server status
curl -I http://YOUR_SERVER_IP

# Check SSL certificate
openssl s_client -connect your-domain.com:443

# Monitor logs
sudo tail -f /var/log/nginx/usdtide-access.log
sudo tail -f /var/log/nginx/usdtide-error.log

# Check disk space
df -h

# Check memory usage
free -h
```

## 📞 Support

### Quick Debug Script
```bash
#!/bin/bash
echo "=== USDTide Health Check ==="
echo "Server IP: $(curl -s ifconfig.me)"
echo "Node Version: $(node --version)"
echo "Nginx Status: $(systemctl is-active nginx)"
echo "Port 80: $(netstat -tlnp | grep :80)"
echo "Disk Space: $(df -h / | tail -1)"
echo "Memory: $(free -h | grep Mem)"
echo "HTTP Response: $(curl -s -o /dev/null -w "%{http_code}" http://localhost)"
```

## 🎯 Production Checklist

### Before Going Live
- [ ] Environment variables configured
- [ ] API endpoints updated to production
- [ ] Error handling tested
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated

### Launch Day
- [ ] Final deployment tested
- [ ] SSL certificate verified
- [ ] Domain DNS propagated
- [ ] All features tested
- [ ] User acceptance completed
- [ ] Support team notified
- [ ] Rollback plan ready

## 📚 Additional Resources

- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Nginx Configuration](nginx-config-template.conf)
- [Deployment Script](deploy-production.sh)
- [Server Setup Script](server-setup.sh)
- [Production Checklist](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

**🎉 Ready to Deploy!** 
Choose your preferred method above and follow the checklist to ensure a smooth production deployment.