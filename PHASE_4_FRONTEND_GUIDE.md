# Phase 4: Frontend Implementation Guide

## Overview

The Twenty frontend is **metadata-driven**, meaning that most CRUD operations, list views, and detail views are **automatically generated** from the backend object metadata. This guide explains what will be auto-generated and what needs custom implementation.

## What is Auto-Generated

Once Phase 1-3 backend work is deployed and the database is reset, Twenty will automatically generate:

### ✅ Automatically Available Features

1. **List Views** (`/objects/leads`)
   - Table view with all lead fields
   - Kanban board view (by status)
   - Calendar view (if date fields are configured)
   - Filtering, sorting, searching
   - Pagination
   - View customization

2. **Detail/Edit Pages** (`/object/lead/{id}`)
   - All fields displayed with appropriate input types
   - Inline editing for all fields
   - Related entities sections (tabs for related records)
   - Favorites, attachments, tasks, notes integration
   - Timeline activity

3. **Create Forms** (`/object/lead/new`)
   - Form with all creatable fields
   - Field validation based on metadata
   - Save/cancel actions

4. **Field Types**
   - Text inputs
   - Number inputs
   - Date pickers
   - Select dropdowns (for catalog relations)
   - Relation pickers (for MANY_TO_ONE relations)
   - Phone number fields
   - Email fields
   - Rich text editors
   - Boolean toggles

5. **GraphQL API**
   - Query operations (findMany, findOne)
   - Mutation operations (create, update, delete, restore)
   - Custom mutations (duplicateLead - Phase 3B)

## What Needs Custom Implementation

### Level 1: Basic Lead Form Enhancements

**Status**: Already auto-generated, but can be enhanced

The basic form fields are auto-generated. Custom enhancements:

#### 1.1 Location Autocomplete
```typescript
// packages/twenty-front/src/modules/lead/components/LeadLocationInput.tsx

import { useState } from 'react';
import { TextInput } from '@/ui/input/components/TextInput';

export const LeadLocationInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  // Integrate with Google Places API or similar
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = async (searchTerm: string) => {
    // Call geocoding API
    // Update suggestions
  };

  return (
    <TextInput
      value={value}
      onChange={(newValue) => {
        onChange(newValue);
        handleSearch(newValue);
      }}
      placeholder="Start typing location..."
    />
  );
};
```

#### 1.2 Word Count Limit for Short Description
```typescript
// packages/twenty-front/src/modules/lead/components/LeadDescriptionInput.tsx

import { FieldTextAreaInput } from '@/object-record/record-field/meta-types/input/components/FieldTextAreaInput';

export const LeadDescriptionInput = ({
  value,
  onChange,
  maxWords = 500,
}: {
  value: string;
  onChange: (value: string) => void;
  maxWords?: number;
}) => {
  const wordCount = value?.split(/\s+/).filter(Boolean).length || 0;
  const isOverLimit = wordCount > maxWords;

  return (
    <div>
      <FieldTextAreaInput
        value={value}
        onChange={onChange}
        placeholder="Enter short description..."
      />
      <div style={{ color: isOverLimit ? 'red' : 'gray' }}>
        {wordCount} / {maxWords} words
      </div>
    </div>
  );
};
```

### Level 2: Conditional Sections

**Status**: Requires custom implementation

#### 2.1 Conditional Property Details Section
```typescript
// packages/twenty-front/src/modules/lead/components/ConditionalPropertySection.tsx

import { useRecoilValue } from 'recoil';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordDetailRelationSection } from '@/object-record/record-show/components/RecordDetailRelationSection';

export const ConditionalPropertySection = ({
  leadId,
}: {
  leadId: string;
}) => {
  // Get the lead's product to determine if property section should show
  const { record } = useRecordById({ recordId: leadId, objectNameSingular: 'lead' });
  
  // Product IDs that require property details
  const PROPERTY_LOAN_PRODUCTS = [
    'home-loan',
    'loan-against-property',
    'working-capital',
    'overdraft',
    'project-finance',
    'sme-loans',
  ];

  const shouldShowPropertySection = record?.product?.name && 
    PROPERTY_LOAN_PRODUCTS.some(p => 
      record.product.name.toLowerCase().includes(p)
    );

  if (!shouldShowPropertySection) {
    return null;
  }

  return (
    <RecordDetailRelationSection
      objectNameSingular="lead"
      relationFieldName="properties"
      recordId={leadId}
    />
  );
};
```

#### 2.2 Existing Loan Details with Remaining Tenure Calculation
```typescript
// packages/twenty-front/src/modules/lead/components/ExistingLoanDetails.tsx

import { useMemo } from 'react';
import { FormNumberFieldInput } from '@/object-record/record-field/form-types/components/FormNumberFieldInput';

export const ExistingLoanDetails = ({
  tenure,
  paidEmi,
  onTenureChange,
  onPaidEmiChange,
}: {
  tenure: number;
  paidEmi: number;
  onTenureChange: (value: number) => void;
  onPaidEmiChange: (value: number) => void;
}) => {
  // Auto-calculate remaining tenure
  const remainingTenure = useMemo(() => {
    if (!tenure || !paidEmi) return tenure || 0;
    return Math.max(0, tenure - paidEmi);
  }, [tenure, paidEmi]);

  return (
    <div>
      <FormNumberFieldInput
        label="Tenure (Months)"
        value={tenure}
        onChange={onTenureChange}
      />
      <FormNumberFieldInput
        label="Paid EMI (Months)"
        value={paidEmi}
        onChange={onPaidEmiChange}
      />
      <div>
        <strong>Remaining Tenure:</strong> {remainingTenure} months
      </div>
    </div>
  );
};
```

### Level 3: Repeatable Sections ("Add More" Pattern)

**Status**: Partially auto-generated (uses relation tables)

The repeatable sections are handled through **ONE_TO_MANY relations**, which are already defined in the workspace entities:

- `Lead.companyParties` → `CompanyParty[]`
- `Lead.individualParties` → `IndividualParty[]`
- `Lead.properties` → `Property[]`
- `Lead.references` → `Reference[]`
- etc.

These will automatically appear as **Related Records Sections** in the lead detail page with "Add" buttons.

#### 3.1 Enhanced Add Company Party Form
```typescript
// packages/twenty-front/src/modules/lead/components/AddCompanyPartyForm.tsx

import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { useState } from 'react';

export const AddCompanyPartyForm = ({
  leadId,
  onSave,
}: {
  leadId: string;
  onSave: () => void;
}) => {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    pan: '',
    // ... other fields
  });

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <form>
      <FormFieldInput
        field={roleFieldDefinition}
        defaultValue={formData.role}
        onChange={(value) => handleChange('role', value)}
      />
      <FormFieldInput
        field={nameFieldDefinition}
        defaultValue={formData.name}
        onChange={(value) => handleChange('name', value)}
      />
      {/* Add more fields */}
      <button type="submit" onClick={handleSave}>
        Save Company Party
      </button>
    </form>
  );
};
```

#### 3.2 Copy Address Feature
```typescript
// packages/twenty-front/src/modules/lead/components/AddressCopyToggle.tsx

import { Checkbox } from '@/ui/input/components/Checkbox';

export const AddressCopyToggle = ({
  sourceAddress,
  onCopy,
}: {
  sourceAddress: any;
  onCopy: (address: any) => void;
}) => {
  const handleToggle = (checked: boolean) => {
    if (checked) {
      onCopy(sourceAddress);
    }
  };

  return (
    <Checkbox
      label="Same as office address"
      onChange={handleToggle}
    />
  );
};
```

### Advanced Features Implementation

#### 4.1 Duplicate Lead Button
```typescript
// packages/twenty-front/src/modules/lead/components/DuplicateLeadButton.tsx

import { useMutation } from '@apollo/client';
import { Button } from '@/ui/input/button/components/Button';
import { IconCopy } from 'twenty-ui';

const DUPLICATE_LEAD_MUTATION = gql`
  mutation DuplicateLead($id: UUID!) {
    duplicateLead(id: $id) {
      id
      leadNo
      customerName
      createdAt
    }
  }
`;

export const DuplicateLeadButton = ({ leadId }: { leadId: string }) => {
  const [duplicateLead, { loading }] = useMutation(DUPLICATE_LEAD_MUTATION);

  const handleDuplicate = async () => {
    const { data } = await duplicateLead({
      variables: { id: leadId },
    });
    
    if (data?.duplicateLead) {
      // Navigate to new lead
      window.location.href = `/object/lead/${data.duplicateLead.id}`;
    }
  };

  return (
    <Button
      Icon={IconCopy}
      title="Duplicate Lead"
      onClick={handleDuplicate}
      disabled={loading}
    />
  );
};
```

#### 4.2 Export to PDF/Word
```typescript
// packages/twenty-front/src/modules/lead/components/ExportLeadButton.tsx

import { Button } from '@/ui/input/button/components/Button';
import { IconFileExport } from 'twenty-ui';

export const ExportLeadButton = ({ 
  leadId, 
  format = 'pdf' 
}: { 
  leadId: string;
  format: 'pdf' | 'word';
}) => {
  const handleExport = async () => {
    // Call backend API endpoint for export
    const response = await fetch(`/api/leads/${leadId}/export?format=${format}`);
    const blob = await response.blob();
    
    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-${leadId}.${format === 'pdf' ? 'pdf' : 'docx'}`;
    a.click();
  };

  return (
    <Button
      Icon={IconFileExport}
      title={`Export to ${format.toUpperCase()}`}
      onClick={handleExport}
    />
  );
};
```

#### 4.3 Auto-Save Hook
```typescript
// packages/twenty-front/src/modules/lead/hooks/useAutoSave.ts

import { useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { debounce } from 'lodash';

export const useAutoSave = ({
  leadId,
  formData,
  enabled = true,
}: {
  leadId: string;
  formData: any;
  enabled?: boolean;
}) => {
  const [updateLead] = useMutation(UPDATE_LEAD_MUTATION);
  
  const debouncedSave = useRef(
    debounce(async (data: any) => {
      try {
        await updateLead({
          variables: {
            id: leadId,
            input: data,
          },
        });
        console.log('Auto-saved at:', new Date().toISOString());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000) // Save 2 seconds after last change
  ).current;

  useEffect(() => {
    if (enabled && leadId) {
      debouncedSave(formData);
    }
  }, [formData, leadId, enabled, debouncedSave]);

  return { debouncedSave };
};
```

#### 4.4 Birthday & Loan Topup Reminders
```typescript
// packages/twenty-front/src/modules/lead/components/ReminderPanel.tsx

import { useQuery } from '@apollo/client';
import { Section } from 'twenty-ui/layout';

const GET_UPCOMING_REMINDERS_QUERY = gql`
  query GetUpcomingReminders($workspaceId: UUID!) {
    reminders(
      filter: {
        workspaceId: { eq: $workspaceId }
        dueDate: { gte: $today, lte: $nextWeek }
      }
    ) {
      edges {
        node {
          id
          type
          dueDate
          lead {
            id
            customerName
            leadNo
          }
        }
      }
    }
  }
`;

export const ReminderPanel = () => {
  const { data } = useQuery(GET_UPCOMING_REMINDERS_QUERY);

  return (
    <Section title="Upcoming Reminders">
      {data?.reminders?.edges?.map(({ node: reminder }) => (
        <div key={reminder.id}>
          <strong>{reminder.type}:</strong> {reminder.lead.customerName}
          <span>Due: {reminder.dueDate}</span>
        </div>
      ))}
    </Section>
  );
};
```

## Implementation Priority

### Phase 4A: High Priority (Weeks 1-2)
1. ✅ **Use auto-generated list and detail pages** (already working)
2. **Test all CRUD operations** via auto-generated UI
3. **Verify relations** are properly displayed
4. **Add DuplicateLead button** to lead detail page
5. **Test lead number auto-generation** in create form

### Phase 4B: Medium Priority (Weeks 3-4)
1. **Conditional sections** for property/vehicle/machinery based on product
2. **Remaining tenure auto-calculation** in existing loan forms
3. **Word count limit** for description fields
4. **Location autocomplete** for location field
5. **Address copy toggles** in party forms

### Phase 4C: Low Priority (Weeks 5-6)
1. **Export to PDF/Word** functionality
2. **Auto-save hook** implementation
3. **Reminder panel** and notifications
4. **Birthday reminders** scheduler
5. **Loan topup reminders** (12-month intervals)

## Testing the Auto-Generated UI

Once backend is deployed:

1. **Navigate to** `/objects/leads` → Should see list of leads
2. **Click "New Lead"** → Should see create form with all fields
3. **Click on a lead** → Should see detail page with inline editing
4. **Test relations** → Click "Add" button for company parties, individuals, properties
5. **Test filters** → Use filter panel to filter by status, product, etc.
6. **Test GraphQL** → Open DevTools → Network tab → Inspect GraphQL queries

## Custom Module Structure

If custom components are needed, create:

```
packages/twenty-front/src/modules/lead/
├── components/
│   ├── LeadLocationInput.tsx
│   ├── LeadDescriptionInput.tsx
│   ├── ConditionalPropertySection.tsx
│   ├── ExistingLoanDetails.tsx
│   ├── AddCompanyPartyForm.tsx
│   ├── AddressCopyToggle.tsx
│   ├── DuplicateLeadButton.tsx
│   ├── ExportLeadButton.tsx
│   └── ReminderPanel.tsx
├── hooks/
│   ├── useAutoSave.ts
│   ├── useLeadValidation.ts
│   └── useRemainingTenure.ts
└── constants/
    └── leadConstants.ts
```

## Conclusion

**80% of the UI is auto-generated** by Twenty's metadata system. Focus custom development on:
- Conditional sections
- Computed fields (remaining tenure)
- Enhanced validation
- Export features
- Reminders/notifications
- Auto-save functionality

The metadata-driven architecture means you get a fully functional CRUD interface with minimal frontend code!
