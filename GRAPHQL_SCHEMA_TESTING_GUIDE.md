# GraphQL Schema Testing Guide - Phase 1 & Phase 2 Changes

This guide demonstrates how to test the GraphQL schema changes made during Phase 1 (Metadata Integration) and Phase 2 (Testing & Validation) of the Lead Management System implementation.

## Table of Contents
1. [Overview of Changes](#overview-of-changes)
2. [Prerequisites](#prerequisites)
3. [Testing Environment Setup](#testing-environment-setup)
4. [Schema Verification Methods](#schema-verification-methods)
5. [Testing CRUD Operations](#testing-crud-operations)
6. [Testing Relations](#testing-relations)
7. [Integration Test Examples](#integration-test-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview of Changes

### Phase 1 - Metadata Integration
The following entities were added to the Twenty metadata system:

**Lead Module (12 entities):**
1. `Lead` - Main lead entity with customer info and loan details
2. `LeadBusinessDetail` - Business/employment details
3. `Property` - Property collateral information
4. `CompanyParty` - Company applicants/guarantors
5. `IndividualParty` - Individual applicants/guarantors
6. `LeadNote` - Rich text notes for leads
7. `LeadDocument` - Document attachments
8. `ExistingLoan` - Existing loan information
9. `Vehicle` - Vehicle collateral
10. `Machinery` - Machinery collateral
11. `Reference` - Customer references
12. `Disbursement` - Loan disbursement tracking

**Catalog Module (5 entities):**
1. `CatalogProduct` - Product types (Home Loan, Auto Loan, etc.)
2. `CatalogStatus` - Lead statuses
3. `CatalogFinancer` - Financing institutions
4. `CatalogLoanType` - Loan types
5. `CatalogPropertyType` - Property types

**Relation Updates:**
- Added `lead` field to: `Attachment`, `Favorite`, `TaskTarget`, `NoteTarget`
- Added `targetLead` field to: `TimelineActivity`
- Added `assignedLeads` field to: `WorkspaceMember`

### Phase 2 - Testing & Validation
- Database schema generation
- GraphQL API exposure
- CRUD operations validation
- Relation testing

---

## Prerequisites

1. **Development Environment:**
   ```bash
   # Ensure you're in the repository root
   cd /home/runner/work/aarvee-twenty/aarvee-twenty
   
   # Install dependencies
   yarn install
   ```

2. **Database Services:**
   - PostgreSQL 16+ running on port 5432
   - Redis running on port 6379

3. **Environment Configuration:**
   ```bash
   # Copy environment files if not already done
   cp packages/twenty-server/.env.example packages/twenty-server/.env
   ```

---

## Testing Environment Setup

### Step 1: Reset Database and Generate Schema

This command will regenerate the database schema from the metadata system:

```bash
# Reset database - this will create all tables for Lead entities
npx nx database:reset twenty-server
```

**Expected Output:**
- ✅ Core database tables created
- ✅ Workspace schemas created
- ✅ All 17 Lead/Catalog tables created
- ✅ Relations established with existing Twenty entities

**Verify Tables Created:**
```bash
# Connect to PostgreSQL to verify tables
psql -U postgres -d default -c "\dt workspace_*.*"

# Expected tables in workspace schema:
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

### Step 2: Start the Server

```bash
# Start Twenty server
npx nx start twenty-server
```

The server will start on `http://localhost:3000` with GraphQL endpoint at `http://localhost:3000/graphql`

---

## Schema Verification Methods

### Method 1: GraphQL Introspection Query

Test that the GraphQL schema includes all Lead entities:

```bash
# Using curl
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ __schema { types { name } } }"
  }'
```

**Verify these types exist in the response:**
- `Lead`
- `LeadConnection`
- `LeadEdge`
- `LeadCreateInput`
- `LeadUpdateInput`
- `LeadBusinessDetail`
- `Property`
- `CompanyParty`
- `IndividualParty`
- And all other catalog entities...

### Method 2: GraphQL Playground

1. Open browser to `http://localhost:3000/graphql`
2. Use the built-in schema explorer (right panel, "Docs" tab)
3. Search for "Lead" to see all Lead-related types

### Method 3: Query Specific Type

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

**Expected fields in Lead type:**
- `id`
- `createdAt`
- `updatedAt`
- `deletedAt`
- `leadNo`
- `customerName`
- `contactNumber`
- `product`
- `loanAmount`
- `locationText`
- `locationLat`
- `locationLng`
- `referredBy`
- `shortDescription`
- `status`
- `position`
- `assignedTo`
- `assignedToId`
- `companyParties` (relation)
- `individualParties` (relation)
- `properties` (relation)
- `vehicles` (relation)
- `machineries` (relation)
- `existingLoans` (relation)
- `references` (relation)
- `disbursements` (relation)
- `leadNotes` (relation)
- `leadDocuments` (relation)
- `leadBusinessDetail` (relation)
- `taskTargets` (relation)
- `noteTargets` (relation)
- `favorites` (relation)
- `attachments` (relation)
- `timelineActivities` (relation)

---

## Testing CRUD Operations

### Prerequisites: Authentication

First, you need to authenticate and get an access token. Open the Twenty UI at `http://localhost:3000` and:

1. Click "Continue with Email"
2. Use the prefilled credentials
3. Get your access token from browser dev tools (look for Authorization header)

Or use the test token from the integration tests (available after running tests).

### Create Operations

#### 1. Create a Lead

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
      locationText: "123 Main St, San Francisco, CA"
      shortDescription: "Home loan application"
    }
  ) {
    id
    leadNo
    customerName
    contactNumber {
      primaryPhoneNumber
      primaryPhoneCountryCode
    }
    loanAmount
    locationText
    createdAt
  }
}
```

#### 2. Create Related Catalog Entities

```graphql
mutation CreateCatalogEntities {
  # Create Product
  createCatalogProduct(
    data: {
      name: "Home Loan"
      isActive: true
      position: 1
    }
  ) {
    id
    name
    isActive
  }
  
  # Create Status
  createCatalogStatus(
    data: {
      name: "New"
      isActive: true
      position: 1
    }
  ) {
    id
    name
    isActive
  }
}
```

#### 3. Create Child Entities

```graphql
mutation CreateLeadChildren {
  # Create Property for the Lead
  createProperty(
    data: {
      leadId: "YOUR_LEAD_ID_HERE"
      propertyType: "Residential"
      address: "123 Main St"
      city: "San Francisco"
      state: "CA"
      pincode: "94102"
      area: 1500
      marketValue: 500000
    }
  ) {
    id
    propertyType
    address
    marketValue
  }
  
  # Create Company Party
  createCompanyParty(
    data: {
      leadId: "YOUR_LEAD_ID_HERE"
      companyName: "Acme Corp"
      gstin: "27ABCDE1234F1Z5"
      role: "Applicant"
    }
  ) {
    id
    companyName
    gstin
    role
  }
}
```

### Read Operations

#### 1. Query All Leads

```graphql
query GetAllLeads {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        contactNumber {
          primaryPhoneNumber
          primaryPhoneCountryCode
        }
        loanAmount
        status
        product
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
```

#### 2. Query Single Lead with Relations

```graphql
query GetLeadWithRelations($leadId: ID!) {
  lead(filter: { id: { eq: $leadId } }) {
    id
    leadNo
    customerName
    loanAmount
    
    # Child entities
    properties {
      edges {
        node {
          id
          propertyType
          address
          marketValue
        }
      }
    }
    
    companyParties {
      edges {
        node {
          id
          companyName
          gstin
          role
        }
      }
    }
    
    individualParties {
      edges {
        node {
          id
          firstName
          lastName
          role
        }
      }
    }
    
    # Standard Twenty relations
    attachments {
      edges {
        node {
          id
          name
          fullPath
        }
      }
    }
    
    favorites {
      edges {
        node {
          id
          workspaceMemberId
        }
      }
    }
  }
}
```

#### 3. Filter and Search Leads

```graphql
query SearchLeads {
  leads(
    filter: {
      loanAmount: { gte: 100000 }
      customerName: { like: "%John%" }
    }
    orderBy: { createdAt: DescNullsLast }
    first: 10
  ) {
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

### Update Operations

```graphql
mutation UpdateLead($leadId: ID!) {
  updateLead(
    id: $leadId
    data: {
      customerName: "Jane Doe"
      loanAmount: 300000
      status: "In Progress"
    }
  ) {
    id
    customerName
    loanAmount
    status
    updatedAt
  }
}
```

### Delete Operations

```graphql
mutation DeleteLead($leadId: ID!) {
  # Soft delete (moves to deleted state)
  deleteLead(id: $leadId) {
    id
    deletedAt
  }
}

mutation RestoreLead($leadId: ID!) {
  # Restore from deleted state
  restoreLead(id: $leadId) {
    id
    deletedAt
  }
}

mutation DestroyLead($leadId: ID!) {
  # Permanent delete
  destroyLead(id: $leadId) {
    id
  }
}
```

---

## Testing Relations

### 1. Test Lead → Attachment Relation

```graphql
# Create attachment for lead
mutation CreateAttachmentForLead($leadId: ID!) {
  createAttachment(
    data: {
      name: "Loan Application.pdf"
      fullPath: "/uploads/loan-app.pdf"
      type: "Document"
      leadId: $leadId
    }
  ) {
    id
    name
    lead {
      id
      customerName
    }
  }
}

# Query lead with attachments
query LeadWithAttachments($leadId: ID!) {
  lead(filter: { id: { eq: $leadId } }) {
    id
    customerName
    attachments {
      edges {
        node {
          id
          name
          fullPath
        }
      }
    }
  }
}
```

### 2. Test Lead → Task Relation

```graphql
# First create a task
mutation CreateTask {
  createTask(
    data: {
      title: "Review loan documents"
      body: "Review all submitted documents"
      status: "TODO"
    }
  ) {
    id
    title
  }
}

# Create task target linking task to lead
mutation LinkTaskToLead($taskId: ID!, $leadId: ID!) {
  createTaskTarget(
    data: {
      taskId: $taskId
      leadId: $leadId
    }
  ) {
    id
    task {
      id
      title
    }
    lead {
      id
      customerName
    }
  }
}

# Query lead with tasks
query LeadWithTasks($leadId: ID!) {
  lead(filter: { id: { eq: $leadId } }) {
    id
    customerName
    taskTargets {
      edges {
        node {
          id
          task {
            id
            title
            status
          }
        }
      }
    }
  }
}
```

### 3. Test Lead → Note Relation

```graphql
# Create note
mutation CreateNote {
  createNote(
    data: {
      title: "Follow-up call"
      body: "Customer requested callback on Monday"
    }
  ) {
    id
    title
  }
}

# Link note to lead
mutation LinkNoteToLead($noteId: ID!, $leadId: ID!) {
  createNoteTarget(
    data: {
      noteId: $noteId
      leadId: $leadId
    }
  ) {
    id
    note {
      id
      title
    }
    lead {
      id
      customerName
    }
  }
}
```

### 4. Test Lead → Timeline Activity Relation

```graphql
query LeadTimelineActivities($leadId: ID!) {
  timelineActivities(
    filter: {
      targetLeadId: { eq: $leadId }
    }
    orderBy: { happensAt: DescNullsLast }
  ) {
    edges {
      node {
        id
        name
        happensAt
        targetLead {
          id
          customerName
        }
      }
    }
  }
}
```

### 5. Test WorkspaceMember → Lead Assignment

```graphql
# Assign lead to workspace member
mutation AssignLead($leadId: ID!, $memberId: ID!) {
  updateLead(
    id: $leadId
    data: {
      assignedToId: $memberId
    }
  ) {
    id
    assignedTo {
      id
      name {
        firstName
        lastName
      }
    }
  }
}

# Query member's assigned leads
query MemberAssignedLeads($memberId: ID!) {
  workspaceMember(filter: { id: { eq: $memberId } }) {
    id
    name {
      firstName
      lastName
    }
    assignedLeads {
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
}
```

---

## Integration Test Examples

Twenty uses integration tests to verify GraphQL operations. Here's how to create tests for Lead entities following the repository patterns.

### Test File Location

Create test file at:
```
packages/twenty-server/test/integration/graphql/suites/object-generated/leads.integration-spec.ts
```

### Sample Integration Test

```typescript
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

// Define fields to query
const LEAD_GQL_FIELDS = `
  id
  leadNo
  customerName
  contactNumber {
    primaryPhoneNumber
    primaryPhoneCountryCode
  }
  loanAmount
  locationText
  shortDescription
  createdAt
  updatedAt
`;

describe('leads resolvers (integration)', () => {
  let createdLeadId: string;

  beforeAll(async () => {
    // Clean up before tests
    await deleteAllRecords('lead');
  });

  it('should create a lead', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
      data: [
        {
          leadNo: 'LD-202601-00001',
          customerName: 'John Doe',
          contactNumber: {
            primaryPhoneCountryCode: '+1',
            primaryPhoneNumber: '5551234567',
            primaryPhoneCallingCode: '+1',
          },
          loanAmount: 250000,
          locationText: 'San Francisco, CA',
          shortDescription: 'Home loan application',
        },
      ],
      upsert: false,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createLeads).toHaveLength(1);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createLeads[0].leadNo).toEqual('LD-202601-00001');
    expect(response.body.data.createLeads[0].customerName).toEqual('John Doe');
    
    createdLeadId = response.body.data.createLeads[0].id;
  });

  it('should find the created lead', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'lead',
      gqlFields: LEAD_GQL_FIELDS,
      filter: {
        id: {
          eq: createdLeadId,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.lead).toBeDefined();
    expect(response.body.data.lead.id).toEqual(createdLeadId);
    expect(response.body.data.lead.customerName).toEqual('John Doe');
    expect(response.body.errors).toBeUndefined();
  });

  it('should query all leads', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.leads.edges.length).toBeGreaterThan(0);
    expect(response.body.errors).toBeUndefined();
  });

  it('should update a lead', async () => {
    const updateOperation = {
      query: gql`
        mutation UpdateLead($id: ID!, $data: LeadUpdateInput!) {
          updateLead(id: $id, data: $data) {
            ${LEAD_GQL_FIELDS}
          }
        }
      `,
      variables: {
        id: createdLeadId,
        data: {
          customerName: 'Jane Doe',
          loanAmount: 300000,
        },
      },
    };

    const response = await makeGraphqlAPIRequest(updateOperation);

    expect(response.body.data.updateLead.customerName).toEqual('Jane Doe');
    expect(response.body.data.updateLead.loanAmount).toEqual(300000);
    expect(response.body.errors).toBeUndefined();
  });

  it('should filter leads by loan amount', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
      filter: {
        loanAmount: {
          gte: 250000,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.leads.edges.length).toBeGreaterThan(0);
    response.body.data.leads.edges.forEach((edge: any) => {
      expect(edge.node.loanAmount).toBeGreaterThanOrEqual(250000);
    });
    expect(response.body.errors).toBeUndefined();
  });

  it('should delete a lead', async () => {
    const deleteOperation = {
      query: gql`
        mutation DeleteLead($id: ID!) {
          deleteLead(id: $id) {
            id
            deletedAt
          }
        }
      `,
      variables: {
        id: createdLeadId,
      },
    };

    const response = await makeGraphqlAPIRequest(deleteOperation);

    expect(response.body.data.deleteLead.id).toEqual(createdLeadId);
    expect(response.body.data.deleteLead.deletedAt).toBeDefined();
    expect(response.body.errors).toBeUndefined();
  });
});
```

### Test Catalog Entities

```typescript
describe('catalog entities (integration)', () => {
  const CATALOG_GQL_FIELDS = `
    id
    name
    isActive
    position
  `;

  beforeAll(async () => {
    await deleteAllRecords('catalogProduct');
    await deleteAllRecords('catalogStatus');
  });

  it('should create catalog products', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'catalogProduct',
      objectMetadataPluralName: 'catalogProducts',
      gqlFields: CATALOG_GQL_FIELDS,
      data: [
        { name: 'Home Loan', isActive: true, position: 1 },
        { name: 'Auto Loan', isActive: true, position: 2 },
        { name: 'Personal Loan', isActive: true, position: 3 },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCatalogProducts).toHaveLength(3);
    expect(response.body.errors).toBeUndefined();
  });

  it('should create catalog statuses', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'catalogStatus',
      objectMetadataPluralName: 'catalogStatuses',
      gqlFields: CATALOG_GQL_FIELDS,
      data: [
        { name: 'New', isActive: true, position: 1 },
        { name: 'In Progress', isActive: true, position: 2 },
        { name: 'Approved', isActive: true, position: 3 },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCatalogStatuses).toHaveLength(3);
    expect(response.body.errors).toBeUndefined();
  });
});
```

### Test Relations

```typescript
describe('lead relations (integration)', () => {
  let leadId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Create a lead first
    const leadOperation = createManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
      data: [
        {
          leadNo: 'LD-202601-00100',
          customerName: 'Test Customer',
          contactNumber: {
            primaryPhoneCountryCode: '+1',
            primaryPhoneNumber: '5559999999',
            primaryPhoneCallingCode: '+1',
          },
        },
      ],
    });

    const leadResponse = await makeGraphqlAPIRequest(leadOperation);
    leadId = leadResponse.body.data.createLeads[0].id;
  });

  it('should create property linked to lead', async () => {
    const PROPERTY_GQL_FIELDS = `
      id
      propertyType
      address
      city
      marketValue
      lead {
        id
        customerName
      }
    `;

    const propertyOperation = createManyOperationFactory({
      objectMetadataSingularName: 'property',
      objectMetadataPluralName: 'properties',
      gqlFields: PROPERTY_GQL_FIELDS,
      data: [
        {
          leadId: leadId,
          propertyType: 'Residential',
          address: '123 Test St',
          city: 'Test City',
          marketValue: 500000,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(propertyOperation);

    expect(response.body.data.createProperties).toHaveLength(1);
    expect(response.body.data.createProperties[0].lead.id).toEqual(leadId);
    expect(response.body.errors).toBeUndefined();
    
    propertyId = response.body.data.createProperties[0].id;
  });

  it('should query lead with properties', async () => {
    const graphqlOperation = {
      query: gql`
        query GetLeadWithProperties($filter: LeadFilterInput!) {
          lead(filter: $filter) {
            id
            customerName
            properties {
              edges {
                node {
                  id
                  propertyType
                  address
                  marketValue
                }
              }
            }
          }
        }
      `,
      variables: {
        filter: {
          id: { eq: leadId },
        },
      },
    };

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.lead.properties.edges.length).toBeGreaterThan(0);
    expect(response.body.data.lead.properties.edges[0].node.id).toEqual(propertyId);
    expect(response.body.errors).toBeUndefined();
  });
});
```

### Running Integration Tests

```bash
# Run all integration tests
npx nx test:integration:with-db-reset twenty-server

# Run specific test suite
npx nx test:integration twenty-server --testPathPattern=leads.integration-spec

# Run with database reset (recommended for clean slate)
npx nx run twenty-server:test:integration:with-db-reset --testPathPattern=leads
```

---

## Troubleshooting

### Issue: Tables Not Created

**Symptom:** Database reset completes but Lead tables are missing

**Solution:**
1. Check that metadata builders are registered:
   ```bash
   # Verify in code
   grep -r "computeLeadStandardFlatFieldMetadata" packages/twenty-server/src/engine/workspace-manager/
   ```

2. Check for UUID format errors in metadata:
   ```bash
   # Run database reset with verbose logging
   DEBUG=* npx nx database:reset twenty-server
   ```

3. Verify standard object IDs are valid UUIDs:
   ```bash
   # Check standard-object-ids.ts
   cat packages/twenty-shared/src/metadata/standard-object-ids.ts | grep -A1 "lead:"
   ```

### Issue: GraphQL Types Not Generated

**Symptom:** Lead types don't appear in GraphQL schema

**Solution:**
1. Restart the server after database reset:
   ```bash
   # Stop the server
   # Run database reset
   npx nx database:reset twenty-server
   # Start the server fresh
   npx nx start twenty-server
   ```

2. Check for TypeScript compilation errors:
   ```bash
   npx nx typecheck twenty-server
   ```

3. Verify metadata is registered in `standard-object.constant.ts`:
   ```bash
   grep -A 5 "lead:" packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant.ts
   ```

### Issue: Relation Fields Not Working

**Symptom:** Cannot query relations like `lead.properties` or `lead.attachments`

**Solution:**
1. Verify foreign key relationships in database:
   ```sql
   -- Connect to database
   psql -U postgres -d default
   
   -- Check foreign keys on property table
   SELECT constraint_name, table_name, column_name 
   FROM information_schema.key_column_usage 
   WHERE table_schema = 'workspace_[YOUR_WORKSPACE_ID]' 
   AND table_name = 'property';
   ```

2. Check that relation metadata includes `inverseSideFieldKey`:
   ```bash
   # View lead entity file
   cat packages/twenty-server/src/modules/lead/standard-objects/lead.workspace-entity.ts
   ```

3. Verify relation field IDs are defined:
   ```bash
   grep "properties:" packages/twenty-server/src/engine/workspace-manager/workspace-migration/constant/standard-field-ids.ts
   ```

### Issue: Authentication Errors

**Symptom:** GraphQL queries return 401 Unauthorized

**Solution:**
1. Get a valid access token:
   - Open Twenty UI at `http://localhost:3000`
   - Login with test credentials
   - Open browser DevTools → Network tab
   - Look for Authorization header in any GraphQL request
   - Copy the Bearer token

2. Use token in tests:
   ```typescript
   const response = await makeGraphqlAPIRequest(
     graphqlOperation,
     'YOUR_ACCESS_TOKEN_HERE'
   );
   ```

3. For integration tests, use the pre-defined test token:
   ```typescript
   import { APPLE_JANE_ADMIN_ACCESS_TOKEN } from 'test/integration/constants/test-tokens.json';
   ```

### Issue: Validation Errors on Create

**Symptom:** "Field validation failed" errors when creating entities

**Solution:**
1. Check required fields match entity definition:
   ```bash
   # View entity to see required fields
   cat packages/twenty-server/src/modules/lead/standard-objects/lead.workspace-entity.ts
   ```

2. Ensure composite fields have all required sub-fields:
   ```graphql
   # PHONES field requires all three properties
   contactNumber: {
     primaryPhoneCountryCode: "+1"
     primaryPhoneNumber: "5551234567"
     primaryPhoneCallingCode: "+1"
   }
   ```

3. Check field metadata for default values and constraints:
   ```bash
   cat packages/twenty-server/src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/compute-lead-standard-flat-field-metadata.util.ts
   ```

---

## Summary

This guide covered:

✅ **Schema Verification** - How to verify all 17 Lead entities are in GraphQL schema  
✅ **CRUD Operations** - Examples for Create, Read, Update, Delete operations  
✅ **Relation Testing** - How to test all relation fields (child entities and Twenty integrations)  
✅ **Integration Tests** - Following Twenty's testing patterns  
✅ **Troubleshooting** - Common issues and solutions

For more details on specific entities, see:
- [PHASE_1_2_TEST_REPORT.md](./PHASE_1_2_TEST_REPORT.md) - Test execution results
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Implementation progress
- [packages/twenty-server/src/modules/lead/TESTING.md](./packages/twenty-server/src/modules/lead/TESTING.md) - Module-specific testing guide

---

## Next Steps

1. **Run the tests** documented in this guide
2. **Create integration tests** for your Lead entities following the examples
3. **Document results** and any issues encountered
4. **Extend testing** to cover edge cases and business logic
