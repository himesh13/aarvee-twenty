import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

import { RecordDetailRelationSection } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSection';

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
 * - Integration with Twenty's relation section
 * - Info message when vehicles not applicable
 * - Support for: Brand, Model, Sub Model, MFG Year, Insurance Validity
 */
export const ConditionalVehicleSection = ({
  leadId,
  productName,
  isVisible,
}: ConditionalVehicleSectionProps) => {
  const [shouldShowVehicles, setShouldShowVehicles] = useState(false);

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

  return (
    <Container>
      <RecordDetailRelationSection
        relationName="vehicles"
        relatedObjectNameSingular="vehicle"
        relatedObjectNamePlural="vehicles"
      />
    </Container>
  );
};
