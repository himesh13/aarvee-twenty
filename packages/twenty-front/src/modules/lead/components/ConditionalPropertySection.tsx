import { useState, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const InfoBox = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
`;

interface ConditionalPropertySectionProps {
  leadId: string;
  productName: string;
  isVisible?: boolean;
}

/**
 * Conditional Property Section
 * 
 * Shows property details section only for specific loan products.
 * Based on requirements: Property details must be opened only in:
 * - Home Loan
 * - Loan Against Property
 * - Working Capital
 * - Overdraft
 * - Project Finance
 * - SME Loans
 * 
 * Features:
 * - Conditional rendering based on product type
 * - Integration with Twenty's RecordFieldList component
 * - Info message when properties not applicable
 */
export const ConditionalPropertySection = ({
  leadId,
  productName,
  isVisible,
}: ConditionalPropertySectionProps) => {
  const [shouldShowProperties, setShouldShowProperties] = useState(false);
  
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'lead',
  });

  // Product types that require property details
  const propertyBasedProducts = [
    'Home Loan',
    'Loan Against Property',
    'Working Capital',
    'Overdraft',
    'Project Finance',
    'SME Loans',
    'SME Loan',
    'LAP', // Abbreviation
    'OD', // Abbreviation
  ];

  useEffect(() => {
    if (!productName) {
      setShouldShowProperties(false);
      return;
    }

    // Check if product requires property details (case-insensitive)
    const requiresProperty = propertyBasedProducts.some((product) =>
      productName.toLowerCase().includes(product.toLowerCase()),
    );

    setShouldShowProperties(requiresProperty);
  }, [productName]);

  // Allow manual override via prop
  const showSection = isVisible !== undefined ? isVisible : shouldShowProperties;

  // Get field IDs to exclude (all relation fields except property)
  const excludeFieldMetadataIds = useMemo(() => {
    if (!objectMetadataItem) return [];
    
    return objectMetadataItem.fields
      .filter((field) => {
        // Keep only relation fields that are NOT property-related
        const isPropertyField = field.name === 'properties' || 
                                 field.name === 'property';
        return field.type === 'RELATION' && !isPropertyField;
      })
      .map((field) => field.id);
  }, [objectMetadataItem]);

  if (!showSection) {
    return (
      <Container>
        <InfoBox>
          Property details are not required for this loan product.
          Properties section is only available for: Home Loan, Loan Against Property,
          Working Capital, Overdraft, Project Finance, and SME Loans.
        </InfoBox>
      </Container>
    );
  }

  const instanceId = `conditional-property-${leadId}`;

  return (
    <Container>
      <RecordFieldsScopeContextProvider value={{ scopeInstanceId: instanceId }}>
        <RecordFieldList
          instanceId={instanceId}
          objectNameSingular="lead"
          objectRecordId={leadId}
          showDuplicatesSection={false}
          showRelationSections={true}
          excludeFieldMetadataIds={excludeFieldMetadataIds}
          excludeCreatedAtAndUpdatedAt={true}
        />
      </RecordFieldsScopeContextProvider>
    </Container>
  );
};
