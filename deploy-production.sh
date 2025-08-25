#!/bin/bash

# USDTide Frontend Production Deployment Script
# Run this script on your Linux server after initial setup

set -e

echo "🚀 Starting USDTide Frontend Production Deployment..."

# Configuration
PROJECT_DIR="/var/www/USDTide"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_DIR="/var/www/html"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if required commands exist
print_status "Checking dependencies..."
for cmd in node npm nginx git; do
    if ! command -v $cmd &> /dev/null; then
        print_error "$cmd is not installed. Please install it first."
        exit 1
    fi
done

# Navigate to frontend directory
print_status "Navigating to frontend directory..."
cd "$FRONTEND_DIR"

# Pull latest changes from git
print_status "Pulling latest changes from git..."
git pull origin main

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

# Build for production
print_status "Building for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Backup current deployment
print_status "Backing up current deployment..."
if [ -d "$NGINX_DIR" ]; then
    sudo mv "$NGINX_DIR" "$NGINX_DIR.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy new build to nginx directory
print_status "Deploying new build..."
sudo cp -r dist "$NGINX_DIR"

# Set correct permissions
print_status "Setting file permissions..."
sudo chown -R www-data:www-data "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t

# Reload nginx
print_status "Reloading nginx..."
sudo systemctl reload nginx

# Verify deployment
print_status "Verifying deployment..."
if curl -f http://localhost > /dev/null 2>&1; then
    print_status "✅ Deployment successful!"
    print_status "Your USDTide frontend is now live!"
else
    print_error "Deployment verification failed"
    exit 1
fi

# Display deployment info
print_status "📊 Deployment Summary:"
echo "  - Frontend: Available at your server's IP/domain"
echo "  - Build Location: $NGINX_DIR"
echo "  - Last Updated: $(date)"
echo "  - Git Commit: $(git rev-parse --short HEAD)"

print_status "🎉 USDTide Frontend deployment completed successfully!"