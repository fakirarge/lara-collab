#!/bin/bash

# LaraCollab Production Deployment Script
# This script automates the production deployment process

set -e  # Exit on error

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║              🚀 LARA-COLLAB PRODUCTION DEPLOYMENT 🚀                        ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

echo -e "${GREEN}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Step 1: Pre-deployment checks
echo "📋 Step 1/10: Pre-deployment checks..."
echo "  - Checking Git status..."
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}  ✗ Uncommitted changes detected!${NC}"
    echo "  Please commit or stash your changes first."
    exit 1
fi
echo -e "${GREEN}  ✓ Git status clean${NC}"

echo "  - Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}  ✗ Not on main branch!${NC}"
    echo "  Production deployments must be from main branch."
    exit 1
fi
echo -e "${GREEN}  ✓ On correct branch: ${CURRENT_BRANCH}${NC}"

# Step 2: Run tests
echo ""
echo "🧪 Step 2/10: Running tests..."
echo "  - Running PHP tests..."
php artisan test --parallel || {
    echo -e "${RED}  ✗ PHP tests failed!${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ PHP tests passed${NC}"

echo "  - Running Pint (code style)..."
./vendor/bin/pint --test || {
    echo -e "${RED}  ✗ Code style check failed!${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Code style check passed${NC}"

# Step 3: Build frontend
echo ""
echo "📦 Step 3/10: Building frontend assets..."
npm run build || {
    echo -e "${RED}  ✗ Frontend build failed!${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Frontend built successfully${NC}"

# Step 4: Backup database
echo ""
echo "💾 Step 4/10: Creating database backup..."
mkdir -p "$BACKUP_DIR"
php artisan backup:database "$BACKUP_DIR/database.sql" 2>/dev/null || {
    echo -e "${YELLOW}  ⚠ Database backup command not found, using mysqldump...${NC}"
    mysqldump -u root -p lara_collab_prod > "$BACKUP_DIR/database.sql" 2>/dev/null || {
        echo -e "${RED}  ✗ Database backup failed!${NC}"
        exit 1
    }
}
echo -e "${GREEN}  ✓ Database backed up to: ${BACKUP_DIR}/database.sql${NC}"

# Step 5: Put application in maintenance mode
echo ""
echo "🔧 Step 5/10: Enabling maintenance mode..."
php artisan down --retry=60 --secret="deploy-secret-$(date +%s)" || {
    echo -e "${RED}  ✗ Failed to enable maintenance mode!${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Maintenance mode enabled${NC}"

# Step 6: Pull latest code
echo ""
echo "📥 Step 6/10: Pulling latest code..."
git pull origin "$CURRENT_BRANCH" || {
    echo -e "${RED}  ✗ Git pull failed!${NC}"
    php artisan up
    exit 1
}
echo -e "${GREEN}  ✓ Code updated${NC}"

# Step 7: Install dependencies
echo ""
echo "📚 Step 7/10: Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction || {
    echo -e "${RED}  ✗ Composer install failed!${NC}"
    php artisan up
    exit 1
}
echo -e "${GREEN}  ✓ PHP dependencies installed${NC}"

npm ci --production || {
    echo -e "${YELLOW}  ⚠ NPM install failed (non-critical)${NC}"
}

# Step 8: Run migrations
echo ""
echo "🗄️  Step 8/10: Running database migrations..."
php artisan migrate --force || {
    echo -e "${RED}  ✗ Migrations failed!${NC}"
    echo -e "${YELLOW}  Rolling back to backup...${NC}"
    # Restore database backup
    mysql -u root -p lara_collab_prod < "$BACKUP_DIR/database.sql"
    php artisan up
    exit 1
}
echo -e "${GREEN}  ✓ Migrations completed${NC}"

# Step 9: Clear and optimize caches
echo ""
echo "🧹 Step 9/10: Clearing and optimizing caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

echo "  - Optimizing configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "  - Optimizing autoloader..."
composer dump-autoload --optimize

echo -e "${GREEN}  ✓ Caches cleared and optimized${NC}"

# Step 10: Bring application back online
echo ""
echo "✅ Step 10/10: Disabling maintenance mode..."
php artisan up || {
    echo -e "${RED}  ✗ Failed to disable maintenance mode!${NC}"
    exit 1
}
echo -e "${GREEN}  ✓ Application is now online${NC}"

# Post-deployment tasks
echo ""
echo "🔄 Post-deployment tasks..."

echo "  - Restarting queue workers..."
php artisan queue:restart 2>/dev/null || echo -e "${YELLOW}    ⚠ Queue restart skipped (not running)${NC}"

echo "  - Running scheduled tasks..."
php artisan schedule:run 2>/dev/null || echo -e "${YELLOW}    ⚠ Schedule run skipped${NC}"

# Verify deployment
echo ""
echo "🔍 Verifying deployment..."
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
if [ "$response_code" = "200" ]; then
    echo -e "${GREEN}  ✓ Health check passed (HTTP 200)${NC}"
else
    echo -e "${YELLOW}  ⚠ Health check returned HTTP ${response_code}${NC}"
fi

# Success message
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                   🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉                  ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Deployment Summary:${NC}"
echo "  • Environment: ${ENVIRONMENT}"
echo "  • Branch: ${CURRENT_BRANCH}"
echo "  • Backup: ${BACKUP_DIR}"
echo "  • Time: $(date)"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "  1. Monitor error logs: tail -f storage/logs/laravel.log"
echo "  2. Check Sentry for errors: https://sentry.io"
echo "  3. Monitor performance metrics"
echo "  4. Verify critical user flows"
echo ""
echo -e "${GREEN}🚀 LaraCollab is now live in ${ENVIRONMENT}!${NC}"
echo ""

exit 0

