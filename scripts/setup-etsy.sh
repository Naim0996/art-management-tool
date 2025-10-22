#!/bin/bash
# Setup script for Etsy API integration
# This script helps configure Etsy API credentials and test the integration

set -e

echo "🛍️  Etsy API Integration Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_success "Created .env file from .env.example"
else
    print_info ".env file already exists"
fi

# Check current configuration
echo ""
print_info "Current Etsy Configuration:"
echo "----------------------------"

# Read current values
ETSY_API_KEY=$(grep -E "^ETSY_API_KEY=" .env | cut -d '=' -f2 || echo "")
ETSY_SHOP_ID=$(grep -E "^ETSY_SHOP_ID=" .env | cut -d '=' -f2 || echo "")
ETSY_SYNC_ENABLED=$(grep -E "^ETSY_SYNC_ENABLED=" .env | cut -d '=' -f2 || echo "false")

if [ -z "$ETSY_API_KEY" ]; then
    print_warning "ETSY_API_KEY not configured"
else
    print_success "ETSY_API_KEY configured (length: ${#ETSY_API_KEY})"
fi

if [ -z "$ETSY_SHOP_ID" ]; then
    print_warning "ETSY_SHOP_ID not configured"
else
    print_success "ETSY_SHOP_ID: $ETSY_SHOP_ID"
fi

echo "Sync Enabled: $ETSY_SYNC_ENABLED"

# Interactive configuration
echo ""
read -p "Would you like to configure Etsy API credentials now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Etsy API Configuration"
    echo "----------------------"
    echo ""
    echo "To get your Etsy API credentials:"
    echo "1. Visit: https://www.etsy.com/developers/"
    echo "2. Create or select your app"
    echo "3. Copy the API Key (Keystring)"
    echo "4. Generate an access token through OAuth 2.0"
    echo ""
    
    read -p "Enter your Etsy API Key: " api_key
    read -p "Enter your Etsy API Secret: " api_secret
    read -p "Enter your Etsy Shop ID: " shop_id
    read -p "Enter your Etsy Access Token: " access_token
    
    # Update .env file
    sed -i.bak "s|^ETSY_API_KEY=.*|ETSY_API_KEY=$api_key|" .env
    sed -i.bak "s|^ETSY_API_SECRET=.*|ETSY_API_SECRET=$api_secret|" .env
    sed -i.bak "s|^ETSY_SHOP_ID=.*|ETSY_SHOP_ID=$shop_id|" .env
    sed -i.bak "s|^ETSY_ACCESS_TOKEN=.*|ETSY_ACCESS_TOKEN=$access_token|" .env
    
    rm -f .env.bak
    
    print_success "Credentials updated in .env file"
    
    # Ask about sync
    echo ""
    read -p "Enable automatic synchronization? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i.bak "s|^ETSY_SYNC_ENABLED=.*|ETSY_SYNC_ENABLED=true|" .env
        rm -f .env.bak
        print_success "Automatic sync enabled"
    fi
fi

# Verify database migrations
echo ""
print_info "Checking database migrations..."

MIGRATION_FILES=(
    "backend/migrations/010_create_etsy_sync_config.up.sql"
    "backend/migrations/011_create_etsy_products.up.sql"
    "backend/migrations/012_create_etsy_inventory_sync.up.sql"
)

for migration in "${MIGRATION_FILES[@]}"; do
    if [ -f "$migration" ]; then
        print_success "Found: $(basename $migration)"
    else
        print_error "Missing: $(basename $migration)"
    fi
done

# Check if Docker is running
echo ""
print_info "Checking Docker status..."

if docker ps > /dev/null 2>&1; then
    print_success "Docker is running"
    
    # Offer to start services
    echo ""
    read -p "Would you like to start the application with Docker Compose? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting services..."
        docker compose up -d
        
        echo ""
        print_success "Services started!"
        echo ""
        print_info "Available services:"
        echo "  - Frontend: http://localhost:3000"
        echo "  - Backend: http://localhost:8080"
        echo "  - Health: http://localhost:8080/health"
        echo ""
        print_info "View logs with: docker compose logs -f"
    fi
else
    print_warning "Docker is not running"
    print_info "Start Docker to use the containerized setup"
fi

# Display next steps
echo ""
print_info "📚 Next Steps:"
echo "-------------"
echo "1. Review the integration guide: docs/ETSY_INTEGRATION.md"
echo "2. Review security guidelines: docs/SECURITY_INFRASTRUCTURE.md"
echo "3. Test the API connection"
echo "4. Configure sync intervals in .env"
echo "5. Set up staging environment if needed"
echo ""
print_info "For staging environment:"
echo "  docker compose -f docker-compose.staging.yml up -d"
echo ""
print_success "Setup complete! 🎉"
