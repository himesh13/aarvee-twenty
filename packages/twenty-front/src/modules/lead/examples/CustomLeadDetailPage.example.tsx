/**
 * Example: Custom Lead Detail Page
 * 
 * This example demonstrates how to create a custom lead detail page
 * that integrates all the custom components from the lead module.
 * 
 * NOTE: This is a demonstration file. In production, you would either:
 * 1. Use Twenty's auto-generated detail pages (recommended), OR
 * 2. Create a custom page by following this pattern
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import styled from '@emotion/styled';

// Import Lead components
import {
  DuplicateLeadButton,
  ExportLeadButtons,
  ReminderPanel,
  ConditionalPropertySection,
  ConditionalVehicleSection,
  ConditionalMachinerySection,
  useAutoSave,
} from '@/lead';

// Import Twenty UI components
import { Button } from 'twenty-ui/input';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const GET_LEAD_QUERY = gql`
  query GetLead($id: UUID!) {
    lead(id: $id) {
      id
      leadNo
      customerName
      contactNumber
      loanAmountRequired
      location
      shortDescription
      product {
        id
        name
      }
      status {
        id
        name
      }
      assignedTo {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const LeadNumber = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Section = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
`;

const AutoSaveIndicator = styled.div<{ isSaving: boolean }>`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ isSaving, theme }) => 
    isSaving ? theme.color.blue : theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

/**
 * Custom Lead Detail Page Example
 * 
 * This page demonstrates:
 * - Loading lead data from GraphQL
 * - Auto-save functionality
 * - Custom action buttons (Duplicate, Export)
 * - Conditional sections based on product type
 * - Reminders panel
 */
export const CustomLeadDetailPageExample = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  
  const [formData, setFormData] = useState<any>(null);

  // Fetch lead data
  const { data, loading, error } = useQuery(GET_LEAD_QUERY, {
    variables: { id: leadId },
    skip: !leadId,
  });

  // Initialize form data from query
  useEffect(() => {
    if (data?.lead) {
      setFormData(data.lead);
    }
  }, [data]);

  // Auto-save hook
  const { isSaving, lastSaved, forceSave } = useAutoSave({
    leadId: leadId || '',
    formData,
    enabled: !!leadId && !!formData,
    debounceMs: 2000,
    onSaveSuccess: () => {
      // Optional: Show subtle save indicator
      console.log('Lead auto-saved successfully');
    },
    onSaveError: (error) => {
      enqueueSnackBar(`Auto-save failed: ${error.message}`, {
        variant: 'error',
      });
    },
  });

  if (loading) {
    return <PageContainer>Loading lead...</PageContainer>;
  }

  if (error || !formData) {
    return <PageContainer>Error loading lead</PageContainer>;
  }

  const lead = formData;

  return (
    <PageContainer>
      {/* Header with Actions */}
      <Header>
        <div>
          <Title>{lead.customerName}</Title>
          <LeadNumber>Lead No: {lead.leadNo}</LeadNumber>
        </div>
        <Actions>
          {/* Auto-save indicator */}
          <AutoSaveIndicator isSaving={isSaving}>
            {isSaving ? (
              <>⏳ Saving...</>
            ) : lastSaved ? (
              <>✓ Saved at {lastSaved.toLocaleTimeString()}</>
            ) : (
              <>Auto-save enabled</>
            )}
          </AutoSaveIndicator>

          {/* Custom action buttons */}
          <DuplicateLeadButton 
            leadId={leadId!}
            onSuccess={(newLeadId) => {
              navigate(`/object/lead/${newLeadId}`);
            }}
          />
          <ExportLeadButtons 
            leadId={leadId!}
            leadNo={lead.leadNo}
          />
          <Button
            title="Force Save"
            onClick={() => forceSave()}
            variant="tertiary"
            size="small"
          />
        </Actions>
      </Header>

      {/* Content Grid */}
      <Content>
        {/* Main Content Area */}
        <MainContent>
          {/* Basic Lead Information */}
          <Section>
            <SectionTitle>Basic Information</SectionTitle>
            <div>
              <p><strong>Customer Name:</strong> {lead.customerName}</p>
              <p><strong>Contact Number:</strong> {lead.contactNumber}</p>
              <p><strong>Product:</strong> {lead.product?.name}</p>
              <p><strong>Loan Amount:</strong> ₹{lead.loanAmountRequired?.toLocaleString('en-IN')}</p>
              <p><strong>Location:</strong> {lead.location}</p>
              <p><strong>Status:</strong> {lead.status?.name}</p>
              <p><strong>Assigned To:</strong> {lead.assignedTo?.name}</p>
            </div>
          </Section>

          {/* Conditional Property Section */}
          <ConditionalPropertySection
            leadId={leadId!}
            productName={lead.product?.name}
          />

          {/* Conditional Vehicle Section */}
          <ConditionalVehicleSection
            leadId={leadId!}
            productName={lead.product?.name}
          />

          {/* Conditional Machinery Section */}
          <ConditionalMachinerySection
            leadId={leadId!}
            productName={lead.product?.name}
          />

          {/* 
            NOTE: In a real implementation, you would also show:
            - Company Parties section (auto-generated relation)
            - Individual Parties section (auto-generated relation)
            - References section (auto-generated relation)
            - Existing Loans section (auto-generated relation)
            - Files/Attachments (Twenty's built-in attachment system)
            - Notes (Twenty's built-in notes system)
            - Activities Timeline (Twenty's built-in activities)
          */}
        </MainContent>

        {/* Sidebar */}
        <Sidebar>
          {/* Reminders Panel */}
          <Section>
            <ReminderPanel leadId={leadId!} />
          </Section>

          {/* Additional sidebar content could include:
            - Quick actions
            - Recent activities
            - Related leads
            - Statistics
          */}
        </Sidebar>
      </Content>
    </PageContainer>
  );
};

/**
 * IMPORTANT NOTES:
 * 
 * 1. This is a DEMONSTRATION file showing how components can be used.
 *    In most cases, you should use Twenty's auto-generated UI which provides:
 *    - List views
 *    - Detail pages
 *    - Edit forms
 *    - Relation management
 * 
 * 2. To use this custom page, you would need to:
 *    - Add a route in your router configuration
 *    - Register it as a custom page for the 'lead' object
 *    - Decide when to show this vs the auto-generated page
 * 
 * 3. The auto-save functionality works best when:
 *    - You have proper form state management
 *    - You handle validation before saving
 *    - You provide user feedback
 * 
 * 4. For production use:
 *    - Add proper error boundaries
 *    - Add loading skeletons
 *    - Add form validation
 *    - Add confirmation dialogs for destructive actions
 *    - Add accessibility attributes
 *    - Add responsive design for mobile
 */
