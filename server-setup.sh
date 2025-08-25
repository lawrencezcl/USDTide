#!/bin/bash

# USDTide Server Initial Setup Script
# Run this on a fresh Linux server to prepare for USDTide deployment

set -e

echo "🔧 USDTide Server Setup - Initial Configuration"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$NAME
    VERSION=$VERSION_ID
else
    print_error "Cannot detect OS"
    exit 1
fi

print_status "Detected OS: $OS $VERSION"

# Update system
print_header "Step 1: System Update"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt update && apt upgrade -y
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    yum update -y || dnf update -y
fi

# Install essential packages
print_header "Step 2: Installing Dependencies"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt install -y curl wget git nginx ufw
    
    # Install Node.js 18
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    yum install -y curl wget git nginx firewalld || dnf install -y curl wget git nginx firewalld
    
    # Install Node.js 18
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs || dnf install -y nodejs
fi

# Verify installations
print_status "Verifying installations..."
node --version
npm --version
nginx -v

# Install PM2 globally
print_header "Step 3: Installing PM2"
npm install -g pm2

# Configure firewall
print_header "Step 4: Firewall Configuration"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    systemctl start firewalld
    systemctl enable firewalld
    firewall-cmd --permanent --add-service=ssh
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
fi

# Configure Nginx
print_header "Step 5: Nginx Configuration"
systemctl start nginx
systemctl enable nginx

# Create web directory
mkdir -p /var/www/USDTide
chown -R www-data:www-data /var/www/USDTide

# Test Nginx configuration
nginx -t

# Install Certbot for SSL
print_header "Step 6: SSL Setup Preparation"
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    apt install -y certbot python3-certbot-nginx
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
    yum install -y certbot python3-certbot-nginx || dnf install -y certbot python3-certbot-nginx
fi

# Create deployment user (optional security)
print_header "Step 7: Creating Deployment User"
DEPLOY_USER="usdtide"
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG www-data "$DEPLOY_USER"
    print_status "Created deployment user: $DEPLOY_USER"
else
    print_warning "User $DEPLOY_USER already exists"
fi

# Set up SSH key directory for deployment user
mkdir -p /home/$DEPLOY_USER/.ssh
chmod 700 /home/$DEPLOY_USER/.ssh
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh

# Create project directory structure
print_header "Step 8: Directory Setup"
mkdir -p /var/www/USDTide/{frontend,logs}
chown -R www-data:www-data /var/www/USDTide
chmod -R 755 /var/www/USDTide

# Create log files
mkdir -p /var/log/usdtide
touch /var/log/usdtide/deploy.log
chmod 644 /var/log/usdtide/deploy.log

# Create nginx site template
print_header "Step 9: Nginx Site Configuration"
cat > /etc/nginx/sites-available/usdtide << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your IP/domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    root /var/www/USDTide/frontend/dist;
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    server_tokens off;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/usdtide /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Create systemd service for monitoring (optional)
print_header "Step 10: Systemd Service"
cat > /etc/systemd/system/usdtide-frontend.service << 'EOF'
[Unit]
Description=USDTide Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/USDTide/frontend
ExecStart=/usr/bin/serve -s dist -l 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Create placeholder index.html
print_header "Step 11: Creating Placeholder"
mkdir -p /var/www/USDTide/frontend/dist
cat > /var/www/USDTide/frontend/dist/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>USDTide - Deploying...</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <h1>USDTide Frontend</h1>
    <p>Server is configured and ready for deployment.</p>
    <p>Next steps:</p>
    <ol>
        <li>Clone your USDTide repository to /var/www/USDTide</li>
        <li>Run the deployment script</li>
        <li>Configure SSL certificate</li>
    </ol>
</body>
</html>
EOF

# Restart nginx
systemctl restart nginx

# Print completion message
print_header "✅ Server Setup Complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Clone your USDTide repository:"
echo "   cd /var/www && git clone YOUR_REPO_URL USDTide"
echo ""
echo "2. Run the deployment script:"
echo "   cd /var/www/USDTide && ./deploy-production.sh"
echo ""
echo "3. Configure SSL (optional):"
echo "   certbot --nginx -d YOUR_DOMAIN"
echo ""
echo "4. Access your server at:"
echo "   http://$(curl -s ifconfig.me)"
echo ""
echo "📋 Installed Services:"
echo "   - Node.js $(node --version)"
echo "   - Nginx web server"
echo "   - PM2 process manager"
echo "   - Certbot for SSL"
echo "   - Firewall configured"
echo ""
echo "🔧 Files created:"
echo "   - /etc/nginx/sites-available/usdtide"
echo "   - /var/www/USDTide/ (project directory)"
echo "   - /etc/systemd/system/usdtide-frontend.service"