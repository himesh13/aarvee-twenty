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

interface ConditionalVehicleSectionProps {
  leadId: string;
  productName: string;
  isVisible?: boolean;
}

/**
 * Conditional Vehicle Section
 * 
 * Shows vehicle details section only for auto loan products.
 * Based on requirements: Vehicle details must be opened only for Auto Loan.
 * 
 * Features:
 * - Conditional rendering based on product type
 * - Integration with Twenty's RecordFieldList component
 * - Info message when vehicles not applicable
 * - Support for: Brand, Model, Sub Model, MFG Year, Insurance Validity
 */
export const ConditionalVehicleSection = ({
  leadId,
  productName,
  isVisible,
}: ConditionalVehicleSectionProps) => {
  const [shouldShowVehicles, setShouldShowVehicles] = useState(false);
  
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'lead',
  });

  // Product types that require vehicle details
  const vehicleBasedProducts = [
    'Auto Loan',
    'Car Loan',
    'Vehicle Loan',
    'Two Wheeler Loan',
    'Commercial Vehicle Loan',
  ];

  useEffect(() => {
    if (!productName) {
      setShouldShowVehicles(false);
      return;
    }

    // Check if product requires vehicle details (case-insensitive)
    const requiresVehicle = vehicleBasedProducts.some((product) =>
      productName.toLowerCase().includes(product.toLowerCase()),
    );

    setShouldShowVehicles(requiresVehicle);
  }, [productName]);

  // Allow manual override via prop
  const showSection = isVisible !== undefined ? isVisible : shouldShowVehicles;

  // Get field IDs to exclude (all relation fields except vehicle)
  const excludeFieldMetadataIds = useMemo(() => {
    if (!objectMetadataItem) return [];
    
    return objectMetadataItem.fields
      .filter((field) => {
        // Keep only relation fields that are NOT vehicle-related
        const isVehicleField = field.name === 'vehicles' || 
                                field.name === 'vehicle';
        return field.type === 'RELATION' && !isVehicleField;
      })
      .map((field) => field.id);
  }, [objectMetadataItem]);

  if (!showSection) {
    return (
      <Container>
        <InfoBox>
          Vehicle details are not required for this loan product.
          Vehicles section is only available for: Auto Loan, Car Loan, Two Wheeler Loan, 
          and Commercial Vehicle Loan.
        </InfoBox>
      </Container>
    );
  }

  const instanceId = `conditional-vehicle-${leadId}`;

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
