#!/bin/bash

# Lead GraphQL Schema Fix Script
# This script initializes the database to expose Lead entities in the GraphQL schema

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════"
echo "  Lead GraphQL Schema Fix Script"
echo "════════════════════════════════════════════════════════════"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check if PostgreSQL is running
print_info "Checking PostgreSQL connection..."
if pg_isready -h localhost -p 5432 &> /dev/null; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL is not running on localhost:5432"
    print_info "Please start PostgreSQL and try again"
    exit 1
fi

# Check if Redis is running
print_info "Checking Redis connection..."
if redis-cli -h localhost -p 6379 ping &> /dev/null; then
    print_success "Redis is running"
else
    print_error "Redis is not running on localhost:6379"
    print_info "Please start Redis and try again"
    exit 1
fi

# Check if .env exists
print_info "Checking environment configuration..."
if [ ! -f "packages/twenty-server/.env" ]; then
    print_warning ".env file not found, creating from .env.example..."
    cp packages/twenty-server/.env.example packages/twenty-server/.env
    print_success "Created .env file"
    print_warning "Please review packages/twenty-server/.env and update if needed"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and configure..."
else
    print_success ".env file exists"
fi

echo ""
echo "Step 2: Building the server..."
echo ""

print_info "Running: npx nx build twenty-server"
if npx nx build twenty-server; then
    print_success "Server build completed"
else
    print_error "Server build failed"
    exit 1
fi

echo ""
echo "Step 3: Resetting and initializing database..."
echo ""

print_warning "This will reset the database and delete all existing data!"
read -p "Continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Operation cancelled by user"
    exit 0
fi

print_info "Running: npx nx database:reset twenty-server --configuration=no-seed"
if npx nx database:reset twenty-server --configuration=no-seed; then
    print_success "Database reset and initialization completed"
else
    print_error "Database reset failed"
    exit 1
fi

echo ""
echo "Step 4: Flushing cache..."
echo ""

print_info "Running: npx nx command-no-deps twenty-server cache:flush"
if npx nx command-no-deps twenty-server cache:flush; then
    print_success "Cache flushed"
else
    print_warning "Cache flush failed (non-critical, continuing...)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}  ✓ Lead GraphQL Schema Fix Complete!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo "   ${BLUE}npx nx start twenty-server${NC}"
echo ""
echo "2. Open GraphQL playground:"
echo "   ${BLUE}http://localhost:3000/graphql${NC}"
echo ""
echo "3. Test the Lead type introspection:"
echo "   ${BLUE}query { __type(name: \"Lead\") { name fields { name } } }${NC}"
echo ""
echo "4. Test creating a lead:"
echo "   ${BLUE}mutation { createLeads(data: [{...}]) { id leadNo } }${NC}"
echo ""
echo "5. Run integration tests (optional):"
echo "   ${BLUE}npx nx run twenty-server:test:integration:with-db-reset${NC}"
echo ""
echo "For detailed testing instructions, see:"
echo "  - LEAD_GRAPHQL_FIX.md"
echo "  - packages/twenty-server/src/modules/lead/TESTING.md"
echo ""
