#!/bin/bash

# Lead GraphQL Schema Verification Test
# This script tests if the Lead entities are properly exposed in GraphQL

set -e

echo "════════════════════════════════════════════════════════════"
echo "  Lead GraphQL Schema Verification Test"
echo "════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if server is running
echo "Checking if Twenty server is running..."
if ! curl -f -s http://localhost:3000/healthz > /dev/null 2>&1; then
    print_error "Server is not running on http://localhost:3000"
    print_info "Please start the server with: npx nx start twenty-server"
    exit 1
fi
print_success "Server is running"
echo ""

# Test 1: Lead type introspection
echo "Test 1: Checking Lead type in GraphQL schema..."
INTROSPECT_QUERY='{"query":"query{__type(name:\"Lead\"){name kind fields{name type{name kind}}}}"}'

INTROSPECT_RESULT=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "$INTROSPECT_QUERY")

if echo "$INTROSPECT_RESULT" | grep -q '"name":"Lead"'; then
    print_success "Lead type found in GraphQL schema"
    
    # Count fields (approximate - includes nested type names)
    FIELD_COUNT=$(echo "$INTROSPECT_RESULT" | grep -o '"name":"[^"]*"' | grep -v '"name":"Lead"' | wc -l)
    print_info "Lead type and its related types have approximately $FIELD_COUNT named elements"
else
    print_error "Lead type NOT found in GraphQL schema"
    print_info "You need to run the fix: ./fix-lead-graphql.sh"
    exit 1
fi
echo ""

# Test 2: Check for createLeads mutation
echo "Test 2: Checking for createLeads mutation..."
MUTATION_QUERY='{"query":"query{__type(name:\"Mutation\"){fields{name}}}"}'

MUTATION_RESULT=$(curl -s -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d "$MUTATION_QUERY")

if echo "$MUTATION_RESULT" | grep -q '"name":"createLeads"'; then
    print_success "createLeads mutation found"
else
    print_error "createLeads mutation NOT found"
    exit 1
fi
echo ""

# Test 3: Check for other Lead entities
echo "Test 3: Checking for other Lead entities..."

ENTITIES=(
    "LeadBusinessDetail"
    "Property"
    "CompanyParty"
    "IndividualParty"
    "LeadNote"
    "LeadDocument"
    "CatalogProduct"
    "CatalogStatus"
)

ALL_FOUND=true
for entity in "${ENTITIES[@]}"; do
    ENTITY_QUERY="{\"query\":\"query{__type(name:\\\"$entity\\\"){name}}\"}"
    ENTITY_RESULT=$(curl -s -X POST http://localhost:3000/graphql \
      -H "Content-Type: application/json" \
      -d "$ENTITY_QUERY")
    
    if echo "$ENTITY_RESULT" | grep -q "\"name\":\"$entity\""; then
        print_success "$entity type found"
    else
        print_error "$entity type NOT found"
        ALL_FOUND=false
    fi
done
echo ""

# Final result
if [ "$ALL_FOUND" = true ]; then
    echo "════════════════════════════════════════════════════════════"
    echo -e "${GREEN}  ✓ All Lead entities are properly configured!${NC}"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "You can now use Lead entities in GraphQL. Try:"
    echo ""
    echo "  # Create a lead"
    echo "  mutation {"
    echo "    createLeads(data: [{"
    echo "      leadNo: \"LD-202601-00001\""
    echo "      customerName: \"Test Customer\""
    echo "      contactNumber: {"
    echo "        primaryPhoneCountryCode: \"+1\""
    echo "        primaryPhoneNumber: \"5551234567\""
    echo "      }"
    echo "      loanAmount: 250000"
    echo "    }]) {"
    echo "      id"
    echo "      leadNo"
    echo "      customerName"
    echo "    }"
    echo "  }"
    echo ""
    echo "  # Query leads"
    echo "  query {"
    echo "    leads {"
    echo "      edges {"
    echo "        node {"
    echo "          id"
    echo "          leadNo"
    echo "          customerName"
    echo "          loanAmount"
    echo "        }"
    echo "      }"
    echo "    }"
    echo "  }"
    echo ""
    exit 0
else
    echo "════════════════════════════════════════════════════════════"
    echo -e "${RED}  ✗ Some Lead entities are missing${NC}"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Please run the fix script:"
    echo "  ./fix-lead-graphql.sh"
    echo ""
    echo "Or see the troubleshooting guide:"
    echo "  cat LEAD_GRAPHQL_FIX.md"
    echo ""
    exit 1
fi
