## 🔧 Fixing Lead GraphQL Schema Issues

### Symptoms

If you're seeing these errors when trying to use Lead entities:

```graphql
# This returns null:
query {
  __type(name: "Lead") { name }
}

# This returns "Cannot query field createLead":
mutation {
  createLead(data: {...}) { id }
}
```

### The Fix

The Lead Management System code is complete, but the **database needs to be initialized** to create the tables and expose the GraphQL schema.

#### Quick Fix (Automated)

Run this script from the repository root:

```bash
./fix-lead-graphql.sh
```

#### Quick Fix (Manual)

```bash
# 1. Set up environment
cd packages/twenty-server && cp .env.example .env && cd ../..

# 2. Build and initialize
npx nx build twenty-server
npx nx database:reset twenty-server --configuration=no-seed

# 3. Start server
npx nx start twenty-server
```

#### Verify It Works

Test at `http://localhost:3000/graphql`:

```graphql
query {
  __type(name: "Lead") {
    name
    fields { name }
  }
}
```

Should now return all Lead fields instead of null.

### Why This Happens

Twenty uses a metadata-driven architecture:
1. ✅ **Code Definition** - Workspace entities define schema (DONE in Phase 1)
2. ✅ **Metadata Builders** - Generate field definitions (DONE in Phase 1)
3. ⚠️  **Database Sync** - Creates tables and GraphQL schema (**REQUIRED**)

The Lead entities are fully coded but need step 3 to be executed.

### What You Get

After running the fix, you'll have 17 new entities with full CRUD operations:

**Lead Module (12 entities)**
- Lead, LeadBusinessDetail, Property
- CompanyParty, IndividualParty
- LeadNote, LeadDocument, ExistingLoan
- Vehicle, Machinery, Reference, Disbursement

**Catalog Module (5 entities)**
- CatalogProduct, CatalogStatus, CatalogFinancer
- CatalogLoanType, CatalogPropertyType

### More Help

- **Quick Start**: [LEAD_QUICK_START.md](LEAD_QUICK_START.md)
- **Full Guide**: [LEAD_GRAPHQL_FIX.md](LEAD_GRAPHQL_FIX.md)
- **Documentation**: [packages/twenty-server/src/modules/lead/README.md](packages/twenty-server/src/modules/lead/README.md)

### Prerequisites

- PostgreSQL 15+ on `localhost:5432`
- Redis on `localhost:6379`
- Node.js 18+ (see `.nvmrc`)
