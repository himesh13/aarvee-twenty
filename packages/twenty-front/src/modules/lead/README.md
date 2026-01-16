# Lead Module - Frontend Components

This module provides custom React components for enhancing the Lead Management System beyond Twenty's auto-generated UI.

## Overview

Twenty automatically generates 80% of the Lead UI from backend metadata:
- ✅ List views (table, kanban, calendar)
- ✅ Detail/edit pages with inline editing
- ✅ Create forms with all fields
- ✅ Relations display (company parties, individuals, properties, etc.)
- ✅ Filtering, sorting, searching

The components in this module provide the additional 20% of functionality:
- Custom buttons (Duplicate, Export)
- Conditional sections based on loan product
- Auto-calculated fields
- Enhanced user experience features

## Components

### 1. DuplicateLeadButton

Duplicates a lead with a new auto-generated lead number.

**Usage:**
```tsx
import { DuplicateLeadButton } from '@/lead/components';

<DuplicateLeadButton 
  leadId="uuid-of-lead"
  onSuccess={(newLeadId) => {
    // Optional: Handle success
    console.log('Lead duplicated:', newLeadId);
  }}
/>
```

**Features:**
- Calls `duplicateLead` GraphQL mutation
- Generates new lead number automatically
- Shows success notification with new lead number
- Navigates to duplicated lead or calls onSuccess callback
- Displays loading state during duplication
- Error handling with user feedback

**Integration Example (Action Menu):**
```tsx
// In a custom action configuration
{
  key: 'duplicate-lead',
  label: 'Duplicate Lead',
  Icon: IconCopy,
  position: 10,
  isPinned: true,
  component: <DuplicateLeadButton leadId={recordId} />,
  availableOn: [ActionViewType.SHOW_PAGE],
}
```

---

### 2. ExportLeadButtons

Export lead data to PDF or Word format with optional letterhead.

**Usage:**
```tsx
import { ExportLeadButtons } from '@/lead/components';

<ExportLeadButtons 
  leadId="uuid-of-lead"
  leadNo="LD-202601-00001"
/>
```

**Features:**
- Export to PDF with professional formatting
- Export to Word document (.docx)
- Preview HTML before exporting
- Toggle letterhead inclusion
- Auto-download generated files
- Base64 file handling

**Backend Requirements:**
- `exportLeadToPDF` GraphQL query
- `exportLeadToWord` GraphQL query
- `getLeadExportPreview` GraphQL query

---

### 3. ExistingLoanDetails

Display existing loan details with auto-calculated remaining tenure and payable amount.

**Usage:**
```tsx
import { ExistingLoanDetails } from '@/lead/components';

<ExistingLoanDetails
  tenure={240}
  paidEmi={48}
  emiAmount={25000}
  onTenureChange={(value) => setTenure(value)}
  onPaidEmiChange={(value) => setPaidEmi(value)}
  onEmiAmountChange={(value) => setEmiAmount(value)}
  readonly={false}
/>
```

**Features:**
- Auto-calculates: `remainingTenure = tenure - paidEmi`
- Auto-calculates: `remainingPayable = emiAmount * remainingTenure`
- Validates paid EMI doesn't exceed tenure
- Visual feedback for computed values
- Readonly mode support
- Input validation (max 3 digits for tenure/paid EMI)
- Formatted display with years/months breakdown

**Calculations:**
```
Remaining Tenure = Tenure (months) - Paid EMI (months)
Remaining Payable = EMI Amount * Remaining Tenure

Example:
Tenure: 240 months (20 years)
Paid EMI: 48 months (4 years)
EMI Amount: ₹25,000
→ Remaining Tenure: 192 months (16 years)
→ Remaining Payable: ₹48,00,000
```

---

### 4. ReminderPanel

Display and manage reminders for a lead (birthday, loan topup, custom follow-ups).

**Usage:**
```tsx
import { ReminderPanel } from '@/lead/components';

<ReminderPanel leadId="uuid-of-lead" />
```

**Features:**
- View all reminders (birthday, loan topup, custom)
- Mark reminders as completed
- Create new custom reminders
- Visual indicators for reminder types:
  - Birthday: Blue badge
  - Loan Topup: Green badge
  - Follow Up: Orange badge
- Real-time updates with refetch
- Empty state for no reminders

**Backend Requirements:**
- `getRemindersForLead` GraphQL query
- `completeReminder` GraphQL mutation
- `createReminder` GraphQL mutation

---

### 5. ConditionalPropertySection

Show property details section only for loan products that require property information.

**Usage:**
```tsx
import { ConditionalPropertySection } from '@/lead/components';

<ConditionalPropertySection
  leadId="uuid-of-lead"
  productName="Home Loan"
  isVisible={true} // Optional: Manual override
/>
```

**Features:**
- Conditional rendering based on product type
- Shows for: Home Loan, Loan Against Property, Working Capital, Overdraft, Project Finance, SME Loans
- Integrates with Twenty's RecordDetailRelationSection
- Info message when properties not applicable
- Case-insensitive product matching

**Business Logic:**
```tsx
const propertyBasedProducts = [
  'Home Loan',
  'Loan Against Property',
  'Working Capital',
  'Overdraft',
  'Project Finance',
  'SME Loans',
];

// Component shows properties section only if product matches
```

---

### 6. ConditionalVehicleSection

Show vehicle details section only for auto loan products.

**Usage:**
```tsx
import { ConditionalVehicleSection } from '@/lead/components';

<ConditionalVehicleSection
  leadId="uuid-of-lead"
  productName="Auto Loan"
  isVisible={true} // Optional: Manual override
/>
```

**Features:**
- Conditional rendering for auto loans
- Shows for: Auto Loan, Car Loan, Vehicle Loan, Two Wheeler Loan, Commercial Vehicle Loan
- Supports: Brand, Model, Sub Model, MFG Year, Insurance Validity
- Info message when vehicles not applicable

---

### 7. ConditionalMachinerySection

Show machinery details section only for machinery loan products.

**Usage:**
```tsx
import { ConditionalMachinerySection } from '@/lead/components';

<ConditionalMachinerySection
  leadId="uuid-of-lead"
  productName="Machinery Loan"
  isVisible={true} // Optional: Manual override
/>
```

**Features:**
- Conditional rendering for machinery loans
- Shows for: Machinery Loan, Equipment Loan, Plant and Machinery, Industrial Equipment
- Supports: Brand, Model, Purchase/Invoice Value, MFG/Purchase Year, Description
- Info message when machinery not applicable

---

## Hooks

### useAutoSave

Auto-save hook for lead forms with debounced saving.

**Usage:**
```tsx
import { useAutoSave } from '@/lead/hooks';

function LeadForm({ leadId, initialData }) {
  const [formData, setFormData] = useState(initialData);

  const { isSaving, lastSaved, forceSave } = useAutoSave({
    leadId,
    formData,
    enabled: true,
    debounceMs: 2000,
    onSaveSuccess: () => {
      console.log('Saved successfully');
    },
    onSaveError: (error) => {
      console.error('Save failed:', error);
    },
  });

  return (
    <div>
      {isSaving && <span>Saving...</span>}
      {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      
      <input
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
      />
      
      <button onClick={() => forceSave()}>Save Now</button>
    </div>
  );
}
```

**Features:**
- Debounced auto-saving (default 2 seconds)
- Saves on page unload (browser close, refresh)
- Handles power/connection interruptions
- Enable/disable toggle
- Last saved timestamp tracking
- Force save method for manual triggers
- Error handling with notifications
- Uses `sendBeacon` for reliable page unload saving

**Parameters:**
- `leadId`: UUID of the lead
- `formData`: Current form data object
- `enabled`: Enable/disable auto-save (default: true)
- `debounceMs`: Debounce delay in milliseconds (default: 2000)
- `onSaveSuccess`: Optional callback on successful save
- `onSaveError`: Optional callback on save error

**Returns:**
- `isSaving`: Boolean indicating if save is in progress
- `lastSaved`: Date of last successful save
- `forceSave`: Function to trigger immediate save

---

## Integration Examples

### Example 1: Custom Lead Detail Page

```tsx
import { useParams } from 'react-router-dom';
import { 
  DuplicateLeadButton, 
  ExportLeadButtons,
  ReminderPanel,
  ConditionalPropertySection,
  ConditionalVehicleSection,
  ConditionalMachinerySection
} from '@/lead/components';
import { useAutoSave } from '@/lead/hooks';

export const CustomLeadDetailPage = () => {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  
  // Auto-save hook
  useAutoSave({
    leadId,
    formData: lead,
    enabled: true,
  });

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <DuplicateLeadButton leadId={leadId} />
        <ExportLeadButtons leadId={leadId} leadNo={lead?.leadNo} />
      </div>

      {/* Lead Details (auto-generated by Twenty) */}
      {/* ... */}

      {/* Conditional Sections */}
      <ConditionalPropertySection 
        leadId={leadId} 
        productName={lead?.product?.name} 
      />
      <ConditionalVehicleSection 
        leadId={leadId} 
        productName={lead?.product?.name} 
      />
      <ConditionalMachinerySection 
        leadId={leadId} 
        productName={lead?.product?.name} 
      />

      {/* Reminders Panel */}
      <ReminderPanel leadId={leadId} />
    </div>
  );
};
```

---

### Example 2: Custom Existing Loan Form

```tsx
import { useState } from 'react';
import { ExistingLoanDetails } from '@/lead/components';

export const ExistingLoanForm = ({ onSave }) => {
  const [tenure, setTenure] = useState(240);
  const [paidEmi, setPaidEmi] = useState(48);
  const [emiAmount, setEmiAmount] = useState(25000);

  const handleSave = () => {
    onSave({
      tenure,
      paidEmi,
      emiAmount,
      remainingTenure: tenure - paidEmi,
      remainingPayable: emiAmount * (tenure - paidEmi),
    });
  };

  return (
    <div>
      <ExistingLoanDetails
        tenure={tenure}
        paidEmi={paidEmi}
        emiAmount={emiAmount}
        onTenureChange={setTenure}
        onPaidEmiChange={setPaidEmi}
        onEmiAmountChange={setEmiAmount}
      />
      <button onClick={handleSave}>Save Existing Loan</button>
    </div>
  );
};
```

---

### Example 3: Action Menu Integration

To add custom actions to the lead detail page action menu, create a custom action config:

```tsx
// packages/twenty-front/src/modules/lead/actions/LeadActionsConfig.tsx

import { DuplicateLeadButton } from '@/lead/components/DuplicateLeadButton';
import { ExportLeadButtons } from '@/lead/components/ExportLeadButtons';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { ActionScope } from '@/action-menu/actions/types/ActionScope';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { IconCopy, IconFileExport } from 'twenty-ui';

export const LEAD_ACTIONS_CONFIG: Record<string, ActionConfig> = {
  DUPLICATE_LEAD: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: 'duplicate-lead',
    label: 'Duplicate Lead',
    position: 10,
    isPinned: true,
    Icon: IconCopy,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <DuplicateLeadButton />,
  },
  EXPORT_LEAD: {
    type: ActionType.Standard,
    scope: ActionScope.RecordSelection,
    key: 'export-lead',
    label: 'Export Lead',
    position: 11,
    isPinned: true,
    Icon: IconFileExport,
    availableOn: [ActionViewType.SHOW_PAGE],
    component: <ExportLeadButtons />,
  },
};
```

Then register these actions in your lead-specific action registration:

```tsx
// packages/twenty-front/src/modules/lead/hooks/useLeadActions.ts

import { useEffect } from 'react';
import { useRegisterAction } from '@/action-menu/hooks/useRegisterAction';
import { LEAD_ACTIONS_CONFIG } from '@/lead/actions/LeadActionsConfig';

export const useLeadActions = (objectNameSingular: string) => {
  const { registerAction } = useRegisterAction();

  useEffect(() => {
    if (objectNameSingular === 'lead') {
      Object.values(LEAD_ACTIONS_CONFIG).forEach((action) => {
        registerAction(action);
      });
    }
  }, [objectNameSingular, registerAction]);
};
```

---

## Testing

### Unit Testing

Components are designed to be easily testable with Jest and React Testing Library:

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { DuplicateLeadButton } from '@/lead/components';

const mocks = [
  {
    request: {
      query: DUPLICATE_LEAD_MUTATION,
      variables: { id: 'test-uuid' },
    },
    result: {
      data: {
        duplicateLead: {
          id: 'new-uuid',
          leadNo: 'LD-202601-00002',
          customerName: 'Test Customer',
          createdAt: new Date().toISOString(),
        },
      },
    },
  },
];

test('duplicates lead successfully', async () => {
  render(
    <MockedProvider mocks={mocks}>
      <DuplicateLeadButton leadId="test-uuid" />
    </MockedProvider>
  );

  const button = screen.getByTitle('Duplicate Lead');
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.getByText(/Lead duplicated successfully/)).toBeInTheDocument();
  });
});
```

---

## Backend Requirements

### GraphQL Mutations/Queries

The components require the following GraphQL operations to be implemented:

1. **Duplicate Lead:**
   ```graphql
   mutation DuplicateLead($id: UUID!) {
     duplicateLead(id: $id) {
       id
       leadNo
       customerName
       createdAt
     }
   }
   ```

2. **Export Lead:**
   ```graphql
   query ExportLeadToPDF($leadId: String!, $includeLetterhead: Boolean) {
     exportLeadToPDF(leadId: $leadId, includeLetterhead: $includeLetterhead)
   }

   query ExportLeadToWord($leadId: String!, $includeLetterhead: Boolean) {
     exportLeadToWord(leadId: $leadId, includeLetterhead: $includeLetterhead)
   }

   query GetLeadExportPreview($leadId: String!, $includeLetterhead: Boolean) {
     getLeadExportPreview(leadId: $leadId, includeLetterhead: $includeLetterhead)
   }
   ```

3. **Reminders:**
   ```graphql
   query GetRemindersForLead($leadId: String!) {
     getRemindersForLead(leadId: $leadId) {
       id
       type
       title
       description
       dueDate
       isCompleted
       createdAt
     }
   }

   mutation CompleteReminder($reminderId: String!) {
     completeReminder(reminderId: $reminderId) {
       id
       isCompleted
     }
   }

   mutation CreateReminder($leadId: String!, $title: String!, $dueDate: Date!, $description: String) {
     createReminder(leadId: $leadId, title: $title, dueDate: $dueDate, description: $description) {
       id
       title
       dueDate
     }
   }
   ```

4. **Update Lead (for auto-save):**
   ```graphql
   mutation UpdateLead($id: UUID!, $input: LeadUpdateInput!) {
     updateLead(id: $id, data: $input) {
       id
       updatedAt
     }
   }
   ```

---

## Styling

Components use Emotion for styling and follow Twenty's theming system:

```tsx
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;
```

Theme values available:
- `theme.spacing()` - Spacing scale
- `theme.font.size.*` - Font sizes
- `theme.font.weight.*` - Font weights
- `theme.color.*` - Color palette
- `theme.background.*` - Background colors
- `theme.border.*` - Border styles

---

## Best Practices

1. **Always use TypeScript types:**
   ```tsx
   interface DuplicateLeadButtonProps {
     leadId: string;
     onSuccess?: (newLeadId: string) => void;
   }
   ```

2. **Handle loading and error states:**
   ```tsx
   const [duplicateLead, { loading, error }] = useMutation(DUPLICATE_LEAD_MUTATION);
   ```

3. **Use Twenty's UI components:**
   ```tsx
   import { Button } from '@/ui/input/button/components/Button';
   import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
   ```

4. **Follow naming conventions:**
   - Components: PascalCase (e.g., `DuplicateLeadButton`)
   - Files: PascalCase with `.tsx` extension
   - Hooks: camelCase starting with "use" (e.g., `useAutoSave`)

5. **Document component props:**
   ```tsx
   /**
    * Duplicate Lead Button
    * 
    * Duplicates a lead with a new lead number and redirects to the new lead.
    * Uses the duplicateLead GraphQL mutation from the backend.
    */
   ```

---

## Troubleshooting

### Component not rendering

1. Check if GraphQL queries/mutations are defined
2. Verify Apollo Client is properly configured
3. Check browser console for errors
4. Ensure leadId is a valid UUID

### Auto-save not working

1. Check network tab for GraphQL requests
2. Verify formData is changing
3. Check debounce delay (default 2 seconds)
3. Enable console logging in useAutoSave hook

### Export buttons not downloading

1. Verify backend returns base64-encoded data
2. Check CORS configuration
3. Ensure MIME types are correct
4. Check browser's download settings

---

## Future Enhancements

Planned improvements for future versions:

1. **Enhanced Validation:**
   - Real-time PAN/Aadhar validation
   - Custom validation rules per product type
   - Field dependency validation

2. **Advanced Reminders:**
   - Email/SMS notifications
   - Reminder escalation rules
   - Snooze and reschedule options

3. **Batch Operations:**
   - Bulk lead export
   - Bulk lead duplication
   - Bulk reminder creation

4. **Analytics Integration:**
   - Lead conversion tracking
   - Pipeline metrics
   - Performance dashboards

---

## Contributing

When adding new components:

1. Follow the existing component structure
2. Add TypeScript types for all props
3. Include JSDoc comments
4. Export from `components/index.ts`
5. Update this README with usage examples
6. Add unit tests if applicable

---

## Support

For questions or issues:
1. Check the comprehensive documentation files:
   - `PHASE_4_FRONTEND_GUIDE.md` - Detailed implementation guide
   - `PHASE_3_4_FINAL_SUMMARY.md` - Overall implementation summary
2. Review Twenty's official documentation
3. Examine existing Twenty modules for patterns

---

**Last Updated:** January 16, 2026
**Version:** 1.0.0
**Status:** Production Ready
