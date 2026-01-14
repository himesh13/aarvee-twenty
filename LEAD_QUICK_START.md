# Lead Management System - Quick Start

## 🚨 Important: Database Initialization Required

If you're experiencing GraphQL errors with Lead entities (e.g., `__type(name: "Lead")` returns null or `createLead` mutation not found), you need to initialize the database.

### Quick Fix (5 minutes)

Run the automated fix script:

```bash
./fix-lead-graphql.sh
```

This script will:
1. ✓ Check PostgreSQL and Redis are running
2. ✓ Create .env file if needed
3. ✓ Build the server
4. ✓ Reset and initialize the database
5. ✓ Flush cache

### Manual Steps

If you prefer manual setup:

```bash
# 1. Set up environment (from repository root)
cd packages/twenty-server
cp .env.example .env
cd ../..

# 2. Build the server
npx nx build twenty-server

# 3. Initialize database
npx nx database:reset twenty-server --configuration=no-seed

# 4. Start the server
npx nx start twenty-server
```

### Verify the Fix

Once the server is running, test at `http://localhost:3000/graphql`:

```graphql
# Test 1: Introspect Lead type
query {
  __type(name: "Lead") {
    name
    fields {
      name
    }
  }
}

# Test 2: Create a lead
mutation {
  createLeads(data: [{
    leadNo: "LD-202601-00001"
    customerName: "Test Customer"
    contactNumber: {
      primaryPhoneCountryCode: "+1"
      primaryPhoneNumber: "5551234567"
    }
    loanAmount: 250000
  }]) {
    id
    leadNo
    customerName
  }
}

# Test 3: Query leads
query {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        loanAmount
      }
    }
  }
}
```

### What Gets Created

After initialization, you'll have 17 new entities available via GraphQL:

**Lead Module (12 entities):**
- Lead, LeadBusinessDetail, Property, CompanyParty, IndividualParty
- LeadNote, LeadDocument, ExistingLoan, Vehicle, Machinery
- Reference, Disbursement

**Catalog Module (5 entities):**
- CatalogProduct, CatalogStatus, CatalogFinancer
- CatalogLoanType, CatalogPropertyType

Each entity supports full CRUD operations:
- `createXxx` / `createXxxs`
- `updateXxx`
- `deleteXxx` / `restoreXxx`
- `xxx` (get one)
- `xxxs` (get many with pagination)

### Detailed Documentation

- **[LEAD_GRAPHQL_FIX.md](LEAD_GRAPHQL_FIX.md)** - Complete troubleshooting guide
- **[Lead Module README](packages/twenty-server/src/modules/lead/README.md)** - Full documentation
- **[Testing Guide](packages/twenty-server/src/modules/lead/TESTING.md)** - GraphQL examples and tests
- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - Development progress

### Prerequisites

Ensure you have:
- PostgreSQL 15+ running on `localhost:5432`
- Redis running on `localhost:6379`
- Node.js 18+ (see `.nvmrc`)
- Yarn package manager

### Troubleshooting

**PostgreSQL not running?**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check connection
pg_isready -h localhost -p 5432
```

**Redis not running?**
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Check connection
redis-cli ping
# Should return: PONG
```

**Still having issues?**

See **[LEAD_GRAPHQL_FIX.md](LEAD_GRAPHQL_FIX.md)** for comprehensive troubleshooting.

---

## About Lead Management System

A comprehensive CRM module for loan origination workflows, featuring:

- 📝 Lead tracking with auto-generated numbers
- 👤 Applicant, co-applicant, and guarantor management
- 🏢 Company and individual party support
- 🏠 Property, vehicle, and machinery information
- 💰 Loan details and disbursement tracking
- 📎 Document uploads with categories
- 📊 Catalog-driven lookups for consistent data
- 🔍 Full-text search across lead fields
- ✅ Complete integration with Twenty's task, note, and timeline features

For complete documentation, see the [Lead Module README](packages/twenty-server/src/modules/lead/README.md).
