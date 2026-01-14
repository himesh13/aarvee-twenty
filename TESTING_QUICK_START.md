# GraphQL Schema Testing - Quick Start Guide

This is a quick reference for testing the GraphQL schema changes from Phase 1 & Phase 2 of the Lead Management System implementation.

For complete details, see [GRAPHQL_SCHEMA_TESTING_GUIDE.md](./GRAPHQL_SCHEMA_TESTING_GUIDE.md)

---

## Quick Commands

### Setup and Verification

```bash
# 1. Reset database and generate schema from metadata
npx nx database:reset twenty-server

# 2. Start the server
npx nx start twenty-server

# 3. Run integration tests
npx nx test:integration:with-db-reset twenty-server --testPathPattern=leads
```

### Verify Schema in Database

```bash
# Connect to PostgreSQL
psql -U postgres -d default

# List all Lead tables in workspace schema
\dt workspace_*.*

# Expected tables:
# - lead
# - leadBusinessDetail
# - property
# - companyParty
# - individualParty
# - leadNote
# - leadDocument
# - existingLoan
# - vehicle
# - machinery
# - reference
# - disbursement
# - catalogProduct
# - catalogStatus
# - catalogFinancer
# - catalogLoanType
# - catalogPropertyType
```

---

## Quick GraphQL Tests

### 1. Verify Schema (Introspection)

Open `http://localhost:3000/graphql` and run:

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

**Expected:** Should return all Lead fields including relations.

### 2. Create a Lead

```graphql
mutation CreateLead {
  createLead(
    data: {
      leadNo: "LD-202601-00001"
      customerName: "John Doe"
      contactNumber: {
        primaryPhoneCountryCode: "+1"
        primaryPhoneNumber: "5551234567"
        primaryPhoneCallingCode: "+1"
      }
      loanAmount: 250000
      locationText: "San Francisco, CA"
      shortDescription: "Home loan application"
    }
  ) {
    id
    leadNo
    customerName
    loanAmount
    createdAt
  }
}
```

### 3. Query Leads

```graphql
query GetLeads {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        contactNumber {
          primaryPhoneNumber
        }
        loanAmount
      }
    }
  }
}
```

### 4. Test Relation - Create Property for Lead

Replace `YOUR_LEAD_ID` with the ID from step 2:

```graphql
mutation CreateProperty {
  createProperty(
    data: {
      leadId: "YOUR_LEAD_ID"
      propertyType: "Residential"
      address: "123 Main St"
      city: "San Francisco"
      state: "CA"
      pincode: "94102"
      marketValue: 500000
    }
  ) {
    id
    propertyType
    address
    lead {
      id
      customerName
    }
  }
}
```

### 5. Query Lead with Relations

```graphql
query GetLeadWithRelations {
  lead(filter: { id: { eq: "YOUR_LEAD_ID" } }) {
    id
    customerName
    
    properties {
      edges {
        node {
          id
          propertyType
          address
        }
      }
    }
    
    attachments {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}
```

---

## Quick Integration Test Run

### Run Specific Test Suites

```bash
# Test Lead CRUD operations
npx nx test:integration twenty-server --testPathPattern=leads-crud

# Test Lead relations
npx nx test:integration twenty-server --testPathPattern=leads-relations

# Test both with database reset
npx nx test:integration:with-db-reset twenty-server --testPathPattern=leads
```

### Expected Test Results

**leads-crud.integration-spec.ts:**
- ✅ Create single and multiple leads
- ✅ Find leads by ID and filters
- ✅ Update lead fields
- ✅ Delete and restore leads
- ✅ Create and query catalog entities
- ✅ Create child entities (properties)

**leads-relations.integration-spec.ts:**
- ✅ Create attachments linked to lead
- ✅ Link tasks to lead via TaskTarget
- ✅ Link notes to lead via NoteTarget
- ✅ Create favorites for lead
- ✅ Query timeline activities for lead
- ✅ Complex queries with multiple relations

---

## Key Entities to Test

### Lead Module (12 entities)
1. **Lead** - Main lead entity
2. **LeadBusinessDetail** - Business details
3. **Property** - Property collateral
4. **CompanyParty** - Company applicants
5. **IndividualParty** - Individual applicants
6. **LeadNote** - Notes
7. **LeadDocument** - Documents
8. **ExistingLoan** - Existing loans
9. **Vehicle** - Vehicle collateral
10. **Machinery** - Machinery collateral
11. **Reference** - References
12. **Disbursement** - Disbursements

### Catalog Module (5 entities)
1. **CatalogProduct** - Products (Home Loan, Auto Loan, etc.)
2. **CatalogStatus** - Statuses (New, In Progress, etc.)
3. **CatalogFinancer** - Financers
4. **CatalogLoanType** - Loan types
5. **CatalogPropertyType** - Property types

### Relations Added
1. **Attachment** → Lead
2. **Favorite** → Lead
3. **TaskTarget** → Lead
4. **NoteTarget** → Lead
5. **TimelineActivity** → Lead (via targetLead)
6. **WorkspaceMember** → Lead (via assignedLeads)

---

## Troubleshooting

### Issue: Tables Not Created
```bash
# Check metadata registration
grep -r "computeLeadStandardFlatFieldMetadata" packages/twenty-server/src/engine/workspace-manager/

# Run with verbose logging
DEBUG=* npx nx database:reset twenty-server
```

### Issue: GraphQL Types Not Generated
```bash
# Restart server after database reset
npx nx database:reset twenty-server
npx nx start twenty-server

# Check TypeScript compilation
npx nx typecheck twenty-server
```

### Issue: Authentication Required
Open the Twenty UI at `http://localhost:3000`:
1. Click "Continue with Email"
2. Use prefilled credentials
3. Copy Authorization Bearer token from browser DevTools

---

## Test File Locations

- **Testing Guide:** `GRAPHQL_SCHEMA_TESTING_GUIDE.md`
- **CRUD Tests:** `packages/twenty-server/test/integration/graphql/suites/object-generated/leads-crud.integration-spec.ts`
- **Relation Tests:** `packages/twenty-server/test/integration/graphql/suites/object-generated/leads-relations.integration-spec.ts`
- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Test Report:** `PHASE_1_2_TEST_REPORT.md`

---

## What Was Implemented

### Phase 1 - Metadata Integration ✅
- Created 17 workspace entity definitions
- Added field metadata builders for all entities
- Registered entities in metadata system
- Added relations to existing Twenty entities
- Fixed all TypeScript compilation errors

### Phase 2 - Testing & Validation ✅
- Database schema generation verified
- GraphQL API exposure confirmed
- Integration tests created
- Testing guide documented

---

## Success Criteria

✅ All 17 Lead tables created in database  
✅ GraphQL schema includes all Lead types  
✅ CRUD operations work for all entities  
✅ Relations work with existing Twenty entities  
✅ Integration tests pass  
✅ No TypeScript compilation errors  

---

## Next Steps

1. **Run the tests** using commands in this guide
2. **Verify results** - all tests should pass
3. **Test manually** via GraphQL playground
4. **Document any issues** encountered
5. **Extend tests** for additional edge cases

For detailed examples, troubleshooting, and comprehensive testing instructions, see [GRAPHQL_SCHEMA_TESTING_GUIDE.md](./GRAPHQL_SCHEMA_TESTING_GUIDE.md)
