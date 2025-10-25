#!/bin/bash

# Docker Compose Environment Test Script
# This script validates that all Docker Compose configurations work properly

echo "🔧 Testing Docker Compose Environment Configurations..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test configuration
test_config() {
    local file=$1
    local env_name=$2
    
    echo -e "\n${YELLOW}Testing $env_name environment...${NC}"
    echo "File: $file"
    
    if docker-compose -f "$file" config > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $env_name configuration is valid${NC}"
        return 0
    else
        echo -e "${RED}❌ $env_name configuration failed${NC}"
        docker-compose -f "$file" config
        return 1
    fi
}

# Test all configurations
echo "Testing all Docker Compose configurations..."

test_config "docker-compose.yml" "Default"
test_config "docker-compose.development.yml" "Development" 
test_config "docker-compose.test.yml" "Test"
test_config "docker-compose.production.yml" "Production"

echo -e "\n${YELLOW}Checking environment files...${NC}"

# Check environment files exist
env_files=(".env" ".env.development" ".env.test" ".env.production" ".env.example")
for env_file in "${env_files[@]}"; do
    if [[ -f "$env_file" ]]; then
        echo -e "${GREEN}✅ $env_file exists${NC}"
    else
        echo -e "${RED}❌ $env_file missing${NC}"
    fi
done

echo -e "\n${YELLOW}Environment Variable Loading Test...${NC}"

# Test environment variable loading for development
echo "Testing development environment variables..."
if docker-compose -f docker-compose.development.yml config | grep -q "POSTGRES_PASSWORD: artpassword"; then
    echo -e "${GREEN}✅ Development environment variables loaded correctly${NC}"
else
    echo -e "${RED}❌ Development environment variables not loaded properly${NC}"
fi

echo -e "\n${YELLOW}Port Configuration Summary:${NC}"
echo "- Development: Backend 8080, Frontend 3000, DB 5432"
echo "- Test:        Backend 8081, Frontend 3002, DB 5433" 
echo "- Production:  Backend 8080, Frontend 3000, DB 5432"
echo "- Default:     Backend 8080, Frontend 3000, DB 5432"

echo -e "\n${GREEN}🎉 Environment configuration test completed!${NC}"
echo -e "\n${YELLOW}Usage Examples:${NC}"
echo "  Development: docker-compose -f docker-compose.development.yml up"
echo "  Test:        docker-compose -f docker-compose.test.yml up"
echo "  Production:  docker-compose -f docker-compose.production.yml up"
echo "  Default:     docker-compose up"