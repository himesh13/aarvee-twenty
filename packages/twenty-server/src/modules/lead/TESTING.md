# Lead Management System - Testing Guide

## Overview
This guide explains how to test the Lead Management System implementation after the metadata integration is complete.

## Prerequisites
- Twenty development environment set up
- Dependencies installed (`yarn install`)
- Database running (PostgreSQL)

## Testing Steps

### 1. Database Reset and Schema Generation

Run the database reset command to generate the schema from metadata:

```bash
# This will:
# - Drop existing database schema
# - Regenerate schema from metadata
# - Apply all migrations
# - Seed standard objects
npx nx database:reset twenty-server
```

**Expected Result**: 
- Database tables created for all 17 Lead Management objects
- GraphQL schema generated with all types and resolvers
- No errors during migration

### 2. Verify GraphQL Schema

After the server starts, check that the GraphQL schema includes all Lead Management types:

```bash
# Start the server
npx nx start twenty-server

# In another terminal, query the GraphQL playground at http://localhost:3000/graphql
```

**Verify these types exist:**
- `Lead`
- `LeadBusinessDetail`
- `Property`
- `CompanyParty`
- `IndividualParty`
- `LeadNote`
- `LeadDocument`
- `ExistingLoan`
- `Vehicle`
- `Machinery`
- `Reference`
- `Disbursement`
- `CatalogProduct`
- `CatalogStatus`
- `CatalogFinancer`
- `CatalogLoanType`
- `CatalogPropertyType`

### 3. Test CRUD Operations

Test basic Create, Read, Update, Delete operations via GraphQL:

#### Create a Lead

```graphql
mutation CreateLead {
  createLead(
    data: {
      leadNo: "LD-202601-00001"
      customerName: "John Doe"
      contactNumber: {
        primaryPhoneCountryCode: "+1"
        primaryPhoneNumber: "5551234567"
      }
      loanAmount: 250000
      shortDescription: "Test lead for home loan"
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

#### Query Leads

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
        status
        assignedTo {
          id
          name {
            firstName
            lastName
          }
        }
      }
    }
  }
}
```

#### Update a Lead

```graphql
mutation UpdateLead {
  updateLead(
    id: "LEAD_ID_HERE"
    data: {
      status: "IN_PROGRESS"
      loanAmount: 275000
    }
  ) {
    id
    status
    loanAmount
  }
}
```

#### Delete a Lead

```graphql
mutation DeleteLead {
  deleteLead(id: "LEAD_ID_HERE") {
    id
  }
}
```

### 4. Test Relations

Verify that relations work correctly:

#### Test Lead Assignment

```graphql
mutation AssignLead {
  updateLead(
    id: "LEAD_ID_HERE"
    data: {
      assignedToId: "WORKSPACE_MEMBER_ID"
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
```

#### Test Lead with Attachments

```graphql
mutation CreateAttachment {
  createAttachment(
    data: {
      name: "Loan Application.pdf"
      fullPath: "/uploads/loan-app.pdf"
      fileCategory: "DOCUMENT"
      leadId: "LEAD_ID_HERE"
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
```

#### Test Lead with Tasks

```graphql
mutation CreateTaskForLead {
  createTaskTarget(
    data: {
      taskId: "TASK_ID_HERE"
      leadId: "LEAD_ID_HERE"
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
```

### 5. Verify Catalog Objects

Test that catalog objects are working:

```graphql
# Create product catalog
mutation CreateCatalogProduct {
  createCatalogProduct(
    data: {
      name: "Home Loan"
      isActive: true
    }
  ) {
    id
    name
    isActive
  }
}

# Query products
query GetCatalogProducts {
  catalogProducts {
    edges {
      node {
        id
        name
        isActive
      }
    }
  }
}
```

### 6. Test Complex Objects

Test more complex entities like LeadBusinessDetail and Property:

```graphql
mutation CreateLeadBusinessDetail {
  createLeadBusinessDetail(
    data: {
      leadId: "LEAD_ID_HERE"
      employmentType: "SALARIED"
      industry: "TECHNOLOGY"
      businessType: "PRIVATE_LIMITED"
      yearsInBusiness: 5
      monthlyNetSalary: 75000
    }
  ) {
    id
    employmentType
    industry
    lead {
      id
      customerName
    }
  }
}

mutation CreateProperty {
  createProperty(
    data: {
      leadId: "LEAD_ID_HERE"
      type: "RESIDENTIAL"
      isNewPurchase: true
      value: 5000000
      area: 1200
      areaUnit: "SQFT"
      address: "123 Main Street, City"
    }
  ) {
    id
    type
    value
    area
    lead {
      id
      customerName
    }
  }
}
```

### 7. Test Search Functionality

Verify that search is working on searchVector fields:

```graphql
query SearchLeads {
  leads(
    filter: {
      or: [
        { leadNo: { contains: "LD-202601" } }
        { customerName: { contains: "John" } }
        { shortDescription: { contains: "home loan" } }
      ]
    }
  ) {
    edges {
      node {
        id
        leadNo
        customerName
        shortDescription
      }
    }
  }
}
```

### 8. Verify Database Schema

Check the database directly to ensure tables are created correctly:

```bash
# Connect to PostgreSQL
psql -U postgres -d twenty

# List all tables
\dt metadata.*
\dt workspace_*

# Check Lead table structure
\d metadata."lead"

# Check for proper indexes
\di metadata.*
```

**Expected tables:**
- `metadata.lead`
- `metadata.leadBusinessDetail`
- `metadata.property`
- `metadata.companyParty`
- `metadata.individualParty`
- `metadata.leadNote`
- `metadata.leadDocument`
- `metadata.existingLoan`
- `metadata.vehicle`
- `metadata.machinery`
- `metadata.reference`
- `metadata.disbursement`
- `metadata.catalogProduct`
- `metadata.catalogStatus`
- `metadata.catalogFinancer`
- `metadata.catalogLoanType`
- `metadata.catalogPropertyType`

### 9. Test Field Types

Verify that different field types work correctly:

- **TEXT**: `customerName`, `shortDescription`
- **NUMBER**: `loanAmount`, `yearsInBusiness`
- **PHONES**: `contactNumber` (with country code)
- **POSITION**: `position` field for ordering
- **ACTOR**: `createdBy`, `updatedBy` (tracks who modified)
- **SEARCH_VECTOR**: Full-text search on lead fields

### 10. Common Issues and Troubleshooting

#### Schema Generation Fails

If schema generation fails:
1. Check for TypeScript compilation errors: `npx nx typecheck twenty-server`
2. Verify all imports are correct
3. Check that field IDs are unique
4. Ensure object IDs don't conflict

#### Relations Not Working

If relations don't work:
1. Verify foreign key constraints in database
2. Check that both sides of relation are defined
3. Ensure proper cascade delete settings

#### Search Not Working

If search doesn't work:
1. Verify `searchVector` field is present
2. Check `SEARCH_FIELDS_FOR_*` constants are exported
3. Ensure proper search vector triggers are created

## Success Criteria

The implementation is successful if:

✅ All 17 objects are created in the database  
✅ GraphQL schema includes all types and resolvers  
✅ Basic CRUD operations work for all objects  
✅ Relations between objects work correctly  
✅ Search functionality works on Lead fields  
✅ Catalog objects can be created and queried  
✅ Complex objects (LeadBusinessDetail, Property) work with relations  
✅ No TypeScript or runtime errors  

## Next Steps After Testing

Once basic testing is complete:

1. **Business Logic** (Phase 3):
   - Implement Lead number auto-generation
   - Add validation logic
   - Create custom resolvers
   - Add computed fields

2. **Frontend** (Phase 4):
   - Create Lead list and detail pages
   - Build multi-step forms
   - Add document upload UI
   - Implement reminder system

3. **Advanced Features**:
   - Export functionality
   - Bulk operations
   - Advanced search
   - Reporting and analytics
