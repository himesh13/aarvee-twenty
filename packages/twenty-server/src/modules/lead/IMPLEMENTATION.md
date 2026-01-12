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

### Phase 2: Metadata Registration (COMPLETE ✅)
All entities have been fully registered in Twenty's metadata system:

1. ✅ **Added to standard objects constants** - All 17 objects with universal identifiers and 165+ field IDs
2. ✅ **Created field metadata builders** - All fields defined for each object (17 builders created)
3. ✅ **Registered in system** - All builders imported and registered in `build-standard-flat-field-metadata-maps.util.ts`
4. ✅ **Updated `standard-object.constant.ts`** - All 17 objects with complete field structures
5. ✅ **TypeScript types updated** - `AllStandardObjectName` and `AllStandardObjectFieldName` auto-generated

**Files created in this phase:**
- 17 field metadata builder files (`compute-*-standard-flat-field-metadata.util.ts`)
- Modified: `standard-field-ids.ts` (165+ field IDs)
- Modified: `build-standard-flat-field-metadata-maps.util.ts` (all registrations)
- Modified: `standard-object.constant.ts` (all 17 objects)

### Phase 3: Testing & Validation (TODO - Next Phase)
- [ ] Run `npx nx database:reset twenty-server` to test metadata generation
- [ ] Verify GraphQL schema is generated correctly for all 17 objects
- [ ] Test basic CRUD operations via GraphQL API
- [ ] Validate all field types work correctly
- [ ] Verify relations between objects

### Phase 4: View Metadata (TODO - Optional)
- [ ] Create default views for listing/detail pages
- [ ] Define view fields, filters, sorts for key objects
- [ ] Configure view permissions

### Phase 5: Relation Updates (TODO)
Update existing Twenty objects to support Lead relations:
- [ ] Add `lead` field to AttachmentWorkspaceEntity
- [ ] Add `lead` field to FavoriteWorkspaceEntity  
- [ ] Add `lead` field to TaskTargetWorkspaceEntity
- [ ] Add `lead` field to NoteTargetWorkspaceEntity
- [ ] Add `lead` field to TimelineActivityWorkspaceEntity
- [ ] Add `assignedLeads` relation to WorkspaceMemberWorkspaceEntity

### Phase 6: Services & Business Logic (TODO)
- Lead number generation service (LD-YYYYMM-#####)
- Custom resolvers (duplicate, restore, autoSave, share, export)
- Validation logic
- Computed fields (remainingTenure)
- File upload integration
- Reminder scheduling

### Phase 7: Frontend Implementation (TODO)
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
