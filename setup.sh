#!/bin/bash

# Art Management Tool - Setup Script
# This script helps initialize the development environment

set -e

echo "🎨 Art Management Tool - Development Setup"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Docker
if command -v docker &> /dev/null; then
    print_success "Docker installed ($(docker --version))"
    DOCKER_INSTALLED=true
else
    print_error "Docker not found"
    DOCKER_INSTALLED=false
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    print_success "Docker Compose installed"
    DOCKER_COMPOSE_INSTALLED=true
else
    print_error "Docker Compose not found"
    DOCKER_COMPOSE_INSTALLED=false
fi

# Check Go
if command -v go &> /dev/null; then
    GO_VERSION=$(go version | awk '{print $3}')
    print_success "Go installed ($GO_VERSION)"
    GO_INSTALLED=true
else
    print_error "Go not found (required: Go 1.21+)"
    GO_INSTALLED=false
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed ($NODE_VERSION)"
    NODE_INSTALLED=true
else
    print_error "Node.js not found (required: Node.js 18+)"
    NODE_INSTALLED=false
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed (v$NPM_VERSION)"
    NPM_INSTALLED=true
else
    print_error "npm not found"
    NPM_INSTALLED=false
fi

echo ""
echo "=========================================="
echo ""

# Ask user for setup preference
echo "Choose setup method:"
echo "1) Docker (Recommended - All services in containers)"
echo "2) Local Development (Go + Node.js required)"
echo "3) Skip setup (just check prerequisites)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        if [ "$DOCKER_INSTALLED" = false ] || [ "$DOCKER_COMPOSE_INSTALLED" = false ]; then
            print_error "Docker and Docker Compose are required for this option"
            print_info "Install from: https://docs.docker.com/get-docker/"
            exit 1
        fi
        
        echo ""
        print_info "Starting Docker setup..."
        echo ""
        
        # Create .env files if they don't exist
        if [ ! -f "backend/.env" ]; then
            print_info "Creating backend/.env from template..."
            cat > backend/.env << 'EOL'
PORT=8080
DATABASE_URL=postgresql://artuser:artpass@db:5432/artdb
JWT_SECRET=your-secret-key-change-in-production
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
PAYMENT_PROVIDER=mock
EOL
            print_success "Created backend/.env"
        fi
        
        if [ ! -f "frontend/.env.local" ]; then
            print_info "Creating frontend/.env.local from template..."
            cat > frontend/.env.local << 'EOL'
NEXT_PUBLIC_API_URL=http://localhost:8080
EOL
            print_success "Created frontend/.env.local"
        fi
        
        # Build and start containers
        print_info "Building and starting containers..."
        docker compose up -d
        
        print_success "Docker containers started successfully!"
        echo ""
        echo "🌐 Access the application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8080"
        echo "   API Health: http://localhost:8080/health"
        echo ""
        echo "📊 Admin credentials:"
        echo "   Username: admin"
        echo "   Password: admin"
        echo ""
        echo "📝 Useful commands:"
        echo "   View logs: docker compose logs -f"
        echo "   Stop: docker compose down"
        echo "   Restart: docker compose restart"
        ;;
        
    2)
        if [ "$GO_INSTALLED" = false ] || [ "$NODE_INSTALLED" = false ]; then
            print_error "Go and Node.js are required for local development"
            print_info "Go: https://golang.org/dl/"
            print_info "Node.js: https://nodejs.org/"
            exit 1
        fi
        
        echo ""
        print_info "Setting up local development environment..."
        echo ""
        
        # Backend setup
        print_info "Setting up backend..."
        cd backend
        
        if [ ! -f ".env" ]; then
            cat > .env << 'EOL'
PORT=8080
DATABASE_URL=sqlite:./data.db
JWT_SECRET=your-secret-key-change-in-production
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
PAYMENT_PROVIDER=mock
EOL
            print_success "Created backend/.env (using SQLite)"
        fi
        
        print_info "Installing Go dependencies..."
        go mod download
        print_success "Go dependencies installed"
        
        print_info "Building backend..."
        go build -o server
        print_success "Backend built successfully"
        
        cd ..
        
        # Frontend setup
        print_info "Setting up frontend..."
        cd frontend
        
        if [ ! -f ".env.local" ]; then
            cat > .env.local << 'EOL'
NEXT_PUBLIC_API_URL=http://localhost:8080
EOL
            print_success "Created frontend/.env.local"
        fi
        
        print_info "Installing npm dependencies..."
        npm install
        print_success "npm dependencies installed"
        
        cd ..
        
        print_success "Local development environment ready!"
        echo ""
        echo "🚀 To start development:"
        echo ""
        echo "Terminal 1 (Backend):"
        echo "   cd backend"
        echo "   go run main.go"
        echo "   # or: ./server"
        echo ""
        echo "Terminal 2 (Frontend):"
        echo "   cd frontend"
        echo "   npm run dev"
        echo ""
        echo "🌐 Access the application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8080"
        ;;
        
    3)
        print_info "Setup skipped"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo ""
print_success "Setup complete!"
echo ""
print_info "For more information, see:"
echo "   README.md - Main documentation"
echo "   docs/guides/DOCKER.md - Docker guide"
echo "   docs/guides/DEPLOYMENT.md - Deployment guide"
echo "   docs/CONTRIBUTING.md - Contribution guidelines"
echo ""
