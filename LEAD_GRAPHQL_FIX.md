# Lead GraphQL Schema Fix Guide

## Problem Description

The GraphQL queries for Lead entities are failing with the following errors:

```graphql
query IntrospectLeadType {
  __type(name: "Lead") {
    name
    fields {
      name
    }
  }
}
```

Returns:
```json
{
  "data": {
    "__type": null
  }
}
```

And `createLead` mutation returns:
```
"Cannot query field \"createLead\" on type \"Mutation\". Did you mean \"createFile\"?"
```

## Root Cause

The Lead Management System has been fully implemented at the **code level** (Phase 1 complete):
- ✅ All 17 workspace entities defined
- ✅ All field metadata builders created
- ✅ All standard object constants registered
- ✅ TypeScript compilation passes

However, the **database metadata has not been synchronized** to:
- Create the actual database tables
- Generate the GraphQL schema
- Expose the CRUD operations

## Solution

The database needs to be initialized/reset to sync the metadata and create the Lead tables. Follow these steps:

### Prerequisites

Ensure you have:
1. PostgreSQL running on `localhost:5432`
2. Redis running on `localhost:6379`
3. Node.js and Yarn installed
4. Dependencies installed: `yarn install`

### Step 1: Set Up Environment

```bash
# Copy the example .env file
cd packages/twenty-server
cp .env.example .env

# Verify database connection settings in .env
# Default values should work if you have PostgreSQL and Redis running locally:
# PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
# REDIS_URL=redis://localhost:6379
```

### Step 2: Build the Server

```bash
# From the repository root
npx nx build twenty-server
```

### Step 3: Reset and Initialize Database

```bash
# This will:
# 1. Truncate existing database
# 2. Set up the database schema
# 3. Run migrations
# 4. Flush cache
# 5. Seed development data (optional)

# Without seed data:
npx nx database:reset twenty-server --configuration=no-seed

# OR with seed data:
npx nx database:reset twenty-server --configuration=seed
```

### Step 4: Verify the Fix

Start the development server:

```bash
npx nx start twenty-server
```

Wait for the server to start (you should see "Application is running" message), then test the GraphQL endpoint at `http://localhost:3000/graphql`.

#### Test 1: Introspect Lead Type

```graphql
query IntrospectLeadType {
  __type(name: "Lead") {
    name
    kind
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

Expected: Should return the Lead type with all its fields.

#### Test 2: Create a Lead

```graphql
mutation CreateLead {
  createLeads(data: [{
    leadNo: "LD-202601-00001"
    customerName: "Test Customer"
    contactNumber: {
      primaryPhoneCountryCode: "+1"
      primaryPhoneNumber: "5551234567"
      primaryPhoneCallingCode: "+1"
    }
    loanAmount: 250000
  }]) {
    id
    leadNo
    customerName
    loanAmount
  }
}
```

Expected: Should successfully create a lead and return its data.

#### Test 3: Query Leads

```graphql
query GetLeads {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        loanAmount
        status
        createdAt
      }
    }
  }
}
```

Expected: Should return a list of leads (including the one you just created).

### Step 5: Run Integration Tests

To ensure everything works correctly:

```bash
# Run integration tests with database reset
npx nx run twenty-server:test:integration:with-db-reset
```

## What Gets Created

After running `database:reset`, the following tables will be created in the `metadata` schema:

**Lead Module (12 tables):**
1. `metadata.lead` - Main lead table
2. `metadata.leadBusinessDetail` - Business/employment details
3. `metadata.property` - Property information
4. `metadata.companyParty` - Company parties (applicants, guarantors)
5. `metadata.individualParty` - Individual parties
6. `metadata.leadNote` - Notes attached to leads
7. `metadata.leadDocument` - Document uploads
8. `metadata.existingLoan` - Existing customer loans
9. `metadata.vehicle` - Vehicle information
10. `metadata.machinery` - Machinery information
11. `metadata.reference` - Customer references
12. `metadata.disbursement` - Disbursement details

**Catalog Module (5 tables):**
1. `metadata.catalogProduct` - Product types lookup
2. `metadata.catalogStatus` - Status lookup
3. `metadata.catalogFinancer` - Financer lookup
4. `metadata.catalogLoanType` - Loan type lookup
5. `metadata.catalogPropertyType` - Property type lookup

**GraphQL Operations Available:**

Each entity will have the following operations auto-generated:
- `createXxx` / `createXxxs` - Create one or many
- `updateXxx` - Update by ID
- `deleteXxx` - Soft delete by ID
- `restoreXxx` - Restore soft-deleted
- `xxx` - Get one by filter
- `xxxs` - Get many with pagination

For example, for Lead:
- `createLead` / `createLeads`
- `updateLead`
- `deleteLead`
- `restoreLead`
- `lead(filter: LeadFilterInput!)`
- `leads(filter: LeadFilterInput, orderBy: LeadOrderByInput, after: String, first: Int)`

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. Check you can connect:
   ```bash
   psql -h localhost -p 5432 -U postgres
   ```

3. Verify the `default` database exists:
   ```sql
   \l default
   ```

### Redis Connection Issues

If you get Redis connection errors:

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

2. Check Redis is accessible:
   ```bash
   redis-cli -h localhost -p 6379 info server
   ```

### Build Errors

If the build fails:

1. Clean the build cache:
   ```bash
   npx nx reset
   rm -rf dist
   ```

2. Reinstall dependencies:
   ```bash
   yarn install
   ```

3. Try building again:
   ```bash
   npx nx build twenty-server
   ```

### GraphQL Schema Not Updated

If Lead types still don't appear after database reset:

1. Clear the cache:
   ```bash
   npx nx command-no-deps twenty-server cache:flush
   ```

2. Restart the server:
   ```bash
   # Stop the current server (Ctrl+C)
   npx nx start twenty-server
   ```

3. Hard refresh your GraphQL playground (Ctrl+Shift+R or Cmd+Shift+R)

## Additional Resources

- [Lead Module README](packages/twenty-server/src/modules/lead/README.md) - Complete documentation
- [Lead Module Testing Guide](packages/twenty-server/src/modules/lead/TESTING.md) - Comprehensive testing guide
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current implementation status
- [Twenty Documentation](https://twenty.com/developers) - Twenty development docs

## Quick Reference

```bash
# Complete reset and initialization (recommended)
npx nx build twenty-server && \
npx nx database:reset twenty-server --configuration=no-seed && \
npx nx start twenty-server

# OR with seed data
npx nx build twenty-server && \
npx nx database:reset twenty-server --configuration=seed && \
npx nx start twenty-server

# Run integration tests to verify
npx nx run twenty-server:test:integration:with-db-reset
```

## Support

If you continue to experience issues after following this guide:

1. Check the [Implementation Status](IMPLEMENTATION_STATUS.md) for known issues
2. Review the server logs for error messages
3. Check that all dependencies are correctly installed
4. Ensure PostgreSQL and Redis versions are compatible
5. Verify your Node.js version matches the requirements in `.nvmrc`
