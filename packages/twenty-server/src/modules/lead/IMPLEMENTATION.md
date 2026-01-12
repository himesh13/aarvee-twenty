# Lead Management System Implementation

This document outlines the implementation plan for the comprehensive Lead Management System for Twenty CRM.

## Implementation Status

### Phase 1: Workspace Entities Created ✓
Core workspace entities have been created for the priority objects:

**Lead Module** (`packages/twenty-server/src/modules/lead/standard-objects/`):
- ✅ `lead.workspace-entity.ts` - Core lead entity with customer info, loan details, location
- ✅ `lead-business-detail.workspace-entity.ts` - Business details (employment, industry, ownership)
- ✅ `property.workspace-entity.ts` - Property information for property-related loans
- ✅ `company-party.workspace-entity.ts` - Company applicants/co-applicants/guarantors
- ✅ `individual-party.workspace-entity.ts` - Individual parties
- ✅ `lead-note.workspace-entity.ts` - Notes attached to leads
- ✅ `lead-document.workspace-entity.ts` - Document uploads with categories
- ✅ `existing-loan.workspace-entity.ts` - Existing loans for the customer
- ✅ `vehicle.workspace-entity.ts` - Vehicle information for auto loans
- ✅ `machinery.workspace-entity.ts` - Machinery information for machinery loans
- ✅ `reference.workspace-entity.ts` - Customer references
- ✅ `disbursement.workspace-entity.ts` - Loan disbursement details

**Catalog Module** (`packages/twenty-server/src/modules/catalog/standard-objects/`):
- ✅ `catalog-product.workspace-entity.ts` - Product catalog (Home Loan, Auto Loan, etc.)
- ✅ `catalog-status.workspace-entity.ts` - Lead status catalog (New, In Progress, etc.)
- ✅ `catalog-financer.workspace-entity.ts` - Financer catalog
- ✅ `catalog-loan-type.workspace-entity.ts` - Loan type catalog
- ✅ `catalog-property-type.workspace-entity.ts` - Property type catalog

### Phase 2: Metadata Registration (IN PROGRESS)
The next steps involve registering these entities in Twenty's metadata system:

1. **Add to standard objects constants** - Define universal identifiers and field IDs
2. **Create field metadata builders** - Define all fields for each object
3. **Create object metadata builders** - Wire up object definitions
4. **Create view metadata** - Define default views for listing/detail pages
5. **Update TypeScript types** - Add to `AllStandardObjectName` type

### Phase 3: Services & Business Logic (TODO)
- Lead number generation service (LD-YYYYMM-#####)
- Custom resolvers (duplicate, restore, autoSave, share, export)
- Validation logic
- Computed fields (remainingTenure)
- File upload integration
- Reminder scheduling

### Phase 4: Frontend Implementation (TODO)
- Lead list/detail pages
- Multi-step form with conditional sections
- Party management forms
- Document upload UI
- Reminder panel
- Export functionality

## Architecture Notes

### Workspace Entity Pattern
Twenty uses a hybrid metadata-driven architecture:
- **Workspace entities** define the TypeScript schema
- **Metadata builders** generate GraphQL schema and database migrations
- **Standard objects** are auto-discovered and registered

### Key Design Decisions
1. **Lead Number**: Auto-generated with format LD-YYYYMM-##### using sequence
2. **Catalogs**: Separate module for all lookup tables
3. **Parties**: Two entities (Company & Individual) with role enum
4. **Documents**: Enum-based categories for organization
5. **Relations**: Follow Twenty's RelationType patterns (ONE_TO_MANY, MANY_TO_ONE)

### Field Type Mapping
- Text fields → `FieldMetadataType.TEXT`
- Numbers → `FieldMetadataType.NUMBER`
- Currencies → `FieldMetadataType.CURRENCY`
- Dates → `FieldMetadataType.DATE_TIME`
- Phone numbers → `FieldMetadataType.PHONES`
- Rich text → `FieldMetadataType.RICH_TEXT_V2`
- Enums → `FieldMetadataType.SELECT` with options
- Relations → `FieldMetadataType.RELATION`

## Next Steps

1. Create standard object constants with UUIDs
2. Build field metadata for each object
3. Build object metadata builders
4. Register in `STANDARD_FLAT_OBJECT_METADATA_BUILDERS_BY_OBJECT_NAME`
5. Create default views
6. Test metadata generation
7. Implement services
8. Build frontend

## Additional Entities Needed
The problem statement mentions additional entities that still need to be created:
- ProductPolicy
- DsaCode
- RoiUpdate
- Employee
- Reminder
- AuditLog
- Additional catalog entities (EmploymentType, Industry, Ownership, etc.)

These will be added in subsequent phases.
