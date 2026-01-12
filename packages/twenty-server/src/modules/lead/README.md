# Lead Management System

A comprehensive Lead Management System built for Twenty CRM, designed for loan origination workflows.

## Overview

This module provides a complete solution for managing leads in a loan origination context, with support for:
- Lead tracking with auto-generated lead numbers
- Business and employment details
- Property, vehicle, and machinery information
- Company and individual parties (applicants, co-applicants, guarantors)
- Document management with categories
- References and disbursement tracking
- Catalog-driven lookups for consistent data

## Architecture

The Lead Management System follows Twenty's metadata-driven architecture:

1. **Workspace Entities** - Define TypeScript schema and database structure
2. **Field Metadata Builders** - Generate GraphQL schema and resolvers
3. **Standard Objects** - Register objects for auto-discovery
4. **Services** - Implement business logic and custom behaviors

## Entities

### Lead Module (12 entities)

1. **Lead** (`lead.workspace-entity.ts`)
   - Core lead entity with customer info, loan details, location
   - Fields: leadNo, customerName, contactNumber, product, loanAmount, status, etc.
   - Relations: assignedTo, taskTargets, noteTargets, favorites, attachments, timelineActivities

2. **LeadBusinessDetail** (`lead-business-detail.workspace-entity.ts`)
   - Employment and business details
   - Fields: employmentType, industry, businessType, yearsInBusiness, monthlyNetSalary, etc.

3. **Property** (`property.workspace-entity.ts`)
   - Property information for property-related loans
   - Fields: type, isNewPurchase, value, area, address, etc.

4. **CompanyParty** (`company-party.workspace-entity.ts`)
   - Company applicants/co-applicants/guarantors
   - Fields: role, name, pan, regNo, contactNumbers, addresses, etc.

5. **IndividualParty** (`individual-party.workspace-entity.ts`)
   - Individual parties with personal details
   - Fields: role, name, dob, pan, aadhar, addresses, education, etc.

6. **LeadNote** (`lead-note.workspace-entity.ts`)
   - Notes attached to leads with rich text support

7. **LeadDocument** (`lead-document.workspace-entity.ts`)
   - Document uploads with categories (sanction letter, SOA, etc.)

8. **ExistingLoan** (`existing-loan.workspace-entity.ts`)
   - Tracks existing loans for the customer

9. **Vehicle** (`vehicle.workspace-entity.ts`)
   - Vehicle information for auto loans

10. **Machinery** (`machinery.workspace-entity.ts`)
    - Machinery information for equipment loans

11. **Reference** (`reference.workspace-entity.ts`)
    - Customer references

12. **Disbursement** (`disbursement.workspace-entity.ts`)
    - Loan disbursement details with ROI, EMI, fees

### Catalog Module (5 entities)

Lookup tables for consistent data:

1. **CatalogProduct** - Product types (Home Loan, Auto Loan, etc.)
2. **CatalogStatus** - Lead statuses (New, In Progress, Approved, etc.)
3. **CatalogFinancer** - Financing institutions
4. **CatalogLoanType** - Loan types
5. **CatalogPropertyType** - Property types

## Services

### LeadNumberGeneratorService

Generates unique Lead numbers in the format: **LD-YYYYMM-#####**

**Features:**
- Auto-sequential numbering within each month
- Format validation and parsing
- Uniqueness checking with retry logic
- Thread-safe with race condition handling

**Example Usage:**
```typescript
import { LeadNumberGeneratorService } from './services/lead-number-generator.service';

// Generate a new lead number
const leadNo = await leadNumberGenerator.generateLeadNumber(workspaceId);
// Returns: "LD-202601-00001"

// Validate format
const isValid = leadNumberGenerator.validateLeadNumberFormat('LD-202601-00001');
// Returns: true

// Parse lead number
const parsed = leadNumberGenerator.parseLeadNumber('LD-202601-00123');
// Returns: { prefix: 'LD', year: 2026, month: 1, sequence: 123 }

// Generate with uniqueness guarantee
const uniqueLeadNo = await leadNumberGenerator.generateUniqueLeadNumber(workspaceId);
```

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing guide including:
- Database reset and schema generation
- GraphQL query examples for all entities
- CRUD operation tests
- Relation testing
- Search functionality
- Troubleshooting

### Running Tests

```bash
# Unit tests
npx nx test twenty-server

# Integration tests (with database reset)
npx nx run twenty-server:test:integration:with-db-reset

# Specific test file
npx nx test twenty-server --testFile=lead-number-generator.service.spec.ts
```

## GraphQL API

Once the database is initialized, the following operations are automatically available:

### Queries

```graphql
# Get all leads
query {
  leads {
    edges {
      node {
        id
        leadNo
        customerName
        loanAmount
        status
      }
    }
  }
}

# Get a specific lead
query {
  lead(id: "LEAD_ID") {
    id
    leadNo
    customerName
    assignedTo {
      name {
        firstName
        lastName
      }
    }
  }
}
```

### Mutations

```graphql
# Create a lead
mutation {
  createLead(data: {
    leadNo: "LD-202601-00001"
    customerName: "John Doe"
    contactNumber: {
      primaryPhoneCountryCode: "+1"
      primaryPhoneNumber: "5551234567"
    }
    loanAmount: 250000
  }) {
    id
    leadNo
  }
}

# Update a lead
mutation {
  updateLead(id: "LEAD_ID", data: {
    status: "IN_PROGRESS"
    loanAmount: 275000
  }) {
    id
    status
  }
}

# Delete a lead
mutation {
  deleteLead(id: "LEAD_ID") {
    id
  }
}
```

## Database Schema

The metadata system automatically generates the following tables:

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

## Integration with Twenty

The Lead Management System integrates seamlessly with Twenty's existing features:

- **Attachments**: Upload documents to leads
- **Tasks**: Create tasks linked to leads
- **Notes**: Add notes to leads
- **Favorites**: Mark leads as favorites
- **Timeline**: Track activity history on leads
- **Assignments**: Assign leads to workspace members
- **Search**: Full-text search across lead fields

## Development

### Adding New Fields

1. Update the workspace entity
2. Add field ID to `standard-field-ids.ts`
3. Update the field metadata builder
4. Run database reset to apply changes

### Adding Business Logic

1. Create a new service in `services/`
2. Implement the logic
3. Add unit tests in `services/__tests__/`
4. Export from `lead.module.ts`

### Custom Resolvers

Create custom resolvers for complex operations:
- Lead duplication
- Bulk operations
- Custom validations
- Computed fields

## Future Enhancements

Planned features for future releases:

- **Validation Logic**: Field-level and cross-field validation
- **Computed Fields**: Auto-calculate remaining tenure, EMI, etc.
- **Custom Mutations**: Duplicate, restore, share, export
- **Reminder System**: Birthday and loan top-up reminders
- **File Upload Integration**: Direct upload to storage
- **Audit Logging**: Track all changes to leads
- **Advanced Search**: Filters by date range, amount range, etc.
- **Reporting**: Lead funnel, conversion rates, etc.

## Documentation

- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Implementation status and design decisions
- [TESTING.md](./TESTING.md) - Comprehensive testing guide
- [Twenty Docs](https://twenty.com/developers) - Twenty development documentation

## Contributing

When contributing to the Lead Management System:

1. Follow Twenty's coding standards
2. Add tests for new functionality
3. Update documentation
4. Run linting and type checks
5. Test with `database:reset` before committing

## License

This module follows the same license as Twenty CRM.
